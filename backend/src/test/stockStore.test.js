import { describe, it, expect } from '@jest/globals';
import { getEntry, decrementStock } from '../data/stockStore.js';

// Stock starts from the initial data/stock-price.js values.
// Each test file gets its own module registry, so the store is fresh per file.

describe('stockStore', () => {
  it('returns null for an unknown SKU', () => {
    expect(getEntry('00000')).toBeNull();
  });

  it('returns stock and price for a known SKU', () => {
    const entry = getEntry('10167');

    expect(entry).not.toBeNull();
    expect(typeof entry.stock).toBe('number');
    expect(typeof entry.price).toBe('number');
    expect(entry.stock).toBeGreaterThan(0);
    expect(entry.price).toBeGreaterThan(0);
  });

  it('decrements stock by the given quantity', () => {
    const sku = '10166';
    const before = getEntry(sku).stock;

    decrementStock(sku, 5);

    expect(getEntry(sku).stock).toBe(before - 5);
  });

  it('decrements stock to zero when quantity equals stock', () => {
    // SKU 10170 starts with stock: 6
    const sku = '10170';
    const { stock } = getEntry(sku);

    decrementStock(sku, stock);

    expect(getEntry(sku).stock).toBe(0);
  });

  it('does not modify price when decrementing stock', () => {
    const sku = '10035';
    const originalPrice = getEntry(sku).price;

    decrementStock(sku, 1);

    expect(getEntry(sku).price).toBe(originalPrice);
  });
});
