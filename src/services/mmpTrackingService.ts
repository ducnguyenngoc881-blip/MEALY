/**
 * Mealy Unified MMP (Mobile Measurement Partner), Multi-SDK Attribution,
 * iOS ATT & SKAdNetwork 4.0 Conversion Engine, and Custom Product Pages (CPP) /
 * Custom Store Listings (CSL) Deep-Link Service.
 *
 * Supported Attribution & Ad Networks:
 * 1. AppsFlyer MMP (Primary Single Source of Truth + OneLink Deferred Deep Linking)
 * 2. Google Analytics for Firebase (GA4) & Google App Campaigns (Google AC)
 * 3. Meta SDK (Facebook App Events + Aggregated Event Measurement AEM + CAPI)
 * 4. TikTok Business SDK (TikTok App Events + SAN Attribution)
 * 5. Apple Search Ads (ASA AdServices Attribution Token)
 */

import { recordTelemetryEvent } from '../utils/telemetryEngine';
import { grantBonusAdFreePass } from '../utils/adTrackingService';

export type AttConsentStatus = 'not_determined' | 'restricted' | 'denied' | 'authorized';

export type SkanCoarseValue = 'low' | 'medium' | 'high';

export type SkanPostbackWindow = 1 | 2 | 3;

export type MealyEventKey =
  | 'app_open_first_time'
  | 'view_meal_set'
  | 'complete_onboarding'
  | 'claim_new_user_gift'
  | 'generate_weekly_plan'
  | 'add_fridge_barcode'
  | 'check_grocery_item'
  | 'register_otp_verified'
  | 'start_or_join_collab_room'
  | 'generate_vietqr_split'
  | 'plan_catering_party'
  | 'complete_rewarded_ad_sequence';

export interface SkanBitDefinition {
  bitIndex: 0 | 1 | 2 | 3 | 4 | 5;
  bitMask: 1 | 2 | 4 | 8 | 16 | 32;
  titleVi: string;
  descriptionVi: string;
  funnelStage: string;
  mappedEvents: MealyEventKey[];
}

export interface SkanConversionState {
  fineValue: number; // 0..63 (6-bit integer)
  binaryMask: string; // '000000'..'111111'
  coarseValue: SkanCoarseValue;
  coarseLabelVi: 'Thấp' | 'Trung Bình' | 'Cao';
  postbackWindow: SkanPostbackWindow;
  lockWindow: boolean;
  unlockedBits: number[];
  lastUpdatedAt: number;
  history: Array<{
    timestamp: number;
    prevFineValue: number;
    newFineValue: number;
    coarseValue: SkanCoarseValue;
    triggerEvent: string;
    lockWindow: boolean;
  }>;
}

export interface MultiSdkEventDefinition {
  key: MealyEventKey;
  titleVi: string;
  funnelStageVi: string;
  appsFlyerEvent: string;
  firebaseGa4Event: string;
  metaSdkEvent: string;
  tiktokSdkEvent: string;
  skanBitMask: 1 | 2 | 4 | 8 | 16 | 32;
  defaultParams: Record<string, string | number | boolean>;
  priorityRank: number; // 1 (highest) to 12
}

export interface DispatchedMmpEventRecord {
  id: string;
  eventId: string; // CAPI & MMP deduplication ID
  timestamp: number;
  timeStr: string;
  eventKey: MealyEventKey;
  titleVi: string;
  appsFlyerEvent: string;
  firebaseGa4Event: string;
  metaSdkEvent: string;
  tiktokSdkEvent: string;
  skanFineValueAfter: number;
  skanCoarseValueAfter: SkanCoarseValue;
  attStatus: AttConsentStatus;
  trackingMode: 'deterministic_idfa' | 'skadnetwork_privacy_safe';
  campaignSlug: string;
  params: Record<string, unknown>;
  skippedAsAdmin?: boolean;
}

export interface CppCslCampaignConfig {
  id: string; // e.g. 'CPP-01'
  cslId: string; // e.g. 'CSL-01'
  slug: string; // e.g. 'qua-tang-nguoi-moi'
  nameVi: string;
  posterFile: string;
  adHeadlineVi: string;
  storePromotionalTextVi: string;
  inAppBannerBadgeVi: string;
  inAppBannerTitleVi: string;
  inAppBannerSubtitleVi: string;
  inAppCtaLabelVi: string;
  targetTab: 'meal-sets' | 'weekly' | 'grocery' | 'pantry' | 'recipes' | 'party';
  recommendedTag?: string;
  grantsNewUserGift?: boolean;
  appStoreCppUrl: string;
  googlePlayCslUrl: string;
  deepLinkUri: string;
  webDeferredLink: string;
  googleAcAdGroup: string;
  appleSearchAdsKeywords: string[];
  metaTikTokHookVi: string;
}

const ATT_STATUS_STORAGE_KEY = 'mealwise_mmp_att_status_v1';
const SKAN_STATE_STORAGE_KEY = 'mealwise_mmp_skan_state_v1';
const MMP_EVENTS_LOG_STORAGE_KEY = 'mealwise_mmp_events_log_v1';
const ACTIVE_CAMPAIGN_STORAGE_KEY = 'mealwise_active_cpp_campaign_v1';
const NEW_USER_GIFT_CLAIMED_PREFIX = 'mealwise_new_user_gift_claimed_v1_';
const CAMPAIGN_INSTALL_STATS_KEY = 'mealwise_mmp_campaign_stats_v1';

const memoryMmpStore = new Map<string, string>();

function readMmpStorage(key: string): string | null {
  if (typeof localStorage !== 'undefined') {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) return val;
    } catch {}
  }
  return memoryMmpStore.get(key) ?? null;
}

function writeMmpStorage(key: string, value: string): void {
  memoryMmpStore.set(key, value);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch {}
  }
}

function removeMmpStorage(key: string): void {
  memoryMmpStore.delete(key);
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
}

/**
 * 6-Bit SKAdNetwork 4.0 Conversion Value Schema (0 to 63)
 * Combines 6 orthogonal product & monetization milestones into a monotonic 6-bit integer.
 */
