/**
 * Challenger 1: Empirical Adversarial Stress Test Harness
 * 
 * Target: Frontend Auth & User Database Persistence Logic
 * Scope:
 *   1. Extreme phone number formats (+84966592831, +84 966 592 831, 0966 592 831, 0966.592.831, 0966-592-831, +840966592831)
 *   2. Email casing and whitespace variations
 *   3. Cross-format register vs login equality (Full N x N permutation matrix)
 *   4. Empty, whitespace-only, and undefined password submission on protected accounts
 *   5. Non-existent account credential verification
 *   6. Display name preservation when logging in with phone numbers
 *   7. Brute-force rate limiting cross-format normalization
 *   8. Frontend vs Backend normalization parity & edge cases
 */

import { setupMockStorage } from './helpers/mockStorage';
setupMockStorage();
(globalThis as any).window = globalThis;

import {
  normalizeIdentifier,
  verifyUserPassword,
  registerUserInDatabase,
  getRegisteredUserByEmail,
  getAllRegisteredUsers,
  loadUserPartition,
  saveUserPartition,
  hashUserPassword,
  USERS_DB_KEY
} from '../src/services/userDatabase';

import {
  validateEmailOrPhone,
  maskIdentifier,
  checkLoginRateLimit,
  recordLoginAttempt
} from '../src/services/otpSecurityService';

import { normalizeIdentifier as backendNormalizeIdentifier, isValidIdentifier as backendIsValidIdentifier } from '../scripts/collab-server-handler.js';

interface AssertionResult {
  suite: string;
  name: string;
  passed: boolean;
  expected: any;
  actual: any;
  error?: string;
}

const results: AssertionResult[] = [];

function assert(suite: string, name: string, condition: boolean, expected?: any, actual?: any) {
  results.push({
    suite,
    name,
    passed: condition,
    expected: expected ?? true,
    actual: actual ?? condition
  });
  if (!condition) {
    console.error(`  ❌ [FAIL] [${suite}] ${name}`);
    console.error(`     Expected: ${JSON.stringify(expected)}`);
    console.error(`     Actual:   ${JSON.stringify(actual)}`);
  } else {
    console.log(`  ✓ [PASS] [${suite}] ${name}`);
  }
}

console.log('======================================================================');
console.log('CHALLENGER 1: EMPIRICAL ADVERSARIAL AUTH & DATABASE STRESS HARNESS');
console.log('======================================================================\n');

// ============================================================================
// SUITE 1: Extreme Phone Number Formats
// ============================================================================
console.log('--- Suite 1: Extreme Phone Number Formats ---');

const expectedCanonical = '0966592831';
const validPhoneFormats = [
  '+84966592831',
  '+84 966 592 831',
  '0966 592 831',
  '0966.592.831',
  '0966-592-831',
  '+840966592831',
  '  +84966592831  ',
  '\t+84 966 592 831\n',
  '  0966.592-831  ',
  '+84-966-592-831',
  '+84.966.592.831',
  '+84 0966 592 831',
  '0966592831'
];

for (const fmt of validPhoneFormats) {
  const norm = normalizeIdentifier(fmt);
  assert('Phone Normalization', `Format "${fmt}" normalizes to canonical "${expectedCanonical}"`, norm === expectedCanonical, expectedCanonical, norm);

  const val = validateEmailOrPhone(fmt);
  assert('Phone Validation', `Format "${fmt}" is detected as valid phone`, val.valid === true && val.type === 'phone' && val.normalized === expectedCanonical, { valid: true, type: 'phone', normalized: expectedCanonical }, val);

  const masked = maskIdentifier(fmt);
  assert('Phone Masking', `Format "${fmt}" masks correctly`, masked === '096***831', '096***831', masked);
}

// Additional Vietnamese prefixes: Mobile (03, 05, 07, 08, 09) and Landline (02)
const otherVnPhones = [
  { raw: '+84 38 123 4567', expected: '0381234567', type: 'phone' },
  { raw: '+84 79 987 6543', expected: '0799876543', type: 'phone' },
  { raw: '0888.123.456', expected: '0888123456', type: 'phone' },
  { raw: '0522-333-444', expected: '0522333444', type: 'phone' },
  { raw: '+84 24 3822 1234', expected: '02438221234', type: 'phone' }, // Hanoi landline
  { raw: '028.3822.5678', expected: '02838225678', type: 'phone' }      // HCMC landline
];

