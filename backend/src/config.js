if (!process.env.JWT_SECRET) {
  console.warn('[config] WARNING: JWT_SECRET is not set. Using insecure default — do not use in production.');
}

export const JWT_SECRET = process.env.JWT_SECRET || 'beer-challenge-dev-secret';
export const JWT_EXPIRES_IN = '7d';
