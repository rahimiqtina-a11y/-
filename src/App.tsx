import React, { useState, useEffect, useMemo } from 'react';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import { db, testConnection, handleFirestoreError, OperationType } from './lib/firebase';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { SearchFilters } from './components/SearchFilters';
import { CountryCards } from './components/CountryCards';
import { CountryFlag } from './components/CountryFlag';
import { CategoryList } from './components/CategoryList';
import { JobCard } from './components/JobCard';
import { JobDetailsModal } from './components/JobDetailsModal';
import { ImageModal } from './components/ImageModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminLoginModal } from './components/Admin/AdminLoginModal';
import { AboutModal, ContactModal } from './components/AboutContactModals';
import { BottomNav, BottomNavTab } from './components/BottomNav';
import { Footer } from './components/Footer';
import { JobSeekersDirectory } from './components/JobSeekers/JobSeekersDirectory';
import { JobSeekerEditorModal } from './components/JobSeekers/JobSeekerEditorModal';
import { ProfileModal } from './components/Profile/ProfileModal';
import { EmployerInquiryModal } from './components/Employer/EmployerInquiryModal';
import { ApplyJobModal } from './components/Applications/ApplyJobModal';
import { MyApplicationsModal } from './components/Applications/MyApplicationsModal';
import { EmployerOfficeModal } from './components/Employer/EmployerOfficeModal';
import { RoleOnboardingModal } from './components/Auth/RoleOnboardingModal';
import { AdBannerCard } from './components/Banners/AdBannerCard';
import { PrivacyPolicyModal } from './components/Legal/PrivacyPolicyModal';
import { GooglePlayReviewModal } from './components/Legal/GooglePlayReviewModal';
import { JobEditorModal } from './components/Admin/JobEditorModal';
import { matchesKeyword } from './lib/arabicUtils';
import { INITIAL_GCC_COUNTRIES, INITIAL_JOB_CATEGORIES, SAMPLE_DEMO_JOBS, SAMPLE_AD_BANNERS } from './lib/initialData';
import { JobAdvertisement, GCCCountry, JobCategory, SearchFilterState, JobStatus, JobSeeker, EmployerMessage, AdBanner, UserRole } from './types/job';
import { 
  Briefcase, 
  RotateCcw, 
  ChevronDown, 
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Users,
  Sparkles,
  UserCheck
} from 'lucide-react';

const INITIAL_FILTERS: SearchFilterState = {
  keyword: '',
  countryId: 'all',
  city: 'all',
  categoryId: 'all',
  minSalary: 0,
  maxSalary: 0,
  salaryDisclosedOnly: false,
  includeUndisclosed: true,
  employmentType: 'all',
  experienceLevel: 'all',
  sortBy: 'newest',
};

