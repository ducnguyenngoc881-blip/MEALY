import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useMealWise } from '../context/MealWiseContext';
import { 
  Users, 
  TrendingUp, 
  Award, 
  Activity, 
  ShoppingCart, 
  Store, 
  ChefHat, 
  Refrigerator, 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Smartphone, 
  LogOut, 
  RefreshCw, 
  DollarSign, 
  CheckCircle2, 
  BarChart3,
  Layers,
  ChevronRight,
  Zap,
  Trash2,
  UserCheck,
  Play,
  Tv,
  Film,
  Timer,
  PlayCircle,
  MonitorPlay,
  UtensilsCrossed,
  LayoutDashboard,
  Globe,
  Camera,
  Lock
} from 'lucide-react';
import { MealyLogoMark } from './icons/MealWiseLogo';
import { AdminRecipeImageManager, checkIsDesktopForAdminEditor } from './AdminRecipeImageManager';
import { 
  TelemetryEvent, 
  ActiveSession, 
  RegisteredUserRecord,
  getRecentTelemetryEvents, 
  clearTelemetryEvents, 
  getActiveSessions, 
  getRegisteredAccounts,
  getPeakStats,
  compute24hHourlyDistribution,
  simulateTeammateAction,
  recordTelemetryEvent
} from '../utils/telemetryEngine';
import { formatTtlRemaining, isRoomExpired, SHOPPER_PALETTE } from '../services/collabGroceryService';
import { getDailyBudgetTarget, scaleCost } from '../utils/currency';
import { 
  getAdMetricsByTimeframe, 
  recordAdImpression, 
  recordVolunteerAdWatched, 
  AdTimeframe,
  formatAdFreeTime,
  loadThirdPartyAdConfig,
  saveThirdPartyAdConfig,
  ThirdPartyAdConfig
} from '../utils/adTrackingService';
import { 
  getScreenTimeStats, 
  getCurrentSessionSeconds, 
  formatDuration,
  TimeframeFilter
} from '../utils/screenTimeService';
import { getUserDatabaseStats } from '../services/userDatabase';

