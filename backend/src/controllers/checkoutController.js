import { getEntry, decrementStock } from '../data/stockStore.js';

export function checkout(req, res) {
  const { items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  // Validate stock for all items before touching anything
  for (const { sku, quantity, name } of items) {
    const entry = getEntry(sku);
    if (!entry) {
      return res.status(404).json({ error: `SKU ${sku} not found` });
    }
    if (entry.stock < quantity) {
      return res.status(409).json({
        error: `Not enough stock for "${name}". Available: ${entry.stock}, requested: ${quantity}`,
      });
    }
  }

  // All good — decrement stock
  for (const { sku, quantity } of items) {
    decrementStock(sku, quantity);
  }

  return res.status(200).json({ message: 'Order placed successfully' });
}
