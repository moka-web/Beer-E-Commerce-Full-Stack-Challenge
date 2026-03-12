function VariantSelector({ skus, selectedSku, onSelect }) {
  return (
    <div className="pdp-sizes">
      <p className="pdp-sizes-label">Size</p>
      <div className="pdp-pills">
        {skus.map((sku) => (
          <button
            key={sku.code}
            className={`pdp-pill${selectedSku === sku.code ? ' pdp-pill--selected' : ''}`}
            onClick={() => onSelect(sku.code)}
          >
            {sku.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default VariantSelector;
