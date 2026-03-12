import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { cartButton } from '../../utils/productImages';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { logout, user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/login');
  }

  return (
    <header className="app-header">
      <div className="app-header-menu-wrap" ref={menuRef}>
        <button className="app-header-menu" onClick={() => setMenuOpen((o) => !o)}>☰</button>

        {menuOpen && (
          <div className="app-header-dropdown">
            <p className="app-header-dropdown-user">{user?.email}</p>
            <button className="app-header-dropdown-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="app-header-right">
        <button className="app-header-cart" onClick={() => navigate('/cart')}>
          <img src={cartButton} alt="cart" className="app-header-cart-icon" />
          {totalItems > 0 && (
            <span className="app-header-cart-badge">{totalItems}</span>
          )}
        </button>
        <div className="app-header-avatar" />
      </div>
    </header>
  );
}

export default Header;
