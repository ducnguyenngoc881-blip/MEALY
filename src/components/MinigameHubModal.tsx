import React, { useState } from 'react';
import { 
  X, 
  Gamepad2, 
  Package, 
  Beer, 
  Sparkles, 
  Lock, 
  ArrowRight, 
  Flame, 
  Dices,
  PartyPopper,
  Zap
} from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { playServoClick, playSpeedWhoosh } from '../utils/audioSynth';

interface MinigameHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TransitionTarget {
  id: 'apex' | 'drink';
  title: string;
  badge: string;
  color: string;
}

export const MinigameHubModal: React.FC<MinigameHubModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { openApexModal, openDrinkRoulette } = useMealWise();
  const [transitioningGame, setTransitioningGame] = useState<TransitionTarget | null>(null);

  if (!isOpen) return null;

  const handleSelectApex = () => {
    if (transitioningGame) return;
    playSpeedWhoosh();
    setTransitioningGame({
      id: 'apex',
      title: 'MỞ HÒM BỮA CƠM (APEX PACK)',
      badge: 'GACHA BỮA TRƯA',
      color: 'amber'
    });

    setTimeout(() => {
      setTransitioningGame(null);
      onClose();
      openApexModal();
    }, 650);
  };

  const handleSelectDrinkRoulette = () => {
    if (transitioningGame) return;
    playSpeedWhoosh();
    setTransitioningGame({
      id: 'drink',
      title: 'VÒNG QUAY BÀN NHẬU (DRINK ROULETTE)',
      badge: 'TIỆC TÙNG 2 VÒNG QUAY',
      color: 'rose'
    });

    setTimeout(() => {
      setTransitioningGame(null);
      onClose();
      openDrinkRoulette();
    }, 650);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER BAR */}
        <div className="px-5 py-4 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-emerald-500/10 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-md">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                Trung Tâm Minigame
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  Arcade
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chọn trò chơi để giải trí cùng bạn bè & đồng nghiệp
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            title="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* GRID VIEW OF GAMES */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5">
          <div className="grid grid-cols-1 gap-3.5">

            {/* ==================================================== */}
            {/* GAME 1: MỞ HÒM BỮA CƠM (APEX LEGENDS CASE OPENING) */}
            {/* ==================================================== */}
            <div 
              onClick={handleSelectApex}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-amber-500/40 hover:border-amber-400 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              {/* Background ambient glow */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />

              <div className="relative flex items-start gap-3.5">
                {/* Visual Icon Badge */}
                <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-400/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Package className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center">
                    <Flame className="w-2.5 h-2.5 text-white fill-amber-200" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-400 text-slate-950 shadow-sm">
                        GACHA BỮA TRƯA
                      </span>
                      <span className="text-[10px] font-bold text-amber-400">
                        ⚡ 3 Cấp Độ Hiếm
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mt-1 group-hover:text-amber-300 transition-colors">
                    Mở Hòm Bữa Cơm (Apex Pack)
                  </h3>

                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    Khui hòm ngẫu nhiên chọn bữa trưa kịch tính với âm thanh giật nảy và 3 bậc: Cơm Bình Dân, Fast Food & Tiệc Đại Gia.
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-black text-amber-400 group-hover:text-amber-300">
                    <span>MỞ HÒM NGAY</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* GAME 2: VÒNG QUAY BÀN NHẬU (DRINKING ROULETTE) */}
            {/* ==================================================== */}
            <div 
              onClick={handleSelectDrinkRoulette}
              className="group relative cursor-pointer overflow-hidden rounded-2xl border-2 border-rose-500/40 hover:border-rose-400 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-rose-500/10 hover:-translate-y-0.5 active:scale-[0.99]"
            >
              {/* Background ambient glow */}
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all pointer-events-none" />

              <div className="relative flex items-start gap-3.5">
                {/* Visual Icon Badge */}
                <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500/30 to-amber-600/10 border border-rose-400/50 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                  <Beer className="w-7 h-7 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center">
                    <Sparkles className="w-2.5 h-2.5 text-slate-950 fill-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-500 text-white shadow-sm">
                        MỚI • TIỆC TÙNG
                      </span>
                      <span className="text-[10px] font-bold text-rose-400">
                        🎯 2 Vòng Quay
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-white mt-1 group-hover:text-rose-300 transition-colors">
                    Vòng Quay Bàn Nhậu (Drinking Roulette)
                  </h3>

                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-2 leading-relaxed">
                    Nhập danh sách người chơi & số shot, quay Vòng 1 chọn nạn nhân và Vòng 2 quyết định số shot cạn ly kèm hiệu ứng ăn mừng!
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-black text-rose-400 group-hover:text-rose-300">
                    <span>VÀO BÀN NHẬU NGAY</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </div>

            {/* ==================================================== */}
            {/* GAME 3: THỬ THÁCH BÀN TIỆC (COMING SOON) */}
            {/* ==================================================== */}
            <div 
              className="relative overflow-hidden rounded-2xl border border-slate-300/80 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/60 p-4 opacity-75 select-none"
            >
              <div className="relative flex items-start gap-3.5">
                {/* Visual Icon Badge */}
                <div className="relative shrink-0 w-14 h-14 rounded-2xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center">
                  <Dices className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-300 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      SẮP RA MẮT
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      Coming Soon
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5">
                    Thật Hay Thách Bàn Tiệc (King's Cup)
                  </h3>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                    Bộ thẻ bài thử thách và câu hỏi 'thật hay thách' cực bựa dành cho hội bạn thân. Đang được hoàn thiện cho bản cập nhật kế tiếp!
                  </p>

                  <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500">
                    <Lock className="w-3 h-3" />
                    <span>ĐANG PHÁT TRIỂN</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FOOTER NOTE */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400">
            Chơi vui có chừng mực • Đã uống rượu bia thì không lái xe 🛵
          </p>
        </div>

        {/* ARCADE GAME LAUNCH TRANSITION OVERLAY */}
        {transitioningGame && (
          <div className="absolute inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
            {/* Pulsing Energy Rings */}
            <div className="relative mb-6">
              <div 
                className={`absolute -inset-6 rounded-full bg-gradient-to-r ${
                  transitioningGame.color === 'amber' 
                    ? 'from-amber-400 to-orange-600' 
                    : 'from-rose-500 to-purple-600'
                } opacity-60 blur-xl animate-pulse`} 
              />
              <div className="relative w-24 h-24 rounded-3xl bg-slate-900 border-2 border-white/20 shadow-2xl flex items-center justify-center animate-bounce">
                {transitioningGame.id === 'apex' ? (
                  <Package className="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.9)] animate-pulse" />
                ) : (
                  <Beer className="w-12 h-12 text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.9)] animate-pulse" />
                )}
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-white" />
                </div>
              </div>
            </div>

            <span className="text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/10 text-slate-300 border border-white/15 mb-2">
              {transitioningGame.badge}
            </span>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide mb-1">
              {transitioningGame.title}
            </h2>

            <p className="text-xs text-slate-400 font-medium mb-6 animate-pulse">
              Đang kết nối phòng trò chơi... Sẵn sàng! ⚡
            </p>

            {/* Glowing Cyber Progress Bar */}
            <div className="w-48 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/10">
              <div 
                className={`h-full bg-gradient-to-r ${
                  transitioningGame.color === 'amber' 
                    ? 'from-amber-400 to-orange-500' 
                    : 'from-rose-500 to-purple-500'
                } w-full rounded-full animate-pulse`} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
