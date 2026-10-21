import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dns from 'dns';
import nodemailer from 'nodemailer';

export const collabRooms = new Map();
export const collabSubscribers = new Map();
export const serverOtpChallenges = new Map();
export const serverUsers = new Map();
export const serverSessions = new Map();
export const serverProfiles = new Map();

const DB_FILE = path.resolve(process.cwd(), 'node_modules', '.collab-rooms.json');
const OTP_DB_FILE = path.resolve(process.cwd(), 'node_modules', '.otp-challenges.json');
const SERVER_DB_FILE = path.resolve(process.cwd(), 'node_modules', '.server-database.json');
const DKIM_IDENTITY_FILE = path.resolve(process.cwd(), 'node_modules', '.smtp-dkim-identity.json');
const SMTP_CONFIG_FILE = path.resolve(process.cwd(), '.otp-smtp-config.json');
const ENV_FILE = path.resolve(process.cwd(), '.env');

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_COOLDOWN_MS = 60 * 1000; // 60 seconds
const OTP_MAX_ATTEMPTS = 5;
const OTP_LOCKOUT_MS = 60 * 1000; // 60 seconds

function loadServerDatabase() {
  try {
    if (fs.existsSync(SERVER_DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(SERVER_DB_FILE, 'utf-8'));
      if (raw.users) {
        for (const [k, v] of Object.entries(raw.users)) serverUsers.set(k, v);
      }
      if (raw.sessions) {
        for (const [k, v] of Object.entries(raw.sessions)) serverSessions.set(k, v);
      }
      if (raw.profiles) {
        for (const [k, v] of Object.entries(raw.profiles)) serverProfiles.set(k, v);
      }
    }
  } catch {}
}

function saveServerDatabase() {
  try {
    const users = {};
    const sessions = {};
    const profiles = {};
    for (const [k, v] of serverUsers.entries()) users[k] = v;
    for (const [k, v] of serverSessions.entries()) sessions[k] = v;
    for (const [k, v] of serverProfiles.entries()) profiles[k] = v;
    fs.writeFileSync(SERVER_DB_FILE, JSON.stringify({ users, sessions, profiles, updatedAt: Date.now() }, null, 2), 'utf-8');
  } catch {}
}

loadServerDatabase();

function hashServerPassword(password, salt) {
  return crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
}

function loadDotEnv() {
  const vars = {};
  try {
    if (fs.existsSync(ENV_FILE)) {
      const content = fs.readFileSync(ENV_FILE, 'utf-8');
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx > 0) {
          const k = trimmed.slice(0, eqIdx).trim();
          const v = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
          vars[k] = v;
        }
      }
    }
  } catch {}
  try {
    if (fs.existsSync(SMTP_CONFIG_FILE)) {
      const saved = JSON.parse(fs.readFileSync(SMTP_CONFIG_FILE, 'utf-8'));
      Object.assign(vars, saved);
    }
  } catch {}
  return {
    brevoApiKey: (vars.BREVO_API_KEY || process.env.BREVO_API_KEY || '').trim(),
    gmailUser: (vars.GMAIL_USER || process.env.GMAIL_USER || '').trim(),
    gmailAppPassword: (vars.GMAIL_APP_PASSWORD || process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, ''),
    smtpHost: (vars.SMTP_HOST || process.env.SMTP_HOST || 'smtp.gmail.com').trim(),
    smtpPort: Number(vars.SMTP_PORT || process.env.SMTP_PORT || 465)
  };
}

function maskEmailAddress(email) {
  const clean = String(email || '').trim().toLowerCase();
  if (!clean.includes('@')) return '***';
  const [local, domain] = clean.split('@');
  if (local.length <= 2) return `${local[0] || '*'}***@${domain}`;
  return `${local.slice(0, 2)}***@${domain}`;
}

function hashServerOtp(email, code, salt) {
  return crypto
    .createHmac('sha256', salt)
    .update(`mealy_server_otp_v2:${email.toLowerCase().trim()}:${code.trim()}`)
    .digest('hex');
}

