import { describe, it, expect, jest, beforeAll } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { createUser } from '../data/users.js';
import { register, login } from '../controllers/authController.js';

// Each test file has its own module registry — users array starts empty.

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  return res;
}

// Pre-seed one user for login tests
beforeAll(async () => {
  const passwordHash = await bcrypt.hash('secret123', 10);
  createUser({ email: 'existing@test.com', passwordHash });
});

// ─── register ────────────────────────────────────────────────────────────────

describe('register', () => {
  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'pass123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: expect.any(String) }));
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'a@b.com' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 for an invalid email format', async () => {
    const req = { body: { email: 'not-an-email', password: 'pass123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid email format' });
  });

  it('returns 400 when password is shorter than 6 characters', async () => {
    const req = { body: { email: 'short@test.com', password: 'abc' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Password must be at least 6 characters' });
  });

  it('returns 201 with token and user on valid input', async () => {
    const req = { body: { email: 'newuser@test.com', password: 'newpass' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email: 'newuser@test.com' }),
      })
    );
  });

  it('returns 409 when the email is already registered', async () => {
    const req = { body: { email: 'existing@test.com', password: 'secret123' } };
    const res = mockRes();
    await register(req, res);
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('login', () => {
  it('returns 400 when email is missing', async () => {
    const req = { body: { password: 'secret123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 400 when password is missing', async () => {
    const req = { body: { email: 'existing@test.com' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it('returns 401 for an email that is not registered', async () => {
    const req = { body: { email: 'ghost@test.com', password: 'secret123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('returns 401 for an incorrect password', async () => {
    const req = { body: { email: 'existing@test.com', password: 'wrongpass' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('returns 200 with token and user on valid credentials', async () => {
    const req = { body: { email: 'existing@test.com', password: 'secret123' } };
    const res = mockRes();
    await login(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        token: expect.any(String),
        user: expect.objectContaining({ email: 'existing@test.com' }),
      })
    );
  });
});
