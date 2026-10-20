import { describe, it, expect } from '../helpers/testRunner';
import {
  generateSecureOtpCode,
  hashOtpCode,
  requestOtpChallenge,
  verifyOtpChallenge,
  checkLoginRateLimit,
  recordLoginAttempt,
  resetUserPasswordWithOtp,
  evaluatePasswordStrength,
  sanitizeUserInput
} from '../../src/services/otpSecurityService';
import {
  fetchLiveWeatherMealAdvice,
  lookupProductByBarcodeOrName,
  generateVietQrBillUrl,
  VIETNAM_CITIES,
  VIETQR_SUPPORTED_BANKS
} from '../../src/services/freePublicApis';

describe('Unit: OTP Security Engine & Free Public APIs (Open-Meteo, OpenFoodFacts, VietQR)', () => {
  it('CSPRNG OTP generator produces strictly 6-digit numeric strings and salted hash never leaks plaintext', () => {
    for (let i = 0; i < 20; i++) {
      const code = generateSecureOtpCode();
      expect(code.length).toBe(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
      const hash1 = hashOtpCode('user@mealy.vn', code, 'salt-a');
      const hash2 = hashOtpCode('user@mealy.vn', code, 'salt-a');
      const hashDiffSalt = hashOtpCode('user@mealy.vn', code, 'salt-b');
      expect(hash1).toBe(hash2);
      expect(hash1 !== hashDiffSalt).toBe(true);
      expect(hash1.includes(code)).toBe(false);
    }
  });

  it('OTP Challenge Lifecycle: request, resend cooldown, wrong attempts, and valid verification', () => {
    const email = `test.otp.${Date.now()}@mealy.vn`;
    const req1 = requestOtpChallenge(email, 'register', { bypassCooldown: true });
    expect(req1.success).toBe(true);
    expect(req1.simulatedPushOtpCode?.length).toBe(6);

    // Immediate request without bypassCooldown should trigger cooldown
    const reqCooldown = requestOtpChallenge(email, 'register', { bypassCooldown: false });
    expect(reqCooldown.success).toBe(false);
    expect((reqCooldown.cooldownRemainingSeconds || 0) > 0).toBe(true);

    // Wrong code attempt decrements remainingAttempts
    const wrongVerify = verifyOtpChallenge(email, '000000');
    expect(wrongVerify.valid).toBe(false);
    expect(wrongVerify.remainingAttempts).toBe(4);

    // Correct code verification succeeds
    const rightVerify = verifyOtpChallenge(email, req1.simulatedPushOtpCode!);
    expect(rightVerify.valid).toBe(true);

    // Replay attack check: verifying the same challenge a second time must fail
    const replayVerify = verifyOtpChallenge(email, req1.simulatedPushOtpCode!);
    expect(replayVerify.valid).toBe(false);
  });

  it('Brute-force login rate limiter locks account after 5 failed attempts and resets on success', () => {
    const targetEmail = `bruteforce.${Date.now()}@mealy.vn`;
    expect(checkLoginRateLimit(targetEmail).allowed).toBe(true);

    for (let i = 1; i <= 4; i++) {
      recordLoginAttempt(targetEmail, false);
      expect(checkLoginRateLimit(targetEmail).allowed).toBe(true);
    }

    recordLoginAttempt(targetEmail, false);
    const fifthStatus = checkLoginRateLimit(targetEmail);
    expect(fifthStatus.allowed).toBe(false);
    expect(fifthStatus.lockedRemainingSeconds > 0).toBe(true);

    // Successful login resets limiter
    recordLoginAttempt(targetEmail, true);
    const resetStatus = checkLoginRateLimit(targetEmail);
    expect(resetStatus.allowed).toBe(true);
    expect(resetStatus.failedAttempts).toBe(0);
  });

  it('Password strength evaluator & XSS input sanitizer protect user inputs', () => {
    const dirty = '<script>alert("xss")</script>  Nguyễn Văn A  ';
    const clean = sanitizeUserInput(dirty);
    expect(clean.includes('<script>')).toBe(false);
    expect(clean).toBe('Nguyễn Văn A');

    const weak = evaluatePasswordStrength('');
    expect(weak.score).toBe(0);
    const strong = evaluatePasswordStrength('Mealy@2026!Secure');
    expect(strong.score >= 3).toBe(true);
  });

  it('Password recovery with OTP updates user password after verifying 6-digit OTP', () => {
    const email = `recovery.${Date.now()}@mealy.vn`;
    const challenge = requestOtpChallenge(email, 'reset-password', { bypassCooldown: true });
    expect(challenge.success).toBe(true);

    const resetRes = resetUserPasswordWithOtp(email, challenge.simulatedPushOtpCode!, 'NewStrongPass#2026');
    expect(resetRes.success).toBe(true);
  });

  it('Free API 1 (Open-Meteo Weather): returns valid Vietnamese culinary advice for all 6 cities', async () => {
    expect(VIETNAM_CITIES.length).toBe(6);
    for (const city of VIETNAM_CITIES) {
      const advice = await fetchLiveWeatherMealAdvice(city.id);
      expect(advice.cityName).toBe(city.name);
      expect(typeof advice.temperatureC).toBe('number');
      expect(advice.weatherLabel.length > 0).toBe(true);
      expect(advice.culinaryAdvice.length > 10).toBe(true);
      expect(advice.recommendedTag.length > 0).toBe(true);
    }
  });

  it('Free API 2 (OpenFoodFacts & Vietnamese 893 Barcode DB): resolves barcode and product keywords accurately', async () => {
    const vinamilk = await lookupProductByBarcodeOrName('8934673100113');
    expect(vinamilk !== null).toBe(true);
    expect(vinamilk!.name.toLowerCase().includes('sữa tươi')).toBe(true);
    expect(vinamilk!.compartment).toBe('fridge');

    const kimchi = await lookupProductByBarcodeOrName('kim chi');
    expect(kimchi !== null).toBe(true);
    expect(kimchi!.category).toBe('Rau củ quả');
  });

  it('Free API 3 (VietQR Split Bill Generator): generates valid VietQR image URL and splits bill accurately', () => {
    expect(VIETQR_SUPPORTED_BANKS.length >= 6).toBe(true);
    const bill = generateVietQrBillUrl({
      bankBin: '970422',
      accountNo: '0987654321',
      accountName: 'NGUYEN VAN A',
      totalAmountVnd: 345000,
      splitCount: 3,
      roomId: '8899'
    });
    expect(bill.perPersonAmountVnd).toBe(115000);
    expect(bill.qrImageUrl.startsWith('https://img.vietqr.io/image/970422-0987654321-compact2.png')).toBe(true);
    expect(bill.qrImageUrl.includes('amount=115000')).toBe(true);
  });
});
