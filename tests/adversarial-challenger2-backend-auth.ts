/**
 * Challenger 2: Adversarial Empirical Challenge Suite for Backend Auth & Persistence
 *
 * Scopes tested:
 * 1. HTTP Status Codes: 401 (bad/missing password, unregistered user), 400 (bad format, short pass),
 *    409 (duplicate registration), 404 (reset non-existent account), 429 (rate-limit / lockout), 200 (ok)
 * 2. Unregistered Logins & Zero Account Fabrication
 * 3. Empty & Whitespace Passwords
 * 4. Vietnamese Phone Normalization (+84, spaces, dots, hyphens, prefixes)
 * 5. Adversarial Input Fuzzing (missing headers, malformed JSON, SQL/XSS injections)
 * 6. OTP Challenge Lifecycle (generation, rate-limit, brute-force lockout, single-use consumption)
 * 7. Persistence Integrity: Storage in .server-data/ vs node_modules/
 */

import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import {
  handleCollabRequest,
  serverUsers,
  serverOtpChallenges,
  serverSessions,
  normalizeIdentifier,
  isValidIdentifier,
  maskIdentifier,
  hashServerPassword
} from '../scripts/collab-server-handler.js';

console.log('\n======================================================================');
console.log('       CHALLENGER 2: BACKEND AUTH & PERSISTENCE ADVERSARIAL SUITE      ');
console.log('======================================================================\n');

let totalChecks = 0;
let passedChecks = 0;
let failedChecks = 0;
const failureDetails: string[] = [];

function assert(condition: boolean, description: string, detail?: string) {
  totalChecks++;
  if (condition) {
    passedChecks++;
    console.log(`  [PASS] ${description}`);
  } else {
    failedChecks++;
    const err = `  [FAIL] ${description}${detail ? ` -> ${detail}` : ''}`;
    console.error(err);
    failureDetails.push(err);
  }
}

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  json: any;
}

