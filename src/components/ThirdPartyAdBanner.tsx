import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, Tv, X } from 'lucide-react';
import {
  loadThirdPartyAdConfig,
  isUserAdFree,
  recordAdImpression,
  recordVolunteerAdWatched,
  ThirdPartyAdConfig
} from '../utils/adTrackingService';
import { VolunteerAdSequenceModal } from './VolunteerAdSequenceModal';

interface ThirdPartyAdBannerProps {
  userRole?: string;
  userName?: string;
}

export const ThirdPartyAdBanner: React.FC<ThirdPartyAdBannerProps> = ({
  userRole,
  userName = 'Thành viên Mealy'
}) => {
  const [adConfig, setAdConfig] = useState<ThirdPartyAdConfig>(loadThirdPartyAdConfig);
  const [adFree, setAdFree] = useState<boolean>(isUserAdFree);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissedSession, setDismissedSession] = useState(false);
  const [showRewardedModal, setShowRewardedModal] = useState(false);

  useEffect(() => {
    const refreshState = () => {
      setAdConfig(loadThirdPartyAdConfig());
      setAdFree(isUserAdFree());
    };
    window.addEventListener('mealwise:ad_config_updated', refreshState);
    window.addEventListener('mealwise:ad_watched', refreshState);
    return () => {
      window.removeEventListener('mealwise:ad_config_updated', refreshState);
      window.removeEventListener('mealwise:ad_watched', refreshState);
    };
  }, []);

  const activeCampaigns = adConfig.campaigns.filter(c => c.active);

  useEffect(() => {
    if (!adConfig.enabled || !adConfig.showBottomBanner || adFree || userRole === 'admin' || activeCampaigns.length === 0) {
      return;
    }
    const current = activeCampaigns[currentIndex % activeCampaigns.length];
    if (current) {
      recordAdImpression(
        'banner',
        `Quảng cáo đối tác: ${current.sponsorName} - ${current.headline}`,
        15,
        0,
        userName
      );
    }
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeCampaigns.length);
    }, 25000);
    return () => clearInterval(timer);
  }, [adConfig.enabled, adConfig.showBottomBanner, adFree, userRole, currentIndex, activeCampaigns.length, userName]);

  if (!adConfig.enabled || !adConfig.showBottomBanner || adFree || userRole === 'admin' || dismissedSession || activeCampaigns.length === 0) {
    return null;
  }

  const campaign = activeCampaigns[currentIndex % activeCampaigns.length];
  if (!campaign) return null;

  const handleOpenSponsor = () => {
    recordAdImpression(
      'interstitial',
      `Nhấn ưu đãi đối tác: ${campaign.sponsorName}`,
      10,
      0,
      userName
    );
    window.open(campaign.targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <div className="mx-3 sm:mx-4 mt-2 mb-1 rounded-2xl bg-gradient-to-r from-amber-50/95 via-orange-50/95 to-rose-50/95 dark:from-stone-900/95 dark:via-stone-900/95 dark:to-stone-800/95 border border-amber-200/80 dark:border-amber-500/30 px-3 py-2 shadow-sm transition-all">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/15 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border border-amber-400/30">
                <Tv className="w-2.5 h-2.5" />
                {campaign.badgeText}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate">
                Kinh phí duy trì ứng dụng miễn phí
              </span>
            </div>
            <p className="text-xs font-extrabold text-stone-900 dark:text-white truncate">
              {campaign.headline}
            </p>
            <p className="text-[11px] text-stone-600 dark:text-stone-300 truncate">
              {campaign.subtext}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleOpenSponsor}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-[11px] font-black flex items-center gap-1 shadow-xs cursor-pointer transition-all"
            >
              <span>{campaign.ctaText}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              type="button"
              onClick={() => setShowRewardedModal(true)}
              title="Xem 3 video tài trợ để tắt quảng cáo hôm nay"
              className="px-2 py-1.5 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="hidden sm:inline">Tắt QC</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissedSession(true)}
              aria-label="Đóng biểu ngữ quảng cáo"
              className="p-1 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <VolunteerAdSequenceModal
        isOpen={showRewardedModal}
        onClose={() => setShowRewardedModal(false)}
        onComplete={() => {
          recordVolunteerAdWatched(3);
          setAdFree(true);
          setShowRewardedModal(false);
        }}
      />
    </>
  );
};