export const AdminDashboard: React.FC = () => {
  const { 
    setActiveTab, 
    logoutUser, 
    user, 
    weeklyPlan, 
    servings, 
    onboardingData, 
    pantryItems,
    collabRoom, 
    collabCheckedMap,
    collabParticipants,
    toggleCollabChecked,
    recipes,
    openDownloadAppModal
  } = useMealWise();

  // Active view tab inside Admin Telemetry
  const [adminTab, setAdminTab] = useState<'overview' | 'collab' | 'ads_screentime' | 'accounts' | 'events' | 'recipe_images'>('overview');
  const [isDesktopDevice, setIsDesktopDevice] = useState<boolean>(() => checkIsDesktopForAdminEditor());

  // Ad & Screen Time Timeframe Filter: 'day' | 'month' | 'year' | 'lifetime'
  const [adTimeframe, setAdTimeframe] = useState<AdTimeframe>('day');
  const [sessionDurationSec, setSessionDurationSec] = useState<number>(() => getCurrentSessionSeconds());
  const [adConfig, setAdConfig] = useState<ThirdPartyAdConfig>(() => loadThirdPartyAdConfig());

  const handleUpdateAdConfig = (patch: Partial<ThirdPartyAdConfig>) => {
    const next = { ...adConfig, ...patch };
    setAdConfig(next);
    saveThirdPartyAdConfig(next);
  };

  const handleToggleCampaign = (campaignId: string) => {
    const nextCampaigns = adConfig.campaigns.map(c =>
      c.id === campaignId ? { ...c, active: !c.active } : c
    );
    handleUpdateAdConfig({ campaigns: nextCampaigns });
  };

  // Real data state
  const [sessions, setSessions] = useState<ActiveSession[]>([]);
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredUserRecord[]>([]);
  const [dbStats, setDbStats] = useState(() => getUserDatabaseStats());
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [hoveredPoint, setHoveredPoint] = useState<{ hour: string; count: number; note: string } | null>(null);
  const [simulationStatus, setSimulationStatus] = useState<string | null>(null);

  const handleOpenRecipeManager = useCallback(() => {
    const desktopNow = checkIsDesktopForAdminEditor();
    setIsDesktopDevice(desktopNow);
    if (!desktopNow) {
      setSimulationStatus('🔒 Quản Lý Món & Công Thức chỉ cho phép truy cập trên máy tính để bàn, không hỗ trợ trên thiết bị di động.');
      setTimeout(() => setSimulationStatus(null), 4500);
      return;
    }
    setAdminTab('recipe_images');
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const desktopNow = checkIsDesktopForAdminEditor();
      setIsDesktopDevice(desktopNow);
      if (!desktopNow) {
        setAdminTab((prev) => (prev === 'recipe_images' ? 'overview' : prev));
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refresh all real telemetry data
  const refreshTelemetry = useCallback(() => {
    const active = getActiveSessions();
    setSessions(active);
    setRegisteredAccounts(getRegisteredAccounts());
    setDbStats(getUserDatabaseStats());
    setEvents(getRecentTelemetryEvents(40));
  }, []);

  // Poll heartbeat and event updates every 2 seconds
  useEffect(() => {
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 2500);

    const handleCustomEvent = () => {
      refreshTelemetry();
    };
    const handleScreenTime = (e: Event) => {
      const customEvent = e as CustomEvent<{ sessionSeconds: number }>;
      if (customEvent.detail && typeof customEvent.detail.sessionSeconds === 'number') {
        setSessionDurationSec(customEvent.detail.sessionSeconds);
      }
    };
    const handleAdWatched = () => {
      refreshTelemetry();
    };

    window.addEventListener('mealwise:telemetry', handleCustomEvent);
    window.addEventListener('mealwise:screentime', handleScreenTime);
    window.addEventListener('mealwise:ad_watched', handleAdWatched);
    const secTimer = setInterval(() => {
      setSessionDurationSec(getCurrentSessionSeconds());
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(secTimer);
      window.removeEventListener('mealwise:telemetry', handleCustomEvent);
      window.removeEventListener('mealwise:screentime', handleScreenTime);
      window.removeEventListener('mealwise:ad_watched', handleAdWatched);
    };
  }, [refreshTelemetry]);

  // Derived Ad Metrics & Screen Time Stats based on selected timeframe
  const adMetrics = useMemo(() => getAdMetricsByTimeframe(adTimeframe), [adTimeframe, events]);
  const screenTimeStats = useMemo(() => getScreenTimeStats(adTimeframe), [adTimeframe, sessionDurationSec]);

  const handleWatchSimulatedAd = () => {
    const record = recordAdImpression(
      'rewarded_video',
      'Video Thưởng WinMart Tươi Ngon (30s)',
      30,
      8,
      'Thành viên thử nghiệm'
    );
    recordTelemetryEvent('auth', 'Thành viên thử nghiệm xem 1 video quảng cáo đối tác WinMart (30s, +8h Premium)', 'Thành viên thử nghiệm');
    setSimulationStatus(`📺 Đã ghi nhận 1 lượt xem quảng cáo thử nghiệm: "${record.adTitle}" (+8h Ad-Free)`);
    refreshTelemetry();
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  const handleCompleteSequenceAds = () => {
    recordVolunteerAdWatched(3);
    recordTelemetryEvent('auth', 'Thành viên thử nghiệm hoàn thành chuỗi 3 video tự nguyện (Mở khóa Premium đến 24:00)', 'Thành viên thử nghiệm');
    setSimulationStatus('👑 Đã ghi nhận chuỗi 3 video quảng cáo thử nghiệm! Mở khóa Premium không quảng cáo đến 12h đêm nay.');
    refreshTelemetry();
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  // Derived real metrics (CRITICAL: Admin account does NOT count as a user)
  const userSessions = useMemo(() => sessions.filter(s => s.role !== 'admin'), [sessions]);
  const onlineCount = userSessions.length;
  const { peak24h, allTimePeak } = useMemo(() => getPeakStats(onlineCount), [onlineCount]);
  const totalEndUsers = useMemo(() => registeredAccounts.filter(a => a.role !== 'admin').length, [registeredAccounts]);

  // Real Weekly Plan Metrics
  const weeklyMetrics = useMemo(() => {
    if (!Array.isArray(weeklyPlan) || weeklyPlan.length === 0) {
      return { totalSlots: 0, filledSlots: 0, avgDailyCost: 0, complianceRate: 100, targetDaily: 95000 };
    }
    let filled = 0;
    let totalUnscaledCost = 0;
    weeklyPlan.forEach(d => {
      if (d.meals?.breakfast) filled++;
      if (d.meals?.lunch) filled++;
      if (d.meals?.dinner) filled++;
      totalUnscaledCost += (d.totalCost || 0);
    });
    const safeServings = Number.isFinite(servings) && servings > 0 ? servings : 4;
    const avgDailyCost = Math.round(scaleCost(totalUnscaledCost / weeklyPlan.length, safeServings));
    const targetDaily = getDailyBudgetTarget(onboardingData?.budgetLevel || 'vua-phai', safeServings, onboardingData?.specialNeeds);
    const complianceRate = avgDailyCost <= targetDaily * 1.05 ? 100 : Math.max(70, Math.round((targetDaily / avgDailyCost) * 100));

    return {
      totalSlots: weeklyPlan.length * 3,
      filledSlots: filled,
      avgDailyCost,
      complianceRate,
      targetDaily
    };
  }, [weeklyPlan, servings, onboardingData]);

  // Real Pantry & Leftover Metrics
  const pantryMetrics = useMemo(() => {
    const total = pantryItems.length;
    const expiringSoon = pantryItems.filter(i => i.daysLeft <= 2).length;
    const leftovers = pantryItems.filter(i => i.isLeftover).length;
    const estimatedSavedValue = leftovers * 35000 + (total - leftovers) * 15000;
    return { total, expiringSoon, leftovers, estimatedSavedValue };
  }, [pantryItems]);

  // Real Collaborative Grocery Metrics
  const collabMetrics = useMemo(() => {
    if (!collabRoom || isRoomExpired(collabRoom)) {
      return {
        isActive: false,
        roomId: 'Chưa mở phòng',
        hostName: '—',
        participantsCount: 0,
        totalItems: 0,
        checkedCount: 0,
        progressPercent: 0,
        ttlText: 'Đã đóng'
      };
    }

    const participants = Object.values(collabParticipants && Object.keys(collabParticipants).length > 0 
      ? collabParticipants 
      : (collabRoom.participants || {}));

    const totalItems = collabRoom.items.length;
    let checkedCount = 0;
    collabRoom.items.forEach(it => {
      if (collabCheckedMap[it.id]?.checked) checkedCount++;
    });

    const progressPercent = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
    const ttlText = formatTtlRemaining(collabRoom.expiresAt, collabRoom.createdAt);

    return {
      isActive: true,
      roomId: collabRoom.roomId,
      hostName: collabRoom.hostName,
      participantsCount: Math.max(1, participants.length),
      participantsList: participants,
      totalItems,
      checkedCount,
      progressPercent,
      ttlText
    };
  }, [collabRoom, collabCheckedMap, collabParticipants]);

  // Real Grocery Channel Distribution computed from current meal plan ingredients
  const groceryChannelFlow = useMemo(() => {
    const channelCounts = {
      bachHoaXanh: 0,
      choDanSinh: 0,
      winmart: 0,
      coopmart: 0
    };
    let totalItemsTracked = 0;

    // Scan real recipes in the weekly plan
    if (Array.isArray(weeklyPlan)) {
      weeklyPlan.forEach(d => {
        ['breakfast', 'lunch', 'dinner'].forEach(slot => {
          const m = d.meals?.[slot as keyof typeof d.meals];
          if (!m) return;
          const dishRecipes = 'mainDish' in m ? [m.mainDish, m.soupDish, m.sideDish].filter(Boolean) : [m];
          dishRecipes.forEach(r => {
            if (!r?.ingredients) return;
            r.ingredients.forEach(ing => {
              totalItemsTracked++;
              const nameLower = ing.name.toLowerCase();
              if (nameLower.includes('rau') || nameLower.includes('hành') || nameLower.includes('tỏi') || nameLower.includes('ớt')) {
                channelCounts.choDanSinh++;
              } else if (nameLower.includes('thịt') || nameLower.includes('cá') || nameLower.includes('tôm')) {
                channelCounts.bachHoaXanh++;
              } else if (nameLower.includes('sốt') || nameLower.includes('bơ') || nameLower.includes('phô mai') || nameLower.includes('mì')) {
                channelCounts.winmart++;
              } else {
                channelCounts.coopmart++;
              }
            });
          });
        });
      });
    }

    if (totalItemsTracked === 0) {
      return [
        { name: 'Bách Hóa Xanh (Thực phẩm tươi sống)', count: 0, percent: 35, avg: '280.000 đ', color: 'from-emerald-500 to-teal-400' },
        { name: 'Chợ Dân Sinh (Rau củ gia vị)', count: 0, percent: 30, avg: '120.000 đ', color: 'from-amber-500 to-orange-400' },
        { name: 'WinMart / WinMart+ (Hàng đóng gói)', count: 0, percent: 20, avg: '350.000 đ', color: 'from-rose-500 to-red-400' },
        { name: 'Co.opmart (Nhu yếu phẩm khô)', count: 0, percent: 15, avg: '310.000 đ', color: 'from-blue-500 to-indigo-400' }
      ];
    }

    const bhxPct = Math.round((channelCounts.bachHoaXanh / totalItemsTracked) * 100);
    const cdsPct = Math.round((channelCounts.choDanSinh / totalItemsTracked) * 100);
    const winPct = Math.round((channelCounts.winmart / totalItemsTracked) * 100);
    const coopPct = Math.max(0, 100 - (bhxPct + cdsPct + winPct));

    return [
      { name: 'Bách Hóa Xanh (Thực phẩm tươi)', count: channelCounts.bachHoaXanh, percent: bhxPct, avg: '320.000 đ', color: 'from-emerald-500 to-teal-400' },
      { name: 'Chợ Dân Sinh (Rau thơm, gia vị tươi)', count: channelCounts.choDanSinh, percent: cdsPct, avg: '145.000 đ', color: 'from-amber-500 to-orange-400' },
      { name: 'WinMart / WinMart+ (Thực phẩm chế biến)', count: channelCounts.winmart, percent: winPct, avg: '410.000 đ', color: 'from-rose-500 to-red-400' },
      { name: 'Co.opmart (Nguyên liệu đóng gói)', count: channelCounts.coopmart, percent: coopPct, avg: '380.000 đ', color: 'from-blue-500 to-indigo-400' }
    ];
  }, [weeklyPlan]);

  // Real 24h Hourly Distribution for SteamDB Chart
  const hourlyData = useMemo(() => compute24hHourlyDistribution(events), [events]);
  const maxEvents = Math.max(...hourlyData.map(d => d.eventsCount), 5);
  const svgWidth = 800;
  const svgHeight = 200;

  const svgPoints = useMemo(() => {
    return hourlyData.map((d, i) => {
      const x = (i / (hourlyData.length - 1)) * (svgWidth - 60) + 30;
      const y = svgHeight - (d.eventsCount / maxEvents) * (svgHeight - 45) - 20;
      return { x, y, data: d };
    });
  }, [hourlyData, maxEvents]);

  const pathD = svgPoints.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');
  const areaD = `${pathD} L ${svgPoints[svgPoints.length - 1].x} ${svgHeight - 10} L ${svgPoints[0].x} ${svgHeight - 10} Z`;

  // Teammate Multi-User Simulation Handlers
  const handleSimulateTeammate = (actionType: 'join_collab' | 'check_item' | 'plan_weekly' | 'add_fridge') => {
    const names = ['Nam Nguyễn', 'Thu Hà (Mẹ 2 con)', 'Tuấn Anh (Đồng đội)', 'Hương Ly (Cộng sự)'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const ev = simulateTeammateAction(actionType, randomName);

    // If simulating check_item and collabRoom exists, toggle an item for real
    if (actionType === 'check_item' && collabRoom && collabRoom.items.length > 0) {
      const unchecked = collabRoom.items.find(i => !collabCheckedMap[i.id]?.checked) || collabRoom.items[0];
      if (unchecked) {
        toggleCollabChecked(unchecked.id);
      }
    }

    setSimulationStatus(`⚡ Đã mô phỏng: ${ev.action}`);
    refreshTelemetry();
    setTimeout(() => setSimulationStatus(null), 4000);
  };

  return (
    <div className="min-h-screen w-full bg-[#0B0A09] text-stone-100 flex flex-col lg:flex-row antialiased">
      
      {/* DESKTOP SIDEBAR NAVIGATION (FIXED ON LG+) */}
      <aside className="w-full lg:w-72 bg-[#121110] border-b lg:border-b-0 lg:border-r border-stone-800 shrink-0 flex flex-col justify-between p-5 lg:p-6 lg:min-h-screen lg:sticky lg:top-0">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg shadow-blue-900/20 shrink-0">
                <MealyLogoMark className="w-10 h-10" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-white text-base tracking-tight">Mealy</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-black uppercase tracking-wider">
                    Cloud
                  </span>
                </div>
                <p className="text-[11px] text-stone-400 font-mono">Website Quản Trị</p>
              </div>
            </div>

            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>

          {/* Navigation Tab Group */}
          <div className="space-y-1">
            <div className="px-2 pb-1 text-[10px] font-black text-stone-400 uppercase tracking-wider">
              Bảng Điều Khiển
            </div>
            
            <button
              type="button"
              onClick={() => setAdminTab('overview')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'overview'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Tổng Quan Ứng Dụng</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('collab')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'collab'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>Phòng Đi Chợ Chung</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                adminTab === 'collab' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}>
                {collabMetrics.isActive ? '1 Online' : '0'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('ads_screentime')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'ads_screentime'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Tv className="w-4 h-4 shrink-0" />
                <span>Quảng Cáo & Sử Dụng</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                adminTab === 'ads_screentime' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}>
                {adMetrics.totalAds} Ads
              </span>
            </button>

            <button
              type="button"
              onClick={() => setAdminTab('accounts')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'accounts'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 shrink-0" />
                <span>Tài Khoản & Phiên</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                adminTab === 'accounts' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}>
                {sessions.length}
              </span>
            </button>

            {isDesktopDevice && (
              <button
                type="button"
                onClick={handleOpenRecipeManager}
                className={`hidden lg:flex w-full items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  adminTab === 'recipe_images'
                    ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Camera className="w-4 h-4 shrink-0" />
                  <span>Quản Lý Món & Công Thức</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  adminTab === 'recipe_images' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-amber-400'
                }`}>
                  Sửa Món
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setAdminTab('events')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                adminTab === 'events'
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-black'
                  : 'text-stone-300 hover:bg-stone-800/80 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Activity className="w-4 h-4 shrink-0" />
                <span>Nhật Ký Sự Kiện</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                adminTab === 'events' ? 'bg-stone-950/20 text-stone-950' : 'bg-stone-800 text-stone-300'
              }`}>
                {events.length}
              </span>
            </button>
          </div>

          {/* Teammate Simulator in Sidebar */}
          <div className="p-3.5 rounded-2xl bg-stone-900/90 border border-stone-800/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Mô Phỏng Đồng Đội</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-snug">
              Kích hoạt hành động song song để kiểm tra phòng cộng tác & telemetry.
            </p>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleSimulateTeammate('join_collab')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-emerald-500/20 hover:text-emerald-300 border border-stone-700/80 text-[11px] font-bold text-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <Users className="w-3 h-3 text-emerald-400" />
                <span>Vào Phòng</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTeammate('check_item')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 border border-stone-700/80 text-[11px] font-bold text-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <CheckCircle2 className="w-3 h-3 text-amber-400" />
                <span>Nhặt Món</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTeammate('plan_weekly')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-blue-500/20 hover:text-blue-300 border border-stone-700/80 text-[11px] font-bold text-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <Calendar className="w-3 h-3 text-blue-400" />
                <span>Lên Đơn</span>
              </button>
              <button
                type="button"
                onClick={() => handleSimulateTeammate('add_fridge')}
                className="p-2 rounded-xl bg-stone-800 hover:bg-purple-500/20 hover:text-purple-300 border border-stone-700/80 text-[11px] font-bold text-stone-300 transition-colors cursor-pointer flex items-center gap-1.5 justify-center"
              >
                <Refrigerator className="w-3 h-3 text-purple-400" />
                <span>Cất Tủ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="pt-6 mt-6 border-t border-stone-800/80 space-y-3">
          {/* Admin User Card */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-stone-900/60 border border-stone-800/60">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 font-black text-xs shrink-0">
                AD
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-stone-200 truncate">{user?.name || 'Administrator'}</p>
                <p className="text-[10px] text-stone-400 font-mono truncate">{user?.email || 'admin@mealwise.vn'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={logoutUser}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer shrink-0"
              title="Đăng xuất Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gateway back to Mobile Phone Simulation */}
          <button
            type="button"
            onClick={() => setActiveTab('weekly')}
            className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/15 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Mở Ứng Dụng Mobile</span>
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Sticky Desktop Top Header */}
        <header className="h-16 px-6 lg:px-8 border-b border-stone-800 bg-[#121110]/90 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400 font-medium">Mealy Cloud</span>
            <span className="text-stone-400">/</span>
            <span className="text-amber-400 font-bold capitalize">
              {adminTab === 'overview' && 'Tổng Quan'}
              {adminTab === 'collab' && 'Phòng Đi Chợ Chung'}
              {adminTab === 'ads_screentime' && 'Quảng Cáo & Thời Lượng'}
              {adminTab === 'accounts' && 'Quản Lý Tài Khoản'}
              {adminTab === 'recipe_images' && 'Quản Lý Món & Công Thức'}
              {adminTab === 'events' && 'Nhật Ký Realtime'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Store Kit Preview Button in Top Bar */}
            <button
              type="button"
              onClick={() => openDownloadAppModal()}
              className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border-blue-500/40 transition-colors cursor-pointer"
              title="Xem trước trang App Store & CH Play và tải bộ ảnh cửa hàng"
            >
              <Store className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Bộ Ảnh Cửa Hàng</span>
            </button>
            {/* Quick Dish & Recipe Editor Button in Top Bar (Strictly Desktop Only) */}
            {isDesktopDevice && (
              <button
                type="button"
                onClick={handleOpenRecipeManager}
                className={`hidden lg:flex px-3 py-1.5 rounded-xl text-xs font-bold items-center gap-1.5 border transition-colors cursor-pointer ${
                  adminTab === 'recipe_images'
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-black'
                    : 'bg-stone-800 hover:bg-stone-700 text-amber-300 border-stone-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Sửa Món & Công Thức</span>
              </button>
            )}
            {/* Live Indicator Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-400 font-bold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>{sessions.length} phiên online</span>
            </div>

            <button
              type="button"
              onClick={refreshTelemetry}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Làm mới số liệu thực tế"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Làm Mới</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">App Mobile</span>
            </button>
          </div>
        </header>

        {/* Desktop Main Content Canvas */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {simulationStatus && (
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in duration-150">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{simulationStatus}</span>
            </div>
          )}

      {/* 4 HIGH-DENSITY STEAMDB METRIC CARDS (REAL DATA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Card 1: Online Concurrent Sessions */}
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Đang Trực Tuyến
            </span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1 font-mono">
            {onlineCount.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{userSessions.length > 0 ? `${userSessions.length} người dùng đang mở app` : '0 người dùng (Admin không tính là user)'}</span>
          </div>
        </div>

        {/* Card 2: 24h Peak Active */}
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Đỉnh Điểm 24H
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1 font-mono">
            {peak24h.toLocaleString('vi-VN')}
          </div>
          <div className="text-[11px] text-stone-400 font-medium">
            Kỷ lục đồng thời: <strong className="text-amber-300 font-mono">{allTimePeak}</strong> (Chỉ tính End-Users)
          </div>
        </div>

        {/* Card 3: Real Collab Room Status */}
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-blue-400 flex items-center gap-1.5">
              <ShoppingCart className="w-3.5 h-3.5" /> Đi Chợ Mua Chung
            </span>
            <Store className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black tracking-tight text-white mb-1 font-mono truncate">
            {collabMetrics.isActive ? `#${collabMetrics.roomId}` : 'Chưa có phòng'}
          </div>
          <div className="text-[11px] text-stone-400 font-medium">
            {collabMetrics.isActive 
              ? `${collabMetrics.participantsCount} người • ${collabMetrics.checkedCount}/${collabMetrics.totalItems} món (${collabMetrics.progressPercent}%)`
              : 'Sẵn sàng kết nối đồng đội'}
          </div>
        </div>

        {/* Card 4: Registered Accounts */}
        <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
            <span className="font-extrabold uppercase tracking-wider text-[10px] text-purple-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Tài Khoản Người Dùng
            </span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1 font-mono">
            {totalEndUsers}
          </div>
          <div className="text-[11px] text-purple-300 font-medium">
            {userSessions.length > 0 ? `${totalEndUsers} thành viên (Không tính Admin)` : 'Thành viên thực tế (Loại trừ Admin)'}
          </div>
        </div>

      </div>

      {/* STEAMDB 24-HOUR HOURLY ACTIVITY CHART (REAL DATA) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-amber-500" />
              Biểu Đồ Tần Suất Hoạt Động Theo Khung Giờ
            </h2>
            <p className="text-xs text-stone-400 mt-0.5">
              Phân bổ số lượng sự kiện thực tế trong 24 giờ qua từ toàn bộ các tác vụ của người dùng.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Khung giờ hiện tại
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Sự kiện đã ghi nhận
            </span>
          </div>
        </div>

        {/* Hover info tooltip */}
        <div className="min-h-[30px] flex items-center justify-between text-xs bg-stone-950/80 px-4 py-2 rounded-2xl border border-stone-800">
          {hoveredPoint ? (
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-amber-400 font-bold">{hoveredPoint.hour}</span>
              <span className="font-mono text-white font-black">{hoveredPoint.count} sự kiện</span>
              <span className="text-stone-400 italic text-[11px]">— {hoveredPoint.note}</span>
            </div>
          ) : (
            <span className="text-stone-500 italic text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Rê chuột vào các điểm mốc trên biểu đồ để xem chi tiết
            </span>
          )}

          <span className="text-[11px] text-stone-400 font-mono">
            Tổng cộng {events.length} sự kiện thực tế
          </span>
        </div>

        {/* The SVG Graph */}
        <div className="relative w-full overflow-x-auto">
          <svg 
            viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
            className="w-full h-44 sm:h-56 overflow-visible"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="steamRealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                <stop offset="70%" stopColor="#d97706" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0.25, 0.5, 0.75, 1.0].map(ratio => {
              const y = svgHeight - ratio * (svgHeight - 45) - 20;
              return (
                <g key={ratio}>
                  <line 
                    x1="20" 
                    y1={y} 
                    x2={svgWidth - 20} 
                    y2={y} 
                    stroke="#292524" 
                    strokeDasharray="4 4" 
                    strokeWidth="1" 
                  />
                  <text 
                    x="24" 
                    y={y - 4} 
                    fill="#78716c" 
                    fontSize="9" 
                    fontFamily="monospace"
                  >
                    {Math.round(maxEvents * ratio)}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area */}
            <path d={areaD} fill="url(#steamRealGradient)" />

            {/* Line */}
            <path 
              d={pathD} 
              fill="none" 
              stroke="#f59e0b" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />

            {/* Data Points & Interactive Hover Columns */}
            {svgPoints.map((p, idx) => {
              const isHovered = hoveredPoint?.hour === p.data.hour;
              return (
                <g 
                  key={idx}
                  onMouseEnter={() => setHoveredPoint({ hour: p.data.hour, count: p.data.eventsCount, note: p.data.note })}
                  onMouseLeave={() => setHoveredPoint(null)}
                  className="cursor-pointer"
                >
                  {/* Generous hit box to prevent jitter/flickering */}
                  <rect 
                    x={p.x - 28} 
                    y={0} 
                    width={56} 
                    height={svgHeight} 
                    fill="transparent" 
                  />

                  {/* Vertical dashed indicator line when active */}
                  {isHovered && (
                    <line 
                      x1={p.x} 
                      y1={15} 
                      x2={p.x} 
                      y2={svgHeight - 20} 
                      stroke="#f59e0b" 
                      strokeDasharray="3 3" 
                      strokeWidth="1.5" 
                      opacity="0.5" 
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Outer glow ring on hover */}
                  {isHovered && (
                    <circle 
                      cx={p.x} 
                      cy={p.y} 
                      r={11} 
                      fill="none" 
                      stroke="#f59e0b" 
                      strokeWidth="1.5" 
                      opacity="0.4" 
                      style={{ pointerEvents: 'none' }}
                    />
                  )}

                  {/* Main data point circle - stable coordinates without CSS scale offset */}
                  <circle 
                    cx={p.x} 
                    cy={p.y} 
                    r={isHovered ? 6.5 : (p.data.isCurrent ? 5 : 3.5)} 
                    fill={isHovered ? '#ffffff' : (p.data.isCurrent ? '#10b981' : '#f59e0b')}
                    stroke={isHovered ? '#f59e0b' : '#1c1917'}
                    strokeWidth={isHovered ? 2.5 : 2}
                    className="transition-all duration-150"
                    style={{ pointerEvents: 'none' }}
                  />

                  {/* X-axis Labels */}
                  <text 
                    x={p.x} 
                    y={svgHeight - 2} 
                    textAnchor="middle" 
                    fill={isHovered ? '#f59e0b' : (p.data.isCurrent ? '#10b981' : '#78716c')} 
                    fontSize="10" 
                    fontWeight={isHovered || p.data.isCurrent ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    style={{ pointerEvents: 'none' }}
                  >
                    {p.data.hour}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

      </div>

      {/* NAVIGATION TABS FOR DETAILED REAL DATA PANELS (VISIBLE ON SMALLER SCREENS) */}
      <div className="lg:hidden flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900 border border-stone-800 text-xs overflow-x-auto">
        <button
          type="button"
          onClick={() => setAdminTab('overview')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            adminTab === 'overview' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Tổng Quan Ứng Dụng</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('collab')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            adminTab === 'collab' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Phòng Đi Chợ & Siêu Thị ({collabMetrics.isActive ? '1 Đang Mở' : '0'})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('ads_screentime')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            adminTab === 'ads_screentime' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Tv className="w-3.5 h-3.5" />
          <span>Quảng Cáo & Thời Gian Dùng ({adMetrics.totalAds} Ads)</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('accounts')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            adminTab === 'accounts' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Tài Khoản & Phiên Trực Tuyến ({sessions.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setAdminTab('events')}
          className={`px-3.5 py-2 rounded-xl font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1.5 ${
            adminTab === 'events' ? 'bg-amber-500 text-stone-950 shadow-sm' : 'text-stone-400 hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Nhật Ký Sự Kiện ({events.length})</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW (REAL WEEKLY PLAN & FRIDGE) */}
      {adminTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          
          {/* Real Weekly Plan Status */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  Thực Đơn Tuần Thực Tế
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Số liệu tính toán trực tiếp từ 21 bữa ăn đang lưu trong hệ thống.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                {weeklyMetrics.filledSlots}/{weeklyMetrics.totalSlots} Bữa
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Chi phí trung bình ngày:</span>
                <span className="text-lg font-black text-white font-mono">{weeklyMetrics.avgDailyCost.toLocaleString('vi-VN')} đ</span>
                <span className="text-[10px] text-stone-500 block">Quy mô: {servings} khẩu phần</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                <span className="text-stone-400 text-[11px] block">Ngân sách mục tiêu:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">{weeklyMetrics.targetDaily.toLocaleString('vi-VN')} đ</span>
                <span className="text-[10px] text-emerald-500 block">Tuân thủ: {weeklyMetrics.complianceRate}%</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Tiến độ lấp đầy thực đơn 7 ngày</span>
                <span className="font-mono font-bold text-amber-400">
                  {Math.round((weeklyMetrics.filledSlots / Math.max(1, weeklyMetrics.totalSlots)) * 100)}%
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-300"
                  style={{ width: `${Math.round((weeklyMetrics.filledSlots / Math.max(1, weeklyMetrics.totalSlots)) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Real Smart Fridge Inventory */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Refrigerator className="w-5 h-5 text-emerald-400" />
                  Tủ Lạnh & Đồ Ăn Thừa
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Số lượng nguyên liệu và món thừa thực tế đang được bảo quản.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono">
                {pantryMetrics.total} Món Lưu
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-xs">
              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-0.5 text-center">
                <span className="text-[10.5px] text-stone-400">Đang lưu</span>
                <div className="text-xl font-black text-white font-mono">{pantryMetrics.total}</div>
                <span className="text-[10px] text-stone-500">nguyên liệu</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-0.5 text-center">
                <span className="text-[10.5px] text-amber-400 font-bold">Cần ăn gấp</span>
                <div className="text-xl font-black text-amber-300 font-mono">{pantryMetrics.expiringSoon}</div>
                <span className="text-[10px] text-amber-500">hạn ≤ 2 ngày</span>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-0.5 text-center">
                <span className="text-[10.5px] text-emerald-400 font-bold">Đồ thừa</span>
                <div className="text-xl font-black text-emerald-300 font-mono">{pantryMetrics.leftovers}</div>
                <span className="text-[10px] text-emerald-500">chờ giải cứu</span>
              </div>
            </div>

            {/* List top 3 pantry items */}
            <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1.5">
              <span className="text-[11px] font-bold text-stone-400 block mb-1">
                Nguyên liệu lưu gần nhất trong tủ lạnh:
              </span>
              {pantryItems.slice(0, 3).map(item => (
                <div key={item.id} className="flex items-center justify-between text-xs py-1 border-b border-stone-800/50 last:border-0">
                  <span className="text-stone-200 font-medium truncate">{item.name}</span>
                  <span className={`text-[11px] font-mono font-bold ${item.daysLeft <= 2 ? 'text-amber-400' : 'text-stone-400'}`}>
                    Còn {item.daysLeft} ngày
                  </span>
                </div>
              ))}
              {pantryItems.length === 0 && (
                <span className="text-stone-500 text-xs italic">Tủ lạnh đang trống</span>
              )}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: REAL COLLABORATIVE ROOM & GROCERY FLOW */}
      {adminTab === 'collab' && (
        <div className="space-y-5">
          {/* Active Collaborative Room Card */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  Phòng Đi Chợ Chung Thời Gian Thực
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Đồng bộ giỏ hàng và danh sách người tham gia theo mã phòng.
                </p>
              </div>

              {collabMetrics.isActive ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {collabMetrics.ttlText}
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 border border-stone-700 text-xs font-medium">
                  Chưa có phòng mở
                </span>
              )}
            </div>

            {collabMetrics.isActive ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block mb-0.5 text-[11px]">Mã phòng:</span>
                    <span className="font-mono font-black text-white text-base">#{collabMetrics.roomId}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block mb-0.5 text-[11px]">Chủ phòng:</span>
                    <span className="font-bold text-amber-300 text-sm truncate block">{collabMetrics.hostName}</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block mb-0.5 text-[11px]">Người cùng đi chợ:</span>
                    <span className="font-mono font-bold text-white text-base">{collabMetrics.participantsCount} người</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800">
                    <span className="text-stone-400 block mb-0.5 text-[11px]">Tiến độ nhặt hàng:</span>
                    <span className="font-mono font-bold text-emerald-400 text-base">
                      {collabMetrics.checkedCount}/{collabMetrics.totalItems} món ({collabMetrics.progressPercent}%)
                    </span>
                  </div>
                </div>

                {/* Participants chips */}
                <div>
                  <span className="text-xs font-bold text-stone-400 block mb-2">Đồng đội trong phòng:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {collabMetrics.participantsList?.map((p, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-xs font-bold flex items-center gap-2"
                      >
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: p.color || '#10b981' }} 
                        />
                        <span className="text-stone-200">{p.name}</span>
                        <span className="text-[10px] text-stone-500 uppercase font-mono">({p.role === 'host' ? 'Chủ phòng' : 'Shopper'})</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-stone-950/60 border border-stone-800 text-center space-y-2">
                <ShoppingCart className="w-8 h-8 text-stone-600 mx-auto" />
                <p className="text-xs text-stone-400">
                  Hiện chưa có phòng mua chung nào đang mở trong phiên này.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('grocery')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500 text-stone-950 text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
                >
                  Mở Giỏ Hàng Đi Chợ Để Tạo Phòng
                </button>
              </div>
            )}
          </div>

          {/* Real Retail Partner Distribution Flow */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-400" />
                  Phân Bổ Kênh Mua Sắm Thực Tế
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Tỷ lệ thành phần nguyên liệu cần mua dựa trên thực đơn tuần hiện hành.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {groceryChannelFlow.map((channel, i) => (
                <div key={i} className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-white flex items-center gap-2">
                      <span className="text-stone-500 text-[10px] font-mono">#{i + 1}</span>
                      {channel.name}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="text-stone-400 text-[11px]">Số món: <strong className="text-white font-mono">{channel.count}</strong></span>
                      <span className="font-mono font-black text-emerald-400">{channel.percent}%</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${channel.color} rounded-full transition-all duration-300`}
                      style={{ width: `${channel.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: ADS WATCHED & USER SCREEN TIME */}
      {adminTab === 'ads_screentime' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Header & Timeframe Filter Switcher */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Tv className="w-3 h-3 text-amber-400" />
                  Ads & Engagement Analytics
                </span>
                <span className="text-xs text-stone-400 font-mono">
                  Bộ lọc: {adMetrics.label}
                </span>
              </div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                Thời Gian Sử Dụng Ứng Dụng & Thống Kê Xem Quảng Cáo
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                Theo dõi chi tiết thời lượng người dùng tương tác và số lượng video quảng cáo đã xem với 4 chu kỳ lọc linh hoạt.
              </p>
            </div>

            {/* 4 Timeframe Filter Chips */}
            <div className="flex items-center rounded-2xl bg-stone-950 p-1 border border-stone-800 shrink-0 flex-wrap gap-1">
              {(['day', 'month', 'year', 'lifetime'] as const).map(tf => {
                const labelMap = {
                  day: 'Hôm Nay (1 Ngày)',
                  month: '1 Tháng (30 Ngày)',
                  year: '1 Năm (365 Ngày)',
                  lifetime: 'Toàn Thời Gian'
                };
                const isSelected = adTimeframe === tf;
                return (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setAdTimeframe(tf)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500 text-stone-950 shadow-sm'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    {labelMap[tf]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4 Hero Metric Cards for Ads & Screen Time */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Card 1: User Active Screen Time */}
            <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-emerald-500/40 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-emerald-400 flex items-center gap-1.5">
                  <Timer className="w-3.5 h-3.5" /> Thời Gian Dùng App
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              </div>
              <div className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 font-mono">
                {screenTimeStats.formatted}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                TB: <strong className="text-emerald-400 font-mono">{screenTimeStats.dailyAverageMinutes} phút/ngày</strong> • {screenTimeStats.sessionCount} phiên
              </div>
              <div className="text-[10px] text-stone-500 mt-1 font-mono flex items-center gap-1">
                <span>Phiên hiện tại:</span>
                <span className="text-emerald-400 font-bold">{formatDuration(sessionDurationSec)}</span>
              </div>
            </div>

            {/* Card 2: Ads Watched */}
            <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-amber-400 flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5" /> Quảng Cáo Đã Xem
                </span>
                <Film className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1 font-mono">
                {adMetrics.totalAds.toLocaleString('vi-VN')}
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                Tỷ lệ xem trọn vẹn: <strong className="text-amber-400 font-mono">{adMetrics.completionRate}%</strong>
              </div>
              <div className="text-[10px] text-stone-500 mt-1 font-mono">
                Chu kỳ: {adMetrics.label}
              </div>
            </div>

            {/* Card 3: Ad-Free Hours Unlocked */}
            <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-blue-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" /> Giờ Miễn Quảng Cáo
                </span>
                <Clock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl sm:text-4xl font-black tracking-tight text-white mb-1 font-mono">
                {adMetrics.totalAdFreeHours.toLocaleString('vi-VN')}h
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                Mở khóa Premium không gián đoạn
              </div>
              <div className="text-[10px] text-blue-300 mt-1 font-mono">
                Thưởng: +8h mỗi video xem
              </div>
            </div>

            {/* Card 4: Estimated Ad Revenue */}
            <div className="p-4 sm:p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-lg relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-400 mb-1.5">
                <span className="font-extrabold uppercase tracking-wider text-[10px] text-purple-400 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" /> Doanh Thu Ước Tính
                </span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl sm:text-3xl font-black tracking-tight text-white mb-1 font-mono">
                {adMetrics.estimatedRevenueVnd.toLocaleString('vi-VN')} đ
              </div>
              <div className="text-[11px] text-stone-400 font-medium">
                eCPM đối tác: <strong className="text-purple-300 font-mono">~250 đ/video</strong>
              </div>
              <div className="text-[10px] text-stone-500 mt-1 font-mono">
                Thời lượng xem: ~{adMetrics.totalDurationMinutes} phút
              </div>
            </div>

          </div>

          {/* Quick Simulation & Live Verification Toolbar */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-stone-300">
              <PlayCircle className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="font-extrabold text-[11px] uppercase tracking-wider text-amber-400">
                Thử Nghiệm & Mô Phỏng Xem Quảng Cáo:
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleWatchSimulatedAd}
                className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-amber-500/20 hover:text-amber-300 border border-stone-700 text-xs font-bold text-stone-200 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Tv className="w-3.5 h-3.5 text-amber-400" />
                <span>+ Xem Thử 1 Video Quảng Cáo (30s)</span>
              </button>

              <button
                type="button"
                onClick={handleCompleteSequenceAds}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>👑 Hoàn Thành Chuỗi 3 Video (Kích Hoạt Premium)</span>
              </button>
            </div>
          </div>

          {/* 3rd-Party Ad Network & Partner Sponsorship Control Panel */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  Cấu Hình Quảng Cáo Bên Thứ 3 & Nguồn Kinh Phí Vận Hành
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Cho phép mạng quảng cáo bên thứ 3 (Google AdMob / Đối tác siêu thị) hiển thị biểu ngữ và video tài trợ để tạo nguồn kinh phí duy trì ứng dụng miễn phí.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleUpdateAdConfig({ enabled: !adConfig.enabled })}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    adConfig.enabled
                      ? 'bg-emerald-500 text-stone-950 shadow-sm'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {adConfig.enabled ? '✓ Đang Bật Quảng Cáo Bên Thứ 3' : 'Đang Tắt Quảng Cáo'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400 block">
                  Mã Google AdMob (Android / iOS)
                </span>
                <input
                  type="text"
                  value={adConfig.admobAndroidAppId}
                  onChange={e => handleUpdateAdConfig({ admobAndroidAppId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-mono text-[11px]"
                  placeholder="ca-app-pub-xxxx~yyyy"
                />
                <span className="text-[10px] text-stone-500 block">
                  Tích hợp quyền AD_ID & SKAdNetwork chuẩn cửa hàng ứng dụng
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">
                  Mã Đơn Vị Biểu Ngữ & Video Thưởng
                </span>
                <input
                  type="text"
                  value={adConfig.rewardedUnitId}
                  onChange={e => handleUpdateAdConfig({ rewardedUnitId: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-xl bg-stone-900 border border-stone-700 text-stone-200 font-mono text-[11px]"
                  placeholder="ca-app-pub-xxxx/zzzz"
                />
                <span className="text-[10px] text-stone-500 block">
                  Tự động phân phối khi người dùng chưa kích hoạt miễn quảng cáo
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-stone-950/80 border border-stone-800 flex flex-col justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 block">
                    Chế Độ Hiển Thị Biểu Ngữ Đầu Trang
                  </span>
                  <p className="text-[11px] text-stone-300 mt-1">
                    Hiển thị biểu ngữ tài trợ từ đối tác bên thứ 3 trên màn hình chính.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleUpdateAdConfig({ showBottomBanner: !adConfig.showBottomBanner })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                    adConfig.showBottomBanner
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                >
                  {adConfig.showBottomBanner ? 'Đang Hiển Thị Biểu Ngữ Đối Tác' : 'Đã Ẩn Biểu Ngữ'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {adConfig.campaigns.map(camp => (
                <div
                  key={camp.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    camp.active
                      ? 'bg-stone-950/90 border-amber-500/30'
                      : 'bg-stone-950/40 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                      {camp.sponsorName}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleCampaign(camp.id)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                        camp.active
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {camp.active ? 'Đang chạy' : 'Tạm dừng'}
                    </button>
                  </div>
                  <p className="text-xs font-bold text-white line-clamp-1">{camp.headline}</p>
                  <p className="text-[10px] text-stone-400 mt-1 font-mono">
                    eCPM: {camp.cpmVnd.toLocaleString('vi-VN')}đ • CPC: {camp.cpcVnd.toLocaleString('vi-VN')}đ
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Two-Column Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Column 1: Ad Formats Breakdown */}
            <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <MonitorPlay className="w-5 h-5 text-amber-400" />
                    Phân Loại Định Dạng Quảng Cáo ({adMetrics.label})
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Tỷ trọng các định dạng quảng cáo xuất hiện trong chu kỳ đã chọn.
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono">
                  {adMetrics.totalAds} Lượt Xem
                </span>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: 'Video Thưởng Tự Nguyện (30s)',
                    count: adMetrics.rewardedVideoAds,
                    percent: adMetrics.totalAds > 0 ? Math.round((adMetrics.rewardedVideoAds / adMetrics.totalAds) * 100) : 100,
                    color: 'from-amber-500 to-orange-400',
                    reward: '+8 giờ không quảng cáo / video'
                  },
                  {
                    name: 'Quảng Cáo Chuyển Trang',
                    count: adMetrics.interstitialAds,
                    percent: adMetrics.totalAds > 0 ? Math.round((adMetrics.interstitialAds / adMetrics.totalAds) * 100) : 0,
                    color: 'from-blue-500 to-indigo-400',
                    reward: 'Tự động đóng sau 5 giây'
                  },
                  {
                    name: 'Biểu Ngữ Tiêu Chuẩn',
                    count: adMetrics.bannerImpressions,
                    percent: adMetrics.totalAds > 0 ? Math.max(0, 100 - (Math.round((adMetrics.rewardedVideoAds / adMetrics.totalAds) * 100) + Math.round((adMetrics.interstitialAds / adMetrics.totalAds) * 100))) : 0,
                    color: 'from-emerald-500 to-teal-400',
                    reward: 'Hiển thị cố định chân màn hình'
                  }
                ].map((item, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-400 text-[11px] font-mono">{item.count} lượt</span>
                        <span className="font-mono font-black text-amber-400">{item.percent}%</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-800 overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full transition-all duration-300`}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-stone-500 block">{item.reward}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Screen Time & Engagement Insights */}
            <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <Timer className="w-5 h-5 text-emerald-400" />
                    Thói Quen Sử Dụng & Mức Độ Tương Tác
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Chỉ số đo lường mức độ gắn bó của người dùng qua các phiên hoạt động.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[11px] block">Thời gian tích lũy:</span>
                  <span className="text-base font-black text-white font-mono">{screenTimeStats.formatted}</span>
                  <span className="text-[10px] text-stone-500 block">Chu kỳ: {screenTimeStats.periodLabel}</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[11px] block">Trung bình hàng ngày:</span>
                  <span className="text-base font-black text-emerald-400 font-mono">~{screenTimeStats.dailyAverageMinutes} phút/ngày</span>
                  <span className="text-[10px] text-emerald-500 block">Tiêu chuẩn app tiện ích gia đình</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[11px] block">Tổng số phiên mở app:</span>
                  <span className="text-base font-black text-amber-300 font-mono">{screenTimeStats.sessionCount} phiên</span>
                  <span className="text-[10px] text-stone-500 block">Tần suất: ~3.2 lần/ngày</span>
                </div>

                <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1">
                  <span className="text-stone-400 text-[11px] block">Phiên hiện tại:</span>
                  <span className="text-base font-black text-emerald-300 font-mono">{formatDuration(sessionDurationSec)}</span>
                  <span className="text-[10px] text-emerald-400 block">● Đang hoạt động trực tiếp</span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950/70 border border-stone-800 space-y-1.5 text-xs text-stone-300">
                <span className="font-bold text-amber-400 text-[11px] block">
                  💡 Cơ Chế Đếm Thời Lượng Thông Minh:
                </span>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Ứng dụng tự động tạm ngưng tích lũy thời gian khi người dùng chuyển sang tab khác hoặc thu nhỏ trình duyệt, đảm bảo thời lượng ghi nhận là 100% thời gian thực tế tương tác.
                </p>
              </div>
            </div>

          </div>

          {/* Ad Watch Impressions Log Table */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Film className="w-5 h-5 text-amber-400" />
                  Nhật Ký Các Lượt Xem Quảng Cáo Gần Nhất ({adMetrics.records.length} Lượt)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Lịch sử xem video quảng cáo đối tác trong chu kỳ {adMetrics.label}.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-mono font-bold">
                {adMetrics.totalAds} Tổng lượt
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Thời Điểm</th>
                    <th className="py-2.5 px-3">Chiến Dịch Đối Tác</th>
                    <th className="py-2.5 px-3">Định Dạng</th>
                    <th className="py-2.5 px-3">Thời Lượng</th>
                    <th className="py-2.5 px-3">Phần Thưởng</th>
                    <th className="py-2.5 px-3 text-right">Tài Khoản</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {adMetrics.records.map(record => (
                    <tr key={record.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-stone-400 font-mono text-[11px]">
                        {new Date(record.timestamp).toLocaleDateString('vi-VN')} {new Date(record.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-white">
                        {record.adTitle}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {record.adType === 'rewarded_video' ? 'Video Thưởng' : 'Quảng Cáo'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-stone-300">
                        {record.durationSeconds}s
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                        +{record.rewardHours}h Premium
                      </td>
                      <td className="py-2.5 px-3 text-right text-stone-400 font-mono">
                        {record.userName || 'Thành viên'}
                      </td>
                    </tr>
                  ))}
                  {adMetrics.records.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500 italic">
                        Chưa có lượt xem quảng cáo nào trong chu kỳ này.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: REGISTERED ACCOUNTS & SESSIONS */}
      {adminTab === 'accounts' && (
        <div className="space-y-5">
          {/* Active Concurrent Sessions */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  Phiên Trực Tuyến Đang Hoạt Động (Active Browser Tabs & Sessions)
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Danh sách các tab / thiết bị gửi heartbeat định kỳ trong 15 giây qua.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                {userSessions.length} Người Dùng ({sessions.filter(s => s.role === 'admin').length} Admin)
              </span>
            </div>

            <div className="space-y-2">
              {sessions.map(s => (
                <div 
                  key={s.sessionId}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs ${
                    s.isCurrentTab 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-stone-950/80 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="relative flex h-2 w-2">
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span className="font-bold text-white truncate">{s.userName}</span>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                      s.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-stone-800 text-stone-300'
                    }`}>
                      {s.role === 'admin' ? 'ADMIN (KHÔNG TÍNH LÀ USER)' : s.role.toUpperCase()}
                    </span>
                    {s.isCurrentTab && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Tab Hiện Tại
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-stone-400 font-mono">
                    Tab: {s.activeTab || 'overview'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dual-Track User Database Metrics (Registered vs Guest Users) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                Thành Viên Đã Đăng Ký
              </span>
              <span className="text-xl font-black text-purple-400 mt-1 block font-mono">
                {dbStats.totalRegistered} Tài Khoản
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Dữ liệu lưu riêng biệt
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                Khách Vãng Lai (Dùng Thử)
              </span>
              <span className="text-xl font-black text-amber-400 mt-1 block font-mono">
                {dbStats.totalGuests} Phiên Dùng Thử
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Tự động lưu trên máy khách
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                Khách Có Thực Đơn Tuần
              </span>
              <span className="text-xl font-black text-emerald-400 mt-1 block font-mono">
                {dbStats.guestsWithCustomPlan} Phiên Đã Tạo
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Sẵn sàng giữ lại khi đăng ký
              </span>
            </div>

            <div className="p-4 rounded-3xl bg-stone-900 border border-stone-800 shadow-md">
              <span className="text-[10px] uppercase font-mono font-bold text-stone-400 block">
                Tỷ Lệ Thành Viên
              </span>
              <span className="text-xl font-black text-blue-400 mt-1 block font-mono">
                {dbStats.conversionRatePercent}%
              </span>
              <span className="text-[10px] text-stone-500 mt-0.5 block">
                Khách → Đã Đăng Ký
              </span>
            </div>
          </div>

          {/* Registered Accounts Table */}
          <div className="p-5 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-purple-400" />
                  Sổ Bộ Tài Khoản Thành Viên
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Danh sách tài khoản đã đăng ký và lưu trữ trong hệ thống Mealy.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold">
                {registeredAccounts.length} Tài Khoản
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-800 text-stone-400 font-mono text-[11px]">
                    <th className="py-2.5 px-3">Tên Thành Viên</th>
                    <th className="py-2.5 px-3">Email</th>
                    <th className="py-2.5 px-3">Vai Trò</th>
                    <th className="py-2.5 px-3">Ngày Đăng Ký</th>
                    <th className="py-2.5 px-3 text-right">Lượt Đăng Nhập</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/60">
                  {registeredAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-stone-800/40 transition-colors">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-[10px] text-amber-400 font-bold">
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{account.name}</span>
                      </td>
                      <td className="py-3 px-3 text-stone-300 font-mono">{account.email}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          account.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' 
                            : 'bg-stone-800 text-stone-300'
                        }`}>
                          {account.role === 'admin' ? 'Quản Trị Viên' : 'Thành Viên'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-stone-400 font-mono">{account.registeredAt}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-400">
                        {account.loginCount || 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: REAL TELEMETRY EVENT STREAM */}
      {adminTab === 'events' && (
        <div className="p-5 sm:p-6 rounded-3xl bg-stone-900 border border-stone-800 text-white shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <h3 className="text-base font-black text-white">
                Dòng Sự Kiện Thời Gian Thực
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 font-mono">
                {events.length} sự kiện
              </span>
              <button
                type="button"
                onClick={() => {
                  clearTelemetryEvents();
                  refreshTelemetry();
                }}
                className="p-1.5 rounded-xl bg-stone-800 hover:bg-rose-500/20 text-stone-400 hover:text-rose-300 transition-colors cursor-pointer"
                title="Xóa lịch sử sự kiện"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {events.map(ev => (
              <div 
                key={ev.id} 
                className="p-3 rounded-2xl bg-stone-950/80 border border-stone-800 flex items-center justify-between gap-3 text-xs animate-in fade-in duration-150"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="px-2 py-0.5 rounded-md bg-stone-800 text-stone-300 font-mono text-[10px] shrink-0">
                    {ev.timeStr}
                  </span>

                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold shrink-0 ${
                    ev.category === 'weekly' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    ev.category === 'collab' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                    ev.category === 'party' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                    ev.category === 'fridge' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  }`}>
                    {ev.badge}
                  </span>

                  <span className="px-1.5 py-0.5 rounded-md bg-stone-800/80 text-stone-400 text-[10px] shrink-0 font-medium font-mono">
                    {ev.actor}
                  </span>

                  <span className="text-stone-200 truncate font-medium">
                    {ev.action}
                  </span>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-stone-600 shrink-0" />
              </div>
            ))}

            {events.length === 0 && (
              <div className="p-8 text-center text-xs text-stone-500 italic">
                Chưa có sự kiện nào. Hãy thực hiện một thao tác trên app hoặc nhấn "Kiểm Tra Đồng Đội".
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: ADMIN RECIPE IMAGE MANAGER */}
      {adminTab === 'recipe_images' && (
        <AdminRecipeImageManager
          recipes={recipes}
          onStatusMessage={(msg) => {
            setSimulationStatus(msg);
            refreshTelemetry();
            setTimeout(() => setSimulationStatus(null), 4000);
          }}
        />
      )}

        </main>
      </div>
    </div>
  );
};
