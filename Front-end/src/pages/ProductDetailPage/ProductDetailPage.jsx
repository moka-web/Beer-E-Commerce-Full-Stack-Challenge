import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProductById } from '../../hooks/useProductById';
import { useStockPrice } from '../../hooks/useStockPrice';
import { getImageUrl } from '../../services/api';
import { cartButton } from '../../utils/productImages';
import VariantSelector from '../../components/pdp/VariantSelector';
import './ProductDetailPage.css';

function formatPrice(cents) {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

const SHORT_DESC = 120;

function ProductDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { token } = useAuth();

  const { product, loading } = useProductById(slug);
  const [selectedSku, setSelectedSku] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const activeSku = selectedSku ?? product?.skus?.[0]?.code ?? null;
  const { price, stock } = useStockPrice(activeSku, token);

  if (loading) return <div className="pdp-loading">Loading...</div>;

  if (!product) {
    window.alert('Product not found');
    navigate('/products');
    return null;
  }

  const selectedSkuObj = product.skus.find((s) => s.code === activeSku);
  const outOfStock = stock === 0;
  const isLongDesc = product.information.length > SHORT_DESC;
  const description = expanded || !isLongDesc
    ? product.information
    : product.information.slice(0, SHORT_DESC) + '...';

  const handleAddToCart = () => {
    addItem({
      sku: activeSku,
      name: selectedSkuObj.name,
      brand: product.brand,
      price,
    });
  };

  return (
    <div className="pdp-page">
      <div className="pdp-topbar">
        <button className="pdp-topbar-btn" onClick={() => navigate('/products')}>←</button>
        <span className="pdp-topbar-title">Detail</span>
        <button className="pdp-topbar-btn">···</button>
      </div>

      <div className="pdp-hero">
        <img src={getImageUrl(product.image)} alt={product.brand} className="pdp-hero-img" />
      </div>

      <div className="pdp-card">
        <div className="pdp-card-header">
          <h1 className="pdp-name">{product.brand}</h1>
          <span className="pdp-price">{price !== null ? formatPrice(price) : '—'}</span>
        </div>

        <p className="pdp-meta">
          Origin: {product.origin}
          {stock !== null && <> &nbsp;|&nbsp; Stock: {stock}</>}
        </p>

        <div className="pdp-description">
          <p className="pdp-description-label">Description</p>
          <p className="pdp-description-text">
            {description}
            {isLongDesc && (
              <button className="pdp-read-more" onClick={() => setExpanded(!expanded)}>
                {expanded ? ' Show less' : ' Read more'}
              </button>
            )}
          </p>
        </div>

        <VariantSelector
          skus={product.skus}
          selectedSku={activeSku}
          onSelect={(code) => setSelectedSku(code)}
        />
      </div>

      <div className="pdp-bottom-bar">
        <button className="pdp-cart-icon-btn" onClick={() => navigate('/cart')}>
          <img src={cartButton} alt="cart" className="pdp-cart-icon" />
        </button>

        <button
          className="pdp-add-to-cart"
          disabled={outOfStock || price === null}
          onClick={handleAddToCart}
        >
          {outOfStock ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </div>
  );
}

export default ProductDetailPage;
