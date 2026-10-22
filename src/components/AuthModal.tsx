import React, { useState, useEffect } from 'react';
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
import {
  evaluatePasswordStrength,
  validateEmailOrPhone,
  recordLoginAttempt,
  recordSecurityAuditEvent
} from '../services/otpSecurityService';
import {
  getRegisteredUserByEmail,
  registerUserInDatabase,
  verifyUserPassword,
  loadUserPartition,
  saveUserPartition
} from '../services/userDatabase';

type AuthSubFlow = 'standard' | 'forgot-password';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    loginUser,
    showToast,
    isRegistered,
    user
  } = useMealWise();

  // React Rules of Hooks Invariant: All hooks MUST be unconditionally at the top before any early return
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [subFlow, setSubFlow] = useState<AuthSubFlow>('standard');
  const [isSubmittingReset, setIsSubmittingReset] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    setEmailError(null);
    setResetError(null);
    if (isRegistered && user?.email) {
      setEmail(user.email);
      setNewPassword('');
      setConfirmPassword('');
      setSubFlow('forgot-password');
    } else {
      setSubFlow('standard');
    }
  }, [isAuthModalOpen, isRegistered, user?.email]);

  if (!isAuthModalOpen) return null;

  const passwordStrength = evaluatePasswordStrength(subFlow === 'forgot-password' ? newPassword : password);

  const resetModalState = () => {
    setEmailError(null);
    setResetError(null);
    setSubFlow('standard');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleClose = () => {
    resetModalState();
    closeAuthModal();
  };

  const handleModeChange = (mode: 'login' | 'register') => {
    resetModalState();
    setAuthModalMode(mode);
  };

  const handleOpenForgotPassword = () => {
    setEmailError(null);
    setResetError(null);
    setNewPassword('');
    setConfirmPassword('');
    setSubFlow('forgot-password');
  };

  const handleDirectPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      const msg = 'Vui lòng nhập Email hoặc Số điện thoại cần đặt lại mật khẩu';
      setResetError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    const validation = validateEmailOrPhone(cleanEmail);
    if (!validation.valid) {
      const msg = validation.error || 'Định dạng Email hoặc Số điện thoại chưa hợp lệ';
      setResetError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    const cleanNewPass = newPassword.trim();
    if (cleanNewPass.length < 6) {
      const msg = 'Mật khẩu mới phải có ít nhất 6 ký tự';
      setResetError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    const cleanConfirm = confirmPassword.trim();
    if (cleanNewPass !== cleanConfirm) {
      const msg = 'Mật khẩu nhập lại không khớp. Vui lòng kiểm tra lại.';
      setResetError(msg);
      showToast(`⚠️ ${msg}`, 'warning');
      return;
    }

    setResetError(null);
    setIsSubmittingReset(true);

    try {
      const normId = validation.normalized;
      const existingLocal = getRegisteredUserByEmail(normId);
      let serverUserName: string | undefined;
      let serverProfile: any = null;

      try {
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: normId,
            email: normId,
            newPassword: cleanNewPass,
            name: existingLocal?.name || user?.name || name.trim() || '',
            clientSync: true
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.user?.name) {
            serverUserName = data.user.name;
          }
          if (data?.profile) {
            serverProfile = data.profile;
          }
        }
      } catch {}

      const resolvedName =
        existingLocal?.name ||
        serverUserName ||
        (isRegistered && user?.name ? user.name : '') ||
        name.trim() ||
        normId.split('@')[0] ||
        'Thành Viên Mealy';

      const { user: updatedDbUser } = registerUserInDatabase(
        {
          name: resolvedName,
          email: normId,
          password: cleanNewPass
        },
        {
          onboardingCompleted: existingLocal?.onboardingCompleted ?? true
        }
      );

      if (serverProfile && updatedDbUser.id && !loadUserPartition(updatedDbUser.id)) {
        saveUserPartition(updatedDbUser.id, serverProfile);
      }

      recordLoginAttempt(normId, true);
      recordSecurityAuditEvent({
        type: 'OTP_PASSWORD_RESET',
        email: normId,
        title: isRegistered ? 'Đổi mật khẩu tài khoản thành công' : 'Đặt lại mật khẩu mới thành công',
        detail: `Đã cập nhật mật khẩu mới cho tài khoản ${normId}.`,
        severity: 'success'
      });

      const ok = loginUser(
        {
          name: resolvedName,
          email: normId,
          password: cleanNewPass,
          otpVerified: true
        },
        false
      );

      if (ok !== false) {
        showToast('🔐 Đã cập nhật mật khẩu mới thành công!');
        resetModalState();
        setName('');
        setEmail('');
        setPassword('');
      }
    } finally {
      setIsSubmittingReset(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const cleanPassword = password.trim();
    const normId = validation.normalized;
    const isAdminTarget =
      normId === 'admin' ||
      normId === 'admin@mealwise.vn' ||
      normId === 'admin@mealwise.com';

    if (authModalMode === 'login') {
      if (!cleanPassword) {
        setEmailError('Vui lòng nhập mật khẩu của bạn');
        showToast('⚠️ Vui lòng nhập mật khẩu để đăng nhập!', 'warning');
        return;
      }

      const localCheck = verifyUserPassword(normId, cleanPassword);
      if (!isAdminTarget && !localCheck.valid) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              identifier: normId,
              email: normId,
              password: cleanPassword
            })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.ok && data.user) {
              const { user: hydratedUser } = registerUserInDatabase(
                {
                  name: data.user.name || normId.split('@')[0] || 'Thành Viên Mealy',
                  email: normId,
                  password: cleanPassword
                },
                { onboardingCompleted: true }
              );
              if (data.profile && hydratedUser.id && !loadUserPartition(hydratedUser.id)) {
                saveUserPartition(hydratedUser.id, data.profile);
              }
            }
          }
        } catch {}
      }
    } else if (authModalMode === 'register') {
      if (!cleanPassword || cleanPassword.length < 6) {
        setEmailError('Mật khẩu đăng ký phải có ít nhất 6 ký tự');
        showToast('⚠️ Mật khẩu đăng ký phải có ít nhất 6 ký tự!', 'warning');
        return;
      }

      const existingLocal = getRegisteredUserByEmail(normId);
      if (existingLocal && existingLocal.passwordHash) {
        const checkExisting = verifyUserPassword(normId, cleanPassword);
        if (checkExisting.valid) {
          setEmailError(null);
          const ok = loginUser(
            {
              name: existingLocal.name,
              email: normId,
              password: cleanPassword
            },
            false
          );
          if (ok !== false) {
            resetModalState();
            setName('');
            setEmail('');
            setPassword('');
          }
          return;
        } else {
          setAuthModalMode('login');
          const msg = 'Tài khoản này đã được đăng ký. Vui lòng nhập đúng mật khẩu hoặc bấm Quên mật khẩu.';
          setEmailError(msg);
          showToast('ℹ️ Tài khoản đã tồn tại! Đã chuyển sang mục Đăng Nhập.', 'warning');
          return;
        }
      }
    }

    setEmailError(null);
    const displayName = name.trim() || normId.split('@')[0] || 'Thành Viên Mealy';
    const ok = loginUser(
      {
        name: displayName,
        email: cleanEmail,
        password: cleanPassword || undefined
      },
      authModalMode === 'register'
    );

    if (ok !== false) {
      resetModalState();
      setName('');
      setEmail('');
      setPassword('');
    } else if (authModalMode === 'login') {
      const existingAfter = getRegisteredUserByEmail(normId);
      if (!existingAfter) {
        setEmailError('Tài khoản chưa được đăng ký. Vui lòng chọn mục Đăng Ký để tạo tài khoản mới.');
      } else {
        setEmailError('Mật khẩu không chính xác. Vui lòng kiểm tra lại hoặc bấm Quên mật khẩu.');
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-[#1A1918] rounded-3xl p-4 sm:p-6 shadow-2xl border border-[#E8E2D8] dark:border-[#252220] space-y-3 sm:space-y-4 relative max-h-[92dvh] overflow-y-auto"
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
                ? isRegistered
                  ? 'Đổi Mật Khẩu Tài Khoản'
                  : 'Đặt Lại Mật Khẩu'
                : authModalMode === 'register'
                ? 'Đăng Ký Thành Viên'
                : 'Đăng Nhập Tài Khoản'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {subFlow === 'forgot-password'
                ? 'Thiết lập mật khẩu mới nhanh chóng cho Email hoặc Số điện thoại'
                : authModalMode === 'register'
                ? 'Mở khóa toàn bộ tính năng độc quyền trên Mealy'
                : 'Đăng nhập bằng Email hoặc Số điện thoại của bạn'}
            </p>
          </div>
        </div>

        {/* Features Unlocked Pill Banner - Show only on Register tab to declutter Login */}
        {subFlow === 'standard' && authModalMode === 'register' && (
          <div className="p-2.5 rounded-2xl bg-[#FAF8F5] dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-xs text-stone-700 dark:text-stone-300 space-y-1">
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

        {/* DIRECT PASSWORD RESET / CHANGE PASSWORD SUB-FLOW */}
        {subFlow === 'forgot-password' ? (
          <form onSubmit={handleDirectPasswordReset} noValidate className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Email hoặc Số điện thoại <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (resetError) setResetError(null);
                  }}
                  placeholder="email@example.com hoặc 0912..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Mật khẩu mới (tối thiểu 6 ký tự) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (resetError) setResetError(null);
                  }}
                  placeholder="Nhập mật khẩu mới của bạn"
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
              {newPassword.trim().length > 0 && (
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

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 mb-1.5">
                Nhập lại mật khẩu mới <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (resetError) setResetError(null);
                  }}
                  placeholder="Nhập lại mật khẩu mới để xác nhận"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-[#121110] border border-[#E8E2D8] dark:border-[#252220] text-stone-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20"
                />
              </div>
            </div>

            {resetError && (
              <div
                role="alert"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 text-[11px] font-bold"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{resetError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmittingReset}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {isSubmittingReset
                  ? 'Đang cập nhật...'
                  : isRegistered
                  ? 'Cập Nhật Mật Khẩu Mới'
                  : 'Lưu Mật Khẩu Mới & Đăng Nhập'}
              </span>
            </button>

            <div className="flex items-center justify-between pt-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  if (isRegistered) {
                    handleClose();
                  } else {
                    setResetError(null);
                    setSubFlow('standard');
                  }
                }}
                className="font-bold text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-white cursor-pointer"
              >
                {isRegistered ? '← Đóng cửa sổ' : '← Quay lại đăng nhập'}
              </button>
            </div>
          </form>
        ) : (
          /* STANDARD PASSWORD FORM */
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
                  Mật khẩu <span className="text-rose-500">*</span>
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={handleOpenForgotPassword}
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
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
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

              {/* Password Strength Meter when typing on Register */}
              {authModalMode === 'register' && password.trim().length > 0 && (
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
