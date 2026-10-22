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

/**
 * Sanitize user input against XSS / HTML script injection and control characters
 */
export function sanitizeUserInput(input: string, maxLength = 200): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*\/?\s*(script|iframe|object|embed|svg|link|style|meta)[^>]*>/gi, '')
    .replace(/javascript\s*:/gi, '')
    .replace(/on[a-z]+\s*=\s*(['"][^'"]*['"]|[^\s>]+)/gi, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim()
    .slice(0, maxLength);
}

/**
 * Normalize email or Vietnamese phone number identifier.
 * Strips +84 prefix and prefixes with 0. Strips spaces, hyphens, dots.
 * Trims and lowercases emails.
 */
export function normalizeIdentifier(emailOrPhone: string): string {
  if (!emailOrPhone || typeof emailOrPhone !== 'string') return '';
  const clean = sanitizeUserInput(emailOrPhone, 120).toLowerCase();
  const stripped = clean.replace(/[\s.-]/g, '');
  if (/^\+840\d{8,10}$/.test(stripped)) {
    return '0' + stripped.slice(4);
  }
  if (/^\+84\d{8,10}$/.test(stripped)) {
    return '0' + stripped.slice(3);
  }
  if (/^\d[\d\s.-]{7,13}$/.test(clean)) {
    return clean.replace(/[\s.-]/g, '');
  }
  return clean;
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
 * Find registered user by email or phone number
 */
export function getRegisteredUserByEmail(email: string): RegisteredUser | null {
  if (!email) return null;
  const list = getAllRegisteredUsers();
  const target = normalizeIdentifier(email);
  if (!target) return null;
  return list.find(u => normalizeIdentifier(u.email) === target) || null;
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

    if (typeof fetch === 'function') {
      const users = getAllRegisteredUsers();
      const owner = users.find(u => u.id === userId);
      if (owner?.email) {
        fetch('/api/db/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: normalizeIdentifier(owner.email),
            profile: next,
            mealPlan: next.weeklyPlan,
            favorites: next.favoriteRecipeIds
          })
        }).catch(() => {});
      }
    }
  } catch {}
}

/**
 * Compute a deterministic lightweight hash for local password verification
 */
export function hashUserPassword(password: string): string {
  const clean = password.trim();
  let h1 = 0xdeadbeef ^ clean.length;
  let h2 = 0x41c6ce57 ^ clean.length;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `mw_${(h2 >>> 0).toString(36)}_${(h1 >>> 0).toString(36)}`;
}

/**
 * Verify a user's password against their stored hash (if set)
 */
export function verifyUserPassword(
  email: string,
  password?: string
): { valid: boolean; user: RegisteredUser | null } {
  const existing = getRegisteredUserByEmail(email);
  if (!existing) {
    return { valid: false, user: null };
  }
  if (existing.passwordHash) {
    if (!password || !password.trim()) {
      return { valid: false, user: existing };
    }
    const hashed = hashUserPassword(password);
    if (hashed !== existing.passwordHash) {
      return { valid: false, user: existing };
    }
  }
  return { valid: true, user: existing };
}

/**
 * Register a new user account with optional guest data migration
 */
export function registerUserInDatabase(
  profile: { name: string; email: string; role?: 'user' | 'admin'; password?: string },
  options?: {
    migrateGuestData?: boolean;
    guestData?: UserAppDataPartition;
    onboardingCompleted?: boolean;
  }
): { user: RegisteredUser; migrated: boolean } {
  const normIdentifier = normalizeIdentifier(profile.email);
  const isAdmin = normIdentifier === 'admin@mealwise.vn' || normIdentifier === 'admin@mealwise.com' || normIdentifier === 'admin';
  const role: 'user' | 'admin' = isAdmin ? 'admin' : (profile.role || 'user');
  const nowStr = new Date().toLocaleDateString('vi-VN');
  const passwordHash = profile.password && profile.password.trim() ? hashUserPassword(profile.password) : undefined;

  const users = getAllRegisteredUsers();
  const existingIdx = users.findIndex(u => normalizeIdentifier(u.email) === normIdentifier);

  let user: RegisteredUser;
  let userId: string;

  if (existingIdx >= 0) {
    // Existing user account update
    userId = users[existingIdx].id || `usr_${Date.now()}_${randomString()}`;
    const cleanName = profile.name ? sanitizeUserInput(profile.name, 80) : '';
    const rawEmailOrPhone = profile.email ? sanitizeUserInput(profile.email, 120) : '';
    const isNameDefaultOrIdentifier =
      !cleanName ||
      cleanName === normIdentifier ||
      cleanName === rawEmailOrPhone ||
      normalizeIdentifier(cleanName) === normIdentifier ||
      cleanName === normIdentifier.split('@')[0] ||
      cleanName === rawEmailOrPhone.split('@')[0] ||
      cleanName === 'Thành Viên Mealy' ||
      cleanName === 'Người dùng';

    const existingName = users[existingIdx].name;
    const resolvedName = (existingName && isNameDefaultOrIdentifier)
      ? existingName
      : (cleanName || existingName || normIdentifier.split('@')[0] || 'Thành Viên Mealy');

    user = {
      ...users[existingIdx],
      id: userId,
      name: resolvedName,
      email: normIdentifier,
      role,
      lastLoginAt: nowStr,
      ...(passwordHash ? { passwordHash } : {})
    };
    if (options?.onboardingCompleted !== undefined) {
      user.onboardingCompleted = options.onboardingCompleted;
    }
    users[existingIdx] = user;
  } else {
    // New user registration
    userId = `usr_${Date.now()}_${randomString()}`;
    const cleanName = profile.name ? sanitizeUserInput(profile.name, 80) : '';
    user = {
      id: userId,
      name: cleanName || normIdentifier.split('@')[0] || 'Thành Viên Mealy',
      email: normIdentifier,
      isRegistered: true,
      role,
      registeredAt: nowStr,
      lastLoginAt: nowStr,
      onboardingCompleted: options?.onboardingCompleted ?? (isAdmin ? true : false),
      ...(passwordHash ? { passwordHash } : {})
    };
    users.unshift(user);
  }

  try {
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
  } catch {}

  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    const hasPasswordToSync = Boolean(profile.password && profile.password.trim());
    const isRegisterFlow = existingIdx < 0 || options?.onboardingCompleted === false || hasPasswordToSync;
    fetch(isRegisterFlow ? '/api/auth/register' : '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: user.email,
        email: user.email,
        name: user.name,
        password: profile.password || '',
        authProvider: user.email.includes('@') ? 'email' : 'phone',
        clientSync: true
      })
    }).catch(() => {});
  }

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
