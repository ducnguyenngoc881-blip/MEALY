import { describe, it, expect } from '../helpers/testRunner';
import { 
  recordTelemetryEvent, 
  getRecentTelemetryEvents, 
  clearTelemetryEvents,
  heartbeatSession,
  getActiveSessions,
  removeCurrentSession,
  getRegisteredAccounts,
  recordUserInRegistry,
  getPeakStats,
  compute24hHourlyDistribution,
  simulateTeammateAction,
  getCurrentSessionId
} from '../../src/utils/telemetryEngine';

describe('Unit: Real-Data Telemetry Engine & Multi-Teammate Concurrent Usage', () => {

  // Setup mock localStorage in Node.js environment if needed
  const store: Record<string, string> = {};
  if (typeof (globalThis as any).localStorage === 'undefined') {
    (globalThis as any).localStorage = {
      getItem: (k: string) => store[k] || null,
      setItem: (k: string, v: string) => { store[k] = v.toString(); },
      removeItem: (k: string) => { delete store[k]; },
      clear: () => { Object.keys(store).forEach(k => delete store[k]); }
    };
  }
  if (typeof (globalThis as any).window === 'undefined') {
    (globalThis as any).window = {
      dispatchEvent: () => true,
      addEventListener: () => {},
      removeEventListener: () => {}
    };
  }

  it('TELEM-01: recordTelemetryEvent generates authentic events with valid badges and timestamps', () => {
    clearTelemetryEvents();
    const ev = recordTelemetryEvent('weekly', 'Đã tạo thực đơn 7 ngày vị Miền Nam', 'Admin');

    expect(ev.id.startsWith('ev-')).toBe(true);
    expect(ev.category).toBe('weekly');
    expect(ev.badge).toBe('Thực Đơn');
    expect(ev.actor).toBe('Admin');
    expect(typeof ev.timestamp).toBe('number');
    expect(typeof ev.timeStr).toBe('string');

    const recent = getRecentTelemetryEvents(10);
    expect(recent.length >= 1).toBe(true);
    expect(recent[0].action).toBe('Đã tạo thực đơn 7 ngày vị Miền Nam');
  });

  it('TELEM-02: Session heartbeat registers concurrent active users and updates peaks', () => {
    const sessions = heartbeatSession('Admin (Tab 1)', 'admin', 'admin');
    expect(sessions.length >= 1).toBe(true);

    const mySession = sessions.find(s => s.sessionId === getCurrentSessionId());
    expect(mySession).toBeDefined();
    expect(mySession?.userName).toBe('Admin (Tab 1)');
    expect(mySession?.role).toBe('admin');

    const activeList = getActiveSessions();
    expect(activeList.length >= 1).toBe(true);

    const peak = getPeakStats(activeList.length);
    expect(peak.peak24h >= activeList.length).toBe(true);
  });

  it('TELEM-03: Registered users registry saves profiles and increments login counts', () => {
    recordUserInRegistry({
      name: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@test.com',
      role: 'user'
    });

    const accounts = getRegisteredAccounts();
    const found = accounts.find(a => a.email === 'minh.nguyen@test.com');
    expect(found).toBeDefined();
    expect(found?.name).toBe('Nguyễn Văn Minh');
    expect(found?.role).toBe('user');

    // Second login increments count
    recordUserInRegistry({
      name: 'Nguyễn Văn Minh',
      email: 'minh.nguyen@test.com',
      role: 'user'
    });
    const updated = getRegisteredAccounts().find(a => a.email === 'minh.nguyen@test.com');
    expect(updated?.loginCount).toBeGreaterThanOrEqual(2);
  });

  it('TELEM-04: compute24hHourlyDistribution accurately calculates real event counts across checkpoints', () => {
    clearTelemetryEvents();
    recordTelemetryEvent('collab', 'Nhặt thịt ba chỉ', 'Shopper 1');
    recordTelemetryEvent('fridge', 'Cất cá hồi vào tủ lạnh', 'Shopper 2');
    recordTelemetryEvent('party', 'Xuất báo giá tiệc', 'Chef');

    const events = getRecentTelemetryEvents(10);
    const distribution = compute24hHourlyDistribution(events);

    expect(distribution.length).toBe(12); // 12 two-hour checkpoints
    const totalEventsInChart = distribution.reduce((sum, d) => sum + d.eventsCount, 0);
    expect(totalEventsInChart).toBeGreaterThanOrEqual(3);

    const currentCheckpoint = distribution.find(d => d.isCurrent);
    expect(currentCheckpoint).toBeDefined();
    expect(currentCheckpoint?.eventsCount).toBeGreaterThanOrEqual(1);
  });

  it('TELEM-05: Multi-teammate simulation executes authentic actions across domains without corruption', () => {
    const evCollab = simulateTeammateAction('join_collab', 'Tuấn Anh');
    expect(evCollab.category).toBe('collab');
    expect(evCollab.actor).toBe('Tuấn Anh');
    expect(evCollab.action).toContain('tham gia phòng mua chung');

    const evCheck = simulateTeammateAction('check_item', 'Hương Ly');
    expect(evCheck.category).toBe('collab');
    expect(evCheck.actor).toBe('Hương Ly');
    expect(evCheck.action).toContain('nhặt bỏ giỏ');

    const evPlan = simulateTeammateAction('plan_weekly', 'Bếp Trưởng');
    expect(evPlan.category).toBe('weekly');
    expect(evPlan.badge).toBe('Thực Đơn');

    const evFridge = simulateTeammateAction('add_fridge', 'Mẹ Trẻ');
    expect(evFridge.category).toBe('fridge');
    expect(evFridge.badge).toBe('Tủ Lạnh');

    const recent = getRecentTelemetryEvents(20);
    expect(recent.some(e => e.actor === 'Tuấn Anh')).toBe(true);
    expect(recent.some(e => e.actor === 'Hương Ly')).toBe(true);
    expect(recent.some(e => e.actor === 'Bếp Trưởng')).toBe(true);
    expect(recent.some(e => e.actor === 'Mẹ Trẻ')).toBe(true);
  });

  it('TELEM-06: Multi-teammate concurrent usage scenario maintains state integrity', () => {
    // Teammate 1: Admin observing dashboard
    const adminSession = heartbeatSession('Admin Master', 'admin', 'admin');
    expect(adminSession.length).toBeGreaterThanOrEqual(1);

    // Teammate 2: Shopper A
    const shopperAEvent = recordTelemetryEvent('collab', 'Tạo phòng mua chung #MW-9912', 'Shopper A');
    expect(shopperAEvent.id).toBeDefined();

    // Teammate 3: Shopper B checking 3 items in room
    const item1 = recordTelemetryEvent('collab', 'Đã nhặt: "Rau muống 1 bó"', 'Shopper B');
    const item2 = recordTelemetryEvent('collab', 'Đã nhặt: "Thịt heo 500g"', 'Shopper B');
    const item3 = recordTelemetryEvent('collab', 'Đã nhặt: "Cà chua 500g"', 'Shopper B');

    // Teammate 4: Meal Planner
    const planEvent = recordTelemetryEvent('weekly', 'Tạo thực đơn 7 ngày chuẩn ngân sách 95k', 'Planner D');

    // Teammate 5: Smart Fridge Manager
    const fridgeEvent = recordTelemetryEvent('fridge', 'Giải cứu cơm nguội làm Cơm chiên Dương Châu', 'Cook E');

    const allEvents = getRecentTelemetryEvents(50);
    expect(allEvents.length).toBeGreaterThanOrEqual(6);

    // Verify all categories represented
    const categories = new Set(allEvents.map(e => e.category));
    expect(categories.has('collab')).toBe(true);
    expect(categories.has('weekly')).toBe(true);
    expect(categories.has('fridge')).toBe(true);

    // Zero null, undefined or NaN values in event stream
    allEvents.forEach(e => {
      expect(e.id).toBeTruthy();
      expect(e.action).toBeTruthy();
      expect(e.actor).toBeTruthy();
      expect(e.badge).toBeTruthy();
      expect(Number.isFinite(e.timestamp)).toBe(true);
    });
  });

});
