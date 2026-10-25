import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building, 
  MapPin, 
  Briefcase, 
  Send,
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileCheck,
  LogIn,
  Shield
} from 'lucide-react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, uploadResumeFile } from '../../lib/firebase';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { JobAdvertisement, JobApplication } from '../../types/job';

interface ApplyJobModalProps {
  job: JobAdvertisement;
  onClose: () => void;
  onSuccess?: () => void;
  onBrowseMoreJobs?: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({ 
  job, 
  onClose, 
  onSuccess,
  onBrowseMoreJobs 
}) => {
  const { language, t } = useLanguage();
  const { user, userProfile, loginWithGoogle } = useAuth();

  const [applicantName, setApplicantName] = useState(userProfile?.displayName || user?.displayName || '');
  const [applicantEmail, setApplicantEmail] = useState(userProfile?.email || user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState(userProfile?.phone || userProfile?.whatsapp || '');
  const [experienceYears, setExperienceYears] = useState(userProfile?.experienceYears || '');
  const [coverNote, setCoverNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Sync user info when authentication state changes
  React.useEffect(() => {
    if (user) {
      if (!applicantName) setApplicantName(userProfile?.displayName || user.displayName || '');
      if (!applicantEmail) setApplicantEmail(userProfile?.email || user.email || '');
      if (!applicantPhone) setApplicantPhone(userProfile?.phone || userProfile?.whatsapp || '');
    }
  }, [user, userProfile]);

  const jobTitle = (language === 'ar' ? job.titleAr : job.titleEn) || job.titleAr || job.titleEn;
  const company = (language === 'ar' ? job.companyNameAr : job.companyNameEn) || job.companyNameAr || job.companyNameEn || (language === 'ar' ? 'جهة عمل معتمدة' : 'Verified Employer');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    setErrorMsg(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validExtensions = ['.pdf', '.doc', '.docx', '.png', '.jpg', '.jpeg', '.webp'];
      const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

      if (!validExtensions.includes(ext)) {
        setFileError(language === 'ar' ? 'يرجى اختيار ملف بصيغة PDF أو Word أو صورة واضحة.' : 'Please select a PDF, Word document, or image file.');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setFileError(language === 'ar' ? 'حجم الملف يتجاوز 10 ميجابايت. يرجى اختيار ملف أصغر.' : 'File size exceeds 10MB limit.');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!user) {
      setErrorMsg(language === 'ar' ? 'يجب تسجيل الدخول أولاً بحساب Google لإرسال طلب التقديم.' : 'You must sign in with Google to submit an application.');
      return;
    }
    if (!applicantName.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
      return;
    }
    if (!applicantEmail.trim() || !applicantEmail.includes('@')) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صالح.' : 'Please enter a valid email address.');
      return;
    }
    if (!applicantPhone.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال رقم الهاتف أو الواتساب للتواصل معك.' : 'Please enter your phone or WhatsApp number.');
      return;
    }
    if (!selectedFile) {
      setErrorMsg(language === 'ar' ? 'يرجى إرفاق ملف السيرة الذاتية (CV).' : 'Please attach your resume/CV file.');
      return;
    }

    setIsSubmitting(true);
    setUploadStatusText(language === 'ar' ? 'جارٍ معالجة وتأمين ملف السيرة الذاتية...' : 'Processing and securing resume file...');

    // Overall submission safety timeout (40 seconds) to prevent infinite mobile spinner
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(
          language === 'ar'
            ? 'استغرق إرسال الطلب وقتاً أطول من المتوقع بسبب ضعف اتصال شبكة الهاتف. يرجى إعادة المحاولة.'
            : 'Submission took longer than expected on this mobile connection. Please retry.'
        ));
      }, 40000);
    });

    const submitWork = async () => {
      // 1. Process CV / Resume file safely (with mobile image compression & safety checks)
      const uploadResult = await uploadResumeFile(selectedFile);

      // 2. Prepare Application record with unique ID
      const applicationId = `app_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const employerId = job.createdBy || 'admin';

      const newApplication: JobApplication = {
        id: applicationId,
        jobId: job.id,
        jobTitleAr: job.titleAr,
        jobTitleEn: job.titleEn,
        companyNameAr: job.companyNameAr,
        companyNameEn: job.companyNameEn,
        employerId: employerId,
        applicantUid: user.uid,
        applicantName: applicantName.trim(),
        applicantEmail: applicantEmail.trim(),
        applicantPhone: applicantPhone.trim(),
        applicantWhatsapp: applicantPhone.trim(),
        resumeUrl: uploadResult.downloadUrl,
        resumeFileName: uploadResult.fileName,
        resumeFileSize: uploadResult.fileSize,
        resumeFileType: uploadResult.fileType,
        resumeStorageType: uploadResult.storageType,
        totalChunks: uploadResult.totalChunks || (uploadResult.chunks ? uploadResult.chunks.length : 0),
        coverNote: coverNote.trim(),
        experienceYears: experienceYears.trim(),
        status: 'new',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setUploadStatusText(language === 'ar' ? 'جارٍ تسجيل الطلب في مكتب صاحب العمل...' : 'Registering application at employer desk...');
      // 3. Save main application to Firestore /applications
      await setDoc(doc(db, 'applications', applicationId), newApplication);

      // 4. If chunked, write in small sequential batches of 2 for mobile cellular network stability
      if (uploadResult.storageType === 'chunks' && uploadResult.chunks && uploadResult.chunks.length > 0) {
        const total = uploadResult.chunks.length;
        for (let i = 0; i < total; i += 2) {
          const batch = uploadResult.chunks.slice(i, i + 2);
          setUploadStatusText(
            language === 'ar' 
              ? `جارٍ تأمين وحفظ السيرة الذاتية (${Math.min(i + 2, total)} من ${total})...` 
              : `Securing and saving resume (${Math.min(i + 2, total)} of ${total})...`
          );
          
          await Promise.all(
            batch.map((chunk, offset) => {
              const chunkIndex = i + offset;
              const chunkDocRef = doc(db, 'applications', applicationId, 'resume_chunks', `chunk_${chunkIndex}`);
              return setDoc(chunkDocRef, {
                index: chunkIndex,
                data: chunk,
                createdAt: new Date().toISOString()
              });
            })
          );
        }
      }

      setUploadStatusText(language === 'ar' ? 'تم اكتمال الإرسال بنجاح!' : 'Application sent successfully!');
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    };

    try {
      await Promise.race([submitWork(), timeoutPromise]);
    } catch (err: any) {
      console.error('Error submitting application:', err);
      let message = language === 'ar' 
        ? 'حدث خطأ أثناء إرسال الطلب. يرجى التأكد من اتصال الإنترنت وإعادة المحاولة.' 
        : 'An error occurred while submitting. Please check your connection and try again.';
      
      if (err?.message) {
        message = err.message;
      }
      setErrorMsg(message);
    } finally {
      setIsSubmitting(false);
      setUploadStatusText(null);
    }
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-4 max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                {language === 'ar' ? 'التقدم للوظيفة وإرسال السيرة الذاتية' : 'Apply for Job & Submit Resume'}
              </h2>
              <p className="text-xs text-teal-200 font-medium">
                {language === 'ar' ? 'إرسال مباشر إلى مكتب صاحب العمل' : 'Direct submission to employer desk'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-900">
                  {language === 'ar' ? 'تم إرسال طلبك وسيرتك الذاتية بنجاح!' : 'Application Submitted Successfully!'}
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {language === 'ar'
                    ? `وصلت سيرتك الذاتية وبياناتك مباشرة إلى مكتب ${company} لمراجعتها. سيتم التواصل معك عبر رقم الهاتف أو البريد الإلكتروني المدخل فور مراجعة ملفك.`
                    : `Your resume has been delivered to ${company}'s employer desk. You will be contacted via your provided phone or email upon review.`}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-xs text-teal-900 font-bold text-center">
                <span>{language === 'ar' ? `الوظيفة المتقدم إليها: ${jobTitle}` : `Applied Position: ${jobTitle}`}</span>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-extrabold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>{language === 'ar' ? 'العودة لتفاصيل الوظيفة' : 'Back to Job Details'}</span>
                </button>

                {onBrowseMoreJobs && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onBrowseMoreJobs();
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-sm transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Briefcase className="w-4 h-4 text-teal-600" />
                    <span>{language === 'ar' ? 'تصفح وظائف أخرى' : 'Browse More Vacancies'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : !user ? (
            <div className="py-8 px-4 text-center space-y-5 animate-in zoom-in-95 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 mx-auto flex items-center justify-center shadow-inner">
                <LogIn className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  {language === 'ar' ? 'تسجيل الدخول مطلوب للتقديم على الوظيفة' : 'Sign in Required to Apply'}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'ar'
                    ? 'لحفظ وتأمين بياناتك وتمكينك من متابعة قبول السيرة الذاتية وقرارات جهة العمل لحظة بلحظة، يرجى تسجيل الدخول أولاً بحساب Google.'
                    : 'To secure your submission and track employer updates in real-time, please sign in with Google.'}
                </p>
              </div>

              {/* Job summary card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 text-center font-bold">
                <span className="text-teal-700 block text-[11px] mb-0.5">{language === 'ar' ? 'الوظيفة المستهدفة' : 'Target Position'}</span>
                <span>{jobTitle} • {company}</span>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                onClick={async () => {
                  setErrorMsg(null);
                  setIsLoggingIn(true);
                  try {
                    await loginWithGoogle();
                  } catch (e: any) {
                    setErrorMsg(e?.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.' : 'Login failed. Please try again.'));
                  } finally {
                    setIsLoggingIn(false);
                  }
                }}
                disabled={isLoggingIn}
                className="w-full py-3.5 rounded-2xl bg-[#00A896] hover:bg-[#009688] disabled:bg-slate-300 text-white font-black text-sm shadow-md shadow-teal-600/25 transition flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                <span>{language === 'ar' ? 'المتابعة وتسجيل الدخول بحساب Google' : 'Continue & Sign in with Google'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                {language === 'ar' ? 'إلغاء والعودة' : 'Cancel'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Job Summary Banner (Respects privacy: ONLY company name is shown, no numbers) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                    {language === 'ar' ? 'فرصة عمل' : 'Opportunity'}
                  </span>
                  <h4 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1 line-clamp-1">
                    {jobTitle}
                  </h4>
                  <p className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mt-0.5">
                    <Building className="w-3.5 h-3.5 text-teal-600" />
                    <span>{company}</span>
                  </p>
                </div>
                <div className="text-end">
                  <span className="text-xs text-slate-500 font-medium">
                    {job.city}
                  </span>
                </div>
              </div>

              {/* Employer Privacy Notice */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 flex items-center gap-2.5 text-xs text-amber-900">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  {language === 'ar' 
                    ? 'خصوصية صاحب العمل محفوظة: يتم استلام السير الذاتية في مكتب التوظيف الخاص بالجهة المعلنة دون نشر وسائل الاتصال المباشرة.'
                    : 'Employer privacy is protected: Applications are received directly in the employer desk without publishing direct contact numbers.'}
                </span>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute top-3.5 start-3" />
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: عبد الله أحمد المنصوري' : 'e.g. John Doe'}
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              {/* Email & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    {language === 'ar' ? 'البريد الإلكتروني *' : 'Email Address *'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3" />
                    <input
                      type="email"
                      required
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    {language === 'ar' ? 'رقم الهاتف / واتساب *' : 'Phone / WhatsApp *'}
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute top-3.5 start-3" />
                    <input
                      type="tel"
                      required
                      value={applicantPhone}
                      onChange={(e) => setApplicantPhone(e.target.value)}
                      placeholder="+974 5512 3456"
                      className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Experience Years */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'سنوات الخبرة العملية' : 'Years of Experience'}
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-slate-400 absolute top-3.5 start-3" />
                  <input
                    type="text"
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(e.target.value)}
                    placeholder={language === 'ar' ? 'مثال: 5 سنوات في المبيعات والتسويق' : 'e.g. 5 years in marketing'}
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                  />
                </div>
              </div>

              {/* CV / Resume File Upload (Crucial Feature) */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5 flex items-center justify-between">
                  <span>{language === 'ar' ? 'تحميل السيرة الذاتية (CV / Resume) *' : 'Upload Resume / CV *'}</span>
                  <span className="text-[11px] text-teal-600 font-bold">PDF, Word, Images (Max 10MB)</span>
                </label>

                <div className={`relative border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                  selectedFile 
                    ? 'border-emerald-400 bg-emerald-50/40' 
                    : fileError 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : 'border-slate-300 hover:border-teal-500 bg-slate-50/60'
                }`}>
                  <input
                    type="file"
                    id="cv_file_input"
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />

                  {selectedFile ? (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-slate-900 break-all">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500 font-mono">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {language === 'ar' ? 'جاهز للإرسال' : 'Ready to send'}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                        }}
                        className="text-xs font-bold text-rose-600 hover:underline"
                      >
                        {language === 'ar' ? 'تغيير الملف' : 'Change File'}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-extrabold text-slate-800">
                        {language === 'ar' ? 'اضغط لاختيار ملف السيرة الذاتية أو اسحبه إلى هنا' : 'Click to select your CV file or drag and drop'}
                      </p>
                      <p className="text-xs text-slate-400">
                        {language === 'ar' ? 'صيغ مدعومة: PDF أو DOCX أو صور عالية الدقة' : 'Supported: PDF, DOCX, or high-res images'}
                      </p>
                    </div>
                  )}
                </div>
                {fileError && (
                  <p className="text-xs text-rose-600 mt-1 font-semibold">{fileError}</p>
                )}
              </div>

              {/* Cover Note / Message to Employer */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  {language === 'ar' ? 'رسالة تعريفية لصاحب العمل (اختياري)' : 'Cover Note to Employer (Optional)'}
                </label>
                <textarea
                  rows={3}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder={language === 'ar' ? 'عرّف بنفسك وبأبرز إنجازاتك ولماذا أنت الأنسب لهذه الفرصة...' : 'Briefly introduce yourself and why you are the best fit for this role...'}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 h-12 rounded-2xl bg-[#00A896] hover:bg-[#009688] disabled:bg-slate-300 text-white font-extrabold text-sm shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{uploadStatusText || (language === 'ar' ? 'جارٍ رفع السيرة الذاتية وإرسال الطلب...' : 'Uploading Resume & Submitting...')}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>{language === 'ar' ? 'إرسال طلب التوظيف والسيرة الذاتية' : 'Submit Application & Resume'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-5 h-12 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-sm transition-colors"
                >
                  {language === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>

            </form>
          )}
        </div>
      </div>
    </div>
  );
};
