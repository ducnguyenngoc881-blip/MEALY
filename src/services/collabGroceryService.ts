import { CollabRoom, CollabCartItem, CollabCheckState, CollabShopper } from '../types';

const BROADCAST_PREFIX = 'mealwise_collab_';

export const SHOPPER_PALETTE = [
  { id: 'emerald', hex: '#10b981', label: 'Xanh Ngọc (Chủ phòng)', badgeBg: 'bg-emerald-500/15', badgeText: 'text-emerald-700 dark:text-emerald-300', badgeBorder: 'border-emerald-500/30', btnBg: 'bg-emerald-500 text-slate-950', ring: 'ring-emerald-500' },
  { id: 'violet', hex: '#8b5cf6', label: 'Tím', badgeBg: 'bg-violet-500/15', badgeText: 'text-violet-700 dark:text-violet-300', badgeBorder: 'border-violet-500/30', btnBg: 'bg-violet-500 text-white', ring: 'ring-violet-500' },
  { id: 'amber', hex: '#f59e0b', label: 'Vàng Cam', badgeBg: 'bg-amber-500/15', badgeText: 'text-amber-700 dark:text-amber-300', badgeBorder: 'border-amber-500/30', btnBg: 'bg-amber-500 text-slate-950', ring: 'ring-amber-500' },
  { id: 'rose', hex: '#f43f5e', label: 'Hồng Đỏ', badgeBg: 'bg-rose-500/15', badgeText: 'text-rose-700 dark:text-rose-300', badgeBorder: 'border-rose-500/30', btnBg: 'bg-rose-500 text-white', ring: 'ring-rose-500' },
  { id: 'sky', hex: '#0ea5e9', label: 'Xanh Biển', badgeBg: 'bg-sky-500/15', badgeText: 'text-sky-700 dark:text-sky-300', badgeBorder: 'border-sky-500/30', btnBg: 'bg-sky-500 text-white', ring: 'ring-sky-500' },
  { id: 'teal', hex: '#14b8a6', label: 'Xanh Mòng Két', badgeBg: 'bg-teal-500/15', badgeText: 'text-teal-700 dark:text-teal-300', badgeBorder: 'border-teal-500/30', btnBg: 'bg-teal-500 text-white', ring: 'ring-teal-500' }
];

export function getShopperStyle(colorHex?: string) {
  const match = SHOPPER_PALETTE.find(p => p.hex.toLowerCase() === (colorHex || '').toLowerCase());
  return match || SHOPPER_PALETTE[0];
}