export const SKAN_BIT_SCHEMA: SkanBitDefinition[] = [
  {
    bitIndex: 0,
    bitMask: 1,
    titleVi: 'Bit 0 (+1): Mở Ứng Dụng & Khám Phá Mâm Cơm',
    descriptionVi: 'Người dùng mở ứng dụng lần đầu và xem gợi ý mâm cơm 3 món.',
    funnelStage: 'D0 Activation',
    mappedEvents: ['app_open_first_time', 'view_meal_set']
  },
  {
    bitIndex: 1,
    bitMask: 2,
    titleVi: 'Bit 1 (+2): Khảo Sát Khẩu Vị & Quà Người Mới',
    descriptionVi: 'Hoàn tất khảo sát khẩu vị 3 miền hoặc nhận gói Quà Tặng Người Mới.',
    funnelStage: 'Onboarding & Gift',
    mappedEvents: ['complete_onboarding', 'claim_new_user_gift']
  },
  {
    bitIndex: 2,
    bitMask: 4,
    titleVi: 'Bit 2 (+4): Lên Thực Đơn 7 Ngày & Đặt Tiệc',
    descriptionVi: 'Tạo thực đơn tuần 21 bữa chuẩn ngân sách hoặc lên mâm cỗ tiệc.',
    funnelStage: 'Core Utility',
    mappedEvents: ['generate_weekly_plan', 'plan_catering_party']
  },
  {
    bitIndex: 3,
    bitMask: 8,
    titleVi: 'Bit 3 (+8): Tủ Lạnh Mã Vạch 893 & Giỏ Đi Chợ',
    descriptionVi: 'Quét mã vạch cất đồ vào tủ lạnh, đánh dấu giỏ đi chợ hoặc chia tiền VietQR.',
    funnelStage: 'Habit Retention',
    mappedEvents: ['add_fridge_barcode', 'check_grocery_item', 'generate_vietqr_split']
  },
  {
    bitIndex: 4,
    bitMask: 16,
    titleVi: 'Bit 4 (+16): Đăng Ký Tài Khoản & Xác Thực OTP',
    descriptionVi: 'Đăng ký thành viên chính thức và hoàn tất xác thực bảo mật OTP 6 số.',
    funnelStage: 'Identity Conversion',
    mappedEvents: ['register_otp_verified']
  },
  {
    bitIndex: 5,
    bitMask: 32,
    titleVi: 'Bit 5 (+32): Đi Chợ Chung & Mở Khóa Không Quảng Cáo',
    descriptionVi: 'Tạo/vào phòng Đi Chợ Chung thời gian thực hoặc xem đủ 3 video thưởng.',
    funnelStage: 'Viral & Monetization',
    mappedEvents: ['start_or_join_collab_room', 'complete_rewarded_ad_sequence']
  }
];

/**
 * Canonical 12 In-App Events Mapped Across AppsFlyer, Firebase GA4, Meta SDK, TikTok SDK & SKAN 4.0
 */
export const MMP_EVENT_CATALOG: Record<MealyEventKey, MultiSdkEventDefinition> = {
  app_open_first_time: {
    key: 'app_open_first_time',
    titleVi: 'Mở Ứng Dụng Lần Đầu & Khởi Tạo Phiên',
    funnelStageVi: 'Khởi Động',
    appsFlyerEvent: 'af_app_opened',
    firebaseGa4Event: 'first_open',
    metaSdkEvent: 'fb_mobile_activate_app',
    tiktokSdkEvent: 'LaunchAPP',
    skanBitMask: 1,
    defaultParams: { platform: 'mobile_app', country: 'VN', currency: 'VND' },
    priorityRank: 12
  },
  view_meal_set: {
    key: 'view_meal_set',
    titleVi: 'Xem Chi Tiết Mâm Cơm 3 Món',
    funnelStageVi: 'Khám Phá',
    appsFlyerEvent: 'af_content_view',
    firebaseGa4Event: 'view_item',
    metaSdkEvent: 'fb_mobile_content_view',
    tiktokSdkEvent: 'ViewContent',
    skanBitMask: 1,
    defaultParams: { content_type: 'meal_set_3_dishes', currency: 'VND' },
    priorityRank: 11
  },
  complete_onboarding: {
    key: 'complete_onboarding',
    titleVi: 'Hoàn Thành Khảo Sát Khẩu Vị & Ngân Sách',
    funnelStageVi: 'Khảo Sát Khẩu Vị',
    appsFlyerEvent: 'af_tutorial_completion',
    firebaseGa4Event: 'tutorial_complete',
    metaSdkEvent: 'fb_mobile_tutorial_completion',
    tiktokSdkEvent: 'CompleteTutorial',
    skanBitMask: 2,
    defaultParams: { step_count: 4, success: true },
    priorityRank: 6
  },
  claim_new_user_gift: {
    key: 'claim_new_user_gift',
    titleVi: 'Nhận Quà Tặng Người Mới 24h Không Quảng Cáo',
    funnelStageVi: 'Nhận Quà Chiến Dịch',
    appsFlyerEvent: 'af_claim_new_user_gift',
    firebaseGa4Event: 'unlock_achievement',
    metaSdkEvent: 'fb_mobile_achievement_unlocked',
    tiktokSdkEvent: 'UnlockAchievement',
    skanBitMask: 2,
    defaultParams: { gift_code: 'MEALY_NEW_USER_24H', reward_hours: 24, value_vnd: 25000 },
    priorityRank: 5
  },
  generate_weekly_plan: {
    key: 'generate_weekly_plan',
    titleVi: 'Khởi Tạo Thực Đơn 7 Ngày Chuẩn Ngân Sách',
    funnelStageVi: 'Thực Đơn Tuần',
    appsFlyerEvent: 'af_generate_weekly_plan',
    firebaseGa4Event: 'generate_lead',
    metaSdkEvent: 'Schedule',
    tiktokSdkEvent: 'GenerateMenu',
    skanBitMask: 4,
    defaultParams: { days: 7, meals_count: 21, currency: 'VND' },
    priorityRank: 4
  },
  add_fridge_barcode: {
    key: 'add_fridge_barcode',
    titleVi: 'Quét Mã Vạch 893 & Cất Đồ Vào Tủ Lạnh',
    funnelStageVi: 'Tủ Lạnh Thông Minh',
    appsFlyerEvent: 'af_add_to_fridge',
    firebaseGa4Event: 'add_to_wishlist',
    metaSdkEvent: 'fb_mobile_add_to_wishlist',
    tiktokSdkEvent: 'AddToWishlist',
    skanBitMask: 8,
    defaultParams: { barcode_prefix: '893', storage_zone: 'ngan_mat' },
    priorityRank: 7
  },
  check_grocery_item: {
    key: 'check_grocery_item',
    titleVi: 'Đánh Dấu Mua Nguyên Liệu Giỏ Đi Chợ',
    funnelStageVi: 'Giỏ Đi Chợ',
    appsFlyerEvent: 'af_grocery_checked',
    firebaseGa4Event: 'add_to_cart',
    metaSdkEvent: 'fb_mobile_add_to_cart',
    tiktokSdkEvent: 'AddToCart',
    skanBitMask: 8,
    defaultParams: { aisle_grouped: true, currency: 'VND' },
    priorityRank: 8
  },
  register_otp_verified: {
    key: 'register_otp_verified',
    titleVi: 'Đăng Ký Tài Khoản & Xác Thực OTP 6 Số',
    funnelStageVi: 'Chuyển Đổi Thành Viên',
    appsFlyerEvent: 'af_complete_registration',
    firebaseGa4Event: 'sign_up',
    metaSdkEvent: 'fb_mobile_complete_registration',
    tiktokSdkEvent: 'Registration',
    skanBitMask: 16,
    defaultParams: { method: 'email_otp_6_digits', otp_verified: true },
    priorityRank: 2
  },
  start_or_join_collab_room: {
    key: 'start_or_join_collab_room',
    titleVi: 'Tạo Hoặc Tham Gia Phòng Đi Chợ Chung',
    funnelStageVi: 'Đi Chợ Chung',
    appsFlyerEvent: 'af_collab_room_active',
    firebaseGa4Event: 'join_group',
    metaSdkEvent: 'Subscribe',
    tiktokSdkEvent: 'CreateGroup',
    skanBitMask: 32,
    defaultParams: { sync_mode: 'realtime_qr', ttl_minutes: 60 },
    priorityRank: 3
  },
  generate_vietqr_split: {
    key: 'generate_vietqr_split',
    titleVi: 'Sinh Mã VietQR Chia Tiền Đi Chợ Nhóm',
    funnelStageVi: 'Thanh Toán Nhóm',
    appsFlyerEvent: 'af_vietqr_bill_split',
    firebaseGa4Event: 'begin_checkout',
    metaSdkEvent: 'fb_mobile_initiated_checkout',
    tiktokSdkEvent: 'InitiateCheckout',
    skanBitMask: 8,
    defaultParams: { standard: 'NAPAS_247', currency: 'VND' },
    priorityRank: 9
  },
  plan_catering_party: {
    key: 'plan_catering_party',
    titleVi: 'Lên Thực Đơn Đặt Tiệc & Nhân Định Lượng',
    funnelStageVi: 'Đặt Tiệc Tại Gia',
    appsFlyerEvent: 'af_party_feast_planned',
    firebaseGa4Event: 'select_content',
    metaSdkEvent: 'CustomizeProduct',
    tiktokSdkEvent: 'CustomizeProduct',
    skanBitMask: 4,
    defaultParams: { courses: 5, currency: 'VND' },
    priorityRank: 10
  },
  complete_rewarded_ad_sequence: {
    key: 'complete_rewarded_ad_sequence',
    titleVi: 'Hoàn Thành 3 Video Thưởng Mở Khóa Không Quảng Cáo',
    funnelStageVi: 'Doanh Thu Quảng Cáo',
    appsFlyerEvent: 'af_ad_revenue_rewarded',
    firebaseGa4Event: 'ad_impression',
    metaSdkEvent: 'AdImpression',
    tiktokSdkEvent: 'WatchRewardedAd',
    skanBitMask: 32,
    defaultParams: { videos_watched: 3, revenue_vnd: 750, currency: 'VND', ad_free_hours: 24 },
    priorityRank: 1
  }
};

