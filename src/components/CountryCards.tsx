import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { GCCCountry } from '../types/job';
import { INITIAL_GCC_COUNTRIES } from '../lib/initialData';
import { ArrowLeft, ArrowRight, Building, Coins, ChevronLeft, ChevronRight } from 'lucide-react';
import { CountryFlag } from './CountryFlag';

interface CountryCardsProps {
  onSelectCountry: (countryId: string) => void;
  selectedCountryId: string;
  countries?: GCCCountry[];
  jobCountsByCountry?: { [countryId: string]: number };
  onViewAllCountries?: () => void;
  isFullPageView?: boolean;
}

export const CountryCards: React.FC<CountryCardsProps> = ({
  onSelectCountry,
  selectedCountryId,
  countries = INITIAL_GCC_COUNTRIES,
  jobCountsByCountry = {},
  onViewAllCountries,
  isFullPageView = false,
}) => {
  const { language, t } = useLanguage();

  if (isFullPageView) {
    return (
      <section className="py-12 bg-slate-50 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {language === 'ar' ? 'دول الخليج' : 'GCC Countries'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ar' ? 'اختر الدولة التي تبحث عن وظائف فيها' : 'Select the country where you are looking for jobs'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {countries.map((country) => {
              const isSelected = selectedCountryId === country.id;
              const jobCount = jobCountsByCountry[country.id] ?? 0;

              return (
                <div
                  key={country.id}
                  onClick={() => onSelectCountry(country.id)}
                  className={`group relative rounded-3xl overflow-hidden border cursor-pointer transition-all duration-200 bg-white hover:shadow-xl hover:-translate-y-1 ${
                    isSelected ? 'ring-3 ring-teal-500 border-teal-500 shadow-lg' : 'border-slate-200 shadow-sm'
                  }`}
                >
                  {/* Photo Banner from Mockup Screen 6 */}
                  <div className="h-44 sm:h-52 w-full overflow-hidden bg-slate-100 relative">
                    <img 
                      src={country.imageUrl || '/images/hero.jpg'} 
                      alt={country.nameEn} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent" />
                    
                    <div className="absolute top-3 end-3 drop-shadow-md">
                      <CountryFlag countryId={country.id} className="w-8 h-8" shape="circle" />
                    </div>

                    <span className="absolute bottom-3 start-4 text-xs font-mono font-bold text-teal-300 bg-slate-950/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                      {country.currencyCode}
                    </span>

                    <span className="absolute bottom-3 end-4 text-xs font-bold text-white bg-teal-600/90 px-2 py-0.5 rounded-full backdrop-blur-xs">
                      {jobCount} {t.search.resultsCount}
                    </span>
                  </div>

                  <div className="p-4 text-center">
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                      {language === 'ar' ? country.nameAr : country.nameEn}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      {language === 'ar' ? country.nameEn : country.nameAr}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Artistic Skyline vector footer tagline as in Mockup Screen 6 */}
          <div className="mt-16 text-center pt-8 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-700">
              {language === 'ar' ? 'معاً نحو فرص أفضل في الخليج' : 'Together for better opportunities in the Gulf'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Together for better opportunities in the Gulf
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Home section compact view matching Mockup Screen 1
  return (
    <section className="py-10 bg-slate-50 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with "اختر الدولة" and "جميع دول الخليج >" link */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? 'اختر الدولة' : 'Select Country'}
          </h2>

          {onViewAllCountries && (
            <button
              onClick={onViewAllCountries}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'جميع دول الخليج' : 'All GCC Countries'}</span>
              {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* 6 Country Cards matching Mockup Screen 1 circular/card icons */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 sm:gap-4">
          {countries.map((country) => {
            const isSelected = selectedCountryId === country.id;

            return (
              <button
                key={country.id}
                onClick={() => onSelectCountry(country.id)}
                className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer text-center flex flex-col items-center justify-center group ${
                  isSelected
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-102'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-teal-400 shadow-xs'
                }`}
              >
                {/* Circular Flag Container with SVG Vector */}
                <div className="w-13 h-13 rounded-full p-1 bg-white border border-slate-200/90 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform shadow-xs">
                  <CountryFlag countryId={country.id} className="w-11 h-11" shape="circle" />
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {language === 'ar' ? country.nameAr : country.nameEn}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium mt-0.5">
                  {country.currencyCode}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
