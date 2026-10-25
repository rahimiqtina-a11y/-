import React, { useState } from 'react';
import { 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  ShieldCheck,
  FileText
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/job';

interface RoleOnboardingModalProps {
  isOpen: boolean;
  onComplete: (selectedRole: UserRole) => Promise<void>;
}

export const RoleOnboardingModal: React.FC<RoleOnboardingModalProps> = ({ isOpen, onComplete }) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('job_seeker');
  const [companyName, setCompanyName] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !user) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onComplete(selectedRole);
    } catch (err) {
      console.error('Error confirming role:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 sm:p-7 text-center relative overflow-hidden">
          <div className="absolute top-0 end-0 translate-x-4 -translate-y-4 w-28 h-28 bg-[#00A896]/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="w-13 h-13 rounded-2xl bg-[#00A896]/20 border border-teal-400/40 flex items-center justify-center text-teal-300 mx-auto mb-3 shadow-inner">
            <Sparkles className="w-7 h-7" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black mb-1">
            {language === 'ar' ? 'مرحباً بك في وظائف الخليج!' : 'Welcome to Gulf Jobs!'}
          </h2>
          <p className="text-xs sm:text-sm text-teal-200/90 max-w-sm mx-auto">
            {language === 'ar'
              ? `أهلاً بك (${user.displayName || user.email}). يرجى تحديد نوع حسابك للبدء، وسيتم حفظ اختيارك تلقائياً لجميع تسجيلات الدخول القادمة:`
              : `Hello (${user.displayName || user.email}). Please choose your account type to continue. Your choice will be remembered permanently:`}
          </p>
        </div>

        {/* Content Body: Role Cards */}
        <div className="p-6 sm:p-7 space-y-4">
          
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center sm:text-start">
            {language === 'ar' ? 'حدد الغرض الأساسي من استخدام المنصة:' : 'Select your primary role on the platform:'}
          </label>

          {/* Option 1: باحث عن عمل */}
          <div
            onClick={() => setSelectedRole('job_seeker')}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              selectedRole === 'job_seeker'
                ? 'border-[#00A896] bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              selectedRole === 'job_seeker' ? 'bg-[#00A896] text-white shadow-sm' : 'bg-slate-100 text-slate-500'
            }`}>
              <Users className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'ar' ? 'أنا باحث عن عمل (Job Seeker)' : 'I am a Job Seeker'}
                </h3>
                {selectedRole === 'job_seeker' && (
                  <CheckCircle2 className="w-5 h-5 text-[#00A896] shrink-0 fill-current" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'أبحث عن فرص عمل، رفع السيرة الذاتية (CV) والتقديم المباشر، ونشر إعلاني في دليل الكفاءات للتواصل مع الشركات.'
                  : 'Search for jobs across GCC, upload resume & apply directly, and publish candidate profile to be discovered.'}
              </p>
            </div>
          </div>

          {/* Option 2: صاحب عمل / شركة */}
          <div
            onClick={() => setSelectedRole('employer')}
            className={`p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
              selectedRole === 'employer'
                ? 'border-[#00A896] bg-teal-50/50 shadow-md ring-2 ring-teal-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              selectedRole === 'employer' ? 'bg-[#00A896] text-white shadow-sm' : 'bg-slate-100 text-slate-500'
            }`}>
              <Building2 className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-extrabold text-base text-slate-900">
                  {language === 'ar' ? 'أنا صاحب عمل / جهة توظيف (Employer)' : 'I am an Employer / Company'}
                </h3>
                {selectedRole === 'employer' && (
                  <CheckCircle2 className="w-5 h-5 text-[#00A896] shrink-0 fill-current" />
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {language === 'ar'
                  ? 'أبحث عن موظفين وكفاءات، نشر شواغر وظيفية، واستقبال ومراجعة السير الذاتية في مكتب صاحب العمل مع حماية خصوصية بياناتك.'
                  : 'Hire talent, post job vacancies, and manage applicant CVs in your private employer desk with full privacy.'}
              </p>
            </div>
          </div>

          {/* Privacy Note */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              {language === 'ar'
                ? 'سيتم ضبط لوحة تحكم حسابك بناءً على اختيارك، ويمكنك دائماً تعديل بياناتك من الملف الشخصي.'
                : 'Your platform experience will be tailored based on this choice. You can update your details in your profile anytime.'}
            </span>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full h-13 rounded-2xl bg-[#00A896] hover:bg-[#009688] disabled:bg-slate-300 text-white font-black text-sm shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-101"
            >
              <span>
                {isSubmitting 
                  ? (language === 'ar' ? 'جارٍ حفظ الإعدادات...' : 'Saving Choice...') 
                  : (language === 'ar' ? 'تأكيد الحساب ومتابعة الدخول' : 'Confirm & Proceed to App')}
              </span>
              {language === 'ar' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
