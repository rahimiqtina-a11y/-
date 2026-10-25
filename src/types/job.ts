export type Language = 'ar' | 'en';

export type EmploymentType =
  | 'all'
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'remote'
  | 'temporary'
  | 'internship';

export type ExperienceLevel =
  | 'all'
  | 'entry'
  | 'mid'
  | 'senior'
  | 'executive';

export type JobStatus = 'draft' | 'published' | 'expired' | 'filled';

export interface GCCCountry {
  id: string; // 'qatar' | 'uae' | 'saudi' | 'oman' | 'kuwait' | 'bahrain'
  nameAr: string;
  nameEn: string;
  currencyCode: 'QAR' | 'AED' | 'SAR' | 'OMR' | 'KWD' | 'BHD';
  currencySymbolAr: string;
  currencySymbolEn: string;
  cities: string[];
  citiesAr?: { [cityEn: string]: string };
  order: number;
  isActive: boolean;
  flagEmoji: string;
  imageUrl?: string;
}

export interface JobCategory {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
}

export interface JobAdvertisement {
  id: string;
  titleAr: string;
  titleEn: string;
  companyNameAr: string;
  companyNameEn: string;
  companyLogoUrl?: string;
  countryId: string;
  countryNameAr: string;
  countryNameEn: string;
  city: string;
  categoryId: string;
  categoryNameAr: string;
  categoryNameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  imageUrl?: string;
  hasImageOnly?: boolean;
  adFormat?: 'both' | 'image_only' | 'text_only';
  minSalary: number;
  maxSalary: number;
  salaryCurrency: string;
  salaryDisclosed: boolean;
  employmentType: string;
  experienceLevel: string;
  educationLevel?: string;
  skills?: string;
  workingHours?: string;
  benefits?: string;
  applicationDeadline?: string;
  contactPhone?: string;
  contactWhatsapp?: string;
  contactEmail?: string;
  applicationUrl?: string;
  publishedAt: string;
  expiresAt?: string;
  status: JobStatus;
  isFeatured: boolean;
  isDemo?: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilterState {
  keyword: string;
  countryId: string; // 'all' or specific country id (default: 'qatar')
  city: string; // 'all' or specific city
  categoryId: string; // 'all' or specific category id (default: 'sales-marketing')
  minSalary: number; // default: 3000
  maxSalary: number; // default: 8000
  salaryDisclosedOnly: boolean; // include/exclude undisclosed salaries
  includeUndisclosed: boolean;
  employmentType: EmploymentType; // default: 'all'
  experienceLevel: ExperienceLevel; // default: 'all'
  sortBy: 'newest' | 'oldest' | 'salary-high' | 'salary-low';
}

export interface AdminProfile {
  uid: string;
  email: string;
  role: 'superadmin' | 'admin';
  createdAt: string;
}

export type UserRole = 'job_seeker' | 'employer' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  headline?: string;
  countryId?: string;
  city?: string;
  phone?: string;
  whatsapp?: string;
  bio?: string;
  skills?: string;
  experienceYears?: string;
  education?: string;
  companyName?: string;
  isSeekingJob?: boolean;
  hasCompletedOnboarding?: boolean;
  // Employer approval & publishing permissions by Admin
  isEmployerApproved?: boolean;
  canPublishJobs?: boolean;
  publishingAccessExpiresAt?: string | null;
  publishingDurationType?: '1_week' | '1_month' | '3_months' | '6_months' | '1_year' | 'unlimited';
  createdAt: string;
  updatedAt: string;
}

export interface JobSeeker {
  id: string;
  userId: string;
  name: string;
  photoURL?: string;
  targetJobTitle: string;
  countryId: string;
  countryNameAr?: string;
  city: string;
  categoryId: string;
  categoryNameAr?: string;
  summary: string;
  experienceYears?: string;
  education?: string;
  skills?: string;
  expectedSalary?: string;
  salaryCurrency?: string;
  whatsapp?: string;
  phone?: string;
  email?: string;
  isBoosted?: boolean;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface EmployerMessage {
  id: string;
  senderUid: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  companyName?: string;
  subject: string;
  message: string;
  jobDetails?: string;
  countryId?: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: string;
}

export type BannerPlacement = 'home' | 'category' | 'all_categories' | 'global';
export type BannerType = 'image' | 'code' | 'smart_link';

export interface SmartLinkConfig {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  appDeepLink?: string;
  openInNewTab?: boolean;
}

export type BannerTheme = 'teal_navy' | 'gold_dark' | 'emerald_modern' | 'purple_royal' | 'crimson_bold';

export interface AdBanner {
  id: string;
  titleAr: string;
  titleEn: string;
  imageUrl?: string;
  targetUrl: string;
  placement: BannerPlacement;
  bannerType?: BannerType; // 'image' | 'code' | 'smart_link'
  customCode?: string; // HTML/JS/AdSense embed snippet
  smartLinkConfig?: SmartLinkConfig;
  cardTheme?: BannerTheme;
  badgeTextAr?: string;
  badgeTextEn?: string;
  categoryId?: string; // when placement === 'category'
  categoryNameAr?: string;
  categoryNameEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  callToActionAr?: string;
  callToActionEn?: string;
  isActive: boolean;
  clicksCount: number;
  order: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStatus = 'new' | 'reviewing' | 'shortlisted' | 'accepted' | 'rejected';

export interface JobApplication {
  id: string;
  jobId: string;
  jobTitleAr: string;
  jobTitleEn: string;
  companyNameAr?: string;
  companyNameEn?: string;
  employerId: string; // The user ID who created the job or 'admin'
  applicantUid: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantWhatsapp?: string;
  resumeUrl: string;
  resumeFileName: string;
  resumeFileSize?: number;
  resumeFileType?: string;
  resumeStorageType?: 'direct' | 'chunks' | 'storage';
  totalChunks?: number;
  coverNote?: string;
  experienceYears?: string;
  status: ApplicationStatus;
  employerNotes?: string;
  rejectionReason?: string;
  deletedByEmployer?: boolean;
  deletedByApplicant?: boolean;
  createdAt: string;
  updatedAt: string;
}



