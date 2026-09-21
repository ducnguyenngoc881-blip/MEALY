/**
 * In-memory Mock Storage for headless testing of localStorage persistence.
 */

export class MockLocalStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value));
  }

  // Debug helper
  dump(): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of this.store.entries()) {
      out[k] = v;
    }
    return out;
  }
}

/**
 * Installs mock localStorage onto the global object if not present.
 */
export function setupMockStorage(): MockLocalStorage {
  const mock = new MockLocalStorage();
  (globalThis as any).localStorage = mock;
  return mock;
}