/**
 * Phase 2: 6 Custom Product Pages (CPP on App Store Connect) &
 * Custom Store Listings (CSL on Google Play Console) synchronized with
 * Poster 1-6, Google App Campaigns (Google AC), and Apple Search Ads (ASA).
 */
export const CPP_CSL_CAMPAIGNS: CppCslCampaignConfig[] = [
  {
    id: 'CPP-01',
    cslId: 'CSL-01',
    slug: 'qua-tang-nguoi-moi',
    nameVi: 'Quà Tặng Người Mới & Mâm Cơm 3 Món',
    posterFile: 'poster-01-mam-com-3-mon.png',
    adHeadlineVi: 'Tải Mealy Nhận Ngay Quà Tặng Người Mới: 24h Không Quảng Cáo & Bộ Thực Đơn 3 Miền!',
    storePromotionalTextVi: 'Ưu đãi người mới: Tải Mealy nhận ngay 24 giờ trải nghiệm không quảng cáo và mở khóa bộ thực đơn mâm cơm 3 món chuẩn vị Bắc - Trung - Nam!',
    inAppBannerBadgeVi: 'Quà Tặng Người Mới',
    inAppBannerTitleVi: 'Tặng Bạn 24 Giờ Không Quảng Cáo & Thực Đơn Đặc Quyền',
    inAppBannerSubtitleVi: 'Khớp thông điệp quảng cáo bạn vừa xem: Chạm nhận ngay gói trải nghiệm không quảng cáo và bộ mâm cơm 3 món yêu thích nhất.',
    inAppCtaLabelVi: 'Nhận Quà Ngay',
    targetTab: 'meal-sets',
    recommendedTag: 'Yêu Thích',
    grantsNewUserGift: true,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp01-qua-tang-nguoi-moi',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_qua_tang_nguoi_moi',
    deepLinkUri: 'mealy://campaign/qua-tang-nguoi-moi',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=qua-tang-nguoi-moi',
    googleAcAdGroup: 'GAC_VN_01_NewUserGift_3DishMealSet',
    appleSearchAdsKeywords: ['hôm nay ăn gì', 'gợi ý mâm cơm', 'app nấu ăn', 'mealy', 'cơm gia đình 3 món'],
    metaTikTokHookVi: 'Mở app nhận ngay 24h không quảng cáo + 300 mâm cơm 3 món khỏi nghĩ hôm nay ăn gì!'
  },
  {
    id: 'CPP-02',
    cslId: 'CSL-02',
    slug: 'thuc-don-7-ngay-95k',
    nameVi: 'Thực Đơn 7 Ngày Ngân Sách 95k',
    posterFile: 'poster-02-thuc-don-tuan.png',
    adHeadlineVi: 'Lên Thực Đơn 7 Ngày Chỉ Từ 95k/Ngày Cho Gia Đình 4 Người — Đổi Món 1 Chạm!',
    storePromotionalTextVi: 'Tự động cân đối 21 bữa ăn cả tuần bám sát ngân sách từ 95k/ngày cho gia đình Việt. Đổi món lẻ hoặc đổi nguyên ngày chỉ với 1 chạm!',
    inAppBannerBadgeVi: 'Chiến Dịch Thực Đơn Tuần',
    inAppBannerTitleVi: 'Thực Đơn 7 Ngày Tự Động Chuẩn Ngân Sách 95k/Ngày',
    inAppBannerSubtitleVi: 'Đã đồng bộ cấu hình thực đơn 21 bữa Sáng • Trưa • Tối không trùng món theo đúng ngân sách mục tiêu.',
    inAppCtaLabelVi: 'Mở Thực Đơn Tuần',
    targetTab: 'weekly',
    recommendedTag: 'Tiết Kiệm',
    grantsNewUserGift: false,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp02-thuc-don-7-ngay-95k',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_thuc_don_7_ngay_95k',
    deepLinkUri: 'mealy://campaign/thuc-don-7-ngay-95k',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=thuc-don-7-ngay-95k',
    googleAcAdGroup: 'GAC_VN_02_WeeklyBudget_95kFamily',
    appleSearchAdsKeywords: ['thực đơn 7 ngày', 'lên thực đơn tuần', 'tiết kiệm tiền chợ', 'cơm 95k', 'chi tiêu gia đình'],
    metaTikTokHookVi: 'Cầm 95k/ngày nấu đủ 3 món Mặn - Canh - Rau cho cả nhà 4 người suốt 7 ngày không trùng món!'
  },
  {
    id: 'CPP-03',
    cslId: 'CSL-03',
    slug: 'di-cho-chung-gia-dinh',
    nameVi: 'Đi Chợ Chung Gia Đình Thời Gian Thực',
    posterFile: 'poster-03-di-cho-chung.png',
    adHeadlineVi: 'Vợ Chồng Cùng Đi Siêu Thị Không Mua Trùng Đồ — Tự Động Gộp Giỏ & Chia Tiền QR!',
    storePromotionalTextVi: 'Tự động cộng gộp nguyên liệu cả tuần theo 5 quầy siêu thị. Tạo phòng Đi Chợ Chung bằng mã QR để gia đình cùng nhặt đồ thời gian thực!',
    inAppBannerBadgeVi: 'Chiến Dịch Đi Chợ Chung',
    inAppBannerTitleVi: 'Giỏ Đi Chợ Theo Quầy & Phòng Đi Chợ Chung Thời Gian Thực',
    inAppBannerSubtitleVi: 'Tự động gộp nguyên liệu từ thực đơn tuần, đồng bộ giỏ hàng trực tiếp cùng gia đình và chia tiền bằng mã QR.',
    inAppCtaLabelVi: 'Mở Giỏ Đi Chợ',
    targetTab: 'grocery',
    grantsNewUserGift: false,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp03-di-cho-chung',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_di_cho_chung_gia_dinh',
    deepLinkUri: 'mealy://campaign/di-cho-chung-gia-dinh',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=di-cho-chung-gia-dinh',
    googleAcAdGroup: 'GAC_VN_03_CollabGrocery_LiveSync',
    appleSearchAdsKeywords: ['danh sách đi chợ', 'đi chợ chung', 'mua sắm siêu thị', 'bách hóa xanh', 'chia tiền đi chợ'],
    metaTikTokHookVi: 'Nhờ chồng đi chợ không bao giờ mua thiếu hành ngò nhờ giỏ đi chợ đồng bộ thời gian thực!'
  },
  {
    id: 'CPP-04',
    cslId: 'CSL-04',
    slug: 'tu-lanh-thong-minh',
    nameVi: 'Nhắc Hạn Tủ Lạnh Thông Minh',
    posterFile: 'poster-04-tu-lanh-thong-minh.png',
    adHeadlineVi: 'Quét Mã Vạch 893 Cất Đồ Vào Tủ Lạnh — Nhắc Hạn Dùng & Gợi Ý Món Vét Tủ Lạnh!',
    storePromotionalTextVi: 'Theo dõi thực phẩm ngăn mát, ngăn đông, quét mã vạch siêu thị Việt Nam (893...) tự động điền hạn dùng và gợi ý món nấu ngay tránh lãng phí!',
    inAppBannerBadgeVi: 'Chiến Dịch Tủ Lạnh',
    inAppBannerTitleVi: 'Tủ Lạnh Thông Minh: Quét Mã Vạch 893 & Chống Lãng Phí',
    inAppBannerSubtitleVi: 'Kiểm kê thực phẩm ngăn mát - ngăn đông, cảnh báo nguyên liệu sắp hết hạn và gợi ý món nấu liền từ đồ sẵn có.',
    inAppCtaLabelVi: 'Mở Tủ Lạnh Ngay',
    targetTab: 'pantry',
    grantsNewUserGift: false,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp04-tu-lanh-thong-minh',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_tu_lanh_thong_minh',
    deepLinkUri: 'mealy://campaign/tu-lanh-thong-minh',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=tu-lanh-thong-minh',
    googleAcAdGroup: 'GAC_VN_04_SmartFridge_ZeroWaste',
    appleSearchAdsKeywords: ['quản lý tủ lạnh', 'nhắc hạn thực phẩm', 'nấu gì từ tủ lạnh', 'tiết kiệm thực phẩm', 'mã vạch siêu thị'],
    metaTikTokHookVi: 'Tủ lạnh còn nửa miếng đậu phụ và ít thịt băm? Bấm 1 nút ra ngay mâm cơm ngon không bỏ phí!'
  },
  {
    id: 'CPP-05',
    cslId: 'CSL-05',
    slug: 'eat-clean-so-bep',
    nameVi: 'Eat Clean, Tập Gym & Sổ Bếp Gia Đình',
    posterFile: 'poster-05-cong-thuc-chuan-vi.png',
    adHeadlineVi: 'Thực Đơn Eat Clean & Giàu Đạm Chuẩn Calo — Kèm Sổ Bếp Ghi Âm Bí Quyết Của Mẹ!',
    storePromotionalTextVi: 'Hơn 2.200 công thức tính sẵn Calo, Đạm, Tinh bột cho người tập Gym & Eat Clean. Tích hợp đọc giọng nói nấu rảnh tay và Sổ Bếp Gia Đình!',
    inAppBannerBadgeVi: 'Chiến Dịch Eat Clean & Sổ Bếp',
    inAppBannerTitleVi: 'Thực Đơn Eat Clean, Giàu Đạm & Sổ Bếp Gia Đình',
    inAppBannerSubtitleVi: 'Đã lọc sẵn thực đơn thanh lành kiểm soát Calo, kèm chế độ đọc từng bước nấu rảnh tay khi tay đang bận.',
    inAppCtaLabelVi: 'Khám Phá Eat Clean',
    targetTab: 'meal-sets',
    recommendedTag: 'Eat Clean',
    grantsNewUserGift: false,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp05-eat-clean-so-bep',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_eat_clean_so_bep',
    deepLinkUri: 'mealy://campaign/eat-clean-so-bep',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=eat-clean-so-bep',
    googleAcAdGroup: 'GAC_VN_05_EatClean_GymProtein',
    appleSearchAdsKeywords: ['thực đơn eat clean', 'món ăn tập gym', 'tính calo món việt', 'công thức nấu ăn', 'sổ bếp gia đình'],
    metaTikTokHookVi: 'Ăn cơm nhà Việt Nam mà vẫn giảm cân, giữ dáng chuẩn Calo với bộ lọc Eat Clean & Giàu Đạm!'
  },
  {
    id: 'CPP-06',
    cslId: 'CSL-06',
    slug: 'mam-co-tiec-sum-vay',
    nameVi: 'Thực Đơn Mâm Cỗ & Đặt Tiệc Tại Gia',
    posterFile: 'poster-06-mam-co-tiec.png',
    adHeadlineVi: '50+ Thực Đơn Mâm Cỗ Giỗ Tết & Tiệc Cuối Tuần — Tự Động Nhân Định Lượng Theo Số Mâm!',
    storePromotionalTextVi: 'Gợi ý thực đơn mâm cỗ truyền thống 3 miền, liên hoan 10–150 khách. Tự động tính số bàn, dự toán chi phí và nhắc lịch giỗ âm dương!',
    inAppBannerBadgeVi: 'Chiến Dịch Mâm Cỗ Tiệc',
    inAppBannerTitleVi: 'Trọn Vẹn Hương Vị Mâm Cỗ Sum Vầy & Tiệc Tại Gia',
    inAppBannerSubtitleVi: 'Lên thực đơn 5 món đãi khách, tự động nhân khối lượng nguyên liệu theo số bàn và đẩy thẳng sang giỏ đi chợ.',
    inAppCtaLabelVi: 'Mở Thực Đơn Tiệc',
    targetTab: 'party',
    grantsNewUserGift: false,
    appStoreCppUrl: 'https://apps.apple.com/vn/app/mealy-thuc-don-di-cho/id6739012345?ppid=cpp06-mam-co-tiec',
    googlePlayCslUrl: 'https://play.google.com/store/apps/details?id=vn.mealwise.app&listing=csl_mam_co_tiec_sum_vay',
    deepLinkUri: 'mealy://campaign/mam-co-tiec-sum-vay',
    webDeferredLink: 'https://exia9526.github.io/MEALY/?cpp=mam-co-tiec-sum-vay',
    googleAcAdGroup: 'GAC_VN_06_PartyFeast_Catering',
    appleSearchAdsKeywords: ['mâm cỗ miền bắc', 'thực đơn đãi tiệc', 'nấu cỗ tại nhà', 'lịch giỗ âm lịch', 'tiệc gia đình'],
    metaTikTokHookVi: 'Nhà có giỗ hay liên hoan 30 khách? Chọn mẫu mâm cỗ 1 chạm, tự tính tiền chợ và số bàn!'
  }
];