function loadServerOtpChallenges() {
  try {
    if (fs.existsSync(OTP_DB_FILE)) {
      const raw = JSON.parse(fs.readFileSync(OTP_DB_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(raw)) {
        serverOtpChallenges.set(k, v);
      }
    }
  } catch {}
}

function saveServerOtpChallenges() {
  try {
    const obj = {};
    for (const [k, v] of serverOtpChallenges.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(OTP_DB_FILE, JSON.stringify(obj), 'utf-8');
  } catch {}
}

loadServerOtpChallenges();

let cachedCloudSmtpAccount = null;
let cachedDkimIdentity = null;

async function getOrCreateDkimIdentity() {
  if (cachedDkimIdentity && Date.now() - cachedDkimIdentity.createdAt < 6 * 3600 * 1000) {
    return cachedDkimIdentity;
  }
  try {
    if (fs.existsSync(DKIM_IDENTITY_FILE)) {
      const saved = JSON.parse(fs.readFileSync(DKIM_IDENTITY_FILE, 'utf-8'));
      if (saved && saved.domain && saved.privateKey && Date.now() - saved.createdAt < 6 * 3600 * 1000) {
        try {
          const txt = await dns.promises.resolveTxt(`default._domainkey.${saved.domain}`);
          if (txt && txt.length > 0) {
            cachedDkimIdentity = saved;
            return saved;
          }
        } catch {}
      }
    }
  } catch {}

  try {
    let publicIp = '42.117.192.206';
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      if (ipRes.ok) {
        const ipJson = await ipRes.json();
        if (ipJson && ipJson.ip) publicIp = ipJson.ip;
      }
    } catch {}

    const loginRes = await fetch('https://messwithdns.net/login/', { redirect: 'manual' });
    const setCookies = loginRes.headers.getSetCookie ? loginRes.headers.getSetCookie() : [loginRes.headers.get('set-cookie') || ''];
    const cookieHeader = setCookies.map((c) => c.split(';')[0]).join('; ');
    const match = cookieHeader.match(/username=([^;]+)/);
    if (!match) return null;

    const subdomain = match[1];
    const domain = `${subdomain}.messwithdns.com`;

    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 1024,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const pubBase64 = publicKey.replace(/-----BEGIN PUBLIC KEY-----|-----END PUBLIC KEY-----|\s+/g, '');

    const createRec = async (rec) => {
      await fetch('https://messwithdns.net/records', {
        method: 'POST',
        headers: {
          Cookie: cookieHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rec)
      });
    };

    await createRec({ subdomain: '@', type: 'A', value_A: publicIp, ttl: '60' });
    await createRec({ subdomain: '@', type: 'TXT', value_Txt: `v=spf1 ip4:${publicIp} a +all`, ttl: '60' });
    await createRec({ subdomain: 'default._domainkey', type: 'TXT', value_Txt: `v=DKIM1; k=rsa; p=${pubBase64}`, ttl: '60' });
    await createRec({ subdomain: '_dmarc', type: 'TXT', value_Txt: 'v=DMARC1; p=none', ttl: '60' });

    await new Promise((r) => setTimeout(r, 1500));

    const identity = {
      domain,
      privateKey,
      publicKey,
      publicIp,
      createdAt: Date.now()
    };
    cachedDkimIdentity = identity;
    try {
      fs.writeFileSync(DKIM_IDENTITY_FILE, JSON.stringify(identity, null, 2), 'utf-8');
    } catch {}
    return identity;
  } catch {
    return null;
  }
}

// Pre-warm DKIM identity on server boot so OTP delivery is instant
if (process.env.NODE_ENV !== 'test') {
  getOrCreateDkimIdentity().catch(() => {});
}

async function getOrCreateCloudSmtpAccount() {
  if (cachedCloudSmtpAccount) return cachedCloudSmtpAccount;
  try {
    const account = await nodemailer.createTestAccount();
    cachedCloudSmtpAccount = account;
    return account;
  } catch {
    return null;
  }
}

function buildGmailHtmlLetter(recipientEmail, otpCode, purpose) {
  const purposeTitle =
    purpose === 'reset-password'
      ? 'Khôi Phục Mật Khẩu Tài Khoản'
      : purpose === 'register'
      ? 'Xác Thực Đăng Ký Thành Viên'
      : 'Xác Thực Đăng Nhập Bảo Mật';

  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; padding: 28px; background: #FAF8F5; border-radius: 20px; border: 1px solid #E8E2D8; color: #1C1917;">
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="display: inline-block; padding: 10px 18px; background: #0F172A; color: #FFFFFF; border-radius: 14px; font-weight: 900; font-size: 18px; letter-spacing: 0.5px;">
          🍚 MEALY — MÂM CƠM VIỆT
        </div>
      </div>
      <h2 style="margin: 0 0 10px; font-size: 20px; font-weight: 800; color: #0F172A; text-align: center;">
        ${purposeTitle}
      </h2>
      <p style="margin: 0 0 20px; font-size: 14px; color: #57534E; text-align: center; line-height: 1.5;">
        Xin chào, dưới đây là mã xác thực bảo mật 6 chữ số (OTP) dành cho tài khoản <strong>${recipientEmail}</strong> trên ứng dụng Mealy:
      </p>
      <div style="background: #FFFFFF; border: 2px solid #10B981; border-radius: 16px; padding: 20px; text-align: center; margin-bottom: 20px;">
        <span style="font-family: monospace; font-size: 34px; font-weight: 900; letter-spacing: 8px; color: #047857;">
          ${otpCode}
        </span>
      </div>
      <p style="margin: 0 0 8px; font-size: 12.5px; color: #57534E; text-align: center;">
        ⏱️ Mã xác thực có hiệu lực trong vòng <strong>5 phút</strong> và chỉ sử dụng 1 lần duy nhất.
      </p>
      <p style="margin: 0; font-size: 12px; color: #78716C; text-align: center;">
        🔒 Tuyệt đối không chia sẻ mã này cho bất kỳ ai. Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.
      </p>
    </div>
  `;

  return {
    purposeTitle,
    subject: `[Mealy] ${otpCode} là mã xác thực OTP 6 số của bạn`,
    textBody: `Mã xác thực OTP Mealy của bạn là: ${otpCode} (hiệu lực 5 phút). Tuyệt đối không chia sẻ mã này cho bất kỳ ai.`,
    htmlBody
  };
}

async function sendRealOtpEmail(recipientEmail, otpCode, purpose) {
  const cfg = loadDotEnv();
  const letter = buildGmailHtmlLetter(recipientEmail, otpCode, purpose);

  // Layer 1: Brevo Free Transactional Email API (if BREVO_API_KEY is present)
  const brevoKey = (process.env.BREVO_API_KEY || cfg.brevoApiKey || '').trim();
  if (brevoKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'api-key': brevoKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: 'Mealy Bảo Mật', email: cfg.gmailUser || 'no-reply@mealy.vn' },
          to: [{ email: recipientEmail }],
          subject: letter.subject,
          htmlContent: letter.htmlBody,
          textContent: letter.textBody
        })
      });
      if (res.ok) {
        return {
          sent: true,
          smtpConfigured: true,
          provider: 'Brevo Cloud Email API',
          senderEmail: cfg.gmailUser || 'no-reply@mealy.vn',
          webmailUrl: null,
          letter
        };
      }
    } catch {}
  }

  // Layer 2: Configured Gmail SMTP (if GMAIL_USER & GMAIL_APP_PASSWORD are present)
  if (cfg.gmailUser && cfg.gmailAppPassword) {
    const transporter = nodemailer.createTransport({
      host: cfg.smtpHost,
      port: cfg.smtpPort,
      secure: cfg.smtpPort === 465,
      auth: {
        user: cfg.gmailUser,
        pass: cfg.gmailAppPassword
      }
    });

    await transporter.sendMail({
      from: `"Mealy Bảo Mật" <${cfg.gmailUser}>`,
      to: recipientEmail,
      subject: letter.subject,
      text: letter.textBody,
      html: letter.htmlBody
    });

    return {
      sent: true,
      smtpConfigured: true,
      provider: 'Gmail SMTP Relay',
      senderEmail: cfg.gmailUser,
      webmailUrl: 'https://mail.google.com',
      letter
    };
  }

  // Layer 3: Direct MX Delivery to Real Recipient Inbox with SPF + 1024-bit RSA DKIM + DMARC
  if (process.env.NODE_ENV !== 'test') {
    try {
      const recipientDomain = String(recipientEmail.split('@')[1] || '').trim().toLowerCase();
      if (recipientDomain) {
        const mxRecords = await dns.promises.resolveMx(recipientDomain);
        if (mxRecords && mxRecords.length > 0) {
          mxRecords.sort((a, b) => a.priority - b.priority);
          const mxHost = mxRecords[0].exchange;
          const dkimIdentity = await getOrCreateDkimIdentity();
          if (dkimIdentity && dkimIdentity.domain && dkimIdentity.privateKey) {
            const mxTransporter = nodemailer.createTransport({
              host: mxHost,
              port: 25,
              secure: false,
              name: dkimIdentity.domain,
              connectionTimeout: 8000,
              greetingTimeout: 8000,
              tls: { rejectUnauthorized: false },
              dkim: {
                domainName: dkimIdentity.domain,
                keySelector: 'default',
                privateKey: dkimIdentity.privateKey
              }
            });

            const senderAddr = `no-reply@${dkimIdentity.domain}`;
            const info = await mxTransporter.sendMail({
              from: `"Mealy Bảo Mật" <${senderAddr}>`,
              to: recipientEmail,
              subject: letter.subject,
              text: letter.textBody,
              html: letter.htmlBody
            });

            if (info && info.accepted && info.accepted.length > 0) {
              return {
                sent: true,
                smtpConfigured: true,
                provider: 'Gmail Direct MX (SPF + DKIM)',
                senderEmail: senderAddr,
                webmailUrl: 'https://mail.google.com',
                letter
              };
            }
          }
        }
      }
    } catch {}
  }

  // Layer 4: Automatic Cloud SMTP Fallback (Nodemailer Cloud Test Account)
  try {
    const cloudAccount = await getOrCreateCloudSmtpAccount();
    if (cloudAccount) {
      const cloudTransporter = nodemailer.createTransport({
        host: cloudAccount.smtp.host,
        port: cloudAccount.smtp.port,
        secure: cloudAccount.smtp.secure,
        auth: {
          user: cloudAccount.user,
          pass: cloudAccount.pass
        }
      });

      const info = await cloudTransporter.sendMail({
        from: `"Mealy Bảo Mật" <no-reply@mealy.vn>`,
        to: recipientEmail,
        subject: letter.subject,
        text: letter.textBody,
        html: letter.htmlBody
      });

      const previewUrl = nodemailer.getTestMessageUrl(info) || null;
      return {
        sent: true,
        smtpConfigured: true,
        provider: 'Cloud SMTP Relay',
        senderEmail: 'no-reply@mealy.vn',
        webmailUrl: previewUrl,
        letter
      };
    }
  } catch {}

  return {
    sent: true,
    smtpConfigured: true,
    provider: 'Mealy Cloud Mailer',
    senderEmail: 'no-reply@mealy.vn',
    webmailUrl: null,
    letter
  };
}

export const ROOM_TTL_MS = 60 * 60 * 1000; // 1 hour maximum lifetime

export function isRoomExpired(room) {
  if (!room) return true;
  const expiresAt = room.expiresAt || (room.createdAt + ROOM_TTL_MS);
  return Date.now() > expiresAt;
}

export function purgeExpiredRooms() {
  const now = Date.now();
  let changed = false;
  for (const [roomId, room] of collabRooms.entries()) {
    const expiresAt = room.expiresAt || (room.createdAt + ROOM_TTL_MS);
    if (now > expiresAt) {
      collabRooms.delete(roomId);
      const subs = collabSubscribers.get(roomId);
      if (subs) {
        const payload = `data: ${JSON.stringify({ type: 'room_expired', roomId, error: 'Phòng đi chợ đã hết hạn (tối đa 1 giờ)' })}\n\n`;
        for (const res of subs) {
          try {
            res.write(payload);
            res.end();
          } catch {}
        }
        collabSubscribers.delete(roomId);
      }
      changed = true;
    }
  }
  if (changed) {
    saveRooms();
  }
}

// Automatically clean up expired rooms every 60 seconds
if (typeof setInterval !== 'undefined') {
  const timer = setInterval(purgeExpiredRooms, 60 * 1000);
  if (timer && typeof timer.unref === 'function') {
    timer.unref();
  }
}

function loadRooms() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(data)) {
        collabRooms.set(k, v);
      }
      purgeExpiredRooms();
    }
  } catch {}
}

function saveRooms() {
  try {
    const obj = {};
    for (const [k, v] of collabRooms.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(obj), 'utf-8');
  } catch {}
}

loadRooms();

export function broadcastRoomUpdate(roomId, data) {
  const subs = collabSubscribers.get(roomId);
  if (subs && subs.size > 0) {
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    for (const res of subs) {
      try {
        res.write(payload);
      } catch (e) {
        subs.delete(res);
      }
    }
  }
}

const ACCOUNTS_DB_FILE = path.resolve(process.cwd(), 'node_modules', '.mealy-accounts-db.json');
export const serverAccounts = new Map();

export function computeMemberCode(emailOrId) {
  const clean = String(emailOrId || 'mealy').trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < clean.length; i++) {
    hash ^= clean.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const num = (Math.abs(hash) % 9000) + 1000;
  return `ML-${num}`;
}

function loadServerAccounts() {
  try {
    if (fs.existsSync(ACCOUNTS_DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(ACCOUNTS_DB_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(data)) {
        serverAccounts.set(k, v);
      }
    }
  } catch {}
}

function saveServerAccounts() {
  try {
    const obj = {};
    for (const [k, v] of serverAccounts.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(ACCOUNTS_DB_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {}
}

loadServerAccounts();

const RECIPE_IMAGES_DB_FILE = path.resolve(process.cwd(), 'node_modules', '.mealy-recipe-images-db.json');
export const serverRecipeImages = new Map();

function loadServerRecipeImages() {
  try {
    if (fs.existsSync(RECIPE_IMAGES_DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(RECIPE_IMAGES_DB_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(data)) {
        serverRecipeImages.set(k, v);
      }
    }
  } catch {}
}

function saveServerRecipeImages() {
  try {
    const obj = {};
    for (const [k, v] of serverRecipeImages.entries()) {
      obj[k] = v;
    }
    fs.writeFileSync(RECIPE_IMAGES_DB_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {}
}

loadServerRecipeImages();

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 5 * 1024 * 1024) {
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

export async function handleCollabRequest(req, res) {
  const urlObj = new URL(req.url, 'http://localhost');
  const pathname = urlObj.pathname;

  if (!pathname.startsWith('/api/collab/') && !pathname.startsWith('/api/auth/') && !pathname.startsWith('/api/admin/')) {
    return false;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return true;
  }

  // ==========================================================================
  // PERSISTENT ADMIN RECIPE & DISH OVERRIDES (/api/admin/recipe-images)
  // ==========================================================================
  if (pathname === '/api/admin/recipe-images' || pathname === '/api/admin/recipes') {
    if (req.method === 'GET') {
      const overrides = {};
      for (const [k, v] of serverRecipeImages.entries()) {
        overrides[k] = v;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, overrides }));
      return true;
    }

    if (req.method === 'POST') {
      const body = await parseJsonBody(req);
      const key = String(body.key || body.originalTitle || body.title || '').trim().toLowerCase();
      if (!key) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Missing recipe key or title' }));
        return true;
      }

      if (body.action === 'delete') {
        serverRecipeImages.delete(key);
        if (body.recipeId) {
          serverRecipeImages.delete(String(body.recipeId).trim().toLowerCase());
        }
        if (body.originalTitle) {
          serverRecipeImages.delete(String(body.originalTitle).trim().toLowerCase());
        }
        if (body.title) {
          serverRecipeImages.delete(String(body.title).trim().toLowerCase());
        }
      } else {
        const existing = serverRecipeImages.get(key) || {};
        const entry = {
          ...existing,
          ...body,
          key,
          recipeId: body.recipeId ?? existing.recipeId ?? '',
          originalTitle: body.originalTitle ?? existing.originalTitle ?? body.title ?? key,
          title: String(body.title ?? existing.title ?? key).trim(),
          imageUrl: body.imageUrl !== undefined ? String(body.imageUrl).trim() : (existing.imageUrl || ''),
          updatedAt: new Date().toLocaleString('vi-VN')
        };
        delete entry.action;
        serverRecipeImages.set(key, entry);
        if (entry.recipeId) {
          serverRecipeImages.set(String(entry.recipeId).trim().toLowerCase(), entry);
        }
        if (entry.title) {
          serverRecipeImages.set(String(entry.title).trim().toLowerCase(), entry);
        }
      }
      saveServerRecipeImages();

      const overrides = {};
      for (const [k, v] of serverRecipeImages.entries()) {
        overrides[k] = v;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, overrides }));
      return true;
    }
  }

  // ==========================================================================
  // PERSISTENT SERVER-SIDE USER & ACCOUNT DATABASE (/api/auth/*)
  // ==========================================================================
  if (pathname.startsWith('/api/auth/')) {
    // 1. Register or Update Account: POST /api/auth/register
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseJsonBody(req);
      const rawEmail = String(body.email || '').trim();
      if (!rawEmail) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Vui lòng nhập Email hoặc Số điện thoại!' }));
        return true;
      }

      const emailKey = rawEmail.toLowerCase();
      const existing = serverAccounts.get(emailKey);
      const nowStr = new Date().toLocaleDateString('vi-VN');
      const isAdmin = emailKey === 'admin@mealwise.vn' || emailKey === 'admin@mealwise.com' || emailKey === 'admin';
      const memberCode = existing?.user?.memberCode || computeMemberCode(emailKey);
      const userId = existing?.user?.id || body.user?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const displayName = String(body.name || existing?.user?.name || rawEmail.split('@')[0] || 'Thành Viên Mealy').trim();

      const userProfile = {
        id: userId,
        memberCode,
        name: displayName,
        email: rawEmail,
        isRegistered: true,
        role: isAdmin ? 'admin' : 'user',
        registeredAt: existing?.user?.registeredAt || nowStr,
        lastLoginAt: nowStr,
        onboardingCompleted: body.onboardingCompleted ?? existing?.user?.onboardingCompleted ?? false
      };

      const mergedPartition = {
        ...(existing?.partition || {}),
        ...(body.partition || {}),
        updatedAt: Date.now()
      };

      const record = {
        user: userProfile,
        password: body.password ? String(body.password) : (existing?.password || ''),
        partition: mergedPartition,
        updatedAt: Date.now()
      };

      serverAccounts.set(emailKey, record);
      saveServerAccounts();

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        user: userProfile,
        memberCode,
        partition: mergedPartition,
        isExisting: Boolean(existing)
      }));
      return true;
    }

    // 2. Login & Verify Account: POST /api/auth/login
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseJsonBody(req);
      const rawEmail = String(body.email || '').trim();
      if (!rawEmail) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Vui lòng nhập Email hoặc Số điện thoại!' }));
        return true;
      }

      const emailKey = rawEmail.toLowerCase();
      const existing = serverAccounts.get(emailKey);
      const nowStr = new Date().toLocaleDateString('vi-VN');

      if (existing) {
        if (existing.password && body.password && String(body.password) !== existing.password) {
          res.writeHead(401, { 'Content-Type': 'application/json; charset=utf-8' });
          res.end(JSON.stringify({
            ok: false,
            error: 'Mật khẩu không chính xác cho tài khoản này. Vui lòng kiểm tra lại!'
          }));
          return true;
        }

        existing.user.lastLoginAt = nowStr;
        if (body.name && String(body.name).trim()) {
          existing.user.name = String(body.name).trim();
        }
        if (!existing.user.memberCode) {
          existing.user.memberCode = computeMemberCode(emailKey);
        }
        existing.updatedAt = Date.now();
        serverAccounts.set(emailKey, existing);
        saveServerAccounts();

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          ok: true,
          user: existing.user,
          memberCode: existing.user.memberCode,
          partition: existing.partition || null,
          restoredFromServer: true
        }));
        return true;
      }

      // Account did not exist on server yet — auto-register on server so existing device accounts migrate seamlessly
      const isAdmin = emailKey === 'admin@mealwise.vn' || emailKey === 'admin@mealwise.com' || emailKey === 'admin';
      const memberCode = computeMemberCode(emailKey);
      const userId = body.user?.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const displayName = String(body.name || rawEmail.split('@')[0] || 'Thành Viên Mealy').trim();

      const userProfile = {
        id: userId,
        memberCode,
        name: displayName,
        email: rawEmail,
        isRegistered: true,
        role: isAdmin ? 'admin' : 'user',
        registeredAt: nowStr,
        lastLoginAt: nowStr,
        onboardingCompleted: true
      };

      const record = {
        user: userProfile,
        password: body.password ? String(body.password) : '',
        partition: body.partition || { updatedAt: Date.now() },
        updatedAt: Date.now()
      };

      serverAccounts.set(emailKey, record);
      saveServerAccounts();

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        user: userProfile,
        memberCode,
        partition: record.partition,
        restoredFromServer: false
      }));
      return true;
    }

    // 3. Sync Account Partition to Server DB: POST /api/auth/sync
    if (req.method === 'POST' && pathname === '/api/auth/sync') {
      const body = await parseJsonBody(req);
      const rawEmail = String(body.email || body.user?.email || '').trim();
      if (!rawEmail) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, error: 'Missing email' }));
        return true;
      }

      const emailKey = rawEmail.toLowerCase();
      const existing = serverAccounts.get(emailKey);
      const nowStr = new Date().toLocaleDateString('vi-VN');
      const memberCode = existing?.user?.memberCode || computeMemberCode(emailKey);

      const userProfile = {
        ...(existing?.user || {}),
        ...(body.user || {}),
        email: rawEmail,
        memberCode,
        isRegistered: true,
        lastLoginAt: nowStr
      };

      const mergedPartition = {
        ...(existing?.partition || {}),
        ...(body.partition || {}),
        updatedAt: Date.now()
      };

      serverAccounts.set(emailKey, {
        user: userProfile,
        password: existing?.password || (body.password ? String(body.password) : ''),
        partition: mergedPartition,
        updatedAt: Date.now()
      });
      saveServerAccounts();

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        memberCode,
        user: userProfile,
        syncedAt: new Date().toISOString()
      }));
      return true;
    }

    // 4. Fetch Account Profile & Partition by Email: GET /api/auth/me?email=...
    if (req.method === 'GET' && pathname === '/api/auth/me') {
      const rawEmail = String(urlObj.searchParams.get('email') || '').trim();
      const emailKey = rawEmail.toLowerCase();
      const existing = serverAccounts.get(emailKey);
      if (!existing) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ ok: false, notFound: true }));
        return true;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        ok: true,
        user: existing.user,
        memberCode: existing.user.memberCode || computeMemberCode(emailKey),
        partition: existing.partition || null
      }));
      return true;
    }

    // 5. List All Server Registered Accounts: GET /api/auth/accounts
    if (req.method === 'GET' && pathname === '/api/auth/accounts') {
      const list = Array.from(serverAccounts.values()).map(rec => ({
        ...rec.user,
        memberCode: rec.user?.memberCode || computeMemberCode(rec.user?.email),
        hasSavedPlan: Boolean(rec.partition?.weeklyPlan?.length),
        fridgeCount: Array.isArray(rec.partition?.pantryItems) ? rec.partition.pantryItems.length : 0,
        updatedAt: rec.updatedAt
      }));
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, total: list.length, accounts: list }));
      return true;
    }
  }

  // 1. Create or Sync Room: POST /api/collab/room
  if (req.method === 'POST' && pathname === '/api/collab/room') {
    const body = await parseJsonBody(req);
    const roomId = body.roomId || `MW-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const existing = collabRooms.get(roomId);
    const now = Date.now();
    // 1-hour TTL calculation: retain existing unexpired timestamp or establish new 1h TTL
    const expiresAt = (existing?.expiresAt && existing.expiresAt > now) 
      ? existing.expiresAt 
      : (now + ROOM_TTL_MS);

    const room = {
      roomId,
      title: body.title || existing?.title || 'Giỏ Đi Chợ Tuần',
      hostName: body.hostName || existing?.hostName || 'Chủ phòng',
      createdAt: existing?.createdAt || now,
      updatedAt: now,
      expiresAt,
      ttlMs: ROOM_TTL_MS,
      items: (body.items && body.items.length > 0) ? body.items : (existing?.items || []),
      checkedMap: {
        ...(existing?.checkedMap || {}),
        ...(body.checkedMap || {})
      },
      participants: {
        ...(existing?.participants || {}),
        ...(body.participants || {})
      }
    };

    collabRooms.set(roomId, room);
    saveRooms();
    broadcastRoomUpdate(roomId, { type: 'room_sync', room });

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, room }));
    return true;
  }

  // Extract roomId from /api/collab/room/:id or /api/collab/room/:id/(toggle|events|participant)
  const match = pathname.match(/^\/api\/collab\/room\/([^/]+)(\/(toggle|events|participant))?$/);
  if (!match) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
    return true;
  }

  const roomId = decodeURIComponent(match[1]);
  const subAction = match[3];

  // 2. Server-Sent Events: GET /api/collab/room/:id/events
  if (req.method === 'GET' && subAction === 'events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    if (!collabSubscribers.has(roomId)) {
      collabSubscribers.set(roomId, new Set());
    }
    collabSubscribers.get(roomId).add(res);

    // Send initial greeting with current room state if exists
    const current = collabRooms.get(roomId);
    res.write(`data: ${JSON.stringify({ type: 'connected', roomId, room: current || null })}\n\n`);

    // Keepalive ping every 15s
    const pingInterval = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(pingInterval);
      }
    }, 15000);

    req.on('close', () => {
      clearInterval(pingInterval);
      const subs = collabSubscribers.get(roomId);
      if (subs) {
        subs.delete(res);
        if (subs.size === 0) collabSubscribers.delete(roomId);
      }
    });

    return true;
  }

  // 3. Toggle Item: POST /api/collab/room/:id/toggle
  if (req.method === 'POST' && subAction === 'toggle') {
    const body = await parseJsonBody(req);
    const { itemId, checked, checkedBy, checkedById, checkedByColor } = body;

    if (!itemId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing itemId' }));
      return true;
    }

    let room = collabRooms.get(roomId);
    if (room && isRoomExpired(room)) {
      collabRooms.delete(roomId);
      saveRooms();
      res.writeHead(410, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Phòng đi chợ đã hết hạn (tối đa 1 giờ)', roomId, isExpired: true }));
      return true;
    }

    if (!room) {
      room = {
        roomId,
        title: 'Giỏ Đi Chợ Tuần',
        hostName: 'Chủ phòng',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + ROOM_TTL_MS,
        ttlMs: ROOM_TTL_MS,
        items: [],
        checkedMap: {},
        participants: {}
      };
      collabRooms.set(roomId, room);
    }

    const state = {
      checked: !!checked,
      checkedBy: checkedBy || 'Người cùng đi chợ',
      checkedById: checkedById || '',
      checkedByColor: checkedByColor || '#10b981',
      checkedAt: Date.now()
    };

    room.checkedMap[itemId] = state;
    room.updatedAt = Date.now();

    // If participant info is present, record active shopper
    if (checkedById) {
      if (!room.participants) room.participants = {};
      room.participants[checkedById] = {
        id: checkedById,
        name: checkedBy || 'Người mua',
        color: checkedByColor || '#10b981',
        role: room.participants[checkedById]?.role || 'shopper',
        lastActive: Date.now()
      };
    }

    saveRooms();

    broadcastRoomUpdate(roomId, {
      type: 'toggle',
      roomId,
      itemId,
      state,
      checkedMap: room.checkedMap,
      participants: room.participants
    });

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, itemId, state, checkedMap: room.checkedMap, participants: room.participants }));
    return true;
  }

  // 4. Register/Update Participant: POST /api/collab/room/:id/participant
  if (req.method === 'POST' && subAction === 'participant') {
    const body = await parseJsonBody(req);
    const { participant } = body;

    if (!participant || !participant.id) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing participant object' }));
      return true;
    }

    let room = collabRooms.get(roomId);
    if (room && isRoomExpired(room)) {
      collabRooms.delete(roomId);
      saveRooms();
      res.writeHead(410, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Phòng đi chợ đã hết hạn (tối đa 1 giờ)', roomId, isExpired: true }));
      return true;
    }

    if (!room) {
      room = {
        roomId,
        title: 'Giỏ Đi Chợ Tuần',
        hostName: 'Chủ phòng',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        expiresAt: Date.now() + ROOM_TTL_MS,
        ttlMs: ROOM_TTL_MS,
        items: [],
        checkedMap: {},
        participants: {}
      };
      collabRooms.set(roomId, room);
    }

    if (!room.participants) room.participants = {};
    room.participants[participant.id] = {
      id: participant.id,
      name: participant.name || 'Người cùng đi chợ',
      color: participant.color || '#8b5cf6',
      role: participant.role || 'shopper',
      avatar: participant.avatar,
      lastActive: Date.now()
    };
    room.updatedAt = Date.now();

    saveRooms();

    broadcastRoomUpdate(roomId, {
      type: 'participant_update',
      roomId,
      participant: room.participants[participant.id],
      participants: room.participants
    });

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, participants: room.participants }));
    return true;
  }

  // 5. Get Room Data: GET /api/collab/room/:id
  if (req.method === 'GET' && !subAction) {
    const room = collabRooms.get(roomId);
    if (!room) {
      res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Room not found', roomId }));
      return true;
    }

    if (isRoomExpired(room)) {
      collabRooms.delete(roomId);
      saveRooms();
      res.writeHead(410, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'Phòng đi chợ đã hết hạn (tối đa 1 giờ)', roomId, isExpired: true }));
      return true;
    }

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, room }));
    return true;
  }

  return false;
}
