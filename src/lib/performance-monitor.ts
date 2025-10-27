export class PerformanceMonitor {
  private static timers: Map<string, number> = new Map();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`No timer found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);

    if (duration > 300) {
      console.warn(`⚠️  Slow operation: ${label} took ${duration.toFixed(2)}ms`);
    } else {
      console.log(`✅ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

export function logApiTiming(route: string, duration: number): void {
  const status = duration > 500 ? '🔴' : duration > 200 ? '🟡' : '🟢';
  console.log(`${status} API ${route}: ${duration.toFixed(2)}ms`);
}
