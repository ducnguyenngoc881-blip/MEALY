import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  X, 
  CheckCircle2, 
  Sparkles, 
  ShieldAlert, 
  Zap, 
  Tv, 
  Award,
  Lock
} from 'lucide-react';

interface VolunteerAdSequenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

interface AdContent {
  id: number;
  brand: string;
  tagline: string;
  badge: string;
  gradient: string;
  accentColor: string;
  description: string;
}

const ADS_LIST: AdContent[] = [
  {
    id: 1,
    brand: 'WinMart • Đi Chợ Tươi Sạch',
    tagline: 'Ưu Đãi Rau Củ & Thịt Sạch VietGAP',
    badge: 'Quảng cáo 1/3 • 30s',
    gradient: 'from-rose-600 via-amber-600 to-orange-700',
    accentColor: 'text-amber-300',
    description: 'Nông sản chuẩn VietGAP giao tận nhà trong 2 giờ. Tươi ngon chuẩn vị mâm cơm Việt.'
  },
  {
    id: 2,
    brand: 'DalatMilk • Sữa Tươi Thanh Trùng',
    tagline: 'Hương Vị Tự Nhiên Từ Cao Nguyên',
    badge: 'Quảng cáo 2/3 • 30s',
    gradient: 'from-sky-600 via-teal-600 to-emerald-700',
    accentColor: 'text-sky-300',
    description: 'Nguồn dinh dưỡng dồi dào nguyên chất cho bữa sáng và năng lượng dẻo dai cả ngày.'
  },
  {
    id: 3,
    brand: 'Chin-Su • Đậm Đà Vị Cơm Nhà',
    tagline: 'Gia Vị Chuẩn Vị Gia Đình Việt Nam',
    badge: 'Quảng cáo 3/3 • 30s',
    gradient: 'from-amber-600 via-rose-700 to-red-800',
    accentColor: 'text-yellow-300',
    description: 'Nước mắm cá cơm hảo hạng kết hợp nước tương lên men tự nhiên, tròn vị 3 miền.'
  }
];

const VIDEO_DURATION = 30; // 30 seconds per non-skippable ad

