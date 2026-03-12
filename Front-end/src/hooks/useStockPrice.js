import { useState, useEffect } from 'react';
import { getStockPrice } from '../services/api';

/**
 * useStockPrice — fetches and polls stock/price for a SKU every 5s
 *
 * @param {string} sku    - SKU code
 * @param {string} token  - JWT token
 * @returns {{ price: number|null, stock: number|null, loading: boolean }}
 */
export function useStockPrice(sku, token) {
  const [price, setPrice] = useState(null);
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sku || !token) return;

    let active = true;

    function fetch() {
      getStockPrice(sku, token)
        .then((data) => {
          if (!active) return;
          setPrice(data.price);
          setStock(data.stock);
          setLoading(false);
        })
        .catch(() => {
          if (active) setLoading(false);
        });
    }

    setLoading(true);
    fetch();
    const interval = setInterval(fetch, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sku, token]);

  return { price, stock, loading };
}
