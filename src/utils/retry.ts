import { RateLimitError } from '../errors.js';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  retries: number;
  /** Initial delay in milliseconds */
  delay: number;
  /** Multiplier for exponential backoff (default: 2) */
  backoffMultiplier?: number;
}

const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

function isRetryable(error: unknown): boolean {
  if (error instanceof RateLimitError) return true;
  if (error && typeof error === 'object') {
    const status = (error as { code?: number; status?: number }).code
      ?? (error as { code?: number; status?: number }).status;
    if (status && RETRYABLE_STATUS_CODES.has(status)) return true;

    const message = (error as Error).message ?? '';
    if (/ECONNRESET|ETIMEDOUT|ENOTFOUND|socket hang up/i.test(message)) return true;
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
): Promise<T> {
  const { retries, delay, backoffMultiplier = 2 } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === retries || !isRetryable(error)) {
        throw error;
      }

      const jitter = Math.random() * 0.3 + 0.85; // 0.85 - 1.15
      const waitTime = delay * Math.pow(backoffMultiplier, attempt) * jitter;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw lastError;
}
