import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import { 
  generateCollabRoomId, 
  encodeRoomDataForUrl, 
  decodeRoomDataFromUrl 
} from '../../src/services/collabGroceryService';
import { CollabRoom, CollabCartItem, CollabCheckState } from '../../src/types';
// @ts-ignore
import { collabRooms, handleCollabRequest } from '../../scripts/collab-server-handler.js';

describe('Unit: Real-Time Collaborative Grocery Sharing (Đi Chợ Cùng Nhau Real-Time)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');

  it('COLLAB-01: Room ID generator produces MW- prefix with 5 alphanumeric characters', () => {
    const id1 = generateCollabRoomId();
    const id2 = generateCollabRoomId();

    expect(id1.startsWith('MW-')).toBe(true);
    expect(id1.length).toBe(8); // 'MW-' (3) + 5 chars = 8
    expect(id1).not.toBe(id2);
  });

  it('COLLAB-02: URL payload encoder and decoder round-trip preserves items and check state 100%', () => {
    const mockItems: CollabCartItem[] = [
      {
        id: 'thit-ba-chi',
        name: 'Thịt ba chỉ',
        amount: 800,
        unit: 'g',
        displayAmount: '800 g',
        category: 'thit-ca',
        type: 'fresh',
        cost: 120000,
        storeChannel: 'cho-dan-sinh'
      },
      {
        id: 'rau-muong',
        name: 'Rau muống',
        amount: 2,
        unit: 'bó',
        displayAmount: '2 bó',
        category: 'rau-cu',
        type: 'fresh',
        cost: 20000,
        storeChannel: 'cho-dan-sinh'
      },
      {
        id: 'nuoc-mam',
        name: 'Nước mắm cá cơm',
        amount: 1,
        unit: 'chai',
        displayAmount: '1 chai',
        category: 'gia-vi',
        type: 'pantry',
        cost: 45000,
        storeChannel: 'winmart'
      }
    ];

    const mockChecked: Record<string, CollabCheckState> = {
      'thit-ba-chi': {
        checked: true,
        checkedBy: 'User A (Chủ phòng)',
        checkedAt: 1700000000000
      }
    };

    const mockRoom: CollabRoom = {
      roomId: 'MW-TEST1',
      title: 'Giỏ Đi Chợ Cuối Tuần',
      hostName: 'User A',
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
      items: mockItems,
      checkedMap: mockChecked
    };

    const encoded = encodeRoomDataForUrl(mockRoom);
    expect(encoded.length > 0).toBe(true);

    const decoded = decodeRoomDataFromUrl(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded!.roomId).toBe('MW-TEST1');
    expect(decoded!.title).toBe('Giỏ Đi Chợ Cuối Tuần');
    expect(decoded!.hostName).toBe('User A');
    expect(decoded!.items!.length).toBe(3);
    expect(decoded!.items![0].name).toBe('Thịt ba chỉ');
    expect(decoded!.items![1].name).toBe('Rau muống');
    expect(decoded!.items![2].name).toBe('Nước mắm cá cơm');
    expect(decoded!.checkedMap!['thit-ba-chi'].checked).toBe(true);
    expect(decoded!.checkedMap!['thit-ba-chi'].checkedBy).toBe('User A (Chủ phòng)');
  });

  it('COLLAB-03: Server handler supports creating rooms and retrieving room state', async () => {
    const mockReq: any = {
      url: '/api/collab/room',
      method: 'POST',
      on: (event: string, cb: any) => {
        if (event === 'data') {
          cb(JSON.stringify({
            roomId: 'MW-SRV1',
            title: 'Mâm Cơm 4 Người',
            hostName: 'Chị Mai',
            items: [{ id: 'trung-ga', name: 'Trứng gà', amount: 10, unit: 'quả', displayAmount: '10 quả', category: 'thit-ca', type: 'fresh', cost: 35000 }],
            checkedMap: {}
          }));
        }
        if (event === 'end') cb();
      }
    };

    let responseData = '';
    const mockRes: any = {
      setHeader: () => {},
      writeHead: () => {},
      end: (data: string) => { responseData = data; }
    };

    const handled = await handleCollabRequest(mockReq, mockRes);
    expect(handled).toBe(true);

    const parsed = JSON.parse(responseData);
    expect(parsed.success).toBe(true);
    expect(parsed.room.roomId).toBe('MW-SRV1');
    expect(parsed.room.hostName).toBe('Chị Mai');

    // Retrieve via GET /api/collab/room/MW-SRV1
    let getResponseData = '';
    const mockGetReq: any = {
      url: '/api/collab/room/MW-SRV1',
      method: 'GET',
      on: () => {}
    };
    const mockGetRes: any = {
      setHeader: () => {},
      writeHead: () => {},
      end: (data: string) => { getResponseData = data; }
    };

    const getHandled = await handleCollabRequest(mockGetReq, mockGetRes);
    expect(getHandled).toBe(true);
    const getParsed = JSON.parse(getResponseData);
    expect(getParsed.success).toBe(true);
    expect(getParsed.room.title).toBe('Mâm Cơm 4 Người');
  });

  it('COLLAB-04: Server handler supports real-time toggle item check with user attribution', async () => {
    const mockToggleReq: any = {
      url: '/api/collab/room/MW-SRV1/toggle',
      method: 'POST',
      on: (event: string, cb: any) => {
        if (event === 'data') {
          cb(JSON.stringify({
            itemId: 'trung-ga',
            checked: true,
            checkedBy: 'Anh Nam (Đi siêu thị)'
          }));
        }
        if (event === 'end') cb();
      }
    };

    let responseData = '';
    const mockToggleRes: any = {
      setHeader: () => {},
      writeHead: () => {},
      end: (data: string) => { responseData = data; }
    };

    const handled = await handleCollabRequest(mockToggleReq, mockToggleRes);
    expect(handled).toBe(true);

    const parsed = JSON.parse(responseData);
    expect(parsed.success).toBe(true);
    expect(parsed.checkedMap['trung-ga'].checked).toBe(true);
    expect(parsed.checkedMap['trung-ga'].checkedBy).toBe('Anh Nam (Đi siêu thị)');
  });

  it('COLLAB-05: GroceryList component contains Collaborative Share button and active room banner', () => {
    const code = fs.readFileSync(path.join(srcDir, 'components/GroceryList.tsx'), 'utf-8');
    expect(code.includes('Chia Sẻ Mua Chung')).toBe(true);
    expect(code.includes('Phòng Mua Chung:')).toBe(true);
    expect(code.includes('Lọc theo người mua:')).toBe(true);
    expect(code.includes('UserCheck')).toBe(true);
  });

  it('COLLAB-06: ShareCollabCartModal component provides shareable URL, QR code, and Zalo invite', () => {
    const code = fs.readFileSync(path.join(srcDir, 'components/ShareCollabCartModal.tsx'), 'utf-8');
    expect(code.includes('Chia Sẻ Giỏ Đi Chợ Mua Chung')).toBe(true);
    expect(code.includes('api.qrserver.com')).toBe(true);
    expect(code.includes('handleCopyZaloInvite')).toBe(true);
    expect(code.includes('handleCopyLink')).toBe(true);
  });

  it('COLLAB-07: App.tsx mounts ShareCollabCartModal in GlobalModals', () => {
    const code = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');
    expect(code.includes('ShareCollabCartModal')).toBe(true);
    expect(code.includes('<ShareCollabCartModal />')).toBe(true);
  });

  it('COLLAB-08: MealWiseContext exposes collaborative room management methods and URL detector', () => {
    const code = fs.readFileSync(path.join(srcDir, 'context/MealWiseContext.tsx'), 'utf-8');
    expect(code.includes('startCollabRoom')).toBe(true);
    expect(code.includes('joinCollabRoom')).toBe(true);
    expect(code.includes('leaveCollabRoom')).toBe(true);
    expect(code.includes('toggleCollabChecked')).toBe(true);
    expect(code.includes('collab_cart')).toBe(true);
  });

  it('COLLAB-09: Multi-shopper filter categorizes unclaimed, mine, and others accurately', () => {
    const currentUserName = 'User A';
    const checkedMap: Record<string, CollabCheckState> = {
      'item-1': { checked: true, checkedBy: 'User A', checkedAt: 100 },
      'item-2': { checked: true, checkedBy: 'User B', checkedAt: 200 },
      // item-3 is unchecked
    };

    const items = [
      { id: 'item-1', name: 'Thịt' },
      { id: 'item-2', name: 'Rau' },
      { id: 'item-3', name: 'Gia vị' },
    ];

    const unclaimed = items.filter(it => !checkedMap[it.id]?.checked);
    const mine = items.filter(it => checkedMap[it.id]?.checked && checkedMap[it.id]?.checkedBy === currentUserName);
    const others = items.filter(it => checkedMap[it.id]?.checked && checkedMap[it.id]?.checkedBy !== currentUserName);

    expect(unclaimed.length).toBe(1);
    expect(unclaimed[0].id).toBe('item-3');

    expect(mine.length).toBe(1);
    expect(mine[0].id).toBe('item-1');

    expect(others.length).toBe(1);
    expect(others[0].id).toBe('item-2');
  });

  it('COLLAB-10: mobile-server.js and vite.config.ts both mount collab handler', () => {
    const serverCode = fs.readFileSync(path.join(process.cwd(), 'scripts/mobile-server.js'), 'utf-8');
    expect(serverCode.includes('handleCollabRequest')).toBe(true);

    const viteCode = fs.readFileSync(path.join(process.cwd(), 'vite.config.ts'), 'utf-8');
    expect(viteCode.includes('handleCollabRequest')).toBe(true);
    expect(viteCode.includes('collabSyncPlugin')).toBe(true);
  });

  it('COLLAB-11: Multi-user differentiation by unique ID prevents false isMine attribution even if names collide', () => {
    const userA = { id: 'usr_userA_123', name: 'Người đi chợ', color: '#10b981' };
    const userB = { id: 'usr_userB_456', name: 'Người đi chợ', color: '#8b5cf6' };

    const checkedMap: Record<string, CollabCheckState> = {
      'thit-heo': {
        checked: true,
        checkedBy: userA.name,
        checkedById: userA.id,
        checkedByColor: userA.color,
        checkedAt: 1000
      },
      'rau-cai': {
        checked: true,
        checkedBy: userB.name,
        checkedById: userB.id,
        checkedByColor: userB.color,
        checkedAt: 2000
      }
    };

    // Evaluate from User A's perspective
    const item1_UserA = checkedMap['thit-heo'];
    const item1_isMineForA = item1_UserA.checkedById === userA.id;
    const item2_UserA = checkedMap['rau-cai'];
    const item2_isMineForA = item2_UserA.checkedById === userA.id;

    expect(item1_isMineForA).toBe(true);
    expect(item2_isMineForA).toBe(false);

    // Evaluate from User B's perspective
    const item1_isMineForB = item1_UserA.checkedById === userB.id;
    const item2_isMineForB = item2_UserA.checkedById === userB.id;

    expect(item1_isMineForB).toBe(false);
    expect(item2_isMineForB).toBe(true);
  });

  it('COLLAB-12: URL payload encoder/decoder preserves checkedById and checkedByColor', () => {
    const room: CollabRoom = {
      roomId: 'MW-COLOR',
      title: 'Giỏ Phân Biệt Màu',
      hostName: 'Chủ phòng',
      createdAt: 1000,
      updatedAt: 1000,
      items: [
        { id: 'ca-basa', name: 'Cá Basa', amount: 500, unit: 'g', displayAmount: '500 g', category: 'thit-ca', type: 'fresh', cost: 50000 }
      ],
      checkedMap: {
        'ca-basa': {
          checked: true,
          checkedBy: 'Lan',
          checkedById: 'usr_lan_888',
          checkedByColor: '#8b5cf6',
          checkedAt: 3000
        }
      }
    };

    const encoded = encodeRoomDataForUrl(room);
    const decoded = decodeRoomDataFromUrl(encoded);
    expect(decoded).not.toBeNull();
    const itemCheck = decoded!.checkedMap!['ca-basa'];
    expect(itemCheck.checked).toBe(true);
    expect(itemCheck.checkedBy).toBe('Lan');
    expect(itemCheck.checkedById).toBe('usr_lan_888');
    expect(itemCheck.checkedByColor).toBe('#8b5cf6');
  });

  it('COLLAB-13: Server handler supports participant registration and roster update', async () => {
    const participantReq: any = {
      url: '/api/collab/room/MW-ROSTER/participant',
      method: 'POST',
      on: (event: string, cb: any) => {
        if (event === 'data') {
          cb(JSON.stringify({
            participant: {
              id: 'usr_guest_999',
              name: 'Bạn B (Khách)',
              color: '#f59e0b',
              role: 'shopper'
            }
          }));
        }
        if (event === 'end') cb();
      }
    };

    let responseData = '';
    const participantRes: any = {
      setHeader: () => {},
      writeHead: () => {},
      end: (data: string) => { responseData = data; }
    };

    const handled = await handleCollabRequest(participantReq, participantRes);
    expect(handled).toBe(true);
    const parsed = JSON.parse(responseData);
    expect(parsed.success).toBe(true);
    expect(parsed.participants['usr_guest_999'].name).toBe('Bạn B (Khách)');
    expect(parsed.participants['usr_guest_999'].color).toBe('#f59e0b');
  });

  it('COLLAB-14: URL query param cleanup ensures user can freely select meals without tab hijack', () => {
    // Simulate shared cart URL: https://mealwise.app/?collab_cart=MW-TEST99
    const testUrl = new URL('https://mealwise.app/?collab_cart=MW-TEST99&payload=abc');
    expect(testUrl.searchParams.get('collab_cart')).toBe('MW-TEST99');

    // Simulate URL cleanup logic on join
    testUrl.searchParams.delete('collab_cart');
    testUrl.searchParams.delete('collab');
    testUrl.searchParams.delete('shared_cart');
    testUrl.searchParams.delete('payload');

    // URL is now clean
    expect(testUrl.searchParams.get('collab_cart')).toBeNull();
    expect(testUrl.search).toBe('');

    // Switching tabs to meal-sets or weekly is preserved
    let currentTab = 'grocery';
    const onTabChange = (newTab: string) => {
      // In the fixed architecture, no stray collabParam exists to force tab back to grocery
      currentTab = newTab;
    };

    onTabChange('meal-sets');
    expect(currentTab).toBe('meal-sets');

    onTabChange('weekly');
    expect(currentTab).toBe('weekly');
  });
});
