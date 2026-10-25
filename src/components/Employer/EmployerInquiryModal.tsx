import React, { useState } from 'react';
import { 
  X, 
  Building, 
  Send, 
  CheckCircle2, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { GCCCountry } from '../../types/job';
import { INITIAL_GCC_COUNTRIES } from '../../lib/initialData';

interface EmployerInquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (data: {
    companyName: string;
    subject: string;
    message: string;
    jobDetails?: string;
    senderPhone?: string;
    countryId?: string;
  }) => Promise<void>;
  countries?: GCCCountry[];
}

export const EmployerInquiryModal: React.FC<EmployerInquiryModalProps> = ({
  isOpen,
  onClose,
  onSendMessage,
  countries = INITIAL_GCC_COUNTRIES,
}) => {
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();

  const [companyName, setCompanyName] = useState(userProfile?.companyName || '');
  const [senderPhone, setSenderPhone] = useState(userProfile?.phone || userProfile?.whatsapp || '');
  const [countryId, setCountryId] = useState(userProfile?.countryId || 'qatar');
  const [subject, setSubject] = useState(language === 'ar' ? 'طلب نشر إعلان وظيفي معتمد' : 'Vacancy Publishing Request');
  const [jobTitleRequired, setJobTitleRequired] = useState('');
  const [jobDetails, setJobDetails] = useState('');
  const [additionalMessage, setAdditionalMessage] = useState('');

  const [isSending, setIsSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !jobTitleRequired.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسم الشركة والمسمى الوظيفي المطلوب' : 'Please provide company name and job title');
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      const fullJobText = `المسمى الوظيفي المطلوب: ${jobTitleRequired}\n\nتفاصيل الوظيفة والمؤهلات:\n${jobDetails}\n\nملاحظات إضافية:\n${additionalMessage}`;
      await onSendMessage({
        companyName: companyName.trim(),
        subject: subject.trim(),
        message: fullJobText,
        jobDetails: fullJobText,
        senderPhone: senderPhone.trim(),
        countryId,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'طلب نشر وظيفة لمسؤول التطبيق' : 'Request Vacancy Publication'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'خاص بأصحاب العمل والشركات في دول الخليج' : 'For GCC Employers and Companies'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert */}
        {success ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {language === 'ar' ? 'تم استلام طلبكم بنجاح!' : 'Request Sent Successfully!'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              {language === 'ar'
                ? 'وصلت رسالتكم مباشرة إلى مسؤول التطبيق، وسيقوم بمراجعة بيانات الوظيفة واعتماد نشرها في المنصة والتواصل معكم فوراً.'
                : 'Your message has been delivered to the platform administrator. The vacancy will be reviewed and published shortly.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 flex-1">
            
            {/* Explanatory Policy Notice */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">
                  {language === 'ar' ? 'سياسة النشر المعتمد لأصحاب العمل:' : 'Verified Publishing Policy:'}
                </span>
                <span>
                  {language === 'ar'
                    ? 'لحماية الباحثين عن عمل وضمان جودة الوظائف، يتم نشر إعلانات الشركات عبر مسؤول التطبيق بعد التدقيق. يرجى إدخال تفاصيل الشاغر الوظيفي أدناه.'
                    : 'To protect job seekers and ensure verified authenticity, all company vacancies are reviewed and posted by the platform administrator.'}
                </span>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'اسم الشركة / المؤسسة *' : 'Company Name *'}
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="مثال: مجموعة قطر للاستثمار"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'رقم الهاتف أو الواتساب للتواصل *' : 'Contact Phone / WhatsApp *'}
                </label>
                <input
                  type="tel"
                  required
                  value={senderPhone}
                  onChange={(e) => setSenderPhone(e.target.value)}
                  placeholder="+974 5512 3456"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'الدولة الخليجية' : 'Country'}
                </label>
                <select
                  value={countryId}
                  onChange={(e) => setCountryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flagEmoji} {language === 'ar' ? c.nameAr : c.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'ar' ? 'المسمى الوظيفي المطلوب *' : 'Required Job Title *'}
                </label>
                <input
                  type="text"
                  required
                  value={jobTitleRequired}
                  onChange={(e) => setJobTitleRequired(e.target.value)}
                  placeholder="مثال: مندوب مبيعات أول، محاسب، سائق"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'تفاصيل الوظيفة والشروط والمزايا والراتب المتوقع' : 'Job Description, Requirements & Salary'}
              </label>
              <textarea
                rows={4}
                value={jobDetails}
                onChange={(e) => setJobDetails(e.target.value)}
                placeholder="اكتب هنا المتطلبات، المؤهل المطلوب، ساعات العمل، والراتب المتوقع إن وجد..."
                className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'رسالة أو ملاحظات لمسؤول التطبيق' : 'Note for Administrator'}
              </label>
              <input
                type="text"
                value={additionalMessage}
                onChange={(e) => setAdditionalMessage(e.target.value)}
                placeholder="أي تعليمات إضافية بخصوص وقت النشر أو طريقة استقبال السير الذاتية..."
                className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 outline-none"
              />
            </div>

            {/* Footer buttons */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={isSending}
                className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? (language === 'ar' ? 'جارٍ الإرسال...' : 'Sending...') : (language === 'ar' ? 'إرسال إلى مسؤول التطبيق' : 'Send to Admin')}</span>
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