export function generateCollabRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = 'MW-';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateShopperId(): string {
  return `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}

/**
 * Get or create persistent shopper profile for current browser
 */
export function getOrCreateCollabUser(isGuestJoin = false): CollabShopper {
  if (typeof window === 'undefined') {
    return {
      id: 'usr_server',
      name: isGuestJoin ? 'Người mua 2' : 'Bạn (Chủ phòng)',
      color: isGuestJoin ? '#8b5cf6' : '#10b981',
      role: isGuestJoin ? 'shopper' : 'host'
    };
  }

  try {
    const saved = localStorage.getItem('mealwise_collab_shopper_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.id && parsed.name) {
        return parsed;
      }
    }
  } catch {}

  // Determine role and distinct color
  const id = generateShopperId();
  const role: 'host' | 'shopper' = isGuestJoin ? 'shopper' : 'host';
  const name = isGuestJoin ? 'Người mua 2' : (localStorage.getItem('mealwise_collab_user') || 'Bạn (Chủ phòng)');
  const color = isGuestJoin ? '#8b5cf6' : '#10b981';

  const shopper: CollabShopper = { id, name, color, role };
  try {
    localStorage.setItem('mealwise_collab_shopper_profile', JSON.stringify(shopper));
    localStorage.setItem('mealwise_collab_user', name);
  } catch {}

  return shopper;
}

/**
 * Save shopper profile
 */
export function saveCollabShopper(shopper: CollabShopper): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('mealwise_collab_shopper_profile', JSON.stringify(shopper));
    localStorage.setItem('mealwise_collab_user', shopper.name);
  } catch {}
}

export const ROOM_TTL_MS = 60 * 60 * 1000; // 1 hour maximum room lifetime

/**
 * Check if a collaborative room has exceeded its 1-hour TTL
 */
export function isRoomExpired(room: CollabRoom | null | undefined): boolean {
  if (!room) return true;
  const expiresAt = room.expiresAt || (room.createdAt + ROOM_TTL_MS);
  return Date.now() > expiresAt;
}

/**
 * Format remaining TTL time into friendly Vietnamese string (e.g. "Còn 45p", "Còn 30s")
 */
export function formatTtlRemaining(expiresAt?: number, createdAt?: number): string {
  const target = expiresAt || ((createdAt || Date.now()) + ROOM_TTL_MS);
  const diffMs = target - Date.now();
  if (diffMs <= 0) return 'Đã hết hạn';
  if (diffMs < 60000) {
    const seconds = Math.max(1, Math.round(diffMs / 1000));
    return `Còn ${seconds}s`;
  }
  const minutes = Math.round(diffMs / 60000);
  return `Còn ${minutes}p`;
}

/**
 * Encode room items and basic metadata into URL-safe base64 string
 * Ensures link opens with 100% of ingredients intact even without server pre-warming
 */
export function encodeRoomDataForUrl(room: CollabRoom): string {
  try {
    const now = Date.now();
    const expiresAt = room.expiresAt !== undefined 
      ? room.expiresAt 
      : (room.createdAt && Math.abs(now - room.createdAt) < ROOM_TTL_MS ? room.createdAt + ROOM_TTL_MS : now + ROOM_TTL_MS);
    const compact = {
      r: room.roomId,
      t: room.title,
      h: room.hostName,
      e: expiresAt,
      i: room.items.map(it => [
        it.id,
        it.name,
        it.amount,
        it.unit,
        it.displayAmount,
        it.category,
        it.type,
        it.cost,
        it.storeChannel || ''
      ]),
      c: Object.entries(room.checkedMap).reduce((acc, [k, v]) => {
        acc[k] = [
          v.checked ? 1 : 0, 
          v.checkedBy, 
          v.checkedAt, 
          v.checkedById || '', 
          v.checkedByColor || ''
        ];
        return acc;
      }, {} as Record<string, [number, string, number, string, string]>)
    };
    const json = JSON.stringify(compact);
    return encodeURIComponent(btoa(unescape(encodeURIComponent(json))));
  } catch (e) {
    console.warn('Failed to encode room data for URL:', e);
    return '';
  }
}

/**
 * Decode room items and state from URL-safe base64 string
 */
export function decodeRoomDataFromUrl(encoded: string): Partial<CollabRoom> | null {
  try {
    const json = decodeURIComponent(escape(atob(decodeURIComponent(encoded))));
    const compact = JSON.parse(json);
    if (!compact || !compact.r) return null;

    const now = Date.now();
    const expiresAt = compact.e || (now + ROOM_TTL_MS);

    // If payload has expired, reject it
    if (now > expiresAt) {
      console.warn('Decoded collab room URL has expired (exceeded 1-hour TTL)');
      return null;
    }

    const items: CollabCartItem[] = (compact.i || []).map((arr: any[]) => ({
      id: arr[0],
      name: arr[1],
      amount: arr[2],
      unit: arr[3],
      displayAmount: arr[4],
      category: arr[5],
      type: arr[6],
      cost: arr[7],
      storeChannel: arr[8]
    }));

    const checkedMap: Record<string, CollabCheckState> = {};
    if (compact.c) {
      for (const [k, v] of Object.entries(compact.c as Record<string, any[]>)) {
        checkedMap[k] = {
          checked: v[0] === 1,
          checkedBy: v[1] || 'Người mua cùng',
          checkedAt: v[2] || Date.now(),
          checkedById: v[3] || '',
          checkedByColor: v[4] || ''
        };
      }
    }

    return {
      roomId: compact.r,
      title: compact.t || 'Giỏ Đi Chợ Tuần',
      hostName: compact.h || 'Chủ phòng',
      expiresAt,
      ttlMs: ROOM_TTL_MS,
      items,
      checkedMap
    };
  } catch (e) {
    console.warn('Failed to decode room data from URL:', e);
    return null;
  }
}

/**
 * Create or update collaborative room on backend
 */
export async function createOrSyncCollabRoom(room: CollabRoom): Promise<CollabRoom> {
  try {
    const res = await fetch('/api/collab/room', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(room)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.room) return data.room;
    }
  } catch (e) {
    console.warn('Sync server offline or unavailable, continuing in local mode:', e);
  }
  return room;
}

/**
 * Register participant on backend
 */
export async function registerParticipantOnServer(roomId: string, participant: CollabShopper): Promise<void> {
  try {
    await fetch(`/api/collab/room/${encodeURIComponent(roomId)}/participant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ participant })
    });
  } catch (e) {
    console.warn('Failed to register participant with server:', e);
  }
}

