/**
 * Drinking Roulette Mathematical Engine & Game Rule Reducers
 * Pure headless utility module for angle calculations and game state transitions.
 * Guaranteed zero-drift continuous forward rotation and dead-center slice landing.
 */

export interface Player {
  id: string;
  name: string;
  color: string;
  shotsCount: number;
}

export interface ShotPenalty {
  id: string;
  label: string;
  sublabel: string;
  shots: number;
  color: string;
  isSpecial?: boolean;
  isBonus?: boolean;
}

export interface WedgeBounds {
  index: number;
  start: number;
  center: number;
  end: number;
  width: number;
  startDeg: number;
  centerDeg: number;
  endDeg: number;
}

export const SHOT_COLORS: readonly string[] = [
  '#f59e0b', // Amber 1
  '#ea580c', // Orange 2
  '#dc2626', // Red 3
  '#9333ea', // Purple 4
  '#0284c7', // Sky 5
  '#059669', // Emerald 6
];

/**
 * Calculates continuous forward rotation angle so that the wheel rotates
 * smoothly by at least minFullSpins full turns and lands EXACTLY with the
 * center of slice winningIndex under the 12 o'clock pointer (0 degrees).
 *
 * @param currentAngle Current accumulated rotation angle in degrees
 * @param winningIndex Target slice index [0..totalSegments-1]
 * @param totalSegments Total number of wedges on the wheel
 * @param minFullSpins Minimum full revolutions (default 6)
 * @returns New accumulated rotation angle in degrees (strictly > currentAngle)
 */
export function calculateNextWheelAngle(
  currentAngle: number,
  winningIndex: number,
  totalSegments: number,
  minFullSpins = 6
): number {
  const numSegs = Math.max(totalSegments, 1);
  const segAngle = 360 / numSegs;
  const wedgeCenter = winningIndex * segAngle + segAngle / 2;
  const targetNormalized = ((360 - wedgeCenter) % 360 + 360) % 360;
  const currentNormalized = ((currentAngle % 360) + 360) % 360;
  let forwardDelta = targetNormalized - currentNormalized;
  if (forwardDelta <= 1e-6) {
    forwardDelta += 360;
  }
  return currentAngle + 360 * minFullSpins + forwardDelta;
}

/**
 * Inverse verification: determines which slice index [0..totalSegments-1]
 * is positioned directly beneath the 12 o'clock pointer for a given wheel rotation.
 *
 * @param angle Accumulated wheel rotation angle in degrees
 * @param totalSegments Total number of wedges on the wheel
 * @returns Landed slice index [0..totalSegments-1]
 */
export function getLandedSliceIndex(
  angle: number,
  totalSegments: number
): number {
  const numSegs = Math.max(totalSegments, 1);
  const segAngle = 360 / numSegs;
  const landedAngleOnWheel = ((360 - (angle % 360)) % 360 + 360) % 360;
  return Math.floor(landedAngleOnWheel / segAngle) % numSegs;
}

/**
 * Returns angular boundaries and center point for a specific wedge.
 * Satisfies both { center, start, end, width } and { centerDeg, startDeg, endDeg, index }.
 *
 * @param sliceIndex Wedge index [0..totalSegments-1]
 * @param totalSegments Total number of wedges on the wheel
 */
export function getWedgeAngularBounds(
  sliceIndex: number,
  totalSegments: number
): WedgeBounds {
  const numSegs = Math.max(totalSegments, 1);
  const segAngle = 360 / numSegs;
  const startDeg = sliceIndex * segAngle;
  const endDeg = (sliceIndex + 1) * segAngle;
  const centerDeg = startDeg + segAngle / 2;

  return {
    index: sliceIndex,
    start: startDeg,
    center: centerDeg,
    end: endDeg,
    width: segAngle,
    startDeg,
    centerDeg,
    endDeg,
  };
}

/**
 * Pure generator: constructs the shot penalties list based on configured range and bonus options.
 *
 * @param minShots Minimum penalty shots (1..8)
 * @param maxShots Maximum penalty shots (1..8)
 * @param includeBonusSlots Whether to include bonus slots (May Mắn, Uống Hộ, Cả Bàn)
 */
