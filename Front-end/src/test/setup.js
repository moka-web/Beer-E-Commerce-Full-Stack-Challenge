import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Clean up the DOM after each test
afterEach(() => {
  cleanup();
});

// Mock global import.meta.env
vi.stubEnv('VITE_API_URL', 'http://localhost:3001');