/**
 * Fetch collaborative room details
 */
export async function fetchCollabRoom(roomId: string): Promise<CollabRoom | null> {
  try {
    const res = await fetch(`/api/collab/room/${encodeURIComponent(roomId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.room) return data.room;
    }
  } catch (e) {
    console.warn('Failed to fetch room from server:', e);
  }
  return null;
}

/**
 * Toggle check state on backend & broadcast
 */
export async function toggleCollabItemOnServer(
  roomId: string, 
  itemId: string, 
  checked: boolean, 
  checkedBy: string,
  checkedById?: string,
  checkedByColor?: string
): Promise<Record<string, CollabCheckState> | null> {
  try {
    const res = await fetch(`/api/collab/room/${encodeURIComponent(roomId)}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId, checked, checkedBy, checkedById, checkedByColor })
    });
    if (res.ok) {
      const data = await res.json();
      return data.checkedMap || null;
    }
  } catch (e) {
    console.warn('Toggle request failed to reach server:', e);
  }
  return null;
}

/**
 * Subscribe to real-time updates for a room via BroadcastChannel + SSE + Polling Fallback
 */
export function subscribeToCollabRoom(
  roomId: string,
  onUpdate: (event: { type: string; itemId?: string; state?: CollabCheckState; checkedMap?: Record<string, CollabCheckState>; room?: CollabRoom }) => void
): () => void {
  let isClosed = false;

  // 1. Local BroadcastChannel for instant 0ms cross-tab sync
  let channel: BroadcastChannel | null = null;
  try {
    channel = new BroadcastChannel(BROADCAST_PREFIX + roomId);
    channel.onmessage = (e) => {
      if (isClosed) return;
      if (e.data) onUpdate(e.data);
    };
  } catch {}

  // 2. Server-Sent Events (SSE) for instant cross-device sync
  let eventSource: EventSource | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;

  const startSse = () => {
    if (typeof EventSource === 'undefined') {
      startPolling();
      return;
    }

    try {
      eventSource = new EventSource(`/api/collab/room/${encodeURIComponent(roomId)}/events`);
      eventSource.onmessage = (event) => {
        if (isClosed) return;
        try {
          const data = JSON.parse(event.data);
          onUpdate(data);
        } catch {}
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Fallback to polling if SSE encounters issues
        if (!pollingInterval && !isClosed) {
          startPolling();
        }
      };
    } catch {
      startPolling();
    }
  };

  // 3. Fallback Polling (1200ms)
  const startPolling = () => {
    if (pollingInterval || isClosed) return;
    pollingInterval = setInterval(async () => {
      if (isClosed) return;
      const room = await fetchCollabRoom(roomId);
      if (room && !isClosed) {
        onUpdate({ type: 'polling_sync', room, checkedMap: room.checkedMap });
      }
    }, 1200);
  };

  startSse();

  // Return cleanup function
  return () => {
    isClosed = true;
    if (channel) {
      channel.close();
      channel = null;
    }
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
}

/**
 * Broadcast local update across open tabs immediately
 */
export function broadcastLocalCollabUpdate(
  roomId: string,
  event: { type: string; roomId?: string; itemId?: string; state?: CollabCheckState; checkedMap?: Record<string, CollabCheckState>; room?: CollabRoom }
) {
  try {
    const channel = new BroadcastChannel(BROADCAST_PREFIX + roomId);
    channel.postMessage(event);
    channel.close();
  } catch {}
}
