import React from 'react';
import { ExternalLink, Sparkles, Megaphone, Zap, Code, ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AdBanner } from '../../types/job';

interface AdBannerCardProps {
  banner: AdBanner;
  onBannerClick?: (banner: AdBanner) => void;
  className?: string;
  variant?: 'wide' | 'compact';
}

export const AdBannerCard: React.FC<AdBannerCardProps> = ({
  banner,
  onBannerClick,
  className = '',
  variant = 'wide',
}) => {
  const { language } = useLanguage();

  if (!banner || !banner.isActive) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBannerClick) {
      onBannerClick(banner);
    }
    if (banner.targetUrl && banner.targetUrl !== 'https://') {
      window.open(banner.targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const title = language === 'ar' ? (banner.titleAr || banner.titleEn) : (banner.titleEn || banner.titleAr);
  const subtitle = language === 'ar' ? (banner.subtitleAr || banner.subtitleEn) : (banner.subtitleEn || banner.subtitleAr);
  const cta = language === 'ar' 
    ? (banner.callToActionAr || 'زيارة الموقع الإلكتروني') 
    : (banner.callToActionEn || 'Visit Website');
  const badge = language === 'ar'
    ? (banner.badgeTextAr || 'إعلان ممول')
    : (banner.badgeTextEn || 'Sponsored');

  const getSafeHostname = (urlStr: string) => {
    try {
      const formatted = urlStr.startsWith('http') ? urlStr : `https://${urlStr}`;
      return new URL(formatted).hostname;
    } catch {
      return '';
    }
  };

  // FORMAT 1: CUSTOM CODE / EMBED AD (HTML / Script / Iframe)
  if (banner.bannerType === 'code' && banner.customCode) {
    return (
      <div
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl border border-purple-200/80 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[10px] font-black tracking-wide flex items-center gap-1 border border-purple-200">
              <Code className="w-3 h-3 text-purple-600" />
              <span>{language === 'ar' ? 'إعلان كود ممول' : 'Sponsored Embed'}</span>
            </span>
            {banner.categoryNameAr && (
              <span className="text-[11px] text-purple-700 font-bold">
                {language === 'ar' ? banner.categoryNameAr : banner.categoryNameEn}
              </span>
            )}
          </div>
          {banner.targetUrl && banner.targetUrl !== 'https://' && (
            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
              <span>{getSafeHostname(banner.targetUrl)}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </span>
          )}
        </div>

        {/* HTML / Script Code Container */}
        <div 
          className="w-full flex justify-center items-center overflow-x-auto min-h-[90px] py-1"
          dangerouslySetInnerHTML={{ __html: banner.customCode }} 
        />
      </div>
    );
  }

  // FORMAT 2: SMART LINK & INTERACTIVE CARD (WITHOUT REQUIRING IMAGE)
  if (banner.bannerType === 'smart_link') {
    const themeStyles = {
      teal_navy: 'from-[#0A192F] via-[#0D2847] to-[#0A192F] border-teal-400/40 text-teal-300',
      gold_dark: 'from-[#121212] via-[#241B08] to-[#121212] border-amber-500/50 text-amber-300',
      emerald_modern: 'from-[#031B15] via-[#063328] to-[#031B15] border-emerald-400/40 text-emerald-300',
      purple_royal: 'from-[#140B27] via-[#241344] to-[#140B27] border-purple-400/40 text-purple-300',
      crimson_bold: 'from-[#23080F] via-[#380E1B] to-[#23080F] border-rose-400/40 text-rose-300',
    }[banner.cardTheme || 'teal_navy'];

    return (
      <div
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-3xl border bg-linear-to-r ${themeStyles} text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${className}`}
      >
        {/* Glow ambient effects */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between p-6 sm:p-7 gap-5">
          <div className="space-y-2 text-start flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white border border-white/20 text-xs font-black shadow-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{badge}</span>
              </span>

              {banner.categoryNameAr && (
                <span className="text-xs font-bold text-slate-300">
                  {language === 'ar' ? banner.categoryNameAr : banner.categoryNameEn}
                </span>
              )}

              {banner.smartLinkConfig?.utmCampaign && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-black/30 font-mono text-slate-300">
                  #{banner.smartLinkConfig.utmCampaign}
                </span>
              )}
            </div>

            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight group-hover:text-amber-200 transition-colors">
              {title}
            </h3>

            {subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>

          <div className="shrink-0 self-start sm:self-center">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-slate-950 font-black text-xs sm:text-sm shadow-xl transition-all group-hover:bg-amber-300 group-hover:scale-105 cursor-pointer"
            >
              <span>{cta}</span>
              <ArrowUpRight className="w-4 h-4 text-slate-950" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FORMAT 3: CLASSIC IMAGE BANNER (WIDE OR COMPACT)
  if (variant === 'compact') {
    return (
      <div
        onClick={handleClick}
        className={`group relative overflow-hidden rounded-2xl border border-teal-200/80 bg-linear-to-r from-slate-900 via-teal-950 to-slate-900 text-white shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${className}`}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 sm:p-5 gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            {banner.imageUrl && (
              <img
                src={banner.imageUrl}
                alt={title}
                className="w-14 h-14 rounded-xl object-cover shrink-0 border border-teal-500/30 group-hover:scale-105 transition-transform"
              />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-black tracking-wide flex items-center gap-1">
                  <Megaphone className="w-3 h-3 text-teal-400" />
                  <span>{badge}</span>
                </span>
                {banner.categoryNameAr && (
                  <span className="text-[11px] text-teal-200 font-bold truncate">
                    {language === 'ar' ? banner.categoryNameAr : banner.categoryNameEn}
                  </span>
                )}
              </div>
              <h4 className="font-extrabold text-sm sm:text-base text-white truncate group-hover:text-teal-300 transition-colors">
                {title}
              </h4>
              {subtitle && (
                <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="shrink-0 self-end sm:self-center">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs shadow-md transition-all group-hover:scale-102">
              <span>{cta}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative overflow-hidden rounded-3xl border border-teal-300/60 bg-linear-to-r from-[#0A192F] via-[#0F3460] to-[#0A192F] text-white shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${className}`}
    >
      {/* Background Graphic Accents */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between p-6 sm:p-8 gap-6">
        
        {/* Banner Details */}
        <div className="space-y-3 max-w-2xl text-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>{badge}</span>
            {banner.categoryNameAr && (
              <>
                <span>•</span>
                <span className="text-teal-200">
                  {language === 'ar' ? banner.categoryNameAr : banner.categoryNameEn}
                </span>
              </>
            )}
          </div>

          <h3 className="text-lg sm:text-2xl font-black text-white leading-tight group-hover:text-teal-200 transition-colors">
            {title}
          </h3>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {subtitle}
            </p>
          )}

          <div className="pt-1 flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 group-hover:bg-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-md transition-all group-hover:scale-102">
              <span>{cta}</span>
              <ExternalLink className="w-4 h-4" />
            </span>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <span>{language === 'ar' ? 'يفتح في نافذة جديدة' : 'Opens in new tab'}</span>
            </span>
          </div>
        </div>

        {/* Banner Visual / Media */}
        {banner.imageUrl && (
          <div className="w-full md:w-72 lg:w-80 h-44 sm:h-48 rounded-2xl overflow-hidden shrink-0 shadow-xl border-2 border-slate-700/60 relative group-hover:border-teal-400/60 transition-colors">
            <img
              src={banner.imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-linear-to-t from-slate-950/60 via-transparent to-transparent" />
            {banner.targetUrl && (
              <div className="absolute bottom-2.5 start-2.5 px-2 py-0.5 rounded-md bg-slate-900/80 backdrop-blur-xs text-[10px] text-teal-300 font-bold border border-slate-700 flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                <span>{getSafeHostname(banner.targetUrl)}</span>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
