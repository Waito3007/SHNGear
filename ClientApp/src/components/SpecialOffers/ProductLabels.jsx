import React from "react";
import "./ProductLabels.css";

const ProductLabels = ({ labels = [] }) => {
  if (!labels.length) return null;

  return (
    <div className="product-labels">
      {labels.map(({ icon, alt }, index) => (
        <img
          key={index}
          src={icon}
          alt={alt || "label icon"}
          className="label-icon"
          loading="lazy"
        />
      ))}
    </div>
  );
};

export default ProductLabels;
