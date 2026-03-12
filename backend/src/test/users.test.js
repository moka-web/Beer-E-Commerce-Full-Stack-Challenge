import { describe, it, expect } from '@jest/globals';
import { findByEmail, createUser } from '../data/users.js';

describe('users store', () => {
  it('returns null for an unknown email', () => {
    expect(findByEmail('nobody@example.com')).toBeNull();
  });

  it('creates a user and returns it with an id', () => {
    const user = createUser({ email: 'alice@test.com', passwordHash: 'hash1' });

    expect(user.id).toBeDefined();
    expect(user.email).toBe('alice@test.com');
    expect(user.passwordHash).toBe('hash1');
  });

  it('finds a created user by email', () => {
    const user = createUser({ email: 'bob@test.com', passwordHash: 'hash2' });
    const found = findByEmail('bob@test.com');

    expect(found).toBe(user);
  });

  it('assigns incrementing ids', () => {
    const u1 = createUser({ email: 'c1@test.com', passwordHash: 'h' });
    const u2 = createUser({ email: 'c2@test.com', passwordHash: 'h' });

    expect(u2.id).toBe(u1.id + 1);
  });

  it('does not find an email that was never added', () => {
    createUser({ email: 'exists@test.com', passwordHash: 'h' });

    expect(findByEmail('notexists@test.com')).toBeNull();
  });
});