for (const item of otherVnPhones) {
  const norm = normalizeIdentifier(item.raw);
  assert('VN Phone Prefixes', `Prefix "${item.raw}" normalizes to "${item.expected}"`, norm === item.expected, item.expected, norm);
  const val = validateEmailOrPhone(item.raw);
  assert('VN Phone Prefixes', `Prefix "${item.raw}" passes validation`, val.valid === true && val.type === 'phone', true, val.valid);
}

// Invalid phone formats that MUST be rejected
const invalidPhoneInputs = [
  { raw: '09665928', reason: 'Too short (8 digits)' },
  { raw: '0966592831123', reason: 'Too long (> 11 digits)' },
  { raw: '09665abc831', reason: 'Contains alphabetic characters' },
  { raw: '0466592831', reason: 'Invalid VN prefix 04 for mobile/landline' },
  { raw: '1234567890', reason: 'Does not start with 0' },
  { raw: 'phone_number', reason: 'Non-numeric string' },
  { raw: '<script>0966592831</script>', reason: 'XSS script tags injected' }
];

for (const item of invalidPhoneInputs) {
  const val = validateEmailOrPhone(item.raw);
  assert('Invalid Phone Rejection', `Invalid input "${item.raw}" rejected (${item.reason})`, val.valid === false, false, val.valid);
}

// ============================================================================
// SUITE 2: Email Casing and Whitespace Variations
// ============================================================================
console.log('\n--- Suite 2: Email Casing and Whitespace Variations ---');

const emailVariations = [
  { raw: ' USER@EXAMPLE.COM ', expected: 'user@example.com' },
  { raw: 'User.Name+Tag@Example.COM  ', expected: 'user.name+tag@example.com' },
  { raw: '\t admin@mealwise.vn \n', expected: 'admin@mealwise.vn' },
  { raw: 'ADMIN@MEALWISE.VN', expected: 'admin@mealwise.vn' },
  { raw: 'Admin', expected: 'admin' },
  { raw: '\tADMIN  ', expected: 'admin' },
  { raw: '   hoang.nam@MEALWISE.VN   ', expected: 'hoang.nam@mealwise.vn' },
  { raw: 'Admin@MealWise.Com', expected: 'admin@mealwise.com' }
];

for (const item of emailVariations) {
  const norm = normalizeIdentifier(item.raw);
  assert('Email Normalization', `Input "${item.raw.replace(/[\t\n]/g, '\\t')}" normalizes to "${item.expected}"`, norm === item.expected, item.expected, norm);

  const val = validateEmailOrPhone(item.raw);
  assert('Email Validation', `Input "${item.raw.replace(/[\t\n]/g, '\\t')}" is valid (${val.type})`, val.valid === true, true, val.valid);
}

const invalidEmails = [
  'user@',
  '@domain.com',
  'user name@domain.com',
  'plainaddress',
  'user@domain',
  'user@.com',
  '   '
];

for (const raw of invalidEmails) {
  const val = validateEmailOrPhone(raw);
  assert('Invalid Email Rejection', `Invalid email "${raw}" rejected`, val.valid === false, false, val.valid);
}

// ============================================================================
// SUITE 3: Cross-Format Register vs Login Equality (N x N Matrix)
// ============================================================================
console.log('\n--- Suite 3: Cross-Format Register vs Login Equality (N x N Matrix) ---');

const matrixFormats = [
  '0966592831',
  '+84966592831',
  '+84 966 592 831',
  '0966 592 831',
  '0966.592.831',
  '0966-592-831',
  '+840966592831'
];

const testPassword = 'Password123@Empirical';
const testUserName = 'Vũ Hoàng Yến';

