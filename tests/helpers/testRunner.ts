/**
 * MealWise Custom Test Runner & Assertion Library
 * Robust registry-based test harness with suite isolation and async execution.
 */

export interface TestCase {
  suite: string;
  name: string;
  fn: () => void | Promise<void>;
}

export interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  error?: Error;
  durationMs: number;
}

export interface SuiteSummary {
  suite: string;
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  results: TestResult[];
}

let assertionCounter = 0;

export function getAssertionCount(): number {
  return assertionCounter;
}

export function resetAssertionCount(): void {
  assertionCounter = 0;
}

class TestRegistry {
  private currentSuite = 'Default Suite';
  private testQueue: TestCase[] = [];
  private results: TestResult[] = [];
  private beforeEachHooks: Map<string, Array<() => void | Promise<void>>> = new Map();
  private afterEachHooks: Map<string, Array<() => void | Promise<void>>> = new Map();

  setSuite(name: string) {
    this.currentSuite = name;
  }

  addBeforeEach(fn: () => void | Promise<void>) {
    const list = this.beforeEachHooks.get(this.currentSuite) || [];
    list.push(fn);
    this.beforeEachHooks.set(this.currentSuite, list);
  }

  addAfterEach(fn: () => void | Promise<void>) {
    const list = this.afterEachHooks.get(this.currentSuite) || [];
    list.push(fn);
    this.afterEachHooks.set(this.currentSuite, list);
  }

  registerTest(name: string, fn: () => void | Promise<void>) {
    this.testQueue.push({
      suite: this.currentSuite,
      name,
      fn
    });
  }

  getAssertionCount(): number {
    return assertionCounter;
  }

