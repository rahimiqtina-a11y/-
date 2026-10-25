import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Building2, 
  Mail, 
  Phone, 
  MessageSquare, 
  AlertCircle, 
  RefreshCw, 
  Sparkles,
  Check,
  X,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { UserProfile, JobAdvertisement } from '../../types/job';

interface EmployersManagementProps {
  jobs?: JobAdvertisement[];
  onFeedback?: (msg: string) => void;
}

type DurationOption = '1_week' | '1_month' | '3_months' | '6_months' | '1_year' | 'unlimited';

export const EmployersManagement: React.FC<EmployersManagementProps> = ({ 
  jobs = [],
  onFeedback 
}) => {
  const { language } = useLanguage();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'expired'>('all');
  const [updatingUid, setUpdatingUid] = useState<string | null>(null);

  // Per-employer selected duration in the UI before saving
  const [selectedDurations, setSelectedDurations] = useState<{ [uid: string]: DurationOption }>({});

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const list: UserProfile[] = [];
      snapshot.forEach(docSnap => {
        list.push({ uid: docSnap.id, ...docSnap.data() } as UserProfile);
      });
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setUsers(list);
      setLoading(false);
    }, (error) => {
      console.warn('Error fetching users:', error);
      try {
        handleFirestoreError(error, OperationType.LIST, 'users');
      } catch (e) {}
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter only employers or users with company info
  const employers = users.filter(u => u.role === 'employer' || (u.companyName && u.role !== 'admin'));

  const getEmployerStatus = (emp: UserProfile): 'active' | 'pending' | 'expired' => {
    if (!emp.canPublishJobs) return 'pending';
    if (!emp.publishingAccessExpiresAt) return 'active'; // unlimited
    const isPast = new Date(emp.publishingAccessExpiresAt).getTime() < Date.now();
    return isPast ? 'expired' : 'active';
  };

  const calculateExpiry = (duration: DurationOption): string | null => {
    const now = Date.now();
    switch (duration) {
      case '1_week':
        return new Date(now + 7 * 86400000).toISOString();
      case '1_month':
        return new Date(now + 30 * 86400000).toISOString();
      case '3_months':
        return new Date(now + 90 * 86400000).toISOString();
      case '6_months':
        return new Date(now + 180 * 86400000).toISOString();
      case '1_year':
        return new Date(now + 365 * 86400000).toISOString();
      case 'unlimited':
      default:
        return null;
    }
  };

  const handleGrantPublishing = async (emp: UserProfile, duration: DurationOption) => {
    setUpdatingUid(emp.uid);
    try {
      const expiry = calculateExpiry(duration);
      const userRef = doc(db, 'users', emp.uid);
      await updateDoc(userRef, {
        role: 'employer',
        isEmployerApproved: true,
        canPublishJobs: true,
        publishingAccessExpiresAt: expiry,
        publishingDurationType: duration,
        updatedAt: new Date().toISOString()
      });
      if (onFeedback) {
        onFeedback(language === 'ar' ? `تم تفعيل صلاحية النشر لصاحب العمل (${emp.companyName || emp.displayName}) بنجاح` : 'Employer publishing access activated successfully');
      }
    } catch (err) {
      console.error('Error activating employer:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `users/${emp.uid}`);
      } catch (e) {}
    } finally {
      setUpdatingUid(null);
    }
  };

  const handleRevokePublishing = async (emp: UserProfile) => {
    setUpdatingUid(emp.uid);
    try {
      const userRef = doc(db, 'users', emp.uid);
      await updateDoc(userRef, {
        canPublishJobs: false,
        isEmployerApproved: false,
        updatedAt: new Date().toISOString()
      });
      if (onFeedback) {
        onFeedback(language === 'ar' ? `تم إيقاف صلاحية النشر لصاحب العمل (${emp.companyName || emp.displayName})` : 'Employer publishing access deactivated');
      }
    } catch (err) {
      console.error('Error revoking employer:', err);
      try {
        handleFirestoreError(err, OperationType.UPDATE, `users/${emp.uid}`);
      } catch (e) {}
    } finally {
      setUpdatingUid(null);
    }
  };

  // Metrics
  const activeCount = employers.filter(e => getEmployerStatus(e) === 'active').length;
  const pendingCount = employers.filter(e => getEmployerStatus(e) === 'pending').length;
  const expiredCount = employers.filter(e => getEmployerStatus(e) === 'expired').length;

  const filteredEmployers = employers.filter(emp => {
    const status = getEmployerStatus(emp);
    if (filterStatus !== 'all' && status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.displayName?.toLowerCase().includes(q);
      const matchComp = emp.companyName?.toLowerCase().includes(q);
      const matchEmail = emp.email?.toLowerCase().includes(q);
      const matchPhone = emp.phone?.includes(q);
      if (!matchName && !matchComp && !matchEmail && !matchPhone) return false;
    }
    return true;
  });

  const getDurationLabel = (d?: string | null) => {
    switch (d) {
      case '1_week': return language === 'ar' ? 'أسبوع واحد' : '1 Week';
      case '1_month': return language === 'ar' ? 'شهر واحد' : '1 Month';
      case '3_months': return language === 'ar' ? '3 أشهر' : '3 Months';
      case '6_months': return language === 'ar' ? '6 أشهر' : '6 Months';
      case '1_year': return language === 'ar' ? 'سنة كاملة' : '1 Year';
      case 'unlimited': return language === 'ar' ? 'صلاحية غير محدودة' : 'Unlimited';
      default: return language === 'ar' ? 'شهر واحد' : '1 Month';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Info */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900">
                {language === 'ar' ? 'إدارة أصحاب العمل والشركات وتراخيص النشر' : 'Employers & Job Publishing Rights'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 font-bold text-xs">
                {employers.length} {language === 'ar' ? 'صاحب عمل' : 'employers'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              {language === 'ar'
                ? 'وفق نظام المنصة: كل صاحب عمل يسجل بالمنصة يظهر هنا ولا يمكنه نشر الوظائف حتى تقوم بتفعيله وتحديد المدة الزمنية المسموح له بالنشر خلالها (أسبوع، شهر، 3 أشهر، سنة، أو دائم).'
                : 'Control employer verification and publishing validity timeframes (1 week, 1 month, 3 months, 1 year, or unlimited).'}
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500 block mb-1">
              {language === 'ar' ? 'إجمالي أصحاب العمل' : 'Total Employers'}
            </span>
            <span className="text-2xl font-black text-slate-900 font-mono">
              {employers.length}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700 block mb-1">
              {language === 'ar' ? 'مفعّل وله صلاحية النشر' : 'Active & Approved'}
            </span>
            <span className="text-2xl font-black text-emerald-800 font-mono">
              {activeCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700 block mb-1">
              {language === 'ar' ? 'بانتظار الموافقة والتفعيل' : 'Pending Activation'}
            </span>
            <span className="text-2xl font-black text-amber-800 font-mono">
              {pendingCount}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200">
            <span className="text-[11px] font-bold text-rose-700 block mb-1">
              {language === 'ar' ? 'منتهية الصلاحية' : 'Expired Rights'}
            </span>
            <span className="text-2xl font-black text-rose-800 font-mono">
              {expiredCount}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'ar' ? 'بحث باسم الشركة، صاحب العمل، الإيميل...' : 'Search by company, employer, email...'}
            className="w-full pr-9 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00A896]"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {language === 'ar' ? 'الكل' : 'All'} ({employers.length})
          </button>
          <button
            onClick={() => setFilterStatus('active')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${filterStatus === 'active' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {language === 'ar' ? 'المفعلين' : 'Active'} ({activeCount})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${filterStatus === 'pending' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {language === 'ar' ? 'بانتظار التفعيل' : 'Pending'} ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('expired')}
            className={`px-3 py-1.5 rounded-xl transition shrink-0 ${filterStatus === 'expired' ? 'bg-white text-rose-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            {language === 'ar' ? 'المنتهية' : 'Expired'} ({expiredCount})
          </button>
        </div>
      </div>

      {/* Employers List */}
      {loading ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <RefreshCw className="w-8 h-8 text-[#00A896] animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-bold">
            {language === 'ar' ? 'جاري تحميل قائمة أصحاب العمل...' : 'Loading employers...'}
          </p>
        </div>
      ) : filteredEmployers.length === 0 ? (
        <div className="py-20 text-center space-y-3 bg-white rounded-3xl border border-slate-200 p-8">
          <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-slate-800">
            {language === 'ar' ? 'لا يوجد أصحاب عمل في هذا القسم' : 'No employers match this filter'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {language === 'ar'
              ? 'عندما يسجل أي صاحب عمل أو شركة حسابه في المنصة، سيظهر حسابه هنا لتتمكن من تفعيله وتحديد مدة النشر.'
              : 'Registered employer accounts will appear here for admin publishing approvals.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEmployers.map((emp) => {
            const status = getEmployerStatus(emp);
            const currentDuration: DurationOption = selectedDurations[emp.uid] || (emp.publishingDurationType as DurationOption) || '1_month';
            const empJobsCount = jobs.filter(j => j.createdBy === emp.uid).length;
            const isUpdating = updatingUid === emp.uid;

            let remainingText = '';
            if (emp.publishingAccessExpiresAt) {
              const diffMs = new Date(emp.publishingAccessExpiresAt).getTime() - Date.now();
              const diffDays = Math.ceil(diffMs / 86400000);
              if (diffDays > 0) {
                remainingText = language === 'ar' ? `(متبقي ${diffDays} يوم)` : `(${diffDays} days left)`;
              } else {
                remainingText = language === 'ar' ? '(انتهت الصلاحية)' : '(Expired)';
              }
            } else if (emp.canPublishJobs) {
              remainingText = language === 'ar' ? '(دائم)' : '(Unlimited)';
            }

            return (
              <div 
                key={emp.uid}
                className={`p-6 rounded-3xl border transition-all ${
                  status === 'active' 
                    ? 'bg-white border-slate-200 shadow-sm'
                    : status === 'pending'
                    ? 'bg-amber-50/50 border-amber-300 shadow-sm'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  
                  {/* Employer Profile Info */}
                  <div className="flex items-start gap-4">
                    {emp.photoURL ? (
                      <img 
                        src={emp.photoURL} 
                        alt={emp.displayName} 
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 to-teal-950 text-[#00A896] flex items-center justify-center font-black text-xl shrink-0 border border-teal-500/30">
                        {emp.companyName ? emp.companyName.charAt(0) : emp.displayName?.charAt(0) || 'E'}
                      </div>
                    )}

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-black text-base text-slate-900">
                          {emp.companyName || emp.displayName}
                        </h3>

                        {/* Status Badge */}
                        {status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            {language === 'ar' ? 'مفعّل وله صلاحية النشر' : 'Active & Approved'}
                          </span>
                        ) : status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                            <Clock className="w-3.5 h-3.5 text-amber-700" />
                            {language === 'ar' ? 'بانتظار تفعيل النشر' : 'Pending Activation'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200">
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            {language === 'ar' ? 'انتهت صلاحية النشر' : 'Access Expired'}
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                          {empJobsCount} {language === 'ar' ? 'وظيفة منشورة' : 'jobs'}
                        </span>
                      </div>

                      {emp.displayName && emp.companyName && (
                        <p className="text-xs text-slate-500 font-medium">
                          {language === 'ar' ? 'المسؤول:' : 'Contact:'} {emp.displayName}
                        </p>
                      )}

                      {/* Contact Badges */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-0.5">
                        <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {emp.email}
                        </span>

                        {emp.phone && (
                          <a
                            href={`https://wa.me/${emp.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-emerald-700 hover:underline font-mono text-[11px]"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {emp.phone}
                          </a>
                        )}

                        {emp.city && (
                          <span className="text-[11px] text-slate-400">
                            • {emp.city}
                          </span>
                        )}
                      </div>

                      {/* Expiration Note */}
                      {status === 'active' && emp.publishingAccessExpiresAt && (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold pt-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                          <span>
                            {language === 'ar' ? 'صلاحية النشر تنتهي في:' : 'Expires:'}{' '}
                            <strong className="font-mono">{new Date(emp.publishingAccessExpiresAt).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}</strong>{' '}
                            {remainingText}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Publishing Control Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                        {language === 'ar' ? 'تحديد فترة النشر:' : 'Publishing Timeframe:'}
                      </label>
                      <select
                        value={currentDuration}
                        onChange={(e) => {
                          const val = e.target.value as DurationOption;
                          setSelectedDurations(prev => ({ ...prev, [emp.uid]: val }));
                        }}
                        className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#00A896]"
                      >
                        <option value="1_week">{language === 'ar' ? 'أسبوع واحد (7 أيام)' : '1 Week (7 days)'}</option>
                        <option value="1_month">{language === 'ar' ? 'شهر واحد (30 يوماً)' : '1 Month (30 days)'}</option>
                        <option value="3_months">{language === 'ar' ? '3 أشهر (90 يوماً)' : '3 Months (90 days)'}</option>
                        <option value="6_months">{language === 'ar' ? '6 أشهر (180 يوماً)' : '6 Months (180 days)'}</option>
                        <option value="1_year">{language === 'ar' ? 'سنة كاملة (365 يوماً)' : '1 Year (365 days)'}</option>
                        <option value="unlimited">{language === 'ar' ? 'دائم / غير محدود' : 'Unlimited'}</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-4">
                      {status === 'active' ? (
                        <>
                          <button
                            onClick={() => handleGrantPublishing(emp, currentDuration)}
                            disabled={isUpdating}
                            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                            title={language === 'ar' ? 'تجديد الصلاحية بالفترة المختارة' : 'Renew with selected period'}
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                            <span>{language === 'ar' ? 'تجديد / تمديد' : 'Renew / Extend'}</span>
                          </button>

                          <button
                            onClick={() => handleRevokePublishing(emp)}
                            disabled={isUpdating}
                            className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>{language === 'ar' ? 'إيقاف النشر' : 'Revoke'}</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGrantPublishing(emp, currentDuration)}
                          disabled={isUpdating}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-xs shadow-md shadow-teal-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <CheckCircle className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
                          <span>{language === 'ar' ? 'موافقة وتفعيل صلاحية النشر' : 'Approve & Activate'}</span>
                        </button>
                      )}
                    </div>

                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
