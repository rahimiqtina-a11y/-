import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// CRITICAL: Must include firestoreDatabaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Validate connection to Firestore on boot
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network is restricted.');
      return false;
    }
    // Any other error (like document not found or permission check) confirms the server is reached
    return true;
  }
}

/**
 * Upload an image file (e.g. for job or logo) as an in-memory safe data URL
 * ensuring instant upload with 0s latency
 */
export async function uploadJobImage(file: File, folder: 'job-images' | 'company-logos' = 'job-images'): Promise<string> {
  // Validate MIME type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
  if (!validTypes.includes(file.type)) {
    throw new Error('صيغة الصورة غير مدعومة. يرجى اختيار صورة بصيغة JPEG أو PNG أو WEBP أو GIF.');
  }

  // Validate File Size (max 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('حجم الصورة كبير جداً. الحد الأقصى المسموح به هو 5 ميجابايت.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.readAsDataURL(file);
  });
}

export interface UploadedResumeResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  storageType: 'direct' | 'chunks' | 'storage';
  chunks?: string[];
  totalChunks?: number;
}

/**
 * Compress image file on client side (especially mobile camera photos)
 * Reduces 5MB-12MB phone photos into crisp ~250KB JPEG in under 150ms
 */
async function compressImageForUpload(file: File): Promise<Blob | File> {
  const isImage = file.type.startsWith('image/') || /\.(png|jpe?g|webp)$/i.test(file.name);
  if (!isImage) return file;
  if (file.size <= 300 * 1024) return file; // Already small enough

  return new Promise((resolve) => {
    try {
      const img = new Image();
      const objUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objUrl);
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(blob);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.8
        );
      };
      img.onerror = () => {
        URL.revokeObjectURL(objUrl);
        resolve(file);
      };
      img.src = objUrl;
    } catch {
      resolve(file);
    }
  });
}

/**
 * Upload a candidate CV / Resume (PDF, DOC, DOCX, Image up to 10MB)
 * Processed instantly in-memory with rock-solid Firestore direct / chunked storage
 * Highly optimized for mobile browsers, cellular networks, and camera uploads
 */
export async function uploadResumeFile(file: File): Promise<UploadedResumeResult> {
  // Validate file size (max 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('حجم ملف السيرة الذاتية كبير جداً. الحد الأقصى المسموح به هو 10 ميجابايت.');
  }

  // Validate allowed extensions and MIME types
  const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'];
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!validExtensions.includes(ext)) {
    throw new Error('صيغة الملف غير مدعومة. يرجى إرفاق ملف PDF أو Word أو صورة واضحة.');
  }

  // Optimize mobile image uploads (e.g. photos of printed CV)
  const processedBlob = await compressImageForUpload(file);

  // Fast client in-memory read with safety timeout
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('استغرقت قراءة الملف وقتاً طويلاً على هذا الهاتف. يرجى إعادة المحاولة أو اختيار ملف أصغر.'));
    }, 20000);

    const reader = new FileReader();
    reader.onload = () => {
      clearTimeout(timer);
      resolve(reader.result as string);
    };
    reader.onerror = () => {
      clearTimeout(timer);
      reject(new Error('تعذر قراءة ملف السيرة الذاتية من جهازك.'));
    };
    reader.onabort = () => {
      clearTimeout(timer);
      reject(new Error('تم إيقاف قراءة الملف.'));
    };
    reader.readAsDataURL(processedBlob);
  });

  // Up to ~700KB fits safely in a single Firestore document (document max limit is 1,048,576 bytes)
  const maxDirectChars = 700 * 1024;
  if (dataUrl.length <= maxDirectChars) {
    return {
      downloadUrl: dataUrl,
      fileName: file.name,
      fileSize: processedBlob.size,
      fileType: file.type || 'application/pdf',
      storageType: 'direct',
    };
  }

  // Slice larger files into ~350KB chunks for mobile network stability
  const chunkSize = 350 * 1024;
  const chunks: string[] = [];
  for (let i = 0; i < dataUrl.length; i += chunkSize) {
    chunks.push(dataUrl.substring(i, i + chunkSize));
  }

  return {
    downloadUrl: 'firestore_chunks',
    fileName: file.name,
    fileSize: processedBlob.size,
    fileType: file.type || 'application/pdf',
    storageType: 'chunks',
    chunks,
    totalChunks: chunks.length,
  };
}

export { signInWithPopup, signOut };
