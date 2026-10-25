import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ExternalLink, 
  FileText, 
  Loader2, 
  User, 
  Briefcase, 
  Phone, 
  Mail, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { JobApplication } from '../../types/job';

interface ResumeViewerModalProps {
  application: JobApplication | null;
  onClose: () => void;
}

export const ResumeViewerModal: React.FC<ResumeViewerModalProps> = ({ application, onClose }) => {
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Helper to convert data URL to Blob
  const dataUrlToBlob = (dataUrl: string, defaultMime = 'application/pdf'): Blob => {
    try {
      if (dataUrl.includes(',')) {
        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : defaultMime;
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: mime });
      } else {
        const bstr = atob(dataUrl);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], { type: defaultMime });
      }
    } catch (e) {
      console.error('Failed to convert base64 to blob:', e);
      return new Blob([dataUrl], { type: defaultMime });
    }
  };

  useEffect(() => {
    if (!application) return;

    let active = true;
    let createdUrl: string | null = null;

    const prepareResume = async () => {
      setLoading(true);
      setError(null);

      try {
        const fileType = application.resumeFileType || 'application/pdf';

        // 1. If stored in chunks
        if (application.resumeStorageType === 'chunks' || application.resumeUrl === 'firestore_chunks') {
          const chunksRef = collection(db, 'applications', application.id, 'resume_chunks');
          const snap = await getDocs(chunksRef);

          if (snap.empty) {
            throw new Error(language === 'ar' ? 'تعذر العثور على أجزاء ملف السيرة الذاتية.' : 'Resume file chunks not found.');
          }

          const chunkList: { index: number; data: string }[] = [];
          snap.forEach(d => {
            const dt = d.data();
            chunkList.push({ index: dt.index ?? 0, data: dt.data || '' });
          });

          chunkList.sort((a, b) => a.index - b.index);
          const combinedDataUrl = chunkList.map(c => c.data).join('');

          const blob = dataUrlToBlob(combinedDataUrl, fileType);
          createdUrl = URL.createObjectURL(blob);
          if (active) setBlobUrl(createdUrl);
          return;
        }

        // 2. If stored directly as Data URL
        if (application.resumeUrl.startsWith('data:')) {
          const blob = dataUrlToBlob(application.resumeUrl, fileType);
          createdUrl = URL.createObjectURL(blob);
          if (active) setBlobUrl(createdUrl);
          return;
        }

        // 3. If standard HTTP/HTTPS URL
        if (application.resumeUrl.startsWith('http://') || application.resumeUrl.startsWith('https://')) {
          if (active) setBlobUrl(application.resumeUrl);
          return;
        }

        // Fallback
        if (active) setBlobUrl(application.resumeUrl);
      } catch (err: any) {
        console.error('Error preparing resume for viewer:', err);
        if (active) {
          setError(err?.message || (language === 'ar' ? 'تعذر تجهيز السيرة الذاتية للعرض.' : 'Failed to load resume.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    prepareResume();

    return () => {
      active = false;
      if (createdUrl) {
        URL.revokeObjectURL(createdUrl);
      }
    };
  }, [application, language]);

  if (!application) return null;

  const fileName = application.resumeFileName || `CV_${application.applicantName.replace(/\s+/g, '_')}.pdf`;
  const isImage = application.resumeFileType?.startsWith('image/') || /\.(png|jpe?g|webp|gif)$/i.test(fileName);
  const isDoc = /\.(docx?|rtf)$/i.test(fileName) || application.resumeFileType?.includes('word');
  const isPdf = application.resumeFileType === 'application/pdf' || /\.pdf$/i.test(fileName);

  const handleDownload = () => {
    if (!blobUrl) return;
    setIsDownloading(true);

    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Download failed:', e);
    } finally {
      setTimeout(() => setIsDownloading(false), 800);
    }
  };

  return (
    <div className="fixed inset-0 z-70 overflow-y-auto bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-3 max-h-[96vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  {language === 'ar' ? 'معاينة السيرة الذاتية (CV)' : 'Resume Preview'}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30">
                  {application.applicantName}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {application.jobTitleAr || application.jobTitleEn} • {fileName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 ms-auto">
            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={loading || !blobUrl || isDownloading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00A896] hover:bg-[#009688] disabled:bg-slate-700 text-white text-xs font-bold transition shadow-sm cursor-pointer"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{language === 'ar' ? 'تحميل السيرة الذاتية' : 'Download CV'}</span>
            </button>

            {/* Open in new tab if available */}
            {blobUrl && (
              <a
                href={blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition"
                title={language === 'ar' ? 'فتح في نافذة جديدة' : 'Open in new tab'}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'نافذة منفصلة' : 'New Tab'}</span>
              </a>
            )}

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Candidate Info Ribbon */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="flex items-center gap-1.5 font-bold text-slate-800">
              <User className="w-3.5 h-3.5 text-teal-600" />
              <span>{application.applicantName}</span>
            </span>

            {application.applicantPhone && (
              <a 
                href={`tel:${application.applicantPhone}`}
                className="flex items-center gap-1 hover:text-teal-700 font-mono"
              >
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.applicantPhone}</span>
              </a>
            )}

            {application.applicantEmail && (
              <a 
                href={`mailto:${application.applicantEmail}`}
                className="flex items-center gap-1 hover:text-teal-700"
              >
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{application.applicantEmail}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(application.createdAt).toLocaleDateString('ar-QA')}</span>
          </div>
        </div>

        {/* Main Viewer Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-100 flex items-center justify-center min-h-[500px]">
          {loading ? (
            <div className="text-center space-y-3 p-8">
              <Loader2 className="w-10 h-10 text-teal-600 animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-700">
                {language === 'ar' ? 'جارٍ تحميل وتجهيز السيرة الذاتية للعرض المباشر...' : 'Loading resume for preview...'}
              </p>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'يتم تجميع وفك تشفير ملف السيرة الذاتية' : 'Assembling file securely'}
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center max-w-md bg-white rounded-3xl border border-rose-200 shadow-sm space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="font-bold text-slate-900 text-sm">{language === 'ar' ? 'تعذر فتح الملف داخل المتصفح' : 'Could not display file'}</h4>
              <p className="text-xs text-slate-600">{error}</p>
            </div>
          ) : isPdf && blobUrl ? (
            <div className="w-full h-[76vh] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <iframe
                src={`${blobUrl}#toolbar=1&navpanes=0`}
                className="w-full h-full border-0"
                title="Resume PDF Viewer"
              />
            </div>
          ) : isImage && blobUrl ? (
            <div className="w-full h-[76vh] flex items-center justify-center p-2 bg-slate-900/90 rounded-2xl overflow-auto shadow-inner">
              <img
                src={blobUrl}
                alt={fileName}
                className="max-w-full max-h-[72vh] object-contain rounded-lg shadow-2xl"
              />
            </div>
          ) : isDoc && blobUrl ? (
            /* Word Document: browser cannot render DOCX natively without third-party services */
            <div className="p-8 text-center max-w-md bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 border border-blue-200 mx-auto flex items-center justify-center shadow-inner">
                <FileText className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-base text-slate-900">{fileName}</h4>
                <p className="text-xs text-slate-500 font-medium">
                  {language === 'ar' 
                    ? 'ملف مستند Word (DOCX). يمكنك تحميله بنقرة واحدة لفتحه في Microsoft Word أو Google Docs.' 
                    : 'Microsoft Word document. Download to open in Word or Google Docs.'}
                </p>
              </div>

              {application.coverNote && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-start text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-1">
                    {language === 'ar' ? 'رسالة المتقدم:' : 'Applicant Note:'}
                  </span>
                  {application.coverNote}
                </div>
              )}

              <button
                onClick={handleDownload}
                className="w-full py-3 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{language === 'ar' ? 'تحميل مستند السيرة الذاتية' : 'Download Word Document'}</span>
              </button>
            </div>
          ) : blobUrl ? (
            <div className="w-full h-[76vh] bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <iframe
                src={blobUrl}
                className="w-full h-full border-0"
                title="Resume Viewer"
              />
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {language === 'ar' ? 'معاينة مشفرة وآمنة ضمن منصة وظائف الخليج' : 'Secured in-app preview on Gulf Jobs'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
