import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Sparkles, 
  Check, 
  MapPin, 
  Phone, 
  MessageCircle, 
  DollarSign, 
  Briefcase, 
  Award, 
  GraduationCap,
  Layers,
  Zap
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobSeeker, GCCCountry, JobCategory } from '../../types/job';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES } from '../../lib/initialData';

interface JobSeekerEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSeeker: (seekerData: Partial<JobSeeker>) => Promise<void>;
  existingSeeker?: JobSeeker | null;
  countries?: GCCCountry[];
  categories?: JobCategory[];
}

export const JobSeekerEditorModal: React.FC<JobSeekerEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveSeeker,
  existingSeeker,
  countries = INITIAL_GCC_COUNTRIES,
  categories = INITIAL_JOB_CATEGORIES,
}) => {
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();

  const [name, setName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [targetJobTitle, setTargetJobTitle] = useState('');
  const [countryId, setCountryId] = useState('qatar');
  const [city, setCity] = useState('Doha');
  const [categoryId, setCategoryId] = useState('sales-marketing');
  const [summary, setSummary] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [education, setEducation] = useState('');
  const [skills, setSkills] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');
  const [salaryCurrency, setSalaryCurrency] = useState('QAR');
  const [whatsapp, setWhatsapp] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isBoosted, setIsBoosted] = useState(false);
  const [status, setStatus] = useState<'active' | 'inactive'>('active');

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existingSeeker) {
      setName(existingSeeker.name || '');
      setPhotoURL(existingSeeker.photoURL || '');
      setTargetJobTitle(existingSeeker.targetJobTitle || '');
      setCountryId(existingSeeker.countryId || 'qatar');
      setCity(existingSeeker.city || 'Doha');
      setCategoryId(existingSeeker.categoryId || 'sales-marketing');
      setSummary(existingSeeker.summary || '');
      setExperienceYears(existingSeeker.experienceYears || '');
      setEducation(existingSeeker.education || '');
      setSkills(existingSeeker.skills || '');
      setExpectedSalary(existingSeeker.expectedSalary || '');
      setSalaryCurrency(existingSeeker.salaryCurrency || 'QAR');
      setWhatsapp(existingSeeker.whatsapp || '');
      setPhone(existingSeeker.phone || '');
      setEmail(existingSeeker.email || user?.email || '');
      setIsBoosted(existingSeeker.isBoosted || false);
      setStatus(existingSeeker.status || 'active');
    } else if (userProfile || user) {
      setName(userProfile?.displayName || user?.displayName || '');
      setPhotoURL(userProfile?.photoURL || user?.photoURL || '');
      setTargetJobTitle(userProfile?.headline || '');
      setCountryId(userProfile?.countryId || 'qatar');
      setCity(userProfile?.city || 'Doha');
      setCategoryId('sales-marketing');
      setSummary(userProfile?.bio || '');
      setExperienceYears(userProfile?.experienceYears || '');
      setEducation(userProfile?.education || '');
      setSkills(userProfile?.skills || '');
      setExpectedSalary('6000');
      setSalaryCurrency('QAR');
      setWhatsapp(userProfile?.whatsapp || '');
      setPhone(userProfile?.phone || '');
      setEmail(user?.email || '');
      setIsBoosted(true); // Enable boost by default for job seekers
      setStatus('active');
    }
    setError(null);
  }, [existingSeeker, userProfile, user, isOpen]);

  if (!isOpen || !user) return null;

  const handleCountryChange = (cid: string) => {
    setCountryId(cid);
    const c = countries.find(item => item.id === cid);
    if (c) {
      setSalaryCurrency(c.currencyCode);
      if (c.cities?.[0]) setCity(c.cities[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetJobTitle.trim()) {
      setError(language === 'ar' ? 'يرجى إدخال اسمك والمسمى الوظيفي المستهدف' : 'Please provide name and target job title');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const selectedCat = categories.find(c => c.id === categoryId);
      const selectedC = countries.find(c => c.id === countryId);

      await onSaveSeeker({
        userId: user.uid,
        name: name.trim(),
        photoURL: photoURL || userProfile?.photoURL || user.photoURL || '',
        targetJobTitle: targetJobTitle.trim(),
        countryId,
        countryNameAr: selectedC?.nameAr || countryId,
        city: city.trim(),
        categoryId,
        categoryNameAr: selectedCat?.nameAr || categoryId,
        summary: summary.trim(),
        experienceYears: experienceYears.trim(),
        education: education.trim(),
        skills: skills.trim(),
        expectedSalary: expectedSalary.trim(),
        salaryCurrency,
        whatsapp: whatsapp.trim(),
        phone: phone.trim(),
        email: email.trim() || user.email || '',
        isBoosted,
        status,
      });
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error saving job seeker profile');
    } finally {
      setIsSaving(false);
    }
  };

  const currentCountry = countries.find(c => c.id === countryId);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col text-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#0A192F] text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">
                {language === 'ar' ? 'إعلانك كباحث عن عمل في الخليج' : 'My Job Seeker Advertisement'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar' ? 'سيظهر ملفك لأصحاب العمل ومسؤولي التوظيف' : 'Visible to GCC recruiters and employers'}
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

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* BOOST BANNER (تقوية الباحثين عن عمل) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md shadow-amber-500/20 shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-extrabold text-xs sm:text-sm text-amber-950 block">
                  {language === 'ar' ? 'تقوية ملف الباحث عن عمل (Boost Profile)' : 'Boost Job Seeker Profile'}
                </span>
                <span className="text-[11px] text-amber-800">
                  {language === 'ar' ? 'يمنح ملفك علامة تمييز خاصة ويجعله يظهر في قمة نتائج الباحثين عن عمل' : 'Highlights your profile with a VIP badge at the top'}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={isBoosted}
                onChange={(e) => setIsBoosted(e.target.checked)}
                className="w-5 h-5 text-amber-500 rounded border-slate-300 focus:ring-amber-400 cursor-pointer"
              />
              <span className="text-xs font-bold text-amber-900 hidden sm:inline">
                {language === 'ar' ? 'تفعيل التقوية' : 'Enable'}
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: أحمد عبد الله"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المسمى الوظيفي المستهدف *' : 'Target Role *'}
              </label>
              <input
                type="text"
                required
                value={targetJobTitle}
                onChange={(e) => setTargetJobTitle(e.target.value)}
                placeholder="مثال: مدير مبيعات، مهندس مدني، ممرض"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-900 outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الدولة المستهدفة للعمل' : 'Target Country'}
              </label>
              <select
                value={countryId}
                onChange={(e) => handleCountryChange(e.target.value)}
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
                {currentCountry?.cities.map(ct => (
                  <option key={ct} value={ct}>
                    {currentCountry.citiesAr?.[ct] && language === 'ar' ? currentCountry.citiesAr[ct] : ct}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الفئة والتخصص' : 'Career Field'}
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full h-11 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-900 outline-none"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'الراتب المتوقع' : 'Expected Salary'} ({salaryCurrency})
              </label>
              <input
                type="text"
                value={expectedSalary}
                onChange={(e) => setExpectedSalary(e.target.value)}
                placeholder="مثال: 5000 - 7000"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>{language === 'ar' ? 'رقم الواتساب للتواصل المباشر *' : 'WhatsApp for Direct Contact *'}</span>
              </label>
              <input
                type="tel"
                required
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+974 5512 3456"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+974 5512 3456"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'سنوات الخبرة' : 'Experience Years'}
              </label>
              <input
                type="text"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
                placeholder="مثال: 5 سنوات خبرة في الخليج"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {language === 'ar' ? 'المؤهل العلمي' : 'Education'}
              </label>
              <input
                type="text"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder="مثال: بكالوريوس هندسة"
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'أهم المهارات (افصل بفاصلة)' : 'Key Skills'}
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              placeholder="مثال: مبيعات، تسويق، رخصة قيادة خليجية، إنجليزية ممتازة"
              className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {language === 'ar' ? 'نبذة تعريفية وموجز ما تبحث عنه' : 'Brief Bio & What you are looking for'}
            </label>
            <textarea
              rows={4}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="اكتب خلاصة خبرتك الوظيفية وما يمكنك تقديمه لصاحب العمل..."
              className="w-full p-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm leading-relaxed"
            />
          </div>

          {/* Visibility status */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-900 block">
                {language === 'ar' ? 'حالة الإعلان في قسم الباحثين عن عمل' : 'Listing Visibility'}
              </span>
              <span className="text-[11px] text-slate-500">
                {status === 'active' ? (language === 'ar' ? 'ظاهر للجميع' : 'Publicly visible') : (language === 'ar' ? 'مخفي مؤقتاً' : 'Temporarily hidden')}
              </span>
            </div>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="h-9 px-3 rounded-lg border border-slate-200 text-xs font-bold bg-white"
            >
              <option value="active">🟢 {language === 'ar' ? 'نشط وظاهر' : 'Active'}</option>
              <option value="inactive">⚪ {language === 'ar' ? 'معطل / مخفي' : 'Hidden'}</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-md shadow-teal-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isSaving ? (language === 'ar' ? 'جارٍ النشر...' : 'Publishing...') : (language === 'ar' ? 'نشر إعلاني' : 'Publish My Ad')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
