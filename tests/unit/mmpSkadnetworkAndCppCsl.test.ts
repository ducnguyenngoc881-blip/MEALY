import fs from 'fs';
import path from 'path';
import { describe, it, expect } from '../helpers/testRunner';
import {
  SKAN_BIT_SCHEMA,
  MMP_EVENT_CATALOG,
  CPP_CSL_CAMPAIGNS,
  OFFICIAL_SKADNETWORK_IDS,
  getAttConsentStatus,
  setAttConsentStatus,
  requestAttPermission,
  getPrivacySafeAttributionContext,
  calculateSkanCoarseValue,
  formatSkanBinaryMask,
  getSkanConversionState,
  updateSkanConversionValue,
  resetSkanConversionState,
  parseCampaignFromUrl,
  findCampaignByIdentifier,
  getActiveCampaign,
  setActiveCampaignBySlug,
  hasClaimedNewUserGift,
  claimNewUserGift,
  trackMmpEvent,
  getRecentMmpEvents,
  clearMmpEventLogs,
  isAdminAttributionExempt,
  sanitizeMmpParam
} from '../../src/services/mmpTrackingService';
import { isUserAdFree } from '../../src/utils/adTrackingService';

describe('Unit: MMP, Multi-SDK (GA4/Meta/TikTok), iOS ATT/SKAN 4.0 & CPP/CSL Suite', () => {
  it('MMP-01: Validates all 12 canonical In-App Events map simultaneously to AppsFlyer, Firebase GA4, Meta SDK, TikTok SDK & SKAN 4.0', () => {
    const keys = Object.keys(MMP_EVENT_CATALOG);
    expect(keys.length).toBe(12);

    for (const key of keys) {
      const def = MMP_EVENT_CATALOG[key as keyof typeof MMP_EVENT_CATALOG];
      expect(def.appsFlyerEvent.startsWith('af_')).toBe(true);
      expect(def.firebaseGa4Event.length).toBeGreaterThan(2);
      expect(def.metaSdkEvent.length).toBeGreaterThan(2);
      expect(def.tiktokSdkEvent.length).toBeGreaterThan(2);
      expect([1, 2, 4, 8, 16, 32].includes(def.skanBitMask)).toBe(true);
    }
  });

  it('MMP-02: Enforces iOS ATT privacy compliance — strips IDFA and PII when ATT is denied/not_determined, enables IDFA only when authorized', () => {
    setAttConsentStatus('not_determined');
    const undecidedCtx = getPrivacySafeAttributionContext();
    expect(undecidedCtx.idfaAllowed).toBe(false);
    expect(undecidedCtx.idfa).toBeNull();
    expect(undecidedCtx.trackingMode).toBe('skadnetwork_privacy_safe');
    expect(undecidedCtx.aemAggregatedMode).toBe(true);

    const deniedStatus = requestAttPermission('denied');
    expect(deniedStatus).toBe('denied');
    const deniedCtx = getPrivacySafeAttributionContext();
    expect(deniedCtx.idfa).toBeNull();
    expect(deniedCtx.skadnetworkActive).toBe(true);

    // Dispatch event while ATT is denied -> PII (email, phone, raw_user_id) must be stripped
    const evDenied = trackMmpEvent(
      'view_meal_set',
      { email: 'secret@gmail.com', phone: '0909123456', meal_set_id: 'mam-01' },
      'Người dùng ẩn danh'
    );
    expect(evDenied.params.email).toBeUndefined();
    expect(evDenied.params.phone).toBeUndefined();
    expect(evDenied.params.meal_set_id).toBe('mam-01');

    // Grant ATT permission
    const authStatus = requestAttPermission('authorized');
    expect(authStatus).toBe('authorized');
    const authCtx = getPrivacySafeAttributionContext();
    expect(authCtx.idfaAllowed).toBe(true);
    expect(authCtx.idfa).toContain('IDFA-VN-');
    expect(authCtx.trackingMode).toBe('deterministic_idfa');
  });

  it('MMP-03: Enforces SKAdNetwork 4.0 monotonic non-decreasing Fine Value (0..63), Coarse Value transitions, and LockWindow at CV >= 48', () => {
    resetSkanConversionState();
    const initial = getSkanConversionState();
    expect(initial.fineValue).toBe(1);
    expect(initial.binaryMask).toBe('000001');
    expect(initial.coarseValue).toBe('low');
    expect(initial.lockWindow).toBe(false);

    // Unlock Bit 1 (+2: Onboarding/New User Gift) -> CV = 1 | 2 = 3 (still 'low')
    const afterBit1 = updateSkanConversionValue(2, 'af_claim_new_user_gift', 'user@gmail.com', 'user');
    expect(afterBit1.fineValue).toBe(3);
    expect(afterBit1.binaryMask).toBe('000011');
    expect(afterBit1.coarseValue).toBe('low');

    // Unlock Bit 2 (+4: Weekly Plan) -> CV = 3 | 4 = 7 ('medium')
    const afterBit2 = updateSkanConversionValue(4, 'af_generate_weekly_plan', 'user@gmail.com', 'user');
    expect(afterBit2.fineValue).toBe(7);
    expect(afterBit2.binaryMask).toBe('000111');
    expect(afterBit2.coarseValue).toBe('medium');

    // Boundary check: passing 0, negative number, or lower bit (1) MUST NEVER decrease fineValue
    const afterLower = updateSkanConversionValue(1, 'af_content_view', 'user@gmail.com', 'user');
    expect(afterLower.fineValue).toBe(7);
    const afterNegative = updateSkanConversionValue(-99, 'invalid_negative', 'user@gmail.com', 'user');
    expect(afterNegative.fineValue).toBe(7);

    // Unlock Bit 4 (+16: OTP Registration) -> CV = 7 | 16 = 23 ('high', lockWindow still false < 48)
    const afterBit4 = updateSkanConversionValue(16, 'af_complete_registration', 'user@gmail.com', 'user');
    expect(afterBit4.fineValue).toBe(23);
    expect(afterBit4.coarseValue).toBe('high');
    expect(afterBit4.lockWindow).toBe(false);

    // Unlock Bit 5 (+32: Collab Room / Ad Sequence) -> CV = 23 | 32 = 55 >= 48 -> triggers lockWindow!
    const afterBit5 = updateSkanConversionValue(32, 'af_collab_room_active', 'user@gmail.com', 'user');
    expect(afterBit5.fineValue).toBe(55);
    expect(afterBit5.binaryMask).toBe('110111');
    expect(afterBit5.coarseValue).toBe('high');
    expect(afterBit5.lockWindow).toBe(true);

    // Unlock Bit 3 (+8: Fridge/Grocery) -> CV = 55 | 8 = 63 (All 6 bits = '111111')
    const afterAllBits = updateSkanConversionValue(8, 'af_add_to_fridge', 'user@gmail.com', 'user');
    expect(afterAllBits.fineValue).toBe(63);
    expect(afterAllBits.binaryMask).toBe('111111');
    expect(afterAllBits.unlockedBits.length).toBe(6);
  });

  it('MMP-04: Enforces strict Admin Account Exemption — admin@mealwise.vn / role=admin never alters SKAN CV or logs MMP events', () => {
    resetSkanConversionState();
    clearMmpEventLogs();

    expect(isAdminAttributionExempt('admin@mealwise.vn', 'admin')).toBe(true);
    expect(isAdminAttributionExempt('admin@mealwise.com', 'user')).toBe(true);
    expect(isAdminAttributionExempt('Quản Trị Viên', 'admin')).toBe(true);
    expect(isAdminAttributionExempt('thuha.nguyen@gmail.com', 'user')).toBe(false);

    const adminDispatch = trackMmpEvent(
      'register_otp_verified',
      { test: 1 },
      'MealWise Administrator',
      'admin@mealwise.vn',
      'admin'
    );
    expect(adminDispatch.skippedAsAdmin).toBe(true);
    expect(getSkanConversionState().fineValue).toBe(1); // Unchanged from baseline 1
  });

  it('MMP-05: Validates Phase 2 Custom Product Pages (CPP-01..06) & Custom Store Listings (CSL-01..06) deep-link matching & New User Gift claim', () => {
    expect(CPP_CSL_CAMPAIGNS.length).toBe(6);

    // Test URL parsing for CPP, CSL, OneLink scheme, and Google AC campaign slugs
    const cpp1 = parseCampaignFromUrl('?cpp=qua-tang-nguoi-moi');
    expect(cpp1?.id).toBe('CPP-01');
    expect(cpp1?.grantsNewUserGift).toBe(true);

    const csl2 = parseCampaignFromUrl('?listing=csl_thuc_don_7_ngay_95k');
    expect(csl2?.id).toBe('CPP-02');
    expect(csl2?.targetTab).toBe('weekly');

    const scheme3 = parseCampaignFromUrl('mealy://campaign/di-cho-chung-gia-dinh');
    expect(scheme3?.id).toBe('CPP-03');
    expect(scheme3?.targetTab).toBe('grocery');

    const fridge4 = findCampaignByIdentifier('CPP-04');
    expect(fridge4?.targetTab).toBe('pantry');

    const eatClean5 = findCampaignByIdentifier('eat-clean-so-bep');
    expect(eatClean5?.recommendedTag).toBe('Eat Clean');

    const party6 = findCampaignByIdentifier('CSL-06');
    expect(party6?.targetTab).toBe('party');

    // Test XSS sanitization on malicious URL parameter
    const sanitized = sanitizeMmpParam('<script>alert("xss")</script>qua-tang-nguoi-moi');
    expect(sanitized).not.toContain('<script>');

    // Test claiming New User Gift works even when ATT is denied (Apple Guideline 5.1.2i compliance)
    setAttConsentStatus('denied');
    const giftResult = claimNewUserGift('new.member@gmail.com', 'Thành viên mới', 'user');
    expect(giftResult.claimed).toBe(true);
    expect(giftResult.adFreeUnlockedHours).toBe(24);
    expect(hasClaimedNewUserGift('new.member@gmail.com')).toBe(true);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      expect(isUserAdFree()).toBe(true);
    }
  });

  it('MMP-06: Verifies native iOS Info.plist (ATT + 10 SKAdNetwork IDs + mealy:// scheme), AndroidManifest.xml (AD_ID + Install Referrer + Deep Links), and Master CSV/MD sheets', () => {
    const rootDir = process.cwd();
    const plistContent = fs.readFileSync(path.join(rootDir, 'ios/App/App/Info.plist'), 'utf-8');
    expect(plistContent).toContain('NSUserTrackingUsageDescription');
    expect(plistContent).toContain('SKAdNetworkItems');
    for (const item of OFFICIAL_SKADNETWORK_IDS) {
      expect(plistContent).toContain(item.skanId);
    }
    expect(plistContent).toContain('<string>mealy</string>');

    const manifestContent = fs.readFileSync(
      path.join(rootDir, 'android/app/src/main/AndroidManifest.xml'),
      'utf-8'
    );
    expect(manifestContent).toContain('com.google.android.gms.permission.AD_ID');
    expect(manifestContent).toContain('com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE');
    expect(manifestContent).toContain('android:scheme="mealy"');

    const csvPath = path.join(rootDir, '5-Ke-Hoach-Tich-Hop-MMP-SDK-SKAN-Va-CPP-CSL-Mealy.csv');
    const mdPath = path.join(rootDir, '5-Ke-Hoach-Tich-Hop-MMP-SDK-SKAN-Va-CPP-CSL-Mealy.md');
    expect(fs.existsSync(csvPath)).toBe(true);
    expect(fs.existsSync(mdPath)).toBe(true);

    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    expect(csvContent).toContain('CPP-01 / CSL-01');
    expect(csvContent).toContain('CPP-06 / CSL-06');
    expect(csvContent).toContain('SKAN-4.0');
  });
});
