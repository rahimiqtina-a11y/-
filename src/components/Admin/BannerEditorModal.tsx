import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  ExternalLink, 
  Image as ImageIcon, 
  Sparkles, 
  Check, 
  AlertCircle, 
  Megaphone,
  Globe,
  Layers,
  Eye,
  Camera,
  Code,
  Link2,
  Palette,
  Zap,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AdBanner, BannerPlacement, BannerType, BannerTheme, JobCategory } from '../../types/job';
import { INITIAL_JOB_CATEGORIES } from '../../lib/initialData';
import { uploadJobImage } from '../../lib/firebase';

interface BannerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveBanner: (bannerData: Partial<AdBanner>) => Promise<void>;
  initialBanner?: AdBanner | null;
  categories?: JobCategory[];
}

export const BannerEditorModal: React.FC<BannerEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveBanner,
  initialBanner,
  categories = INITIAL_JOB_CATEGORIES,
}) => {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [bannerType, setBannerType] = useState<BannerType>('image');
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [subtitleAr, setSubtitleAr] = useState('');
  const [subtitleEn, setSubtitleEn] = useState('');
  const [callToActionAr, setCallToActionAr] = useState('زيارة الموقع الإلكتروني');
  const [callToActionEn, setCallToActionEn] = useState('Visit Website');
  const [targetUrl, setTargetUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [cardTheme, setCardTheme] = useState<BannerTheme>('teal_navy');
  const [badgeTextAr, setBadgeTextAr] = useState('إعلان ممول');
  const [badgeTextEn, setBadgeTextEn] = useState('Sponsored Ad');
  const [placement, setPlacement] = useState<BannerPlacement>('home');
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id || 'sales-marketing');
  const [isActive, setIsActive] = useState(true);
  const [order, setOrder] = useState(1);

  // Smart Link UTM Builder State
  const [utmSource, setUtmSource] = useState('gulfjobs');
  const [utmMedium, setUtmMedium] = useState('banner');
  const [utmCampaign, setUtmCampaign] = useState('promo_gcc');
  const [appDeepLink, setAppDeepLink] = useState('');

  // Upload & UI State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (initialBanner) {
      setBannerType(initialBanner.bannerType || (initialBanner.customCode ? 'code' : 'image'));
      setTitleAr(initialBanner.titleAr || '');
      setTitleEn(initialBanner.titleEn || '');
      setSubtitleAr(initialBanner.subtitleAr || '');
      setSubtitleEn(initialBanner.subtitleEn || '');
      setCallToActionAr(initialBanner.callToActionAr || 'زيارة الموقع الإلكتروني');
      setCallToActionEn(initialBanner.callToActionEn || 'Visit Website');
      setTargetUrl(initialBanner.targetUrl || '');
      setImageUrl(initialBanner.imageUrl || '');
      setCustomCode(initialBanner.customCode || '');
      setCardTheme(initialBanner.cardTheme || 'teal_navy');
      setBadgeTextAr(initialBanner.badgeTextAr || 'إعلان ممول');
      setBadgeTextEn(initialBanner.badgeTextEn || 'Sponsored Ad');
      setPlacement(initialBanner.placement || 'home');
      setCategoryId(initialBanner.categoryId || categories[0]?.id || 'sales-marketing');
      setIsActive(initialBanner.isActive ?? true);
      setOrder(initialBanner.order || 1);

      if (initialBanner.smartLinkConfig) {
        setUtmSource(initialBanner.smartLinkConfig.utmSource || 'gulfjobs');
        setUtmMedium(initialBanner.smartLinkConfig.utmMedium || 'banner');
        setUtmCampaign(initialBanner.smartLinkConfig.utmCampaign || 'promo_gcc');
        setAppDeepLink(initialBanner.smartLinkConfig.appDeepLink || '');
      }
    } else {
      setBannerType('image');
      setTitleAr('');
      setTitleEn('');
      setSubtitleAr('');
      setSubtitleEn('');
      setCallToActionAr('زيارة الموقع الإلكتروني');
      setCallToActionEn('Visit Website');
      setTargetUrl('https://');
      setImageUrl('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80');
      setCustomCode('');
      setCardTheme('teal_navy');
      setBadgeTextAr('إعلان ممول');
      setBadgeTextEn('Sponsored Ad');
      setPlacement('home');
      setCategoryId(categories[0]?.id || 'sales-marketing');
      setIsActive(true);
      setOrder(1);
      setUtmSource('gulfjobs');
      setUtmMedium('banner');
      setUtmCampaign('promo_gcc');
      setAppDeepLink('');
    }
    setValidationError(null);
    setUploadError(null);
  }, [initialBanner, isOpen, categories]);

  if (!isOpen) return null;

  const handleGenerateSmartUrl = () => {
    if (!targetUrl.trim() || targetUrl.trim() === 'https://') return;
    try {
      let base = targetUrl.trim();
      if (!base.startsWith('http://') && !base.startsWith('https://')) {
        base = `https://${base}`;
      }
      const urlObj = new URL(base);
      if (utmSource) urlObj.searchParams.set('utm_source', utmSource.trim());
      if (utmMedium) urlObj.searchParams.set('utm_medium', utmMedium.trim());
      if (utmCampaign) urlObj.searchParams.set('utm_campaign', utmCampaign.trim());
      setTargetUrl(urlObj.toString());
    } catch {
      // fallback manual append
      const separator = targetUrl.includes('?') ? '&' : '?';
      setTargetUrl(`${targetUrl.trim()}${separator}utm_source=${utmSource}&utm_medium=${utmMedium}&utm_campaign=${utmCampaign}`);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const downloadUrl = await uploadJobImage(file, 'job-images');
      setImageUrl(downloadUrl);
    } catch (err: any) {
      setUploadError(err.message || 'فشل رفع الصورة');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (bannerType !== 'code' && !titleAr.trim()) {
      setValidationError(language === 'ar' ? 'يرجى كتابة عنوان البانر بالعربية' : 'Please provide Arabic title');
      return;
    }

    if (bannerType === 'code') {
      if (!customCode.trim()) {
        setValidationError(language === 'ar' ? 'يرجى لصق كود الإعلان البرمجي (HTML / Script / Embed)' : 'Please paste custom ad snippet code');
        return;
      }
    } else {
      if (!targetUrl.trim() || targetUrl.trim() === 'https://') {
        setValidationError(language === 'ar' ? 'يرجى إدخال رابط الموقع المستهدف (URL)' : 'Please provide a target website URL');
        return;
      }
    }

    if (bannerType === 'image' && !imageUrl.trim()) {
      setValidationError(language === 'ar' ? 'يرجى رفع أو وضع رابط صورة للبانر' : 'Please upload or provide banner image URL');
      return;
    }

    // Format target URL if missing protocol
    let formattedUrl = targetUrl.trim();
    if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const selectedCategoryObj = categories.find(c => c.id === categoryId);

    setIsSaving(true);
    try {
      await onSaveBanner({
        id: initialBanner?.id,
        bannerType,
        titleAr: titleAr.trim() || (bannerType === 'code' ? 'إعلان مخصص' : ''),
        titleEn: titleEn.trim() || titleAr.trim(),
        subtitleAr: subtitleAr.trim(),
        subtitleEn: subtitleEn.trim(),
        callToActionAr: callToActionAr.trim(),
        callToActionEn: callToActionEn.trim(),
        targetUrl: formattedUrl || 'https://',
        imageUrl: imageUrl.trim(),
        customCode: customCode.trim(),
        cardTheme,
        badgeTextAr: badgeTextAr.trim(),
        badgeTextEn: badgeTextEn.trim(),
        smartLinkConfig: {
          utmSource: utmSource.trim(),
          utmMedium: utmMedium.trim(),
          utmCampaign: utmCampaign.trim(),
          appDeepLink: appDeepLink.trim(),
          openInNewTab: true,
        },
        placement,
        categoryId: (placement === 'category') ? categoryId : undefined,
        categoryNameAr: (placement === 'category') ? selectedCategoryObj?.nameAr : undefined,
        categoryNameEn: (placement === 'category') ? selectedCategoryObj?.nameEn : undefined,
        isActive,
        order: Number(order) || 1,
      });
      onClose();
    } catch (err: any) {
      setValidationError(err.message || 'فشل حفظ البانر الإعلاني');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00A896] text-white flex items-center justify-center shadow-md">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                {initialBanner 
                  ? (language === 'ar' ? 'تعديل الإعلان / البانر' : 'Edit Ad Banner')
                  : (language === 'ar' ? 'إضافة إعلان جديد (صور، أكواد، أو روابط ذكية)' : 'Add New Ad (Image, Code, or Smart Link)')}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ar' 
                  ? 'تحكم كامل في الأكواد البرمجية والروابط الذكية والصور وتحديد أماكن الظهور'
                  : 'Full control over ad codes, smart tracking links, images, and placements'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          {validationError && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Ad Type Selector: Image vs Code vs Smart Link */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-900 block flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-teal-600" />
              <span>{language === 'ar' ? 'صيغة ونوع الإعلان:' : 'Ad Format & Type:'}</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setBannerType('image')}
                className={`p-3.5 rounded-2xl border text-start transition cursor-pointer flex items-center gap-3 ${
                  bannerType === 'image'
                    ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 text-teal-950 font-black'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  bannerType === 'image' ? 'bg-[#00A896] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{language === 'ar' ? 'بانر صورة ورابط' : 'Image & Link Banner'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'صورة مصممة مع رابط خارجي' : 'Graphic banner with link'}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBannerType('code')}
                className={`p-3.5 rounded-2xl border text-start transition cursor-pointer flex items-center gap-3 ${
                  bannerType === 'code'
                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500/20 text-purple-950 font-black'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  bannerType === 'code' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{language === 'ar' ? 'كود إعلاني مخصص' : 'Custom Ad Code'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'HTML / Ads / Scripts' : 'Embed HTML / scripts'}</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setBannerType('smart_link')}
                className={`p-3.5 rounded-2xl border text-start transition cursor-pointer flex items-center gap-3 ${
                  bannerType === 'smart_link'
                    ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 text-amber-950 font-black'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  bannerType === 'smart_link' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">{language === 'ar' ? 'رابط ذكي وبطاقة تفاعلية' : 'Smart Link & Card'}</div>
                  <div className="text-[10px] text-slate-400">{language === 'ar' ? 'بطاقة جذابة مع UTM وتتبع' : 'Rich card with UTM tracker'}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Placement Selector */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200/60 space-y-3">
            <label className="text-xs font-black text-teal-950 block">
              {language === 'ar' ? 'مكان ظهور الإعلان:' : 'Ad Placement Location:'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setPlacement('home')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  placement === 'home'
                    ? 'bg-[#00A896] border-teal-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🏠 {language === 'ar' ? 'الصفحة الرئيسية' : 'Homepage'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('category')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  placement === 'category'
                    ? 'bg-[#00A896] border-teal-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>💼 {language === 'ar' ? 'فئة محددة' : 'Specific Category'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('all_categories')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  placement === 'all_categories'
                    ? 'bg-[#00A896] border-teal-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>📂 {language === 'ar' ? 'جميع الفئات' : 'All Categories'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlacement('global')}
                className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                  placement === 'global'
                    ? 'bg-[#00A896] border-teal-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>🌐 {language === 'ar' ? 'شامل (الكل)' : 'Global (Everywhere)'}</span>
              </button>
            </div>

            {/* If Category is selected */}
            {placement === 'category' && (
              <div className="pt-2">
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'اختر الفئة المستهدفة:' : 'Select Target Category:'}
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-slate-300 bg-white text-xs font-bold outline-none focus:border-teal-500"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* SECTION 1: CUSTOM CODE SNIPPET (When bannerType === 'code') */}
          {bannerType === 'code' && (
            <div className="space-y-4 p-4 rounded-2xl bg-purple-50/50 border border-purple-200">
              <div>
                <label className="text-xs font-black text-purple-950 block mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-purple-700" />
                    <span>{language === 'ar' ? 'لصق الكود الإعلاني (HTML / Iframe / Script / AdSense) *' : 'Ad Code Snippet (HTML / Iframe / Script) *'}</span>
                  </span>
                  <span className="text-[10px] text-purple-700 font-mono">HTML / JS / Embed</span>
                </label>
                <textarea
                  rows={6}
                  required
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  placeholder={`<div style="text-align:center;">\n  <a href="https://example.com" target="_blank">\n    <img src="https://..." style="max-width:100%; border-radius:12px;" />\n  </a>\n</div>`}
                  dir="ltr"
                  className="w-full p-3 font-mono text-xs rounded-xl border border-purple-300 bg-slate-950 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  {language === 'ar' ? 'عنوان تعريفي للإعلان (للأرشفة والمدير)' : 'Internal Title / Label'}
                </label>
                <input
                  type="text"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: كود إعلان جوجل أدسنس أو شبكة إعلانات الخليج"
                  dir="rtl"
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Live Preview of Code */}
              {customCode && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-purple-600" />
                    <span>{language === 'ar' ? 'معاينة حية للكود الإعلاني:' : 'Live Code Ad Preview:'}</span>
                  </div>
                  <div 
                    className="p-4 rounded-xl border border-dashed border-purple-300 bg-white overflow-hidden max-h-64 flex items-center justify-center text-center"
                    dangerouslySetInnerHTML={{ __html: customCode }}
                  />
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: SMART LINK & CARD SETTINGS (When bannerType === 'smart_link') */}
          {bannerType === 'smart_link' && (
            <div className="space-y-4 p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-950 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-600" />
                  <span>{language === 'ar' ? 'مولد الروابط الذكية (Smart UTM Builder)' : 'Smart UTM Builder'}</span>
                </span>
                <button
                  type="button"
                  onClick={handleGenerateSmartUrl}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>{language === 'ar' ? 'توليد الرابط الذكي تلقائياً' : 'Generate Smart Link'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">UTM Source (المصدر)</label>
                  <input
                    type="text"
                    value={utmSource}
                    onChange={(e) => setUtmSource(e.target.value)}
                    dir="ltr"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">UTM Medium (الوسيط)</label>
                  <input
                    type="text"
                    value={utmMedium}
                    onChange={(e) => setUtmMedium(e.target.value)}
                    dir="ltr"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-0.5">UTM Campaign (الحملة)</label>
                  <input
                    type="text"
                    value={utmCampaign}
                    onChange={(e) => setUtmCampaign(e.target.value)}
                    dir="ltr"
                    className="w-full h-9 px-3 rounded-lg border border-slate-200 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Card Theme Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-amber-600" />
                  <span>{language === 'ar' ? 'نمط وألوان البطاقة الذكية:' : 'Card Visual Theme:'}</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setCardTheme('teal_navy')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      cardTheme === 'teal_navy' ? 'bg-[#0A192F] text-teal-300 ring-2 ring-teal-500' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>كحلي وفيروزي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('gold_dark')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      cardTheme === 'gold_dark' ? 'bg-slate-900 text-amber-300 ring-2 ring-amber-500' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>ذهبي فاخر</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('emerald_modern')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      cardTheme === 'emerald_modern' ? 'bg-emerald-950 text-emerald-300 ring-2 ring-emerald-500' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>زمردي خليجي</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardTheme('purple_royal')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      cardTheme === 'purple_royal' ? 'bg-purple-950 text-purple-300 ring-2 ring-purple-500' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>أرجواني ملكي</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COMMON FIELDS: Titles, URLs, Subtitles (for Image & Smart Link) */}
          {bannerType !== 'code' && (
            <>
              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان الإعلان بالعربية *' : 'Ad Title (Arabic) *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: دورات تدريبية معتمدة مع فرصة توظيف مباشرة"
                    dir="rtl"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'عنوان الإعلان بالإنجليزية' : 'Ad Title (English)'}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Certified Professional Training & Direct Placement"
                    dir="ltr"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Subtitles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الوصف الفرعي (عربي)' : 'Subtitle (Arabic)'}
                  </label>
                  <textarea
                    rows={2}
                    value={subtitleAr}
                    onChange={(e) => setSubtitleAr(e.target.value)}
                    placeholder="تفاصيل العرض الترويجي أو الميزة الخاصة..."
                    dir="rtl"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'الوصف الفرعي (إنجليزي)' : 'Subtitle (English)'}
                  </label>
                  <textarea
                    rows={2}
                    value={subtitleEn}
                    onChange={(e) => setSubtitleEn(e.target.value)}
                    placeholder="Promotional details or special perks..."
                    dir="ltr"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>
              </div>

              {/* Target URL & CTA Button */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'رابط الموقع المستهدف (Smart Target Link) *' : 'Target Website Link *'}
                  </label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute start-3 top-3.5" />
                    <input
                      type="url"
                      required
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      placeholder="https://example.com/special-offer"
                      dir="ltr"
                      className="w-full h-11 ps-9 pe-3.5 rounded-xl border border-slate-200 text-xs font-mono text-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'نص زر الإجراء (CTA)' : 'CTA Button Label'}
                  </label>
                  <input
                    type="text"
                    value={callToActionAr}
                    onChange={(e) => setCallToActionAr(e.target.value)}
                    placeholder="زيارة الموقع / تسجيل الآن"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Badge text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'شارة الإعلان (Badge عربي)' : 'Badge Label (Ar)'}
                  </label>
                  <input
                    type="text"
                    value={badgeTextAr}
                    onChange={(e) => setBadgeTextAr(e.target.value)}
                    placeholder="مثال: خصم خاص 50% أو إعلان ممول"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    {language === 'ar' ? 'شارة الإعلان (Badge إنجليزي)' : 'Badge Label (En)'}
                  </label>
                  <input
                    type="text"
                    value={badgeTextEn}
                    onChange={(e) => setBadgeTextEn(e.target.value)}
                    placeholder="e.g. 50% Discount or Verified Partner"
                    dir="ltr"
                    className="w-full h-10 px-3.5 rounded-xl border border-slate-200 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Banner Image Upload & Preview (Only for 'image' type) */}
              {bannerType === 'image' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 block">
                    {language === 'ar' ? 'صورة البانر الإعلاني *' : 'Banner Image *'}
                  </label>

                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {imageUrl && (
                      <div className="w-full sm:w-60 h-32 rounded-2xl overflow-hidden border-2 border-slate-200 shrink-0 relative bg-slate-100 shadow-xs">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}

                    <div className="flex-1 space-y-3 w-full">
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="رابط مباشر للصورة https://..."
                        dir="ltr"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs font-mono"
                      />

                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5 text-teal-400" />
                          <span>{isUploading ? (language === 'ar' ? 'جارٍ الرفع...' : 'Uploading...') : (language === 'ar' ? 'رفع صورة من الجهاز' : 'Upload from device')}</span>
                        </button>

                        <span className="text-[11px] text-slate-400 font-medium">
                          (JPG, PNG, WEBP - Max 5MB)
                        </span>
                      </div>

                      {uploadError && (
                        <p className="text-xs text-rose-600 font-bold">{uploadError}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Active status & Order */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-slate-700">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 text-[#00A896] rounded border-slate-300 focus:ring-[#00A896]"
              />
              <span>{language === 'ar' ? 'الإعلان نشط ومفعل للظهور للزوار' : 'Ad is active and visible to public'}</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{language === 'ar' ? 'الترتيب:' : 'Order:'}</span>
              <input
                type="number"
                min="1"
                max="99"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-16 h-9 px-2 rounded-lg border border-slate-200 text-xs text-center font-bold"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-extrabold text-xs shadow-md transition cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ ونشر الإعلان' : 'Save & Publish Ad')}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
