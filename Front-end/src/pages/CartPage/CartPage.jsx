import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useCheckout } from '../../hooks/useCheckout';
import './CartPage.css';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function CartPage() {
  const navigate = useNavigate();
  const { cart, removeItem, clearCart } = useCart();
  const { token } = useAuth();
  const { handleCheckout, loading } = useCheckout(token);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="cart-empty">
        <p className="cart-empty-text">Your cart is empty.</p>
        <button className="cart-btn-primary" onClick={() => navigate('/products')}>
          Browse products
        </button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">My Cart</h1>

      <ul className="cart-list">
        {cart.map((item) => (
          <li key={item.sku} className="cart-item">
            <div className="cart-item-info">
              <p className="cart-item-brand">{item.brand}</p>
              <p className="cart-item-name">{item.name}</p>
            </div>
            <div className="cart-item-meta">
              <span className="cart-item-qty">Qty: {item.quantity}</span>
              <span className="cart-item-price">{formatPrice(item.price)} / unit</span>
              <span className="cart-item-subtotal">{formatPrice(item.price * item.quantity)}</span>
            </div>
            <button className="cart-item-remove" onClick={() => removeItem(item.sku)}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      <div className="cart-footer">
        <div className="cart-total">
          <span className="cart-total-label">Total</span>
          <span className="cart-total-value">{formatPrice(total)}</span>
        </div>
        <button className="cart-btn-primary" disabled={loading} onClick={handleCheckout}>
          {loading ? 'Placing order...' : 'Checkout'}
        </button>
        <button className="cart-btn-secondary" onClick={() => navigate('/products')}>
          Continue shopping
        </button>
        <button className="cart-btn-tertiary" onClick={clearCart}>
          Clear cart
        </button>
      </div>
    </div>
  );
}

export default CartPage;
