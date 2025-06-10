// Global interval manager to prevent overlapping intervals and memory leaks
class IntervalManager {
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private static instance: IntervalManager | null = null;

  constructor() {
    console.log('🔄 Interval Manager initialized');
  }

  static getInstance(): IntervalManager {
    if (!IntervalManager.instance) {
      IntervalManager.instance = new IntervalManager();
    }
    return IntervalManager.instance;
  }

  register(key: string, callback: () => void, interval: number): void {
    // Clear existing interval if it exists
    this.clear(key);
    
    console.log(`⏰ Registering interval: ${key} (${interval}ms)`);
    const id = setInterval(callback, interval);
    this.intervals.set(key, id);
  }

  clear(key: string): void {
    const id = this.intervals.get(key);
    if (id) {
      console.log(`🗑️ Clearing interval: ${key}`);
      clearInterval(id);
      this.intervals.delete(key);
    }
  }

  clearAll(): void {
    console.log(`🧹 Clearing all intervals (${this.intervals.size} active)`);
    this.intervals.forEach((id, key) => {
      clearInterval(id);
    });
    this.intervals.clear();
  }

  getActiveCount(): number {
    return this.intervals.size;
  }

  getActiveKeys(): string[] {
    return Array.from(this.intervals.keys());
  }
}

export const intervalManager = IntervalManager.getInstance();

// Cleanup on process exit to prevent memory leaks
if (typeof process !== 'undefined') {
  process.on('exit', () => {
    intervalManager.clearAll();
  });

  process.on('SIGINT', () => {
    intervalManager.clearAll();
    process.exit();
  });

  process.on('SIGTERM', () => {
    intervalManager.clearAll();
    process.exit();
  });
}

export default intervalManager;