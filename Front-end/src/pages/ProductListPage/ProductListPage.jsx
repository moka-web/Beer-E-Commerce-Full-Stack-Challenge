import { useProducts } from '../../context/ProductsContext';
import ProductCard from '../../components/plp/ProductCard';
import './ProductListPage.css';

function ProductListPage() {
  const { products, loading, error } = useProducts();

  if (loading) return <div className="plp-loading">Loading...</div>;
  if (error) return <div className="plp-loading">Error: {error}</div>;

  return (
    <div className="plp-page">
      
  

      <div className="plp-greeting">
        <p className="plp-greeting-sub">Hi there,</p>
        <h1 className="plp-greeting-title">Welcome Back!</h1>
      </div>

      <h2 className="plp-section-title">Our Products</h2>

      <div className="plp-grid">
        
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}

      </div>
    </div>
  );
}

export default ProductListPage;
