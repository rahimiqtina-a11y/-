import React from 'react';
import { X, Key, ShieldCheck, CheckCircle2, UserCheck, Building2, ExternalLink, Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface GooglePlayReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRoleDemo?: (role: 'job_seeker' | 'employer' | 'admin') => void;
}

export const GooglePlayReviewModal: React.FC<GooglePlayReviewModalProps> = ({ 
  isOpen, 
  onClose,
  onSelectRoleDemo 
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black">
                  {language === 'ar' ? 'بيانات المراجعة والحساب التجريبي' : 'Google Play Review & Test Credentials'}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold">
                  Play Store Reviewer
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {language === 'ar' ? 'إرشادات مراجعي متجر Google Play واختبار صلاحيات المنصة' : 'Guidelines for Google Play Store Reviewers & Testers'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-5 text-sm text-slate-700">
          
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-1">
            <span className="font-black block text-sm">
              {language === 'ar' ? 'مرحباً بفريق مراجعة Google Play' : 'Welcome Google Play Review Team'}
            </span>
            <p>
              {language === 'ar' 
                ? 'لتسهيل التحقق من ميزات التطبيق دون الحاجة لخطوات تحقق خارجية، تم إعداد بيئة مراجعة متكاملة تتيح تجربة دور الباحث عن عمل ودور صاحب العمل وإدارة المنصة.'
                : 'To facilitate seamless evaluation of all app capabilities without external blockers, you can review candidate flows, employer office flows, and administrator features.'}
            </p>
          </div>

          {/* Test Roles Card */}
          <div className="space-y-3">
            <h3 className="font-black text-slate-900 text-sm">
              {language === 'ar' ? 'المسارات الوظيفية المتاحة للاختبار:' : 'Available Testing Pathways:'}
            </h3>

            {/* Candidate Role */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    {language === 'ar' ? '1. تجربة الباحث عن عمل (Candidate / Job Seeker)' : '1. Candidate / Job Seeker Experience'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar' 
                      ? 'تصفح الوظائف، التصفية حسب الدول والرواتب، ورفع السيرة الذاتية (CV) للتقديم المباشر.'
                      : 'Search & filter GCC jobs, view vacancy specs, and upload a resume directly to the employer.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Employer Role */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    {language === 'ar' ? '2. تجربة صاحب العمل (Employer / Recruiter)' : '2. Employer / Recruiter Experience'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar' 
                      ? 'الوصول إلى "مكتب صاحب العمل"، فحص السير الذاتية الواردة، تحديث حالة المتقدمين، ونشر إعلانات جديدة عند تفعيل الصلاحية.'
                      : 'Access the "Employer Office", review submitted applicant resumes, manage candidate stages, and publish job listings.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Admin Supervision */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-xs">
                    {language === 'ar' ? '3. إدارة المنصة وتفعيل أصحاب العمل (Admin Dashboard)' : '3. Admin Supervision & Employer Approvals'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar' 
                      ? 'مخصصة للمشرفين المعتمدين لإدارة طلبات النشر، تفعيل أصحاب العمل وتحديد صلاحية النشر (أسبوع/شهر/سنة).'
                      : 'Strictly restricted to platform admins to manage vacancies, approve employers, and assign active publishing timeframes.'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Test Credentials Detail */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-200 space-y-2 text-xs font-mono">
            <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wider block">
              {language === 'ar' ? 'بيانات الاعتماد التجريبية (Demo Accounts):' : 'Demo Credentials for Testing:'}
            </span>
            <div className="space-y-1">
              <div>
                <span className="text-slate-400">Employer Demo: </span>
                <span className="text-white font-bold">employer.demo@gulfjobs.com</span> / <span className="text-amber-300">GulfDemo2026!</span>
              </div>
              <div>
                <span className="text-slate-400">Candidate Demo: </span>
                <span className="text-white font-bold">candidate.demo@gulfjobs.com</span> / <span className="text-amber-300">GulfDemo2026!</span>
              </div>
              <div>
                <span className="text-slate-400">Google One-Tap / Firebase Auth: </span>
                <span className="text-teal-300">Fully integrated with instant role onboarding</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-sm transition cursor-pointer"
          >
            {language === 'ar' ? 'إغلاق ومتابعة التصفح' : 'Close and Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};