/**
 * Official SKAdNetwork IDs configured in ios/App/App/Info.plist
 */
export const OFFICIAL_SKADNETWORK_IDS = [
  { network: 'Google Ads (Google AC)', skanId: 'cstr6suwn9.skadnetwork' },
  { network: 'Meta Ads (Primary)', skanId: 'v9wttpbfk9.skadnetwork' },
  { network: 'Meta Ads (Secondary)', skanId: 'n38lu8286q.skadnetwork' },
  { network: 'TikTok For Business (Primary)', skanId: '22mmun2rn5.skadnetwork' },
  { network: 'TikTok For Business (SAN)', skanId: '238da6jt44.skadnetwork' },
  { network: 'AppsFlyer Attribution', skanId: '4pfyvq9l8r.skadnetwork' },
  { network: 'AppLovin Mediation', skanId: 'ludvb6z3bs.skadnetwork' },
  { network: 'Unity Ads', skanId: '4dzt52r2t5.skadnetwork' },
  { network: 'ironSource Mediation', skanId: 'su67r6k2v3.skadnetwork' },
  { network: 'Vungle / Liftoff', skanId: 'gta9lk7p23.skadnetwork' }
] as const;

/**
 * Sanitize string parameter to prevent XSS / script injection in telemetry & MMP logs
 */
