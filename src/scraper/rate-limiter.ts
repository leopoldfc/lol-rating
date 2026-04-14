export class RateLimiter {
  private lastRequestTime = 0;
  private readonly delayMs: number;

  constructor(requestsPerSecond = 1) {
    this.delayMs = 1000 / requestsPerSecond;
  }

  async wait(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.delayMs) {
      await new Promise(resolve => setTimeout(resolve, this.delayMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }
}
