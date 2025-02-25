import React from "react";
import ProductFeatures from "./ProductFeatures";
import ProductLabels from "./ProductLabels";
import ProductInfo from "./ProductInfo";
import "./ProductCard.css";

const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <a href="/smartwatch/amazfit-bip-5-46mm">
          <img
            src={product.image}
            alt={product.title}
            className="product-img"
            loading="lazy"
          />
        </a>
      </div>
      <ProductFeatures features={product.features} />
      <ProductLabels labels={product.labels} />
      <ProductInfo {...product} />
    </div>
  );
};

export default ProductCard;
