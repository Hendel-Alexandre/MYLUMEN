export class PerformanceMonitor {
  private startTime: number;
  private label: string;

  constructor(label: string) {
    this.label = label;
    this.startTime = performance.now();
    console.log(`[⏱️  PERF] ${this.label} - Started`);
  }

  checkpoint(checkpointLabel: string) {
    const elapsed = performance.now() - this.startTime;
    console.log(`[⏱️  PERF] ${this.label} - ${checkpointLabel}: ${elapsed.toFixed(2)}ms`);
  }

  end() {
    const totalTime = performance.now() - this.startTime;
    console.log(`[⏱️  PERF] ${this.label} - Completed in ${totalTime.toFixed(2)}ms`);
    return totalTime;
  }
}

export function measureAsync<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const monitor = new PerformanceMonitor(label);
  return fn().finally(() => monitor.end());
}
