import React from "react";
import "./ProductInfo.css";

const ProductInfo = ({ originalPrice, discount, currentPrice, discountAmount, title }) => {
  return (
    <div className="product-info">
      <h3 className="product-name">
        <a href="/smartwatch/amazfit-bip-5-46mm">{title}</a>
      </h3>
      <div className="price-info">
        <p className="original-price">{originalPrice?.toLocaleString()} đ</p>
        <p className="discount">-{discount}%</p>
        <p className="current-price">{currentPrice?.toLocaleString()} đ</p>
        <p className="discount-amount">Tiết kiệm {discountAmount?.toLocaleString()} đ</p>
      </div>
    </div>
  );
};

export default ProductInfo;
