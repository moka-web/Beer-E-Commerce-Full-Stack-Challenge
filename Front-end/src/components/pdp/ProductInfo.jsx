import { getImageUrl } from '../../services/api';

function ProductInfo({ product }) {
  const { brand, image, style, substyle, abv, origin, information } = product;


  
  return (
    <section className="pdp-info">
      <img
        src={getImageUrl(image)}
        alt={brand}
        className="pdp-image"
      />
      <div className="pdp-details">
        <h1 className="pdp-brand">{brand}</h1>
        <ul className="pdp-specs">
          <li><span className="pdp-spec-label">Style</span><span>{style}</span></li>
          <li><span className="pdp-spec-label">Substyle</span><span>{substyle}</span></li>
          <li><span className="pdp-spec-label">ABV</span><span>{abv}</span></li>
          <li><span className="pdp-spec-label">Origin</span><span>{origin}</span></li>
        </ul>
        <p className="pdp-description">{information}</p>
      </div>
    </section>
  );
}

export default ProductInfo;
