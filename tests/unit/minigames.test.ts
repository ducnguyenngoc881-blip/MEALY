import { describe, it, expect } from '../helpers/testRunner';
import fs from 'fs';
import path from 'path';
import {
  calculateNextWheelAngle,
  getLandedSliceIndex,
  getWedgeAngularBounds,
  generateShotSegments,
  applyCaBanRule,
  getDelegateCandidates,
  applyDelegatePenalty,
  applyStandardPenalty,
  rankPlayersByShots,
  Player,
  ShotPenalty,
} from '../../src/utils/rouletteMath';
import { calculateNextWheelAngle as wheelCalcAngle } from '../../src/components/RouletteWheel';

describe('Unit: Minigame Arcade Hub & Drinking Roulette (Interactive Party Games)', () => {
  const srcDir = path.resolve(process.cwd(), 'src');
  const componentsDir = path.join(srcDir, 'components');

  it('MINIGAME-01: Sidebar replaces Mở Hòm button with Minigame button using Gamepad2 icon', () => {
    const sidebarCode = fs.readFileSync(path.join(componentsDir, 'Sidebar.tsx'), 'utf-8');

    expect(sidebarCode).toContain('Gamepad2');
    expect(sidebarCode).toContain('Minigame');
    expect(sidebarCode).toContain('openMinigameHub');
    expect(sidebarCode).toContain('handleOpenMinigames');
  });

  it('MINIGAME-02: MinigameHubModal exists and contains 3 games (Case Opening, Drinking Roulette, Coming Soon)', () => {
    const hubPath = path.join(componentsDir, 'MinigameHubModal.tsx');
    expect(fs.existsSync(hubPath)).toBe(true);

    const hubCode = fs.readFileSync(hubPath, 'utf-8');
    // Game 1: Case Opening
    expect(hubCode).toContain('Mở Hòm Bữa Cơm');
    expect(hubCode).toContain('openApexModal');

    // Game 2: Drinking Roulette
    expect(hubCode).toContain('Vòng Quay Bàn Nhậu');
    expect(hubCode).toContain('openDrinkRoulette');

    // Game 3: Coming Soon
    expect(hubCode).toContain('SẮP RA MẮT');
    expect(hubCode).toContain('Coming Soon');
    expect(hubCode).toContain('ĐANG PHÁT TRIỂN');
  });

  it('MINIGAME-03: RouletteWheel SVG component exists with flapper indicator, view-box coordinates, and center spin hub', () => {
    const wheelPath = path.join(componentsDir, 'RouletteWheel.tsx');
    expect(fs.existsSync(wheelPath)).toBe(true);

    const wheelCode = fs.readFileSync(wheelPath, 'utf-8');
    expect(wheelCode).toContain('<svg');
    expect(wheelCode).toContain('rotationAngle');
    expect(wheelCode).toContain('centerLabel');
    expect(wheelCode).toContain('border-t-amber-500'); // top flapper pointer
    expect(wheelCode).toContain("transformBox: 'view-box'");
    expect(wheelCode).toContain('transformOrigin');
    // Verify re-export of calculateNextWheelAngle
    expect(wheelCalcAngle).toBe(calculateNextWheelAngle);
  });

  it('MINIGAME-04: DrinkRouletteModal provides interactive multi-stage wheel game with player roster', () => {
    const drinkPath = path.join(componentsDir, 'DrinkRouletteModal.tsx');
    expect(fs.existsSync(drinkPath)).toBe(true);

    const drinkCode = fs.readFileSync(drinkPath, 'utf-8');
    // Player setup controls
    expect(drinkCode).toContain('handleAddPlayer');
    expect(drinkCode).toContain('handleRemovePlayer');
    expect(drinkCode).toContain('players.length < 2'); // Minimum 2 players required

    // Game stages including delegate sub-wheel
    expect(drinkCode).toContain('WHEEL_PLAYER');
    expect(drinkCode).toContain('WHEEL_SHOTS');
    expect(drinkCode).toContain('WHEEL_DELEGATE');
    expect(drinkCode).toContain('handleSpinPlayerWheel');
    expect(drinkCode).toContain('handleSpinShotWheel');
    expect(drinkCode).toContain('handleSpinDelegateWheel');
  });

  it('MINIGAME-05: Shot count generator dynamically reflects user configured min and max range with bonus slots', () => {
    // Preset 1: 1..3 shots with bonus
    const preset1 = generateShotSegments(1, 3, true);
    expect(preset1.length).toBe(6); // 3 numeric shots (1, 2, 3) + 3 bonus slots
    expect(preset1.map((s) => s.shots)).toEqual([1, 2, 3, 0, 1, 1]);
    expect(preset1.some((s) => s.id === 'bonus_0' && s.isSpecial && s.isBonus)).toBe(true);
    expect(preset1.some((s) => s.id === 'bonus_swap' && s.isSpecial && s.isBonus)).toBe(true);
    expect(preset1.some((s) => s.id === 'bonus_all' && s.isSpecial && s.isBonus)).toBe(true);

    // Preset 2: 2..5 shots with bonus
    const preset2 = generateShotSegments(2, 5, true);
    expect(preset2.length).toBe(7); // 4 numeric shots (2, 3, 4, 5) + 3 bonus slots
    expect(preset2.slice(0, 4).map((s) => s.shots)).toEqual([2, 3, 4, 5]);

    // Preset 3: 1..2 shots without bonus
    const preset3 = generateShotSegments(1, 2, false);
    expect(preset3.length).toBe(2);
    expect(preset3.map((s) => s.shots)).toEqual([1, 2]);
    expect(preset3.every((s) => !s.isBonus && !s.isSpecial)).toBe(true);

    // Preset 4: Unconditional bonus slot availability even with min=max=1
    const preset4 = generateShotSegments(1, 1, true);
    expect(preset4.length).toBe(4); // 1 numeric shot + 3 bonus slots
    expect(preset4.some((s) => s.id === 'bonus_all')).toBe(true);
    expect(preset4.some((s) => s.id === 'bonus_swap')).toBe(true);

    // Edge case: clamping sanitization
    const clampedMax = generateShotSegments(1, 12, false);
    expect(clampedMax.length).toBe(8); // clamped to 1..8
    expect(clampedMax[clampedMax.length - 1].shots).toBe(8);

    const reversed = generateShotSegments(4, 2, false);
    expect(reversed.length).toBe(3); // normalized to 2..4
    expect(reversed.map((s) => s.shots)).toEqual([2, 3, 4]);
  });

  it('MINIGAME-06: Drinking Roulette accumulates shots per player in session scoreboard and ranks descending', () => {
    const testPlayers: Player[] = [
      { id: '1', name: 'Nam', color: '#ef4444', shotsCount: 0 },
      { id: '2', name: 'Linh', color: '#3b82f6', shotsCount: 0 },
      { id: '3', name: 'Hùng', color: '#10b981', shotsCount: 0 },
    ];

    // Round 1: Nam receives 2 shots
    const r1 = applyStandardPenalty(testPlayers, '1', 2);
    expect(r1.find((p) => p.id === '1')?.shotsCount).toBe(2);
    expect(r1.find((p) => p.id === '2')?.shotsCount).toBe(0);

    // Round 2: Linh receives 1 shot
    const r2 = applyStandardPenalty(r1, '2', 1);
    expect(r2.find((p) => p.id === '2')?.shotsCount).toBe(1);

    // Round 3: Nam receives 3 shots (cumulative = 5)
    const r3 = applyStandardPenalty(r2, '1', 3);
    expect(r3.find((p) => p.id === '1')?.shotsCount).toBe(5);

    // Round 4: Hùng receives 2 shots
    const r4 = applyStandardPenalty(r3, '3', 2);
    expect(r4.find((p) => p.id === '3')?.shotsCount).toBe(2);

    // Verify scoreboard descending rank: Nam (5) > Hùng (2) > Linh (1)
    const ranked = rankPlayersByShots(r4);
    expect(ranked[0].name).toBe('Nam');
    expect(ranked[0].shotsCount).toBe(5);
    expect(ranked[1].name).toBe('Hùng');
    expect(ranked[1].shotsCount).toBe(2);
    expect(ranked[2].name).toBe('Linh');
    expect(ranked[2].shotsCount).toBe(1);

    // Verify immutability: original array remained untouched
    expect(testPlayers[0].shotsCount).toBe(0);
    expect(testPlayers[1].shotsCount).toBe(0);
  });

  it('MINIGAME-07: Audio synthesis module exports roulette ticks and celebration sound effects', () => {
    const audioPath = path.join(srcDir, 'utils', 'audioSynth.ts');
    const audioCode = fs.readFileSync(audioPath, 'utf-8');

    expect(audioCode).toContain('export const playRouletteTick');
    expect(audioCode).toContain('export const playVictoryFanfare');
    expect(audioCode).toContain('export const playGlassClink');
    expect(audioCode).toContain('export const setApexMuted');
    expect(audioCode).toContain('export const getApexMuted');
  });

  it('MINIGAME-08: GlobalModals mounts both MinigameHubModal and DrinkRouletteModal in App.tsx', () => {
    const appCode = fs.readFileSync(path.join(srcDir, 'App.tsx'), 'utf-8');

    expect(appCode).toContain('MinigameHubModal');
    expect(appCode).toContain('DrinkRouletteModal');
    expect(appCode).toContain('<MinigameHubModal isOpen={isMinigameHubOpen}');
    expect(appCode).toContain('<DrinkRouletteModal isOpen={isDrinkRouletteOpen}');
  });

  it('MINIGAME-09A: 100 consecutive spins per roster size for all 9 sizes (2 to 10 players, 900 spins total)', () => {
    let totalSpins = 0;
    let totalMismatches = 0;

    for (let numPlayers = 2; numPlayers <= 10; numPlayers++) {
      // Start from a random initial angle (positive or negative)
      let currentAngle = (Math.random() - 0.5) * 7200;

      for (let spin = 1; spin <= 100; spin++) {
        totalSpins++;
        const targetSlice = Math.floor(Math.random() * numPlayers);
        const nextAngle = calculateNextWheelAngle(currentAngle, targetSlice, numPlayers, 6);

        // Invariant 1: Strictly monotonic forward rotation (no backwards spin)
        expect(nextAngle).toBeGreaterThan(currentAngle);

        // Invariant 2: Minimum 6 full revolutions (2160 deg)
        expect(nextAngle - currentAngle).toBeGreaterThanOrEqual(360 * 6 - 1e-6);

        // Invariant 3: Top pointer at 12 o'clock points directly into target slice
        const landedSlice = getLandedSliceIndex(nextAngle, numPlayers);
        if (landedSlice !== targetSlice) {
          totalMismatches++;
        }
        expect(landedSlice).toBe(targetSlice);

        // Invariant 4: Landed angle falls precisely inside slice angular bounds
        const bounds = getWedgeAngularBounds(targetSlice, numPlayers);
        const landedNormalized = ((360 - (nextAngle % 360)) % 360 + 360) % 360;
        const diffFromCenter = Math.abs(landedNormalized - bounds.centerDeg);
        expect(diffFromCenter < 0.0001).toBe(true);

        currentAngle = nextAngle;
      }
    }

    // Comprehensive simulation matrix assertions: 9 sizes x 100 spins = 900 spins, 0 mismatches
    expect(totalSpins).toBe(900);
    expect(totalMismatches).toBe(0);
  });

  it('MINIGAME-09B: 100-spin continuous dynamic session with high accumulated angle (> 200,000°)', () => {
    let sessionAngle = 0;
    let sessionMismatches = 0;

    // Simulate an ongoing live party session of 100 spins where players join/leave
    for (let spin = 1; spin <= 100; spin++) {
      // Dynamic roster size varying between 2 and 10 players
      const rosterSize = 2 + Math.floor(Math.random() * 9);
      const targetSlice = Math.floor(Math.random() * rosterSize);

      sessionAngle = calculateNextWheelAngle(sessionAngle, targetSlice, rosterSize, 6);
      const landed = getLandedSliceIndex(sessionAngle, rosterSize);

      if (landed !== targetSlice) {
        sessionMismatches++;
      }
      expect(landed).toBe(targetSlice);
    }

    // After 100 spins with >= 6 turns each (100 * 2160 deg = 216,000 deg), angle exceeds 200,000°
    expect(sessionAngle).toBeGreaterThan(200000);
    expect(sessionMismatches).toBe(0);
  });

  it('MINIGAME-09C: Boundary angle invariants (negative angles, fractional degrees, boundary slices 0 & N-1, odd sizes)', () => {
    // 1. Negative starting angles
    const negativeAngles = [-72000.5, -3600, -1080.25, -360, -0.0001];
    for (const negAngle of negativeAngles) {
      for (const size of [2, 5, 8, 10]) {
        const target = Math.floor(Math.random() * size);
        const next = calculateNextWheelAngle(negAngle, target, size, 6);
        expect(next).toBeGreaterThan(negAngle);
        expect(getLandedSliceIndex(next, size)).toBe(target);
      }
    }

    // 2. Fractional current angles
    const fractionalAngles = [0.00001, 45.123456, 179.9999, 270.5, 359.9999];
    for (const fracAngle of fractionalAngles) {
      for (const size of [3, 4, 7]) {
        const target = Math.floor(Math.random() * size);
        const next = calculateNextWheelAngle(fracAngle, target, size, 6);
        expect(getLandedSliceIndex(next, size)).toBe(target);
      }
    }

    // 3. Boundary slice indices: 0 and N-1 across all sizes 2..10
    for (let size = 2; size <= 10; size++) {
      // First slice (index 0)
      const next0 = calculateNextWheelAngle(1000, 0, size, 6);
      expect(getLandedSliceIndex(next0, size)).toBe(0);

      // Last slice (index size - 1)
      const nextLast = calculateNextWheelAngle(1000, size - 1, size, 6);
      expect(getLandedSliceIndex(nextLast, size)).toBe(size - 1);

      // Verify angular bounds for boundary slices
      const bounds0 = getWedgeAngularBounds(0, size);
      expect(bounds0.startDeg).toBe(0);
      expect(bounds0.start).toBe(0);

      const boundsLast = getWedgeAngularBounds(size - 1, size);
      expect(boundsLast.endDeg).toBe(360);
      expect(boundsLast.end).toBe(360);
      expect(boundsLast.width).toBeCloseTo(360 / size, 4);
    }

    // 4. Odd roster sizes (non-terminating decimal degrees like 360/7 = 51.42857...)
    const oddSizes = [3, 5, 7, 9];
    for (const oddSize of oddSizes) {
      let angle = 500;
      for (let s = 0; s < oddSize; s++) {
        angle = calculateNextWheelAngle(angle, s, oddSize, 6);
        expect(getLandedSliceIndex(angle, oddSize)).toBe(s);
      }
    }
  });

  it('MINIGAME-10: "Cả Bàn!" rule increments shotsCount for all active players across multiple roster sizes and maintains leaderboard ordering', () => {
    // 1. Verify across 2, 4, and 10 player rosters
    const rosterSizes = [2, 4, 10];
    for (const size of rosterSizes) {
      const players: Player[] = Array.from({ length: size }, (_, i) => ({
        id: `p_${i + 1}`,
        name: `Player ${i + 1}`,
        color: '#f59e0b',
        shotsCount: i, // distinct initial tallies
      }));

      const updated = applyCaBanRule(players);
      expect(updated.length).toBe(size);

      // Every player's tally is incremented by exactly 1
      for (let i = 0; i < size; i++) {
        expect(updated[i].shotsCount).toBe(players[i].shotsCount + 1);
        expect(updated[i].id).toBe(players[i].id);
      }

      // Immutability check
      expect(players[0].shotsCount).toBe(0);
    }

    // 2. Verify 3 consecutive "Cả Bàn!" triggers result in +3 for every player
    const group: Player[] = [
      { id: '1', name: 'Nam', color: '#ef4444', shotsCount: 0 },
      { id: '2', name: 'Linh', color: '#3b82f6', shotsCount: 2 },
      { id: '3', name: 'Hùng', color: '#10b981', shotsCount: 4 },
      { id: '4', name: 'Vinh', color: '#8b5cf6', shotsCount: 1 },
    ];

    let currentSession = group;
    for (let r = 0; r < 3; r++) {
      currentSession = applyCaBanRule(currentSession);
    }

    expect(currentSession.find((p) => p.id === '1')?.shotsCount).toBe(3);
    expect(currentSession.find((p) => p.id === '2')?.shotsCount).toBe(5);
    expect(currentSession.find((p) => p.id === '3')?.shotsCount).toBe(7);
    expect(currentSession.find((p) => p.id === '4')?.shotsCount).toBe(4);

    // 3. Verify leaderboard rank ordering is strictly preserved
    const initialRanking = rankPlayersByShots(group).map((p) => p.id);
    const postRanking = rankPlayersByShots(currentSession).map((p) => p.id);
    expect(postRanking).toEqual(initialRanking);
    expect(postRanking).toEqual(['3', '2', '4', '1']);
  });

  it('MINIGAME-11: "Uống Hộ" sub-wheel rule candidate exclusion, 2-player boundary, penalty assignment and session conservation', () => {
    const fullRoster: Player[] = [
      { id: 'p1', name: 'Vinh Lê', color: '#ef4444', shotsCount: 2 },
      { id: 'p2', name: 'Ngô Bảo', color: '#3b82f6', shotsCount: 1 },
      { id: 'p3', name: 'Cường', color: '#10b981', shotsCount: 0 },
      { id: 'p4', name: 'Trang', color: '#f59e0b', shotsCount: 3 },
    ];

    // 1. Candidate pool excludes original spinner (victim)
    const victimId = 'p1';
    const candidates = getDelegateCandidates(fullRoster, victimId);
    expect(candidates.length).toBe(3);
    expect(candidates.some((c) => c.id === victimId)).toBe(false);
    expect(candidates.map((c) => c.id)).toEqual(['p2', 'p3', 'p4']);

    // 2. 2-player boundary: candidate pool size is exactly 1
    const duoRoster: Player[] = [
      { id: 'a', name: 'Alice', color: '#ef4444', shotsCount: 0 },
      { id: 'b', name: 'Bob', color: '#3b82f6', shotsCount: 0 },
    ];
    const duoCandidates = getDelegateCandidates(duoRoster, 'a');
    expect(duoCandidates.length).toBe(1);
    expect(duoCandidates[0].id).toBe('b');

    // 3. Delegate receives penalty and original spinner tally remains unchanged
    const delegateId = 'p3'; // Cường is chosen
    const beforeTotalShots = fullRoster.reduce((sum, p) => sum + p.shotsCount, 0);
    const afterPenalty = applyDelegatePenalty(fullRoster, delegateId, 2);

    // Original spinner (Vinh Lê) remains at 2 shots (delta = 0)
    expect(afterPenalty.find((p) => p.id === 'p1')?.shotsCount).toBe(2);
    // Non-delegate players remain unchanged
    expect(afterPenalty.find((p) => p.id === 'p2')?.shotsCount).toBe(1);
    expect(afterPenalty.find((p) => p.id === 'p4')?.shotsCount).toBe(3);
    // Delegate (Cường) receives +2 shots (0 + 2 = 2)
    expect(afterPenalty.find((p) => p.id === 'p3')?.shotsCount).toBe(2);

    // 4. Session penalty count conservation: total shots increases by exactly penalty amount
    const afterTotalShots = afterPenalty.reduce((sum, p) => sum + p.shotsCount, 0);
    expect(afterTotalShots - beforeTotalShots).toBe(2);

    // 5. Immutability check
    expect(fullRoster.find((p) => p.id === 'p3')?.shotsCount).toBe(0);
  });

  it('MINIGAME-12: DrinkRouletteModal code includes WHEEL_DELEGATE stage and handleSpinDelegateWheel', () => {
    const drinkPath = path.join(componentsDir, 'DrinkRouletteModal.tsx');
    const drinkCode = fs.readFileSync(drinkPath, 'utf-8');

    // Stage definition
    expect(drinkCode).toContain("'WHEEL_DELEGATE'");

    // State & Handlers
    expect(drinkCode).toContain('handleSpinDelegateWheel');
    expect(drinkCode).toContain('delegateCandidates');
    expect(drinkCode).toContain('chosenDelegate');

    // Bonus rules identifiers & celebration texts
    expect(drinkCode).toContain('bonus_all');
    expect(drinkCode).toContain('bonus_swap');
    expect(drinkCode).toContain('THẦN CỒN TRIỆU TẬP');
    expect(drinkCode).toContain('CẢ BÀN CÙNG DÔ');
    expect(drinkCode).toContain('uống hộ');
  });

  it('MINIGAME-13: DrinkRouletteModal imports from src/utils/rouletteMath.ts and integrates state reducers', () => {
    const drinkPath = path.join(componentsDir, 'DrinkRouletteModal.tsx');
    const drinkCode = fs.readFileSync(drinkPath, 'utf-8');

    // Imports from rouletteMath
    expect(drinkCode).toContain("from '../utils/rouletteMath'");
    expect(drinkCode).toContain('calculateNextWheelAngle');
    expect(drinkCode).toContain('generateShotSegments');
    expect(drinkCode).toContain('applyCaBanRule');
    expect(drinkCode).toContain('getDelegateCandidates');
    expect(drinkCode).toContain('applyDelegatePenalty');
    expect(drinkCode).toContain('applyStandardPenalty');
    expect(drinkCode).toContain('rankPlayersByShots');

    // Integration calls
    expect(drinkCode).toContain('applyCaBanRule(');
    expect(drinkCode).toContain('applyDelegatePenalty(');
    expect(drinkCode).toContain('rankPlayersByShots(');
  });
});
