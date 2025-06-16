/**
 * Circuit Breaker System and Automated Testing for CYPHER ORDi Future V3
 * Advanced fault tolerance and comprehensive test automation
 */

import { EventEmitter } from 'events';
import { EnhancedLogger } from '@/lib/enhanced-logger';

// Circuit Breaker Types
export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;
  successThreshold: number;
  timeout: number; // milliseconds
  monitoredFunction: () => Promise<any>;
  fallbackFunction?: () => Promise<any>;
  onStateChange?: (state: CircuitState, error?: Error) => void;
}

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  consecutiveFailures: number;
  lastFailureTime?: number;
  avgResponseTime: number;
  state: CircuitState;
  stateChanges: number;
}

export interface TestSuite {
  name: string;
  description: string;
  tests: TestCase[];
  beforeAll?: () => Promise<void>;
  afterAll?: () => Promise<void>;
  beforeEach?: () => Promise<void>;
  afterEach?: () => Promise<void>;
}

export interface TestCase {
  name: string;
  description: string;
  test: () => Promise<void>;
  timeout?: number;
  retries?: number;
  skip?: boolean;
  only?: boolean;
}

export interface TestResult {
  suiteName: string;
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: Error;
  retryCount: number;
}

export interface TestRunResult {
  totalSuites: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  duration: number;
  results: TestResult[];
  coverage?: CoverageReport;
}

export interface CoverageReport {
  lines: {
    total: number;
    covered: number;
    percentage: number;
  };
  functions: {
    total: number;
    covered: number;
    percentage: number;
  };
  branches: {
    total: number;
    covered: number;
    percentage: number;
  };
  files: Record<string, {
    lines: number;
    covered: number;
    percentage: number;
  }>;
}

export class CircuitBreaker extends EventEmitter {
  private config: CircuitBreakerConfig;
  private state: CircuitState = 'CLOSED';
  private metrics: CircuitMetrics;
  private lastFailureTime: number = 0;
  private nextAttemptTime: number = 0;
  private logger: EnhancedLogger;

  constructor(config: CircuitBreakerConfig) {
    super();
    this.config = config;
    this.logger = new EnhancedLogger();
    
    this.metrics = {
      totalCalls: 0,
      successfulCalls: 0,
      failedCalls: 0,
      consecutiveFailures: 0,
      avgResponseTime: 0,
      state: this.state,
      stateChanges: 0
    };

    this.logger.info('Circuit breaker initialized', {
      name: config.name,
      failureThreshold: config.failureThreshold
    });
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(): Promise<T> {
    const startTime = Date.now();
    this.metrics.totalCalls++;

    // Check circuit state
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error(`Circuit breaker ${this.config.name} is OPEN`);
      } else {
        this.changeState('HALF_OPEN');
      }
    }

    try {
      const result = await this.config.monitoredFunction();
      this.onSuccess(startTime);
      return result;
    } catch (error) {
      this.onFailure(error as Error, startTime);
      
      // Try fallback if available
      if (this.config.fallbackFunction) {
        try {
          const fallbackResult = await this.config.fallbackFunction();
          this.logger.warn('Using fallback function', {
            circuitBreaker: this.config.name,
            error: (error as Error).message
          });
          return fallbackResult;
        } catch (fallbackError) {
          this.logger.error('Fallback function also failed', {
            circuitBreaker: this.config.name,
            fallbackError: (fallbackError as Error).message
          });
        }
      }
      
      throw error;
    }
  }

  /**
   * Get current metrics
   */
  getMetrics(): CircuitMetrics {
    return { ...this.metrics };
  }

  /**
   * Reset circuit breaker
   */
  reset(): void {
    this.changeState('CLOSED');
    this.metrics.consecutiveFailures = 0;
    this.nextAttemptTime = 0;
    this.logger.info('Circuit breaker reset', { name: this.config.name });
  }

  /**
   * Force circuit state
   */
  forceState(state: CircuitState): void {
    this.changeState(state);
    this.logger.info('Circuit breaker state forced', {
      name: this.config.name,
      state
    });
  }

  private onSuccess(startTime: number): void {
    const duration = Date.now() - startTime;
    this.updateResponseTime(duration);
    
    this.metrics.successfulCalls++;
    this.metrics.consecutiveFailures = 0;

    if (this.state === 'HALF_OPEN') {
      if (this.metrics.successfulCalls >= this.config.successThreshold) {
        this.changeState('CLOSED');
      }
    }
  }

  private onFailure(error: Error, startTime: number): void {
    const duration = Date.now() - startTime;
    this.updateResponseTime(duration);
    
    this.metrics.failedCalls++;
    this.metrics.consecutiveFailures++;
    this.lastFailureTime = Date.now();
    this.metrics.lastFailureTime = this.lastFailureTime;

    if (this.state === 'CLOSED' || this.state === 'HALF_OPEN') {
      if (this.metrics.consecutiveFailures >= this.config.failureThreshold) {
        this.changeState('OPEN');
        this.nextAttemptTime = Date.now() + this.config.timeout;
      }
    }

    this.logger.error('Circuit breaker failure recorded', {
      name: this.config.name,
      consecutiveFailures: this.metrics.consecutiveFailures,
      error: error.message
    });
  }

  private changeState(newState: CircuitState): void {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      this.metrics.state = newState;
      this.metrics.stateChanges++;

      this.config.onStateChange?.(newState);
      this.emit('stateChange', { from: oldState, to: newState });

      this.logger.info('Circuit breaker state changed', {
        name: this.config.name,
        from: oldState,
        to: newState
      });
    }
  }

  private updateResponseTime(duration: number): void {
    this.metrics.avgResponseTime = 
      (this.metrics.avgResponseTime * (this.metrics.totalCalls - 1) + duration) / this.metrics.totalCalls;
  }
}

