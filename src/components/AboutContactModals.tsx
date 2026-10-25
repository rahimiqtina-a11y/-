import React from 'react';
import { X, Building2, Mail, Phone, MapPin, CheckCircle, ShieldCheck, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            <span>{t.nav.about}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <p>
            {language === 'ar'
              ? 'تأسست منصة "وظائف الخليج" لتكون المرجع الرقمي الموحد والموثوق لفرص العمل والإعلانات الوظيفية الرسمية في دول مجلس التعاون الخليجي الست: قطر، الإمارات العربية المتحدة، المملكة العربية السعودية، سلطنة عُمان، دولة الكويت، ومملكة البحرين.'
              : 'Gulf Jobs is the unified career portal designed to bring verified, transparent, and direct employment opportunities across all six GCC states: Qatar, UAE, Saudi Arabia, Oman, Kuwait, and Bahrain.'}
          </p>

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 space-y-2">
            <h4 className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>{language === 'ar' ? 'ركائز منصة وظائف الخليج:' : 'Core Pillars of Gulf Jobs:'}</span>
            </h4>
            <ul className="space-y-1.5 text-xs text-teal-800">
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{language === 'ar' ? 'إعلانات وظيفية منشورة حصراً من قبل إدارة المنصة بعد التدقيق.' : 'Exclusively verified administrator-published listings.'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{language === 'ar' ? 'تواصل وتقديم مباشر مع جهات التوظيف عبر واتساب والبريد.' : 'Direct WhatsApp & employer communication without third-party fees.'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>{language === 'ar' ? 'تغطية العملات والمدن الخليجية المحلية بدقة كاملة.' : 'Precise GCC currency and city-level targeting.'}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ContactModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
          <h3 className="font-bold text-base flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-400" />
            <span>{t.nav.contact}</span>
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {language === 'ar'
              ? 'هل لديك استفسار أو ترغب في نشر إعلان وظيفي لشركتك في إحدى دول الخليج؟ تواصل مع فريق إدارة منصة وظائف الخليج مباشرة:'
              : 'Have an inquiry or wish to publish a verified company vacancy in any GCC country? Contact the Gulf Jobs administration team:'}
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{language === 'ar' ? 'البريد الإلكتروني' : 'Official Email'}</span>
                <a href="mailto:admin@gulfjobs.com" className="text-xs font-bold text-slate-900 hover:text-teal-700">
                  contact@gulfjobs.example.com
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{language === 'ar' ? 'واتساب الإدارة' : 'WhatsApp Official'}</span>
                <span className="text-xs font-bold text-slate-900 font-mono">
                  +974 5512 3456 / +971 50 123 4567
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block">{language === 'ar' ? 'التغطية الإقليمية' : 'Coverage'}</span>
                <span className="text-xs font-medium text-slate-800">
                  Qatar, UAE, Saudi Arabia, Oman, Kuwait, Bahrain
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
