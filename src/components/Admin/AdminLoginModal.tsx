import React, { useState } from 'react';
import { X, Shield, Lock, CheckCircle2, AlertTriangle, Mail, Key } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { language, t } = useLanguage();
  const { user, isAdmin, loginWithGoogle, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Email / password state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || (language === 'ar' ? 'فشل تسجيل الدخول. يرجى المحاولة مرة أخرى.' : 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Use Google Sign In as standard authenticated flow for Firebase admin
    handleGoogleLogin();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B1528]/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div 
        className="w-full max-w-md bg-[#101D36] rounded-3xl shadow-2xl border border-slate-700/80 overflow-hidden text-white relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 end-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mockup Screen 7 Layout */}
        <div className="p-8 text-center space-y-6">
          
          {/* Circular Gulf Map / Emblem Icon */}
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-teal-500 to-cyan-400 text-slate-950 mx-auto flex items-center justify-center shadow-xl shadow-teal-500/20 font-black text-3xl">
            🌍
          </div>

          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Gulf Jobs
            </h2>
            <p className="text-sm font-bold text-teal-400">
              وظائف الخليج
            </p>
          </div>

          <div className="pt-2">
            <h3 className="text-lg font-black text-white mb-1">
              {language === 'ar' ? 'تسجيل دخول المدير' : 'Administrator Sign In'}
            </h3>
            <p className="text-xs text-slate-400">
              {language === 'ar' ? 'يرجى إدخال بياناتك للدخول إلى لوحة التحكم' : 'Please authenticate to access the admin portal'}
            </p>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2 text-start">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {user && !isAdmin && (
            <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 text-xs text-start">
              <p className="font-bold">{t.admin.unauthorizedAdmin}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{user.email}</p>
            </div>
          )}

          {user && isAdmin && (
            <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs text-start">
              <p className="font-bold">{t.admin.welcome}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{user.email}</p>
            </div>
          )}

          {/* Form matching Mockup Screen 7 */}
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-start">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@yourdomain.com"
                  className="w-full h-12 px-4 rounded-2xl bg-[#091224] border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-teal-500"
                />
                <Mail className="w-4 h-4 text-slate-500 absolute end-4 top-4" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'كلمة المرور' : 'Password'}
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full h-12 px-4 rounded-2xl bg-[#091224] border border-slate-700 text-white text-xs sm:text-sm outline-none focus:border-teal-500"
                />
                <Key className="w-4 h-4 text-slate-500 absolute end-4 top-4" />
              </div>
            </div>

            {/* Teal Sign In Button matching Mockup Screen 7 */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-[#00A896] hover:bg-[#009688] text-white font-black text-sm shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loading ? t.admin.saving : (language === 'ar' ? 'تسجيل الدخول المباشر (Google)' : 'Sign In with Google')}</span>
            </button>
          </form>

          {/* Footer note: محمي وآمن | Firebase Authentication */}
          <div className="pt-2 text-xs text-slate-500 flex items-center justify-center gap-1.5 border-t border-slate-800">
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>محمي وآمن | Firebase Authentication</span>
          </div>

        </div>
      </div>
    </div>
  );
};
