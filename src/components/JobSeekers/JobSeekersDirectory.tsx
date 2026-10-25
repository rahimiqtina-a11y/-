import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Phone, 
  Mail, 
  MessageCircle, 
  Sparkles, 
  Award, 
  GraduationCap, 
  Clock, 
  Filter, 
  PlusCircle, 
  Edit3, 
  Star,
  UserCheck,
  Globe,
  Share2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobSeeker, GCCCountry, JobCategory } from '../../types/job';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES } from '../../lib/initialData';

interface JobSeekersDirectoryProps {
  seekers: JobSeeker[];
  countries?: GCCCountry[];
  categories?: JobCategory[];
  onOpenSeekerEditor: () => void;
  onOpenProfile: () => void;
  onOpenLogin: () => void;
}

export const JobSeekersDirectory: React.FC<JobSeekersDirectoryProps> = ({
  seekers,
  countries = INITIAL_GCC_COUNTRIES,
  categories = INITIAL_JOB_CATEGORIES,
  onOpenSeekerEditor,
  onOpenProfile,
  onOpenLogin,
}) => {
  const { language } = useLanguage();
  const { user, userProfile } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [onlyBoosted, setOnlyBoosted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Active user's seeker profile if present
  const userSeekerProfile = user ? seekers.find(s => s.userId === user.uid) : null;

  // Filter candidates
  const filteredSeekers = seekers.filter(seeker => {
    // Only show active
    if (seeker.status === 'inactive') return false;

    // Boosted toggle
    if (onlyBoosted && !seeker.isBoosted) return false;

    // Country
    if (selectedCountry !== 'all' && seeker.countryId !== selectedCountry) return false;

    // Category
    if (selectedCategory !== 'all' && seeker.categoryId !== selectedCategory) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = seeker.name?.toLowerCase().includes(q);
      const matchTitle = seeker.targetJobTitle?.toLowerCase().includes(q);
      const matchSkills = seeker.skills?.toLowerCase().includes(q);
      const matchSummary = seeker.summary?.toLowerCase().includes(q);
      const matchCity = seeker.city?.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchSkills && !matchSummary && !matchCity) {
        return false;
      }
    }

    return true;
  });

  // Sort: Boosted first, then most recent
  const sortedSeekers = [...filteredSeekers].sort((a, b) => {
    if (a.isBoosted && !b.isBoosted) return -1;
    if (!a.isBoosted && b.isBoosted) return 1;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const getCountryObj = (countryId: string) => countries.find(c => c.id === countryId);
  const getCategoryObj = (catId: string) => categories.find(c => c.id === catId);

  const handleShare = (seeker: JobSeeker) => {
    const text = `${seeker.name} - ${seeker.targetJobTitle} | وظائف الخليج`;
    if (navigator.share) {
      navigator.share({ title: text, text, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      setCopiedId(seeker.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0A192F] via-[#0F3460] to-[#0A192F] text-white p-8 md:p-10 shadow-xl border border-slate-700/50">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>{language === 'ar' ? 'سوق الكفاءات والكوادر الخليجية' : 'GCC Talent & Candidate Directory'}</span>
            </div>
            
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {language === 'ar' 
                ? 'دليل الباحثين عن عمل في دول الخليج' 
                : 'Job Seekers & Talent Directory in the GCC'}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              {language === 'ar'
                ? 'منصة مباشرة تتيح للكوادر والمهنيين عرض خبراتهم وتخصصاتهم للتواصل الفوري مع مسؤولي التوظيف والشركات في قطر، الإمارات، السعودية، عمان، الكويت، والبحرين.'
                : 'A dedicated hub connecting qualified professionals with recruiters across Qatar, UAE, Saudi Arabia, Oman, Kuwait, and Bahrain.'}
            </p>

            {/* Action Bar based on Auth State */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {!user ? (
                <button
                  onClick={onOpenLogin}
                  className="px-5 py-3 rounded-2xl bg-[#00A896] hover:bg-[#008f80] text-white font-extrabold text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>{language === 'ar' ? 'سجل دخولك وانشر ملفك مجاناً' : 'Sign in & Publish Profile Free'}</span>
                </button>
              ) : userProfile?.role === 'job_seeker' ? (
                <button
                  onClick={onOpenSeekerEditor}
                  className="px-5 py-3 rounded-2xl bg-[#00A896] hover:bg-[#008f80] text-white font-extrabold text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition cursor-pointer"
                >
                  {userSeekerProfile ? (
                    <>
                      <Edit3 className="w-4 h-4" />
                      <span>{language === 'ar' ? 'تعديل أو تقوية ملفي الوظيفي ⭐' : 'Edit / Boost My Profile ⭐'}</span>
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      <span>{language === 'ar' ? 'نشر إعلاني في قائمة الباحثين عن عمل' : 'Add My Job Seeker Ad'}</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-200 text-xs font-semibold">
                  <span>
                    {language === 'ar' 
                      ? 'أنت مسجل كـ صاحب عمل: تصفح المرشحين وتواصل معهم مباشرة عبر واتساب' 
                      : 'Logged in as Employer: Browse candidates and connect directly via WhatsApp'}
                  </span>
                </div>
              )}

              {user && (
                <button
                  onClick={onOpenProfile}
                  className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold border border-slate-700 transition cursor-pointer"
                >
                  {language === 'ar' ? 'إعدادات حسابي' : 'My Account Settings'}
                </button>
              )}
            </div>
          </div>

          <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            
            {/* Search Input */}
            <div className="md:col-span-2 relative">
              <Search className="w-5 h-5 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'ar' ? 'ابحث بالاسم، المسمى الوظيفي، أو المهارات...' : 'Search by name, role, skills...'}
                className="w-full ps-11 pe-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A896] text-sm font-medium"
              />
            </div>

            {/* Country Selector */}
            <div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A896] text-sm font-semibold bg-white"
              >
                <option value="all">
                  {language === 'ar' ? '🌍 جميع دول الخليج' : '🌍 All GCC Countries'}
                </option>
                {countries.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.flagEmoji} {language === 'ar' ? c.nameAr : c.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#00A896] text-sm font-semibold bg-white"
              >
                <option value="all">
                  {language === 'ar' ? '💼 جميع التخصصات' : '💼 All Fields & Categories'}
                </option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {language === 'ar' ? cat.nameAr : cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick Filters / Toggles */}
          <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={onlyBoosted}
                onChange={(e) => setOnlyBoosted(e.target.checked)}
                className="w-4 h-4 text-[#00A896] rounded border-slate-300 focus:ring-[#00A896]"
              />
              <span className="flex items-center gap-1 text-amber-600">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {language === 'ar' ? 'عرض الكفاءات المتميزة فقط (المُرقّاة)' : 'Featured & Boosted Talent Only'}
              </span>
            </label>

            <span className="text-slate-400 font-semibold">
              {language === 'ar' 
                ? `النتائج: ${sortedSeekers.length} باحث عن عمل` 
                : `Showing ${sortedSeekers.length} job seekers`}
            </span>
          </div>
        </div>

        {/* Candidate Cards Grid */}
        {sortedSeekers.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">
              {language === 'ar' ? 'لم يتم العثور على باحثين عن عمل' : 'No job seekers match your criteria'}
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              {language === 'ar' 
                ? 'جرب تغيير فلاتر البحث أو اختيار دولة وتخصص مختلف، أو كن أول من يضيف ملفه في هذا التخصص!'
                : 'Try modifying your search query or filters, or be the first to publish your profile!'}
            </p>
            {user && userProfile?.role === 'job_seeker' && (
              <button
                onClick={onOpenSeekerEditor}
                className="px-6 py-2.5 rounded-xl bg-[#00A896] text-white font-bold text-sm hover:bg-[#008f80] transition cursor-pointer"
              >
                {language === 'ar' ? 'إضافة ملفي الآن' : 'Publish My Profile Now'}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedSeekers.map(seeker => {
              const country = getCountryObj(seeker.countryId);
              const category = getCategoryObj(seeker.categoryId);
              const isCurrentUser = user && user.uid === seeker.userId;

              return (
                <div
                  key={seeker.id}
                  className={`relative rounded-3xl bg-white border transition-all duration-200 hover:shadow-xl flex flex-col justify-between overflow-hidden ${
                    seeker.isBoosted 
                      ? 'border-amber-300 ring-2 ring-amber-400/30 shadow-md' 
                      : 'border-slate-200/90 shadow-xs'
                  }`}
                >
                  {/* Boosted Top Ribbon */}
                  {seeker.isBoosted && (
                    <div className="bg-linear-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-[11px] px-4 py-1.5 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
                        {language === 'ar' ? 'كفاءة متميزة مُرقّاة ⭐' : 'Featured Boosted Profile ⭐'}
                      </span>
                      <span className="text-[10px] font-bold opacity-80">
                        {language === 'ar' ? 'أولوية الظهور' : 'Top Priority'}
                      </span>
                    </div>
                  )}

                  <div className="p-6 space-y-4">
                    {/* Header: Photo + Name + Target Title */}
                    <div className="flex items-start gap-4">
                      {seeker.photoURL ? (
                        <img
                          src={seeker.photoURL}
                          alt={seeker.name}
                          className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-[#0A192F] to-[#00A896] text-white text-xl font-black flex items-center justify-center shrink-0 shadow-xs">
                          {seeker.name.charAt(0)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-extrabold text-base text-slate-900 truncate">
                            {seeker.name}
                          </h3>
                          <button
                            onClick={() => handleShare(seeker)}
                            title="Share"
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-teal-700 font-bold text-xs mt-0.5 leading-snug">
                          {seeker.targetJobTitle}
                        </p>

                        {/* Location */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-2">
                          <span className="text-base">{country?.flagEmoji || '📍'}</span>
                          <span>{language === 'ar' ? country?.nameAr : country?.nameEn}</span>
                          {seeker.city && (
                            <>
                              <span className="text-slate-300">•</span>
                              <span>{seeker.city}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category & Experience Badges */}
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      {category && (
                        <span className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 border border-teal-100">
                          {language === 'ar' ? category.nameAr : category.nameEn}
                        </span>
                      )}
                      {seeker.experienceYears && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{seeker.experienceYears}</span>
                        </span>
                      )}
                      {seeker.education && (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3 text-slate-400" />
                          <span className="truncate max-w-[120px]">{seeker.education}</span>
                        </span>
                      )}
                    </div>

                    {/* Bio / Summary */}
                    {seeker.summary && (
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                        "{seeker.summary}"
                      </p>
                    )}

                    {/* Skills Chips */}
                    {seeker.skills && (
                      <div className="space-y-1">
                        <div className="text-[11px] font-bold text-slate-400">
                          {language === 'ar' ? 'المهارات والخبرات:' : 'Skills & Competencies:'}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {seeker.skills.split(',').map((skill, idx) => {
                            const trimmed = skill.trim();
                            if (!trimmed) return null;
                            return (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
                              >
                                {trimmed}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Expected Salary */}
                    {seeker.expectedSalary && (
                      <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <span className="text-slate-400">{language === 'ar' ? 'الراتب المتوقع:' : 'Expected:'}</span>
                        <span className="text-[#00A896]">
                          {seeker.expectedSalary} {seeker.salaryCurrency || country?.currencyCode}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Contact & Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    {/* WhatsApp Button */}
                    {seeker.whatsapp ? (
                      <a
                        href={`https://wa.me/${seeker.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          language === 'ar'
                            ? `مرحباً ${seeker.name}، شاهدت ملفك الوظيفي (${seeker.targetJobTitle}) على منصة وظائف الخليج وأرغب بالتواصل معك بخصوص فرصة عمل.`
                            : `Hello ${seeker.name}, I came across your profile (${seeker.targetJobTitle}) on Gulf Jobs and would like to discuss an opportunity.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                      >
                        <MessageCircle className="w-4 h-4 fill-white" />
                        <span>{language === 'ar' ? 'واتساب' : 'WhatsApp'}</span>
                      </a>
                    ) : null}

                    {/* Phone Button */}
                    {seeker.phone && (
                      <a
                        href={`tel:${seeker.phone}`}
                        className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        title={language === 'ar' ? 'اتصال هاتف' : 'Call'}
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">{language === 'ar' ? 'اتصال' : 'Call'}</span>
                      </a>
                    )}

                    {/* Email Button */}
                    {seeker.email && (
                      <a
                        href={`mailto:${seeker.email}?subject=${encodeURIComponent(
                          language === 'ar' ? `فرصة عمل: ${seeker.targetJobTitle}` : `Job Opportunity: ${seeker.targetJobTitle}`
                        )}`}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        title={language === 'ar' ? 'إرسال بريد' : 'Email'}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}

                    {/* Edit button if owner */}
                    {isCurrentUser && (
                      <button
                        onClick={onOpenSeekerEditor}
                        className="py-2.5 px-3 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        title={language === 'ar' ? 'تعديل إعلاني' : 'Edit My Profile'}
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>{language === 'ar' ? 'تعديل' : 'Edit'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
