import { describe, it, expect, vi } from 'vitest';
import { withRetry } from '../../src/utils/retry';

describe('withRetry', () => {
  it('returns result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await withRetry(fn, { retries: 3, delay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on retryable errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 503, message: 'Service Unavailable' })
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, delay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('retries on network errors', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('ECONNRESET'))
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, delay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('does not retry on non-retryable errors', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('Invalid argument'));

    await expect(withRetry(fn, { retries: 3, delay: 10 })).rejects.toThrow('Invalid argument');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws after exhausting retries', async () => {
    const fn = vi.fn().mockRejectedValue({ code: 503, message: 'fail' });

    await expect(withRetry(fn, { retries: 2, delay: 10 })).rejects.toEqual({ code: 503, message: 'fail' });
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it('retries on 429 rate limit', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce({ code: 429, message: 'Rate limit' })
      .mockResolvedValue('ok');

    const result = await withRetry(fn, { retries: 3, delay: 10 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
