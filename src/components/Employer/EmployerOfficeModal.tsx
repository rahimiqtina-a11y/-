import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Users, 
  FileText, 
  Download, 
  ExternalLink, 
  Phone, 
  Mail, 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Search, 
  Filter, 
  Building2, 
  ShieldCheck, 
  Eye, 
  ChevronDown, 
  Plus, 
  Sparkles,
  Calendar,
  Check,
  UserCheck,
  Loader2,
  Trash2
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobAdvertisement, JobApplication, ApplicationStatus } from '../../types/job';
import { ResumeViewerModal } from '../Applications/ResumeViewerModal';

interface EmployerOfficeModalProps {
  onClose: () => void;
  onOpenJobForm?: () => void;
  allJobs?: JobAdvertisement[];
}

export const EmployerOfficeModal: React.FC<EmployerOfficeModalProps> = ({ 
  onClose, 
  onOpenJobForm,
  allJobs = []
}) => {
  const { language, t } = useLanguage();
  const { user, userProfile, isAdmin, loginWithGoogle } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [showPublishBlockedModal, setShowPublishBlockedModal] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Check employer publishing permissions set by Admin
  const isPublishingAllowed = Boolean(
    isAdmin || (
      userProfile?.role === 'employer' &&
      userProfile?.canPublishJobs &&
      (!userProfile.publishingAccessExpiresAt || new Date(userProfile.publishingAccessExpiresAt).getTime() > Date.now())
    )
  );

  const isPublishingExpired = Boolean(
    !isAdmin &&
    userProfile?.canPublishJobs && 
    userProfile.publishingAccessExpiresAt && 
    new Date(userProfile.publishingAccessExpiresAt).getTime() <= Date.now()
  );

  const isPendingApproval = Boolean(!isAdmin && (!userProfile?.canPublishJobs || !userProfile?.isEmployerApproved));

  // Filter user's posted jobs
  const myJobs = isAdmin 
    ? allJobs 
    : allJobs.filter(j => 
        j.createdBy === user?.uid || 
        (userProfile?.companyName && (j.companyNameAr === userProfile.companyName || j.companyNameEn === userProfile.companyName))
      );

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    // Listen to applications collection (rules allow isSignedIn)
    const q = collection(db, 'applications');

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: JobApplication[] = [];
      snapshot.forEach(docSnap => {
        items.push({ id: docSnap.id, ...docSnap.data() } as JobApplication);
      });

      // Show all for admin, or filter by employer ownership / company / job
      const relevantItems = (isAdmin 
        ? items 
        : items.filter(app => 
            app.employerId === user.uid ||
            myJobs.some(j => j.id === app.jobId) ||
            (userProfile?.companyName && (app.companyNameAr === userProfile.companyName || app.companyNameEn === userProfile.companyName))
          )
      ).filter(app => !app.deletedByEmployer);

      // Sort newest first
      relevantItems.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(relevantItems);
      setLoading(false);
    }, (error) => {
      console.warn('Could not listen to applications:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'applications');
      } catch (e) {
        // Fallback for initial load
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isAdmin, myJobs, userProfile?.companyName]);

  const handleStatusChange = async (appId: string, newStatus: ApplicationStatus) => {
    setUpdatingId(appId);
    try {
      const appRef = doc(db, 'applications', appId);
      await updateDoc(appRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error updating status:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `applications/${appId}`);
      } catch (e) {}
    } finally {
      setUpdatingId(null);
    }
  };

  const [applicationToDelete, setApplicationToDelete] = useState<JobApplication | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewApplication, setPreviewApplication] = useState<JobApplication | null>(null);

  const confirmDeleteApplication = async () => {
    if (!applicationToDelete) return;
    setIsDeleting(true);
    const appId = applicationToDelete.id;

    try {
      // If applicant already removed it from their history, remove permanently from database
      if (applicationToDelete.deletedByApplicant) {
        if (applicationToDelete.resumeStorageType === 'chunks') {
          const chunksRef = collection(db, 'applications', appId, 'resume_chunks');
          const chunkDocs = await getDocs(chunksRef);
          await Promise.all(chunkDocs.docs.map(d => deleteDoc(d.ref)));
        }
        await deleteDoc(doc(db, 'applications', appId));
      } else {
        // Soft delete from employer desk: preserves record in candidate's history with rejected status
        await updateDoc(doc(db, 'applications', appId), {
          deletedByEmployer: true,
          status: 'rejected',
          updatedAt: new Date().toISOString()
        });
      }
      setApplicationToDelete(null);
    } catch (err) {
      console.error('Error deleting application:', err);
      try {
        handleFirestoreError(err, OperationType.DELETE, `applications/${appId}`);
      } catch (e) {}
    } finally {
      setIsDeleting(false);
    }
  };

  const [downloadingResumeId, setDownloadingResumeId] = useState<string | null>(null);

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

  const handleDownloadResume = async (app: JobApplication) => {
    if (!app.resumeUrl && app.resumeStorageType !== 'chunks') return;

    setDownloadingResumeId(app.id);

    try {
      // 1. If stored in Firestore chunks subcollection
      if (app.resumeStorageType === 'chunks' || app.resumeUrl === 'firestore_chunks') {
        const chunksRef = collection(db, 'applications', app.id, 'resume_chunks');
        const snap = await getDocs(chunksRef);

        if (snap.empty) {
          throw new Error(language === 'ar' ? 'تعذر العثور على أجزاء ملف السيرة الذاتية.' : 'Resume file chunks could not be found.');
        }

        const chunkList: { index: number; data: string }[] = [];
        snap.forEach(d => {
          const dt = d.data();
          chunkList.push({ index: dt.index ?? 0, data: dt.data || '' });
        });

        chunkList.sort((a, b) => a.index - b.index);
        const combinedDataUrl = chunkList.map(c => c.data).join('');

        const blob = dataUrlToBlob(combinedDataUrl, app.resumeFileType || 'application/pdf');
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        const cleanName = (app.resumeFileName || `CV_${app.applicantName || 'Applicant'}.pdf`).replace(/[/\\?%*:|"<>]/g, '_');
        link.download = cleanName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        return;
      }

      // 2. If stored directly as Data URL
      if (app.resumeUrl.startsWith('data:')) {
        const blob = dataUrlToBlob(app.resumeUrl, app.resumeFileType || 'application/pdf');
        const blobUrl = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        const cleanName = (app.resumeFileName || `CV_${app.applicantName || 'Applicant'}.pdf`).replace(/[/\\?%*:|"<>]/g, '_');
        link.download = cleanName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(blobUrl), 15000);
        return;
      }

      // 3. If standard HTTP/HTTPS Storage URL
      if (app.resumeUrl.startsWith('http://') || app.resumeUrl.startsWith('https://')) {
        window.open(app.resumeUrl, '_blank');
        return;
      }

      // Fallback
      window.open(app.resumeUrl, '_blank');
    } catch (err: any) {
      console.error('Error downloading resume:', err);
      setDownloadError(err?.message || (language === 'ar' ? 'تعذر فتح ملف السيرة الذاتية.' : 'Failed to download resume file.'));
    } finally {
      setDownloadingResumeId(null);
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    if (selectedJobId !== 'all' && app.jobId !== selectedJobId) return false;
    if (selectedStatus !== 'all' && app.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = app.applicantName?.toLowerCase().includes(q);
      const matchEmail = app.applicantEmail?.toLowerCase().includes(q);
      const matchPhone = app.applicantPhone?.includes(q);
      const matchJob = app.jobTitleAr?.toLowerCase().includes(q) || app.jobTitleEn?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchJob) return false;
    }
    return true;
  });

  // Counters
  const totalCount = applications.length;
  const newCount = applications.filter(a => a.status === 'new').length;
  const reviewingCount = applications.filter(a => a.status === 'reviewing').length;
  const shortlistedCount = applications.filter(a => a.status === 'shortlisted').length;
  const acceptedCount = applications.filter(a => a.status === 'accepted').length;

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'new':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600 animate-pulse" />
            {language === 'ar' ? 'طلب جديد' : 'New'}
          </span>
        );
      case 'reviewing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3" />
            {language === 'ar' ? 'قيد المراجعة' : 'Under Review'}
          </span>
        );
      case 'shortlisted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <UserCheck className="w-3 h-3" />
            {language === 'ar' ? 'مرشح للمقابلة' : 'Shortlisted'}
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            {language === 'ar' ? 'تم القبول' : 'Accepted'}
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3" />
            {language === 'ar' ? 'مرفوض' : 'Rejected'}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#00A896]/20 border border-[#00A896]/40 flex items-center justify-center text-[#00A896] shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  {language === 'ar' ? 'مكتب صاحب العمل والتوظيف' : 'Employer Office & Recruitment Desk'}
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold border border-teal-400/30">
                  {isAdmin ? (language === 'ar' ? 'لوحة الإشراف الكامل' : 'Super Admin') : (userProfile?.companyName || userProfile?.displayName || 'مكتبك')}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {language === 'ar' 
                  ? 'مكتب إدارة المتقدمين ومراجعة السير الذاتية للفرص الوظيفية المنشورة' 
                  : 'Manage candidates and review CVs for your posted job vacancies'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenJobForm && (
              <button
                onClick={() => {
                  if (isPublishingAllowed) {
                    onClose();
                    onOpenJobForm();
                  } else {
                    setShowPublishBlockedModal(true);
                  }
                }}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer ${
                  isPublishingAllowed
                    ? 'bg-[#00A896] hover:bg-[#009688] text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>
                  {language === 'ar' 
                    ? (isPublishingAllowed ? 'نشر فرصة عمل جديدة' : 'طلب تفعيل النشر +')
                    : (isPublishingAllowed ? 'Post New Job' : 'Request Publishing Access +')}
                </span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Publishing Status Banner */}
        {user && (
          <div>
            {isPublishingAllowed ? (
              <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-950 font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? `صلاحية نشر الوظائف مفعّلة لحسابك ${userProfile?.publishingAccessExpiresAt ? `(صالحة حتى ${new Date(userProfile.publishingAccessExpiresAt).toLocaleDateString('ar-EG')})` : '(صلاحية غير محدودة)'}`
                      : `Publishing rights active ${userProfile?.publishingAccessExpiresAt ? `(Valid until ${new Date(userProfile.publishingAccessExpiresAt).toLocaleDateString()})` : '(Unlimited)'}`}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black">
                  {language === 'ar' ? 'مصرّح بالنشر' : 'Verified'}
                </span>
              </div>
            ) : isPublishingExpired ? (
              <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-950 font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>
                    {language === 'ar'
                      ? 'انتهت فترة صلاحية نشر الوظائف المحددة لحسابك. تواصل مع إدارة المنصة لتجديد الصلاحية.'
                      : 'Your job publishing validity period has expired. Please contact admin for renewal.'}
                  </span>
                </div>
                <button
                  onClick={() => setShowPublishBlockedModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition"
                >
                  {language === 'ar' ? 'طلب التجديد' : 'Request Renewal'}
                </button>
              </div>
            ) : (
              <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-950 font-bold shrink-0">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                  <span>
                    {language === 'ar'
                      ? 'حساب صاحب العمل قيد المراجعة: النشر مقيد حتى يوافق مدير المنصة على تفعيل حسابك وتحديد مدة النشر.'
                      : 'Employer verification pending: Publishing is restricted until platform admin activates your account.'}
                  </span>
                </div>
                <button
                  onClick={() => setShowPublishBlockedModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] hover:bg-amber-400 transition"
                >
                  {language === 'ar' ? 'تفاصيل التفعيل' : 'Details'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Privacy Shield Banner */}
        <div className="bg-teal-50/80 border-b border-teal-100 px-6 py-2.5 flex items-center gap-2.5 text-xs text-teal-900 font-bold shrink-0">
          <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
          <span>
            {language === 'ar'
              ? 'حماية خصوصية جهة العمل: أرقام التواصل المباشرة الخاصة بك محمية ولا تظهر للعامة. تتلقى جميع طلبات السير الذاتية هنا بمكتبك وتتواصل مع المرشحين متى شئت.'
              : 'Employer privacy protected: Direct contact numbers are private and hidden from public view. Applications and CVs arrive directly in your desk.'}
          </span>
        </div>

        {/* Download Error Banner */}
        {downloadError && (
          <div className="bg-rose-50 border-b border-rose-200 px-6 py-2.5 flex items-center justify-between text-xs text-rose-900 font-bold shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{downloadError}</span>
            </div>
            <button
              onClick={() => setDownloadError(null)}
              className="text-xs text-rose-700 hover:text-rose-900 underline font-extrabold cursor-pointer"
            >
              {language === 'ar' ? 'إغلاق' : 'Dismiss'}
            </button>
          </div>
        )}

        {/* Main Content */}
        {!user ? (
          <div className="py-16 text-center space-y-4 p-8">
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-sm">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">
                {language === 'ar' ? 'مكتب صاحب العمل محمي ومخصص للمستخدمين المسجلين' : 'Employer Office is Protected'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                {language === 'ar' 
                  ? 'يرجى تسجيل الدخول بحسابك في المنصة للوصول إلى طلبات التوظيف ومراجعة السير الذاتية.'
                  : 'Please sign in to access candidate resumes and applications.'}
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                  } catch (e) {}
                }}
                className="px-6 py-3 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-md shadow-teal-500/20 transition cursor-pointer"
              >
                {language === 'ar' ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
            
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-400 block mb-0.5">
                {language === 'ar' ? 'إجمالي المتقدمين' : 'Total Applicants'}
              </span>
              <span className="text-xl font-black text-slate-900 font-mono">
                {totalCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-center">
              <span className="text-[10px] font-bold text-teal-700 block mb-0.5">
                {language === 'ar' ? 'طلبات جديدة' : 'New Applications'}
              </span>
              <span className="text-xl font-black text-teal-900 font-mono">
                {newCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
              <span className="text-[10px] font-bold text-amber-700 block mb-0.5">
                {language === 'ar' ? 'قيد المراجعة' : 'Under Review'}
              </span>
              <span className="text-xl font-black text-amber-900 font-mono">
                {reviewingCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
              <span className="text-[10px] font-bold text-blue-700 block mb-0.5">
                {language === 'ar' ? 'مرشح للمقابلة' : 'Shortlisted'}
              </span>
              <span className="text-xl font-black text-blue-900 font-mono">
                {shortlistedCount}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-bold text-emerald-700 block mb-0.5">
                {language === 'ar' ? 'تم القبول' : 'Accepted'}
              </span>
              <span className="text-xl font-black text-emerald-900 font-mono">
                {acceptedCount}
              </span>
            </div>
          </div>

          {/* Filters & Search Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute top-3 start-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'ar' ? 'بحث بالاسم، البريد الإلكتروني، أو المسمى الوظيفي...' : 'Search by name, email, or job...'}
                className="w-full ps-9 pe-3 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:border-teal-500 focus:outline-none"
              />
            </div>

            {/* Filter by Job */}
            {myJobs.length > 0 && (
              <div className="min-w-[180px]">
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
                >
                  <option value="all">{language === 'ar' ? 'جميع الوظائف المعروضة' : 'All Posted Jobs'}</option>
                  {myJobs.map(job => (
                    <option key={job.id} value={job.id}>
                      {job.titleAr || job.titleEn}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Filter by Status */}
            <div className="min-w-[140px]">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full py-2 px-3 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:border-teal-500 focus:outline-none"
              >
                <option value="all">{language === 'ar' ? 'كافة الحالات' : 'All Statuses'}</option>
                <option value="new">{language === 'ar' ? 'جديد فقط' : 'New Only'}</option>
                <option value="reviewing">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</option>
                <option value="shortlisted">{language === 'ar' ? 'مرشح للمقابلة' : 'Shortlisted'}</option>
                <option value="accepted">{language === 'ar' ? 'مقبول' : 'Accepted'}</option>
                <option value="rejected">{language === 'ar' ? 'مرفوض' : 'Rejected'}</option>
              </select>
            </div>
          </div>

          {/* Applications List */}
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-bold text-sm">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2 text-teal-600" />
              <span>{language === 'ar' ? 'جارٍ تحميل طلبات التوظيف والسير الذاتية...' : 'Loading applications & CVs...'}</span>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-slate-50/60 rounded-3xl border border-dashed border-slate-200 p-6">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-800">
                {language === 'ar' ? 'لا توجد طلبات توظيف حتى الآن' : 'No applications received yet'}
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {language === 'ar'
                  ? 'عندما يتقدم الباحثون عن عمل على الوظائف المنشورة ويرفعون سيرتهم الذاتية، ستظهر ملفاتهم هنا مباشرة مع إمكانية تحميل الـ CV والتواصل معهم.'
                  : 'When candidates apply to your posted jobs and upload their resumes, their profiles will appear here for review and direct contact.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map(app => (
                <div 
                  key={app.id}
                  className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-teal-300 hover:shadow-md transition-all space-y-4"
                >
                  {/* Top line: Name, Job Title, Status, and Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-800 font-black text-base shrink-0">
                        {app.applicantName?.charAt(0) || 'م'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-base font-extrabold text-slate-900">
                            {app.applicantName}
                          </h4>
                          {getStatusBadge(app.status)}
                        </div>

                        <p className="text-xs font-semibold text-teal-700 flex items-center gap-1.5 mt-0.5">
                          <Briefcase className="w-3.5 h-3.5" />
                          <span>{app.jobTitleAr || app.jobTitleEn}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-center text-xs text-slate-400 font-mono">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(app.createdAt).toLocaleDateString('ar-QA')}</span>
                    </div>
                  </div>

                  {/* Cover Note or Pitch if provided */}
                  {app.coverNote && (
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                      <span className="font-bold text-slate-900 block mb-1">
                        {language === 'ar' ? 'رسالة المتقدم:' : 'Applicant Note:'}
                      </span>
                      {app.coverNote}
                    </div>
                  )}

                  {/* Experience & Contact Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100">
                    
                    {/* Candidate Direct Contact info */}
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                      {app.experienceYears && (
                        <span className="px-2.5 py-1 rounded-xl bg-slate-100 font-bold text-slate-800">
                          {app.experienceYears}
                        </span>
                      )}
                      
                      {app.applicantPhone && (
                        <a 
                          href={`tel:${app.applicantPhone}`}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700 font-mono"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.applicantPhone}</span>
                        </a>
                      )}

                      {app.applicantEmail && (
                        <a 
                          href={`mailto:${app.applicantEmail}?subject=${encodeURIComponent(`Gulf Jobs: بخصوص تقديمك على وظيفة ${app.jobTitleAr || app.jobTitleEn}`)}`}
                          className="flex items-center gap-1.5 text-slate-700 hover:text-teal-700"
                        >
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <span>{app.applicantEmail}</span>
                        </a>
                      )}
                    </div>

                    {/* Resume / CV Actions: View directly in system + Optional Download */}
                    <div className="flex items-center gap-2">
                      {(app.resumeUrl || app.resumeStorageType === 'chunks') && (
                        <div className="flex items-center gap-1.5">
                          {/* 1. In-System Preview */}
                          <button
                            type="button"
                            onClick={() => setPreviewApplication(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition-all cursor-pointer"
                            title={language === 'ar' ? 'عرض السيرة الذاتية داخل السيستم دون تحميل' : 'Preview CV in System'}
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'ar' ? 'عرض السيرة الذاتية' : 'View CV'}</span>
                          </button>

                          {/* 2. Direct Download Button */}
                          <button
                            type="button"
                            onClick={() => handleDownloadResume(app)}
                            disabled={downloadingResumeId === app.id}
                            className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 text-xs font-bold transition-all cursor-pointer"
                            title={language === 'ar' ? 'تحميل السيرة الذاتية على جهازك' : 'Download CV'}
                          >
                            {downloadingResumeId === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Download className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      )}

                      {/* WhatsApp Applicant */}
                      {app.applicantPhone && (
                        <a
                          href={`https://wa.me/${app.applicantPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            language === 'ar'
                              ? `مرحباً ${app.applicantName}، تواصلنا معك بخصوص تقديمك على وظيفة: "${app.jobTitleAr || app.jobTitleEn}" عبر منصة وظائف الخليج.`
                              : `Hello ${app.applicantName}, contacting you regarding your application for: "${app.jobTitleAr || app.jobTitleEn}" via Gulf Jobs.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors"
                          title="WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {/* Status Update Selector */}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value as ApplicationStatus)}
                        disabled={updatingId === app.id}
                        className="py-1.5 px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white hover:border-teal-400 focus:outline-none"
                      >
                        <option value="new">{language === 'ar' ? 'جديد' : 'New'}</option>
                        <option value="reviewing">{language === 'ar' ? 'قيد المراجعة' : 'Under Review'}</option>
                        <option value="shortlisted">{language === 'ar' ? 'مرشح للمقابلة' : 'Shortlist'}</option>
                        <option value="accepted">{language === 'ar' ? 'مقبول' : 'Accept'}</option>
                        <option value="rejected">{language === 'ar' ? 'مرفوض' : 'Reject'}</option>
                      </select>

                      {/* Delete with in-app confirmation */}
                      <button
                        type="button"
                        onClick={() => setApplicationToDelete(app)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                        title={language === 'ar' ? 'حذف من المكتب' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {language === 'ar' ? `المعروض: ${filteredApplications.length} من إجمالي ${applications.length} متقدم` : `Showing: ${filteredApplications.length} of ${applications.length} applicants`}
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold transition-colors cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>

      {/* Activation Explanation Modal */}
      {showPublishBlockedModal && (
        <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
              <Clock className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                {isPublishingExpired
                  ? (language === 'ar' ? 'انتهت فترة صلاحية النشر لحسابك' : 'Publishing Validity Expired')
                  : (language === 'ar' ? 'صلاحية النشر بانتظار موافقة مدير المنصة' : 'Publishing Awaiting Admin Approval')}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isPublishingExpired
                  ? (language === 'ar'
                    ? 'لقد انتهت المدة المحددة لحسابك لنشر فرص العمل. يرجى التواصل مع إدارة منصة وظائف الخليج لتجديد الصلاحية لفترة جديدة (أسبوع، شهر، سنة).'
                    : 'Your active publishing timeframe has concluded. Please contact the platform admin to renew your validity period.')
                  : (language === 'ar'
                    ? 'وفق نظام الأمان في منصة وظائف الخليج: بعد تسجيل حساب صاحب العمل، يقوم مدير المنصة بمراجعة الحساب ومنحه ترخيص النشر وتحديد مدته الزمنية. يظهر حسابك الآن لدى المدير لتفعيله قريباً.'
                    : 'As per platform policies, new employers require admin approval before posting vacancies. Your account is queued for activation.')}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-bold block text-slate-900">
                {language === 'ar' ? 'حسابك الحالي:' : 'Your Account:'}
              </span>
              <div className="text-[11px] font-mono text-slate-600">
                {userProfile?.companyName || userProfile?.displayName} • {userProfile?.email}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setShowPublishBlockedModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
              >
                {language === 'ar' ? 'حسناً، فهمت' : 'Understood'}
              </button>

              <button
                onClick={() => {
                  setShowPublishBlockedModal(false);
                  onClose();
                  // Trigger employer inquiry modal or contact
                  const mailto = `mailto:admin@gulfjobs-platform.com?subject=${encodeURIComponent('طلب تفعيل صلاحية نشر وظائف - ' + (userProfile?.companyName || userProfile?.displayName))}`;
                  window.location.href = mailto;
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs transition shadow-sm cursor-pointer"
              >
                {language === 'ar' ? 'مراسلة الإدارة' : 'Contact Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Resume / CV Viewer Modal */}
      {previewApplication && (
        <ResumeViewerModal
          application={previewApplication}
          onClose={() => setPreviewApplication(null)}
        />
      )}

      {/* In-App Delete Confirmation Modal (Avoids iframe window.confirm block) */}
      {applicationToDelete && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-base font-black text-slate-900">
                {language === 'ar' ? 'تأكيد حذف طلب التوظيف' : 'Confirm Delete Application'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف طلب المتقدم (${applicationToDelete.applicantName}) نهائياً من مكتب التوظيف؟ سيتم إزالة ملف السيرة الذاتية وكافة البيانات المرتبطة.`
                  : `Are you sure you want to permanently delete the application of ${applicationToDelete.applicantName}?`}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
              <span className="font-extrabold text-slate-900 block">
                {applicationToDelete.jobTitleAr || applicationToDelete.jobTitleEn}
              </span>
              <div className="text-slate-500 font-mono text-[11px] truncate">
                {applicationToDelete.applicantEmail} • {applicationToDelete.applicantPhone}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplicationToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="button"
                onClick={confirmDeleteApplication}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-extrabold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                <span>{language === 'ar' ? 'تأكيد الحذف نهائياً' : 'Yes, Delete'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