// Rich sample GCC talent profiles to populate directory if database is empty
const INITIAL_SAMPLE_SEEKERS: JobSeeker[] = [
  {
    id: 'seeker_demo_1',
    userId: 'demo_user_1',
    name: 'أحمد بن عبد الرحمن الشمري',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    targetJobTitle: 'مدير تسويق رقمي وحملات إعلانية',
    countryId: 'qatar',
    countryNameAr: 'قطر',
    city: 'الدوحة',
    categoryId: 'sales-marketing',
    categoryNameAr: 'المبيعات والتسويق',
    summary: 'خبرة أكثر من 7 سنوات في إدارة الحملات الإعلانية الممولة وقيادة فرق التسويق في منطقة الخليج العربي وتحسين محركات البحث SEO.',
    experienceYears: '7 سنوات',
    education: 'بكالوريوس إدارة أعمال وتسويق',
    skills: 'Google Ads, Meta Ads, SEO, تحليل البيانات, قيادة الفرق',
    expectedSalary: '14,000',
    salaryCurrency: 'QAR',
    whatsapp: '+97455123456',
    phone: '+97455123456',
    email: 'ahmed.alshammari@example.com',
    isBoosted: true,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seeker_demo_2',
    userId: 'demo_user_2',
    name: 'سارة خالد المنصوري',
    photoURL: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    targetJobTitle: 'مهندسة برمجيات أولى (Full-Stack Engineer)',
    countryId: 'uae',
    countryNameAr: 'الإمارات',
    city: 'دبي',
    categoryId: 'it-tech',
    categoryNameAr: 'تقنية المعلومات',
    summary: 'متخصصة في بناء التطبيقات السحابية وأنظمة الدفع الإلكتروني وتطوير الواجهات الحديثة للشركات التقنية الناشئة.',
    experienceYears: '5 سنوات',
    education: 'ماجستير علوم الحاسب',
    skills: 'React, TypeScript, Node.js, AWS, PostgreSQL, Docker',
    expectedSalary: '18,000',
    salaryCurrency: 'AED',
    whatsapp: '+971501234567',
    phone: '+971501234567',
    email: 'sara.almansoori@example.com',
    isBoosted: true,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seeker_demo_3',
    userId: 'demo_user_3',
    name: 'فيصل مبارك الدوسري',
    photoURL: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    targetJobTitle: 'محاسب مالي معتمد (CPA)',
    countryId: 'saudi',
    countryNameAr: 'السعودية',
    city: 'الرياض',
    categoryId: 'admin-office',
    categoryNameAr: 'الإدارة والمكاتب',
    summary: 'محاسب قانوني خبير في إعداد القوائم المالية وإقرارات ضريبة القيمة المضافة وإدارة التدقيق المحاسبي للشركات الكبرى.',
    experienceYears: '6 سنوات',
    education: 'بكالوريوس محاسبة - SOCPA',
    skills: 'المحاسبة القانونية, ضريبة القيمة المضافة, ERP, SAP, Excel المتقدم',
    expectedSalary: '12,500',
    salaryCurrency: 'SAR',
    whatsapp: '+966509876543',
    phone: '+966509876543',
    email: 'faisal.aldosari@example.com',
    isBoosted: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'seeker_demo_4',
    userId: 'demo_user_4',
    name: 'يوسف عبد الله الهاشمي',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    targetJobTitle: 'مشرف عمليات لوجستية ونقل',
    countryId: 'oman',
    countryNameAr: 'عُمان',
    city: 'مسقط',
    categoryId: 'drivers-transport',
    categoryNameAr: 'السائقون والنقل',
    summary: 'إدارة أساطيل النقل والتوزيع، تخطيط المسارات والشحن البري والبحري، حاصل على رخصة قيادة خليجية ثقيلة وخفيفة.',
    experienceYears: '4 سنوات',
    education: 'دبلوم سلاسل الإمداد',
    skills: 'إدارة الأسطول, تتبع الشحنات, التنسيق الجمركي, السلامة المهنية',
    expectedSalary: '750',
    salaryCurrency: 'OMR',
    whatsapp: '+96891234567',
    phone: '+96891234567',
    email: 'yousef.alhashemi@example.com',
    isBoosted: false,
    status: 'active',
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

const MainApp: React.FC = () => {
  const { language, t } = useLanguage();
  const { user, isAdmin, userProfile, updateUserProfile, loginWithGoogle } = useAuth();

  // Core Data
  const [jobs, setJobs] = useState<JobAdvertisement[]>([]);
  const [countries, setCountries] = useState<GCCCountry[]>(INITIAL_GCC_COUNTRIES);
  const [categories, setCategories] = useState<JobCategory[]>(INITIAL_JOB_CATEGORIES);
  const [jobSeekers, setJobSeekers] = useState<JobSeeker[]>(INITIAL_SAMPLE_SEEKERS);
  const [messages, setMessages] = useState<EmployerMessage[]>([]);
  const [banners, setBanners] = useState<AdBanner[]>(SAMPLE_AD_BANNERS);
  
  // First-time Role Onboarding check
  const showRoleOnboarding = Boolean(
    user && 
    userProfile && 
    userProfile.hasCompletedOnboarding === false && 
    !isAdmin
  );

  const handleCompleteOnboarding = async (selectedRole: UserRole) => {
    if (!user) return;
    try {
      await updateUserProfile({
        role: selectedRole,
        hasCompletedOnboarding: true,
        headline: selectedRole === 'employer' 
          ? (language === 'ar' ? 'صاحب عمل / جهة توظيف' : 'Employer / Company') 
          : (language === 'ar' ? 'باحث عن عمل في دول الخليج' : 'Job Seeker in GCC'),
        isSeekingJob: selectedRole === 'job_seeker',
      });
    } catch (err) {
      console.error('Error saving onboarding role:', err);
    }
  };

  // Filters
  const [filters, setFilters] = useState<SearchFilterState>(INITIAL_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<SearchFilterState>(INITIAL_FILTERS);
  
  // Navigation View: 'home' | 'jobs' | 'job_seekers' | 'categories' | 'countries'
  const [currentView, setCurrentView] = useState<'home' | 'jobs' | 'job_seekers' | 'categories' | 'countries'>('home');
  const [isAdminView, setIsAdminView] = useState(false);

  // Modals & Popups
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmployerInquiryOpen, setIsEmployerInquiryOpen] = useState(false);
  const [isSeekerEditorOpen, setIsSeekerEditorOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isMyApplicationsOpen, setIsMyApplicationsOpen] = useState(false);
  const [isEmployerOfficeOpen, setIsEmployerOfficeOpen] = useState(false);
  const [isEmployerJobEditorOpen, setIsEmployerJobEditorOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [applicationTargetJob, setApplicationTargetJob] = useState<JobAdvertisement | null>(null);
  const [selectedJob, setSelectedJob] = useState<JobAdvertisement | null>(null);
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState<number>(9);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const [showJobsFilterPanel, setShowJobsFilterPanel] = useState(false);

  // Favorites state persisted in localStorage
  const [favoriteJobIds, setFavoriteJobIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gulfjobs_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (jobId: string) => {
    setFavoriteJobIds(prev => {
      const next = prev.includes(jobId) ? prev.filter(id => id !== jobId) : [...prev, jobId];
      try {
        localStorage.setItem('gulfjobs_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Initialize and check Firestore connection
  useEffect(() => {
    testConnection();

    // STRICT: Only enter admin view from URL if user is authenticated admin
    if (window.location.pathname === '/admin' && isAdmin) {
      setIsAdminView(true);
    }

    // Auto-seed initial countries and categories to Firestore if empty (Admin only)
    const initSeedCheck = async () => {
      if (!isAdmin) return;
      try {
        const catSnap = await getDocs(collection(db, 'categories'));
        if (catSnap.empty) {
          for (const cat of INITIAL_JOB_CATEGORIES) {
            await setDoc(doc(db, 'categories', cat.id), cat);
          }
        }

        const countrySnap = await getDocs(collection(db, 'countries'));
        if (countrySnap.empty) {
          for (const c of INITIAL_GCC_COUNTRIES) {
            await setDoc(doc(db, 'countries', c.id), c);
          }
        }
      } catch (err) {
        console.warn('Auto seed check note:', err);
      }
    };

    initSeedCheck();
  }, [isAdmin]);

  // Listen to Categories from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as JobCategory));
          list.sort((a, b) => a.order - b.order);
          setCategories(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'categories');
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to Countries from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'countries'),
      (snapshot) => {
        if (!snapshot.empty) {
          const list = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as GCCCountry));
          list.sort((a, b) => a.order - b.order);
          setCountries(list);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'countries');
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to Jobs from Firestore (Public sees published, Admin sees all)
  useEffect(() => {
    setIsLoadingJobs(true);
    const jobsCollection = collection(db, 'jobs');
    const jobsQuery = isAdmin
      ? jobsCollection
      : query(jobsCollection, where('status', '==', 'published'));

    const unsubscribe = onSnapshot(
      jobsQuery,
      (snapshot) => {
        const fetchedJobs: JobAdvertisement[] = [];
        snapshot.forEach((doc) => {
          fetchedJobs.push({ id: doc.id, ...doc.data() } as JobAdvertisement);
        });
        setJobs(fetchedJobs);
        setIsLoadingJobs(false);

        const urlParams = new URLSearchParams(window.location.search);
        const jobIdParam = urlParams.get('jobId');
        if (jobIdParam) {
          const found = fetchedJobs.find(j => j.id === jobIdParam);
          if (found) setSelectedJob(found);
        }
      },
      (error) => {
        setIsLoadingJobs(false);
        handleFirestoreError(error, OperationType.LIST, 'jobs');
      }
    );

    return () => unsubscribe();
  }, [isAdmin]);

  // Listen to Job Seekers collection from Firestore
  useEffect(() => {
    const seekersCol = collection(db, 'job_seekers');
    const unsubscribe = onSnapshot(
      seekersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: JobSeeker[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() } as JobSeeker);
          });
          setJobSeekers(list);
        } else {
          // If empty in DB, use our verified GCC talent seed
          setJobSeekers(INITIAL_SAMPLE_SEEKERS);
        }
      },
      (error) => {
        console.warn('Seekers listener note:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Listen to Messages collection from Firestore (Admin review)
  useEffect(() => {
    if (!isAdmin) return;
    const msgsCol = collection(db, 'messages');
    const unsubscribe = onSnapshot(
      msgsCol,
      (snapshot) => {
        const list: EmployerMessage[] = [];
        snapshot.forEach(docSnap => {
          list.push({ id: docSnap.id, ...docSnap.data() } as EmployerMessage);
        });
        list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setMessages(list);
      },
      (error) => {
        console.warn('Messages listener note:', error);
      }
    );
    return () => unsubscribe();
  }, [isAdmin]);

  // Listen to Banners collection from Firestore
  useEffect(() => {
    const bannersCol = collection(db, 'banners');
    const unsubscribe = onSnapshot(
      bannersCol,
      (snapshot) => {
        if (!snapshot.empty) {
          const list: AdBanner[] = [];
          snapshot.forEach(docSnap => {
            list.push({ id: docSnap.id, ...docSnap.data() } as AdBanner);
          });
          list.sort((a, b) => (a.order || 0) - (b.order || 0));
          setBanners(list);
        } else {
          setBanners(SAMPLE_AD_BANNERS);
        }
      },
      (error) => {
        console.warn('Banners listener note:', error);
      }
    );
    return () => unsubscribe();
  }, []);

  // Real Multi-Filter Pipeline
  const filteredJobs = useMemo(() => {
    let list = jobs.filter(j => j.status === 'published');

    // 1. Keyword search
    if (appliedFilters.keyword.trim()) {
      list = list.filter(job => {
        const fullHaystack = `${job.titleAr} ${job.titleEn} ${job.companyNameAr} ${job.companyNameEn} ${job.descriptionAr} ${job.descriptionEn} ${job.skills || ''}`;
        return matchesKeyword(fullHaystack, appliedFilters.keyword);
      });
    }

    // 2. Country
    if (appliedFilters.countryId !== 'all') {
      list = list.filter(job => job.countryId === appliedFilters.countryId);
    }

    // 3. City
    if (appliedFilters.city !== 'all') {
      list = list.filter(job => job.city?.toLowerCase() === appliedFilters.city.toLowerCase());
    }

    // 4. Category
    if (appliedFilters.categoryId !== 'all') {
      list = list.filter(job => job.categoryId === appliedFilters.categoryId);
    }

    // 5. Employment Type
    if (appliedFilters.employmentType !== 'all') {
      list = list.filter(job => job.employmentType === appliedFilters.employmentType);
    }

    // 6. Experience Level
    if (appliedFilters.experienceLevel !== 'all') {
      list = list.filter(job => job.experienceLevel === appliedFilters.experienceLevel);
    }

    // 7. Salary Filtering
    if (appliedFilters.minSalary > 0 || appliedFilters.maxSalary > 0 || !appliedFilters.includeUndisclosed) {
      list = list.filter(job => {
        if (!job.salaryDisclosed) {
          return appliedFilters.includeUndisclosed;
        }

        const minSelected = appliedFilters.minSalary;
        const maxSelected = appliedFilters.maxSalary > 0 ? appliedFilters.maxSalary : Infinity;

        return job.minSalary <= maxSelected && job.maxSalary >= minSelected;
      });
    }

    // 8. Sorting
    list.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      if (appliedFilters.sortBy === 'newest') {
        return new Date(b.publishedAt || 0).getTime() - new Date(a.publishedAt || 0).getTime();
      }
      if (appliedFilters.sortBy === 'oldest') {
        return new Date(a.publishedAt || 0).getTime() - new Date(b.publishedAt || 0).getTime();
      }
      if (appliedFilters.sortBy === 'salary-high') {
        return (b.maxSalary || 0) - (a.maxSalary || 0);
      }
      if (appliedFilters.sortBy === 'salary-low') {
        return (a.minSalary || 0) - (b.minSalary || 0);
      }
      return 0;
    });

    return list;
  }, [jobs, appliedFilters]);

  // Country counts
  const jobCountsByCountry = useMemo(() => {
    const counts: { [countryId: string]: number } = {};
    jobs.filter(j => j.status === 'published').forEach(job => {
      counts[job.countryId] = (counts[job.countryId] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Category counts
  const jobCountsByCategory = useMemo(() => {
    const counts: { [catId: string]: number } = {};
    jobs.filter(j => j.status === 'published').forEach(job => {
      counts[job.categoryId] = (counts[job.categoryId] || 0) + 1;
    });
    return counts;
  }, [jobs]);

  // Active Banners selectors (supports multiple ad formats simultaneously)
  const homeBanners = useMemo(() => {
    return banners.filter(b => b.isActive && (b.placement === 'home' || b.placement === 'global'));
  }, [banners]);

  const activeCategoryBanners = useMemo(() => {
    if (appliedFilters.categoryId && appliedFilters.categoryId !== 'all') {
      const matchCat = banners.filter(b => b.isActive && b.placement === 'category' && b.categoryId === appliedFilters.categoryId);
      if (matchCat.length > 0) return matchCat;
      const allCat = banners.filter(b => b.isActive && b.placement === 'all_categories');
      if (allCat.length > 0) return allCat;
    }
    return banners.filter(b => b.isActive && b.placement === 'global');
  }, [banners, appliedFilters.categoryId]);

  // Search actions
  const handleFiltersChange = (newFilters: SearchFilterState) => {
    setFilters(newFilters);
    setAppliedFilters(newFilters);
  };

  const handleExecuteSearch = () => {
    setAppliedFilters({ ...filters });
    setVisibleCount(9);
    setCurrentView('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    const resetState: SearchFilterState = {
      keyword: '',
      countryId: 'all',
      city: 'all',
      categoryId: 'all',
      minSalary: 0,
      maxSalary: 0,
      salaryDisclosedOnly: false,
      includeUndisclosed: true,
      employmentType: 'all',
      experienceLevel: 'all',
      sortBy: 'newest',
    };
    setFilters(resetState);
    setAppliedFilters(resetState);
    setVisibleCount(9);
  };

  const handleSelectCountry = (countryId: string) => {
    const updated = {
      ...filters,
      countryId,
      city: 'all',
    };
    setFilters(updated);
    setAppliedFilters(updated);
    setVisibleCount(9);
    setCurrentView('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectCategory = (categoryId: string) => {
    const updated = {
      ...filters,
      categoryId,
    };
    setFilters(updated);
    setAppliedFilters(updated);
    setVisibleCount(9);
    setCurrentView('jobs');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Admin Database Actions
  const handleSaveJob = async (jobData: Partial<JobAdvertisement>, existingId?: string) => {
    try {
      const jobId = existingId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const now = new Date().toISOString();
      const payload: JobAdvertisement = {
        ...jobData,
        id: jobId,
        publishedAt: jobData.publishedAt || now,
        createdAt: jobData.createdAt || now,
        updatedAt: now,
      } as JobAdvertisement;

      await setDoc(doc(db, 'jobs', jobId), payload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, existingId ? OperationType.UPDATE : OperationType.CREATE, `jobs/${existingId || ''}`);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteDoc(doc(db, 'jobs', jobId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `jobs/${jobId}`);
    }
  };

  const handleUpdateJobStatus = async (jobId: string, status: JobStatus) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        status,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  };

  const handleToggleJobFeatured = async (jobId: string, currentFeatured: boolean) => {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        isFeatured: !currentFeatured,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `jobs/${jobId}`);
    }
  };

  const handleSaveCategory = async (category: Partial<JobCategory>) => {
    try {
      if (!category.id) return;
      await setDoc(doc(db, 'categories', category.id), category, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `categories/${category.id}`);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      await deleteDoc(doc(db, 'categories', categoryId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `categories/${categoryId}`);
    }
  };

  const handleSaveCountryCities = async (countryId: string, cities: string[]) => {
    try {
      await updateDoc(doc(db, 'countries', countryId), { cities });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `countries/${countryId}`);
    }
  };

  const handleUpdateMessageStatus = async (messageId: string, status: 'unread' | 'read' | 'replied') => {
    try {
      await updateDoc(doc(db, 'messages', messageId), { status });
    } catch (err) {
      console.error('Update message error:', err);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteDoc(doc(db, 'messages', messageId));
    } catch (err) {
      console.error('Delete message error:', err);
    }
  };

  // Job Seeker Profile Save
  const handleSaveJobSeeker = async (seekerData: Partial<JobSeeker>) => {
    if (!user) return;
    const seekerId = seekerData.id || `seeker_${user.uid}`;
    const now = new Date().toISOString();
    const payload: JobSeeker = {
      ...seekerData,
      id: seekerId,
      userId: user.uid,
      name: seekerData.name || user.displayName || 'Job Seeker',
      photoURL: seekerData.photoURL || user.photoURL || '',
      countryId: seekerData.countryId || 'qatar',
      city: seekerData.city || '',
      categoryId: seekerData.categoryId || 'sales-marketing',
      targetJobTitle: seekerData.targetJobTitle || '',
      summary: seekerData.summary || '',
      status: seekerData.status || 'active',
      isBoosted: seekerData.isBoosted || false,
      createdAt: seekerData.createdAt || now,
      updatedAt: now,
    };

    await setDoc(doc(db, 'job_seekers', seekerId), payload, { merge: true });
  };

  const handleSendEmployerMessage = async (data: {
    companyName: string;
    subject: string;
    message: string;
    jobDetails?: string;
    senderPhone?: string;
    countryId?: string;
  }) => {
    if (!user) return;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const payload: EmployerMessage = {
      id: messageId,
      senderUid: user.uid,
      senderName: user.displayName || 'Employer',
      senderEmail: user.email || '',
      companyName: data.companyName,
      subject: data.subject,
      message: data.message,
      jobDetails: data.jobDetails,
      senderPhone: data.senderPhone,
      countryId: data.countryId,
      status: 'unread',
      createdAt: now,
    };
    await setDoc(doc(db, 'messages', messageId), payload);
  };

  // Banner Handlers (Admin controlled & User click tracking)
  const handleSaveBanner = async (bannerData: Partial<AdBanner>) => {
    if (!isAdmin) return;
    const bannerId = bannerData.id || `banner_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const payload: AdBanner = {
      id: bannerId,
      bannerType: bannerData.bannerType || 'image',
      customCode: bannerData.customCode || '',
      smartLinkConfig: bannerData.smartLinkConfig,
      cardTheme: bannerData.cardTheme || 'teal_navy',
      badgeTextAr: bannerData.badgeTextAr || 'إعلان ممول',
      badgeTextEn: bannerData.badgeTextEn || 'Sponsored',
      titleAr: bannerData.titleAr || '',
      titleEn: bannerData.titleEn || '',
      subtitleAr: bannerData.subtitleAr || '',
      subtitleEn: bannerData.subtitleEn || '',
      imageUrl: bannerData.imageUrl || '',
      targetUrl: bannerData.targetUrl || 'https://',
      callToActionAr: bannerData.callToActionAr || 'زيارة الموقع الإلكتروني',
      callToActionEn: bannerData.callToActionEn || 'Visit Website',
      placement: bannerData.placement || 'home',
      categoryId: bannerData.categoryId || '',
      categoryNameAr: bannerData.categoryNameAr || '',
      categoryNameEn: bannerData.categoryNameEn || '',
      isActive: bannerData.isActive ?? true,
      order: bannerData.order ?? 0,
      clicksCount: bannerData.clicksCount || 0,
      createdAt: bannerData.createdAt || now,
      updatedAt: now,
      createdBy: user?.uid || 'admin',
    };

    await setDoc(doc(db, 'banners', bannerId), payload, { merge: true });
  };

  const handleDeleteBanner = async (bannerId: string) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(db, 'banners', bannerId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'banners');
    }
  };

  const handleToggleBannerActive = async (bannerId: string, current: boolean) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'banners', bannerId), {
        isActive: !current,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'banners');
    }
  };

  const handleBannerClick = async (banner: AdBanner) => {
    if (!banner.id) return;
    try {
      const bannerRef = doc(db, 'banners', banner.id);
      await updateDoc(bannerRef, {
        clicksCount: (banner.clicksCount || 0) + 1,
      });
    } catch (err) {
      // Non-blocking for navigation if offline or rules constraint
      console.warn('Banner click counter update note:', err);
    }
  };

  const handleSeedDemoBanners = async () => {
    if (!isAdmin) return;
    try {
      for (const demoBanner of SAMPLE_AD_BANNERS) {
        await setDoc(doc(db, 'banners', demoBanner.id), demoBanner);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'banners/demo-seed');
    }
  };

  const handleSeedInitialData = async () => {
    try {
      for (const cat of INITIAL_JOB_CATEGORIES) {
        await setDoc(doc(db, 'categories', cat.id), cat);
      }
      for (const c of INITIAL_GCC_COUNTRIES) {
        await setDoc(doc(db, 'countries', c.id), c);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'system-seed');
    }
  };

  const handleSeedDemoJobs = async () => {
    try {
      const now = new Date().toISOString();
      for (const demoJob of SAMPLE_DEMO_JOBS) {
        const id = `demo_${demoJob.countryId}_${Math.random().toString(36).substring(2, 7)}`;
        await setDoc(doc(db, 'jobs', id), {
          ...demoJob,
          id,
          publishedAt: now,
          createdAt: now,
          updatedAt: now,
          createdBy: user?.uid || 'admin',
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'jobs/demo-seed');
    }
  };

  const handleOpenAdminPortal = () => {
    if (isAdmin) {
      setIsAdminView(true);
    }
  };

  const handleOpenLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.warn('Google sign in prompt fallback to modal:', err);
      setIsLoginModalOpen(true);
    }
  };

  if (isAdminView && isAdmin) {
    return (
      <AdminDashboard
        jobs={jobs}
        countries={countries}
        categories={categories}
        messages={messages}
        banners={banners}
        onSaveJob={handleSaveJob}
        onDeleteJob={handleDeleteJob}
        onUpdateJobStatus={handleUpdateJobStatus}
        onToggleJobFeatured={handleToggleJobFeatured}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onSaveCountryCities={handleSaveCountryCities}
        onUpdateMessageStatus={handleUpdateMessageStatus}
        onDeleteMessage={handleDeleteMessage}
        onSaveBanner={handleSaveBanner}
        onDeleteBanner={handleDeleteBanner}
        onToggleBannerActive={handleToggleBannerActive}
        onSeedDemoBanners={handleSeedDemoBanners}
        onSeedInitialData={handleSeedInitialData}
        onSeedDemoJobs={handleSeedDemoJobs}
        onCloseAdmin={() => setIsAdminView(false)}
        onRefreshData={() => window.location.reload()}
      />
    );
  }

  const publishedJobsCount = jobs.filter(j => j.status === 'published').length;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans pb-16 md:pb-0">
      
      {/* Sticky Header */}
      <Navbar
        selectedCountryId={filters.countryId}
        onSelectCountry={handleSelectCountry}
        onOpenAdmin={handleOpenAdminPortal}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenLogin={handleOpenLogin}
        onOpenEmployerOffice={() => setIsEmployerOfficeOpen(true)}
        onOpenMyApplications={() => setIsMyApplicationsOpen(true)}
        onNavigateHome={() => {
          setCurrentView('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateJobs={() => {
          setCurrentView('jobs');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateJobSeekers={() => {
          setCurrentView('job_seekers');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateCategories={() => {
          setCurrentView('categories');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onNavigateAbout={() => setIsAboutOpen(true)}
        onNavigateContact={() => setIsContactOpen(true)}
      />

      {/* VIEW 1: HOME PAGE MATCHING MOCKUP SCREEN 1 */}
      {currentView === 'home' && (
        <>
          <Hero realPublishedCount={publishedJobsCount} />

          <main id="search-section" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
            <SearchFilters
              filters={filters}
              onChangeFilters={handleFiltersChange}
              onExecuteSearch={handleExecuteSearch}
              onResetFilters={handleResetFilters}
              countries={countries}
              categories={categories}
              totalResultsCount={filteredJobs.length}
            />

            {/* Promotional Ad Banners (Admin Controlled: Images, Codes, Smart Links) */}
            {homeBanners.length > 0 && (
              <div className="my-6 space-y-4">
                {homeBanners.map(banner => (
                  <AdBannerCard
                    key={banner.id}
                    banner={banner}
                    onBannerClick={handleBannerClick}
                    variant="wide"
                  />
                ))}
              </div>
            )}

            {/* Quick Banner to Job Seekers Directory */}
            <div className="my-6 p-5 sm:p-6 rounded-3xl bg-linear-to-r from-teal-900 via-[#0A192F] to-slate-900 text-white shadow-md border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-300 border border-teal-400/40 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6 text-teal-300" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black flex items-center gap-2">
                    <span>{language === 'ar' ? 'سوق الكفاءات والباحثين عن عمل في الخليج' : 'GCC Job Seekers & Talent Directory'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-teal-400 text-slate-950 text-[10px] font-black">جديد</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    {language === 'ar'
                      ? 'تصفح ملفات المهنيين والكوادر المؤهلة وتواصل معهم مباشرة عبر واتساب، أو سجل دخولك وانشر ملفك الوظيفي الآن.'
                      : 'Explore verified candidate profiles and connect directly via WhatsApp, or publish your candidate profile today.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentView('job_seekers');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#008f80] text-white font-extrabold text-xs shadow-md transition self-start sm:self-center shrink-0 cursor-pointer"
              >
                <span>{language === 'ar' ? 'استعراض الباحثين عن عمل ←' : 'Browse Job Seekers →'}</span>
              </button>
            </div>

            {/* Country Cards (Compact Carousel/Grid as in Screen 1) */}
            <CountryCards
              countries={countries}
              selectedCountryId={filters.countryId}
              onSelectCountry={handleSelectCountry}
              jobCountsByCountry={jobCountsByCountry}
              onViewAllCountries={() => setCurrentView('countries')}
              isFullPageView={false}
            />

            {/* Popular Categories (Compact Grid as in Screen 1) */}
            <CategoryList
              categories={categories}
              selectedCategoryId={filters.categoryId}
              onSelectCategory={handleSelectCategory}
              jobCountsByCategory={jobCountsByCategory}
              banners={banners}
              onBannerClick={handleBannerClick}
              onViewAllCategories={() => setCurrentView('categories')}
              isFullPageView={false}
            />

            {/* Section: أحدث الوظائف with "عرض الكل" link matching Mockup Screen 1 */}
            <div className="mt-12 mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  {language === 'ar' ? 'أحدث الوظائف' : 'Latest Jobs'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {language === 'ar' ? 'وظائف معتمدة ومحدثة في دول الخليج' : 'Verified current vacancies across the GCC'}
                </p>
              </div>

              <button
                onClick={() => setCurrentView('jobs')}
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-teal-700 hover:text-teal-900 transition-colors cursor-pointer"
              >
                <span>{language === 'ar' ? 'عرض الكل' : 'View All'}</span>
                {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>

            {/* Job Listings Grid */}
            {isLoadingJobs ? (
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
                <p className="text-xs font-semibold text-slate-500">
                  {language === 'ar' ? 'جارٍ تحميل الوظائف...' : 'Loading listings...'}
                </p>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-sm max-w-xl mx-auto my-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {t.search.noResultsTitle}
                </h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  {t.search.noResultsDesc}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    <span>{t.search.resetAllFilters}</span>
                  </button>
                  {isAdmin && (
                    <button
                      onClick={() => setIsAdminView(true)}
                      className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <span>{language === 'ar' ? 'إضافة وظائف من لوحة الإدارة' : 'Post Jobs via Admin'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredJobs.slice(0, 6).map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={setSelectedJob}
                    onOpenImage={setActiveImageUrl}
                    isFavorite={favoriteJobIds.includes(job.id)}
                    onToggleFavorite={toggleFavorite}
                  />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* VIEW 2: ALL JOBS VIEW MATCHING MOCKUP SCREEN 2 */}
      {currentView === 'jobs' && (
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
          
          {/* Header Title Bar matching Screen 2: جميع الوظائف */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {language === 'ar' ? 'جميع الوظائف' : 'All Jobs'}
                <span className="text-sm font-semibold text-slate-400 ms-2 font-mono">
                  ({filteredJobs.length} {language === 'ar' ? 'وظيفة' : 'jobs'})
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar' ? 'استعراض الفرص الوظيفية في دول مجلس التعاون' : 'Explore opportunities across the GCC'}
              </p>
            </div>

            {/* Sort Dropdown matching Mockup Screen 2: الأحدث أولاً */}
            <div className="flex items-center gap-2">
              <select
                value={appliedFilters.sortBy}
                onChange={(e) => {
                  const updated = { ...appliedFilters, sortBy: e.target.value as any };
                  setFilters(updated);
                  setAppliedFilters(updated);
                }}
                className="h-10 px-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 outline-none"
              >
                <option value="newest">{language === 'ar' ? 'الأحدث أولاً' : 'Newest First'}</option>
                <option value="oldest">{language === 'ar' ? 'الأقدم أولاً' : 'Oldest First'}</option>
                <option value="salary-high">{language === 'ar' ? 'الأعلى راتباً' : 'Highest Salary'}</option>
                <option value="salary-low">{language === 'ar' ? 'الأقل راتباً' : 'Lowest Salary'}</option>
              </select>
            </div>
          </div>

          {/* GCC Country Selector Bar with Flags and Counts */}
          <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="text-xs font-bold text-slate-500 mb-2 flex items-center justify-between">
              <span>{language === 'ar' ? 'تصفح الوظائف حسب الدولة:' : 'Browse Jobs by Country:'}</span>
              {appliedFilters.countryId !== 'all' && (
                <button
                  onClick={() => handleSelectCountry('all')}
                  className="text-teal-700 hover:text-teal-900 font-extrabold text-[11px] cursor-pointer"
                >
                  {language === 'ar' ? 'عرض جميع دول الخليج 🌐' : 'Show All GCC Countries 🌐'}
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {/* All countries button */}
              <button
                onClick={() => handleSelectCountry('all')}
                className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                  appliedFilters.countryId === 'all'
                    ? 'bg-[#00A896] text-white shadow-sm ring-2 ring-teal-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <CountryFlag countryId="all" className="w-4 h-4" shape="circle" />
                <span>{language === 'ar' ? 'جميع الدول' : 'All GCC'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${appliedFilters.countryId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {publishedJobsCount}
                </span>
              </button>

              {/* Individual GCC Countries */}
              {countries.map(c => {
                const count = jobCountsByCountry[c.id] || 0;
                const isSelected = appliedFilters.countryId === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectCountry(c.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00A896] text-white shadow-sm ring-2 ring-teal-500/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    <CountryFlag countryId={c.id} className="w-4 h-4" shape="circle" />
                    <span>{language === 'ar' ? c.nameAr : c.nameEn}</span>
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Filter Control and Filter Drawer Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowJobsFilterPanel(!showJobsFilterPanel)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                  showJobsFilterPanel ? 'bg-[#00A896] text-white shadow-sm' : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? (showJobsFilterPanel ? 'إخفاء الفلاتر المتقدمة' : 'فلاتر وبحث مخصص') : (showJobsFilterPanel ? 'Hide Filters' : 'Custom Filters')}</span>
              </button>

              {appliedFilters.countryId !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                  <CountryFlag countryId={appliedFilters.countryId} className="w-4 h-4" shape="circle" />
                  <span>{countries.find(c => c.id === appliedFilters.countryId)?.[language === 'ar' ? 'nameAr' : 'nameEn']}</span>
                  <button
                    onClick={() => handleSelectCountry('all')}
                    className="ms-1 hover:text-rose-600 cursor-pointer text-sm"
                  >
                    ×
                  </button>
                </span>
              )}

              {appliedFilters.categoryId !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
                  <span>{categories.find(c => c.id === appliedFilters.categoryId)?.[language === 'ar' ? 'nameAr' : 'nameEn']}</span>
                  <button
                    onClick={() => handleSelectCategory('all')}
                    className="ms-1 hover:text-rose-600 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1 text-xs text-slate-500 hover:text-rose-600 transition-colors font-semibold cursor-pointer"
            >
              {language === 'ar' ? 'مسح جميع الفلاتر' : 'Reset All'}
            </button>
          </div>

          {/* Collapsible Search Filters panel inside Jobs View */}
          {showJobsFilterPanel && (
            <div className="bg-white rounded-3xl p-5 border border-teal-500/30 shadow-md">
              <SearchFilters
                filters={filters}
                onChangeFilters={handleFiltersChange}
                onExecuteSearch={() => {
                  handleExecuteSearch();
                  setShowJobsFilterPanel(false);
                }}
                onResetFilters={handleResetFilters}
                countries={countries}
                categories={categories}
                totalResultsCount={filteredJobs.length}
              />
            </div>
          )}

          {/* Contextual Category/Search Ad Banners (Admin Controlled) */}
          {activeCategoryBanners.length > 0 && (
            <div className="my-3 space-y-3">
              {activeCategoryBanners.map(banner => (
                <AdBannerCard
                  key={banner.id}
                  banner={banner}
                  onBannerClick={handleBannerClick}
                  variant="wide"
                />
              ))}
            </div>
          )}

          {/* Jobs List */}
          {isLoadingJobs ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-3" />
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
              <p className="text-sm font-bold text-slate-700">{t.search.noResultsTitle}</p>
              <p className="text-xs text-slate-400 mt-1">{t.search.noResultsDesc}</p>
              <button
                onClick={handleResetFilters}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white font-bold text-xs"
              >
                {t.search.resetAllFilters}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredJobs.slice(0, visibleCount).map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onViewDetails={setSelectedJob}
                  onOpenImage={setActiveImageUrl}
                  isFavorite={favoriteJobIds.includes(job.id)}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredJobs.length > visibleCount && (
            <div className="text-center pt-6">
              <button
                onClick={() => setVisibleCount(prev => prev + 9)}
                className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-bold text-xs shadow-sm cursor-pointer"
              >
                {language === 'ar' ? 'عرض المزيد من الوظائف' : 'Load More Jobs'}
              </button>
            </div>
          )}

        </main>
      )}

      {/* VIEW 3: JOB SEEKERS DIRECTORY */}
      {currentView === 'job_seekers' && (
        <JobSeekersDirectory
          seekers={jobSeekers}
          countries={countries}
          categories={categories}
          onOpenSeekerEditor={() => {
            if (!user) {
              handleOpenLogin();
            } else {
              setIsSeekerEditorOpen(true);
            }
          }}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenLogin={handleOpenLogin}
        />
      )}

      {/* VIEW 4: CATEGORIES FULL VIEW MATCHING MOCKUP SCREEN 5 */}
      {currentView === 'categories' && (
        <CategoryList
          categories={categories}
          selectedCategoryId={filters.categoryId}
          onSelectCategory={handleSelectCategory}
          jobCountsByCategory={jobCountsByCategory}
          banners={banners}
          onBannerClick={handleBannerClick}
          isFullPageView={true}
        />
      )}

      {/* VIEW 5: COUNTRIES FULL VIEW MATCHING MOCKUP SCREEN 6 */}
      {currentView === 'countries' && (
        <CountryCards
          countries={countries}
          selectedCountryId={filters.countryId}
          onSelectCountry={handleSelectCountry}
          jobCountsByCountry={jobCountsByCountry}
          isFullPageView={true}
        />
      )}

      {/* Footer */}
      <Footer
        onSelectCountry={handleSelectCountry}
        onOpenAdmin={handleOpenAdminPortal}
        onNavigateAbout={() => setIsAboutOpen(true)}
        onNavigateContact={() => setIsContactOpen(true)}
        onOpenPrivacyPolicy={() => setIsPrivacyOpen(true)}
        onOpenGooglePlayReview={() => setIsReviewOpen(true)}
      />

      {/* Bottom Mobile Navigation Bar matching Mockup Screen 2 & 5 */}
      <BottomNav
        currentTab={currentView as BottomNavTab}
        onNavigateTab={(tab) => {
          setCurrentView(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAdmin={handleOpenAdminPortal}
      />

      {/* Dedicated Job Details Modal matching Mockup Screen 3 */}
      <JobDetailsModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onOpenImage={setActiveImageUrl}
        onApplyJob={(job) => {
          setApplicationTargetJob(job);
          setIsApplyModalOpen(true);
        }}
        isFavorite={selectedJob ? favoriteJobIds.includes(selectedJob.id) : false}
        onToggleFavorite={toggleFavorite}
      />

      {/* Lightbox Image Modal */}
      <ImageModal
        imageUrl={activeImageUrl}
        onClose={() => setActiveImageUrl(null)}
      />

      {/* Admin Login Modal matching Mockup Screen 7 */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => {
          setIsLoginModalOpen(false);
          setIsAdminView(true);
        }}
      />

      {/* User Profile Modal (Google Account / Role / Bio) */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenSeekerAdEditor={() => setIsSeekerEditorOpen(true)}
        onOpenEmployerInquiry={() => setIsEmployerInquiryOpen(true)}
        onOpenEmployerOffice={() => setIsEmployerOfficeOpen(true)}
        onOpenMyApplications={() => setIsMyApplicationsOpen(true)}
        countries={countries}
        categories={categories}
      />

      {/* Candidate Live Applications & Status Tracker Modal */}
      <MyApplicationsModal
        isOpen={isMyApplicationsOpen}
        onClose={() => setIsMyApplicationsOpen(false)}
        onBrowseJobs={() => {
          setIsMyApplicationsOpen(false);
          setCurrentView('jobs');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Direct Job Application with CV upload Modal */}
      {isApplyModalOpen && (applicationTargetJob || selectedJob) && (
        <ApplyJobModal
          job={(applicationTargetJob || selectedJob)!}
          onClose={() => {
            setIsApplyModalOpen(false);
            setApplicationTargetJob(null);
          }}
          onSuccess={() => {
            // Keep open to show success screen, user can close via button
          }}
          onBrowseMoreJobs={() => {
            setIsApplyModalOpen(false);
            setApplicationTargetJob(null);
            setSelectedJob(null);
            setCurrentView('jobs');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        />
      )}

      {/* Employer Office / Desk Modal (مكتب صاحب العمل والتوظيف) */}
      {isEmployerOfficeOpen && (
        <EmployerOfficeModal
          onClose={() => setIsEmployerOfficeOpen(false)}
          allJobs={jobs}
          onOpenJobForm={() => {
            const isAllowed = Boolean(
              isAdmin || (
                userProfile?.role === 'employer' &&
                userProfile?.canPublishJobs &&
                (!userProfile.publishingAccessExpiresAt || new Date(userProfile.publishingAccessExpiresAt).getTime() > Date.now())
              )
            );
            if (isAllowed) {
              setIsEmployerJobEditorOpen(true);
            } else {
              setIsEmployerInquiryOpen(true);
            }
          }}
        />
      )}

      {/* Direct Employer Job Posting Editor Modal (Only when approved by Admin) */}
      <JobEditorModal
        isOpen={isEmployerJobEditorOpen}
        onClose={() => setIsEmployerJobEditorOpen(false)}
        countries={countries}
        categories={categories}
        onSave={async (jobData) => {
          await handleSaveJob({
            ...jobData,
            createdBy: user?.uid,
            companyNameAr: userProfile?.companyName || jobData.companyNameAr || userProfile?.displayName,
            companyNameEn: userProfile?.companyName || jobData.companyNameEn || userProfile?.displayName,
            status: 'published'
          });
          setIsEmployerJobEditorOpen(false);
          setIsEmployerOfficeOpen(true);
        }}
      />

      {/* Employer Inquiries & Vacancy Publishing Request Modal */}
      <EmployerInquiryModal
        isOpen={isEmployerInquiryOpen}
        onClose={() => setIsEmployerInquiryOpen(false)}
        onSendMessage={handleSendEmployerMessage}
        countries={countries}
      />

      {/* Job Seeker Ad & Profile Boost Modal */}
      <JobSeekerEditorModal
        isOpen={isSeekerEditorOpen}
        onClose={() => setIsSeekerEditorOpen(false)}
        existingSeeker={jobSeekers.find(s => s.userId === user?.uid)}
        onSaveSeeker={handleSaveJobSeeker}
        countries={countries}
        categories={categories}
      />

      {/* First-time Login Role Selection Onboarding Modal */}
      <RoleOnboardingModal
        isOpen={showRoleOnboarding}
        onComplete={handleCompleteOnboarding}
      />

      {/* Privacy Policy & Data Safety Modal (Google Play Compliance) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
      />

      {/* Google Play Review & Test Credentials Modal */}
      <GooglePlayReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
      />

      {/* About & Contact Modals */}
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </LanguageProvider>
  );
}