export const VolunteerAdSequenceModal: React.FC<VolunteerAdSequenceModalProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0); // 0, 1, 2
  const [secondsRemaining, setSecondsRemaining] = useState(VIDEO_DURATION);
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x or 5x for easy dev/user testing
  const [isCompletedAll, setIsCompletedAll] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setCurrentVideoIndex(0);
      setSecondsRemaining(VIDEO_DURATION);
      setIsCompletedAll(false);
      setShowExitConfirm(false);
      setSpeedMultiplier(1);
    }
  }, [isOpen]);

  // Main countdown timer loop
  useEffect(() => {
    if (!isOpen || isCompletedAll || showExitConfirm) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const intervalMs = Math.round(1000 / speedMultiplier);

    timerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          // Reached end of current 30s video
          if (currentVideoIndex < 2) {
            // Auto advance to next video
            setCurrentVideoIndex(c => c + 1);
            return VIDEO_DURATION;
          } else {
            // Finished all 3 videos!
            setIsCompletedAll(true);
            return 0;
          }
        }
        return prev - 1;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentVideoIndex, speedMultiplier, isCompletedAll, showExitConfirm]);

  if (!isOpen) return null;

  const currentAd = ADS_LIST[currentVideoIndex];
  const progressPercent = Math.min(100, Math.max(0, ((VIDEO_DURATION - secondsRemaining) / VIDEO_DURATION) * 100));

  const handleRequestClose = () => {
    if (isCompletedAll) {
      onComplete();
      onClose();
    } else {
      setShowExitConfirm(true);
    }
  };

  const handleConfirmExit = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const toggleSpeed = () => {
    setSpeedMultiplier(prev => (prev === 1 ? 5 : 1));
  };

  return (
    <div 
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ad-sequence-title"
    >
      <div 
        className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden flex flex-col relative text-white animate-scale-up"
        onClick={e => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Tv className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white tracking-wide uppercase">
                  Quảng Cáo Tự Nguyện
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500/20 text-amber-300 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> 30s/video
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                {isCompletedAll 
                  ? '🎉 Đã hoàn thành cam kết 3/3 video' 
                  : `Video ${currentVideoIndex + 1}/3 • Không thể bỏ qua`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Speed toggle for testing */}
            {!isCompletedAll && (
              <button
                type="button"
                onClick={toggleSpeed}
                className={`px-2 py-1 rounded-lg text-[10px] font-black tracking-wider transition-all flex items-center gap-1 border ${
                  speedMultiplier > 1
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title="Tua nhanh để kiểm tra tiến trình chuỗi 3 video"
              >
                <Zap className="w-3 h-3" />
                <span>{speedMultiplier}x Tua</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRequestClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Đóng / Hủy"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3-Video Sequence Progress Bar */}
        <div className="px-4 sm:px-5 pt-3 pb-1 bg-slate-950/40">
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((idx) => {
              const isPast = idx < currentVideoIndex;
              const isCurrent = idx === currentVideoIndex && !isCompletedAll;
              const isCurrentDone = isCompletedAll || isPast;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className={isCurrent ? 'text-amber-400 font-extrabold' : isPast ? 'text-emerald-400' : 'text-slate-500'}>
                      Video {idx + 1}/3
                    </span>
                    {isCurrentDone ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ) : isCurrent ? (
                      <span className="text-amber-400 font-mono text-[10px]">{secondsRemaining}s</span>
                    ) : (
                      <span className="text-slate-600">30s</span>
                    )}
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 rounded-full ${
                        isPast || isCompletedAll
                          ? 'w-full bg-emerald-500'
                          : isCurrent
                            ? 'bg-amber-400'
                            : 'w-0 bg-slate-700'
                      }`}
                      style={{
                        width: isPast || isCompletedAll ? '100%' : isCurrent ? `${progressPercent}%` : '0%'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Video Screen Body */}
        {!isCompletedAll ? (
          <div className="p-4 sm:p-5 space-y-3.5">
            {/* Simulated High-Def Ad Player Screen: Flexible height across device ratios */}
            <div className={`relative w-full min-h-[220px] sm:min-h-[240px] rounded-2xl bg-gradient-to-br ${currentAd.gradient} p-4 sm:p-5 flex flex-col justify-between shadow-inner overflow-hidden border border-white/10 group`}>
              {/* Background ambient lighting pulse */}
              <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" />

              {/* Floating Header Badges */}
              <div className="relative z-10 flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-full bg-black/60 text-white text-[10px] font-extrabold tracking-wider uppercase border border-white/20 backdrop-blur-md flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  Đang phát: {currentVideoIndex + 1}/3
                </span>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors border border-white/20"
                    title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>

                  <div className="px-3 py-1 rounded-full bg-slate-950/80 text-amber-300 font-mono font-black text-xs border border-amber-500/30 flex items-center gap-1 shadow-lg whitespace-nowrap">
                    <span>⏱️ {secondsRemaining}s</span>
                  </div>
                </div>
              </div>

              {/* Center Ad Graphics & Brand Message */}
              <div className="relative z-10 my-auto text-center space-y-1.5 py-3">
                <div className="inline-block p-2.5 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xl mb-0.5">
                  <Sparkles className={`w-6 h-6 sm:w-7 sm:h-7 ${currentAd.accentColor} animate-bounce`} />
                </div>
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight drop-shadow-md">
                  {currentAd.brand}
                </h3>
                <p className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow">
                  {currentAd.tagline}
                </p>
                <p className="text-[11px] sm:text-xs text-white/80 max-w-sm mx-auto line-clamp-2 leading-relaxed font-normal pt-0.5">
                  {currentAd.description}
                </p>
              </div>

              {/* Bottom Video Player Control Bar */}
              <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/15 text-[10px] text-white/80 gap-2">
                <span className="font-bold flex items-center gap-1 text-slate-200 whitespace-nowrap">
                  <Lock className="w-3 h-3 text-amber-400" />
                  Video không thể bỏ qua (30s)
                </span>
                <span className="italic font-medium text-right truncate">
                  {currentVideoIndex < 2 
                    ? `Tự chuyển sang video ${currentVideoIndex + 2} sau 0s` 
                    : 'Video cuối cùng'}
                </span>
              </div>
            </div>

            {/* Commitment reminder banner */}
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed">
                <span className="font-bold text-slate-200">Cam kết xem trọn vẹn chuỗi 3 video:</span>
                <p className="text-[11px] text-slate-400">
                  Hệ thống tự động phát lần lượt 3 video (30s mỗi video, tổng 90s). Xin vui lòng không đóng ứng dụng để nhận được xác nhận hoàn tất.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Completion & Reward Screen */
          <div className="p-6 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
              <Award className="w-9 h-9" />
            </div>

            <div className="space-y-1.5">
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black uppercase tracking-wider">
                ✨ Hoàn Tất Cam Kết 3/3 Video
              </span>
              <h3 className="text-lg font-black text-white">
                Cảm Ơn Sự Cam Kết Của Bạn!
              </h3>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Bạn đã hoàn thành trọn vẹn chuỗi 3 video quảng cáo tự nguyện (90 giây). Sự đóng góp của bạn giúp MealWise tiếp tục duy trì máy chủ và phát triển các tính năng hữu ích!
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Đã kích hoạt +8 GIỜ sử dụng MealWise hoàn toàn không quảng cáo!</span>
            </div>

            <button
              type="button"
              onClick={() => {
                onComplete();
                onClose();
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all active:scale-95 cursor-pointer"
            >
              Hoàn Tất & Đóng
            </button>
          </div>
        )}

        {/* Exit Confirmation Alert Modal Overlay */}
        {showExitConfirm && (
          <div className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-sm p-6 flex flex-col justify-center items-center text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-white">
                Hủy Bỏ Chuỗi Video?
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed max-w-xs">
                Bạn đang xem ở Video {currentVideoIndex + 1}/3. Nếu dừng lại ngay bây giờ, bạn sẽ bị mất toàn bộ tiến trình cam kết và chưa nhận được quyền lợi.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full max-w-xs pt-2">
              <button
                type="button"
                onClick={() => setShowExitConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
              >
                Tiếp Tục Xem
              </button>
              <button
                type="button"
                onClick={handleConfirmExit}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Vẫn Dừng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
