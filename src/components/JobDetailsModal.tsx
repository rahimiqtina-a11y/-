import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Building, 
  DollarSign, 
  Briefcase, 
  Clock, 
  Calendar, 
  Share2, 
  Check, 
  Phone, 
  Mail, 
  ExternalLink, 
  MessageCircle, 
  Sparkles, 
  Eye, 
  Award, 
  GraduationCap, 
  Gift, 
  Heart,
  Plane,
  HeartPulse,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ArrowLeft,
  FileText,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { JobAdvertisement } from '../types/job';
import { INITIAL_GCC_COUNTRIES } from '../lib/initialData';
import { CountryFlag } from './CountryFlag';

interface JobDetailsModalProps {
  job: JobAdvertisement | null;
  onClose: () => void;
  onOpenImage: (imageUrl: string) => void;
  onApplyJob?: (job: JobAdvertisement) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (jobId: string) => void;
}

export const JobDetailsModal: React.FC<JobDetailsModalProps> = ({ 
  job, 
  onClose, 
  onOpenImage,
  onApplyJob,
  isFavorite = false,
  onToggleFavorite
}) => {
  const { language, toggleLanguage, t } = useLanguage();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'requirements' | 'duties'>('requirements');

  if (!job) return null;

  const country = INITIAL_GCC_COUNTRIES.find(c => c.id === job.countryId);
  const countryFlag = country ? country.flagEmoji : '🌐';
  const countryName = language === 'ar' ? (job.countryNameAr || country?.nameAr) : (job.countryNameEn || country?.nameEn);
  const cityName = (language === 'ar' && country?.citiesAr?.[job.city]) 
    ? country.citiesAr[job.city] 
    : job.city;

  const title = (language === 'ar' ? job.titleAr : job.titleEn) || job.titleAr || job.titleEn;
  const secondaryTitle = language === 'ar' ? job.titleEn : job.titleAr;
  const company = (language === 'ar' ? job.companyNameAr : job.companyNameEn) || job.companyNameAr || job.companyNameEn || (language === 'ar' ? 'جهة عمل معتمدة' : 'Verified Employer');
  const description = (language === 'ar' ? job.descriptionAr : job.descriptionEn) || job.descriptionAr || job.descriptionEn;

  const formattedSalary = job.salaryDisclosed
    ? `${job.salaryCurrency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}`
    : t.jobCard.notDisclosed;

  const deadlineStr = job.applicationDeadline || '2026/06/30';

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?jobId=${job.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - ${company}`,
          text: `Check out this job opportunity on Gulf Jobs: ${title}`,
          url: shareUrl,
        });
        return;
      } catch (err) {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {}
  };

  const getWhatsAppLink = () => {
    if (!job.contactWhatsapp) return null;
    const cleanNumber = job.contactWhatsapp.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      language === 'ar'
        ? `السلام عليكم، أود التقديم على وظيفة: "${title}" المعلن عنها عبر منصة وظائف الخليج.`
        : `Hello, I would like to apply for the position: "${title}" found on Gulf Jobs.`
    );
    return `https://wa.me/${cleanNumber}?text=${message}`;
  };

  const whatsappLink = getWhatsAppLink();

  // Split description into sentences/bullets for duties & requirements tabs
  const descriptionLines = description.split('\n').filter(Boolean);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[94vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar matching Mockup Screen 3 */}
        <div className="bg-white border-b border-slate-100 px-5 py-3.5 flex items-center justify-between text-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
              title={language === 'ar' ? 'الرجوع' : 'Back'}
            >
              {language === 'ar' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base text-slate-900">
                {language === 'ar' ? 'وظائف الخليج' : 'Gulf Jobs'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-bold border border-teal-200">
                GCC
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              {language === 'ar' ? 'EN' : 'عربي'}
            </button>

            <button
              onClick={() => onToggleFavorite?.(job.id)}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-rose-500 transition-colors"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full hover:bg-slate-100 text-slate-500 hover:text-teal-600 transition-colors relative"
            >
              {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Share2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-7 space-y-6">
          
          {/* Main Photo Banner with Featured Tag */}
          <div className="relative rounded-3xl overflow-hidden bg-slate-900 h-52 sm:h-64 border border-slate-200">
            <img 
              src={job.imageUrl || '/src/assets/images/gcc_skyline_hero_1792581715787.jpg'} 
              alt={title} 
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
            
            {job.isFeatured && (
              <span className="absolute top-4 start-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#00A896] text-white text-xs font-bold shadow-md">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                <span>Featured</span>
              </span>
            )}

            {job.imageUrl && (
              <button
                onClick={() => onOpenImage(job.imageUrl!)}
                className="absolute bottom-4 end-4 px-3 py-1.5 rounded-xl bg-slate-950/80 hover:bg-slate-950 text-white text-xs font-semibold backdrop-blur-sm flex items-center gap-1.5 shadow-lg"
              >
                <Eye className="w-4 h-4 text-teal-400" />
                <span>{t.jobCard.clickToEnlarge}</span>
              </button>
            )}
          </div>

          {/* Title & Employer Block matching Mockup Screen 3 */}
          <div className="text-center sm:text-start space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {title}
            </h1>
            {secondaryTitle && secondaryTitle !== title && (
              <p className="text-sm sm:text-base font-bold text-teal-700">
                {secondaryTitle}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs sm:text-sm text-slate-600">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-teal-600" />
                <span>{company}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" />
                <CountryFlag countryId={job.countryId} className="w-4 h-4" shape="circle" />
                <span>{countryName} - {cityName}</span>
              </span>
            </div>
          </div>

          {/* 4 Key Spec Cards in 4-column Grid matching Mockup Screen 3 */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
              <DollarSign className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-xs font-black text-slate-900 font-mono">
                {formattedSalary}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {country?.currencyCode || 'QAR'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
              <Briefcase className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-xs font-bold text-slate-900">
                {t.types[job.employmentType as keyof typeof t.types] || job.employmentType}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'ar' ? 'نوع الدوام' : 'Employment'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
              <Award className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-xs font-bold text-slate-900">
                {t.experience[job.experienceLevel as keyof typeof t.experience] || job.experienceLevel}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'ar' ? 'الخبرة المطلوبة' : 'Experience'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-center flex flex-col items-center justify-center">
              <GraduationCap className="w-5 h-5 text-teal-600 mb-1" />
              <span className="text-xs font-bold text-slate-900 line-clamp-1">
                {job.educationLevel || (language === 'ar' ? 'مؤهل جامعي' : 'Degree')}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {language === 'ar' ? 'المؤهل التعليمي' : 'Education'}
              </span>
            </div>
          </div>

          {/* Section: نبذة عن الوظيفة */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>{language === 'ar' ? 'نبذة عن الوظيفة' : 'About the Job'}</span>
            </h3>

            {/* Toggle Tabs: المتطلبات vs المهام as in Mockup Screen 3 */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 max-w-sm">
              <button
                onClick={() => setActiveTab('requirements')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'requirements' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'المتطلبات' : 'Requirements'}
              </button>
              <button
                onClick={() => setActiveTab('duties')}
                className={`py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                  activeTab === 'duties' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                {language === 'ar' ? 'المهام' : 'Responsibilities'}
              </button>
            </div>

            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 text-xs sm:text-sm text-slate-700 leading-relaxed space-y-2">
              <p className="font-medium text-slate-800">
                {description}
              </p>

              {/* Bullet Points */}
              <ul className="space-y-2 pt-2 text-slate-700">
                {job.skills ? (
                  job.skills.split(/[,،]+/).map((skill, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>{skill.trim()}</span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>{language === 'ar' ? 'خبرة في مجال التخصص وسوق العمل الخليجي' : 'Relevant experience in GCC market'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>{language === 'ar' ? 'مهارات تواصل ممتازة والقدرة على العمل ضمن فريق' : 'Excellent communication and teamwork skills'}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 shrink-0" />
                      <span>{language === 'ar' ? 'إجادة اللغتين العربية والإنجليزية' : 'Bilingual proficiency in Arabic & English'}</span>
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>

          {/* Section: المزايا (Benefits) matching Mockup Screen 3 */}
          <div className="space-y-3">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-teal-500" />
              <span>{language === 'ar' ? 'المزايا الوظيفية' : 'Benefits & Perks'}</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-center flex flex-col items-center justify-center">
                <Gift className="w-5 h-5 text-teal-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'ar' ? 'بدلات وحوافز' : 'Allowances'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-center flex flex-col items-center justify-center">
                <Plane className="w-5 h-5 text-teal-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'ar' ? 'تذاكر سفر' : 'Flight Tickets'}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-200/80 text-center flex flex-col items-center justify-center">
                <HeartPulse className="w-5 h-5 text-teal-600 mb-1" />
                <span className="text-xs font-bold text-slate-900">
                  {language === 'ar' ? 'تأمين صحي' : 'Healthcare'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Direct Resume Application to Employer Desk & Share */}
          <div className="pt-2 space-y-3">
            {/* Primary Action: Direct Application with CV */}
            <button
              onClick={() => {
                if (onApplyJob) {
                  onApplyJob(job);
                }
              }}
              className="w-full h-14 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2.5 transition-all hover:scale-101 cursor-pointer"
            >
              <FileText className="w-5 h-5" />
              <span>{language === 'ar' ? 'التقديم على الوظيفة وإرسال السيرة الذاتية' : 'Apply for Job & Send Resume'}</span>
            </button>

            {/* Employer Privacy Guarantee Note */}
            <div className="flex items-center justify-center gap-2 text-[11px] text-teal-800 bg-teal-50/90 py-2.5 px-3 rounded-xl border border-teal-200">
              <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
              <span>
                {language === 'ar' 
                  ? 'خصوصية صاحب العمل: يتم استلام السيرة الذاتية بمكتب التوظيف مباشرة دون إظهار أرقام التواصل'
                  : 'Employer Privacy: Resumes are delivered directly to employer desk without public contact numbers'}
              </span>
            </div>

            {/* Share Button */}
            <button
              onClick={handleShare}
              className="w-full h-12 rounded-2xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-teal-600" />
              <span>{copied ? t.jobDetails.linkCopied : (language === 'ar' ? 'مشاركة الإعلان' : 'Share Vacancy')}</span>
            </button>
          </div>

          {/* Bottom Deadline Note */}
          <div className="text-center text-xs text-slate-400 pt-1">
            <span>{language === 'ar' ? `آخر موعد للتقديم: ${deadlineStr}` : `Application Deadline: ${deadlineStr}`}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
