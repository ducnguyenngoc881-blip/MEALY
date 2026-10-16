import { Recipe } from '../types';

/**
 * MealWise Cloud & Account-Scoped Recipe Sync Framework
 * =====================================================
 * Provides:
 * 1. Account-isolated storage (`mealwise_custom_recipes_<email>`) so each registered
 *    member has their own private Sổ Bếp Gia Đình.
 * 2. Offline mutation queue (`mealwise_recipe_sync_queue_<email>`) so recipes created
 *    offline are queued and pushed automatically once cloud connectivity is available.
 * 3. Plug-and-play `RecipeCloudAdapter` interface (REST / Supabase / Firebase ready).
 *    To connect a real cloud backend later, either:
 *    - Set `VITE_RECIPE_CLOUD_API_URL` in `.env` (uses the built-in REST adapter), OR
 *    - Call `registerRecipeCloudAdapter(mySupabaseOrFirebaseAdapter)` at app startup.
 */

export type CloudSyncState = 'local-only' | 'syncing' | 'synced' | 'offline-queued' | 'error';

export interface QueuedRecipeMutation {
  type: 'upsert' | 'delete';
  recipeId: string;
  recipe?: Recipe;
  timestamp: number;
}

export interface RecipeCloudAdapter {
  readonly providerName: string;
  isConfigured(): boolean;
  pullUserRecipes(userEmail: string, userId?: string): Promise<Recipe[] | null>;
  pushUserRecipes(userEmail: string, recipes: Recipe[], userId?: string): Promise<boolean>;
  deleteUserRecipe?(userEmail: string, recipeId: string, userId?: string): Promise<boolean>;
}

const LEGACY_GLOBAL_KEY = 'mealwise_custom_recipes';
const GUEST_SESSION_KEY = 'mealwise_custom_recipes_guest';

export function normalizeAccountEmail(email?: string | null): string {
  return (email || '').trim().toLowerCase();
}

export function getAccountRecipesStorageKey(email?: string | null): string {
  const clean = normalizeAccountEmail(email);
  if (!clean) return GUEST_SESSION_KEY;
  return `mealwise_custom_recipes_${clean}`;
}

export function getAccountSyncQueueKey(email?: string | null): string {
  const clean = normalizeAccountEmail(email);
  if (!clean) return 'mealwise_recipe_sync_queue_guest';
  return `mealwise_recipe_sync_queue_${clean}`;
}

/**
 * Loads custom recipes scoped to the given account email.
 * Automatically migrates legacy global `mealwise_custom_recipes` into the first
 * logged-in registered account if that account does not have its own partition yet.
 */
export function loadAccountCustomRecipes(email?: string | null): Recipe[] {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return [];
  const cleanEmail = normalizeAccountEmail(email);

  // Guest mode: only return guest-scoped recipes (e.g. recipes received via share link during guest session)
  if (!cleanEmail) {
    try {
      const guestSaved = localStorage.getItem(GUEST_SESSION_KEY);
      return guestSaved ? JSON.parse(guestSaved) : [];
    } catch {
      return [];
    }
  }

  const accountKey = getAccountRecipesStorageKey(cleanEmail);
  try {
    const accountSaved = localStorage.getItem(accountKey);
    if (accountSaved !== null) {
      const parsed = JSON.parse(accountSaved);
      if (Array.isArray(parsed)) return parsed;
    }

    // One-time migration from legacy unscoped `mealwise_custom_recipes` into this member's account
    const legacySaved = localStorage.getItem(LEGACY_GLOBAL_KEY);
    if (legacySaved) {
      const legacyParsed = JSON.parse(legacySaved);
      if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
        localStorage.setItem(accountKey, JSON.stringify(legacyParsed));
        localStorage.removeItem(LEGACY_GLOBAL_KEY);
        return legacyParsed;
      }
    }
  } catch (e) {
    console.error('Failed to load account custom recipes from localStorage', e);
  }
  return [];
}

/**
 * Saves custom recipes into the account-isolated localStorage partition.
 */
export function saveAccountCustomRecipes(email: string | null | undefined, recipes: Recipe[]): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const key = getAccountRecipesStorageKey(email);
  try {
    localStorage.setItem(key, JSON.stringify(recipes));
  } catch (e) {
    console.error('Failed to save account custom recipes to localStorage', e);
  }
}

/**
 * Records a pending upsert/delete mutation in the account's offline sync queue
 * so it can be flushed when a cloud adapter is connected.
 */
export function enqueueRecipeCloudMutation(
  email: string | null | undefined,
  mutation: QueuedRecipeMutation
): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const cleanEmail = normalizeAccountEmail(email);
  if (!cleanEmail) return;

  const queueKey = getAccountSyncQueueKey(cleanEmail);
  try {
    const raw = localStorage.getItem(queueKey);
    const existing: QueuedRecipeMutation[] = raw ? JSON.parse(raw) : [];
    const filtered = existing.filter(m => m.recipeId !== mutation.recipeId);
    filtered.push(mutation);
    localStorage.setItem(queueKey, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to enqueue recipe cloud mutation', e);
  }
}