export function generateShotSegments(
  minShots: number,
  maxShots: number,
  includeBonusSlots = true
): ShotPenalty[] {
  const list: ShotPenalty[] = [];
  const validMin = Math.max(1, Math.min(minShots, maxShots));
  const validMax = Math.min(8, Math.max(minShots, maxShots));

  // Generate numeric shot items
  for (let s = validMin; s <= validMax; s++) {
    list.push({
      id: `shot_${s}`,
      label: `${s} Shot`,
      sublabel: s === 1 ? 'Khởi động 🍺' : s === 2 ? 'Gấp đôi 🍻' : 'Nốc cạn 🥃',
      shots: s,
      color: SHOT_COLORS[(s - 1) % SHOT_COLORS.length],
      isSpecial: false,
      isBonus: false,
    });
  }

  // Unconditionally append bonus slots when includeBonusSlots is true
  if (includeBonusSlots) {
    list.push({
      id: 'bonus_0',
      label: 'May Mắn!',
      sublabel: '0 Shot 🍀',
      shots: 0,
      color: '#10b981',
      isSpecial: true,
      isBonus: true,
    });

    list.push({
      id: 'bonus_swap',
      label: 'Uống Hộ',
      sublabel: 'Chỉ định 1 người 🤝',
      shots: 1,
      color: '#8b5cf6',
      isSpecial: true,
      isBonus: true,
    });

    list.push({
      id: 'bonus_all',
      label: 'Cả Bàn!',
      sublabel: 'Mỗi người 1 ly 🍻',
      shots: 1,
      color: '#ec4899',
      isSpecial: true,
      isBonus: true,
    });
  }

  return list;
}

/**
 * Pure state reducer: "Cả Bàn!" rule.
 * Increments shotsCount by 1 for EVERY player in the session roster.
 *
 * @param players Active player roster
 * @returns New player array with all shotsCount incremented by 1
 */
export function applyCaBanRule(players: Player[]): Player[] {
  return players.map((p) => ({
    ...p,
    shotsCount: p.shotsCount + 1,
  }));
}

/**
 * Pure candidate selector: "Uống Hộ" rule.
 * Returns all active players excluding the original spinner (victim).
 *
 * @param players Active player roster
 * @param victimId ID of the player who spun "Uống Hộ"
 * @returns Filtered array of potential delegates
 */
export function getDelegateCandidates(
  players: Player[],
  victimId: string
): Player[] {
  return players.filter((p) => p.id !== victimId);
}

/**
 * Pure state reducer: "Uống Hộ" delegate penalty assignment.
 * Adds penalty shots to the chosen delegate; original spinner remains unchanged.
 *
 * @param players Active player roster
 * @param delegateId ID of the chosen delegate player
 * @param shots Number of penalty shots to assign (default 1)
 * @returns New player array with delegate penalty applied
 */
export function applyDelegatePenalty(
  players: Player[],
  delegateId: string,
  shots = 1
): Player[] {
  return players.map((p) => {
    if (p.id === delegateId) {
      return { ...p, shotsCount: p.shotsCount + shots };
    }
    return p;
  });
}

/**
 * Pure state reducer: standard shot penalty applied to selected player.
 *
 * @param players Active player roster
 * @param victimId ID of player who spun the shot wheel
 * @param shots Number of penalty shots landed
 * @returns New player array with victim penalty applied
 */
export function applyStandardPenalty(
  players: Player[],
  victimId: string,
  shots: number
): Player[] {
  return players.map((p) => {
    if (p.id === victimId) {
      return { ...p, shotsCount: p.shotsCount + shots };
    }
    return p;
  });
}

/**
 * Pure sorting: ranks players descending by shot tally.
 * Does not mutate the input array.
 *
 * @param players Active player roster
 * @returns New sorted array (highest shots first)
 */
export function rankPlayersByShots(players: Player[]): Player[] {
  return [...players].sort((a, b) => b.shotsCount - a.shotsCount);
}
