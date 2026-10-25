import React, { useState } from 'react';
import { Briefcase, Globe, Shield, Menu, X, Check, Users, User, Sparkles, LogIn, ChevronDown, Building2, FileCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { GCCCountry } from '../types/job';
import { INITIAL_GCC_COUNTRIES } from '../lib/initialData';
import { CountryFlag } from './CountryFlag';

interface NavbarProps {
  onSelectCountry?: (countryId: string) => void;
  selectedCountryId?: string;
  onOpenAdmin: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
  onOpenEmployerOffice?: () => void;
  onOpenMyApplications?: () => void;
  onNavigateHome: () => void;
  onNavigateJobs: () => void;
  onNavigateJobSeekers: () => void;
  onNavigateCategories: () => void;
  onNavigateAbout: () => void;
  onNavigateContact: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectCountry,
  selectedCountryId = 'all',
  onOpenAdmin,
  onOpenProfile,
  onOpenLogin,
  onOpenEmployerOffice,
  onOpenMyApplications,
  onNavigateHome,
  onNavigateJobs,
  onNavigateJobSeekers,
  onNavigateCategories,
  onNavigateAbout,
  onNavigateContact,
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const { user, isAdmin, userProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);

  const selectedCountry = INITIAL_GCC_COUNTRIES.find(c => c.id === selectedCountryId);

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Logo & Brand */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer group py-2"
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  {language === 'ar' ? 'وظائف الخليج' : 'Gulf Jobs'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-medium">
                  GCC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-normal">
                {language === 'ar' ? 'Gulf Jobs | البوابة الرسمية' : 'Bilingual GCC Careers'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={onNavigateHome}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t.nav.home}
            </button>
            <button
              onClick={onNavigateJobs}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t.nav.allJobs}
            </button>
            <button
              onClick={onNavigateJobSeekers}
              className="px-3 py-2 text-sm font-bold text-teal-300 hover:text-white hover:bg-teal-900/30 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>{language === 'ar' ? 'الباحثون عن عمل' : 'Job Seekers'}</span>
              <span className="w-2 h-2 rounded-full bg-teal-400"></span>
            </button>
            <button
              onClick={onNavigateCategories}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t.nav.categories}
            </button>
            <button
              onClick={onNavigateAbout}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t.nav.about}
            </button>
            <button
              onClick={onNavigateContact}
              className="px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              {t.nav.contact}
            </button>
          </nav>

          {/* Right Action Tools: Country Selector, Language Switch, User Profile / Auth */}
          <div className="hidden sm:flex items-center gap-2">
            
            {/* Country Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition cursor-pointer"
              >
                <CountryFlag countryId={selectedCountryId} className="w-4 h-4" shape="circle" />
                <span>
                  {selectedCountry
                    ? (language === 'ar' ? selectedCountry.nameAr : selectedCountry.nameEn)
                    : t.search.allCountries}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {countryDropdownOpen && (
                <div 
                  className={`absolute mt-2 w-56 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl py-2 z-50 ${language === 'ar' ? 'left-0' : 'right-0'}`}
                  onMouseLeave={() => setCountryDropdownOpen(false)}
                >
                  <button
                    onClick={() => {
                      onSelectCountry?.('all');
                      setCountryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2.5 text-start text-xs font-semibold hover:bg-slate-700 text-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <CountryFlag countryId="all" className="w-4 h-4" shape="circle" />
                      <span>{t.search.allCountries}</span>
                    </span>
                    {selectedCountryId === 'all' && <Check className="w-3.5 h-3.5 text-teal-400" />}
                  </button>
                  <div className="my-1 border-t border-slate-700" />
                  {INITIAL_GCC_COUNTRIES.map(country => (
                    <button
                      key={country.id}
                      onClick={() => {
                        onSelectCountry?.(country.id);
                        setCountryDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-start text-xs font-semibold hover:bg-slate-700 text-slate-200 flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <CountryFlag countryId={country.id} className="w-4 h-4" shape="circle" />
                        <span>{language === 'ar' ? country.nameAr : country.nameEn}</span>
                      </span>
                      {selectedCountryId === country.id && <Check className="w-3.5 h-3.5 text-teal-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-teal-300 hover:text-white transition cursor-pointer"
              title={language === 'ar' ? 'Switch to English' : 'التحويل إلى العربية'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'English' : 'العربية'}</span>
            </button>

            {/* User Profile or Google Sign In */}
            {user ? (
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-teal-500/30 text-white transition cursor-pointer group"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full object-cover border border-teal-400"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.email || 'U').charAt(0)}
                  </div>
                )}
                <div className="text-start leading-tight">
                  <div className="text-xs font-extrabold truncate max-w-[90px]">
                    {user.displayName?.split(' ')[0] || (language === 'ar' ? 'حسابي' : 'Account')}
                  </div>
                  <div className="text-[10px] text-teal-300 font-semibold">
                    {userProfile?.role === 'employer'
                      ? (language === 'ar' ? 'صاحب عمل' : 'Employer')
                      : (language === 'ar' ? 'باحث عن عمل' : 'Job Seeker')}
                  </div>
                </div>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-extrabold text-xs shadow-md shadow-teal-500/20 transition cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'دخول بحساب Google' : 'Sign in with Google'}</span>
              </button>
            )}

            {/* My Applications Button (طلباتي للتوظيف ومتابعة الحالات) */}
            {user && (
              <button
                onClick={() => {
                  if (onOpenMyApplications) {
                    onOpenMyApplications();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-teal-500/30 text-teal-300 hover:text-white text-xs font-bold transition cursor-pointer shadow-xs"
                title={language === 'ar' ? 'طلبات التوظيف الخاصة بي ومتابعة الحالات' : 'My Job Applications'}
              >
                <FileCheck className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden xl:inline">{language === 'ar' ? 'طلباتي' : 'My Applications'}</span>
              </button>
            )}

            {/* Employer Office Button (مكتب التوظيف وصاحب العمل) - ONLY visible for authenticated employers or admins */}
            {user && (userProfile?.role === 'employer' || isAdmin) && (
              <button
                onClick={() => {
                  if (onOpenEmployerOffice) {
                    onOpenEmployerOffice();
                  }
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-950/70 hover:bg-teal-900 border border-teal-500/40 text-teal-200 hover:text-white text-xs font-bold transition cursor-pointer shadow-xs"
                title={language === 'ar' ? 'مكتب صاحب العمل والتوظيف' : 'Employer Office'}
              >
                <Building2 className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden xl:inline">{language === 'ar' ? 'مكتب التوظيف' : 'Employer Desk'}</span>
              </button>
            )}

            {/* Admin Portal Button - ONLY visible for authenticated verified admins */}
            {user && isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs"
                title={language === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'المدير' : 'Admin'}</span>
              </button>
            )}

          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs font-bold text-teal-300 cursor-pointer"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            {user ? (
              <button
                onClick={onOpenProfile}
                className="p-1 rounded-xl bg-slate-800 border border-teal-500/50 cursor-pointer"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User"
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-teal-400 p-0.5" />
                )}
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-2.5 py-1 rounded-lg bg-[#00A896] text-white font-bold text-xs cursor-pointer"
              >
                {language === 'ar' ? 'دخول' : 'Login'}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-3 pb-5 space-y-4 shadow-2xl">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-800">
            <button
              onClick={() => {
                onNavigateHome();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {t.nav.home}
            </button>
            <button
              onClick={() => {
                onNavigateJobs();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {t.nav.allJobs}
            </button>
            <button
              onClick={() => {
                onNavigateJobSeekers();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-bold text-teal-300 hover:bg-slate-800 rounded-xl flex items-center gap-1.5"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>{language === 'ar' ? 'الباحثون عن عمل' : 'Job Seekers'}</span>
            </button>
            <button
              onClick={() => {
                onNavigateCategories();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {t.nav.categories}
            </button>
            <button
              onClick={() => {
                onNavigateAbout();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {t.nav.about}
            </button>
            <button
              onClick={() => {
                onNavigateContact();
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-start text-sm font-semibold text-slate-200 hover:bg-slate-800 rounded-xl"
            >
              {t.nav.contact}
            </button>
          </div>

          {/* User Account / Profile action in drawer */}
          <div className="pt-1">
            {user ? (
              <>
                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-800 border border-slate-700"
                >
                  <div className="flex items-center gap-3">
                    {user.photoURL ? (
                      <img src={user.photoURL} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-teal-400" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center">
                        {(user.displayName || user.email || 'U').charAt(0)}
                      </div>
                    )}
                    <div className="text-start">
                      <div className="text-sm font-bold text-white">{user.displayName || user.email}</div>
                      <div className="text-xs text-teal-300">
                        {userProfile?.role === 'employer' ? (language === 'ar' ? 'صاحب عمل' : 'Employer') : (language === 'ar' ? 'باحث عن عمل' : 'Job Seeker')}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-slate-400">{language === 'ar' ? 'تعديل البروفايل ←' : 'Edit Profile →'}</span>
                </button>

                {/* Mobile My Applications Button */}
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenMyApplications) {
                      onOpenMyApplications();
                    }
                  }}
                  className="w-full mt-2 p-3 rounded-2xl bg-teal-950/70 border border-teal-500/40 text-teal-200 flex items-center justify-between text-xs font-bold cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-teal-400" />
                    <span>{language === 'ar' ? 'طلبات التوظيف ومتابعة الحالات' : 'My Applications & Status'}</span>
                  </div>
                  <span className="text-teal-400 font-extrabold text-[11px]">{language === 'ar' ? 'عرض ←' : 'View →'}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-[#00A896] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md"
              >
                <LogIn className="w-4 h-4" />
                <span>{language === 'ar' ? 'تسجيل الدخول بحساب Google' : 'Sign in with Google'}</span>
              </button>
            )}
          </div>

          {/* Mobile Country Selector */}
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-2">
              {t.search.country}:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onSelectCountry?.('all');
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 text-xs rounded-xl text-start flex items-center gap-2 font-semibold ${
                  selectedCountryId === 'all' ? 'bg-[#00A896] text-white font-bold' : 'bg-slate-800 text-slate-300'
                }`}
              >
                <CountryFlag countryId="all" className="w-4 h-4" shape="circle" />
                <span>{t.search.allCountries}</span>
              </button>
              {INITIAL_GCC_COUNTRIES.map(country => (
                <button
                  key={country.id}
                  onClick={() => {
                    onSelectCountry?.(country.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`px-3 py-2 text-xs rounded-xl text-start flex items-center gap-2 font-semibold ${
                    selectedCountryId === country.id ? 'bg-[#00A896] text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  <CountryFlag countryId={country.id} className="w-4 h-4" shape="circle" />
                  <span>{language === 'ar' ? country.nameAr : country.nameEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Authenticated Employer / Admin tools in drawer */}
          {(user && (userProfile?.role === 'employer' || isAdmin)) && (
            <div className="pt-2 border-t border-slate-800 space-y-2">
              {/* Employer Office Button in drawer */}
              <button
                onClick={() => {
                  if (onOpenEmployerOffice) {
                    onOpenEmployerOffice();
                  }
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-teal-950 text-teal-200 font-bold text-xs border border-teal-600/40"
              >
                <Building2 className="w-4 h-4 text-teal-400" />
                <span>{language === 'ar' ? 'مكتب صاحب العمل والتوظيف' : 'Employer Office & Desk'}</span>
              </button>

              {/* Admin Button in drawer - ONLY IF IS ADMIN */}
              {isAdmin && (
                <button
                  onClick={() => {
                    onOpenAdmin();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs border border-amber-400"
                >
                  <Shield className="w-4 h-4" />
                  <span>{language === 'ar' ? 'لوحة تحكم المدير' : 'Admin Dashboard'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
};