export function sanitizeMmpParam(raw: unknown): string {
  if (raw === null || raw === undefined) return '';
  return String(raw)
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 160);
}

/**
 * Strict Admin Exemption Check:
 * Administrator account (admin@mealwise.vn, admin@mealwise.com, or role === 'admin')
 * MUST NEVER be tracked as an end-user in MMP events, SDK dispatches, or SKAN metrics.
 */
export function isAdminAttributionExempt(actorOrEmail?: string | null, role?: string | null): boolean {
  if (role && role.toLowerCase() === 'admin') return true;
  if (actorOrEmail) {
    const lower = actorOrEmail.trim().toLowerCase();
    if (
      lower === 'admin@mealwise.vn' ||
      lower === 'admin@mealwise.com' ||
      lower === 'admin' ||
      lower.includes('admin@mealwise') ||
      lower.includes('quản trị viên') ||
      lower.includes('mealwise administrator')
    ) {
      return true;
    }
  }
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const currentRaw = localStorage.getItem('mealwise_registered_user');
      if (currentRaw) {
        const parsed = JSON.parse(currentRaw);
        const emailLower = String(parsed?.email || '').toLowerCase();
        if (
          parsed?.role === 'admin' ||
          emailLower === 'admin@mealwise.vn' ||
          emailLower === 'admin@mealwise.com'
        ) {
          // Only exempt if no explicit non-admin actor was passed
          if (!actorOrEmail && !role) {
            return true;
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
  }
  return false;
}

/**
 * Get current iOS ATT (App Tracking Transparency) status
 */
export function getAttConsentStatus(): AttConsentStatus {
  try {
    const raw = readMmpStorage(ATT_STATUS_STORAGE_KEY);
    if (raw === 'authorized' || raw === 'denied' || raw === 'restricted' || raw === 'not_determined') {
      return raw;
    }
  } catch {
    // Fallback
  }
  return 'not_determined';
}

/**
 * Set or update iOS ATT status and sync privacy-safe SDK flags
 */
export function setAttConsentStatus(status: AttConsentStatus): AttConsentStatus {
  const validStatus: AttConsentStatus =
    status === 'authorized' || status === 'denied' || status === 'restricted' || status === 'not_determined'
      ? status
      : 'not_determined';

  writeMmpStorage(ATT_STATUS_STORAGE_KEY, validStatus);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(
        new CustomEvent('mealwise:att_status_changed', { detail: { status: validStatus } })
      );
    } catch {
      // Ignore event errors
    }
  }
  return validStatus;
}

/**
 * Request iOS App Tracking Transparency permission.
 * Strictly adheres to Apple Guideline 5.1.2(i):
 * - Never gates app functionality or New User Gift on ATT approval.
 * - Transitions from 'not_determined' to user's choice ('authorized' | 'denied').
 */
export function requestAttPermission(userChoice: 'authorized' | 'denied' = 'authorized'): AttConsentStatus {
  const resolved: AttConsentStatus = userChoice === 'authorized' ? 'authorized' : 'denied';
  return setAttConsentStatus(resolved);
}

/**
 * Returns privacy-safe device attribution context according to current ATT state.
 * When ATT is NOT 'authorized', IDFA is strictly null / zeroed out and SKAdNetwork + AEM mode is enforced.
 */
export function getPrivacySafeAttributionContext(overrideAttStatus?: AttConsentStatus) {
  const attStatus = overrideAttStatus || getAttConsentStatus();
  const isAuthorized = attStatus === 'authorized';

  return {
    attStatus,
    idfaAllowed: isAuthorized,
    idfa: isAuthorized ? 'IDFA-VN-8F92A1C0-4B1E-49E2-A73D-MEALY2026' : null,
    zeroedIdfa: '00000000-0000-0000-0000-000000000000',
    idfv: 'IDFV-VN-MEALY-FIRST-PARTY-2026',
    gaid: isAuthorized ? 'GAID-VN-7C41D9B2-ANDROID-MEALY2026' : null,
    asaTokenAvailable: true, // Apple AdServices token works without ATT per Apple documentation
    skadnetworkActive: true,
    aemAggregatedMode: !isAuthorized,
    trackingMode: (isAuthorized ? 'deterministic_idfa' : 'skadnetwork_privacy_safe') as
      | 'deterministic_idfa'
      | 'skadnetwork_privacy_safe'
  };
}

/**
 * Map a 6-bit SKAdNetwork 4.0 Fine Value (0..63) to Coarse Value ('low' | 'medium' | 'high')
 */
export function calculateSkanCoarseValue(fineValue: number): {
  coarseValue: SkanCoarseValue;
  coarseLabelVi: 'Thấp' | 'Trung Bình' | 'Cao';
} {
  const safeVal = Number.isFinite(fineValue) ? Math.max(0, Math.min(63, Math.floor(fineValue))) : 0;
  if (safeVal >= 16) {
    return { coarseValue: 'high', coarseLabelVi: 'Cao' };
  }
  if (safeVal >= 4) {
    return { coarseValue: 'medium', coarseLabelVi: 'Trung Bình' };
  }
  return { coarseValue: 'low', coarseLabelVi: 'Thấp' };
}

/**
 * Format 6-bit integer (0..63) into 6-character binary representation (e.g. 5 -> '000101')
 */
export function formatSkanBinaryMask(fineValue: number): string {
  const safeVal = Number.isFinite(fineValue) ? Math.max(0, Math.min(63, Math.floor(fineValue))) : 0;
  return safeVal.toString(2).padStart(6, '0');
}

/**
 * Extract list of unlocked bit masks [1, 2, 4, 8, 16, 32] from fineValue
 */
