import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout as checkoutApi } from '../services/api';
import { useCart } from '../context/CartContext';

/**
 * useCheckout — handles the checkout flow
 *
 * @param {string} token - JWT token
 * @returns {{ handleCheckout: Function, loading: boolean }}
 */
export function useCheckout(token) {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const items = cart.map(({ sku, name, quantity }) => ({ sku, name, quantity }));
      await checkoutApi(items, token);
      clearCart();
      navigate('/products');
      window.alert('Order placed successfully!');
    } catch (err) {
      window.alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { handleCheckout, loading };
}
