import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  User, 
  Briefcase, 
  Building, 
  Camera, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Sparkles, 
  Check, 
  Send, 
  AlertCircle,
  FileText,
  Award,
  GraduationCap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole, GCCCountry, JobCategory } from '../../types/job';
import { uploadJobImage } from '../../lib/firebase';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES } from '../../lib/initialData';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEmployerInquiry: () => void;
  onOpenSeekerAdEditor: () => void;
  onOpenEmployerOffice?: () => void;
  onOpenMyApplications?: () => void;
  countries?: GCCCountry[];
  categories?: JobCategory[];
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenEmployerInquiry,
  onOpenSeekerAdEditor,
  onOpenEmployerOffice,
  onOpenMyApplications,
  countries = INITIAL_GCC_COUNTRIES,
  categories = INITIAL_JOB_CATEGORIES,
}) => {
  const { language, t } = useLanguage();
  const { user, userProfile, updateUserProfile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [role, setRole] = useState<UserRole>('job_seeker');
  const [headline, setHeadline] = useState('');
  const [countryId, setCountryId] = useState('qatar');
  const [city, setCity] = useState('Doha');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || user?.displayName || '');
      setPhotoURL(userProfile.photoURL || user?.photoURL || '');
      setRole(userProfile.role || 'job_seeker');
      setHeadline(userProfile.headline || '');
      setCountryId(userProfile.countryId || 'qatar');
      setCity(userProfile.city || 'Doha');
      setPhone(userProfile.phone || '');
      setWhatsapp(userProfile.whatsapp || '');
      setBio(userProfile.bio || '');
      setSkills(userProfile.skills || '');
      setExperienceYears(userProfile.experienceYears || '');
      setEducation(userProfile.education || '');
      setCompanyName(userProfile.companyName || '');
    } else if (user) {
      setDisplayName(user.displayName || '');
      setPhotoURL(user.photoURL || '');
      setRole('job_seeker');
    }
  }, [userProfile, user, isOpen]);

  if (!isOpen || !user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingPhoto(true);
    try {
      const url = await uploadJobImage(file, 'company-logos');
      setPhotoURL(url);
      await updateUserProfile({ photoURL: url });
      setFeedback(language === 'ar' ? 'تم تحديث الصورة الشخصية' : 'Profile photo updated');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        displayName: displayName.trim(),
        photoURL,
        role,
        headline: headline.trim(),
        countryId,
        city: city.trim(),
        phone: phone.trim(),
        whatsapp: whatsapp.trim(),
        bio: bio.trim(),
        skills: skills.trim(),
        experienceYears: experienceYears.trim(),
        education: education.trim(),
        companyName: companyName.trim(),
      });
      setFeedback(language === 'ar' ? 'تم حفظ التعديلات بنجاح!' : 'Profile saved successfully!');
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedCountry = countries.find(c => c.id === countryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'الملف الشخصي والحساب' : 'User Profile & Settings'}
              </h2>
              <p className="text-xs text-slate-400">
                {user.email}
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

        {/* Feedback message */}
        {feedback && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4 text-teal-600" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSaveProfile} className="overflow-y-auto p-6 space-y-6 flex-1 text-slate-900">
          
          {/* Avatar & Photo Upload */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-3xl bg-slate-50 border border-slate-200">
            <div className="relative group">
              {photoURL ? (
                <img 
                  src={photoURL} 
                  alt={displayName} 
                  className="w-20 h-20 rounded-full object-cover border-2 border-teal-500 shadow-md"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-md">
                  {displayName ? displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 end-0 p-1.5 rounded-full bg-slate-900 text-teal-300 hover:bg-teal-600 hover:text-white transition-colors shadow-md"
                title="Change Photo"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="flex-1 text-center sm:text-start">
              <h3 className="font-extrabold text-base text-slate-900">
                {displayName || (language === 'ar' ? 'مستخدم جديد' : 'New User')}
              </h3>
              <p className="text-xs text-slate-500">
                {user.email}
              </p>
              <p className="text-[11px] text-teal-700 font-semibold mt-1">
                {isUploadingPhoto ? (language === 'ar' ? 'جارٍ رفع الصورة...' : 'Uploading photo...') : (language === 'ar' ? 'اضغط على أيقونة الكاميرا لتغيير الصورة' : 'Click camera icon to change photo')}
              </p>
            </div>
          </div>

          {/* Quick Action: My Applications */}
          {onOpenMyApplications && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenMyApplications();
              }}
              className="w-full p-3.5 rounded-2xl bg-teal-50 border border-teal-200 hover:bg-teal-100/80 text-teal-950 flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <span className="block font-black text-slate-900">{language === 'ar' ? 'طلبات التوظيف الخاصة بي ومتابعة الحالات' : 'My Job Applications & Status'}</span>
                  <span className="text-[11px] text-teal-700 font-semibold">{language === 'ar' ? 'متابعة مباشرة لقرارات جهات العمل (مقبول / قيد المراجعة...)' : 'Track live employer decisions and status'}</span>
                </div>
              </div>
              <span className="text-teal-700 font-black text-xs px-2.5 py-1 rounded-xl bg-white border border-teal-200">{language === 'ar' ? 'عرض الطلبات ←' : 'View →'}</span>
            </button>
          )}

          {/* ROLE SELECTOR (باحث عن عمل أو صاحب عمل) */}
          <div className="space-y-2">
            <label className="block text-xs font-black text-slate-800">
              {language === 'ar' ? 'اختر صفتك في المنصة (نوع الحساب) *' : 'Choose Your Account Type *'}
            </label>

            <div className="grid grid-cols-2 gap-3">
              
              {/* Option 1: باحث عن عمل */}
              <button
                type="button"
                onClick={() => setRole('job_seeker')}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'job_seeker'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <User className={`w-5 h-5 ${role === 'job_seeker' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-extrabold">
                    {language === 'ar' ? 'باحث عن عمل' : 'Job Seeker'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {language === 'ar' ? 'يمكنك نشر إعلانك الشخصي للبحث عن عمل والتواصل مع أصحاب العمل' : 'Create profile and advertise yourself to GCC recruiters'}
                </p>
              </button>

              {/* Option 2: صاحب عمل */}
              <button
                type="button"
                onClick={() => setRole('employer')}
                className={`p-4 rounded-2xl border text-start transition-all cursor-pointer flex flex-col justify-between ${
                  role === 'employer'
                    ? 'bg-teal-50 border-teal-500 text-teal-950 font-bold ring-2 ring-teal-500/20 shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <Building className={`w-5 h-5 ${role === 'employer' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span className="text-sm font-extrabold">
                    {language === 'ar' ? 'صاحب عمل / شركة' : 'Employer / Company'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-normal">
                  {language === 'ar' ? 'يمكنك تصفح الباحثين عن عمل وطلب نشر شواغر وظيفية عبر مسؤول التطبيق' : 'Browse candidate talent and request job postings'}
                </p>
              </button>

            </div>
          </div>

          {/* Conditional Guidance Banner according to role */}
          {role === 'employer' ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <h4 className="font-bold text-xs sm:text-sm">
                  {language === 'ar' ? 'تنويه هام لأصحاب العمل:' : 'Notice for Employers & Companies:'}
                </h4>
              </div>
              <p className="text-xs leading-relaxed text-amber-800">
                {language === 'ar'
                  ? 'يمكنك متابعة المتقدمين وسيرهم الذاتية لفرص العمل من خلال مكتب التوظيف، وإرسال تفاصيل أي وظيفة جديدة للمسؤول لتدقيقها ونشرها.'
                  : 'You can review applicants and CVs through the recruitment desk, and send new vacancies for admin approval.'}
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {onOpenEmployerOffice && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenEmployerOffice();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-md shadow-teal-700/20 cursor-pointer"
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>{language === 'ar' ? 'الدخول إلى مكتب صاحب العمل (المتقدمين)' : 'Open Employer Desk'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={onOpenEmployerInquiry}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{language === 'ar' ? 'طلب نشر وظيفة جديدة' : 'Post Vacancy Request'}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>{language === 'ar' ? 'إعلان الباحث عن عمل (Looking for Work)' : 'Job Seeker Public Advertisement'}</span>
                </h4>
                <p className="text-xs text-teal-800 mt-0.5">
                  {language === 'ar' ? 'انشر سيرتك ومجالك ليراك أصحاب العمل في قسم (الباحثون عن عمل)' : 'Publish your candidate ad to be seen by employers across GCC'}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenSeekerAdEditor}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs shadow-md shrink-0 cursor-pointer"
              >
                {language === 'ar' ? 'تعديل / نشر إعلاني' : 'Manage My Ad'}
              </button>
            </div>
          )}

          {/* Basic Info Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {role === 'employer' 
                  ? (language === 'ar' ? 'اسم الشركة / المؤسسة' : 'Company Name')
                  : (language === 'ar' ? 'المسمى الوظيفي المستهدف' : 'Target Job Title')}
              </label>
              <input
                type="text"
                value={role === 'employer' ? companyName : headline}
                onChange={(e) => role === 'employer' ? setCompanyName(e.target.value) : setHeadline(e.target.value)}
                placeholder={role === 'employer' ? 'مثال: شركة قطر للمقاولات' : 'مثال: مهندس برمجيات أول، محاسب مالي'}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الدولة الخليجية' : 'GCC Country'}
              </label>
              <select
                value={countryId}
                onChange={(e) => {
                  setCountryId(e.target.value);
                  const found = countries.find(c => c.id === e.target.value);
                  if (found?.cities?.[0]) setCity(found.cities[0]);
                }}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none"
              >
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flagEmoji} {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المدينة' : 'City'}
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none"
              >
                {selectedCountry?.cities.map(ct => (
                  <option key={ct} value={ct}>
                    {selectedCountry.citiesAr?.[ct] && language === 'ar' ? selectedCountry.citiesAr[ct] : ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'ar' ? 'رقم الهاتف' : 'Phone Number'}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+974 5512 3456"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? 'رقم الواتساب للتواصل' : 'WhatsApp Number'}</span>
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+974 5512 3456"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>
          </div>

          {/* Additional details for Job Seeker */}
          {role === 'job_seeker' && (
            <div className="space-y-3.5 pt-2 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-800 block">
                {language === 'ar' ? 'الخبرات والمؤهلات والمهارات:' : 'Experience, Education & Skills:'}
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'ar' ? 'سنوات الخبرة' : 'Years of Experience'}
                  </label>
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder="مثال: 4 سنوات في إدارة المبيعات"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    {language === 'ar' ? 'المؤهل العلمي' : 'Highest Degree'}
                  </label>
                  <input
                    type="text"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    placeholder="مثال: بكالوريوس محاسبة"
                    className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ar' ? 'المهارات الأساسية (افصل بفاصلة)' : 'Key Skills (comma separated)'}
                </label>
                <input
                  type="text"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="مثال: إدارة فرق، إكسل، تسويق رقمي، إنجليزية ممتازة"
                  className="w-full h-10 px-3 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  {language === 'ar' ? 'نبذة عنك وخلاصة خبراتك المهنية' : 'Professional Summary & Bio'}
                </label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="اكتب نبذة مهنية توضح ما يمكنك تقديمه لجهات العمل الخليجية..."
                  className="w-full p-3 rounded-xl border border-slate-200 text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* Footer Save Button */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              {language === 'ar' ? 'إغلاق' : 'Close'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? (language === 'ar' ? 'جارٍ الحفظ...' : 'Saving...') : (language === 'ar' ? 'حفظ الملف الشخصي' : 'Save Profile')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
