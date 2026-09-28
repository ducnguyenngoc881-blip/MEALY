import { describe, it, expect } from '../helpers/testRunner';
import { 
  ROOM_TTL_MS, 
  isRoomExpired, 
  formatTtlRemaining, 
  encodeRoomDataForUrl, 
  decodeRoomDataFromUrl 
} from '../../src/services/collabGroceryService';
import { CollabRoom } from '../../src/types';
import { 
  collabRooms, 
  collabSubscribers, 
  purgeExpiredRooms, 
  isRoomExpired as isServerRoomExpired,
  handleCollabRequest 
} from '../../scripts/collab-server-handler.js';

describe('Collaborative Grocery Room 1-Hour TTL (Time-To-Live)', () => {
  const dummyItems = [
    {
      id: 'item-1',
      name: 'Rau muống',
      amount: 1,
      unit: 'bó',
      displayAmount: '1 bó',
      category: 'rau-cu' as const,
      type: 'fresh' as const,
      cost: 10000
    }
  ];

  it('TTL-01: ROOM_TTL_MS is strictly configured to 1 hour (3,600,000 ms)', () => {
    expect(ROOM_TTL_MS).toBe(3600000);
    expect(ROOM_TTL_MS / 1000 / 60).toBe(60); // 60 minutes
  });

  it('TTL-02: isRoomExpired correctly validates fresh room vs expired room (> 1 hour)', () => {
    const now = Date.now();
    const freshRoom: CollabRoom = {
      roomId: 'MW-TEST1',
      title: 'Giỏ test tươi',
      hostName: 'Host A',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ROOM_TTL_MS,
      ttlMs: ROOM_TTL_MS,
      items: dummyItems,
      checkedMap: {}
    };

    expect(isRoomExpired(freshRoom)).toBe(false);

    // Expired room: created 61 minutes ago
    const expiredRoom: CollabRoom = {
      roomId: 'MW-EXPIRED',
      title: 'Giỏ test hết hạn',
      hostName: 'Host B',
      createdAt: now - (61 * 60 * 1000),
      updatedAt: now - (61 * 60 * 1000),
      expiresAt: now - (1 * 60 * 1000), // expired 1 minute ago
      ttlMs: ROOM_TTL_MS,
      items: dummyItems,
      checkedMap: {}
    };

    expect(isRoomExpired(expiredRoom)).toBe(true);
    expect(isRoomExpired(null)).toBe(true);
    expect(isRoomExpired(undefined)).toBe(true);
  });

  it('TTL-03: formatTtlRemaining displays human-readable minutes, seconds and expired status', () => {
    const now = Date.now();
    
    // 45 minutes left
    expect(formatTtlRemaining(now + 45 * 60 * 1000)).toBe('Còn 45p');
    
    // 30 seconds left
    expect(formatTtlRemaining(now + 30 * 1000)).toBe('Còn 30s');
    
    // Past expiration
    expect(formatTtlRemaining(now - 1000)).toBe('Đã hết hạn');
  });

  it('TTL-04: URL serialization encodes expiresAt and URL deserialization rejects expired links', () => {
    const now = Date.now();
    const freshRoom: CollabRoom = {
      roomId: 'MW-URL1',
      title: 'Giỏ URL',
      hostName: 'Host C',
      createdAt: now,
      updatedAt: now,
      expiresAt: now + ROOM_TTL_MS,
      items: dummyItems,
      checkedMap: {}
    };

    const encoded = encodeRoomDataForUrl(freshRoom);
    expect(encoded).toBeTruthy();

    const decoded = decodeRoomDataFromUrl(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.roomId).toBe('MW-URL1');
    expect(decoded?.expiresAt).toBeGreaterThan(now);

    // Create an expired encoded URL payload (expiresAt in the past)
    const expiredPayload = {
      r: 'MW-EXPIRED-URL',
      t: 'Giỏ hết hạn',
      h: 'Host D',
      e: now - 5000, // 5 seconds ago
      i: [['item-2', 'Thịt bò', 500, 'g', '500 g', 'thit-ca', 'fresh', 120000, 'cho-dan-sinh']],
      c: {}
    };
    const expiredEncoded = encodeURIComponent(btoa(unescape(encodeURIComponent(JSON.stringify(expiredPayload)))));
    
    // Decoder must reject expired URL payload
    const decodedExpired = decodeRoomDataFromUrl(expiredEncoded);
    expect(decodedExpired).toBeNull();
  });

  it('TTL-05: Server purgeExpiredRooms removes rooms older than 1 hour from memory', () => {
    const now = Date.now();
    
    // Seed fresh room and expired room
    collabRooms.set('MW-FRESH-SRV', {
      roomId: 'MW-FRESH-SRV',
      title: 'Fresh Room',
      hostName: 'Host',
      createdAt: now,
      expiresAt: now + 3600000,
      items: [],
      checkedMap: {}
    });

    collabRooms.set('MW-EXPIRED-SRV', {
      roomId: 'MW-EXPIRED-SRV',
      title: 'Expired Room',
      hostName: 'Host',
      createdAt: now - 3700000,
      expiresAt: now - 100000,
      items: [],
      checkedMap: {}
    });

    expect(collabRooms.has('MW-FRESH-SRV')).toBe(true);
    expect(collabRooms.has('MW-EXPIRED-SRV')).toBe(true);

    purgeExpiredRooms();

    expect(collabRooms.has('MW-FRESH-SRV')).toBe(true);
    expect(collabRooms.has('MW-EXPIRED-SRV')).toBe(false);

    // Cleanup
    collabRooms.delete('MW-FRESH-SRV');
  });

  it('TTL-06: Server GET /api/collab/room/:id returns 410 Gone for expired room', async () => {
    const now = Date.now();
    const expiredRoomId = 'MW-API-EXPIRED';
    
    collabRooms.set(expiredRoomId, {
      roomId: expiredRoomId,
      title: 'Expired Room API',
      hostName: 'Host',
      createdAt: now - 3700000,
      expiresAt: now - 100000,
      items: [],
      checkedMap: {}
    });

    let statusCode = 0;
    let responseBody = '';
    const mockReq: any = {
      url: `/api/collab/room/${expiredRoomId}`,
      method: 'GET'
    };
    const mockRes: any = {
      setHeader: () => {},
      writeHead: (code: number) => { statusCode = code; },
      end: (data: string) => { responseBody = data; }
    };

    await handleCollabRequest(mockReq, mockRes);
    expect(statusCode).toBe(410);
    const parsed = JSON.parse(responseBody);
    expect(parsed.isExpired).toBe(true);
    expect(parsed.error).toContain('hết hạn');
    collabRooms.delete(expiredRoomId);
  });
});
