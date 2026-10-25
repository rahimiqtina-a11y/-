import React from 'react';
import { Briefcase, Globe, Shield, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { INITIAL_GCC_COUNTRIES } from '../lib/initialData';

interface FooterProps {
  onSelectCountry: (countryId: string) => void;
  onOpenAdmin: () => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
  onOpenPrivacyPolicy?: () => void;
  onOpenGooglePlayReview?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCountry,
  onOpenAdmin,
  onNavigateAbout,
  onNavigateContact,
  onOpenPrivacyPolicy,
  onOpenGooglePlayReview,
}) => {
  const { language, t } = useLanguage();
  const { user, isAdmin } = useAuth();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 pt-14 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12 border-b border-slate-800/80">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-teal-500/20">
                <Briefcase className="w-5 h-5 text-slate-950" />
              </div>
              <span className="font-extrabold text-xl text-white">
                {language === 'ar' ? 'وظائف الخليج | Gulf Jobs' : 'Gulf Jobs | وظائف الخليج'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              {t.footer.aboutDesc}
            </p>

            <div className="pt-1 flex items-center gap-3 text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                <Globe className="w-3.5 h-3.5 text-teal-400" />
                <span>Qatar • UAE • KSA • Oman • Kuwait • Bahrain</span>
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button onClick={onNavigateAbout} className="hover:text-teal-400 transition-colors">
                  {t.nav.about}
                </button>
              </li>
              <li>
                <button onClick={onNavigateContact} className="hover:text-teal-400 transition-colors">
                  {t.nav.contact}
                </button>
              </li>
              {user && isAdmin && (
                <li>
                  <button onClick={onOpenAdmin} className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3 text-amber-400" />
                    <span>{t.nav.adminPortal}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* GCC Coverage Links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3.5">
              {t.footer.gccCoverage}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {INITIAL_GCC_COUNTRIES.map(country => (
                <button
                  key={country.id}
                  onClick={() => onSelectCountry(country.id)}
                  className="text-start py-1 px-2 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition-colors flex items-center gap-2"
                >
                  <span>{country.flagEmoji}</span>
                  <span>{language === 'ar' ? country.nameAr : country.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Legal & Copyright Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {t.footer.copyright}
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button 
              onClick={onOpenPrivacyPolicy}
              className="text-teal-400 hover:text-teal-300 font-bold transition-colors cursor-pointer"
            >
              {language === 'ar' ? 'سياسة الخصوصية وأمان البيانات' : 'Privacy Policy & Data Safety'}
            </button>
            <span>•</span>
            <button 
              onClick={onOpenGooglePlayReview}
              className="text-amber-400 hover:text-amber-300 font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>🔑</span>
              <span>{language === 'ar' ? 'حساب مراجعة Google Play' : 'Play Store Reviewer'}</span>
            </button>
            <span>•</span>
            <button 
              onClick={onNavigateAbout}
              className="hover:text-slate-400 cursor-pointer"
            >
              {t.footer.terms}
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
