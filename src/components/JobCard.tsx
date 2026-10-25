import React from 'react';
import { 
  MapPin, 
  Building, 
  Calendar, 
  DollarSign, 
  Briefcase, 
  Sparkles, 
  Eye, 
  Image as ImageIcon, 
  Heart,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JobAdvertisement } from '../types/job';
import { INITIAL_GCC_COUNTRIES } from '../lib/initialData';
import { CountryFlag } from './CountryFlag';

interface JobCardProps {
  job: JobAdvertisement;
  onViewDetails: (job: JobAdvertisement) => void;
  onOpenImage?: (imageUrl: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({ 
  job, 
  onViewDetails, 
  onOpenImage,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { language, t } = useLanguage();

  const country = INITIAL_GCC_COUNTRIES.find(c => c.id === job.countryId);
  const countryName = language === 'ar' ? (job.countryNameAr || country?.nameAr) : (job.countryNameEn || country?.nameEn);
  const cityName = (language === 'ar' && country?.citiesAr?.[job.city]) 
    ? country.citiesAr[job.city] 
    : job.city;

  const title = (language === 'ar' ? job.titleAr : job.titleEn) || job.titleAr || job.titleEn;
  const secondaryTitle = language === 'ar' ? job.titleEn : job.titleAr;
  const company = (language === 'ar' ? job.companyNameAr : job.companyNameEn) || job.companyNameAr || job.companyNameEn || (language === 'ar' ? 'جهة عمل معتمدة' : 'Verified Employer');

  const formattedSalary = job.salaryDisclosed
    ? `${job.salaryCurrency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
    : t.jobCard.notDisclosed;

  const dateStr = job.publishedAt ? new Date(job.publishedAt).toLocaleDateString('en-CA') : '';

  return (
    <div className={`relative bg-white rounded-3xl border transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:shadow-xl hover:-translate-y-1 ${
      job.isFeatured 
        ? 'border-teal-400 shadow-md ring-1 ring-teal-400/30' 
        : 'border-slate-200/90 shadow-sm hover:border-teal-400'
    }`}>
      
      {/* Top Bar: Featured Badge & Favorite Heart */}
      <div className="px-5 pt-4 pb-1 flex items-center justify-between">
        {job.isFeatured ? (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#00A896] text-white text-xs font-bold shadow-xs">
            <Sparkles className="w-3 h-3 fill-current" />
            <span>Featured</span>
          </span>
        ) : job.hasImageOnly ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-200">
            <ImageIcon className="w-3 h-3" />
            <span>{t.jobCard.imageOnlyNotice}</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <CountryFlag countryId={job.countryId} className="w-3.5 h-3.5" shape="circle" />
            <span>{countryName}</span>
          </span>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(job.id);
          }}
          className="p-1.5 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>
      </div>

      {/* Main Body */}
      <div className="px-5 py-3 flex-1 flex flex-col justify-between">
        
        {/* Title, Company & Logo matching Mockup Screen 1 & 2 */}
        <div className="flex items-start gap-3.5 mb-3">
          {job.companyLogoUrl ? (
            <img 
              src={job.companyLogoUrl} 
              alt={company} 
              className="w-13 h-13 rounded-2xl object-contain bg-slate-50 border border-slate-200 shrink-0 p-1"
            />
          ) : (
            <div className="w-13 h-13 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center shrink-0 text-teal-800 font-extrabold text-lg">
              {company.charAt(0)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h3 
              onClick={() => onViewDetails(job)}
              className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-1 leading-snug cursor-pointer"
            >
              {title}
            </h3>
            {secondaryTitle && secondaryTitle !== title && (
              <p className="text-xs font-bold text-teal-800 line-clamp-1 mt-0.5">
                {secondaryTitle}
              </p>
            )}
            <p className="text-xs font-semibold text-slate-500 line-clamp-1 mt-1">
              {company}
            </p>
          </div>
        </div>

        {/* Ad Image Preview if image only or has image */}
        {job.imageUrl && (
          <div className="relative mb-3 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 max-h-40">
            <img 
              src={job.imageUrl} 
              alt={title} 
              className="w-full h-36 object-cover group-hover:scale-102 transition-transform duration-300" 
            />
            {onOpenImage && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenImage(job.imageUrl!);
                }}
                className="absolute bottom-2 end-2 px-2.5 py-1 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-medium backdrop-blur-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-teal-400" />
                <span>{t.jobCard.clickToEnlarge}</span>
              </button>
            )}
          </div>
        )}

        {/* Key Attributes List matching Mockup Screen 2 */}
        <div className="space-y-1.5 text-xs text-slate-600 my-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{countryName} - {cityName}</span>
          </div>

          <div className="flex items-center gap-2 font-bold text-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span>{formattedSalary}</span>
          </div>

          <div className="flex items-center justify-between text-slate-500 pt-1">
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{t.types[job.employmentType as keyof typeof t.types] || job.employmentType}</span>
            </div>
            {dateStr && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                <Calendar className="w-3 h-3" />
                <span>{dateStr}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Button: "عرض التفاصيل" matching Mockup Screen 1 & 2 */}
      <div className="px-5 pb-5 pt-1">
        <button
          onClick={() => onViewDetails(job)}
          className="w-full h-11 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all hover:scale-101 cursor-pointer"
        >
          <span>{t.jobCard.viewDetails}</span>
          {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

    </div>
  );
};
