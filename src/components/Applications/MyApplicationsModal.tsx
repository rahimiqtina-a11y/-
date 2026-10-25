import React, { useState, useEffect } from 'react';
import { 
  X, 
  Briefcase, 
  Building2, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  Eye, 
  Calendar, 
  Sparkles, 
  UserCheck,
  Search,
  Trash2,
  AlertTriangle,
  Loader2,
  Hourglass
} from 'lucide-react';
import { collection, query, where, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobApplication, ApplicationStatus } from '../../types/job';
import { ResumeViewerModal } from './ResumeViewerModal';

interface MyApplicationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrowseJobs?: () => void;
}

// Retention policy: Records expire and auto-delete after 2 months (60 days)
const TWO_MONTHS_MS = 60 * 24 * 60 * 60 * 1000;

export const MyApplicationsModal: React.FC<MyApplicationsModalProps> = ({
  isOpen,
  onClose,
  onBrowseJobs
}) => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewingApp, setViewingApp] = useState<JobApplication | null>(null);

  // Applicant manual deletion state
  const [appToDelete, setAppToDelete] = useState<JobApplication | null>(null);
  const [isDeletingApp, setIsDeletingApp] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Listen to candidate's own applications in Firestore
    const appsCol = collection(db, 'applications');
    const q = query(appsCol, where('applicantUid', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: JobApplication[] = [];
      const now = Date.now();

      snapshot.forEach(docSnap => {
        const data = { id: docSnap.id, ...docSnap.data() } as JobApplication;
        
        // 1. Skip if manually deleted by the applicant from their own history
        if (data.deletedByApplicant) return;

        // 2. Auto-deletion after 2 months (60 days)
        const createdMs = new Date(data.createdAt || 0).getTime();
        if (createdMs > 0 && now - createdMs > TWO_MONTHS_MS) {
          return;
        }

        items.push(data);
      });

      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setApplications(items);
      setLoading(false);
    }, (error) => {
      console.warn('Could not listen to user applications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isOpen, user]);

  const confirmDeleteByApplicant = async () => {
    if (!appToDelete) return;
    setIsDeletingApp(true);
    const appId = appToDelete.id;

    try {
      // If the employer also removed it from their desk, permanently purge the document and chunks
      if (appToDelete.deletedByEmployer) {
        if (appToDelete.resumeStorageType === 'chunks') {
          const chunksRef = collection(db, 'applications', appId, 'resume_chunks');
          const chunkDocs = await getDocs(chunksRef);
          await Promise.all(chunkDocs.docs.map(d => deleteDoc(d.ref)));
        }
        await deleteDoc(doc(db, 'applications', appId));
      } else {
        // Soft delete from applicant's personal history
        await updateDoc(doc(db, 'applications', appId), {
          deletedByApplicant: true,
          updatedAt: new Date().toISOString()
        });
      }
      setAppToDelete(null);
    } catch (err) {
      console.error('Error removing application from applicant history:', err);
    } finally {
      setIsDeletingApp(false);
    }
  };

  if (!isOpen) return null;

  const getStatusDisplay = (status: ApplicationStatus) => {
    switch (status) {
      case 'new':
        return {
          title: language === 'ar' ? 'تم استلام الطلب' : 'Application Received',
          description: language === 'ar' ? 'وصلت سيرتك الذاتية إلى مكتب جهة العمل وهي بانتظار بدء المراجعة.' : 'Your CV is delivered to the employer desk and awaiting review.',
          badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
          dotClass: 'bg-teal-600',
          icon: Clock,
          stepIndex: 1
        };
      case 'reviewing':
        return {
          title: language === 'ar' ? 'طلبك قيد المراجعة والتدقيق' : 'Under Review',
          description: language === 'ar' ? 'يقوم مسؤول التوظيف حالياً بمراجعة مؤهلاتك وسيرتك الذاتية.' : 'The employer recruiter is actively evaluating your resume and qualifications.',
          badgeClass: 'bg-amber-50 text-amber-900 border-amber-200',
          dotClass: 'bg-amber-500',
          icon: Clock,
          stepIndex: 2
        };
      case 'shortlisted':
        return {
          title: language === 'ar' ? 'مبروك! تم ترشيحك للمقابلة' : 'Shortlisted for Interview',
          description: language === 'ar' ? 'تم اختيارك ضمن قائمة المرشحين المؤهلين للمقابلة الشخصية. سيتم التواصل معك قريباً.' : 'Congratulations! You have been shortlisted for an interview. The employer will reach out soon.',
          badgeClass: 'bg-blue-50 text-blue-900 border-blue-200',
          dotClass: 'bg-blue-600',
          icon: UserCheck,
          stepIndex: 3
        };
      case 'accepted':
        return {
          title: language === 'ar' ? 'تهانينا! تم قبول طلبك بنجاح' : 'Application Accepted',
          description: language === 'ar' ? 'تم قبولك مبدئياً لهذه الفرصة الوظيفية! ترقب تفاصيل العرض والتواصل الرسمي من جهة العمل.' : 'Congratulations! Your application has been accepted for this position.',
          badgeClass: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-black',
          dotClass: 'bg-emerald-600',
          icon: CheckCircle2,
          stepIndex: 4
        };
      case 'rejected':
        return {
          title: language === 'ar' ? 'لم يتم الاختيار في هذه الفرصة' : 'Application Closed',
          description: language === 'ar' ? 'نشكرك على اهتمامك ووقتك. لم يقع الاختيار على طلبك لهذه الفرصة المحددة، ونتمنى لك التوفيق في فرص قادمة.' : 'Thank you for applying. The employer proceeded with other candidates for this specific role.',
          badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
          dotClass: 'bg-rose-500',
          icon: XCircle,
          stepIndex: 0
        };
      default:
        return {
          title: language === 'ar' ? 'قيد المتابعة' : 'Pending',
          description: '',
          badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
          dotClass: 'bg-slate-400',
          icon: Clock,
          stepIndex: 1
        };
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  {language === 'ar' ? 'سجل طلبات التوظيف الخاصة بي' : 'My Job Applications History'}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-extrabold border border-teal-400/30">
                  {applications.length}
                </span>
              </div>
              <p className="text-xs text-teal-200/80 font-medium">
                {language === 'ar' 
                  ? 'متابعة حية لحالة الطلبات والقرارات، مع إمكانية حذف السجل يدوياً أو الحفظ لشهرين' 
                  : 'Live tracking of applications with manual delete and 2-month auto-retention'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Retention Policy Banner */}
        <div className="bg-teal-50/80 border-b border-teal-100 px-6 py-2.5 flex items-center justify-between text-[11px] text-teal-900 font-semibold shrink-0">
          <div className="flex items-center gap-2">
            <Hourglass className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {language === 'ar' 
                ? 'سياسة السجل: تبقى الطلبات مسجلة لمتابعتها وتُحذف تلقائياً بعد مرور شهرين (60 يوماً)، كما يمكنك حذف أي طلب بنفسك في أي وقت.' 
                : 'Retention Policy: Records are kept for 2 months (60 days) then auto-purged, or you can delete them anytime.'}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-4">
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <div className="w-10 h-10 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-slate-600">
                {language === 'ar' ? 'جارٍ تحميل طلبات التوظيف...' : 'Loading your applications...'}
              </p>
            </div>
          ) : applications.length === 0 ? (
            <div className="py-16 text-center space-y-4 px-4">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 text-teal-600 border border-teal-100 flex items-center justify-center mx-auto shadow-inner">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1.5 max-w-sm mx-auto">
                <h3 className="text-base font-extrabold text-slate-900">
                  {language === 'ar' ? 'لا توجد طلبات في سجلك حالياً' : 'No applications in your history'}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {language === 'ar'
                    ? 'قدّم على الوظائف المتاحة في دول الخليج لتظهر هنا وتتابع حالات القبول والترشيح مع أصحاب العمل مباشرة.'
                    : 'Apply to GCC jobs to track recruiter status and decisions directly here.'}
                </p>
              </div>

              {onBrowseJobs && (
                <button
                  onClick={() => {
                    onClose();
                    onBrowseJobs();
                  }}
                  className="px-6 py-2.5 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-xs shadow-md transition inline-flex items-center gap-2 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  <span>{language === 'ar' ? 'تصفح الوظائف الشاغرة' : 'Browse Vacancies'}</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map(app => {
                const statusInfo = getStatusDisplay(app.status);
                const StatusIcon = statusInfo.icon;

                // Calculate remaining days out of 60 days
                const ageMs = Date.now() - new Date(app.createdAt || 0).getTime();
                const daysRemaining = Math.max(1, Math.ceil((TWO_MONTHS_MS - ageMs) / (24 * 60 * 60 * 1000)));

                return (
                  <div
                    key={app.id}
                    className={`p-4 sm:p-5 rounded-3xl border transition-all space-y-3.5 ${
                      app.status === 'rejected'
                        ? 'border-slate-200 bg-slate-50/70 hover:border-slate-300'
                        : 'border-slate-200/90 bg-white hover:border-teal-300 shadow-xs hover:shadow-md'
                    }`}
                  >
                    {/* Top row: Job title, Company, and Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                            {language === 'ar' ? 'طلب توظيف مرسل' : 'Submitted Application'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {language === 'ar' ? `(متبقي بالسجل ${daysRemaining} يوم)` : `(${daysRemaining} days left in history)`}
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1">
                          {app.jobTitleAr || app.jobTitleEn}
                        </h4>
                        <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                          <span>{app.companyNameAr || app.companyNameEn || (language === 'ar' ? 'جهة عمل معتمدة' : 'Verified Employer')}</span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black border shadow-xs ${statusInfo.badgeClass}`}>
                          <span className={`w-2 h-2 rounded-full ${statusInfo.dotClass}`} />
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.title}</span>
                        </span>
                      </div>
                    </div>

                    {/* Status Explanation Card */}
                    <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs ${
                      app.status === 'rejected' 
                        ? 'bg-white border-rose-200 text-rose-900' 
                        : 'bg-slate-50 border-slate-100 text-slate-700'
                    }`}>
                      {app.status === 'rejected' ? (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                      )}

                      <div className="space-y-1.5 flex-1">
                        <p className="font-semibold leading-relaxed">
                          {statusInfo.description}
                        </p>

                        {/* Dedicated Polite Note for Rejected Candidates */}
                        {app.status === 'rejected' && (
                          <div className="pt-2 border-t border-rose-100 text-[11px] text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-800 block mb-0.5">
                              {language === 'ar' ? 'ملاحظة لطالب العمل:' : 'Notice for Candidate:'}
                            </span>
                            <span>
                              {language === 'ar'
                                ? 'نتمنى لك كامل التوفيق والنجاح في الفرص الوظيفية القادمة. يبقى هذا السجل محفوظاً لديك لمدة شهرين، أو يمكنك حذفه فوراً من سجلك عبر زر الحذف بالأسفل.'
                                : 'We wish you the best of luck in other vacancies. This application is saved in your history for 2 months, or you can delete it anytime below.'}
                            </span>
                          </div>
                        )}

                        {app.employerNotes && (
                          <div className="pt-1.5 border-t border-slate-200 text-teal-900 font-bold">
                            <span>{language === 'ar' ? 'ملاحظة صاحب العمل: ' : 'Employer note: '}</span>
                            <span className="font-normal">{app.employerNotes}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Step Timeline Indicator for active applications */}
                    {app.status !== 'rejected' && (
                      <div className="pt-1">
                        <div className="grid grid-cols-4 gap-1 text-center">
                          <div className={`py-1 rounded-lg text-[10px] font-bold ${statusInfo.stepIndex >= 1 ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {language === 'ar' ? '1. استلام' : '1. Received'}
                          </div>
                          <div className={`py-1 rounded-lg text-[10px] font-bold ${statusInfo.stepIndex >= 2 ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {language === 'ar' ? '2. قيد الفحص' : '2. Reviewing'}
                          </div>
                          <div className={`py-1 rounded-lg text-[10px] font-bold ${statusInfo.stepIndex >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {language === 'ar' ? '3. مقابلة' : '3. Interview'}
                          </div>
                          <div className={`py-1 rounded-lg text-[10px] font-bold ${statusInfo.stepIndex >= 4 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            {language === 'ar' ? '4. قبول' : '4. Accepted'}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Footer Row: Date & Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تاريخ التقديم: ' : 'Applied: '}</span>
                        <span>{new Date(app.createdAt).toLocaleDateString('ar-QA')}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Preview Submitted CV Button */}
                        <button
                          type="button"
                          onClick={() => setViewingApp(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>{language === 'ar' ? 'معاينة السيرة الذاتية' : 'View CV'}</span>
                        </button>

                        {/* Candidate Delete from Personal History */}
                        <button
                          type="button"
                          onClick={() => setAppToDelete(app)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition cursor-pointer"
                          title={language === 'ar' ? 'حذف هذا الطلب من سجلي الشخصي' : 'Delete from my history'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{language === 'ar' ? 'حذف من سجلي' : 'Delete'}</span>
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {language === 'ar' ? 'يتم تحديث حالات الطلبات تلقائياً فور اتخاذ صاحب العمل أي قرار' : 'Statuses update in real-time when the employer updates your file'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 font-bold transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق' : 'Close'}
          </button>
        </div>

      </div>

      {/* CV Preview Modal */}
      {viewingApp && (
        <ResumeViewerModal
          application={viewingApp}
          onClose={() => setViewingApp(null)}
        />
      )}

      {/* Candidate Confirm Delete Modal (In-App Modal) */}
      {appToDelete && (
        <div className="fixed inset-0 z-70 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-black text-slate-900">
                {language === 'ar' ? 'حذف الطلب من سجلك الشخصي؟' : 'Remove application from history?'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'ar'
                  ? `هل أنت متأكد من حذف طلب التقديم على وظيفة "${appToDelete.jobTitleAr || appToDelete.jobTitleEn}" من سجلك؟ لن يظهر هذا الطلب في قائمة متابعاتك بعد الآن.`
                  : `Are you sure you want to remove your application for "${appToDelete.jobTitleAr || appToDelete.jobTitleEn}" from your history?`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAppToDelete(null)}
                disabled={isDeletingApp}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteByApplicant}
                disabled={isDeletingApp}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeletingApp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{language === 'ar' ? 'جارٍ الحذف...' : 'Deleting...'}</span>
                  </>
                ) : (
                  <span>{language === 'ar' ? 'نعم، احذف من سجلي' : 'Yes, Delete'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