function mockReqRes(method: string, url: string, body: any = null, customHeaders: any = null) {
  const req: any = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = customHeaders !== null ? customHeaders : { host: 'localhost:5173', 'content-type': 'application/json' };

  let statusCode = 200;
  const headers: Record<string, string> = {};
  let responseData = '';

  const res: any = new EventEmitter();
  res.writeHead = (code: number, h: Record<string, string> = {}) => {
    statusCode = code;
    Object.assign(headers, h);
  };
  res.setHeader = (k: string, v: string) => {
    headers[k.toLowerCase()] = v;
  };
  res.getHeader = (k: string) => headers[k.toLowerCase()];
  res.end = (chunk: any = '') => {
    if (chunk) {
      responseData += typeof chunk === 'string' ? chunk : chunk.toString();
    }
    res.emit('finish');
  };

  const donePromise = new Promise<MockResponse>((resolve) => {
    res.on('finish', () => {
      let json: any = null;
      try {
        json = JSON.parse(responseData);
      } catch {}
      resolve({ statusCode, headers, body: responseData, json });
    });
  });

  process.nextTick(() => {
    if (body !== null && body !== undefined) {
      req.emit('data', Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
    }
    req.emit('end');
  });

  return { req, res, done: donePromise };
}

async function sendRequest(method: string, url: string, body: any = null, customHeaders: any = null): Promise<MockResponse> {
  const { req, res, done } = mockReqRes(method, url, body, customHeaders);
  const handled = await handleCollabRequest(req, res);
  if (!handled) {
    throw new Error(`Handler did not handle request: ${method} ${url}`);
  }
  return await done;
}

function cleanTestFixtures() {
  const testIds = [
    '0966592831',
    '+84966592831',
    '0912345678',
    '+84912345678',
    '0988777666',
    '0977000111',
    'adversarial_user@mealwise.vn',
    'victim@mealwise.vn',
    'reset_test@mealwise.vn',
    'fuzz_test@mealwise.vn'
  ];
  for (const id of testIds) {
    const norm = normalizeIdentifier(id);
    serverUsers.delete(norm);
    serverUsers.delete(id);
    serverOtpChallenges.delete(norm);
    serverOtpChallenges.delete(id);
  }
}

async function runAdversarialSuite() {
  cleanTestFixtures();

  // ======================================================================
  // SECTION 1: ADVERSARIAL LOGIN & ZERO ACCOUNT FABRICATION
  // ======================================================================
  console.log('\n--- SECTION 1: ADVERSARIAL LOGIN & ZERO ACCOUNT FABRICATION ---');

  // Baseline user count
  const initialUserCount = serverUsers.size;

  // 1.1 Unregistered phone login returns 401
  const unregPhoneRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0912345678',
    password: 'SomePassword123'
  });
  assert(unregPhoneRes.statusCode === 401, 'Unregistered phone login returns HTTP 401', `got ${unregPhoneRes.statusCode}`);
  assert(unregPhoneRes.json?.ok === false, 'Unregistered phone login has ok === false');
  assert(typeof unregPhoneRes.json?.message === 'string' && unregPhoneRes.json.message.includes('chưa tồn tại'), 'Error message states account does not exist');

  // 1.2 Unregistered email login returns 401
  const unregEmailRes = await sendRequest('POST', '/api/auth/login', {
    identifier: 'nonexistent_account@mealwise.vn',
    password: 'SomePassword123'
  });
  assert(unregEmailRes.statusCode === 401, 'Unregistered email login returns HTTP 401', `got ${unregEmailRes.statusCode}`);
  assert(unregEmailRes.json?.ok === false, 'Unregistered email login has ok === false');

  // 1.3 INVARIANT: No accounts fabricated on failed logins
  assert(serverUsers.size === initialUserCount, 'Zero account fabrication invariant: serverUsers.size unchanged after unregistered login attempts');
  assert(!serverUsers.has('0912345678'), 'serverUsers does not contain unregistered phone key');
  assert(!serverUsers.has('nonexistent_account@mealwise.vn'), 'serverUsers does not contain unregistered email key');

  // Register a legitimate test user
  const regRes = await sendRequest('POST', '/api/auth/register', {
    identifier: '0966592831',
    password: 'ValidPassword123!',
    name: 'Nguyễn Văn Mealy'
  });
  assert(regRes.statusCode === 200, 'Legitimate phone registration returns HTTP 200');
  assert(regRes.json?.ok === true, 'Legitimate registration json.ok is true');
  assert(regRes.json?.user?.identifier === '0966592831', 'Registered user identifier is 0966592831');
  assert(regRes.json?.user?.name === 'Nguyễn Văn Mealy', 'Registered user name is preserved');

  // 1.4 Empty password login returns 401
  const emptyPassRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: ''
  });
  assert(emptyPassRes.statusCode === 401, 'Empty password login returns HTTP 401', `got ${emptyPassRes.statusCode}`);
  assert(emptyPassRes.json?.ok === false, 'Empty password login has ok === false');
  assert(emptyPassRes.json?.message?.includes('Vui lòng nhập mật khẩu'), 'Empty password message asks for password');

  // 1.5 Whitespace password login returns 401
  const spacePassRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: '   \t  '
  });
  assert(spacePassRes.statusCode === 401, 'Whitespace-only password login returns HTTP 401', `got ${spacePassRes.statusCode}`);

  // 1.6 Missing password property in payload returns 401
  const missingPassRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831'
  });
  assert(missingPassRes.statusCode === 401, 'Missing password field returns HTTP 401', `got ${missingPassRes.statusCode}`);

  // 1.7 Wrong password login returns 401
  const wrongPassRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: 'CompletelyWrongPassword'
  });
  assert(wrongPassRes.statusCode === 401, 'Wrong password login returns HTTP 401', `got ${wrongPassRes.statusCode}`);
  assert(wrongPassRes.json?.message?.includes('Mật khẩu không chính xác'), 'Wrong password message states incorrect password');

  // 1.8 Correct password login returns 200 and preserves name
  const validLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: 'ValidPassword123!'
  });
  assert(validLoginRes.statusCode === 200, 'Valid password login returns HTTP 200');
  assert(validLoginRes.json?.ok === true, 'Valid login has ok === true');
  assert(validLoginRes.json?.user?.name === 'Nguyễn Văn Mealy', 'Valid login preserves registered name');
  assert(typeof validLoginRes.json?.sessionToken === 'string' && validLoginRes.json.sessionToken.startsWith('sess_'), 'Valid login returns sessionToken');

  // 1.9 Cross-format phone login (+84966592831 vs 0966592831)
  const crossLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '+84966592831',
    password: 'ValidPassword123!'
  });
  assert(crossLoginRes.statusCode === 200, 'Cross-format +84966592831 login resolves and returns HTTP 200');
  assert(crossLoginRes.json?.user?.identifier === '0966592831', 'Normalized identifier matches 0966592831');
  assert(crossLoginRes.json?.user?.name === 'Nguyễn Văn Mealy', 'Preserves original user name');

  // 1.10 Spaced and dotted format phone login (+84 966.592.831)
  const formattedLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '+84 966.592.831',
    password: 'ValidPassword123!'
  });
  assert(formattedLoginRes.statusCode === 200, 'Formatted phone (+84 966.592.831) login returns HTTP 200');

  // 1.11 Malformed identifier on login returns 400
  const malformedLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: 'not_an_email_or_phone',
    password: 'ValidPassword123!'
  });
  assert(malformedLoginRes.statusCode === 400, 'Malformed identifier on login returns HTTP 400', `got ${malformedLoginRes.statusCode}`);


  // ======================================================================
  // SECTION 2: ADVERSARIAL REGISTRATION & DUPLICATE COLLISION
  // ======================================================================
  console.log('\n--- SECTION 2: ADVERSARIAL REGISTRATION & DUPLICATE COLLISION ---');

  // 2.1 Duplicate registration with identical phone returns 409
  const dupExactRes = await sendRequest('POST', '/api/auth/register', {
    identifier: '0966592831',
    password: 'AnotherPassword456'
  });
  assert(dupExactRes.statusCode === 409, 'Duplicate identical phone registration returns HTTP 409', `got ${dupExactRes.statusCode}`);
  assert(dupExactRes.json?.ok === false, 'Duplicate registration ok is false');
  assert(dupExactRes.json?.message?.includes('Tài khoản đã tồn tại'), 'Duplicate message instructs user to login');

  // 2.2 Duplicate registration with +84 international format returns 409
  const dupPlus84Res = await sendRequest('POST', '/api/auth/register', {
    identifier: '+84966592831',
    password: 'AnotherPassword456'
  });
  assert(dupPlus84Res.statusCode === 409, 'Duplicate +84 phone registration returns HTTP 409', `got ${dupPlus84Res.statusCode}`);

  // 2.3 Duplicate registration with 84 (without plus) format returns 409
  const dup84Res = await sendRequest('POST', '/api/auth/register', {
    identifier: '84966592831',
    password: 'AnotherPassword456'
  });
  assert(dup84Res.statusCode === 409, 'Duplicate 84 phone registration returns HTTP 409', `got ${dup84Res.statusCode}`);

  // 2.4 Duplicate registration with dotted/spaced format returns 409
  const dupDotsRes = await sendRequest('POST', '/api/auth/register', {
    identifier: '+84 966.592.831',
    password: 'AnotherPassword456'
  });
  assert(dupDotsRes.statusCode === 409, 'Duplicate dotted phone registration returns HTTP 409', `got ${dupDotsRes.statusCode}`);

  // Register an email user
  const emailRegRes = await sendRequest('POST', '/api/auth/register', {
    identifier: 'victim@mealwise.vn',
    password: 'VictimPassword123!',
    name: 'Victim User'
  });
  assert(emailRegRes.statusCode === 200, 'Legitimate email registration returns HTTP 200');

  // 2.5 Duplicate email registration with case differences returns 409
  const dupEmailCaseRes = await sendRequest('POST', '/api/auth/register', {
    identifier: 'VICTIM@MEALWISE.VN',
    password: 'NewVictimPassword'
  });
  assert(dupEmailCaseRes.statusCode === 409, 'Duplicate uppercase email registration returns HTTP 409', `got ${dupEmailCaseRes.statusCode}`);

  // 2.6 Short password (<6 chars) returns 400
  const shortPassRes = await sendRequest('POST', '/api/auth/register', {
    identifier: '0977000111',
    password: '12345'
  });
  assert(shortPassRes.statusCode === 400, 'Registration with password < 6 chars returns HTTP 400', `got ${shortPassRes.statusCode}`);
  assert(shortPassRes.json?.message?.includes('6 ký tự trở lên'), 'Error message specifies minimum 6 characters');

  // 2.7 Missing password on registration returns 400
  const missingRegPass = await sendRequest('POST', '/api/auth/register', {
    identifier: '0977000111'
  });
  assert(missingRegPass.statusCode === 400, 'Registration with missing password returns HTTP 400', `got ${missingRegPass.statusCode}`);

  // 2.8 Invalid phone formats return 400
  const invalidPhones = ['0123456789', '0912', '096659283199999', '096659283A', '+84123456789'];
  for (const inv of invalidPhones) {
    const invRes = await sendRequest('POST', '/api/auth/register', {
      identifier: inv,
      password: 'ValidPassword123'
    });
    assert(invRes.statusCode === 400, `Registration with invalid phone (${inv}) returns HTTP 400`, `got ${invRes.statusCode}`);
  }

  // 2.9 Invalid email formats return 400
  const invalidEmails = ['invalid-email', 'user@', '@domain.com', 'user@domain', 'user@.com'];
  for (const inv of invalidEmails) {
    const invRes = await sendRequest('POST', '/api/auth/register', {
      identifier: inv,
      password: 'ValidPassword123'
    });
    assert(invRes.statusCode === 400, `Registration with invalid email (${inv}) returns HTTP 400`, `got ${invRes.statusCode}`);
  }


  // ======================================================================
  // SECTION 3: ADVERSARIAL RESET-PASSWORD TESTS
  // ======================================================================
  console.log('\n--- SECTION 3: ADVERSARIAL RESET-PASSWORD TESTS ---');

  // 3.1 Reset password for non-existent account returns 404
  const resetNonExistentRes = await sendRequest('POST', '/api/auth/reset-password', {
    identifier: '0988777666',
    newPassword: 'BrandNewPassword123!'
  });
  assert(resetNonExistentRes.statusCode === 404, 'Reset password for non-existent account returns HTTP 404', `got ${resetNonExistentRes.statusCode}`);
  assert(resetNonExistentRes.json?.ok === false, 'Reset non-existent account ok is false');
  assert(resetNonExistentRes.json?.message?.includes('không tồn tại'), 'Error message confirms account does not exist');

  // 3.2 Reset password with short new password (<6 chars) returns 400
  const resetShortPassRes = await sendRequest('POST', '/api/auth/reset-password', {
    identifier: '0966592831',
    newPassword: '123'
  });
  assert(resetShortPassRes.statusCode === 400, 'Reset with password < 6 chars returns HTTP 400', `got ${resetShortPassRes.statusCode}`);

  // 3.3 Reset password with invalid identifier format returns 400
  const resetBadIdRes = await sendRequest('POST', '/api/auth/reset-password', {
    identifier: 'not-valid-id',
    newPassword: 'BrandNewPassword123!'
  });
  assert(resetBadIdRes.statusCode === 400, 'Reset with invalid identifier format returns HTTP 400', `got ${resetBadIdRes.statusCode}`);

  // 3.4 Valid reset password with international phone format (+84966592831) returns 200
  const resetValidRes = await sendRequest('POST', '/api/auth/reset-password', {
    identifier: '+84966592831',
    newPassword: 'UpdatedNewPassword789!'
  });
  assert(resetValidRes.statusCode === 200, 'Valid reset-password with +84 format returns HTTP 200', `got ${resetValidRes.statusCode}`);
  assert(resetValidRes.json?.ok === true, 'Reset response ok is true');

  // 3.5 Verify old password no longer works (401)
  const oldPassLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: 'ValidPassword123!'
  });
  assert(oldPassLoginRes.statusCode === 401, 'Old password fails with HTTP 401 after reset');

  // 3.6 Verify new password works (200)
  const newPassLoginRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: 'UpdatedNewPassword789!'
  });
  assert(newPassLoginRes.statusCode === 200, 'New password succeeds with HTTP 200 after reset');


  // ======================================================================
  // SECTION 4: ADVERSARIAL OTP REQUEST & VERIFICATION LIFECYCLE
  // ======================================================================
  console.log('\n--- SECTION 4: ADVERSARIAL OTP REQUEST & VERIFICATION LIFECYCLE ---');

  // 4.1 OTP request for invalid identifier returns 400
  const otpBadIdRes = await sendRequest('POST', '/api/auth/otp/request', {
    target: 'invalid_identifier'
  });
  assert(otpBadIdRes.statusCode === 400, 'OTP request with invalid identifier returns HTTP 400', `got ${otpBadIdRes.statusCode}`);

  // 4.2 OTP request for phone number returns 200 and simulated 6-digit OTP
  const otpPhoneRes = await sendRequest('POST', '/api/auth/otp/request', {
    target: '+84 966 592 831',
    purpose: 'reset_password',
    bypassCooldown: true
  });
  assert(otpPhoneRes.statusCode === 200, 'OTP request for phone returns HTTP 200', `got ${otpPhoneRes.statusCode}`);
  assert(otpPhoneRes.json?.smsSent === true, 'SMS simulation flag is true');
  assert(typeof otpPhoneRes.json?.otpCode === 'string' && otpPhoneRes.json.otpCode.length === 6, 'Generated OTP is strictly 6 digits');
  assert(otpPhoneRes.json?.maskedTarget === '0966***831', 'Masked target formats correctly');

  const correctOtpCode = otpPhoneRes.json.otpCode;

  // 4.3 Rapid re-trigger without cooldown bypass returns 429
  const otpRapidRes = await sendRequest('POST', '/api/auth/otp/request', {
    target: '0966592831',
    purpose: 'reset_password',
    bypassCooldown: false
  });
  assert(otpRapidRes.statusCode === 429, 'Rapid OTP request without cooldown bypass returns HTTP 429', `got ${otpRapidRes.statusCode}`);
  assert(typeof otpRapidRes.json?.cooldownRemainingSeconds === 'number', 'Returns remaining cooldown seconds');

  // 4.4 OTP verify with non-6-digit code returns 400
  const otpVerifyShortRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: '12345'
  });
  assert(otpVerifyShortRes.statusCode === 400, 'OTP verify with 5 digits returns HTTP 400', `got ${otpVerifyShortRes.statusCode}`);

  // 4.5 OTP verify with unknown target returns 400
  const otpVerifyUnknownRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0988777666',
    code: '123456'
  });
  assert(otpVerifyUnknownRes.statusCode === 400, 'OTP verify with unknown target returns HTTP 400', `got ${otpVerifyUnknownRes.statusCode}`);

  // 4.6 OTP verify with wrong code returns 400 and tracks remaining attempts
  const wrongOtp = correctOtpCode === '111111' ? '222222' : '111111';
  const otpWrongRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: wrongOtp
  });
  assert(otpWrongRes.statusCode === 400, 'OTP verify with wrong code returns HTTP 400', `got ${otpWrongRes.statusCode}`);
  assert(otpWrongRes.json?.valid === false, 'Wrong OTP valid flag is false');
  assert(otpWrongRes.json?.remainingAttempts === 4, 'Remaining attempts decremented to 4');

  // 4.7 Brute force OTP attack: 4 more wrong attempts -> lockout (429)
  for (let i = 0; i < 3; i++) {
    await sendRequest('POST', '/api/auth/otp/verify', { target: '0966592831', code: wrongOtp });
  }
  const fifthFailRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: wrongOtp
  });
  assert(fifthFailRes.statusCode === 429, '5th wrong OTP attempt triggers security lockout HTTP 429', `got ${fifthFailRes.statusCode}`);
  assert(fifthFailRes.json?.lockedRemainingSeconds > 0, 'Lockout duration reported');

  // 4.8 Attempt during lockout returns 429
  const lockoutAttemptRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: correctOtpCode
  });
  assert(lockoutAttemptRes.statusCode === 429, 'Attempt during active lockout returns HTTP 429 even with correct code', `got ${lockoutAttemptRes.statusCode}`);

  // 4.9 Reset challenge and test successful verify + replay attack prevention
  const freshOtpRes = await sendRequest('POST', '/api/auth/otp/request', {
    target: '0966592831',
    bypassCooldown: true
  });
  const freshCode = freshOtpRes.json.otpCode;

  const successfulVerifyRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: freshCode
  });
  assert(successfulVerifyRes.statusCode === 200, 'Correct OTP code returns HTTP 200', `got ${successfulVerifyRes.statusCode}`);
  assert(successfulVerifyRes.json?.valid === true, 'Verification valid flag is true');

  // 4.10 Replay attack with already consumed OTP returns 400
  const replayVerifyRes = await sendRequest('POST', '/api/auth/otp/verify', {
    target: '0966592831',
    code: freshCode
  });
  assert(replayVerifyRes.statusCode === 400, 'Replay attack with consumed OTP code returns HTTP 400', `got ${replayVerifyRes.statusCode}`);
  assert(replayVerifyRes.json?.valid === false, 'Consumed OTP cannot be reused');


  // ======================================================================
  // SECTION 5: ADVERSARIAL PROTOCOL & NETWORK FUZZING
  // ======================================================================
  console.log('\n--- SECTION 5: ADVERSARIAL PROTOCOL & NETWORK FUZZING ---');

  // 5.1 Missing headers (empty headers object)
  const noHeadersRes = await sendRequest('POST', '/api/auth/login', {
    identifier: '0966592831',
    password: 'UpdatedNewPassword789!'
  }, {});
  assert(noHeadersRes.statusCode === 200, 'Request with missing headers does not crash and succeeds');

  // 5.2 Malformed JSON body returns 400 (not 500)
  const malformedJsonRes = await sendRequest('POST', '/api/auth/register', '{ "unclosed": json,');
  assert(malformedJsonRes.statusCode === 400, 'Malformed JSON body handled gracefully with HTTP 400 (no crash)', `got ${malformedJsonRes.statusCode}`);

  // 5.3 Non-object JSON body (e.g. array or primitive)
  const arrayBodyRes = await sendRequest('POST', '/api/auth/login', '[1, 2, 3]');
  assert(arrayBodyRes.statusCode === 400, 'Array JSON body returns HTTP 400 (not 500 crash)', `got ${arrayBodyRes.statusCode}`);

  // 5.4 Injection payloads in registration and login fields
  const injectionRes = await sendRequest('POST', '/api/auth/login', {
    identifier: "' OR '1'='1' --",
    password: "' OR '1'='1'"
  });
  assert(injectionRes.statusCode === 400, 'SQL injection attempt in identifier safely returns HTTP 400', `got ${injectionRes.statusCode}`);

  const xssRegRes = await sendRequest('POST', '/api/auth/register', {
    identifier: '0912345678',
    password: 'SafePassword123!',
    name: '<script>alert("XSS")</script>'
  });
  assert(xssRegRes.statusCode === 200, 'XSS in name handled safely by server and returns HTTP 200');

  // 5.5 OPTIONS CORS preflight returns 204
  const preflightRes = await sendRequest('OPTIONS', '/api/auth/login');
  assert(preflightRes.statusCode === 204, 'OPTIONS preflight returns HTTP 204');


  // ======================================================================
  // SECTION 6: PERSISTENCE & STORAGE DIRECTORY EMPIRICAL VERIFICATION
  // ======================================================================
  console.log('\n--- SECTION 6: PERSISTENCE & STORAGE DIRECTORY EMPIRICAL VERIFICATION ---');

  const cwd = process.cwd();
  const dataDir = path.resolve(cwd, '.server-data');
  const serverDbFile = path.resolve(dataDir, 'server-database.json');
  const otpDbFile = path.resolve(dataDir, 'otp-challenges.json');

  // 6.1 Check that .server-data exists
  assert(fs.existsSync(dataDir), '.server-data directory exists at project root');

  // 6.2 Check that server-database.json exists in .server-data
  assert(fs.existsSync(serverDbFile), 'server-database.json exists in .server-data');

  // 6.3 Check that otp-challenges.json exists in .server-data
  assert(fs.existsSync(otpDbFile), 'otp-challenges.json exists in .server-data');

  // 6.4 Inspect database contents
  const dbData = JSON.parse(fs.readFileSync(serverDbFile, 'utf-8'));
  assert(dbData.users && typeof dbData.users === 'object', 'server-database.json has valid users object');
  assert(Boolean(dbData.users['0966592831']), '0966592831 persisted in server-database.json');
  assert(dbData.users['0966592831'].name === 'Nguyễn Văn Mealy', 'Persisted record contains correct name');

  // 6.5 Check that node_modules does NOT contain modern state files
  const legacyDbFile = path.resolve(cwd, 'node_modules', '.server-database.json');
  const legacyOtpFile = path.resolve(cwd, 'node_modules', '.otp-challenges.json');
  // If legacy file exists from previous old runs, check its mtime vs .server-data to ensure active writes go to .server-data
  if (fs.existsSync(legacyDbFile)) {
    const legacyMtime = fs.statSync(legacyDbFile).mtimeMs;
    const modernMtime = fs.statSync(serverDbFile).mtimeMs;
    assert(modernMtime >= legacyMtime, 'Modern .server-data/server-database.json is the active target, not node_modules');
  } else {
    assert(true, 'node_modules/.server-database.json does not exist (clean state)');
  }

  // 6.6 Verify persistence survives reload into fresh maps
  const reloadedUsers = new Map();
  for (const [k, v] of Object.entries(dbData.users)) {
    reloadedUsers.set(k, v);
  }
  assert(reloadedUsers.has('0966592831'), 'Persisted users survive reconstruction from disk');
  const loadedUser: any = reloadedUsers.get('0966592831');
  assert(loadedUser.passwordHash && loadedUser.salt, 'Persisted user retains salt and hash on disk');


  // ======================================================================
  // FINAL TELEMETRY & VERDICT
  // ======================================================================
  console.log('\n======================================================================');
  console.log('                 ADVERSARIAL CHALLENGE RESULTS SUMMARY                 ');
  console.log('======================================================================');
  console.log(`Total Checks Executed : ${totalChecks}`);
  console.log(`Passed Checks         : ${passedChecks}`);
  console.log(`Failed Checks         : ${failedChecks}`);
  console.log(`Pass Rate             : ${((passedChecks / totalChecks) * 100).toFixed(2)}%`);
  console.log('======================================================================\n');

  if (failedChecks > 0) {
    console.error(`FAILED CHECKS (${failedChecks}):`);
    for (const f of failureDetails) {
      console.error(f);
    }
    process.exit(1);
  } else {
    console.log('>>> [VERDICT: APPROVE] ALL ADVERSARIAL STRESS TESTS PASSED SUCCESSFULLY! <<<\n');
    process.exit(0);
  }
}

runAdversarialSuite().catch((err) => {
  console.error('Fatal unhandled error during adversarial test suite:', err);
  process.exit(1);
});