for (let rIdx = 0; rIdx < matrixFormats.length; rIdx++) {
  const regFmt = matrixFormats[rIdx];
  localStorage.clear();

  // Register account with regFmt
  const { user: registered } = registerUserInDatabase({
    name: testUserName,
    email: regFmt,
    password: testPassword
  });

  assert('Cross-Format Register', `Registered with format "${regFmt}" has normalized email "${expectedCanonical}"`, registered.email === expectedCanonical, expectedCanonical, registered.email);

  // Save partition data under this user's ID
  saveUserPartition(registered.id, {
    weeklyPlan: [{ dayId: 'mon', dayName: 'Thứ Hai', meals: { breakfast: null, lunch: null, dinner: null } } as any]
  });

  // Verify all other formats resolve to this EXACT user
  for (let lIdx = 0; lIdx < matrixFormats.length; lIdx++) {
    const loginFmt = matrixFormats[lIdx];

    // 1. Direct DB lookup
    const lookupUser = getRegisteredUserByEmail(loginFmt);
    assert('Cross-Format Lookup', `Lookup by "${loginFmt}" resolves to user registered by "${regFmt}"`, lookupUser?.id === registered.id, registered.id, lookupUser?.id);

    // 2. Password verification with correct password
    const verifySuccess = verifyUserPassword(loginFmt, testPassword);
    assert('Cross-Format Password Correct', `Verify password for "${loginFmt}" succeeds for user registered by "${regFmt}"`, verifySuccess.valid === true && verifySuccess.user?.id === registered.id, true, verifySuccess.valid);

    // 3. Password verification with wrong password
    const verifyFail = verifyUserPassword(loginFmt, 'WrongPass123');
    assert('Cross-Format Password Wrong', `Verify wrong password for "${loginFmt}" is rejected`, verifyFail.valid === false && verifyFail.user?.id === registered.id, false, verifyFail.valid);

    // 4. Partition lookup matches
    const partition = loadUserPartition(lookupUser?.id || '');
    assert('Cross-Format Partition', `User partition loaded correctly for "${loginFmt}"`, partition?.weeklyPlan?.length === 1, 1, partition?.weeklyPlan?.length);
  }
}

// Cross-format test for Email casing & whitespace
{
  localStorage.clear();
  const regEmail = '  Nguyen.Van.A+Tag@MealWise.VN  ';
  const loginVariations = [
    'nguyen.van.a+tag@mealwise.vn',
    'NGUYEN.VAN.A+TAG@MEALWISE.VN',
    '  Nguyen.Van.A+Tag@mealwise.vn ',
    '\tnguyen.van.a+tag@MEALWISE.VN\n'
  ];

  const { user: emailUser } = registerUserInDatabase({
    name: 'Nguyễn Văn A',
    email: regEmail,
    password: 'EmailPassword!789'
  });

  for (const loginEmail of loginVariations) {
    const found = getRegisteredUserByEmail(loginEmail);
    assert('Email Cross-Format', `Login variation "${loginEmail.replace(/[\t\n]/g, '')}" matches registered email`, found?.id === emailUser.id, emailUser.id, found?.id);

    const check = verifyUserPassword(loginEmail, 'EmailPassword!789');
    assert('Email Cross-Format Password', `Password check succeeds for "${loginEmail.replace(/[\t\n]/g, '')}"`, check.valid === true, true, check.valid);
  }
}

// ============================================================================
// SUITE 4: Empty, Whitespace-only, and Undefined Password Submission
// ============================================================================
console.log('\n--- Suite 4: Empty, Whitespace-only, and Undefined Password Submission ---');

localStorage.clear();
const protectedPhone = '0966592831';
const validSecret = 'MySuperSecret#999';

const { user: protectedUser } = registerUserInDatabase({
  name: 'Lê Hoàng Nam',
  email: protectedPhone,
  password: validSecret
});

assert('Protected Account Setup', 'User registered with passwordHash', Boolean(protectedUser.passwordHash), true, Boolean(protectedUser.passwordHash));

const blankPasswords = [
  { pw: '', desc: 'empty string ""' },
  { pw: '   ', desc: 'three spaces "   "' },
  { pw: '\t\n\r  ', desc: 'whitespace tab/newline' },
  { pw: undefined, desc: 'undefined' },
  { pw: null as any, desc: 'null' }
];

for (const item of blankPasswords) {
  const check = verifyUserPassword(protectedPhone, item.pw);
  assert(
    'Blank Password Rejection',
    `Submission with ${item.desc} must return valid: false`,
    check.valid === false && check.user?.id === protectedUser.id,
    false,
    check.valid
  );
}

// Wrong password
const wrongCheck = verifyUserPassword(protectedPhone, 'IncorrectPassword');
assert('Wrong Password Rejection', 'Submission with wrong password returns valid: false', wrongCheck.valid === false, false, wrongCheck.valid);

