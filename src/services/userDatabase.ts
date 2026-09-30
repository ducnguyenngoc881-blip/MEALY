/**
 * MealWise User Database Engine (userDatabase.ts)
 * 
 * Provides offline-first dual-track persistence for:
 * 1. Registered Users: Full profiles and isolated account data partitions (weekly plans, fridge, favorites).
 * 2. Non-Registered Users (Guests): Persistent trial sessions and guest data partitions.
 * 3. Migration & Retention: Seamless migration of guest trial plans to newly registered accounts.
 */

import { 
  RegisteredUser, 
  GuestUserSession, 
  UserAppDataPartition, 
  WeeklyPlan, 
  PantryItem, 
  Recipe 
} from '../types';
import { recordUserInRegistry, getRegisteredAccounts } from '../utils/telemetryEngine';

// Storage keys
export const USERS_DB_KEY = 'mealwise_users_db';
export const GUEST_SESSION_KEY = 'mealwise_guest_session';
export const GUEST_PARTITION_KEY = 'mealwise_guest_partition';
export const USER_PARTITION_PREFIX = 'mealwise_user_partition_';

/**
 * Generate a random alphanumeric string
 */
function randomString(len = 6): string {
  return Math.random().toString(36).substring(2, 2 + len);
}

// ============================================================================
// GUEST (NON-REGISTERED) USER ENGINE
// ============================================================================

/**
 * Retrieve or initialize a persistent guest user session
 */
export function getOrCreateGuestSession(): GuestUserSession {
  if (typeof window === 'undefined') {
    return {
      guestId: 'guest_ssr',
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      planModified: false,
      fridgeItemCount: 0
    };
  }

  try {
    const raw = localStorage.getItem(GUEST_SESSION_KEY);
    if (raw) {
      const parsed: GuestUserSession = JSON.parse(raw);
      if (parsed && parsed.guestId) {
        // Touch last active
        parsed.lastActiveAt = new Date().toISOString();
        localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {}

  const now = new Date().toISOString();
  const newGuest: GuestUserSession = {
    guestId: `guest_${Date.now()}_${randomString()}`,
    createdAt: now,
    lastActiveAt: now,
    planModified: false,
    fridgeItemCount: 0
  };

  try {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(newGuest));
  } catch {}

  return newGuest;
}

/**
 * Update guest session metadata (e.g. plan modified, fridge count)
 */
export function updateGuestSession(updates: Partial<GuestUserSession>): GuestUserSession {
  const current = getOrCreateGuestSession();
  const next: GuestUserSession = {
    ...current,
    ...updates,
    lastActiveAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(GUEST_SESSION_KEY, JSON.stringify(next));
  } catch {}

  return next;
}

/**
 * Load the non-registered guest data partition
 */
export function loadGuestPartition(): UserAppDataPartition | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(GUEST_PARTITION_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

/**
 * Save data into the non-registered guest partition
 */
export function saveGuestPartition(data: Partial<UserAppDataPartition>): void {
  if (typeof window === 'undefined') return;
  try {
    const current = loadGuestPartition() || { updatedAt: Date.now() };
    const next: UserAppDataPartition = {
      ...current,
      ...data,
      updatedAt: Date.now()
    };
    localStorage.setItem(GUEST_PARTITION_KEY, JSON.stringify(next));

    // Update guest session metrics
    if (data.weeklyPlan) {
      updateGuestSession({ planModified: true });
    }
    if (data.pantryItems) {
      updateGuestSession({ fridgeItemCount: data.pantryItems.length });
    }
  } catch {}
}

/**
 * Check if the active guest session has customized content (e.g. meal plans or fridge items)
 */
export function hasCustomGuestData(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const guestData = loadGuestPartition();
    if (!guestData) return false;

    // Check if fridge has items
    if (guestData.pantryItems && guestData.pantryItems.length > 0) return true;

    // Check if weekly plan has dishes
    if (guestData.weeklyPlan && Array.isArray(guestData.weeklyPlan)) {
      const totalDishes = guestData.weeklyPlan.reduce((acc: number, d) => {
        const b = d?.meals?.breakfast ? 1 : 0;
        const l = d?.meals?.lunch ? (Array.isArray(d.meals.lunch) ? d.meals.lunch.length : 1) : 0;
        const dn = d?.meals?.dinner ? (Array.isArray(d.meals.dinner) ? d.meals.dinner.length : 1) : 0;
        return acc + b + l + dn;
      }, 0);
      if (totalDishes > 0) return true;
    }
  } catch {}
  return false;
}

// ============================================================================
// REGISTERED USER ENGINE & ISOLATED PARTITIONS
// ============================================================================

/**
 * Retrieve all registered users from the local database
 */
export function getAllRegisteredUsers(): RegisteredUser[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USERS_DB_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  // Sync with telemetry registry default bootstrap if empty
  const telemetryAccounts = getRegisteredAccounts();
  const bootstrap: RegisteredUser[] = telemetryAccounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    email: acc.email,
    isRegistered: true,
    role: acc.role,
    registeredAt: acc.registeredAt,
    lastLoginAt: acc.lastActive,
    onboardingCompleted: true
  }));

  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(bootstrap));
  } catch {}

  return bootstrap;
}

/**
 * Find registered user by email
 */