export class TestRunner extends EventEmitter {
  private logger: EnhancedLogger;
  private suites: Map<string, TestSuite> = new Map();
  private results: TestResult[] = [];
  private isRunning: boolean = false;

  constructor() {
    super();
    this.logger = new EnhancedLogger();
  }

  /**
   * Register a test suite
   */
  suite(suiteName: string, suiteConfig: Omit<TestSuite, 'name'>): void {
    this.suites.set(suiteName, {
      name: suiteName,
      ...suiteConfig
    });

    this.logger.info('Test suite registered', {
      name: suiteName,
      testCount: suiteConfig.tests.length
    });
  }

  /**
   * Run all test suites
   */
  async runAll(): Promise<TestRunResult> {
    if (this.isRunning) {
      throw new Error('Test runner is already running');
    }

    this.isRunning = true;
    this.results = [];
    const startTime = Date.now();

    try {
      let totalTests = 0;
      let passedTests = 0;
      let failedTests = 0;
      let skippedTests = 0;

      for (const suite of this.suites.values()) {
        const suiteResults = await this.runSuite(suite);
        this.results.push(...suiteResults);

        totalTests += suiteResults.length;
        passedTests += suiteResults.filter(r => r.status === 'passed').length;
        failedTests += suiteResults.filter(r => r.status === 'failed').length;
        skippedTests += suiteResults.filter(r => r.status === 'skipped').length;
      }

      const duration = Date.now() - startTime;

      const result: TestRunResult = {
        totalSuites: this.suites.size,
        totalTests,
        passedTests,
        failedTests,
        skippedTests,
        duration,
        results: this.results
      };

      this.logger.info('Test run completed', {
        totalSuites: result.totalSuites,
        totalTests: result.totalTests,
        passed: result.passedTests,
        failed: result.failedTests,
        skipped: result.skippedTests,
        duration: result.duration
      });

      this.emit('testRunComplete', result);
      return result;

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run specific test suite
   */
  async runSuite(suite: TestSuite): Promise<TestResult[]> {
    const suiteResults: TestResult[] = [];

    this.logger.info('Running test suite', { name: suite.name });
    this.emit('suiteStart', suite.name);

    try {
      // Run beforeAll hook
      if (suite.beforeAll) {
        await suite.beforeAll();
      }

      // Filter tests (handle 'only' and 'skip')
      const testsToRun = this.filterTests(suite.tests);

      for (const test of testsToRun) {
        const result = await this.runTest(suite, test);
        suiteResults.push(result);
      }

      // Run afterAll hook
      if (suite.afterAll) {
        await suite.afterAll();
      }

    } catch (error) {
      this.logger.error('Test suite failed', {
        suite: suite.name,
        error: (error as Error).message
      });
    }

    this.emit('suiteComplete', suite.name, suiteResults);
    return suiteResults;
  }

  /**
   * Run individual test
   */
  async runTest(suite: TestSuite, test: TestCase): Promise<TestResult> {
    const startTime = Date.now();
    let retryCount = 0;
    const maxRetries = test.retries || 0;

    this.emit('testStart', suite.name, test.name);

    if (test.skip) {
      const result: TestResult = {
        suiteName: suite.name,
        testName: test.name,
        status: 'skipped',
        duration: 0,
        retryCount: 0
      };
      
      this.emit('testComplete', result);
      return result;
    }

    while (retryCount <= maxRetries) {
      try {
        // Run beforeEach hook
        if (suite.beforeEach) {
          await suite.beforeEach();
        }

        // Run the test with timeout
        await this.runWithTimeout(test.test, test.timeout || 5000);

        // Run afterEach hook
        if (suite.afterEach) {
          await suite.afterEach();
        }

        const duration = Date.now() - startTime;
        const result: TestResult = {
          suiteName: suite.name,
          testName: test.name,
          status: 'passed',
          duration,
          retryCount
        };

        this.logger.info('Test passed', {
          suite: suite.name,
          test: test.name,
          duration,
          retryCount
        });

        this.emit('testComplete', result);
        return result;

      } catch (error) {
        retryCount++;
        
        if (retryCount > maxRetries) {
          const duration = Date.now() - startTime;
          const result: TestResult = {
            suiteName: suite.name,
            testName: test.name,
            status: 'failed',
            duration,
            error: error as Error,
            retryCount: retryCount - 1
          };

          this.logger.error('Test failed', {
            suite: suite.name,
            test: test.name,
            error: (error as Error).message,
            duration,
            retryCount: result.retryCount
          });

          this.emit('testComplete', result);
          return result;
        }

        this.logger.warn('Test failed, retrying', {
          suite: suite.name,
          test: test.name,
          attempt: retryCount,
          maxRetries
        });
      }
    }

    // Should never reach here
    throw new Error('Unexpected test execution flow');
  }

  /**
   * Get test results
   */
  getResults(): TestResult[] {
    return [...this.results];
  }

  /**
   * Clear all test results
   */
  clearResults(): void {
    this.results = [];
  }

  /**
   * Generate test report
   */
  generateReport(results: TestRunResult): string {
    const passRate = (results.passedTests / results.totalTests) * 100;
    
    let report = `
# Test Report

## Summary
- **Total Suites**: ${results.totalSuites}
- **Total Tests**: ${results.totalTests}
- **Passed**: ${results.passedTests}
- **Failed**: ${results.failedTests}
- **Skipped**: ${results.skippedTests}
- **Pass Rate**: ${passRate.toFixed(2)}%
- **Duration**: ${results.duration}ms

## Results by Suite
`;

    const suiteGroups = new Map<string, TestResult[]>();
    results.results.forEach(result => {
      if (!suiteGroups.has(result.suiteName)) {
        suiteGroups.set(result.suiteName, []);
      }
      suiteGroups.get(result.suiteName)!.push(result);
    });

    suiteGroups.forEach((tests, suiteName) => {
      const suitePassed = tests.filter(t => t.status === 'passed').length;
      const suiteFailed = tests.filter(t => t.status === 'failed').length;
      const suiteSkipped = tests.filter(t => t.status === 'skipped').length;

      report += `
### ${suiteName}
- Passed: ${suitePassed}
- Failed: ${suiteFailed}
- Skipped: ${suiteSkipped}

`;

      tests.forEach(test => {
        const status = test.status === 'passed' ? '✅' : 
                     test.status === 'failed' ? '❌' : '⏭️';
        report += `- ${status} ${test.testName} (${test.duration}ms)`;
        
        if (test.error) {
          report += `\n  Error: ${test.error.message}`;
        }
        
        if (test.retryCount > 0) {
          report += ` (retried ${test.retryCount} times)`;
        }
        
        report += '\n';
      });
    });

    if (results.coverage) {
      report += `
## Coverage Report
- **Lines**: ${results.coverage.lines.covered}/${results.coverage.lines.total} (${results.coverage.lines.percentage.toFixed(2)}%)
- **Functions**: ${results.coverage.functions.covered}/${results.coverage.functions.total} (${results.coverage.functions.percentage.toFixed(2)}%)
- **Branches**: ${results.coverage.branches.covered}/${results.coverage.branches.total} (${results.coverage.branches.percentage.toFixed(2)}%)
`;
    }

    return report;
  }

  private filterTests(tests: TestCase[]): TestCase[] {
    // If any test has 'only', run only those tests
    const onlyTests = tests.filter(t => t.only);
    if (onlyTests.length > 0) {
      return onlyTests;
    }

    // Otherwise, run all non-skipped tests
    return tests.filter(t => !t.skip);
  }

  private async runWithTimeout<T>(
    fn: () => Promise<T>,
    timeoutMs: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Test timed out after ${timeoutMs}ms`));
      }, timeoutMs);

      fn()
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }
}

export class CircuitBreakerManager {
  private logger: EnhancedLogger;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  constructor() {
    this.logger = new EnhancedLogger();
  }

  /**
   * Create and register a circuit breaker
   */
  create(config: CircuitBreakerConfig): CircuitBreaker {
    const circuitBreaker = new CircuitBreaker(config);
    this.circuitBreakers.set(config.name, circuitBreaker);

    // Set up monitoring
    circuitBreaker.on('stateChange', (change) => {
      this.logger.info('Circuit breaker state change', {
        name: config.name,
        from: change.from,
        to: change.to
      });
    });

    return circuitBreaker;
  }

  /**
   * Get circuit breaker by name
   */
  get(name: string): CircuitBreaker | undefined {
    return this.circuitBreakers.get(name);
  }

  /**
   * Get all circuit breaker metrics
   */
  getAllMetrics(): Record<string, CircuitMetrics> {
    const metrics: Record<string, CircuitMetrics> = {};
    
    this.circuitBreakers.forEach((breaker, name) => {
      metrics[name] = breaker.getMetrics();
    });

    return metrics;
  }

  /**
   * Reset all circuit breakers
   */
  resetAll(): void {
    this.circuitBreakers.forEach(breaker => breaker.reset());
    this.logger.info('All circuit breakers reset');
  }
}

// Test utilities and assertions
export class TestAssertions {
  static assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  static assertNotEqual<T>(actual: T, notExpected: T, message?: string): void {
    if (actual === notExpected) {
      throw new Error(message || `Expected ${actual} to not equal ${notExpected}`);
    }
  }

  static assertTrue(condition: boolean, message?: string): void {
    if (!condition) {
      throw new Error(message || 'Expected condition to be true');
    }
  }

  static assertFalse(condition: boolean, message?: string): void {
    if (condition) {
      throw new Error(message || 'Expected condition to be false');
    }
  }

  static assertThrows(fn: () => void, expectedError?: string): void {
    try {
      fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !(error as Error).message.includes(expectedError)) {
        throw new Error(`Expected error containing "${expectedError}", got "${(error as Error).message}"`);
      }
    }
  }

  static async assertThrowsAsync(fn: () => Promise<void>, expectedError?: string): Promise<void> {
    try {
      await fn();
      throw new Error('Expected function to throw an error');
    } catch (error) {
      if (expectedError && !(error as Error).message.includes(expectedError)) {
        throw new Error(`Expected error containing "${expectedError}", got "${(error as Error).message}"`);
      }
    }
  }

  static assertArrayEqual<T>(actual: T[], expected: T[], message?: string): void {
    if (actual.length !== expected.length) {
      throw new Error(message || `Array lengths differ: expected ${expected.length}, got ${actual.length}`);
    }

    for (let i = 0; i < actual.length; i++) {
      if (actual[i] !== expected[i]) {
        throw new Error(message || `Array elements differ at index ${i}: expected ${expected[i]}, got ${actual[i]}`);
      }
    }
  }

  static assertObjectEqual(actual: any, expected: any, message?: string): void {
    const actualStr = JSON.stringify(actual, null, 2);
    const expectedStr = JSON.stringify(expected, null, 2);
    
    if (actualStr !== expectedStr) {
      throw new Error(message || `Objects differ:\nExpected: ${expectedStr}\nActual: ${actualStr}`);
    }
  }

  static assertGreaterThan(actual: number, expected: number, message?: string): void {
    if (actual <= expected) {
      throw new Error(message || `Expected ${actual} to be greater than ${expected}`);
    }
  }

  static assertLessThan(actual: number, expected: number, message?: string): void {
    if (actual >= expected) {
      throw new Error(message || `Expected ${actual} to be less than ${expected}`);
    }
  }

  static assertContains<T>(array: T[], item: T, message?: string): void {
    if (!array.includes(item)) {
      throw new Error(message || `Expected array to contain ${item}`);
    }
  }

  static assertNotContains<T>(array: T[], item: T, message?: string): void {
    if (array.includes(item)) {
      throw new Error(message || `Expected array to not contain ${item}`);
    }
  }
}

// Singleton instances
export const circuitBreakerManager = new CircuitBreakerManager();
export const testRunner = new TestRunner();

// Export test utilities
export { TestAssertions as assert };

// Mock utilities for testing
export class MockUtils {
  static createMockFunction<T extends (...args: any[]) => any>(
    implementation?: T
  ): T & { calls: Parameters<T>[]; callCount: number; reset: () => void } {
    const calls: Parameters<T>[] = [];
    
    const mockFn = ((...args: Parameters<T>) => {
      calls.push(args);
      return implementation?.(...args);
    }) as T & { calls: Parameters<T>[]; callCount: number; reset: () => void };

    Object.defineProperty(mockFn, 'calls', {
      get: () => calls
    });

    Object.defineProperty(mockFn, 'callCount', {
      get: () => calls.length
    });

    mockFn.reset = () => {
      calls.length = 0;
    };

    return mockFn;
  }

  static createMockPromise<T>(
    resolveValue?: T,
    rejectValue?: Error,
    delay?: number
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const execute = () => {
        if (rejectValue) {
          reject(rejectValue);
        } else {
          resolve(resolveValue as T);
        }
      };

      if (delay) {
        setTimeout(execute, delay);
      } else {
        execute();
      }
    });
  }

  static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};