// Correct password
const correctCheck = verifyUserPassword(protectedPhone, validSecret);
assert('Correct Password Acceptance', 'Submission with correct password returns valid: true', correctCheck.valid === true && correctCheck.user?.id === protectedUser.id, true, correctCheck.valid);

// Whitespace-trimmed password (leading/trailing whitespace on correct password)
const trimmedCheck = verifyUserPassword(protectedPhone, `   ${validSecret}   `);
assert('Whitespace Trimmed Password', 'Leading/trailing whitespace on correct password is accepted', trimmedCheck.valid === true, true, trimmedCheck.valid);

// ============================================================================
// SUITE 5: Non-Existent Account Credential Verification
// ============================================================================
console.log('\n--- Suite 5: Non-Existent Account Credential Verification ---');

localStorage.clear();

const nonExistentIdentifiers = [
  'ghost.user@nowhere.vn',
  '0999999999',
  '+84999999999',
  'nonexistent@mealwise.com',
  '0381112233',
  '',
  '   ',
  undefined as any,
  null as any
];

for (const id of nonExistentIdentifiers) {
  const displayId = String(id);
  const lookup = getRegisteredUserByEmail(id);
  assert('Non-Existent Lookup', `Lookup for non-existent "${displayId}" returns null`, lookup === null, null, lookup);

  const check = verifyUserPassword(id, 'AnyPassword123');
  assert('Non-Existent Password Check', `Password verification for non-existent "${displayId}" returns valid: false and user: null`, check.valid === false && check.user === null, { valid: false, user: null }, check);
}

// ============================================================================
// SUITE 6: Display Name Preservation When Logging In With Phone Numbers
// ============================================================================
console.log('\n--- Suite 6: Display Name Preservation When Logging In With Phone Numbers ---');

localStorage.clear();
const initialRealName = 'Trần Đại Nghĩa';
const phoneAccount = '0966592831';

// Initial Registration
const { user: regUser } = registerUserInDatabase({
  name: initialRealName,
  email: phoneAccount,
  password: 'Password123'
});

assert('Display Name Initial', `Initial registration sets name to "${initialRealName}"`, regUser.name === initialRealName, initialRealName, regUser.name);

// Subsequent logins passing various phone representations as display name
const phoneLoginVariations = [
  { inputName: '0966592831', inputEmail: '0966592831', desc: 'Raw phone number as name' },
  { inputName: '+84966592831', inputEmail: '+84966592831', desc: '+84 phone format as name' },
  { inputName: '+84 966 592 831', inputEmail: '+84 966 592 831', desc: 'Spaced +84 phone format as name' },
  { inputName: '0966 592 831', inputEmail: '0966.592.831', desc: 'Dotted phone format as name' },
  { inputName: '+840966592831', inputEmail: '+840966592831', desc: '+840 phone format as name' },
  { inputName: '', inputEmail: '0966592831', desc: 'Empty name' },
  { inputName: 'Thành Viên Mealy', inputEmail: '0966592831', desc: 'Generic default "Thành Viên Mealy"' },
  { inputName: 'Người dùng', inputEmail: '0966592831', desc: 'Generic default "Người dùng"' }
];

for (const sim of phoneLoginVariations) {
  // Re-assert/reset to real name before testing this login format
  registerUserInDatabase({ name: initialRealName, email: phoneAccount });

  const { user: updatedUser } = registerUserInDatabase({
    name: sim.inputName,
    email: sim.inputEmail
  });

  assert(
    'Display Name Preserved',
    `Login with ${sim.desc} preserves real name "${initialRealName}"`,
    updatedUser.name === initialRealName,
    initialRealName,
    updatedUser.name
  );
}

// Verify that if the user explicitly changes to a NEW custom name, it updates properly
const updatedCustomName = 'Trần Đại Nghĩa (VIP)';
const { user: renamedUser } = registerUserInDatabase({
  name: updatedCustomName,
  email: phoneAccount
});
assert('Display Name Explicit Update', `Explicitly setting new name updates to "${updatedCustomName}"`, renamedUser.name === updatedCustomName, updatedCustomName, renamedUser.name);

