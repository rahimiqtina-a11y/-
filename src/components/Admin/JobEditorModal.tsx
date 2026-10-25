import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Upload, 
  Trash2, 
  Check, 
  AlertCircle, 
  Image as ImageIcon, 
  MapPin, 
  DollarSign, 
  Briefcase, 
  Globe, 
  FileText, 
  Phone, 
  Mail, 
  ExternalLink, 
  Clock, 
  Sparkles,
  Plus,
  Camera,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobAdvertisement, GCCCountry, JobCategory, JobStatus } from '../../types/job';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES } from '../../lib/initialData';
import { uploadJobImage } from '../../lib/firebase';

interface JobEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<JobAdvertisement>) => Promise<void>;
  onAddNewCategory?: (cat: Partial<JobCategory>) => Promise<JobCategory>;
  initialJob?: Partial<JobAdvertisement> | JobAdvertisement | null;
  countries?: GCCCountry[];
  categories?: JobCategory[];
}

export const JobEditorModal: React.FC<JobEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onAddNewCategory,
  initialJob,
  countries = INITIAL_GCC_COUNTRIES,
  categories = INITIAL_JOB_CATEGORIES,
}) => {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ad Format: 'both' (نص وصورة) | 'image_only' (صورة فقط) | 'text_only' (نص فقط)
  const [adFormat, setAdFormat] = useState<'both' | 'image_only' | 'text_only'>('both');

  // Form Fields State
  const [titleAr, setTitleAr] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [companyNameAr, setCompanyNameAr] = useState('');
  const [companyNameEn, setCompanyNameEn] = useState('');
  const [companyLogoUrl, setCompanyLogoUrl] = useState('');
  const [countryId, setCountryId] = useState('qatar');
  const [city, setCity] = useState('Doha');
  const [categoryId, setCategoryId] = useState('sales-marketing');
  const [descriptionAr, setDescriptionAr] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [minSalary, setMinSalary] = useState(3000);
  const [maxSalary, setMaxSalary] = useState(8000);
  const [salaryCurrency, setSalaryCurrency] = useState('QAR');
  const [salaryDisclosed, setSalaryDisclosed] = useState(true);
  const [employmentType, setEmploymentType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [educationLevel, setEducationLevel] = useState('');
  const [skills, setSkills] = useState('');
  const [workingHours, setWorkingHours] = useState('');
  const [benefits, setBenefits] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactWhatsapp, setContactWhatsapp] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationUrl, setApplicationUrl] = useState('');
  const [status, setStatus] = useState<JobStatus>('published');
  const [isFeatured, setIsFeatured] = useState(false);

  // Inline "Add New Category" popover state
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [newCategoryNameAr, setNewCategoryNameAr] = useState('');
  const [newCategoryNameEn, setNewCategoryNameEn] = useState('');
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  // Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Active form section tab for editing text details
  const [contentLangTab, setContentLangTab] = useState<'ar' | 'en'>('ar');

  // Populate data when editing an existing job
  useEffect(() => {
    if (initialJob) {
      setTitleAr(initialJob.titleAr || '');
      setTitleEn(initialJob.titleEn || '');
      setCompanyNameAr(initialJob.companyNameAr || '');
      setCompanyNameEn(initialJob.companyNameEn || '');
      setCompanyLogoUrl(initialJob.companyLogoUrl || '');
      setCountryId(initialJob.countryId || 'qatar');
      setCity(initialJob.city || '');
      setCategoryId(initialJob.categoryId || 'sales-marketing');
      setDescriptionAr(initialJob.descriptionAr || '');
      setDescriptionEn(initialJob.descriptionEn || '');
      setImageUrl(initialJob.imageUrl || '');
      
      if (initialJob.hasImageOnly || initialJob.adFormat === 'image_only') {
        setAdFormat('image_only');
      } else if (initialJob.adFormat === 'text_only' || (!initialJob.imageUrl && initialJob.descriptionAr)) {
        setAdFormat('text_only');
      } else {
        setAdFormat('both');
      }

      setMinSalary(initialJob.minSalary || 0);
      setMaxSalary(initialJob.maxSalary || 0);
      setSalaryCurrency(initialJob.salaryCurrency || 'QAR');
      setSalaryDisclosed(initialJob.salaryDisclosed ?? true);
      setEmploymentType(initialJob.employmentType || 'full-time');
      setExperienceLevel(initialJob.experienceLevel || 'mid');
      setEducationLevel(initialJob.educationLevel || '');
      setSkills(initialJob.skills || '');
      setWorkingHours(initialJob.workingHours || '');
      setBenefits(initialJob.benefits || '');
      setApplicationDeadline(initialJob.applicationDeadline || '');
      setContactPhone(initialJob.contactPhone || '');
      setContactWhatsapp(initialJob.contactWhatsapp || '');
      setContactEmail(initialJob.contactEmail || '');
      setApplicationUrl(initialJob.applicationUrl || '');
      setStatus(initialJob.status || 'published');
      setIsFeatured(initialJob.isFeatured || false);
    } else {
      // Defaults for brand new job
      setTitleAr('');
      setTitleEn('');
      setCompanyNameAr('');
      setCompanyNameEn('');
      setCompanyLogoUrl('');
      setCountryId('qatar');
      setCity('Doha');
      setCategoryId('sales-marketing');
      setDescriptionAr('');
      setDescriptionEn('');
      setImageUrl('');
      setAdFormat('both');
      setMinSalary(3000);
      setMaxSalary(8000);
      setSalaryCurrency('QAR');
      setSalaryDisclosed(true);
      setEmploymentType('full-time');
      setExperienceLevel('mid');
      setEducationLevel('');
      setSkills('');
      setWorkingHours('');
      setBenefits('');
      setApplicationDeadline('');
      setContactPhone('');
      setContactWhatsapp('');
      setContactEmail('');
      setApplicationUrl('');
      setStatus('published');
      setIsFeatured(false);
    }
    setValidationError(null);
    setUploadError(null);
    setIsAddingNewCategory(false);
  }, [initialJob, isOpen]);

  // Sync currency automatically when country changes
  const handleCountryChange = (newCountryId: string) => {
    setCountryId(newCountryId);
    const selectedC = countries.find(c => c.id === newCountryId);
    if (selectedC) {
      setSalaryCurrency(selectedC.currencyCode);
      if (selectedC.cities && selectedC.cities.length > 0) {
        setCity(selectedC.cities[0]);
      }
    }
  };

  const selectedCountry = countries.find(c => c.id === countryId);

  // Handle image upload from desktop or mobile camera
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    try {
      const url = await uploadJobImage(file, 'job-images');
      setImageUrl(url);
    } catch (err: any) {
      console.error('File upload error:', err);
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle inline quick add new category
  const handleCreateNewCategoryInline = async () => {
    if (!newCategoryNameAr.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم الفئة بالعربية' : 'Please enter Arabic category name');
      return;
    }
    setIsSubmittingCategory(true);
    try {
      const catId = (newCategoryNameEn.trim() || newCategoryNameAr.trim())
        .toLowerCase()
        .replace(/[^a-z0-9\u0600-\u06FF]+/g, '-');
      
      const newCat: Partial<JobCategory> = {
        id: catId,
        nameAr: newCategoryNameAr.trim(),
        nameEn: newCategoryNameEn.trim() || newCategoryNameAr.trim(),
        icon: 'Briefcase',
        order: categories.length + 1,
        isActive: true,
      };

      if (onAddNewCategory) {
        await onAddNewCategory(newCat);
      }
      setCategoryId(catId);
      setIsAddingNewCategory(false);
      setNewCategoryNameAr('');
      setNewCategoryNameEn('');
    } catch (err: any) {
      console.error('Failed to create new category:', err);
      alert(err.message || 'Error adding category');
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validation based on selected format
    if (adFormat === 'image_only' && !imageUrl) {
      setValidationError(
        language === 'ar' 
          ? 'لقد اخترت (إعلان مصور فقط)، يرجى رفع صورة الإعلان الوظيفي أولاً.' 
          : 'Please upload the advertisement image for an image-only listing.'
      );
      return;
    }

    if (adFormat !== 'image_only' && !titleAr.trim()) {
      setValidationError(
        language === 'ar' 
          ? 'يرجى إدخال المسمى الوظيفي بالعربية.' 
          : 'Arabic job title is required.'
      );
      return;
    }

    const selectedCategory = categories.find(c => c.id === categoryId);

    const isImageOnly = adFormat === 'image_only';

    const payload: Partial<JobAdvertisement> = {
      titleAr: titleAr.trim() || (isImageOnly ? 'إعلان وظيفي مصور' : 'وظيفة شاغرة'),
      titleEn: titleEn.trim() || (isImageOnly ? 'Image Job Advertisement' : 'Job Vacancy'),
      companyNameAr: companyNameAr.trim(),
      companyNameEn: companyNameEn.trim(),
      companyLogoUrl: companyLogoUrl.trim(),
      countryId,
      countryNameAr: selectedCountry?.nameAr || countryId,
      countryNameEn: selectedCountry?.nameEn || countryId,
      city: city || selectedCountry?.cities[0] || '',
      categoryId,
      categoryNameAr: selectedCategory?.nameAr || categoryId,
      categoryNameEn: selectedCategory?.nameEn || categoryId,
      descriptionAr: descriptionAr.trim() || (isImageOnly ? 'إعلان وظيفي مصور - يرجى مراجعة الصورة للتفاصيل' : ''),
      descriptionEn: descriptionEn.trim() || (isImageOnly ? 'Image job advertisement - please view image for full details' : ''),
      imageUrl: imageUrl.trim(),
      hasImageOnly: isImageOnly,
      adFormat,
      minSalary: Number(minSalary) || 0,
      maxSalary: Number(maxSalary) || 0,
      salaryCurrency,
      salaryDisclosed,
      employmentType,
      experienceLevel,
      educationLevel: educationLevel.trim(),
      skills: skills.trim(),
      workingHours: workingHours.trim(),
      benefits: benefits.trim(),
      applicationDeadline: applicationDeadline || '',
      contactPhone: contactPhone.trim(),
      contactWhatsapp: contactWhatsapp.trim(),
      contactEmail: contactEmail.trim(),
      applicationUrl: applicationUrl.trim(),
      status,
      isFeatured,
      createdBy: user?.uid || 'admin',
    };

    setIsSaving(true);
    try {
      await onSave(payload);
      onClose();
    } catch (err: any) {
      console.error('Error saving job:', err);
      setValidationError(err.message || 'Failed to save job advertisement.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div 
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-white">
                {initialJob ? (language === 'ar' ? 'تعديل الإعلان الوظيفي' : 'Edit Job Listing') : (language === 'ar' ? 'إضافة إعلان وظيفي جديد' : 'Create New Job Listing')}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'منصة وظائف الخليج الموحدة (دول مجلس التعاون)' : 'Unified GCC Careers Platform'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-900">
          
          {/* 1. ADVERTISEMENT FORMAT SELECTOR (Both, Image Only, Text Only) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-2.5">
              {language === 'ar' ? 'نوع وطريقة نشر الإعلان الوظيفي:' : 'Job Advertisement Format:'}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* Option 1: Both (Text & Image) */}
              <button
                type="button"
                onClick={() => setAdFormat('both')}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                  adFormat === 'both'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  adFormat === 'both' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    {language === 'ar' ? 'نصي ومصور (كلاهما)' : 'Both Text & Image'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'تفاصيل نصية كاملة مع صورة' : 'Full description with banner'}
                  </div>
                </div>
              </button>

              {/* Option 2: Image Only */}
              <button
                type="button"
                onClick={() => setAdFormat('image_only')}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                  adFormat === 'image_only'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  adFormat === 'image_only' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    {language === 'ar' ? 'صورة إعلانية فقط' : 'Image Only (Flyer)'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'رفع تصميم أو صورة إعلان' : 'Upload photo/poster only'}
                  </div>
                </div>
              </button>

              {/* Option 3: Text Only */}
              <button
                type="button"
                onClick={() => setAdFormat('text_only')}
                className={`p-3 rounded-xl border text-start transition-all cursor-pointer flex items-center gap-3 ${
                  adFormat === 'text_only'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  adFormat === 'text_only' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold">
                    {language === 'ar' ? 'إعلان نصي فقط' : 'Text Only'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'ar' ? 'بدون صور أو مرفقات' : 'Standard vacancy post'}
                  </div>
                </div>
              </button>

            </div>
          </div>

          {/* 2. PRIMARY REGIONAL & CATEGORY SELECTOR (PROMINENT AT TOP) */}
          <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-teal-700" />
                <span>{language === 'ar' ? 'تحديد الدولة الخليجية والمدينة والفئة الوظيفية *' : 'GCC Country, City & Job Category *'}</span>
              </span>
              <span className="text-[11px] font-mono text-teal-700 bg-white px-2 py-0.5 rounded border border-teal-200">
                {salaryCurrency}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              
              {/* Country Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'الدولة الخليجية *' : 'GCC Country *'}
                </label>
                <select
                  value={countryId}
                  onChange={(e) => handleCountryChange(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-900 shadow-xs outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {countries.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.flagEmoji} {language === 'ar' ? c.nameAr : c.nameEn} ({c.currencyCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* City Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'المدينة *' : 'City *'}
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-teal-300 bg-white text-xs font-semibold text-slate-900 shadow-xs outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {selectedCountry?.cities.map(ct => (
                    <option key={ct} value={ct}>
                      {selectedCountry.citiesAr?.[ct] && language === 'ar' ? selectedCountry.citiesAr[ct] : ct}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Selection with Inline Add Button */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    {language === 'ar' ? 'الفئة الوظيفية *' : 'Job Category *'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(!isAddingNewCategory)}
                    className="text-[11px] font-bold text-teal-700 hover:text-teal-900 flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{language === 'ar' ? '+ فئة جديدة' : '+ New Category'}</span>
                  </button>
                </div>

                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl border border-teal-300 bg-white text-xs font-bold text-slate-900 shadow-xs outline-none focus:ring-2 focus:ring-teal-500/20"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Inline "Add New Category" Form Drawer */}
            {isAddingNewCategory && (
              <div className="p-3.5 rounded-xl bg-white border border-teal-300 shadow-md space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-900">
                    {language === 'ar' ? 'إضافة فئة وظيفية جديدة وحفظها فوراً في قاعدة البيانات:' : 'Add New Category on the fly:'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingNewCategory(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <input
                    type="text"
                    value={newCategoryNameAr}
                    onChange={(e) => setNewCategoryNameAr(e.target.value)}
                    placeholder="اسم الفئة بالعربية (مثال: الشحن واللوجستيات)"
                    className="h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    dir="rtl"
                  />
                  <input
                    type="text"
                    value={newCategoryNameEn}
                    onChange={(e) => setNewCategoryNameEn(e.target.value)}
                    placeholder="Category Name in English (e.g. Shipping & Logistics)"
                    className="h-9 px-3 rounded-lg border border-slate-300 text-xs"
                    dir="ltr"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={isSubmittingCategory}
                    onClick={handleCreateNewCategoryInline}
                    className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-xs"
                  >
                    {isSubmittingCategory ? (language === 'ar' ? 'جارٍ الإضافة...' : 'Adding...') : (language === 'ar' ? 'إضافة الفئة وتحديدها' : 'Add & Select')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. IMAGE UPLOAD SECTION (For Both or Image-Only) */}
          {(adFormat === 'both' || adFormat === 'image_only') && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-teal-600" />
                  <span>
                    {adFormat === 'image_only' 
                      ? (language === 'ar' ? 'صورة الإعلان الوظيفي * (مطلوبة)' : 'Advertisement Image * (Required)')
                      : (language === 'ar' ? 'صورة الإعلان الوظيفي (اختياري)' : 'Advertisement Image (Optional)')}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400">PNG, JPG, WEBP (Max 5MB)</span>
              </label>

              {imageUrl ? (
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden bg-slate-900 max-h-80 flex items-center justify-center p-2">
                  <img src={imageUrl} alt="Advertisement" className="max-h-72 w-auto object-contain rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="absolute top-4 end-4 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.admin.removeImage}</span>
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-2xl p-6 text-center bg-white hover:bg-teal-50/30 transition-all cursor-pointer"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/png,image/jpeg,image/webp" 
                    className="hidden" 
                  />
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-2">
                    <Camera className="w-6 h-6 text-teal-600" />
                  </div>
                  <p className="text-sm font-bold text-slate-800 mb-0.5">
                    {isUploading ? t.admin.uploadingImage : (language === 'ar' ? 'اضغط لاختيار صورة الإعلان أو التقاطها بالكاميرا' : 'Click to select or capture advertisement photo')}
                  </p>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'يدعم الصور من الهاتف والكمبيوتر مباشرة' : 'Supports phone photos, flyers and screenshots'}
                  </p>
                </div>
              )}

              {uploadError && (
                <p className="text-xs text-rose-600 font-semibold">{uploadError}</p>
              )}
            </div>
          )}

          {/* 4. JOB TITLES & DESCRIPTIONS (Required for Both & Text Only, Optional for Image Only) */}
          <div className="space-y-4">
            
            {/* Bilingual Content Switcher */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800">
                {language === 'ar' ? 'بيانات المسمى والوصف الوظيفي:' : 'Job Titles & Descriptions:'}
              </span>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setContentLangTab('ar')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    contentLangTab === 'ar' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  العربية (Arabic)
                </button>
                <button
                  type="button"
                  onClick={() => setContentLangTab('en')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    contentLangTab === 'en' ? 'bg-white text-teal-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  English
                </button>
              </div>
            </div>

            {/* Arabic Fields */}
            {contentLangTab === 'ar' && (
              <div className="space-y-3" dir="rtl">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldTitleAr} {adFormat !== 'image_only' && <span className="text-rose-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder="مثال: مدير مبيعات، مهندس، محاسب..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldCompanyAr}
                  </label>
                  <input
                    type="text"
                    value={companyNameAr}
                    onChange={(e) => setCompanyNameAr(e.target.value)}
                    placeholder="مثال: شركة قطر للتجارة، مجموعة الفطيم..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldDescAr} {adFormat !== 'image_only' && <span className="text-rose-500">*</span>}
                  </label>
                  <textarea
                    rows={4}
                    value={descriptionAr}
                    onChange={(e) => setDescriptionAr(e.target.value)}
                    placeholder="اكتب هنا تفاصيل وشروط الوظيفة والمهام المطلوبة..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* English Fields */}
            {contentLangTab === 'en' && (
              <div className="space-y-3" dir="ltr">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldTitleEn}
                  </label>
                  <input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder="e.g. Sales Manager, Civil Engineer, Accountant..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldCompanyEn}
                  </label>
                  <input
                    type="text"
                    value={companyNameEn}
                    onChange={(e) => setCompanyNameEn(e.target.value)}
                    placeholder="e.g. Qatar Airways, Emirates Group..."
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.admin.fieldDescEn}
                  </label>
                  <textarea
                    rows={4}
                    value={descriptionEn}
                    onChange={(e) => setDescriptionEn(e.target.value)}
                    placeholder="Provide English job description, duties and requirements..."
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none leading-relaxed"
                  />
                </div>
              </div>
            )}

          </div>

          {/* 5. SALARY & COMPENSATION */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-teal-600" />
                <span>{language === 'ar' ? `الراتب والعملة (${salaryCurrency})` : `Compensation (${salaryCurrency})`}</span>
              </span>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={salaryDisclosed}
                  onChange={(e) => setSalaryDisclosed(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span>{t.admin.fieldSalaryDisclosed}</span>
              </label>
            </div>

            {salaryDisclosed && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t.admin.fieldMinSalary} ({salaryCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={minSalary}
                    onChange={(e) => setMinSalary(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {t.admin.fieldMaxSalary} ({salaryCurrency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={maxSalary}
                    onChange={(e) => setMaxSalary(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 6. WORKING PARAMETERS (Employment Type, Experience, Deadline) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.admin.fieldEmploymentType}
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="full-time">{t.types['full-time']}</option>
                <option value="part-time">{t.types['part-time']}</option>
                <option value="contract">{t.types.contract}</option>
                <option value="remote">{t.types.remote}</option>
                <option value="temporary">{t.types.temporary}</option>
                <option value="internship">{t.types.internship}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.admin.fieldExperienceLevel}
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
              >
                <option value="entry">{t.experience.entry}</option>
                <option value="mid">{t.experience.mid}</option>
                <option value="senior">{t.experience.senior}</option>
                <option value="executive">{t.experience.executive}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.admin.fieldDeadline}
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900"
              />
            </div>
          </div>

          {/* 7. CONTACT METHODS */}
          <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-200 space-y-3">
            <span className="text-xs font-bold text-teal-900 block">
              {language === 'ar' ? 'طرق التواصل والتقديم للوظيفة:' : 'Direct Application & Contact Channels:'}
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>{t.admin.fieldWhatsapp}</span>
                </label>
                <input
                  type="text"
                  value={contactWhatsapp}
                  onChange={(e) => setContactWhatsapp(e.target.value)}
                  placeholder="+97455123456"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-teal-600" />
                  <span>{t.admin.fieldEmail}</span>
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hr@company.com"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-slate-600" />
                  <span>{t.admin.fieldPhone}</span>
                </label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="+97444123456"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                  <span>{t.admin.fieldAppUrl}</span>
                </label>
                <input
                  type="url"
                  value={applicationUrl}
                  onChange={(e) => setApplicationUrl(e.target.value)}
                  placeholder="https://company.com/apply"
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* 8. STATUS & FEATURED SETTINGS */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-700">
                {language === 'ar' ? 'حالة الإعلان:' : 'Listing Status:'}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as JobStatus)}
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800"
              >
                <option value="published">🟢 {t.admin.statusPublished}</option>
                <option value="draft">🟡 {t.admin.statusDraft}</option>
                <option value="filled">🔵 {t.admin.statusFilled}</option>
                <option value="expired">🔴 {t.admin.statusExpired}</option>
              </select>
            </div>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-400"
              />
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-current" />
                <span>{language === 'ar' ? 'تمييز الوظيفة في أعلى النتائج (Featured)' : 'Feature this vacancy at the top'}</span>
              </span>
            </label>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
            >
              {t.admin.cancel}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs shadow-md shadow-teal-600/20 flex items-center gap-2 transition-all hover:scale-102 disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>{isSaving ? t.admin.saving : t.admin.saveJob}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
