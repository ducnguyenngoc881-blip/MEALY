import React, { useState } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  X, 
  Smartphone, 
  Download, 
  Sparkles, 
  Refrigerator, 
  Calendar, 
  UtensilsCrossed, 
  Gamepad2, 
  Share2, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Apple
} from 'lucide-react';
import { MealyLogoMark } from './icons/MealWiseLogo';

export const DownloadAppModal: React.FC = () => {
  const { 
    isDownloadAppModalOpen, 
    closeDownloadAppModal, 
    downloadAppFeatureName 
  } = useMealWise();

  const [activePlatformTab, setActivePlatformTab] = useState<'android' | 'ios'>('android');
  const [downloadStarted, setDownloadStarted] = useState(false);

  if (!isDownloadAppModalOpen) return null;

  const handleDownloadApk = () => {
    setDownloadStarted(true);
    // Programmatically trigger download of MealWise.apk
    const link = document.createElement('a');
    link.href = '/MealWise.apk';
    link.download = 'Mealy.apk';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setDownloadStarted(false), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-[95] flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
      onClick={closeDownloadAppModal}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-scale-up text-stone-900 dark:text-stone-100"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0F172A] border border-slate-800 flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
              <MealyLogoMark className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-base font-black text-stone-900 dark:text-white leading-tight">
                  Tải Ứng Dụng Mealy
                </h3>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                  Mobile App
                </span>
              </div>
              <p className="text-[11.5px] text-stone-500 dark:text-stone-400 mt-0.5">
                Trải nghiệm trọn vẹn dành riêng cho điện thoại
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeDownloadAppModal}
            className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Lock Notice */}
        <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-black text-[12px]">
            <span>🔒</span>
            <span>Tính năng giới hạn trên bản Web Khách</span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Bạn đang xem ở <strong>Chế độ Khách xem Đi Chợ</strong>. Tính năng{' '}
            <strong className="underline decoration-amber-500 underline-offset-2">
              {downloadAppFeatureName || 'Lên Thực Đơn & Tủ Lạnh Thông Minh'}
            </strong>{' '}
            được thiết kế và tối ưu độc quyền trên Ứng dụng điện thoại Mealy.
          </p>
        </div>

        {/* What You Get in the Mobile App */}
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400">
            Có gì trong ứng dụng Mealy?
          </p>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <UtensilsCrossed className="w-4 h-4 shrink-0" />
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">Mâm Cơm 3 Món</span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                Hơn 1.900+ công thức chuẩn vị mẹ nấu, không bao giờ trùng lặp món.
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">Thực Đơn 7 Ngày</span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                1-Click Knapsack tự động khớp ngân sách gia đình, 0 ngày bội chi.
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                <Refrigerator className="w-4 h-4 shrink-0" />
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">Tủ Lạnh Vét Món</span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                Gợi ý món ăn từ thực phẩm thừa, tiết kiệm hàng triệu đồng mỗi tháng.
              </p>
            </div>

            <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200/60 dark:border-stone-700/60 space-y-1">
              <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                <Gamepad2 className="w-4 h-4 shrink-0" />
                <span className="font-extrabold text-xs text-stone-900 dark:text-stone-100">Minigame Bàn Tiệc</span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-snug">
                Vòng quay ăn gì, uống bia roulette và case opening giải trí vui nhộn.
              </p>
            </div>
          </div>
        </div>

        {/* Platform Selection Tabs */}
        <div className="space-y-3 pt-1">
          <div className="flex rounded-2xl bg-stone-100 dark:bg-stone-800 p-1">
            <button
              type="button"
              onClick={() => setActivePlatformTab('android')}
              className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatformTab === 'android'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Android (APK)</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePlatformTab('ios')}
              className={`flex-1 py-1.5 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activePlatformTab === 'ios'
                  ? 'bg-white dark:bg-stone-900 text-stone-950 dark:text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Apple className="w-3.5 h-3.5 text-stone-900 dark:text-stone-100" />
              <span>iPhone / iPad (iOS)</span>
            </button>
          </div>

          {/* Android Panel */}
          {activePlatformTab === 'android' && (
            <div className="space-y-2.5 animate-fade-in">
              <button
                type="button"
                onClick={handleDownloadApk}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{downloadStarted ? '✓ Đang tải file cài đặt...' : 'Tải File Cài Đặt Android (Mealy.apk)'}</span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[10.5px] text-stone-500 dark:text-stone-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Miễn phí tải về • Hỗ trợ bởi đối tác tài trợ
                </span>
                <span>•</span>
                <span>Dung lượng: ~13 MB</span>
              </div>
            </div>
          )}

          {/* iOS Panel */}
          {activePlatformTab === 'ios' && (
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 space-y-2 text-xs animate-fade-in">
              <p className="font-extrabold text-[11.5px] text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Cài Đặt Nhanh Trên iPhone / Safari (Không Cần App Store):</span>
              </p>
              <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-stone-600 dark:text-stone-300 leading-relaxed">
                <li>Mở liên kết này trong trình duyệt <strong>Safari</strong> trên iPhone.</li>
                <li>Bấm vào biểu tượng <strong>Chia sẻ 📤</strong> ở thanh công cụ dưới cùng.</li>
                <li>Cuộn xuống và chọn <strong>&quot;Thêm vào Màn hình chính&quot; ➕</strong>.</li>
                <li>Biểu tượng <strong>Mealy</strong> sẽ xuất hiện trên màn hình iPhone và hoạt động mượt mà như một ứng dụng gốc!</li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center gap-2">
          <button
            type="button"
            onClick={closeDownloadAppModal}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Tiếp Tục Xem Giỏ Đi Chợ Web
          </button>
        </div>

      </div>
    </div>
  );
};
