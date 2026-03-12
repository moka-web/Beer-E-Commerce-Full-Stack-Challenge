import { useProducts } from '../context/ProductsContext';

/**
 * useProductById — resolves a product from the URL slug
 *
 * @param {string} slug  - format "{id}-{brand-slug}" e.g. "127-modelo-especial"
 * @returns {{ product: Object|null, loading: boolean }}
 */
export function useProductById(slug) {
  const { products, loading } = useProducts();
  const productId = parseInt(slug?.split('-')[0], 10);
  const product = products.find((p) => p.id === productId) || null;

  return { product, loading };
}
