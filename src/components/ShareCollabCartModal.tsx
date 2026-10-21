import React, { useState } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { X, Copy, Check, Users, Share2, Sparkles, MessageCircle, ExternalLink, QrCode, Palette } from 'lucide-react';
import { encodeRoomDataForUrl, SHOPPER_PALETTE, formatTtlRemaining } from '../services/collabGroceryService';

export const ShareCollabCartModal: React.FC = () => {
  const { 
    isShareModalOpen, 
    setIsShareModalOpen, 
    collabRoom, 
    collabUser,
    collabUserName, 
    setCollabUserName,
    updateCollabUserProfile,
    showToast 
  } = useMealWise();

  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedZalo, setCopiedZalo] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(true);

  if (!isShareModalOpen || !collabRoom) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
  
  // Clean, short, beautiful share URL without massive payload wall of text
  const shareUrl = `${origin}${pathname}?collab_cart=${encodeURIComponent(collabRoom.roomId)}`;
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(shareUrl)}`;

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const input = document.createElement('textarea');
        input.value = shareUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedLink(true);
      showToast('✓ Đã sao chép liên kết mua chung!');
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      showToast('Không thể sao chép tự động, vui lòng chọn và chép thủ công.');
    }
  };

  const handleCopyZaloInvite = async () => {
    const totalItems = collabRoom.items.length;
    const text = `🛒 ĐI CHỢ CÙNG NHAU (MEALWISE REAL-TIME)\n` +
      `👋 ${collabUserName} mời bạn cùng chia nhau đi chợ cho thực đơn tuần này (${totalItems} món).\n\n` +
      `👉 Bấm vào link dưới đây để mở danh sách & cùng tích chọn khi nhặt đồ nhé:\n${shareUrl}\n\n` +
      `✨ Mọi người cùng tick chọn thì cả 2 bên đều thấy cập nhật trực tiếp ngay lập tức!`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      } else {
        const input = document.createElement('textarea');
        input.value = text;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopiedZalo(true);
      showToast('✓ Đã chép lời mời gửi Zalo/Tin nhắn!');
      setTimeout(() => setCopiedZalo(false), 2500);
    } catch {
      showToast('Không thể sao chép tự động.');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Mealy - Đi Chợ Cùng Nhau (${collabRoom.roomId})`,
          text: `Cùng đi chợ và tick chọn nguyên liệu theo thời gian thực nhé!`,
          url: shareUrl
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[85] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in"
      onClick={() => setIsShareModalOpen(false)}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-md sm:max-w-lg md:max-w-xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto animate-scale-up text-slate-900 dark:text-white"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  Chia Sẻ Giỏ Đi Chợ Mua Chung
                </h3>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Đồng bộ trực tiếp Real-Time</span>
                <span>• Mã: <strong className="font-mono text-slate-800 dark:text-slate-200">{collabRoom.roomId}</strong></span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* TTL Security & Auto-Expire Notice */}
        <div className="flex items-center justify-between px-3.5 py-2.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2">
            <span className="text-sm">⏳</span>
            <div>
              <p className="font-extrabold text-[11.5px] leading-tight">Thời hạn phòng: Tối đa 1 giờ</p>
              <p className="text-[10px] text-amber-700 dark:text-amber-400">Tự động hủy để bảo mật và xóa dữ liệu thừa</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-xl bg-amber-200/70 dark:bg-amber-800/60 text-amber-900 dark:text-amber-100 font-black text-xs font-mono">
            {formatTtlRemaining(collabRoom.expiresAt, collabRoom.createdAt)}
          </span>
        </div>

        {/* User Nickname & Color customizer */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
            Tên hiển thị & Màu đại diện khi bạn nhặt đồ:
          </label>
          <div className="flex items-center gap-2">
            <input 
              type="text"
              value={collabUserName}
              onChange={e => setCollabUserName(e.target.value)}
              placeholder="VD: Chủ phòng, Bố, Mẹ, Vợ..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
            <span className="text-[10px] text-slate-400 shrink-0 font-medium">Hiện trên món</span>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { label: '👨 Bố', name: 'Bố' },
              { label: '👩 Mẹ', name: 'Mẹ' },
              { label: '🌸 Vợ', name: 'Vợ' },
              { label: '💼 Chồng', name: 'Chồng' },
              { label: '🛒 Bạn đi chợ', name: 'Bạn đi chợ' },
              { label: '👑 Chủ phòng', name: 'Chủ phòng' }
            ].map(chip => (
              <button
                key={chip.name}
                type="button"
                onClick={() => setCollabUserName(chip.name)}
                className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[10px] font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Shopper color dots */}
          <div className="flex items-center gap-2 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
            <span className="text-[10px] font-bold text-slate-500 shrink-0">Màu đánh dấu:</span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {SHOPPER_PALETTE.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => updateCollabUserProfile(collabUserName, p.hex)}
                  className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                    (collabUser?.color || '#10b981').toLowerCase() === p.hex.toLowerCase() 
                      ? 'ring-2 ring-offset-1 ring-slate-900 dark:ring-white scale-110' 
                      : 'hover:scale-110 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.hex }}
                  title={p.label}
                >
                  {(collabUser?.color || '#10b981').toLowerCase() === p.hex.toLowerCase() && (
                    <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Action 1: Copy Link */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <span>🔗</span> Link Mua Chung Trực Tiếp
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
              {collabRoom.items.length} món đi chợ
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="text"
              readOnly
              value={shareUrl}
              onClick={e => (e.target as HTMLInputElement).select()}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-slate-600 dark:text-slate-300 select-all truncate"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all active:scale-95 ${
                copiedLink 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Đã chép' : 'Chép link'}</span>
            </button>
          </div>
        </div>

        {/* Share buttons row */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={handleCopyZaloInvite}
            className={`p-2.5 rounded-2xl border text-xs font-black flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer ${
              copiedZalo 
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-500/10 hover:bg-blue-500/20 border-blue-500/30 text-blue-700 dark:text-blue-300'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span>{copiedZalo ? '✓ Đã chép tin Zalo' : 'Gửi Qua Zalo'}</span>
          </button>

          <button
            type="button"
            onClick={handleNativeShare}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Chia Sẻ App Khác</span>
          </button>
        </div>

        {/* QR Code Section */}
        <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800/40 border border-emerald-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Quét Mã Mở Nhanh Trên Điện Thoại
            </span>
            <button 
              type="button"
              onClick={() => setShowQr(!showQr)}
              className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {showQr ? 'Thu gọn' : 'Xem mã QR'}
            </button>
          </div>

          {showQr && (
            <div className="flex flex-col items-center justify-center py-2 space-y-2">
              <div className="p-2 bg-white rounded-2xl shadow-md border border-slate-200">
                <img 
                  src={qrApiUrl} 
                  alt={`Mã QR phòng mua chung ${collabRoom.roomId}`}
                  className="w-36 h-36 rounded-lg block"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback visual if offline
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <p className="text-[10px] text-center text-slate-500 dark:text-slate-400 max-w-xs">
                Mở camera trên điện thoại người đi chợ cùng và quét mã này để mở ngay danh sách.
              </p>
            </div>
          )}
        </div>

        {/* How it works banner */}
        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Cách thức hoạt động:</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-[10.5px] leading-relaxed text-slate-500 dark:text-slate-400">
            <li>Người A và Người B cùng mở danh sách trên 2 máy hoặc 2 tab.</li>
            <li>Khi Người B tick chọn món tại chợ/siêu thị, Người A sẽ thấy món đó được đánh dấu xanh ngay lập tức.</li>
            <li>Hiển thị nhãn <strong>&quot;✓ Đã nhặt bởi [Tên]&quot;</strong> để tránh bị mua trùng lặp nguyên liệu!</li>
          </ul>
        </div>

        {/* Footer actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={() => setIsShareModalOpen(false)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white dark:text-slate-950 font-black text-xs transition-all active:scale-95 cursor-pointer shadow-md"
          >
            Đã Xong (Tiếp Tục Đi Chợ)
          </button>
        </div>

      </div>
    </div>
  );
};
