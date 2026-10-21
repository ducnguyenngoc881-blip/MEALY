import fs from 'fs';
import path from 'path';

export const collabRooms = new Map();
export const collabSubscribers = new Map();

const DB_FILE = path.resolve(process.cwd(), 'node_modules', '.collab-rooms.json');

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
  setInterval(purgeExpiredRooms, 60 * 1000);
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