export function extractUnlockedSkanBits(fineValue: number): number[] {
  const safeVal = Number.isFinite(fineValue) ? Math.max(0, Math.min(63, Math.floor(fineValue))) : 0;
  const bits: number[] = [];
  for (const def of SKAN_BIT_SCHEMA) {
    if ((safeVal & def.bitMask) === def.bitMask) {
      bits.push(def.bitMask);
    }
  }
  return bits;
}

/**
 * Load current SKAdNetwork 4.0 Conversion Value State
 */
export function getSkanConversionState(): SkanConversionState {
  const defaultState: SkanConversionState = {
    fineValue: 1, // Bit 0 (+1) unlocked on app launch
    binaryMask: '000001',
    coarseValue: 'low',
    coarseLabelVi: 'Thấp',
    postbackWindow: 1,
    lockWindow: false,
    unlockedBits: [1],
    lastUpdatedAt: Date.now(),
    history: []
  };

  try {
    const raw = readMmpStorage(SKAN_STATE_STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    const safeFine = Number.isFinite(parsed?.fineValue)
      ? Math.max(0, Math.min(63, Math.floor(parsed.fineValue)))
      : 1;
    const { coarseValue, coarseLabelVi } = calculateSkanCoarseValue(safeFine);
    return {
      fineValue: safeFine,
      binaryMask: formatSkanBinaryMask(safeFine),
      coarseValue,
      coarseLabelVi,
      postbackWindow: parsed?.postbackWindow === 2 || parsed?.postbackWindow === 3 ? parsed.postbackWindow : 1,
      lockWindow: Boolean(parsed?.lockWindow || safeFine >= 48),
      unlockedBits: extractUnlockedSkanBits(safeFine),
      lastUpdatedAt: typeof parsed?.lastUpdatedAt === 'number' ? parsed.lastUpdatedAt : Date.now(),
      history: Array.isArray(parsed?.history) ? parsed.history.slice(0, 30) : []
    };
  } catch {
    return defaultState;
  }
}

/**
 * Update SKAdNetwork 4.0 Conversion Value monotonically (Fine Value NEVER decreases!).
 * Supports bitwise OR accumulation (bitMask in 1..63) and SKAN 4.0 LockWindow when high-value threshold (>= 48) is reached.
 */
export function updateSkanConversionValue(
  bitMaskOrValue: number,
  triggerEvent: string = 'manual_update',
  actorOrEmail?: string,
  role?: string
): SkanConversionState {
  const current = getSkanConversionState();

  // Admin account exemption: never alter SKAN state for admin actions
  if (isAdminAttributionExempt(actorOrEmail, role)) {
    return current;
  }

  const sanitizedBits = Number.isFinite(bitMaskOrValue)
    ? Math.max(0, Math.min(63, Math.floor(bitMaskOrValue)))
    : 0;

  // Monotonic bitwise OR + max guarantee: fineValue is strictly non-decreasing in [0, 63]
  const nextFineValue = Math.min(63, Math.max(current.fineValue, current.fineValue | sanitizedBits));
  const { coarseValue, coarseLabelVi } = calculateSkanCoarseValue(nextFineValue);
  const lockWindow = current.lockWindow || nextFineValue >= 48;
  const now = Date.now();

  const updatedHistory =
    nextFineValue !== current.fineValue || current.history.length === 0
      ? [
          {
            timestamp: now,
            prevFineValue: current.fineValue,
            newFineValue: nextFineValue,
            coarseValue,
            triggerEvent: sanitizeMmpParam(triggerEvent) || 'skan_update',
            lockWindow
          },
          ...current.history
        ].slice(0, 30)
      : current.history;

  const updatedState: SkanConversionState = {
    fineValue: nextFineValue,
    binaryMask: formatSkanBinaryMask(nextFineValue),
    coarseValue,
    coarseLabelVi,
    postbackWindow: current.postbackWindow,
    lockWindow,
    unlockedBits: extractUnlockedSkanBits(nextFineValue),
    lastUpdatedAt: now,
    history: updatedHistory
  };

  writeMmpStorage(SKAN_STATE_STORAGE_KEY, JSON.stringify(updatedState));

  return updatedState;
}

/**
 * Reset SKAdNetwork state (used for QA / testing in Admin Dashboard)
 */
export function resetSkanConversionState(): SkanConversionState {
  const fresh: SkanConversionState = {
    fineValue: 1,
    binaryMask: '000001',
    coarseValue: 'low',
    coarseLabelVi: 'Thấp',
    postbackWindow: 1,
    lockWindow: false,
    unlockedBits: [1],
    lastUpdatedAt: Date.now(),
    history: []
  };
  writeMmpStorage(SKAN_STATE_STORAGE_KEY, JSON.stringify(fresh));
  return fresh;
}

/**
 * Parse campaign slug from URL search params or deep link URI (`?cpp=`, `?csl=`, `?listing=`, `?utm_campaign=`, `mealy://campaign/`)
 */
export function parseCampaignFromUrl(urlOrSearch?: string): CppCslCampaignConfig | null {
  let rawQuery = urlOrSearch;
  if (rawQuery === undefined && typeof window !== 'undefined' && window.location) {
    rawQuery = `${window.location.search || ''} ${window.location.hash || ''}`;
  }
  if (!rawQuery || typeof rawQuery !== 'string') return null;

  const clean = sanitizeMmpParam(rawQuery).toLowerCase();
  if (!clean) return null;

  // Match mealy://campaign/<slug>
  const schemeMatch = clean.match(/mealy:\/\/(?:campaign|cpp|csl)\/([a-z0-9_-]+)/i);
  if (schemeMatch && schemeMatch[1]) {
    const foundByScheme = findCampaignByIdentifier(schemeMatch[1]);
    if (foundByScheme) return foundByScheme;
  }

  // Extract query string part if full URL passed
  const queryStart = clean.indexOf('?');
  const searchPart = queryStart >= 0 ? clean.slice(queryStart) : clean;
  try {
    const params = new URLSearchParams(searchPart.startsWith('?') ? searchPart : `?${searchPart}`);
    const candidateKeys = ['cpp', 'csl', 'listing', 'ppid', 'deep_link_value', 'utm_campaign', 'campaign'];
    for (const key of candidateKeys) {
      const val = params.get(key);
      if (val) {
        const matched = findCampaignByIdentifier(val);
        if (matched) return matched;
      }
    }
  } catch {
    // Fallback substring match
  }

  return null;
}

/**
 * Find a CPP/CSL campaign config by ID ('CPP-01'), CSL ID ('CSL-01'), slug ('qua-tang-nguoi-moi'), or alias
 */
export function findCampaignByIdentifier(identifier: string): CppCslCampaignConfig | null {
  if (!identifier || typeof identifier !== 'string') return null;
  const norm = sanitizeMmpParam(identifier).toLowerCase().replace(/^csl_|^cpp\d+-/i, '');

  for (const camp of CPP_CSL_CAMPAIGNS) {
    if (
      camp.slug.toLowerCase() === norm ||
      camp.id.toLowerCase() === norm ||
      camp.cslId.toLowerCase() === norm ||
      camp.googleAcAdGroup.toLowerCase() === norm ||
      norm.includes(camp.slug.toLowerCase())
    ) {
      return camp;
    }
  }

  // Friendly aliases
  if (norm.includes('new_user') || norm.includes('qua-tang') || norm.includes('gift')) {
    return CPP_CSL_CAMPAIGNS[0];
  }
  if (norm.includes('95k') || norm.includes('weekly') || norm.includes('thuc-don-7-ngay')) {
    return CPP_CSL_CAMPAIGNS[1];
  }
  if (norm.includes('collab') || norm.includes('di-cho-chung')) {
    return CPP_CSL_CAMPAIGNS[2];
  }
  if (norm.includes('fridge') || norm.includes('tu-lanh')) {
    return CPP_CSL_CAMPAIGNS[3];
  }
  if (norm.includes('eat-clean') || norm.includes('eat_clean') || norm.includes('gym')) {
    return CPP_CSL_CAMPAIGNS[4];
  }
  if (norm.includes('party') || norm.includes('mam-co') || norm.includes('tiec')) {
    return CPP_CSL_CAMPAIGNS[5];
  }

  return null;
}

/**
 * Get the currently active CPP/CSL Campaign (auto-detecting URL parameters first, then localStorage, defaulting to CPP-01)
 */
export function getActiveCampaign(): CppCslCampaignConfig {
  const fromUrl = parseCampaignFromUrl();
  if (fromUrl) {
    writeMmpStorage(ACTIVE_CAMPAIGN_STORAGE_KEY, fromUrl.slug);
    return fromUrl;
  }

  try {
    const savedSlug = readMmpStorage(ACTIVE_CAMPAIGN_STORAGE_KEY);
    if (savedSlug) {
      const matched = findCampaignByIdentifier(savedSlug);
      if (matched) return matched;
    }
  } catch {}

  return CPP_CSL_CAMPAIGNS[0];
}

/**
 * Explicitly switch the active CPP/CSL Campaign (for deep-link routing or previewing in Account/Admin)
 */
export function setActiveCampaignBySlug(
  slugOrId: string,
  actorOrEmail?: string,
  role?: string
): CppCslCampaignConfig {
  const matched = findCampaignByIdentifier(slugOrId) || CPP_CSL_CAMPAIGNS[0];
  writeMmpStorage(ACTIVE_CAMPAIGN_STORAGE_KEY, matched.slug);
  if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
    try {
      window.dispatchEvent(new CustomEvent('mealwise:campaign_changed', { detail: matched }));
    } catch {}
  }

  if (!isAdminAttributionExempt(actorOrEmail, role)) {
    incrementCampaignInstallCount(matched.slug);
  }

  return matched;
}

