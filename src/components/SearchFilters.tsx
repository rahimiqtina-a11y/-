import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  DollarSign, 
  SlidersHorizontal, 
  RotateCcw, 
  ChevronDown, 
  X,
  Sparkles,
  Layers
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { GCCCountry, JobCategory, SearchFilterState, EmploymentType, ExperienceLevel } from '../types/job';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES } from '../lib/initialData';
import { CountryFlag } from './CountryFlag';

interface SearchFiltersProps {
  filters: SearchFilterState;
  onChangeFilters: (filters: SearchFilterState) => void;
  onExecuteSearch: () => void;
  onResetFilters: () => void;
  countries?: GCCCountry[];
  categories?: JobCategory[];
  totalResultsCount: number;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({
  filters,
  onChangeFilters,
  onExecuteSearch,
  onResetFilters,
  countries = INITIAL_GCC_COUNTRIES,
  categories = INITIAL_JOB_CATEGORIES,
  totalResultsCount,
}) => {
  const { language, t } = useLanguage();
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Active country & currency
  const currentCountry = countries.find(c => c.id === filters.countryId);
  const activeCurrency = currentCountry ? currentCountry.currencyCode : 'QAR';

  // Dynamic cities
  const availableCities = currentCountry ? currentCountry.cities : [];

  const handleCountryChange = (countryId: string) => {
    onChangeFilters({
      ...filters,
      countryId,
      city: 'all',
    });
  };

  const removeFilter = (filterKey: keyof SearchFilterState) => {
    if (filterKey === 'keyword') onChangeFilters({ ...filters, keyword: '' });
    if (filterKey === 'countryId') onChangeFilters({ ...filters, countryId: 'all', city: 'all' });
    if (filterKey === 'city') onChangeFilters({ ...filters, city: 'all' });
    if (filterKey === 'categoryId') onChangeFilters({ ...filters, categoryId: 'all' });
    if (filterKey === 'employmentType') onChangeFilters({ ...filters, employmentType: 'all' });
    if (filterKey === 'experienceLevel') onChangeFilters({ ...filters, experienceLevel: 'all' });
    if (filterKey === 'minSalary' || filterKey === 'maxSalary') {
      onChangeFilters({ ...filters, minSalary: 0, maxSalary: 0 });
    }
  };

  const activeFilterCount = [
    Boolean(filters.keyword.trim()),
    filters.countryId !== 'all',
    filters.city !== 'all',
    filters.categoryId !== 'all',
    filters.employmentType !== 'all',
    filters.experienceLevel !== 'all',
    filters.minSalary > 0 || filters.maxSalary > 0,
    !filters.includeUndisclosed,
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-3xl shadow-2xl shadow-slate-900/15 border border-slate-200/80 p-5 sm:p-7 -mt-12 relative z-20 max-w-4xl mx-auto">
      
      {/* Primary Search Fields Stack matching Mockup Screen 1 */}
      <div className="space-y-3.5">
        
        {/* Field 1: Keyword Input */}
        <div className="relative">
          <div className="absolute start-3.5 top-3.5 text-slate-400">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={filters.keyword}
            onChange={(e) => onChangeFilters({ ...filters, keyword: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onExecuteSearch()}
            placeholder={language === 'ar' ? 'أي وظيفة (المسمى، المهارات، الشركة)...' : 'Any job (title, skills, company)...'}
            className="w-full h-12 ps-10 pe-10 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-900 transition-all outline-none"
          />
          {filters.keyword && (
            <button
              onClick={() => onChangeFilters({ ...filters, keyword: '' })}
              className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Row 2: Country Selector & Category Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Country Selector */}
          <div className="relative">
            <div className="absolute start-3 top-3.5 text-slate-500 pointer-events-none flex items-center">
              <CountryFlag countryId={filters.countryId} className="w-5 h-5" shape="circle" />
            </div>
            <select
              value={filters.countryId}
              onChange={(e) => handleCountryChange(e.target.value)}
              className="w-full h-12 ps-10 pe-8 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-900 transition-all outline-none cursor-pointer appearance-none"
            >
              <option value="all">🌐 {t.search.allCountries}</option>
              {countries.map(c => (
                <option key={c.id} value={c.id}>
                  {language === 'ar' ? c.nameAr : c.nameEn} ({c.currencyCode})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute end-3.5 top-4 pointer-events-none" />
          </div>

          {/* Category Selector */}
          <div className="relative">
            <div className="absolute start-3.5 top-3.5 text-teal-600 pointer-events-none">
              <Layers className="w-4 h-4" />
            </div>
            <select
              value={filters.categoryId}
              onChange={(e) => onChangeFilters({ ...filters, categoryId: e.target.value })}
              className="w-full h-12 ps-10 pe-8 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold text-slate-900 transition-all outline-none cursor-pointer appearance-none"
            >
              <option value="all">📁 {t.search.allCategories}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {language === 'ar' ? cat.nameAr : cat.nameEn}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute end-3.5 top-4 pointer-events-none" />
          </div>

        </div>

        {/* Row 3: Salary Range (Min & Max with Currency) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute start-3 top-3.5 text-[11px] font-bold text-slate-400 pointer-events-none">
              {language === 'ar' ? 'الراتب من' : 'Salary From'}
            </span>
            <input
              type="number"
              min="0"
              step="500"
              value={filters.minSalary || ''}
              onChange={(e) => onChangeFilters({ ...filters, minSalary: Number(e.target.value) || 0 })}
              placeholder="3000"
              className="w-full h-12 ps-20 pe-12 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 text-sm font-bold text-slate-900 outline-none"
            />
            <span className="absolute end-3 top-3.5 text-xs font-mono font-bold text-teal-700 pointer-events-none">
              {activeCurrency}
            </span>
          </div>

          <div className="relative">
            <span className="absolute start-3 top-3.5 text-[11px] font-bold text-slate-400 pointer-events-none">
              {language === 'ar' ? 'الراتب إلى' : 'Salary To'}
            </span>
            <input
              type="number"
              min="0"
              step="500"
              value={filters.maxSalary || ''}
              onChange={(e) => onChangeFilters({ ...filters, maxSalary: Number(e.target.value) || 0 })}
              placeholder="8000"
              className="w-full h-12 ps-20 pe-12 rounded-2xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-teal-500 text-sm font-bold text-slate-900 outline-none"
            />
            <span className="absolute end-3 top-3.5 text-xs font-mono font-bold text-teal-700 pointer-events-none">
              {activeCurrency}
            </span>
          </div>
        </div>

        {/* Row 4: Employment Type Selector */}
        <div className="relative">
          <div className="absolute start-3.5 top-3.5 text-slate-400 pointer-events-none">
            <Briefcase className="w-4 h-4" />
          </div>
          <select
            value={filters.employmentType}
            onChange={(e) => onChangeFilters({ ...filters, employmentType: e.target.value as EmploymentType })}
            className="w-full h-12 ps-10 pe-8 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:border-teal-500 text-sm font-semibold text-slate-900 transition-all outline-none cursor-pointer appearance-none"
          >
            <option value="all">{language === 'ar' ? 'نوع العمل: الكل' : 'Employment Type: All'}</option>
            <option value="full-time">{t.types['full-time']}</option>
            <option value="part-time">{t.types['part-time']}</option>
            <option value="contract">{t.types.contract}</option>
            <option value="remote">{t.types.remote}</option>
            <option value="temporary">{t.types.temporary}</option>
            <option value="internship">{t.types.internship}</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute end-3.5 top-4 pointer-events-none" />
        </div>

        {/* CTA: Big Teal Search Button matching Mockup */}
        <button
          onClick={onExecuteSearch}
          className="w-full h-13 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-101 active:scale-99 cursor-pointer"
        >
          <Search className="w-5 h-5 stroke-[2.5]" />
          <span>{t.search.searchButton}</span>
        </button>

        {/* Reset Filters Link Button */}
        <div className="text-center pt-1">
          <button
            onClick={onResetFilters}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 transition-colors py-1 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.search.clearFilters}</span>
          </button>
        </div>

      </div>

      {/* Advanced Options Toggle Drawer for City and Experience */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-slate-600 hover:text-teal-700 font-semibold cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600" />
          <span>{language === 'ar' ? 'خيارات إضافية (المدينة، الخبرة)' : 'More options (City, Experience)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
        </button>

        {/* Undisclosed Salary Toggle */}
        <label className="flex items-center gap-2 cursor-pointer text-slate-600 font-medium">
          <input
            type="checkbox"
            checked={filters.includeUndisclosed}
            onChange={(e) => onChangeFilters({ ...filters, includeUndisclosed: e.target.checked })}
            className="w-3.5 h-3.5 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
          />
          <span>{t.search.includeUndisclosed}</span>
        </label>
      </div>

      {/* Advanced Filters Expandable Drawer */}
      {showAdvanced && (
        <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/60 p-3.5 rounded-2xl">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {t.search.city}
            </label>
            <select
              value={filters.city}
              onChange={(e) => onChangeFilters({ ...filters, city: e.target.value })}
              disabled={filters.countryId === 'all'}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 disabled:opacity-50"
            >
              <option value="all">🏙️ {t.search.allCities}</option>
              {availableCities.map(city => (
                <option key={city} value={city}>
                  {currentCountry?.citiesAr?.[city] && language === 'ar' 
                    ? `${currentCountry.citiesAr[city]} (${city})` 
                    : city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              {t.search.experienceLevel}
            </label>
            <select
              value={filters.experienceLevel}
              onChange={(e) => onChangeFilters({ ...filters, experienceLevel: e.target.value as ExperienceLevel })}
              className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800"
            >
              <option value="all">{t.experience.all}</option>
              <option value="entry">{t.experience.entry}</option>
              <option value="mid">{t.experience.mid}</option>
              <option value="senior">{t.experience.senior}</option>
              <option value="executive">{t.experience.executive}</option>
            </select>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {activeFilterCount > 0 && (
        <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400 me-1">
            {t.search.activeFilters}:
          </span>

          {filters.keyword && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs">
              <span>"{filters.keyword}"</span>
              <button onClick={() => removeFilter('keyword')} className="hover:text-teal-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.countryId !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <span>{currentCountry ? (language === 'ar' ? currentCountry.nameAr : currentCountry.nameEn) : filters.countryId}</span>
              <button onClick={() => removeFilter('countryId')} className="hover:text-slate-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {filters.categoryId !== 'all' && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <span>
                {categories.find(c => c.id === filters.categoryId)?.[language === 'ar' ? 'nameAr' : 'nameEn'] || filters.categoryId}
              </span>
              <button onClick={() => removeFilter('categoryId')} className="hover:text-slate-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {(filters.minSalary > 0 || filters.maxSalary > 0) && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold">
              <span>{filters.minSalary} - {filters.maxSalary || '∞'} {activeCurrency}</span>
              <button onClick={() => removeFilter('minSalary')} className="hover:text-slate-950">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}

    </div>
  );
};
