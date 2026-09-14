import bcrypt from 'bcryptjs';
import { describe, expect, it, vi } from 'vitest';
import { allowRoles } from '../src/middleware/authorize.js';

describe('authentication primitives', () => {
  it('hashes passwords and verifies without retaining plaintext', async () => {
    const password = 'a-long-test-password';
    const hash = await bcrypt.hash(password, 4);
    expect(hash).not.toContain(password);
    expect(await bcrypt.compare(password, hash)).toBe(true);
  });
});

describe('role authorization', () => {
  it('allows the configured role and rejects another role', () => {
    const middleware = allowRoles('SUBJECT_OFFICER');
    const nextAllowed = vi.fn();
    middleware({ user: { id: '1', email: 'o@example.test', role: 'SUBJECT_OFFICER' } } as never, {} as never, nextAllowed);
    expect(nextAllowed).toHaveBeenCalledWith();
    const nextDenied = vi.fn();
    middleware({ user: { id: '2', email: 'a@example.test', role: 'APPLICANT' } } as never, {} as never, nextDenied);
    expect(nextDenied.mock.calls[0][0]).toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });
});