/**
 * Track per-campaign attribution counts
 */
export function getCampaignAttributionStats(): Record<string, { installs: number; conversions: number }> {
  const defaults: Record<string, { installs: number; conversions: number }> = {
    'qua-tang-nguoi-moi': { installs: 428, conversions: 196 },
    'thuc-don-7-ngay-95k': { installs: 385, conversions: 174 },
    'di-cho-chung-gia-dinh': { installs: 294, conversions: 142 },
    'tu-lanh-thong-minh': { installs: 260, conversions: 118 },
    'eat-clean-so-bep': { installs: 215, conversions: 98 },
    'mam-co-tiec-sum-vay': { installs: 168, conversions: 79 }
  };

  try {
    const raw = readMmpStorage(CAMPAIGN_INSTALL_STATS_KEY);
    if (!raw) {
      writeMmpStorage(CAMPAIGN_INSTALL_STATS_KEY, JSON.stringify(defaults));
      return defaults;
    }
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

export function incrementCampaignInstallCount(slug: string, isConversion = false): void {
  try {
    const current = getCampaignAttributionStats();
    const entry = current[slug] || { installs: 0, conversions: 0 };
    entry.installs += 1;
    if (isConversion) entry.conversions += 1;
    current[slug] = entry;
    writeMmpStorage(CAMPAIGN_INSTALL_STATS_KEY, JSON.stringify(current));
  } catch {}
}

/**
 * Check if the user has already claimed the New User Gift ('CPP-01: Quà Tặng Người Mới')
 */
export function hasClaimedNewUserGift(email?: string | null): boolean {
  try {
    const scopeKey = email ? email.trim().toLowerCase() : 'guest_device';
    return readMmpStorage(`${NEW_USER_GIFT_CLAIMED_PREFIX}${scopeKey}`) === 'true';
  } catch {
    return false;
  }
}

/**
 * Claim the New User Gift ('Quà Tặng Người Mới'):
 * 1. Unlocks 24h Ad-Free experience immediately
 * 2. Marks gift claimed for this user/device
 * 3. Fires canonical 'claim_new_user_gift' event across AppsFlyer, Firebase GA4, Meta SDK, TikTok SDK & SKAN 4.0 (+2 bit)
 */
export function claimNewUserGift(
  email?: string | null,
  actorName: string = 'Thành viên mới',
  role?: string | null
): {
  claimed: boolean;
  alreadyClaimed: boolean;
  adFreeUnlockedHours: number;
  eventRecord: DispatchedMmpEventRecord;
} {
  const already = hasClaimedNewUserGift(email);
  const scopeKey = email ? email.trim().toLowerCase() : 'guest_device';

  writeMmpStorage(`${NEW_USER_GIFT_CLAIMED_PREFIX}${scopeKey}`, 'true');

  // Unlock 24h Ad-Free reward unless admin (without fabricating fake video ad impressions)
  if (!isAdminAttributionExempt(email || actorName, role)) {
    grantBonusAdFreePass(24);
  }

  const eventRecord = trackMmpEvent(
    'claim_new_user_gift',
    {
      gift_slug: 'qua-tang-nguoi-moi',
      already_claimed: already,
      reward_ad_free_hours: 24
    },
    actorName,
    email || undefined,
    role || undefined
  );

  return {
    claimed: true,
    alreadyClaimed: already,
    adFreeUnlockedHours: 24,
    eventRecord
  };
}

/**
 * Dispatch an in-app event simultaneously to:
 * - AppsFlyer MMP (Client SDK + S2S deduplicated event_id)
 * - Google Analytics for Firebase (GA4 / Google App Campaigns)
 * - Meta SDK (App Events + AEM + CAPI)
 * - TikTok Business SDK
 * - iOS SKAdNetwork 4.0 Conversion Value Engine
 */
export function trackMmpEvent(
  eventKey: MealyEventKey,
  customParams: Record<string, unknown> = {},
  actorName: string = 'Người dùng',
  userEmail?: string,
  userRole?: string
): DispatchedMmpEventRecord {
  const def = MMP_EVENT_CATALOG[eventKey] || MMP_EVENT_CATALOG.app_open_first_time;
  const now = Date.now();
  const d = new Date(now);
  const timeStr = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
  const deduplicationEventId = `mmp_${eventKey}_${now}_${Math.random().toString(36).substring(2, 7)}`;

  const privacyCtx = getPrivacySafeAttributionContext();
  const activeCampaign = getActiveCampaign();

  // Sanitize all custom parameters
  const sanitizedParams: Record<string, unknown> = {
    ...def.defaultParams,
    cpp_id: activeCampaign.id,
    csl_id: activeCampaign.cslId,
    campaign_slug: activeCampaign.slug,
    att_status: privacyCtx.attStatus,
    tracking_mode: privacyCtx.trackingMode
  };

  for (const [k, v] of Object.entries(customParams || {})) {
    const cleanKey = sanitizeMmpParam(k);
    if (!cleanKey) continue;
    if (typeof v === 'number' && Number.isFinite(v)) {
      sanitizedParams[cleanKey] = v;
    } else if (typeof v === 'boolean') {
      sanitizedParams[cleanKey] = v;
    } else {
      sanitizedParams[cleanKey] = sanitizeMmpParam(v);
    }
  }

  // Strip any PII when ATT is not authorized
  if (!privacyCtx.idfaAllowed) {
    delete sanitizedParams.email;
    delete sanitizedParams.phone;
    delete sanitizedParams.raw_user_id;
  }

  // Check Admin Exemption Invariant
  if (isAdminAttributionExempt(userEmail || actorName, userRole)) {
    const currentSkan = getSkanConversionState();
    return {
      id: `mmp-admin-skip-${now}`,
      eventId: deduplicationEventId,
      timestamp: now,
      timeStr,
      eventKey: def.key,
      titleVi: def.titleVi,
      appsFlyerEvent: def.appsFlyerEvent,
      firebaseGa4Event: def.firebaseGa4Event,
      metaSdkEvent: def.metaSdkEvent,
      tiktokSdkEvent: def.tiktokSdkEvent,
      skanFineValueAfter: currentSkan.fineValue,
      skanCoarseValueAfter: currentSkan.coarseValue,
      attStatus: privacyCtx.attStatus,
      trackingMode: privacyCtx.trackingMode,
      campaignSlug: activeCampaign.slug,
      params: sanitizedParams,
      skippedAsAdmin: true
    };
  }

  // 1. Update SKAdNetwork 4.0 Conversion Value monotonically
  const updatedSkan = updateSkanConversionValue(
    def.skanBitMask,
    def.appsFlyerEvent,
    userEmail || actorName,
    userRole
  );

  const record: DispatchedMmpEventRecord = {
    id: `mmp-ev-${now}-${Math.random().toString(36).substring(2, 6)}`,
    eventId: deduplicationEventId,
    timestamp: now,
    timeStr,
    eventKey: def.key,
    titleVi: def.titleVi,
    appsFlyerEvent: def.appsFlyerEvent,
    firebaseGa4Event: def.firebaseGa4Event,
    metaSdkEvent: def.metaSdkEvent,
    tiktokSdkEvent: def.tiktokSdkEvent,
    skanFineValueAfter: updatedSkan.fineValue,
    skanCoarseValueAfter: updatedSkan.coarseValue,
    attStatus: privacyCtx.attStatus,
    trackingMode: privacyCtx.trackingMode,
    campaignSlug: activeCampaign.slug,
    params: sanitizedParams,
    skippedAsAdmin: false
  };

  if (typeof window !== 'undefined') {
    try {
      // Persist to MMP Event Log (keep latest 60 records)
      const savedRaw = localStorage.getItem(MMP_EVENTS_LOG_STORAGE_KEY);
      const existing: DispatchedMmpEventRecord[] = savedRaw ? JSON.parse(savedRaw) : [];
      const nextList = [record, ...(Array.isArray(existing) ? existing : [])].slice(0, 60);
      localStorage.setItem(MMP_EVENTS_LOG_STORAGE_KEY, JSON.stringify(nextList));

      // Dispatch to native/web SDK bridges if attached on window
      const win = window as unknown as Record<string, any>;
      if (typeof win.AF === 'function') {
        win.AF('pba', 'event', {
          eventType: 'EVENT',
          eventName: def.appsFlyerEvent,
          eventValue: sanitizedParams
        });
      }
      if (typeof win.gtag === 'function') {
        win.gtag('event', def.firebaseGa4Event, sanitizedParams);
      }
      if (typeof win.fbq === 'function') {
        win.fbq('trackCustom', def.metaSdkEvent, sanitizedParams, { eventID: deduplicationEventId });
      }
      if (typeof win.ttq?.track === 'function') {
        win.ttq.track(def.tiktokSdkEvent, sanitizedParams);
      }

      // Broadcast custom event for live Admin Dashboard & UI listeners
      window.dispatchEvent(new CustomEvent('mealwise:mmp_event', { detail: record }));
    } catch {
      // Never break app flow on telemetry storage errors
    }
  }

  // Also record high-priority conversion milestones to core telemetry stream
  if (def.priorityRank <= 6) {
    recordTelemetryEvent(
      eventKey === 'register_otp_verified' || eventKey === 'claim_new_user_gift'
        ? 'auth'
        : eventKey === 'start_or_join_collab_room'
        ? 'collab'
        : 'weekly',
      `[MMP • ${def.appsFlyerEvent}] ${def.titleVi} (SKAN CV=${updatedSkan.fineValue} • ${updatedSkan.coarseLabelVi})`,
      actorName
    );
  }

  return record;
}

/**
 * Retrieve recent dispatched MMP & Multi-SDK events
 */
export function getRecentMmpEvents(limit = 25): DispatchedMmpEventRecord[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  try {
    const saved = localStorage.getItem(MMP_EVENTS_LOG_STORAGE_KEY);
    if (!saved) {
      const activeCamp = getActiveCampaign();
      const seeded: DispatchedMmpEventRecord[] = [
        {
          id: 'mmp-seed-1',
          eventId: 'mmp_seed_open_1',
          timestamp: Date.now() - 180000,
          timeStr: '3m trước',
          eventKey: 'app_open_first_time',
          titleVi: 'Mở Ứng Dụng Lần Đầu & Khởi Tạo Phiên',
          appsFlyerEvent: 'af_app_opened',
          firebaseGa4Event: 'first_open',
          metaSdkEvent: 'fb_mobile_activate_app',
          tiktokSdkEvent: 'LaunchAPP',
          skanFineValueAfter: 1,
          skanCoarseValueAfter: 'low',
          attStatus: getAttConsentStatus(),
          trackingMode: getPrivacySafeAttributionContext().trackingMode,
          campaignSlug: activeCamp.slug,
          params: { cpp_id: activeCamp.id, csl_id: activeCamp.cslId, country: 'VN' }
        },
        {
          id: 'mmp-seed-2',
          eventId: 'mmp_seed_plan_2',
          timestamp: Date.now() - 95000,
          timeStr: '1m trước',
          eventKey: 'generate_weekly_plan',
          titleVi: 'Khởi Tạo Thực Đơn 7 Ngày Chuẩn Ngân Sách',
          appsFlyerEvent: 'af_generate_weekly_plan',
          firebaseGa4Event: 'generate_lead',
          metaSdkEvent: 'Schedule',
          tiktokSdkEvent: 'GenerateMenu',
          skanFineValueAfter: 5,
          skanCoarseValueAfter: 'medium',
          attStatus: getAttConsentStatus(),
          trackingMode: getPrivacySafeAttributionContext().trackingMode,
          campaignSlug: activeCamp.slug,
          params: { days: 7, meals_count: 21, budget_target: 95000 }
        }
      ];
      localStorage.setItem(MMP_EVENTS_LOG_STORAGE_KEY, JSON.stringify(seeded));
      return seeded.slice(0, limit);
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.slice(0, limit) : [];
  } catch {
    return [];
  }
}

/**
 * Clear MMP event logs
 */
export function clearMmpEventLogs(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  try {
    localStorage.removeItem(MMP_EVENTS_LOG_STORAGE_KEY);
  } catch {}
}
