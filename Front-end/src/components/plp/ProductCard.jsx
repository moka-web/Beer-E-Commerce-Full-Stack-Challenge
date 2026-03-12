import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useStockPrice } from '../../hooks/useStockPrice';
import './ProductCard.css';

const RATINGS = {
  127: 4.7,
  374: 4.5,
  743: 4.9,
  841: 4.9,
};

function toBrandSlug(brand) {
  return brand.toLowerCase().replace(/\s+/g, '-');
}

function formatPrice(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { token } = useAuth();
  const firstSku = product.skus[0];
  const rating = RATINGS[product.id] ?? null;
  const { price } = useStockPrice(firstSku.code, token);

  const handleCardClick = () => {
    navigate(`/product/${product.id}-${toBrandSlug(product.brand)}`);
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    if (price === null) return;
    addItem({
      sku: firstSku.code,
      name: firstSku.name,
      brand: product.brand,
      price,
    });
  };

  return (
    <article className="plp-card" onClick={handleCardClick}>
      <p className="plp-card-name">{product.brand}</p>

      <div className="plp-card-img-wrap">
        <img src={getImageUrl(product.image)} alt={product.brand} className="plp-card-img" />
      </div>

      <div className="plp-card-footer">
        <div className="plp-card-meta">
          {rating !== null && (
            <span className="plp-card-rating">★ {rating}</span>
          )}
          <span className="plp-card-price">
            {price !== null ? formatPrice(price) : '—'}
          </span>
        </div>
        <button className="plp-card-add" onClick={handleAdd}>+</button>
      </div>
    </article>
  );
}

export default ProductCard;
