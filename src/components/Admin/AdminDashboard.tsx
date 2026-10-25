import React, { useState } from 'react';
import { 
  Plus, 
  Database, 
  Trash2, 
  Edit, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Layers, 
  MapPin, 
  Search, 
  LogOut, 
  ArrowLeft, 
  RefreshCw,
  FolderPlus,
  Building,
  Check,
  X,
  ShieldCheck,
  Briefcase,
  FileText,
  Clock,
  Star,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  Mail,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Megaphone,
  MousePointerClick,
  ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobAdvertisement, GCCCountry, JobCategory, JobStatus, EmployerMessage, AdBanner } from '../../types/job';
import { JobEditorModal } from './JobEditorModal';
import { BannerEditorModal } from './BannerEditorModal';
import { EmployersManagement } from './EmployersManagement';

interface AdminDashboardProps {
  jobs: JobAdvertisement[];
  countries: GCCCountry[];
  categories: JobCategory[];
  messages?: EmployerMessage[];
  banners?: AdBanner[];
  onSaveJob: (jobData: Partial<JobAdvertisement>, existingId?: string) => Promise<void>;
  onDeleteJob: (jobId: string) => Promise<void>;
  onUpdateJobStatus: (jobId: string, status: JobStatus) => Promise<void>;
  onToggleJobFeatured: (jobId: string, currentFeatured: boolean) => Promise<void>;
  onSaveCategory: (category: Partial<JobCategory>) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onSaveCountryCities: (countryId: string, cities: string[]) => Promise<void>;
  onUpdateMessageStatus?: (id: string, status: 'unread' | 'read' | 'replied') => Promise<void>;
  onDeleteMessage?: (id: string) => Promise<void>;
  onSaveBanner?: (banner: Partial<AdBanner>) => Promise<void>;
  onDeleteBanner?: (bannerId: string) => Promise<void>;
  onToggleBannerActive?: (bannerId: string, current: boolean) => Promise<void>;
  onSeedDemoBanners?: () => Promise<void>;
  onSeedInitialData: () => Promise<void>;
  onSeedDemoJobs: () => Promise<void>;
  onCloseAdmin: () => void;
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  jobs,
  countries,
  categories,
  messages = [],
  onSaveJob,
  onDeleteJob,
  onUpdateJobStatus,
  onToggleJobFeatured,
  onSaveCategory,
  onDeleteCategory,
  onSaveCountryCities,
  onUpdateMessageStatus,
  onDeleteMessage,
  banners = [],
  onSaveBanner,
  onDeleteBanner,
  onToggleBannerActive,
  onSeedDemoBanners,
  onSeedInitialData,
  onSeedDemoJobs,
  onCloseAdmin,
  onRefreshData,
}) => {
  const { language, t } = useLanguage();
  const { user, logout } = useAuth();

  // Active admin section: 'dashboard' | 'jobs' | 'employers' | 'messages' | 'banners' | 'categories' | 'countries' | 'system'
  const [activeSection, setActiveSection] = useState<'dashboard' | 'jobs' | 'employers' | 'messages' | 'banners' | 'categories' | 'countries' | 'system'>('dashboard');

  // Job Search/Filter
  const [adminJobSearch, setAdminJobSearch] = useState('');
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | JobStatus>('all');

  // Messages Search/Filter
  const [messageFilter, setMessageFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Partial<JobAdvertisement> | null>(null);
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);

  // Banner Editor Modal state
  const [isBannerEditorOpen, setIsBannerEditorOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<AdBanner | null>(null);
  const [deletingBannerId, setDeletingBannerId] = useState<string | null>(null);

  // New Category State
  const [newCatAr, setNewCatAr] = useState('');
  const [newCatEn, setNewCatEn] = useState('');

  // Country Cities Editor State
  const [selectedCountryId, setSelectedCountryId] = useState<string>(countries[0]?.id || 'qatar');
  const [newCityName, setNewCityName] = useState('');

  // Action status message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mobile sidebar toggle
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const showFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  // Stats calculation
  const totalActive = jobs.filter(j => j.status === 'published').length;
  const totalDrafts = jobs.filter(j => j.status === 'draft').length;
  const totalExpired = jobs.filter(j => j.status === 'expired').length;
  const totalFilled = jobs.filter(j => j.status === 'filled').length;
  const unreadMessagesCount = messages.filter(m => m.status === 'unread').length;
  const totalMessagesCount = messages.length;
  const totalBannersCount = banners.length;
  const activeBannersCount = banners.filter(b => b.isActive).length;
  const totalBannerClicks = banners.reduce((acc, b) => acc + (b.clicksCount || 0), 0);

  const handleOpenNewBanner = () => {
    setEditingBanner(null);
    setIsBannerEditorOpen(true);
  };

  const handleOpenEditBanner = (banner: AdBanner) => {
    setEditingBanner(banner);
    setIsBannerEditorOpen(true);
  };

  const handleConfirmDeleteBanner = async () => {
    if (!deletingBannerId || !onDeleteBanner) return;
    setIsProcessing(true);
    try {
      await onDeleteBanner(deletingBannerId);
      showFeedback(language === 'ar' ? 'تم حذف البانر الإعلاني بنجاح' : 'Banner deleted successfully');
      setDeletingBannerId(null);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesStatus = adminStatusFilter === 'all' || job.status === adminStatusFilter;
    const query = adminJobSearch.toLowerCase().trim();
    const matchesQuery = !query || 
      job.titleAr?.toLowerCase().includes(query) ||
      job.titleEn?.toLowerCase().includes(query) ||
      job.companyNameAr?.toLowerCase().includes(query) ||
      job.companyNameEn?.toLowerCase().includes(query);
    return matchesStatus && matchesQuery;
  });

  const handleOpenNewJob = () => {
    setEditingJob(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditJob = (job: JobAdvertisement) => {
    setEditingJob(job);
    setIsEditorOpen(true);
  };

  const handleConvertMessageToJob = (msg: EmployerMessage) => {
    setEditingJob({
      companyNameAr: msg.companyName || msg.senderName,
      companyNameEn: msg.companyName || msg.senderName,
      titleAr: msg.subject,
      titleEn: msg.subject,
      countryId: msg.countryId || 'qatar',
      contactEmail: msg.senderEmail,
      contactPhone: msg.senderPhone || '',
      contactWhatsapp: msg.senderPhone || '',
      descriptionAr: msg.jobDetails || msg.message,
      descriptionEn: '',
      status: 'published',
    });
    setIsEditorOpen(true);
    if (onUpdateMessageStatus && msg.status === 'unread') {
      onUpdateMessageStatus(msg.id, 'read');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingJobId) return;
    setIsProcessing(true);
    try {
      await onDeleteJob(deletingJobId);
      showFeedback(language === 'ar' ? 'تم حذف الإعلان بنجاح' : 'Job deleted successfully');
      setDeletingJobId(null);
    } catch (err: any) {
      console.error('Delete failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatAr.trim() || !newCatEn.trim()) return;
    setIsProcessing(true);
    try {
      const id = newCatEn.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await onSaveCategory({
        id,
        nameAr: newCatAr.trim(),
        nameEn: newCatEn.trim(),
        icon: 'Briefcase',
        order: categories.length + 1,
        isActive: true,
      });
      setNewCatAr('');
      setNewCatEn('');
      showFeedback(language === 'ar' ? 'تمت إضافة التصنيف بنجاح' : 'Category added successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const currentSelectedCountry = countries.find(c => c.id === selectedCountryId);

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim() || !currentSelectedCountry) return;
    const currentCities = currentSelectedCountry.cities || [];
    if (currentCities.includes(newCityName.trim())) return;

    setIsProcessing(true);
    try {
      const updatedCities = [...currentCities, newCityName.trim()];
      await onSaveCountryCities(currentSelectedCountry.id, updatedCities);
      setNewCityName('');
      showFeedback(language === 'ar' ? 'تمت إضافة المدينة بنجاح' : 'City added successfully');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveCity = async (cityName: string) => {
    if (!currentSelectedCountry) return;
    const updatedCities = currentSelectedCountry.cities.filter(c => c !== cityName);
    setIsProcessing(true);
    try {
      await onSaveCountryCities(currentSelectedCountry.id, updatedCities);
      showFeedback(language === 'ar' ? 'تم حذف المدينة' : 'City removed');
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row text-slate-800">
      
      {/* SIDEBAR MATCHING MOCKUP SCREEN 4 */}
      <aside className={`w-full md:w-64 bg-[#0A192F] text-white flex flex-col shrink-0 md:min-h-screen ${sidebarOpen ? 'block' : 'hidden md:flex'}`}>
        
        {/* Brand & User Profile in Sidebar */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#00A896] text-white flex items-center justify-center font-black shadow-lg shadow-teal-500/20">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-base leading-tight">Gulf Jobs</div>
              <div className="text-xs text-teal-400 font-bold">وظائف الخليج</div>
            </div>
          </div>

          {/* User Profile Avatar Card matching Mockup Screen 4 */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-teal-300 font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="font-bold text-sm text-white truncate">
                {user?.displayName || 'admin'}
              </div>
              <div className="text-[11px] text-teal-400 font-medium">
                {language === 'ar' ? 'مدير النظام' : 'Super Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Nav Items matching Mockup Screen 4 */}
        <nav className="p-4 space-y-1.5 flex-1 text-xs font-bold">
          
          <button
            onClick={() => { setActiveSection('dashboard'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'dashboard'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{language === 'ar' ? 'لوحة التحكم' : 'Dashboard'}</span>
          </button>

          <button
            onClick={() => { setActiveSection('jobs'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'jobs'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>{language === 'ar' ? 'الوظائف' : 'All Jobs'}</span>
          </button>

          <button
            onClick={() => { setActiveSection('employers'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'employers'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'ar' ? 'أصحاب العمل وتراخيص النشر' : 'Employers & Publishing'}</span>
          </button>

          <button
            onClick={() => { handleOpenNewJob(); setSidebarOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-teal-300 hover:bg-slate-800/70 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إضافة وظيفة +' : 'Add Job +'}</span>
          </button>

          <button
            onClick={() => { setActiveSection('messages'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'messages'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageSquare className="w-4 h-4" />
              <span>{language === 'ar' ? 'الرسائل والطلبات' : 'Employer Inquiries'}</span>
            </div>
            {unreadMessagesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black animate-pulse">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveSection('banners'); setSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'banners'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-4 h-4" />
              <span>{language === 'ar' ? 'البانرات الإعلانية' : 'Ad Banners'}</span>
            </div>
            {totalBannersCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-400/30 text-[10px] font-black">
                {activeBannersCount}/{totalBannersCount}
              </span>
            )}
          </button>

          <button
            onClick={() => { setActiveSection('categories'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'categories'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <FolderPlus className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدارة الفئات' : 'Manage Categories'}</span>
          </button>

          <button
            onClick={() => { setActiveSection('countries'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'countries'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>{language === 'ar' ? 'إدارة الدول والمدن' : 'Countries & Cities'}</span>
          </button>

          <button
            onClick={() => { setActiveSection('system'); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all cursor-pointer ${
              activeSection === 'system'
                ? 'bg-[#00A896] text-white shadow-md'
                : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{t.admin.tabSystem}</span>
          </button>
        </nav>

        {/* Sidebar Footer: Back to Site & Logout */}
        <div className="p-4 border-t border-slate-800 space-y-2">
          <button
            onClick={onCloseAdmin}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'ar' ? 'العودة للموقع' : 'Back to Website'}</span>
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-950/40 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>{t.nav.logout}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA MATCHING MOCKUP SCREEN 4 */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 md:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">
              {language === 'ar' ? 'لوحة التحكم' : 'Admin Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewJob}
              className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-xs shadow-md shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>{language === 'ar' ? 'إضافة وظيفة' : 'Add Job'}</span>
            </button>

            <button
              onClick={onRefreshData}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-5 sm:p-8 space-y-6 flex-1 overflow-y-auto max-w-7xl w-full mx-auto">
          
          {actionFeedback && (
            <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check className="w-4 h-4 text-teal-600" />
              <span>{actionFeedback}</span>
            </div>
          )}

          {/* 4 STATS CARDS MATCHING MOCKUP SCREEN 4 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1. الوظائف النشطة (Green Card) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 block mb-1">
                  {language === 'ar' ? 'الوظائف النشطة' : 'Active Jobs'}
                </span>
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalActive}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>

            {/* 2. المسودات (Orange Card) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-600 block mb-1">
                  {language === 'ar' ? 'المسودات' : 'Drafts'}
                </span>
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalDrafts}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
            </div>

            {/* 3. المنتهية (Red Card) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-600 block mb-1">
                  {language === 'ar' ? 'المنتهية' : 'Expired'}
                </span>
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalExpired}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            {/* 4. المعينة / المشغولة (Purple Card) */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-purple-600 block mb-1">
                  {language === 'ar' ? 'المعينة / المشغولة' : 'Filled Jobs'}
                </span>
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {totalFilled}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
            </div>

            {/* 5. طلبات أصحاب العمل (Teal/Amber Card) */}
            <div 
              onClick={() => setActiveSection('messages')}
              className="col-span-2 lg:col-span-2 p-5 rounded-3xl bg-linear-to-r from-teal-50 to-amber-50 border border-teal-200 shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#00A896] text-white flex items-center justify-center shadow-xs shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">
                      {language === 'ar' ? 'طلبات أصحاب العمل' : 'Employer Inquiries'}
                    </span>
                    {unreadMessagesCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-xs">
                        {unreadMessagesCount} {language === 'ar' ? 'جديد' : 'new'}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {language === 'ar' ? 'رسائل وطلبات النشر الواردة' : 'Incoming vacancy requests'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-teal-800">{totalMessagesCount}</span>
                <span className="text-[10px] block font-bold text-slate-400">{language === 'ar' ? 'طلب' : 'Total'}</span>
              </div>
            </div>

            {/* 6. البانرات الإعلانية (Navy/Teal Card) */}
            <div 
              onClick={() => setActiveSection('banners')}
              className="col-span-2 lg:col-span-2 p-5 rounded-3xl bg-linear-to-r from-slate-900 to-teal-950 border border-teal-500/30 text-white shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/30 flex items-center justify-center shadow-xs shrink-0">
                  <Megaphone className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {language === 'ar' ? 'البانرات الإعلانية' : 'Ad Banners'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 font-black text-xs">
                      {activeBannersCount} {language === 'ar' ? 'نشط' : 'active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    {language === 'ar' ? `إجمالي النقرات: ${totalBannerClicks} نقرة` : `${totalBannerClicks} total clicks`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono text-teal-300">{totalBannersCount}</span>
                <span className="text-[10px] block font-bold text-slate-400">{language === 'ar' ? 'بانر' : 'Banners'}</span>
              </div>
            </div>

            {/* 7. أصحاب العمل وتراخيص النشر (Emerald/Navy Card) */}
            <div 
              onClick={() => setActiveSection('employers')}
              className="col-span-2 lg:col-span-2 p-5 rounded-3xl bg-linear-to-r from-teal-900 to-slate-900 border border-teal-500/40 text-white shadow-xs flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-[#00A896] text-white flex items-center justify-center shadow-xs shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {language === 'ar' ? 'أصحاب العمل وتراخيص النشر' : 'Employers & Publishing Rights'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-xs">
                      {language === 'ar' ? 'مراقبة الصلاحيات' : 'Manage'}
                    </span>
                  </div>
                  <p className="text-[11px] text-teal-200 mt-0.5">
                    {language === 'ar' ? 'تفعيل أصحاب العمل وتحديد فترات النشر (أسبوع/شهر/سنة)' : 'Activate employers & set validity periods'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <ShieldCheck className="w-6 h-6 text-teal-300" />
              </div>
            </div>

          </div>

          {/* SECTION: EMPLOYERS MANAGEMENT & PUBLISHING APPROVALS */}
          {activeSection === 'employers' && (
            <EmployersManagement jobs={jobs} onFeedback={showFeedback} />
          )}

          {/* SECTION: MESSAGES / EMPLOYER REQUESTS */}
          {activeSection === 'messages' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {language === 'ar' ? 'رسائل وطلبات نشر الوظائف من أصحاب العمل' : 'Employer Vacancy Publishing Requests'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs">
                      {messages.length}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {language === 'ar' 
                      ? 'وفق سياسة المنصة: لا يمكن لأصحاب العمل النشر المباشر. تراجع هذه الطلبات هنا ثم يمكنك نشرها باسم شركتهم.' 
                      : 'As per platform policy, employers request vacancy publishing here for admin review and approval.'}
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold">
                  <button
                    onClick={() => setMessageFilter('all')}
                    className={`px-3 py-1.5 rounded-xl transition ${messageFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {language === 'ar' ? 'الكل' : 'All'}
                  </button>
                  <button
                    onClick={() => setMessageFilter('unread')}
                    className={`px-3 py-1.5 rounded-xl transition ${messageFilter === 'unread' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {language === 'ar' ? 'غير مقروء' : 'Unread'}
                  </button>
                  <button
                    onClick={() => setMessageFilter('replied')}
                    className={`px-3 py-1.5 rounded-xl transition ${messageFilter === 'replied' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    {language === 'ar' ? 'تم النشر / الرد' : 'Published'}
                  </button>
                </div>
              </div>

              {/* Message Cards List */}
              {messages.filter(m => messageFilter === 'all' || m.status === messageFilter).length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Mail className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-700">
                    {language === 'ar' ? 'لا توجد رسائل في هذا القسم' : 'No messages in this filter'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {language === 'ar' 
                      ? 'عندما يسجل أي صاحب عمل دخوله بحساب Google ويرسل طلباً لنشر وظيفة ستصلك تفاصيل الشركة والشاغر هنا.' 
                      : 'When employers sign in and submit a job publishing request, details will appear here.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages
                    .filter(m => messageFilter === 'all' || m.status === messageFilter)
                    .map((msg) => {
                      const msgCountry = countries.find(c => c.id === msg.countryId);
                      return (
                        <div
                          key={msg.id}
                          className={`p-6 rounded-3xl border transition-all ${
                            msg.status === 'unread'
                              ? 'bg-amber-50/40 border-amber-300 shadow-xs'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-sm">
                                <Briefcase className="w-5 h-5 text-teal-400" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-black text-base text-slate-900">
                                    {msg.companyName || msg.senderName}
                                  </h3>
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black ${
                                    msg.status === 'unread'
                                      ? 'bg-amber-200 text-amber-900'
                                      : msg.status === 'replied'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {msg.status === 'unread'
                                      ? (language === 'ar' ? 'طلب جديد' : 'New Request')
                                      : msg.status === 'replied'
                                      ? (language === 'ar' ? 'تم الرد / النشر' : 'Converted / Replied')
                                      : (language === 'ar' ? 'تم الاطلاع' : 'Read')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                                  <span>{msg.senderName}</span>
                                  {msgCountry && (
                                    <>
                                      <span>•</span>
                                      <span>{msgCountry.flagEmoji} {language === 'ar' ? msgCountry.nameAr : msgCountry.nameEn}</span>
                                    </>
                                  )}
                                  <span>•</span>
                                  <span className="font-mono text-[11px]">
                                    {new Date(msg.createdAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Convert to Job & Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleConvertMessageToJob(msg)}
                                className="px-4 py-2 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-black text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                              >
                                <Sparkles className="w-4 h-4" />
                                <span>{language === 'ar' ? 'تحويل إلى إعلان وظيفي +' : 'Convert to Job Ad +'}</span>
                              </button>

                              {onUpdateMessageStatus && msg.status === 'unread' && (
                                <button
                                  onClick={() => onUpdateMessageStatus(msg.id, 'read')}
                                  className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
                                  title={language === 'ar' ? 'تعليم كمقروء' : 'Mark Read'}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}

                              {onDeleteMessage && (
                                <button
                                  onClick={() => onDeleteMessage(msg.id)}
                                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition"
                                  title={language === 'ar' ? 'حذف' : 'Delete'}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Subject & Details */}
                          <div className="mt-4 space-y-3">
                            <div className="font-extrabold text-sm text-slate-800">
                              {language === 'ar' ? 'الموضوع / المسمى المطلوب:' : 'Subject / Position:'} {msg.subject}
                            </div>

                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {msg.jobDetails || msg.message}
                            </div>

                            {/* Contact Badges */}
                            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                              {msg.senderEmail && (
                                <a
                                  href={`mailto:${msg.senderEmail}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>{msg.senderEmail}</span>
                                </a>
                              )}

                              {msg.senderPhone && (
                                <a
                                  href={`https://wa.me/${msg.senderPhone.replace(/[^0-9]/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                  <span>{msg.senderPhone}</span>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* SECTION: BANNERS MANAGEMENT */}
          {activeSection === 'banners' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">
                      {language === 'ar' ? 'إدارة البانرات الإعلانية وروابط المواقع' : 'Ad Banners & Sponsored Links'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs">
                      {banners.length} {language === 'ar' ? 'بانر' : 'banners'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 max-w-xl">
                    {language === 'ar'
                      ? 'تحكم كامل في البانرات الإعلانية التي تظهر في الصفحة الرئيسية أو داخل فئات محددة. ترتبط بموقع إلكتروني خارجي مع تتبع عدد النقرات.'
                      : 'Create and manage banners displayed on Homepage or specific job categories linked to external sites.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleOpenNewBanner}
                    className="px-4 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-black text-xs flex items-center gap-2 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إضافة بانر جديد +' : 'Add New Banner +'}</span>
                  </button>

                  {banners.length === 0 && onSeedDemoBanners && (
                    <button
                      onClick={async () => {
                        setIsProcessing(true);
                        try {
                          await onSeedDemoBanners();
                          showFeedback(language === 'ar' ? 'تمت إضافة نماذج بانرات تجريبية' : 'Demo banners added');
                        } catch (err) {
                          console.error(err);
                        } finally {
                          setIsProcessing(false);
                        }
                      }}
                      disabled={isProcessing}
                      className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer"
                    >
                      {language === 'ar' ? 'تهيئة نماذج بانرات' : 'Seed Sample Banners'}
                    </button>
                  )}
                </div>
              </div>

              {banners.length === 0 ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-700">
                    {language === 'ar' ? 'لا توجد بانرات إعلانية مضافة حالياً' : 'No ad banners found'}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    {language === 'ar'
                      ? 'يمكنك إضافة بانرات ترويجية تظهر في الصفحة الرئيسية للتطبيق أو داخل فئات العمل المختارة وتوجه الزوار لمواقع خارجية.'
                      : 'Add promotional banners that link directly to external websites.'}
                  </p>
                  <button
                    onClick={handleOpenNewBanner}
                    className="px-5 py-2.5 rounded-xl bg-[#00A896] text-white font-bold text-xs hover:bg-[#008f80] transition cursor-pointer inline-flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{language === 'ar' ? 'إضافة أول بانر إعلاني الآن' : 'Add First Banner Now'}</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {banners.map((banner) => (
                    <div
                      key={banner.id}
                      className={`p-5 rounded-3xl border transition-all space-y-4 ${
                        banner.isActive
                          ? 'bg-white border-slate-200 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200 opacity-70'
                      }`}
                    >
                      <div className="flex gap-4">
                        {banner.imageUrl ? (
                          <img
                            src={banner.imageUrl}
                            alt={banner.titleAr}
                            className="w-24 h-20 rounded-2xl object-cover shrink-0 border border-slate-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-24 h-20 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <ImageIcon className="w-6 h-6" />
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            {/* Format & Placement Tags */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Format Badge */}
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                                banner.bannerType === 'code'
                                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                  : banner.bannerType === 'smart_link'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-800 border border-slate-200'
                              }`}>
                                {banner.bannerType === 'code' ? '💻 كود مخصص' : banner.bannerType === 'smart_link' ? '⚡ رابط ذكي' : '🖼️ بانر صوري'}
                              </span>

                              {/* Placement Tag */}
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                                banner.placement === 'home'
                                  ? 'bg-blue-100 text-blue-800'
                                  : banner.placement === 'category'
                                  ? 'bg-teal-100 text-teal-800'
                                  : banner.placement === 'all_categories'
                                  ? 'bg-purple-100 text-purple-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {banner.placement === 'home' && (language === 'ar' ? '🏠 الرئيسية' : 'Home')}
                                {banner.placement === 'category' && (
                                  language === 'ar' ? `💼 فئة: ${banner.categoryNameAr || banner.categoryId}` : `Category: ${banner.categoryNameEn || banner.categoryId}`
                                )}
                                {banner.placement === 'all_categories' && (language === 'ar' ? '📂 كل الفئات' : 'All Categories')}
                                {banner.placement === 'global' && (language === 'ar' ? '🌐 شامل' : 'Global')}
                              </span>
                            </div>

                            {/* Active Status Badge */}
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              banner.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                            }`}>
                              {banner.isActive ? (language === 'ar' ? 'نشط' : 'Active') : (language === 'ar' ? 'معطل' : 'Inactive')}
                            </span>
                          </div>

                          <h4 className="font-black text-sm text-slate-900 truncate">
                            {banner.titleAr}
                          </h4>
                          {banner.titleEn && (
                            <p className="text-xs text-slate-400 truncate">{banner.titleEn}</p>
                          )}
                          {banner.subtitleAr && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">{banner.subtitleAr}</p>
                          )}
                        </div>
                      </div>

                      {/* Target Link */}
                      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate min-w-0">
                          <ExternalLink className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                          <span className="text-slate-400 font-bold shrink-0">{language === 'ar' ? 'الموقع المستهدف:' : 'Target URL:'}</span>
                          <a
                            href={banner.targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-teal-700 hover:underline truncate"
                          >
                            {banner.targetUrl}
                          </a>
                        </div>
                      </div>

                      {/* Footer Actions & Clicks */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-slate-600">
                          <MousePointerClick className="w-4 h-4 text-teal-600" />
                          <span>{language === 'ar' ? `${banner.clicksCount || 0} نقرة` : `${banner.clicksCount || 0} clicks`}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {onToggleBannerActive && (
                            <button
                              onClick={() => onToggleBannerActive(banner.id, banner.isActive)}
                              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                                banner.isActive 
                                  ? 'border-slate-200 text-slate-600 hover:bg-slate-100' 
                                  : 'border-teal-300 bg-teal-50 text-teal-800'
                              }`}
                            >
                              {banner.isActive ? (language === 'ar' ? 'تعطيل' : 'Deactivate') : (language === 'ar' ? 'تفعيل' : 'Activate')}
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenEditBanner(banner)}
                            className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                            title={language === 'ar' ? 'تعديل البانر' : 'Edit Banner'}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeletingBannerId(banner.id)}
                            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title={language === 'ar' ? 'حذف البانر' : 'Delete Banner'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          )}

          {/* SECTION: أحدث الوظائف MATCHING MOCKUP SCREEN 4 */}
          {(activeSection === 'dashboard' || activeSection === 'jobs') && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-4">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {language === 'ar' ? 'أحدث الوظائف' : 'Recent Job Advertisements'}
                  </h2>
                  <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    ({filteredJobs.length})
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={adminJobSearch}
                      onChange={(e) => setAdminJobSearch(e.target.value)}
                      placeholder={language === 'ar' ? 'بحث في الوظائف...' : 'Search jobs...'}
                      className="h-9 ps-8 pe-3 rounded-xl border border-slate-200 text-xs outline-none focus:border-teal-500"
                    />
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
                  </div>

                  <select
                    value={adminStatusFilter}
                    onChange={(e) => setAdminStatusFilter(e.target.value as any)}
                    className="h-9 px-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none"
                  >
                    <option value="all">{t.types.all}</option>
                    <option value="published">🟢 {t.admin.statusPublished}</option>
                    <option value="draft">🟡 {t.admin.statusDraft}</option>
                    <option value="filled">🔵 {t.admin.statusFilled}</option>
                    <option value="expired">🔴 {t.admin.statusExpired}</option>
                  </select>
                </div>
              </div>

              {/* Jobs List matching Mockup Screen 4 Rows */}
              <div className="divide-y divide-slate-100">
                {filteredJobs.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    {language === 'ar' ? 'لا توجد إعلانات مطابقة' : 'No jobs found.'}
                  </div>
                ) : (
                  filteredJobs.map((job) => (
                    <div key={job.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 px-3 rounded-2xl transition-colors">
                      
                      {/* Left: Status Dot, Titles, Location, Salary */}
                      <div className="flex items-start gap-3">
                        <div className="pt-1.5">
                          <span className={`w-3 h-3 rounded-full inline-block ${
                            job.status === 'published' ? 'bg-emerald-500' :
                            job.status === 'draft' ? 'bg-amber-500' :
                            job.status === 'filled' ? 'bg-purple-500' :
                            'bg-rose-500'
                          }`} />
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm text-slate-900">
                              {job.titleAr}
                            </span>
                            {job.titleEn && (
                              <span className="text-xs text-slate-500 font-bold">
                                {job.titleEn}
                              </span>
                            )}
                            {job.isFeatured && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold">
                                مميز
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="font-semibold text-slate-700">
                              {job.companyNameAr || job.companyNameEn || 'الشركة'}
                            </span>
                            <span>•</span>
                            <span>{job.countryNameAr || job.countryId} - {job.city}</span>
                            <span>•</span>
                            <span className="font-mono font-bold text-teal-700">
                              {job.salaryDisclosed ? `${job.salaryCurrency} ${job.minSalary.toLocaleString()} - ${job.maxSalary.toLocaleString()}` : t.jobCard.notDisclosed}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center">
                        <button
                          onClick={() => onToggleJobFeatured(job.id, job.isFeatured)}
                          className={`p-2 rounded-xl border transition-colors ${
                            job.isFeatured ? 'bg-amber-100 border-amber-300 text-amber-800' : 'border-slate-200 text-slate-400 hover:text-slate-600'
                          }`}
                          title="Featured"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>

                        {job.status === 'published' ? (
                          <button
                            onClick={() => onUpdateJobStatus(job.id, 'draft')}
                            className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                          >
                            {language === 'ar' ? 'تعطيل' : 'Unpublish'}
                          </button>
                        ) : (
                          <button
                            onClick={() => onUpdateJobStatus(job.id, 'published')}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 text-xs font-bold"
                          >
                            {language === 'ar' ? 'نشر' : 'Publish'}
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEditJob(job)}
                          className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setDeletingJobId(job.id)}
                          className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  ))
                )}
              </div>

            </div>
          )}

          {/* SECTION: CATEGORIES MANAGEMENT */}
          {activeSection === 'categories' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900">
                {language === 'ar' ? 'إدارة الفئات المهنية' : 'Manage Job Categories'}
              </h2>

              <form onSubmit={handleAddCategory} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">
                  {language === 'ar' ? 'إضافة فئة وظيفية جديدة:' : 'Add New Category:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={newCatAr}
                    onChange={(e) => setNewCatAr(e.target.value)}
                    placeholder="اسم الفئة بالعربية"
                    className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    dir="rtl"
                  />
                  <input
                    type="text"
                    required
                    value={newCatEn}
                    onChange={(e) => setNewCatEn(e.target.value)}
                    placeholder="Category Name in English"
                    className="h-10 px-3 rounded-xl border border-slate-200 text-xs"
                    dir="ltr"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs"
                >
                  {language === 'ar' ? 'حفظ الفئة' : 'Save Category'}
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {categories.map((cat) => (
                  <div key={cat.id} className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{cat.nameAr}</h4>
                      <p className="text-[11px] text-slate-400">{cat.nameEn}</p>
                    </div>
                    <button
                      onClick={() => onDeleteCategory(cat.id)}
                      className="text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: COUNTRIES & CITIES MANAGEMENT */}
          {activeSection === 'countries' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-extrabold text-slate-900">
                {language === 'ar' ? 'إدارة دول ومدن الخليج العربي' : 'Manage GCC Countries & Cities'}
              </h2>

              <div className="flex flex-wrap gap-2 pb-2">
                {countries.map(country => (
                  <button
                    key={country.id}
                    onClick={() => setSelectedCountryId(country.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      selectedCountryId === country.id
                        ? 'bg-teal-600 text-slate-950 shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {country.flagEmoji} {language === 'ar' ? country.nameAr : country.nameEn}
                  </button>
                ))}
              </div>

              {currentSelectedCountry && (
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-slate-900">
                      {language === 'ar' ? `مدن ${currentSelectedCountry.nameAr}` : `Cities in ${currentSelectedCountry.nameEn}`}
                    </h3>
                    <span className="text-xs font-mono font-bold text-teal-700">
                      Currency: {currentSelectedCountry.currencyCode}
                    </span>
                  </div>

                  <form onSubmit={handleAddCity} className="flex gap-2">
                    <input
                      type="text"
                      value={newCityName}
                      onChange={(e) => setNewCityName(e.target.value)}
                      placeholder={language === 'ar' ? 'اسم المدينة الجديدة...' : 'Enter new city name...'}
                      className="h-10 px-3 rounded-xl border border-slate-200 text-xs flex-1 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs"
                    >
                      {language === 'ar' ? 'إضافة مدينة' : 'Add City'}
                    </button>
                  </form>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {currentSelectedCountry.cities?.map(city => (
                      <span key={city} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs text-slate-800 font-semibold shadow-xs">
                        <span>{city}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCity(city)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SECTION: DATABASE & SEEDER */}
          {activeSection === 'system' && (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 space-y-6">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 mb-1">
                  {t.admin.tabSystem}
                </h2>
                <p className="text-xs text-slate-500">
                  {t.admin.seedNotice}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-600" />
                    <span>{t.admin.seedInitialData}</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'تهيئة دول الخليج الست مع مدنها وعملاتها و15 فئة وظيفية في قاعدة البيانات.'
                      : 'Seeds all 6 GCC countries, managed cities, currencies and categories.'}
                  </p>
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        await onSeedInitialData();
                        showFeedback(language === 'ar' ? 'تمت تهيئة الدول والتصنيفات بنجاح!' : 'Countries and categories seeded!');
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs"
                  >
                    {t.admin.seedInitialData}
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>{t.admin.seedDemoData}</span>
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {language === 'ar'
                      ? 'يضيف نماذج واقعية للوظائف في دول الخليج موسومة بعلامة تجريبية واضحة (Demo) لاختبار البحث والفلاتر.'
                      : 'Populates verified sample GCC job listings clearly tagged as Demo.'}
                  </p>
                  <button
                    onClick={async () => {
                      setIsProcessing(true);
                      try {
                        await onSeedDemoJobs();
                        showFeedback(language === 'ar' ? 'تمت إضافة الوظائف التجريبية بنجاح!' : 'Sample demo jobs seeded!');
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setIsProcessing(false);
                      }
                    }}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    {t.admin.seedDemoData}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Job Editor Modal */}
      <JobEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialJob={editingJob}
        countries={countries}
        categories={categories}
        onAddNewCategory={async (newCat) => {
          await onSaveCategory(newCat);
          showFeedback(language === 'ar' ? 'تمت إضافة الفئة بنجاح!' : 'Category added successfully!');
          return newCat as JobCategory;
        }}
        onSave={async (jobData) => {
          await onSaveJob(jobData, editingJob?.id);
          showFeedback(language === 'ar' ? 'تم حفظ الإعلان بنجاح!' : 'Job listing saved successfully!');
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingJobId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">
              {t.admin.confirmDeleteTitle}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.admin.confirmDeleteDesc}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingJobId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
              >
                {t.admin.cancel}
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                {t.admin.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner Editor Modal */}
      <BannerEditorModal
        isOpen={isBannerEditorOpen}
        onClose={() => setIsBannerEditorOpen(false)}
        initialBanner={editingBanner}
        categories={categories}
        onSaveBanner={async (bannerData) => {
          if (onSaveBanner) {
            await onSaveBanner(bannerData);
            showFeedback(language === 'ar' ? 'تم حفظ ونشر البانر الإعلاني بنجاح!' : 'Banner saved successfully!');
          }
        }}
      />

      {/* Delete Banner Confirmation Modal */}
      {deletingBannerId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">
              {language === 'ar' ? 'تأكيد حذف البانر الإعلاني' : 'Confirm Banner Deletion'}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === 'ar' 
                ? 'هل أنت متأكد من رغبتك بحذف هذا البانر الإعلاني؟ لن يظهر مجدداً في صفحات المنصة.'
                : 'Are you sure you want to delete this banner? It will no longer appear on the site.'}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeletingBannerId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                {t.admin.cancel}
              </button>
              <button
                onClick={handleConfirmDeleteBanner}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
              >
                {t.admin.confirmDelete}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

