import React from "react";
import "./ProductFeatures.css";

const ProductFeatures = ({ features = [] }) => {
  if (!features.length) return null;

  return (
    <div className="product-features">
      {features.map(({ icon, text }, index) => (
        <div className="feature-item" key={index}>
          <img
            src={icon}
            alt={text || "feature icon"}
            className="feature-icon"
            loading="lazy"
          />
          <p>{text}</p>
        </div>
      ))}
    </div>
  );
};

export default ProductFeatures;
