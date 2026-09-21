import fs from 'fs';
import path from 'path';

export const collabRooms = new Map();
export const collabSubscribers = new Map();

const DB_FILE = path.resolve(process.cwd(), 'node_modules', '.collab-rooms.json');

function loadRooms() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(data)) {
        collabRooms.set(k, v);
      }
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
    const room = {
      roomId,
      title: body.title || existing?.title || 'Giỏ Đi Chợ Tuần',
      hostName: body.hostName || existing?.hostName || 'Chủ phòng',
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
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
    if (!room) {
      room = {
        roomId,
        title: 'Giỏ Đi Chợ Tuần',
        hostName: 'Chủ phòng',
        createdAt: Date.now(),
        updatedAt: Date.now(),
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
    if (!room) {
      room = {
        roomId,
        title: 'Giỏ Đi Chợ Tuần',
        hostName: 'Chủ phòng',
        createdAt: Date.now(),
        updatedAt: Date.now(),
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

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ success: true, room }));
    return true;
  }

  return false;
}
