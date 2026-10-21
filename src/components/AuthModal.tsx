import React, { useState } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  X, 
  User, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  UserCheck, 
  UserPlus, 
  Sparkles, 
  PartyPopper, 
  ShoppingCart, 
  AlertCircle,
  ShieldCheck
} from 'lucide-react';
import { MealyLogoMark } from './icons/MealWiseLogo';
import { getMemberCodeForEmail, saveUserPartition } from '../services/userDatabase';

export const AuthModal: React.FC = () => {
  const { 
    isAuthModalOpen, 
    closeAuthModal, 
    authModalMode, 
    setAuthModalMode, 
    loginUser, 
    showToast 
  } = useMealWise();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const previewMemberCode = email.trim() ? getMemberCodeForEmail(email.trim()) : null;

  const handleClose = () => {
    setEmailError(null);
    closeAuthModal();
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    setEmailError(null);
    setAuthModalMode(mode);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Vui lòng nhập Email hoặc Số điện thoại của bạn');
      showToast('⚠️ Vui lòng điền Email hoặc Số điện thoại để tiếp tục!', 'warning');
      return;
    }

    setEmailError(null);
    const displayName = name.trim() || cleanEmail.split('@')[0] || 'Thành Viên Mealy';
    const isRegister = authModalMode === 'register';

    if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
      setIsSubmitting(true);
      try {
        const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: displayName,
            email: cleanEmail,
            password: password.trim()
          })
        });
        const data = await res.json().catch(() => null);
        if (res.status === 401 && data?.error) {
          setIsSubmitting(false);
          setEmailError(data.error);
          showToast(`⚠️ ${data.error}`, 'warning');
          return;
        }
        if (data?.ok && data.user) {
          if (data.user.id && data.partition) {
            saveUserPartition(data.user.id, data.partition);
          }
          setIsSubmitting(false);
          loginUser({
            name: data.user.name || displayName,
            email: cleanEmail
          }, isRegister);
          setName('');
          setEmail('');
          setPassword('');
          setEmailError(null);
          return;
        }
      } catch {
        // Fallback to local offline-first registration/login if server is unreachable
      }
      setIsSubmitting(false);
    }

    loginUser({
      name: displayName,
      email: cleanEmail
    }, authModalMode === 'register');

    // Reset inputs
    setName('');
    setEmail('');
    setPassword('');
    setEmailError(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div 
        className="w-full max-w-md sm:max-w-lg bg-white dark:bg-[#1A1918] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E8E2D8] dark:border-[#252220] space-y-4 relative max-h-[92dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-white flex items-center justify-center transition-all cursor-pointer"
          aria-label="Đóng"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
            <MealyLogoMark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              {authModalMode === 'register' ? 'Đăng Ký Thành Viên' : 'Đăng Nhập Tài Khoản'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Mở khóa toàn bộ tính năng độc quyền trên Mealy
            </p>
          </div>
        </div>

        {/* Features Unlocked Pill Banner */}
        <div className="p-3 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs text-stone-700 dark:text-stone-300 space-y-1.5">
          <span className="font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300" /> Quyền Lợi Khi Có Tài Khoản
          </span>
          <div className="grid grid-cols-2 gap-2 text-[11px] font-medium pt-0.5">
            <div className="flex items-center gap-1.5">
              <PartyPopper className="w-3.5 h-3.5 text-stone-700 dark:text-stone-300 shrink-0" />
              <span>Lên Thực Đơn Tiệc</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Chia Sẻ Đi Chợ Live</span>
            </div>
          </div>
        </div>

        {/* Mode switch tabs */}
        <div className="flex rounded-2xl bg-stone-100 dark:bg-[#121110] p-1 border border-[#E8E2D8] dark:border-[#252220] shadow-inner">
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalMode === 'register'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Đăng Ký</span>
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 py-2 text-xs font-black rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
              authModalMode === 'login'
                ? 'bg-stone-900 text-white dark:bg-white dark:text-stone-950 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Đăng Nhập</span>
          </button>
        </div>

        {/* Form without HTML5 default validation tooltips */}
        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Tên người dùng / Tên gia đình
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Anh Tuấn, Gia đình Minh..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20"
                />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700 dark:text-stone-300">
                Email hoặc Số điện thoại <span className="text-rose-500">*</span>
              </label>
              {emailError && (
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-500 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 animate-shake">
                  Bắt buộc
                </span>
              )}
            </div>
            <div className="relative">
              <div className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                emailError ? 'text-rose-500' : 'text-stone-400'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="email@example.com hoặc 0912..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white dark:bg-[#121110] text-stone-900 dark:text-white text-xs sm:text-sm transition-all focus:outline-none ${
                  emailError
                    ? 'border-2 border-rose-500 dark:border-rose-400 ring-4 ring-rose-500/15 bg-rose-50/20 dark:bg-rose-950/20'
                    : 'border border-[#E8E2D8] dark:border-[#252220] focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20'
                }`}
              />
              {emailError && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-rose-500">
                  <AlertCircle className="w-4 h-4 animate-pulse" />
                </div>
              )}
            </div>

            {/* Native Mobile Warning Tag */}
            {emailError && (
              <div 
                role="alert"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold mt-1.5 animate-shake shadow-2xs"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{emailError}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
              Mật khẩu
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu bảo vệ tài khoản"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
          >
            {isSubmitting ? (
              <span>Đang kết nối máy chủ Mealy...</span>
            ) : authModalMode === 'register' ? (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Hoàn Tất Đăng Ký & Lưu Lên Máy Chủ</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Đăng Nhập & Tải Dữ Liệu Cá Nhân</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-center text-stone-500 dark:text-stone-400">
          Mealy cam kết bảo mật 100% dữ liệu cá nhân của bạn.
        </p>
      </div>
    </div>
  );
};
