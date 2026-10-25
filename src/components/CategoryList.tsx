import React from 'react';
import { 
  TrendingUp, 
  Headset, 
  Briefcase, 
  HardHat, 
  UtensilsCrossed, 
  HeartPulse, 
  GraduationCap, 
  Laptop, 
  Truck, 
  Wrench, 
  ShieldCheck, 
  ShoppingBag, 
  Home, 
  Globe, 
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JobCategory, AdBanner } from '../types/job';
import { INITIAL_JOB_CATEGORIES } from '../lib/initialData';
import { AdBannerCard } from './Banners/AdBannerCard';

interface CategoryListProps {
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId: string;
  categories?: JobCategory[];
  jobCountsByCategory?: { [categoryId: string]: number };
  banners?: AdBanner[];
  onBannerClick?: (banner: AdBanner) => void;
  onViewAllCategories?: () => void;
  isFullPageView?: boolean;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  TrendingUp,
  Headset,
  Briefcase,
  HardHat,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Laptop,
  Truck,
  Wrench,
  ShieldCheck,
  ShoppingBag,
  Home,
  Globe,
  Layers,
};

export const CategoryList: React.FC<CategoryListProps> = ({
  onSelectCategory,
  selectedCategoryId,
  categories = INITIAL_JOB_CATEGORIES,
  jobCountsByCategory = {},
  banners = [],
  onBannerClick,
  onViewAllCategories,
  isFullPageView = false,
}) => {
  const { language, t } = useLanguage();

  const activeCategories = categories
    .filter(c => c.isActive)
    .sort((a, b) => a.order - b.order);

  // Find relevant category banner
  const categoryBanner = banners.find(b => 
    b.isActive && (
      (b.placement === 'category' && b.categoryId === selectedCategoryId) ||
      (selectedCategoryId !== 'all' && b.placement === 'all_categories') ||
      b.placement === 'global'
    )
  );

  // If Full Page View matching Mockup Screen 5
  if (isFullPageView) {
    const featuredFullPageBanner = categoryBanner || banners.find(b => b.isActive && (b.placement === 'all_categories' || b.placement === 'home'));

    return (
      <section className="py-12 bg-slate-50 min-h-[80vh]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
              {language === 'ar' ? 'الفئات الوظيفية' : 'Job Categories'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ar' ? 'اختر الفئة التي تناسب تخصصك وخبراتك' : 'Choose the category that matches your skills'}
            </p>
          </div>

          {/* Banner in Category Full Page */}
          {featuredFullPageBanner && (
            <div className="max-w-4xl mx-auto">
              <AdBannerCard
                banner={featuredFullPageBanner}
                onBannerClick={onBannerClick}
                variant="wide"
              />
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {activeCategories.map((category) => {
              const IconComponent = ICON_MAP[category.icon] || Briefcase;
              const isSelected = selectedCategoryId === category.id;
              const count = jobCountsByCategory[category.id] ?? 0;

              return (
                <button
                  key={category.id}
                  onClick={() => onSelectCategory(isSelected ? 'all' : category.id)}
                  className={`p-4 rounded-2xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center group ${
                    isSelected
                      ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-102'
                      : 'bg-white hover:bg-slate-50/80 border-slate-200/90 hover:border-teal-400 shadow-xs'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>

                  <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1 mb-0.5">
                    {language === 'ar' ? category.nameAr : category.nameEn}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium">
                    {language === 'ar' ? category.nameEn : category.nameAr}
                  </p>

                  {count > 0 && (
                    <span className="mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200/60">
                      {count} {language === 'ar' ? 'وظيفة' : 'jobs'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

        </div>
      </section>
    );
  }

  // Home section view matching Mockup Screen 1
  return (
    <section className="py-10 bg-white border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Header with "الفئات الشائعة" and "عرض جميع الفئات >>" */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {language === 'ar' ? 'الفئات الشائعة' : 'Popular Categories'}
          </h2>

          {onViewAllCategories && (
            <button
              onClick={onViewAllCategories}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
            >
              <span>{language === 'ar' ? 'عرض جميع الفئات' : 'View All Categories'}</span>
              {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* 4 to 8 popular categories matching Mockup Screen 1 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
          {activeCategories.slice(0, 4).map((category) => {
            const IconComponent = ICON_MAP[category.icon] || Briefcase;
            const isSelected = selectedCategoryId === category.id;

            return (
              <button
                key={category.id}
                onClick={() => onSelectCategory(isSelected ? 'all' : category.id)}
                className={`p-4 rounded-2xl border text-center transition-all duration-150 cursor-pointer flex flex-col items-center justify-center group ${
                  isSelected
                    ? 'bg-white border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-102'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200/80 hover:border-teal-400 shadow-xs'
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-2.5 transition-transform group-hover:scale-110 ${
                  isSelected ? 'bg-teal-600 text-white' : 'bg-teal-50 text-teal-700'
                }`}>
                  <IconComponent className="w-5 h-5" />
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug line-clamp-1">
                  {language === 'ar' ? category.nameAr : category.nameEn}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {language === 'ar' ? category.nameEn : category.nameAr}
                </p>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
};
