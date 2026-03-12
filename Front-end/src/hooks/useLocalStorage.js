import { useState } from 'react';

/**
 * useLocalStorage — state synced with localStorage
 *
 * @param {string} key           - localStorage key
 * @param {*}      initialValue  - fallback value if key does not exist
 * @returns {[value, setValue]}
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored !== null ? JSON.parse(stored) : initialValue;
    } catch {
      return initialValue;
    }
  });

  function set(newValue) {
    const resolved = typeof newValue === 'function' ? newValue(value) : newValue;
    if (resolved === null || resolved === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(resolved));
    }
    setValue(resolved);
  }

  return [value, set];
}
