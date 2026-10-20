import React, { useState, useEffect, useRef } from 'react';
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
  ShieldCheck,
  RotateCcw,
  Clock
} from 'lucide-react';
import { MealyLogoMark } from './icons/MealWiseLogo';
import {
  requestBackendEmailOtp,
  verifyBackendEmailOtp,
  resetUserPasswordWithBackendOtp,
  evaluatePasswordStrength,
  validateEmailOrPhone
} from '../services/otpSecurityService';

type AuthSubFlow = 'standard' | 'otp-verify' | 'forgot-password';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    loginUser,
    showToast
  } = useMealWise();

  // React Rules of Hooks Invariant: All hooks MUST be unconditionally at the top before any early return
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [subFlow, setSubFlow] = useState<AuthSubFlow>('standard');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [maskedTarget, setMaskedTarget] = useState<string>('');
  const [cooldownSec, setCooldownSec] = useState<number>(0);
  const [ttlRemainingSec, setTtlRemainingSec] = useState<number>(300);
  const [requireOtpOnRegister, setRequireOtpOnRegister] = useState<boolean>(true);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const otpInputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec]);

  useEffect(() => {
    if (subFlow === 'standard' || ttlRemainingSec <= 0) return;
    const timer = setInterval(() => {
      setTtlRemainingSec(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [subFlow, ttlRemainingSec]);

  if (!isAuthModalOpen) return null;

  const passwordStrength = evaluatePasswordStrength(subFlow === 'forgot-password' ? newPassword : password);

  const formatCountdown = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const resetModalState = () => {
    setEmailError(null);
    setOtpError(null);
    setSubFlow('standard');
    setOtpDigits(['', '', '', '', '', '']);
  };

  const handleClose = () => {
    resetModalState();
    closeAuthModal();
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    resetModalState();
    setAuthModalMode(mode);
  };

  const handleSendOtp = async (purpose: 'login' | 'register' | 'reset-password') => {
    const cleanEmail = email.trim();
    const validation = validateEmailOrPhone(cleanEmail);
    if (!validation.valid || (validation.type !== 'email' && validation.type !== 'admin')) {
      const msg = 'Vui lòng nhập địa chỉ Email hợp lệ để nhận mã xác thực OTP.';
      setEmailError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    setEmailError(null);
    setOtpError(null);
    setIsSendingOtp(true);

    try {
      const res = await requestBackendEmailOtp(cleanEmail, purpose, subFlow === 'standard');
      if (!res.ok) {
        setOtpError(res.message);
        if (res.cooldownRemainingSeconds) {
          setCooldownSec(res.cooldownRemainingSeconds);
        }
        setSubFlow(purpose === 'reset-password' ? 'forgot-password' : 'otp-verify');
        showToast(`⚠️ ${res.message}`, 'warning');
        return;
      }

      setMaskedTarget(res.maskedTarget || cleanEmail);
      setCooldownSec(res.cooldownRemainingSeconds || 60);
      setTtlRemainingSec(res.expiresInSeconds || 300);
      setOtpDigits(['', '', '', '', '', '']);
      setSubFlow(purpose === 'reset-password' ? 'forgot-password' : 'otp-verify');
      showToast(`📩 ${res.message}`);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (!digitsOnly) {
      const next = [...otpDigits];
      next[index] = '';
      setOtpDigits(next);
      return;
    }

    // Handle multi-digit paste or autofill into a single input
    if (digitsOnly.length > 1) {
      const chars = digitsOnly.slice(0, 6).split('');
      const next = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        next[i] = chars[i] || '';
      }
      setOtpDigits(next);
      setOtpError(null);
      const focusIdx = Math.min(5, chars.length - 1);
      otpInputRefs.current[focusIdx]?.focus();
      return;
    }

    const next = [...otpDigits];
    next[index] = digitsOnly[0];
    setOtpDigits(next);
    setOtpError(null);
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtpAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setOtpError('Vui lòng nhập đủ 6 chữ số của mã xác thực.');
      return;
    }

    setIsVerifyingOtp(true);
    const cleanEmail = email.trim();
    try {
      if (subFlow === 'forgot-password') {
        const resetRes = await resetUserPasswordWithBackendOtp(cleanEmail, code, newPassword);
        if (!resetRes.success) {
          setOtpError(resetRes.message);
          showToast(`⚠️ ${resetRes.message}`, 'error');
          return;
        }

        const displayName = name.trim() || cleanEmail.split('@')[0] || 'Thành Viên Mealy';
        loginUser(
          {
            name: displayName,
            email: cleanEmail,
            password: newPassword.trim(),
            otpVerified: true
          },
          false
        );
        showToast(`🔐 ${resetRes.message}`);
        resetModalState();
        setName('');
        setEmail('');
        setPassword('');
        setNewPassword('');
        return;
      }

      const verifyRes = await verifyBackendEmailOtp(cleanEmail, code);
      if (!verifyRes.valid) {
        setOtpError(verifyRes.message);
        showToast(`⚠️ ${verifyRes.message}`, 'error');
        return;
      }

      const displayName = name.trim() || cleanEmail.split('@')[0] || 'Thành Viên Mealy';
      const ok = loginUser(
        {
          name: displayName,
          email: cleanEmail,
          password: password.trim() || undefined,
          otpVerified: true
        },
        authModalMode === 'register'
      );

      if (ok !== false) {
        resetModalState();
        setName('');
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setEmailError('Vui lòng nhập Email hoặc Số điện thoại của bạn');
      showToast('⚠️ Vui lòng điền Email hoặc Số điện thoại để tiếp tục!', 'warning');
      return;
    }

    const validation = validateEmailOrPhone(cleanEmail);
    if (!validation.valid) {
      setEmailError(validation.error || 'Định dạng Email hoặc Số điện thoại chưa hợp lệ');
      showToast(`⚠️ ${validation.error}`, 'warning');
      return;
    }

    // If user toggled OTP verification during registration
    if (requireOtpOnRegister && subFlow === 'standard') {
      handleSendOtp(authModalMode === 'register' ? 'register' : 'login');
      return;
    }

    setEmailError(null);
    const displayName = name.trim() || cleanEmail.split('@')[0] || 'Thành Viên Mealy';
    const ok = loginUser({
      name: displayName,
      email: email.trim(),
      password: password.trim() || undefined
    }, authModalMode === 'register');

    if (ok !== false) {
      resetModalState();
      setName('');
      setEmail('');
      setPassword('');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1A1918] rounded-3xl p-5 sm:p-6 shadow-2xl border border-[#E8E2D8] dark:border-[#252220] space-y-4 relative max-h-[92dvh] overflow-y-auto"
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
              {subFlow === 'forgot-password'
                ? 'Đặt Lại Mật Khẩu'
                : subFlow === 'otp-verify'
                ? 'Nhập Mã Xác Thực OTP'
                : authModalMode === 'register'
                ? 'Đăng Ký Thành Viên'
                : 'Đăng Nhập Tài Khoản'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {subFlow === 'standard'
                ? 'Mở khóa toàn bộ tính năng độc quyền trên Mealy'
                : `Mã xác thực 6 số đã gửi tới ${maskedTarget || email}`}
            </p>
          </div>
        </div>

        {/* Features Unlocked Pill Banner */}
        {subFlow === 'standard' && (
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
                <span>Chia Sẻ Đi Chợ Chung</span>
              </div>
            </div>
          </div>
        )}

        {/* Mode switch tabs */}
        {subFlow === 'standard' && (
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
        )}

        {/* CLEAN MINIMALIST OTP VERIFICATION & FORGOT PASSWORD SUB-FLOW */}
        {subFlow !== 'standard' ? (
          <form onSubmit={handleVerifyOtpAndComplete} noValidate className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-black text-stone-900 dark:text-white truncate">
                    {maskedTarget || email}
                  </p>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    Vui lòng kiểm tra Hộp thư đến hoặc mục Thư rác
                  </p>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-xl bg-stone-200/70 dark:bg-stone-800 text-right shrink-0">
                <span className="font-mono text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatCountdown(ttlRemainingSec)}
                </span>
              </div>
            </div>

            {/* 6-Digit OTP Input Boxes */}
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 text-center">
                Nhập mã xác thực 6 chữ số
              </label>
              <div className="grid grid-cols-6 gap-2 max-w-[290px] mx-auto">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={e => handleOtpDigitChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    aria-label={`Chữ số OTP thứ ${idx + 1}`}
                    className="w-full h-11 text-center text-base font-black font-mono rounded-xl bg-white dark:bg-[#121110] border-2 border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white focus:outline-none focus:border-emerald-600 dark:focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20"
                  />
                ))}
              </div>
            </div>

            {subFlow === 'forgot-password' && (
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                  Mật khẩu mới cần đặt (tối thiểu 6 ký tự)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới của bạn"
                    className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-stone-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword.trim().length > 0 && (
                  <div className="mt-1.5 flex items-center justify-between text-[10.5px]">
                    <span className="text-stone-500 dark:text-stone-400">{passwordStrength.hint}</span>
                    <span className="font-black text-stone-800 dark:text-stone-200">{passwordStrength.label}</span>
                  </div>
                )}
              </div>
            )}

            {otpError && (
              <div
                role="alert"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{otpError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifyingOtp}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isVerifyingOtp
                  ? 'Đang xác thực...'
                  : subFlow === 'forgot-password'
                  ? 'Xác Nhận & Đặt Lại Mật Khẩu'
                  : 'Xác Nhận & Hoàn Tất'}
              </span>
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => setSubFlow('standard')}
                className="font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white cursor-pointer"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                disabled={cooldownSec > 0 || isSendingOtp}
                onClick={() =>
                  handleSendOtp(subFlow === 'forgot-password' ? 'reset-password' : authModalMode === 'register' ? 'register' : 'login')
                }
                className={`font-bold flex items-center gap-1 ${
                  cooldownSec > 0
                    ? 'text-stone-400 dark:text-stone-500 cursor-not-allowed'
                    : 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                }`}
              >
                <RotateCcw className="w-3 h-3" />
                <span>{cooldownSec > 0 ? `Gửi lại mã (${cooldownSec}s)` : 'Gửi lại mã mới'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD PASSWORD / QUICK OTP FORM */
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
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                    emailError ? 'text-rose-500' : 'text-stone-400'
                  }`}
                >
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300">
                  Mật khẩu
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => handleSendOtp('reset-password')}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    Quên mật khẩu?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn"
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

              {/* Password Strength Meter when typing */}
              {password.trim().length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`h-1 rounded-full transition-all ${
                          passwordStrength.score >= level
                            ? passwordStrength.colorClass
                            : 'bg-stone-200 dark:bg-stone-800'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-stone-500 dark:text-stone-400 truncate pr-2">
                      {passwordStrength.hint}
                    </span>
                    <span className="font-bold text-stone-700 dark:text-stone-300 shrink-0">
                      Độ mạnh: {passwordStrength.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Optional Security Toggle: Verify with 6-digit OTP */}
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220]">
              <label className="flex items-center gap-2 text-[11px] font-bold text-stone-700 dark:text-stone-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requireOtpOnRegister}
                  onChange={e => setRequireOtpOnRegister(e.target.checked)}
                  className="rounded border-stone-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Bảo mật 2 lớp bằng mã OTP 6 số</span>
              </label>
              <button
                type="button"
                onClick={() => handleSendOtp(authModalMode === 'register' ? 'register' : 'login')}
                className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer shrink-0"
              >
                Lấy mã OTP ngay
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white dark:bg-white dark:hover:bg-stone-100 dark:text-stone-950 font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              {authModalMode === 'register' ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Hoàn Tất Đăng Ký & Mở Khóa</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Đăng Nhập Ngay</span>
                </>
              )}
            </button>
          </form>
        )}

        <p className="text-[11px] text-center text-stone-500 dark:text-stone-400 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>Mealy cam kết mã hóa và bảo mật 100% dữ liệu cá nhân của bạn.</span>
        </p>
      </div>
    </div>
  );
};
