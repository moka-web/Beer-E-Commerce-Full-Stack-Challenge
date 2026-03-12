import stockPriceData from '../../data/stock-price.js';

// Mutable copy of stock — original data/stock-price.js is never modified
const store = {};
for (const [sku, data] of Object.entries(stockPriceData)) {
  store[sku] = { ...data };
}

export function getEntry(sku) {
  return store[sku] || null;
}

export function decrementStock(sku, quantity) {
  store[sku].stock -= quantity;
}