  printSummary() {
    const totalTests = this.testQueue.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.length - passed;
    console.log(`\n\x1b[1m\x1b[36m======================================================================\x1b[0m`);
    console.log(`\x1b[1mASSERTION & TEST TELEMETRY METRICS:\x1b[0m`);
    console.log(`  • Registered Test Scenarios: \x1b[1m\x1b[36m${totalTests.toLocaleString()}\x1b[0m distinct test cases`);
    console.log(`  • Programmatic Assertions:   \x1b[1m\x1b[35m${assertionCounter.toLocaleString()}\x1b[0m assertions executed`);
    console.log(`  • Status:                    \x1b[32m${passed.toLocaleString()} passed\x1b[0m, ${failed > 0 ? `\x1b[31m${failed} failed\x1b[0m` : '0 failed'}`);
    console.log(`\x1b[1m\x1b[36m======================================================================\x1b[0m`);
  }

  async executeAll(options: { silent?: boolean } = {}): Promise<{
    results: TestResult[];
    total: number;
    passed: number;
    failed: number;
    durationMs: number;
    summaries: SuiteSummary[];
    totalAssertions: number;
  }> {
    const startTime = Date.now();
    this.results = [];

    const suiteMap = new Map<string, TestResult[]>();

    for (const t of this.testQueue) {
      const testStart = Date.now();
      let passed = true;
      let error: Error | undefined;

      const beforeHooks = this.beforeEachHooks.get(t.suite) || [];
      const afterHooks = this.afterEachHooks.get(t.suite) || [];

      try {
        for (const hook of beforeHooks) {
          await hook();
        }
        await t.fn();
      } catch (err: any) {
        passed = false;
        error = err instanceof Error ? err : new Error(String(err));
      } finally {
        for (const hook of afterHooks) {
          try {
            await hook();
          } catch (hookErr: any) {
            if (passed) {
              passed = false;
              error = hookErr instanceof Error ? hookErr : new Error(String(hookErr));
            }
          }
        }
      }

      const durationMs = Date.now() - testStart;
      const res: TestResult = {
        suite: t.suite,
        name: t.name,
        passed,
        error,
        durationMs
      };

      this.results.push(res);

      const list = suiteMap.get(t.suite) || [];
      list.push(res);
      suiteMap.set(t.suite, list);

      if (!options.silent) {
        const symbol = passed ? '  \x1b[32m✓\x1b[0m' : '  \x1b[31m✗\x1b[0m';
        const durationStr = durationMs > 10 ? ` \x1b[90m(${durationMs}ms)\x1b[0m` : '';
        console.log(`${symbol} ${t.name}${durationStr}`);
        if (!passed && error) {
          console.log(`    \x1b[31mError:\x1b[0m ${error.message}`);
          if (error.stack) {
            const stackLines = error.stack.split('\n').slice(1, 4).join('\n');
            console.log(`    \x1b[90m${stackLines}\x1b[0m`);
          }
        }
      }
    }

    const summaries: SuiteSummary[] = [];
    for (const [suiteName, list] of suiteMap.entries()) {
      const passedCount = list.filter(r => r.passed).length;
      summaries.push({
        suite: suiteName,
        total: list.length,
        passed: passedCount,
        failed: list.length - passedCount,
        durationMs: list.reduce((acc, r) => acc + r.durationMs, 0),
        results: list
      });
    }

    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;

    return {
      results: [...this.results],
      total,
      passed,
      failed,
      durationMs: Date.now() - startTime,
      summaries,
      totalAssertions: assertionCounter
    };
  }

  getQueueCount(): number {
    return this.testQueue.length;
  }

  clear() {
    this.testQueue = [];
    this.results = [];
    this.beforeEachHooks.clear();
    this.afterEachHooks.clear();
  }
}

export const registry = new TestRegistry();

export function printSummary() {
  registry.printSummary();
}

export function describe(name: string, fn: () => void) {
  registry.setSuite(name);
  fn();
}

export function it(name: string, fn: () => void | Promise<void>) {
  registry.registerTest(name, fn);
}

export const test = it;

export function beforeEach(fn: () => void | Promise<void>) {
  registry.addBeforeEach(fn);
}

export function afterEach(fn: () => void | Promise<void>) {
  registry.addAfterEach(fn);
}

function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  return true;
}

export function expect(actual: any) {
  const createMatcher = (negated: boolean) => ({
    toBe(expected: any) {
      assertionCounter++;
      const pass = actual === expected;
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? `Expected value NOT to be ${JSON.stringify(expected)}, but it was.`
            : `Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`
        );
      }
    },
    toEqual(expected: any) {
      assertionCounter++;
      const pass = deepEqual(actual, expected);
      if (negated ? pass : !pass) {
        throw new Error(
          negated
            ? `Expected values NOT to deeply equal each other.`
            : `Expected ${JSON.stringify(actual)} to deeply equal ${JSON.stringify(expected)}`
        );
      }
    },
    toBeGreaterThan(expected: number) {
      assertionCounter++;
      const pass = typeof actual === 'number' && actual > expected;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      assertionCounter++;
      const pass = typeof actual === 'number' && actual >= expected;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be >= ${expected}`);
      }
    },
    toBeLessThan(expected: number) {
      assertionCounter++;
      const pass = typeof actual === 'number' && actual < expected;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be less than ${expected}`);
      }
    },
    toBeLessThanOrEqual(expected: number) {
      assertionCounter++;
      const pass = typeof actual === 'number' && actual <= expected;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be <= ${expected}`);
      }
    },
    toBeCloseTo(expected: number, numDigits = 2) {
      assertionCounter++;
      const diff = Math.abs(actual - expected);
      const tolerance = Math.pow(10, -numDigits) / 2;
      const pass = diff < tolerance;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be close to ${expected} (diff: ${diff}, tolerance: ${tolerance})`);
      }
    },
    toContain(expected: any) {
      assertionCounter++;
      let pass = false;
      if (typeof actual === 'string') {
        pass = actual.includes(String(expected));
      } else if (Array.isArray(actual)) {
        pass = actual.some(item => deepEqual(item, expected));
      } else if (actual instanceof Set) {
        pass = actual.has(expected);
      }
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${JSON.stringify(actual)} ${negated ? 'NOT ' : ''}to contain ${JSON.stringify(expected)}`);
      }
    },
    toBeTruthy() {
      assertionCounter++;
      const pass = !!actual;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be truthy`);
      }
    },
    toBeFalsy() {
      assertionCounter++;
      const pass = !actual;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be falsy`);
      }
    },
    toBeDefined() {
      assertionCounter++;
      const pass = actual !== undefined;
      if (negated ? pass : !pass) {
        throw new Error(`Expected value ${negated ? 'NOT ' : ''}to be defined`);
      }
    },
    toBeUndefined() {
      assertionCounter++;
      const pass = actual === undefined;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be undefined`);
      }
    },
    toBeNull() {
      assertionCounter++;
      const pass = actual === null;
      if (negated ? pass : !pass) {
        throw new Error(`Expected ${actual} ${negated ? 'NOT ' : ''}to be null`);
      }
    },
    toMatch(regex: RegExp) {
      assertionCounter++;
      const pass = typeof actual === 'string' && regex.test(actual);
      if (negated ? pass : !pass) {
        throw new Error(`Expected "${actual}" ${negated ? 'NOT ' : ''}to match ${regex}`);
      }
    },
    toThrow(optPattern?: string | RegExp) {
      assertionCounter++;
      if (typeof actual !== 'function') {
        throw new Error('Expected function to be passed to expect(...) when using toThrow()');
      }
      let threw = false;
      let errorThrown: any = null;
      try {
        actual();
      } catch (e) {
        threw = true;
        errorThrown = e;
      }
      if (negated) {
        if (threw) {
          throw new Error(`Expected function NOT to throw, but it threw: ${errorThrown?.message || errorThrown}`);
        }
      } else {
        if (!threw) {
          throw new Error('Expected function to throw an error, but it did not.');
        }
        if (optPattern) {
          const msg = errorThrown?.message || String(errorThrown);
          if (typeof optPattern === 'string') {
            if (!msg.includes(optPattern)) {
              throw new Error(`Expected error message to include "${optPattern}", got "${msg}"`);
            }
          } else if (optPattern instanceof RegExp) {
            if (!optPattern.test(msg)) {
              throw new Error(`Expected error message to match ${optPattern}, got "${msg}"`);
            }
          }
        }
      }
    }
  });

  const matcher = createMatcher(false) as any;
  matcher.not = createMatcher(true);
  return matcher;
}

