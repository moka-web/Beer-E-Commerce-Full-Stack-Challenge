import { getEntry } from '../data/stockStore.js';

export const getStockPriceBySku = (req, res) => {
  const { sku } = req.params;
  const data = getEntry(sku);

  if (!data) {
    return res.status(404).json({ error: `SKU ${sku} not found` });
  }

  res.json(data);
};