// Subsequent login again preserves the newly updated name
const { user: loginAfterRename } = registerUserInDatabase({
  name: '0966592831',
  email: phoneAccount
});
assert('Display Name Preserved After Update', `Subsequent login preserves new name "${updatedCustomName}"`, loginAfterRename.name === updatedCustomName, updatedCustomName, loginAfterRename.name);

// ============================================================================
// SUITE 7: Brute-Force Rate Limiting Cross-Format Invariance
// ============================================================================
console.log('\n--- Suite 7: Brute-Force Rate Limiting Cross-Format Invariance ---');

const rateLimitPhone1 = '+84 966 592 831';
const rateLimitPhone2 = '0966-592-831';
const rateLimitCanonical = '0966592831';

// Reset initially
recordLoginAttempt(rateLimitCanonical, true);

// 4 failed attempts on format 1
for (let i = 1; i <= 4; i++) {
  recordLoginAttempt(rateLimitPhone1, false);
  const status = checkLoginRateLimit(rateLimitPhone1);
  assert('Rate Limit Accumulation', `Attempt ${i} allowed on format 1`, status.allowed === true && status.failedAttempts === i, i, status.failedAttempts);
}

// 5th failed attempt on format 2 (different format, same user!)
recordLoginAttempt(rateLimitPhone2, false);
const fifthCheck = checkLoginRateLimit(rateLimitPhone2);
assert('Rate Limit Lockout', '5th attempt on format 2 triggers lockout', fifthCheck.allowed === false && fifthCheck.lockedRemainingSeconds > 0, false, fifthCheck.allowed);

// Format 3 checks lockout
const format3Check = checkLoginRateLimit('+840966592831');
assert('Rate Limit Cross-Format Check', 'Lockout reflects across format 3 (+840...)', format3Check.allowed === false, false, format3Check.allowed);

// Reset on success
recordLoginAttempt(rateLimitCanonical, true);
const afterSuccess = checkLoginRateLimit(rateLimitPhone1);
assert('Rate Limit Reset', 'Successful login resets rate limit', afterSuccess.allowed === true && afterSuccess.failedAttempts === 0, true, afterSuccess.allowed);

// ============================================================================
// SUITE 8: Comparison of Frontend vs Backend Normalization
// ============================================================================
console.log('\n--- Suite 8: Comparison of Frontend vs Backend Normalization ---');

const testCasesForParity = [
  '0966592831',
  '+84966592831',
  '+84 966 592 831',
  '0966 592 831',
  '0966.592.831',
  '0966-592-831',
  '+840966592831',
  'USER@EXAMPLE.COM',
  '  test@mealwise.vn  ',
  'admin',
  'admin@mealwise.vn'
];

for (const input of testCasesForParity) {
  const feNorm = normalizeIdentifier(input);
  const beNorm = backendNormalizeIdentifier(input);
  const match = feNorm === beNorm;

  assert(
    'Frontend vs Backend Parity',
    `Parity for "${input}": FE="${feNorm}" vs BE="${beNorm}"`,
    match,
    feNorm,
    beNorm
  );

  const feVal = validateEmailOrPhone(input);
  const beVal = backendIsValidIdentifier(input);
  assert(
    'Frontend vs Backend Validation Parity',
    `Validation parity for "${input}": FE=${feVal.valid} vs BE=${beVal.valid}`,
    feVal.valid === beVal.valid,
    feVal.valid,
    beVal.valid
  );
}

// ============================================================================
// SUMMARY & TELEMETRY
// ============================================================================
const total = results.length;
const passed = results.filter(r => r.passed).length;
const failed = total - passed;

console.log('\n======================================================================');
console.log('CHALLENGER 1 ADVERSARIAL STRESS TEST SUMMARY:');
console.log(`  • Total Assertions: ${total}`);
console.log(`  • Passed:           ${passed}`);
console.log(`  • Failed:           ${failed}`);
console.log(`  • Success Rate:     ${((passed / total) * 100).toFixed(1)}%`);
console.log('======================================================================');

if (failed > 0) {
  console.error(`\n❌ CHALLENGE FAILED: ${failed} assertion(s) failed.`);
  process.exit(1);
} else {
  console.log('\n✅ ALL ADVERSARIAL CHALLENGES PASSED EMPIRICALLY!');
  process.exit(0);
}