export function getRegisteredUserByEmail(email: string): RegisteredUser | null {
  if (!email) return null;
  const list = getAllRegisteredUsers();
  const target = email.trim().toLowerCase();
  return list.find(u => u.email.trim().toLowerCase() === target) || null;
}

/**
 * Load isolated app data partition for a specific registered user
 */
export function loadUserPartition(userId: string): UserAppDataPartition | null {
  if (typeof window === 'undefined' || !userId) return null;
  try {
    const key = `${USER_PARTITION_PREFIX}${userId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

/**
 * Save isolated app data partition for a specific registered user
 */
export function saveUserPartition(userId: string, data: Partial<UserAppDataPartition>): void {
  if (typeof window === 'undefined' || !userId) return;
  try {
    const key = `${USER_PARTITION_PREFIX}${userId}`;
    const current = loadUserPartition(userId) || { updatedAt: Date.now() };
    const next: UserAppDataPartition = {
      ...current,
      ...data,
      updatedAt: Date.now()
    };
    localStorage.setItem(key, JSON.stringify(next));
  } catch {}
}

/**
 * Register a new user account with optional guest data migration
 */
export function registerUserInDatabase(
  profile: { name: string; email: string; role?: 'user' | 'admin' },
  options?: {
    migrateGuestData?: boolean;
    guestData?: UserAppDataPartition;
    onboardingCompleted?: boolean;
  }
): { user: RegisteredUser; migrated: boolean } {
  const emailLower = profile.email.trim().toLowerCase();
  const isAdmin = emailLower === 'admin@mealwise.vn' || emailLower === 'admin@mealwise.com' || emailLower === 'admin';
  const role: 'user' | 'admin' = isAdmin ? 'admin' : (profile.role || 'user');
  const nowStr = new Date().toLocaleDateString('vi-VN');

  const users = getAllRegisteredUsers();
  const existingIdx = users.findIndex(u => u.email.trim().toLowerCase() === emailLower);

  let user: RegisteredUser;
  let userId: string;

  if (existingIdx >= 0) {
    // Existing user account update
    userId = users[existingIdx].id || `usr_${Date.now()}_${randomString()}`;
    user = {
      ...users[existingIdx],
      id: userId,
      name: profile.name.trim() || users[existingIdx].name,
      role,
      lastLoginAt: nowStr
    };
    if (options?.onboardingCompleted !== undefined) {
      user.onboardingCompleted = options.onboardingCompleted;
    }
    users[existingIdx] = user;
  } else {
    // New user registration
    userId = `usr_${Date.now()}_${randomString()}`;
    user = {
      id: userId,
      name: profile.name.trim() || emailLower.split('@')[0],
      email: profile.email.trim(),
      isRegistered: true,
      role,
      registeredAt: nowStr,
      lastLoginAt: nowStr,
      onboardingCompleted: options?.onboardingCompleted ?? (isAdmin ? true : false)
    };
    users.unshift(user);
  }

  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {}

  // Sync with telemetry registry
  recordUserInRegistry({
    name: user.name,
    email: user.email,
    role: user.role
  });

  // Handle guest data migration
  let migrated = false;
  if (options?.migrateGuestData) {
    const dataToMigrate = options.guestData || loadGuestPartition();
    if (dataToMigrate) {
      saveUserPartition(userId, dataToMigrate);
      migrated = true;
    }
  }

  return { user, migrated };
}

/**
 * Migrate guest trial data into a registered user's partition
 */
export function migrateGuestDataToUser(userId: string): boolean {
  if (!userId) return false;
  const guestData = loadGuestPartition();
  if (!guestData) return false;

  saveUserPartition(userId, guestData);
  // Clear guest partition after successful migration
  try {
    localStorage.removeItem(GUEST_PARTITION_KEY);
    updateGuestSession({ planModified: false, fridgeItemCount: 0 });
  } catch {}

  return true;
}

/**
 * Delete a user account and clean up their partition
 */
export function deleteUserAccountFromDatabase(userId: string): boolean {
  if (!userId) return false;
  try {
    const users = getAllRegisteredUsers().filter(u => u.id !== userId);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    localStorage.removeItem(`${USER_PARTITION_PREFIX}${userId}`);
    return true;
  } catch {
    return false;
  }
}

// ============================================================================
// ADMIN TELEMETRY & OBSERVABILITY
// ============================================================================

export interface UserDatabaseStats {
  totalRegistered: number;
  totalGuests: number;
  guestsWithCustomPlan: number;
  conversionRatePercent: number;
}

/**
 * Get aggregated statistics of registered accounts vs guest sessions
 */
export function getUserDatabaseStats(): UserDatabaseStats {
  const registered = getAllRegisteredUsers();
  const guest = getOrCreateGuestSession();
  const hasGuestPlan = guest.planModified || hasCustomGuestData();

  const totalRegistered = registered.length;
  // If there's a guest session, count it
  const totalGuests = guest.guestId ? 1 : 0;
  const guestsWithCustomPlan = hasGuestPlan ? 1 : 0;
  const totalUsers = totalRegistered + totalGuests;
  const conversionRatePercent = totalUsers > 0 ? Math.round((totalRegistered / totalUsers) * 100) : 100;

  return {
    totalRegistered,
    totalGuests,
    guestsWithCustomPlan,
    conversionRatePercent
  };
}
