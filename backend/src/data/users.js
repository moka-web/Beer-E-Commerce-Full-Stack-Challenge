import bcrypt from 'bcryptjs';
import { mockUsers } from './mockUsers.js';

const users = [];
let nextId = 1;

export function findByEmail(email) {
  return users.find((u) => u.email === email) || null;
}

export function createUser({ email, passwordHash }) {
  const user = { id: nextId++, email, passwordHash };
  users.push(user);
  return user;
}

export async function seedUsers() {
  for (const { email, password } of mockUsers) {
    const passwordHash = await bcrypt.hash(password, 10);
    createUser({ email, passwordHash });
  }
  console.log(`[seed] ${mockUsers.length} mock users loaded`);
}
