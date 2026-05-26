import { describe, it, expect, vi, beforeEach } from 'vitest';
import { verifyTurnstile } from './turnstile.js';

global.fetch = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  process.env.TURNSTILE_SECRET_KEY = 'test-secret';
});

describe('verifyTurnstile', () => {
  it('returns true when Cloudflare reports success', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: true }),
    });
    const result = await verifyTurnstile('valid-token', '1.2.3.4');
    expect(result).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      expect.objectContaining({ method: 'POST' })
    );
  });

  it('returns false when Cloudflare reports failure', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, 'error-codes': ['invalid-input-response'] }),
    });
    const result = await verifyTurnstile('bad-token', '1.2.3.4');
    expect(result).toBe(false);
  });

  it('returns false when fetch throws', async () => {
    global.fetch.mockRejectedValueOnce(new Error('network down'));
    const result = await verifyTurnstile('token', '1.2.3.4');
    expect(result).toBe(false);
  });

  it('returns false when secret is not configured', async () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    const result = await verifyTurnstile('token', '1.2.3.4');
    expect(result).toBe(false);
  });
});