export function clearRecipeCloudMutationQueue(email: string | null | undefined): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const cleanEmail = normalizeAccountEmail(email);
  if (!cleanEmail) return;
  try {
    localStorage.removeItem(getAccountSyncQueueKey(cleanEmail));
  } catch {}
}

/**
 * Deterministic merge between local recipes and cloud recipes (by id).
 * Local additions/edits take precedence when ids collide so unsynced local work is never lost.
 */
export function mergeCloudAndLocalRecipes(localRecipes: Recipe[], cloudRecipes: Recipe[]): Recipe[] {
  const map = new Map<string, Recipe>();
  // 1. Seed with cloud recipes first
  for (const r of cloudRecipes || []) {
    if (r && r.id) {
      map.set(r.id, { ...r, isCustom: true });
    }
  }
  // 2. Overlay local recipes (local edits/creations win)
  for (const r of localRecipes || []) {
    if (r && r.id) {
      map.set(r.id, { ...r, isCustom: true });
    }
  }
  return Array.from(map.values());
}

/**
 * Default REST Cloud Adapter.
 * Automatically activates when `VITE_RECIPE_CLOUD_API_URL` (env) or
 * `localStorage.getItem('mealwise_cloud_api_url')` is provided.
 */
class RestRecipeCloudAdapter implements RecipeCloudAdapter {
  readonly providerName = 'MealWise REST Cloud API';

  private getBaseUrl(): string {
    try {
      const envUrl = (import.meta as any)?.env?.VITE_RECIPE_CLOUD_API_URL;
      if (envUrl && typeof envUrl === 'string') return envUrl.replace(/\/+$/, '');
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedUrl = localStorage.getItem('mealwise_cloud_api_url');
        if (storedUrl) return storedUrl.replace(/\/+$/, '');
      }
    } catch {}
    return '';
  }

  isConfigured(): boolean {
    return Boolean(this.getBaseUrl());
  }

  async pullUserRecipes(userEmail: string, userId?: string): Promise<Recipe[] | null> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return null;
    try {
      const url = `${baseUrl}/recipes?email=${encodeURIComponent(normalizeAccountEmail(userEmail))}${
        userId ? `&userId=${encodeURIComponent(userId)}` : ''
      }`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return Array.isArray(data?.recipes) ? data.recipes : (Array.isArray(data) ? data : null);
    } catch (err) {
      console.warn('[RecipeCloudSync] Pull failed (offline or endpoint unreachable):', err);
      return null;
    }
  }

  async pushUserRecipes(userEmail: string, recipes: Recipe[], userId?: string): Promise<boolean> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return false;
    try {
      const res = await fetch(`${baseUrl}/recipes`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizeAccountEmail(userEmail),
          userId,
          updatedAt: new Date().toISOString(),
          recipes
        })
      });
      return res.ok;
    } catch (err) {
      console.warn('[RecipeCloudSync] Push failed (queued locally):', err);
      return false;
    }
  }

  async deleteUserRecipe(userEmail: string, recipeId: string, userId?: string): Promise<boolean> {
    const baseUrl = this.getBaseUrl();
    if (!baseUrl) return false;
    try {
      const res = await fetch(
        `${baseUrl}/recipes/${encodeURIComponent(recipeId)}?email=${encodeURIComponent(normalizeAccountEmail(userEmail))}${
          userId ? `&userId=${encodeURIComponent(userId)}` : ''
        }`,
        { method: 'DELETE' }
      );
      return res.ok;
    } catch {
      return false;
    }
  }
}

let activeCloudAdapter: RecipeCloudAdapter = new RestRecipeCloudAdapter();

/**
 * Plug in a custom cloud adapter (e.g., Supabase, Firebase Firestore, Appwrite, or custom backend).
 */
export function registerRecipeCloudAdapter(adapter: RecipeCloudAdapter): void {
  activeCloudAdapter = adapter;
}

export function getRecipeCloudAdapter(): RecipeCloudAdapter {
  return activeCloudAdapter;
}

/**
 * Synchronizes the user's local recipe partition with the active cloud adapter if configured.
 * Safe to call at any time: if no cloud endpoint is configured yet, it resolves immediately
 * with `{ recipes: localRecipes, state: 'local-only' }`.
 */
export async function syncAccountRecipesWithCloud(
  userEmail: string | null | undefined,
  localRecipes: Recipe[],
  userId?: string
): Promise<{ recipes: Recipe[]; state: CloudSyncState }> {
  const cleanEmail = normalizeAccountEmail(userEmail);
  if (!cleanEmail || !activeCloudAdapter.isConfigured()) {
    return { recipes: localRecipes, state: 'local-only' };
  }

  try {
    const remoteRecipes = await activeCloudAdapter.pullUserRecipes(cleanEmail, userId);
    const merged = remoteRecipes ? mergeCloudAndLocalRecipes(localRecipes, remoteRecipes) : localRecipes;
    saveAccountCustomRecipes(cleanEmail, merged);

    const pushed = await activeCloudAdapter.pushUserRecipes(cleanEmail, merged, userId);
    if (pushed) {
      clearRecipeCloudMutationQueue(cleanEmail);
      return { recipes: merged, state: 'synced' };
    }
    return { recipes: merged, state: 'offline-queued' };
  } catch {
    return { recipes: localRecipes, state: 'error' };
  }
}
