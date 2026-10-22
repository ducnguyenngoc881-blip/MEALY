import React, { useState, useEffect } from 'react';
import { Sparkles, ExternalLink, CheckCircle2, Tag, ShoppingBag } from 'lucide-react';
import { useMealWise } from '../context/MealWiseContext';
import { isUserAdFree, recordAdImpression } from '../utils/adTrackingService';
import { SafeImage } from './SafeImage';

interface NativeCampaign {
  id: string;
  brandName: string;
  categoryBadge: string;
  headline: string;
  subtitle: string;
  voucherCode: string;
  discountLabel: string;
  ctaLabel: string;
  imageUrl: string;
  accentBg: string;
  accentText: string;
}

const VIETNAM_FMCG_CAMPAIGNS: NativeCampaign[] = [
  {
    id: 'fmcg-chinsu-2026',
    brandName: 'Chin-Su • Đậm Đà Vị Cơm Nhà',
    categoryBadge: 'Gia Vị Chuẩn Vị Việt',
    headline: 'Nước Mắm Cá Cơm Biển Đông Thượng Hạng',
    subtitle: 'Tròn vị cho mọi món kho, canh và nước chấm gia đình 3 miền.',
    voucherCode: 'MEALYCHINSU15',
    discountLabel: 'Giảm 15.000đ đơn từ 99k',
    ctaLabel: 'Nhận Ưu Đãi Đi Chợ',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    accentBg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/70 dark:border-rose-800/50',
    accentText: 'text-rose-700 dark:text-rose-300'
  },
  {
    id: 'fmcg-bhx-fresh-2026',
    brandName: 'Bách Hóa Xanh • Đi Chợ Tươi Sạch',
    categoryBadge: 'Giao Nhanh 2 Giờ',
    headline: 'Combo Rau Củ & Thịt Sạch Chuẩn VietGAP',
    subtitle: 'Đặt trọn bộ nguyên liệu mâm cơm tối nay, giao tận bếp trong 2 giờ.',
    voucherCode: 'MEALYBHX30',
    discountLabel: 'Miễn phí giao hàng + Giảm 30.000đ',
    ctaLabel: 'Áp Mã Đi Chợ Ngay',
    imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    accentBg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/50',
    accentText: 'text-emerald-700 dark:text-emerald-300'
  },
  {
    id: 'fmcg-barona-2026',
    brandName: 'Barona • Nấu Ngon Cực Dễ',
    categoryBadge: 'Bữa Tối 20 Phút',
    headline: 'Xốt Gia Vị Hoàn Chỉnh Sườn Xào Chua Ngọt & Thịt Kho',
    subtitle: 'Ướp chuẩn vị nhà hàng trong 1 bước, không cần nêm nếm phức tạp.',
    voucherCode: 'MEALYBARONA20',
    discountLabel: 'Mua 4 Tặng 1 trên gian hàng chính hãng',
    ctaLabel: 'Lưu Voucher Mua Sắm',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    accentBg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/50',
    accentText: 'text-amber-700 dark:text-amber-300'
  },
  {
    id: 'fmcg-dalatmilk-2026',
    brandName: 'DalatMilk • Dinh Dưỡng Cao Nguyên',
    categoryBadge: 'Thực Đơn Giàu Đạm',
    headline: 'Sữa Tươi Thanh Trùng & Sữa Chua Nguyên Chất',
    subtitle: 'Bổ sung đạm và canxi tự nhiên cho bữa sáng gia đình và người tập thể thao.',
    voucherCode: 'MEALYDALAT10',
    discountLabel: 'Tặng 20.000đ khi mua thùng 12 hộp',
    ctaLabel: 'Nhận Mã Ưu Đãi',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
    accentBg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/70 dark:border-blue-800/50',
    accentText: 'text-blue-700 dark:text-blue-300'
  }
];

interface NativeAdCardProps {
  slotIndex: number;
}

export const NativeAdCard: React.FC<NativeAdCardProps> = ({ slotIndex }) => {
  const { user, showToast } = useMealWise();
  const [claimedVoucher, setClaimedVoucher] = useState(false);

  const isAdmin =
    user?.role === 'admin' ||
    user?.email?.toLowerCase() === 'admin@mealwise.vn' ||
    user?.email?.toLowerCase() === 'admin@mealwise.com';
  const adFree = isUserAdFree();

  const campaign = VIETNAM_FMCG_CAMPAIGNS[slotIndex % VIETNAM_FMCG_CAMPAIGNS.length];

  useEffect(() => {
    if (isAdmin || adFree) return;
    recordAdImpression(
      'native_infeed',
      `Tài trợ tự nhiên: ${campaign.brandName}`,
      5,
      0,
      user?.name || 'Người dùng Mealy'
    );
  }, [campaign.brandName, isAdmin, adFree, user?.name]);

  if (isAdmin || adFree) return null;

  const handleClaimVoucher = () => {
    setClaimedVoucher(true);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(campaign.voucherCode);
      }
    } catch {}

    recordAdImpression(
      'sponsored_fmcg',
      `Nhận ưu đãi FMCG: ${campaign.brandName} (${campaign.voucherCode})`,
      10,
      0,
      user?.name || 'Người dùng Mealy'
    );

    showToast(
      `🎁 Đã lưu mã "${campaign.voucherCode}" (${campaign.discountLabel}) từ ${campaign.brandName}!`,
      'success'
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all">
      {/* Top Sponsored Bar */}
      <div className="px-4 py-2.5 bg-slate-50/90 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-400/30 text-[10px] font-black uppercase tracking-wider shrink-0">
            Tài trợ
          </span>
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 truncate">
            {campaign.brandName}
          </span>
        </div>
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          {campaign.categoryBadge}
        </span>
      </div>

      {/* Main Content */}
      <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
        <div className="relative w-full sm:w-28 h-32 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800">
          <SafeImage
            src={campaign.imageUrl}
            alt={campaign.headline}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-lg bg-slate-950/75 backdrop-blur-xs text-white text-[10px] font-extrabold flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 text-amber-400" />
            <span>{campaign.voucherCode}</span>
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-1.5">
          <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
            {campaign.headline}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
            {campaign.subtitle}
          </p>
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-extrabold ${campaign.accentBg} ${campaign.accentText}`}>
            <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
            <span>{campaign.discountLabel}</span>
          </div>
        </div>

        <div className="shrink-0 flex sm:flex-col justify-end">
          <button
            type="button"
            onClick={handleClaimVoucher}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-2xl font-black text-xs min-h-[44px] flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
              claimedVoucher
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[#1D4ED8] hover:bg-blue-800 text-white shadow-sm'
            }`}
          >
            {claimedVoucher ? (
              <>
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Đã Lưu Mã {campaign.voucherCode}</span>
              </>
            ) : (
              <>
                <span>{campaign.ctaLabel}</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
