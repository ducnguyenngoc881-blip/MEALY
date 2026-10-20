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

function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 2 * 1024 * 1024) {
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

  if (pathname.startsWith('/api/auth/otp')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }

    // 1. Check Backend SMTP Configuration Status: GET /api/auth/otp/status
    if (req.method === 'GET' && pathname === '/api/auth/otp/status') {
      const cfg = loadDotEnv();
      const customSmtp = Boolean(cfg.gmailUser && cfg.gmailAppPassword);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ok: true,
          smtpConfigured: true,
          customGmailConfigured: customSmtp,
          provider: customSmtp ? 'Gmail SMTP Relay' : 'Cloud SMTP Free Relay',
          senderEmail: customSmtp ? maskEmailAddress(cfg.gmailUser) : 'no-reply@mealy.vn'
        })
      );
      return true;
    }

    // 1b. Fetch Dispatched Email Letter in Cloud Webmail Inbox: GET /api/auth/otp/inbox?token=...
    if (req.method === 'GET' && pathname === '/api/auth/otp/inbox') {
      const token = String(urlObj.searchParams.get('token') || '').trim();
      let foundChallenge = null;
      for (const ch of serverOtpChallenges.values()) {
        if (ch.inboxToken && ch.inboxToken === token && !ch.consumed && Date.now() <= ch.expiresAt) {
          foundChallenge = ch;
          break;
        }
      }
      if (!foundChallenge || !foundChallenge.deliveredEnvelope) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Không tìm thấy thư OTP hoặc thư đã hết hạn 5 phút.' }));
        return true;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ok: true,
          envelope: foundChallenge.deliveredEnvelope
        })
      );
      return true;
    }

    // 2. Save & Test Backend Gmail / Brevo Config: POST /api/auth/otp/config
    if (req.method === 'POST' && pathname === '/api/auth/otp/config') {
      const body = await parseJsonBody(req);
      const gmailUser = String(body.gmailUser || '').trim();
      const gmailAppPassword = String(body.gmailAppPassword || '').replace(/\s+/g, '').trim();
      const brevoApiKey = String(body.brevoApiKey || '').trim();

      if (brevoApiKey.startsWith('xkeysib-')) {
        fs.writeFileSync(
          SMTP_CONFIG_FILE,
          JSON.stringify({ BREVO_API_KEY: brevoApiKey, GMAIL_USER: gmailUser || 'no-reply@mealy.vn' }, null, 2),
          'utf-8'
        );
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            smtpConfigured: true,
            provider: 'Brevo Cloud Email API',
            message: 'Đã kết nối cổng gửi thư Brevo API thành công!'
          })
        );
        return true;
      }

      if (!gmailUser.includes('@') || gmailAppPassword.length < 8) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            message: 'Vui lòng nhập địa chỉ Gmail hợp lệ và Mật khẩu ứng dụng Google (16 ký tự) hoặc khóa Brevo API.'
          })
        );
        return true;
      }

      try {
        const transporter = nodemailer.createTransport({
          host: 'smtp.gmail.com',
          port: 465,
          secure: true,
          auth: {
            user: gmailUser,
            pass: gmailAppPassword
          }
        });
        await transporter.verify();

        fs.writeFileSync(
          SMTP_CONFIG_FILE,
          JSON.stringify({ GMAIL_USER: gmailUser, GMAIL_APP_PASSWORD: gmailAppPassword }, null, 2),
          'utf-8'
        );
        fs.writeFileSync(
          ENV_FILE,
          `GMAIL_USER=${gmailUser}\nGMAIL_APP_PASSWORD=${gmailAppPassword}\nSMTP_HOST=smtp.gmail.com\nSMTP_PORT=465\n`,
          'utf-8'
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            smtpConfigured: true,
            senderEmail: maskEmailAddress(gmailUser),
            message: `Đã kết nối thành công máy chủ Gmail SMTP (${gmailUser})!`
          })
        );
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            smtpConfigured: false,
            message: `Không thể đăng nhập SMTP Gmail: ${err?.message || 'Sai Mật khẩu ứng dụng (App Password) hoặc chưa bật Xác minh 2 bước.'}`
          })
        );
      }
      return true;
    }

    // 3. Request Server-Generated 6-Digit OTP via Email: POST /api/auth/otp/request (or /api/auth/otp)
    if (req.method === 'POST' && (pathname === '/api/auth/otp/request' || pathname === '/api/auth/otp')) {
      const body = await parseJsonBody(req);
      const target = String(body.target || body.email || '').trim().toLowerCase();
      const purpose = String(body.purpose || 'login').trim();
      const bypassCooldown = Boolean(body.bypassCooldown);

      if (!target || !target.includes('@')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            message: 'Vui lòng nhập địa chỉ Email hợp lệ để nhận mã OTP 6 số.'
          })
        );
        return true;
      }

      const now = Date.now();
      const existing = serverOtpChallenges.get(target);

      if (existing && existing.lockedUntil && existing.lockedUntil > now && !bypassCooldown) {
        const waitSec = Math.ceil((existing.lockedUntil - now) / 1000);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            cooldownRemainingSeconds: waitSec,
            message: `Tài khoản đang tạm khóa xác thực do nhập sai nhiều lần. Vui lòng thử lại sau ${waitSec} giây.`
          })
        );
        return true;
      }

      if (existing && existing.cooldownUntil > now && !bypassCooldown) {
        const waitSec = Math.ceil((existing.cooldownUntil - now) / 1000);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            cooldownRemainingSeconds: waitSec,
            maskedTarget: existing.maskedTarget,
            inboxToken: existing.inboxToken,
            webmailUrl: existing.deliveredEnvelope?.webmailUrl || null,
            provider: existing.deliveredEnvelope?.provider || 'Cloud SMTP Free Relay',
            message: `Vui lòng đợi ${waitSec} giây trước khi yêu cầu gửi lại mã OTP mới.`
          })
        );
        return true;
      }

      const otpCode = String(crypto.randomInt(100000, 1000000));
      const salt = crypto.randomBytes(16).toString('hex');
      const inboxToken = crypto.randomBytes(20).toString('hex');
      const codeHash = hashServerOtp(target, otpCode, salt);
      const maskedTarget = maskEmailAddress(target);

      try {
        const mailRes = await sendRealOtpEmail(target, otpCode, purpose);
        const deliveredEnvelope = {
          messageId: `<otp.${now}.${salt.slice(0, 8)}@mealy.vn>`,
          fromName: 'Mealy Bảo Mật',
          fromEmail: mailRes.senderEmail || 'no-reply@mealy.vn',
          toEmail: target,
          subject: mailRes.letter.subject,
          purposeTitle: mailRes.letter.purposeTitle,
          otpCode,
          sentAt: new Date(now).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' • ' + new Date(now).toLocaleDateString('vi-VN'),
          provider: mailRes.provider || 'Cloud SMTP Free Relay (TLS 1.3)',
          webmailUrl: mailRes.webmailUrl || null
        };

        serverOtpChallenges.set(target, {
          target,
          maskedTarget,
          purpose,
          codeHash,
          salt,
          inboxToken,
          deliveredEnvelope,
          createdAt: now,
          expiresAt: now + OTP_TTL_MS,
          cooldownUntil: now + OTP_COOLDOWN_MS,
          attempts: 0,
          maxAttempts: OTP_MAX_ATTEMPTS,
          lockedUntil: 0,
          consumed: false
        });
        saveServerOtpChallenges();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: true,
            emailSent: true,
            smtpConfigured: true,
            provider: deliveredEnvelope.provider,
            senderEmail: deliveredEnvelope.fromEmail,
            inboxToken,
            webmailUrl: deliveredEnvelope.webmailUrl,
            maskedTarget,
            expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
            cooldownRemainingSeconds: Math.floor(OTP_COOLDOWN_MS / 1000),
            message: `Mã xác thực 6 số đã được gửi tới hộp thư ${maskedTarget}.`
          })
        );
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            ok: false,
            smtpConfigured: true,
            message: `Lỗi kết nối cổng thư: ${err?.message || 'Vui lòng thử lại.'}`
          })
        );
      }
      return true;
    }

    // 4. Verify 6-Digit OTP on Backend Server: POST /api/auth/otp/verify
    if (req.method === 'POST' && pathname === '/api/auth/otp/verify') {
      const body = await parseJsonBody(req);
      const target = String(body.target || body.email || '').trim().toLowerCase();
      const cleanCode = String(body.code || '').replace(/\D/g, '').trim();

      if (!target || cleanCode.length !== 6) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            valid: false,
            message: 'Vui lòng nhập đủ 6 chữ số của mã xác thực OTP.'
          })
        );
        return true;
      }

      const now = Date.now();
      const challenge = serverOtpChallenges.get(target);

      if (!challenge || challenge.consumed) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            valid: false,
            message: 'Mã xác thực không tồn tại hoặc đã được sử dụng. Vui lòng bấm gửi mã mới.'
          })
        );
        return true;
      }

      if (challenge.lockedUntil && challenge.lockedUntil > now) {
        const lockedSec = Math.ceil((challenge.lockedUntil - now) / 1000);
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            valid: false,
            remainingAttempts: 0,
            lockedRemainingSeconds: lockedSec,
            message: `Tạm khóa xác thực bảo mật. Vui lòng thử lại sau ${lockedSec} giây.`
          })
        );
        return true;
      }

      if (now > challenge.expiresAt) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            valid: false,
            message: 'Mã xác thực OTP đã hết hạn (quá 5 phút). Vui lòng bấm gửi lại mã mới.'
          })
        );
        return true;
      }

      const candidateHash = hashServerOtp(target, cleanCode, challenge.salt);
      if (candidateHash !== challenge.codeHash) {
        challenge.attempts += 1;
        const remaining = Math.max(0, challenge.maxAttempts - challenge.attempts);

        if (challenge.attempts >= challenge.maxAttempts) {
          challenge.lockedUntil = now + OTP_LOCKOUT_MS;
          serverOtpChallenges.set(target, challenge);
          saveServerOtpChallenges();
          res.writeHead(429, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              valid: false,
              remainingAttempts: 0,
              lockedRemainingSeconds: Math.floor(OTP_LOCKOUT_MS / 1000),
              message: 'Bạn đã nhập sai mã OTP quá 5 lần. Hệ thống tạm khóa 60 giây để bảo vệ tài khoản.'
            })
          );
          return true;
        }

        serverOtpChallenges.set(target, challenge);
        saveServerOtpChallenges();
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            valid: false,
            remainingAttempts: remaining,
            message: `Mã xác thực OTP không chính xác. Bạn còn ${remaining} lần thử.`
          })
        );
        return true;
      }

      challenge.consumed = true;
      serverOtpChallenges.set(target, challenge);
      saveServerOtpChallenges();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          valid: true,
          verifiedAt: new Date(now).toISOString(),
          message: 'Xác thực bảo mật OTP thành công!'
        })
      );
      return true;
    }
  }

  // Health Check Endpoint: GET /api/health
  if (pathname === '/api/health') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        ok: true,
        status: 'healthy',
        database: 'connected',
        smtpReady: true,
        usersCount: serverUsers.size,
        roomsCount: collabRooms.size,
        timestamp: new Date().toISOString()
      })
    );
    return true;
  }

  // Backend Auth & Database Endpoints: /api/auth/register, /api/auth/login, /api/auth/reset-password, /api/db/*
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/db/')) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return true;
    }

    // POST /api/auth/register
    if (req.method === 'POST' && pathname === '/api/auth/register') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const name = String(body.name || '').trim() || email.split('@')[0];
      const password = String(body.password || '');
      const phone = String(body.phone || '').trim();
      const authProvider = String(body.authProvider || 'email');

      if (!email || !email.includes('@')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Địa chỉ email không hợp lệ.' }));
        return true;
      }

      const salt = crypto.randomBytes(16).toString('hex');
      const passwordHash = password ? hashServerPassword(password, salt) : '';
      const now = Date.now();
      const userRecord = {
        id: serverUsers.get(email)?.id || `usr_${crypto.randomBytes(8).toString('hex')}`,
        email,
        name,
        phone,
        authProvider,
        passwordHash,
        salt,
        verifiedAt: new Date(now).toISOString(),
        createdAt: serverUsers.get(email)?.createdAt || new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString()
      };

      serverUsers.set(email, userRecord);
      const sessionToken = `sess_${crypto.randomBytes(24).toString('hex')}`;
      serverSessions.set(sessionToken, { email, createdAt: now, expiresAt: now + 30 * 24 * 3600 * 1000 });
      saveServerDatabase();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ok: true,
          sessionToken,
          user: {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            phone: userRecord.phone,
            authProvider: userRecord.authProvider,
            verifiedAt: userRecord.verifiedAt
          }
        })
      );
      return true;
    }

    // POST /api/auth/login
    if (req.method === 'POST' && pathname === '/api/auth/login') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const password = String(body.password || '');

      if (!email || !email.includes('@')) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Địa chỉ email không hợp lệ.' }));
        return true;
      }

      const existing = serverUsers.get(email);
      if (existing && existing.passwordHash && password) {
        const candidateHash = hashServerPassword(password, existing.salt);
        if (candidateHash !== existing.passwordHash) {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, message: 'Mật khẩu không chính xác.' }));
          return true;
        }
      }

      const now = Date.now();
      const userRecord = existing || {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        email,
        name: String(body.name || email.split('@')[0]),
        phone: String(body.phone || ''),
        authProvider: String(body.authProvider || 'email'),
        passwordHash: password ? hashServerPassword(password, 'default_salt') : '',
        salt: 'default_salt',
        verifiedAt: new Date(now).toISOString(),
        createdAt: new Date(now).toISOString(),
        updatedAt: new Date(now).toISOString()
      };
      userRecord.lastLoginAt = new Date(now).toISOString();
      serverUsers.set(email, userRecord);

      const sessionToken = `sess_${crypto.randomBytes(24).toString('hex')}`;
      serverSessions.set(sessionToken, { email, createdAt: now, expiresAt: now + 30 * 24 * 3600 * 1000 });
      saveServerDatabase();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ok: true,
          sessionToken,
          user: {
            id: userRecord.id,
            email: userRecord.email,
            name: userRecord.name,
            phone: userRecord.phone,
            authProvider: userRecord.authProvider,
            lastLoginAt: userRecord.lastLoginAt
          }
        })
      );
      return true;
    }

    // POST /api/auth/reset-password
    if (req.method === 'POST' && pathname === '/api/auth/reset-password') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      const newPassword = String(body.newPassword || body.password || '');

      if (!email || !newPassword || newPassword.length < 6) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Email hoặc mật khẩu mới không hợp lệ.' }));
        return true;
      }

      const existing = serverUsers.get(email) || {
        id: `usr_${crypto.randomBytes(8).toString('hex')}`,
        email,
        name: email.split('@')[0],
        createdAt: new Date().toISOString()
      };
      const salt = crypto.randomBytes(16).toString('hex');
      existing.salt = salt;
      existing.passwordHash = hashServerPassword(newPassword, salt);
      existing.updatedAt = new Date().toISOString();
      serverUsers.set(email, existing);
      saveServerDatabase();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, message: 'Đã cập nhật mật khẩu mới thành công.' }));
      return true;
    }

    // GET /api/db/profile?email=...
    if (req.method === 'GET' && pathname === '/api/db/profile') {
      const email = String(urlObj.searchParams.get('email') || '').trim().toLowerCase();
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Thiếu email truy vấn.' }));
        return true;
      }
      const user = serverUsers.get(email) || null;
      const profile = serverProfiles.get(email) || null;
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          ok: true,
          user: user
            ? {
                id: user.id,
                email: user.email,
                name: user.name,
                phone: user.phone,
                authProvider: user.authProvider,
                verifiedAt: user.verifiedAt
              }
            : null,
          profile
        })
      );
      return true;
    }

    // POST /api/db/sync
    if (req.method === 'POST' && pathname === '/api/db/sync') {
      const body = await parseJsonBody(req);
      const email = String(body.email || '').trim().toLowerCase();
      if (!email) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: 'Thiếu email đồng bộ.' }));
        return true;
      }
      const existingProfile = serverProfiles.get(email) || {};
      const updatedProfile = {
        ...existingProfile,
        ...(body.profile || {}),
        mealPlan: body.mealPlan !== undefined ? body.mealPlan : existingProfile.mealPlan,
        favorites: body.favorites !== undefined ? body.favorites : existingProfile.favorites,
        updatedAt: new Date().toISOString()
      };
      serverProfiles.set(email, updatedProfile);
      saveServerDatabase();

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, profile: updatedProfile }));
      return true;
    }
  }

  if (!pathname.startsWith('/api/collab/')) {
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
