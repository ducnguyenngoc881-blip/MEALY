import { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, beforeEach } from '../helpers/testRunner';
import {
  handleCollabRequest,
  serverUsers,
  serverOtpChallenges,
  serverSessions,
  normalizeIdentifier,
  isValidIdentifier,
  maskIdentifier
} from '../../scripts/collab-server-handler.js';

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
  json: any;
}

function mockReqRes(method: string, url: string, body: any = null) {
  const req: any = new EventEmitter();
  req.method = method;
  req.url = url;
  req.headers = { host: 'localhost:5173', 'content-type': 'application/json' };

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
    if (body) {
      req.emit('data', Buffer.from(typeof body === 'string' ? body : JSON.stringify(body)));
    }
    req.emit('end');
  });

  return { req, res, done: donePromise };
}

async function testEndpoint(method: string, url: string, body: any = null): Promise<MockResponse> {
  const { req, res, done } = mockReqRes(method, url, body);
  const handled = await handleCollabRequest(req, res);
  if (!handled) {
    throw new Error(`Endpoint ${method} ${url} was not handled by collab-server-handler!`);
  }
  return await done;
}

describe('Unit: Backend Auth Endpoints & Persistence Synchronization', () => {

  beforeEach(() => {
    // Clear test-specific user records and OTP challenges before each test (never touch real user accounts)
    serverUsers.delete('0933999888');
    serverUsers.delete('+84933999888');
    serverUsers.delete('0977123456');
    serverUsers.delete('0988000111');
    serverUsers.delete('testphone@mealwise.vn');
    serverOtpChallenges.delete('0933999888');
    serverOtpChallenges.delete('+84933999888');
  });

  it('POST /api/auth/register with phone 0933999888 returns HTTP 200 with user record and sessionToken', async () => {
    const res = await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'Password123',
      name: 'Nguyễn Văn Mealy'
    });

    expect(res.statusCode).toBe(200);
    expect(res.json.ok).toBe(true);
    expect(res.json.user).toBeTruthy();
    expect(res.json.user.identifier).toBe('0933999888');
    expect(res.json.user.phone).toBe('0933999888');
    expect(res.json.user.name).toBe('Nguyễn Văn Mealy');
    expect(res.json.user.authProvider).toBe('phone');
    expect(typeof res.json.sessionToken).toBe('string');
    expect(res.json.sessionToken.startsWith('sess_')).toBe(true);
  });

  it('POST /api/auth/register with +84933999888 normalizes to 0933999888', async () => {
    const res = await testEndpoint('POST', '/api/auth/register', {
      identifier: '+84933999888',
      password: 'Password123',
      name: 'Trần Văn Quốc Tế'
    });

    expect(res.statusCode).toBe(200);
    expect(res.json.ok).toBe(true);
    expect(res.json.user.identifier).toBe('0933999888');
    expect(res.json.user.phone).toBe('0933999888');
    expect(res.json.user.name).toBe('Trần Văn Quốc Tế');
  });

  it('POST /api/auth/register with duplicate identifier returns HTTP 409', async () => {
    // 1. Initial registration
    const firstReg = await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'Password123',
      name: 'Nguyễn Văn Gốc'
    });
    expect(firstReg.statusCode).toBe(200);

    // 2. Duplicate registration attempt with identical normalized phone (+84933999888)
    const dupRes = await testEndpoint('POST', '/api/auth/register', {
      identifier: '+84933999888',
      password: 'Password456'
    });

    expect(dupRes.statusCode).toBe(409);
    expect(dupRes.json.ok).toBe(false);
    expect(dupRes.json.message).toContain('Tài khoản đã tồn tại. Vui lòng đăng nhập.');
  });

  it('POST /api/auth/login with correct password returns HTTP 200', async () => {
    // Register account
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'CorrectPassword123',
      name: 'Lê Văn Chính'
    });

    // Login with correct password
    const loginRes = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: 'CorrectPassword123'
    });

    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.json.ok).toBe(true);
    expect(loginRes.json.user.identifier).toBe('0933999888');
    expect(loginRes.json.user.name).toBe('Lê Văn Chính');
    expect(typeof loginRes.json.sessionToken).toBe('string');
  });

  it('POST /api/auth/login with +84933999888 against 0933999888 returns HTTP 200 and preserves name', async () => {
    // Register with 0933999888
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'Password123',
      name: 'Hoàng Thị Thảo'
    });

    // Login with international format +84933999888 and an incoming override name
    const loginCross = await testEndpoint('POST', '/api/auth/login', {
      identifier: '+84933999888',
      password: 'Password123',
      name: 'IncomingOverwritingAttempt'
    });

    expect(loginCross.statusCode).toBe(200);
    expect(loginCross.json.ok).toBe(true);
    expect(loginCross.json.user.identifier).toBe('0933999888');
    // Display name must be preserved from initial registration
    expect(loginCross.json.user.name).toBe('Hoàng Thị Thảo');
  });

  it('POST /api/auth/login with wrong password returns HTTP 401', async () => {
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'RealPassword123',
      name: 'Phan Văn Bảo'
    });

    const wrongLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: 'IncorrectPassword'
    });

    expect(wrongLogin.statusCode).toBe(401);
    expect(wrongLogin.json.ok).toBe(false);
    expect(wrongLogin.json.message).toContain('Mật khẩu không chính xác.');
  });

  it('POST /api/auth/login with empty password returns HTTP 401', async () => {
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'RealPassword123'
    });

    // Empty string
    const emptyLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: ''
    });

    expect(emptyLogin.statusCode).toBe(401);
    expect(emptyLogin.json.ok).toBe(false);
    expect(emptyLogin.json.message).toContain('Vui lòng nhập mật khẩu.');

    // Whitespace only
    const spacesLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: '   '
    });

    expect(spacesLogin.statusCode).toBe(401);
    expect(spacesLogin.json.ok).toBe(false);
  });

  it('POST /api/auth/login with unregistered user returns HTTP 401', async () => {
    const unregLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0988000111',
      password: 'Password123'
    });

    expect(unregLogin.statusCode).toBe(401);
    expect(unregLogin.json.ok).toBe(false);
    expect(unregLogin.json.message).toContain('Tài khoản chưa tồn tại trên hệ thống. Vui lòng đăng ký trước.');
  });

  it('POST /api/auth/reset-password for phone user returns HTTP 200 and updates password hash', async () => {
    // 1. Register with initial password
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'OldPassword123',
      name: 'Vũ Đức Đam'
    });

    // 2. Reset password using spaced/dotted phone format
    const resetRes = await testEndpoint('POST', '/api/auth/reset-password', {
      identifier: '+84 933.999.888',
      newPassword: 'BrandNewPassword789'
    });

    expect(resetRes.statusCode).toBe(200);
    expect(resetRes.json.ok).toBe(true);
    expect(resetRes.json.message).toContain('Đã cập nhật mật khẩu mới thành công.');

    // 3. Login with old password fails (401)
    const oldLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: 'OldPassword123'
    });
    expect(oldLogin.statusCode).toBe(401);

    // 4. Login with new password succeeds (200)
    const newLogin = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: 'BrandNewPassword789'
    });
    expect(newLogin.statusCode).toBe(200);
    expect(newLogin.json.ok).toBe(true);
  });

  it('POST /api/auth/reset-password with clientSync: true upserts local-only user and sanitizes XSS on register', async () => {
    const syncReset = await testEndpoint('POST', '/api/auth/reset-password', {
      identifier: '0933999888',
      newPassword: 'DirectResetPass123',
      name: '<script>alert("xss")</script>Anh Tuấn',
      clientSync: true
    });
    expect(syncReset.statusCode).toBe(200);
    expect(syncReset.json.ok).toBe(true);
    expect(syncReset.json.user.name).toBe('Anh Tuấn');

    const loginAfter = await testEndpoint('POST', '/api/auth/login', {
      identifier: '0933999888',
      password: 'DirectResetPass123'
    });
    expect(loginAfter.statusCode).toBe(200);
    expect(loginAfter.json.user.name).toBe('Anh Tuấn');
  });

  it('POST /api/auth/otp/request for phone number returns HTTP 200 with On-Device SMS Simulation Relay', async () => {
    const otpRes = await testEndpoint('POST', '/api/auth/otp/request', {
      target: '+84 933 999 888',
      purpose: 'reset_password',
      bypassCooldown: true
    });

    expect(otpRes.statusCode).toBe(200);
    expect(otpRes.json.ok).toBe(true);
    expect(otpRes.json.smsSent).toBe(true);
    expect(otpRes.json.provider).toBe('On-Device SMS Simulation Relay');
    expect(otpRes.json.maskedTarget).toBe('0933***888');
    expect(typeof otpRes.json.otpCode).toBe('string');
    expect(otpRes.json.otpCode.length).toBe(6);

    // Verify OTP verification endpoint works with the generated OTP code
    const verifyRes = await testEndpoint('POST', '/api/auth/otp/verify', {
      target: '0933999888',
      code: otpRes.json.otpCode
    });

    expect(verifyRes.statusCode).toBe(200);
    expect(verifyRes.json.valid).toBe(true);
    expect(verifyRes.json.message).toContain('Xác thực bảo mật OTP thành công!');
  });

  it('verifies persistence writes to .server-data directory and survives reload', async () => {
    // 1. Register a persistent user
    await testEndpoint('POST', '/api/auth/register', {
      identifier: '0933999888',
      password: 'PersistencePassword123',
      name: 'Người Dùng Bền Vững'
    });

    // 2. Check that .server-data exists
    const dataDir = path.resolve(process.cwd(), '.server-data');
    expect(fs.existsSync(dataDir)).toBe(true);

    // 3. Check that server-database.json exists in .server-data
    const serverDbFile = path.resolve(dataDir, 'server-database.json');
    expect(fs.existsSync(serverDbFile)).toBe(true);

    // 4. Verify file content contains user record
    const serverDb = JSON.parse(fs.readFileSync(serverDbFile, 'utf-8'));
    expect(serverDb.users).toBeTruthy();
    expect(serverDb.users['0933999888']).toBeTruthy();
    expect(serverDb.users['0933999888'].name).toBe('Người Dùng Bền Vững');
    expect(serverDb.users['0933999888'].identifier).toBe('0933999888');

    // Clean up test user from persistent server database so live dev server isn't polluted by test data
    serverUsers.delete('0933999888');
    serverOtpChallenges.delete('0933999888');
    delete serverDb.users['0933999888'];
    fs.writeFileSync(serverDbFile, JSON.stringify(serverDb, null, 2), 'utf-8');
  });

  it('rejects short passwords and invalid identifiers with HTTP 400', async () => {
    // Short password (< 6 chars)
    const shortPassRes = await testEndpoint('POST', '/api/auth/register', {
      identifier: '0977123456',
      password: '123'
    });
    expect(shortPassRes.statusCode).toBe(400);
    expect(shortPassRes.json.message).toContain('6 ký tự trở lên');

    // Invalid identifier (not valid phone or email)
    const invalidIdRes = await testEndpoint('POST', '/api/auth/register', {
      identifier: 'not-a-valid-phone-or-email',
      password: 'ValidPassword123'
    });
    expect(invalidIdRes.statusCode).toBe(400);
    expect(invalidIdRes.json.message).toContain('không hợp lệ');
  });

});
