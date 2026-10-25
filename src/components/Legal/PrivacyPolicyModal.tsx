import React from 'react';
import { X, ShieldCheck, Lock, FileText, UserCheck, Trash2, Mail, ExternalLink, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white px-6 py-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A896]/20 border border-[#00A896]/40 flex items-center justify-center text-[#00A896]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black">
                {language === 'ar' ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy Policy & Data Safety'}
              </h2>
              <p className="text-xs text-teal-300/80">
                {language === 'ar' ? 'متوافقة مع معايير Google Play ومتجر التطبيقات' : 'Google Play & App Store Compliant'}
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

        {/* Content Body */}
        <div className="overflow-y-auto p-6 space-y-6 text-sm text-slate-700 leading-relaxed">
          
          {/* Badge */}
          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 flex items-start gap-3">
            <Lock className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div className="text-xs text-teal-950 space-y-1">
              <span className="font-black block">
                {language === 'ar' ? 'التزامنا بحماية خصوصيتك' : 'Our Privacy Commitment'}
              </span>
              <p className="text-teal-800 leading-normal">
                {language === 'ar'
                  ? 'منصة وظائف الخليج تحرص بشدة على حماية خصوصية جميع الباحثين عن عمل وأصحاب العمل، وتلتزم بأعلى معايير أمان البيانات المتبعة دولياً ومعايير متجر Google Play.'
                  : 'Gulf Jobs is dedicated to protecting the privacy of job seekers and employers, adhering to international data security best practices and Google Play Store policies.'}
              </p>
            </div>
          </div>

          {/* Section 1: Data Collection */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#00A896]" />
              {language === 'ar' ? '1. البيانات التي نجمعها' : '1. Information We Collect'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'ar'
                ? 'عند استخدام المنصة، قد نقوم بجمع المعلومات التالية بغرض توفير خدمة التوظيف:'
                : 'When using our platform, we may collect the following information solely to provide recruitment services:'}
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pr-2">
              <li>
                <strong>{language === 'ar' ? 'بيانات الحساب: ' : 'Account Info: '}</strong>
                {language === 'ar' ? 'الاسم، البريد الإلكتروني، وصورة الملف الشخصي عبر تسجيل الدخول بـ Google.' : 'Name, email address, and profile photo via Google Sign-In.'}
              </li>
              <li>
                <strong>{language === 'ar' ? 'بيانات التقديم على الوظائف: ' : 'Job Application Info: '}</strong>
                {language === 'ar' ? 'الاسم الثلاثي، رقم الهاتف والواتساب، سنوات الخبرة، وملف السيرة الذاتية (CV).' : 'Full name, phone/WhatsApp number, years of experience, and uploaded resume/CV.'}
              </li>
              <li>
                <strong>{language === 'ar' ? 'بيانات أصحاب العمل: ' : 'Employer Info: '}</strong>
                {language === 'ar' ? 'اسم الشركة، الدولة، تفاصيل الوظائف الشاغرة، وتراخيص النشر المعتمدة.' : 'Company name, country, vacancy details, and verified publishing permissions.'}
              </li>
            </ul>
          </div>

          {/* Section 2: Resumes & Candidate Privacy */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#00A896]" />
              {language === 'ar' ? '2. خصوصية السيرة الذاتية والتقديم المباشر' : '2. Resume & Applicant Privacy'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'ar'
                ? 'عند تقديمك على أي وظيفة، يتم إرسال ملف سيرتك الذاتية وبيانات الاتصال حصرياً إلى "مكتب صاحب العمل" الخاص بالجهة الناشرة للوظيفة المعنية. لا نقوم بمشاركة سيرتك الذاتية مع أي طرف ثالث أو معلنين، ولا يتم عرضها للعامة إطلاقاً.'
                : 'When you apply for a job, your resume file and contact information are delivered directly and exclusively to the private "Employer Office" of the company posting the vacancy. Your CV is never sold, publicly published, or shared with third-party advertisers.'}
            </p>
          </div>

          {/* Section 3: Employer Privacy Shield */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00A896]" />
              {language === 'ar' ? '3. حماية جهات العمل ومنع الإزعاج' : '3. Employer Privacy Shield'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'ar'
                ? 'حرصاً على وقت أصحاب العمل ومنع الاتصالات العشوائية أو البريد المزعج، لا يتم عرض أرقام الهواتف أو البريد المباشر لأصحاب العمل على الواجهة العامة للإعلانات. يتلقى صاحب العمل كافة طلبات التوظيف المنظمة داخل مكتبه ويتواصل هو مع المتقدم المناسب.'
                : 'To prevent unsolicited marketing and spam calls, employer phone numbers and personal emails are hidden from public job listings. Employers receive organized applications inside their office portal and initiate contact directly.'}
            </p>
          </div>

          {/* Section 4: Data Security & Storage */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#00A896]" />
              {language === 'ar' ? '4. تخزين البيانات والأمان التقني' : '4. Data Storage & Security'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'ar'
                ? 'يتم تخزين بيانات التطبيق وقواعد البيانات والملفات عبر بنية Google Cloud Firebase التحتية مع تشفير كامل للبيانات أثناء النقل (TLS/HTTPS) والتخزين المشفر وفقاً لمعايير الأمان المعتمدة عالمياً.'
                : 'All application data and uploaded resumes are securely stored on Google Cloud Firebase infrastructure with end-to-end TLS/HTTPS encryption in transit and encrypted data storage at rest.'}
            </p>
          </div>

          {/* Section 5: User Rights & Data Deletion */}
          <div className="space-y-2">
            <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-[#00A896]" />
              {language === 'ar' ? '5. حقوق المستخدم وحذف البيانات' : '5. User Rights & Data Deletion'}
            </h3>
            <p className="text-xs text-slate-600">
              {language === 'ar'
                ? 'يحق لكل مستخدم طلب حذف حسابه أو حذف طلبات التوظيف والسير الذاتية التي قدمها في أي وقت. يمكنك طلب الحذف الفوري لبياناتك بالتواصل مع إدارة المنصة عبر البريد الإلكتروني أدناه.'
                : 'Every user has the right to request deletion of their profile, uploaded resumes, and job postings at any time. You can request complete deletion by contacting support below.'}
            </p>
          </div>

          {/* Contact Support */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  {language === 'ar' ? 'للتواصل والاستفسارات الخصوصية:' : 'Contact for Privacy Inquiries:'}
                </span>
                <span className="text-xs text-[#00A896] font-mono font-bold">
                  privacy@gulfjobs-platform.com
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-400 bg-white px-2.5 py-1 rounded-full border border-slate-200">
              {language === 'ar' ? 'محدث: أكتوبر 2026' : 'Updated: Oct 2026'}
            </span>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-sm transition cursor-pointer"
          >
            {language === 'ar' ? 'فهمت وأوافق' : 'I Understand'}
          </button>
        </div>
      </div>
    </div>
  );
};
