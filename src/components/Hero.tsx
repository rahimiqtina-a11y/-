import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Sparkles, MapPin, CheckCircle2, MessageSquare } from 'lucide-react';
import gccSkylineHero from '../assets/images/gcc_skyline_hero_1792581715787.jpg';

interface HeroProps {
  realPublishedCount?: number;
}

export const Hero: React.FC<HeroProps> = ({ realPublishedCount }) => {
  const { language, t } = useLanguage();

  return (
    <section className="relative overflow-hidden text-white pt-14 pb-20 border-b border-slate-800 bg-slate-950">
      {/* Real GCC Skyline Night Panorama from user mockup */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-102 transition-transform duration-700"
        style={{
          backgroundImage: `url(${gccSkylineHero}), url('/images/hero.jpg')`,
        }}
      />
      
      {/* Gradient dark overlay - balanced to keep skyline towers vividly visible while ensuring text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/65 via-slate-950/45 to-slate-950/85" />
      <div className="absolute inset-0 bg-radial-[at_center] from-teal-500/10 via-transparent to-slate-950/60" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* GCC Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-teal-500/40 text-teal-300 text-xs sm:text-sm font-semibold mb-5 shadow-lg backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>{language === 'ar' ? 'المنصة الموحدة للوظائف الخليجية' : 'Unified GCC Employment Gateway'}</span>
        </div>

        {/* Headlines */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white mb-3 leading-tight drop-shadow-md">
          {language === 'ar' ? 'ابحث عن وظيفتك القادمة في الخليج' : 'Find Your Next Job in the Gulf'}
        </h1>

        <p className="text-lg sm:text-2xl font-bold text-teal-300 mb-3 tracking-wide drop-shadow-sm font-sans">
          {language === 'ar' ? 'Find Your Next Job in the Gulf' : 'ابحث عن وظيفتك القادمة في الخليج'}
        </p>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-200 mb-6 leading-relaxed font-normal opacity-90">
          {language === 'ar' 
            ? 'اكتشف فرص العمل في جميع دول مجلس التعاون الخليجي' 
            : 'Discover job opportunities across all GCC countries'}
        </p>

        {/* Real Grounded GCC Badges */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs sm:text-sm text-slate-200">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md">
            <MapPin className="w-4 h-4 text-teal-400" />
            <span className="font-semibold">{t.hero.statCountries}</span>
          </div>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold">{t.hero.statVerified}</span>
          </div>

          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/70 border border-slate-700/60 backdrop-blur-md">
            <MessageSquare className="w-4 h-4 text-teal-400" />
            <span className="font-semibold">{t.hero.statDirect}</span>
          </div>

          {typeof realPublishedCount === 'number' && realPublishedCount > 0 && (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 border border-teal-500/50 text-teal-300 font-bold backdrop-blur-md">
              <span>{realPublishedCount} {t.search.resultsCount}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
