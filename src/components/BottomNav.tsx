import React from 'react';
import { Home, Briefcase, Layers, Users, User, Shield } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export type BottomNavTab = 'home' | 'jobs' | 'job_seekers' | 'categories' | 'countries';

interface BottomNavProps {
  currentTab: BottomNavTab;
  onNavigateTab: (tab: BottomNavTab) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onNavigateTab,
  onOpenProfile,
  onOpenAdmin,
}) => {
  const { language } = useLanguage();
  const { user, isAdmin, userProfile } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 py-1.5 px-2 shadow-lg">
      <div className="grid grid-cols-5 gap-1 text-center">
        
        {/* الرئيسية */}
        <button
          onClick={() => onNavigateTab('home')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-[#00A896] font-black' : 'text-slate-500'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {language === 'ar' ? 'الرئيسية' : 'Home'}
          </span>
        </button>

        {/* الوظائف */}
        <button
          onClick={() => onNavigateTab('jobs')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'jobs' ? 'text-[#00A896] font-black' : 'text-slate-500'
          }`}
        >
          <Briefcase className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {language === 'ar' ? 'الوظائف' : 'Jobs'}
          </span>
        </button>

        {/* الباحثون عن عمل */}
        <button
          onClick={() => onNavigateTab('job_seekers')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'job_seekers' ? 'text-[#00A896] font-black' : 'text-slate-500'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {language === 'ar' ? 'الباحثون' : 'Talent'}
          </span>
        </button>

        {/* الفئات */}
        <button
          onClick={() => onNavigateTab('categories')}
          className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            currentTab === 'categories' ? 'text-[#00A896] font-black' : 'text-slate-500'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] leading-tight">
            {language === 'ar' ? 'الفئات' : 'Categories'}
          </span>
        </button>

        {/* حسابي أو الإدارة */}
        <button
          onClick={() => {
            if (isAdmin) {
              onOpenAdmin();
            } else {
              onOpenProfile();
            }
          }}
          className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-teal-600 transition-colors cursor-pointer"
        >
          {user ? (
            user.photoURL ? (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-5 h-5 rounded-full object-cover mb-0.5 border border-teal-500"
              />
            ) : (
              <User className="w-5 h-5 mb-0.5 text-teal-600" />
            )
          ) : (
            <User className="w-5 h-5 mb-0.5 text-slate-400" />
          )}
          <span className="text-[10px] leading-tight font-bold text-slate-700">
            {isAdmin ? (language === 'ar' ? 'الإدارة' : 'Admin') : (language === 'ar' ? 'حسابي' : 'Account')}
          </span>
        </button>

      </div>
    </div>
  );
};
