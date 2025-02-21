import React from "react";
import "../Assets/style/BestSellers.css";

const BestSellers = () => {
  return (
    <section className="best-sellers">
      <h2>Sản phẩm bán chạy</h2>
      <div className="products-grid">
        <div className="product-card">
          <img src="/images/product1.jpg" alt="Product 1" />
          <h3>Laptop Dell XPS 13</h3>
          <p className="price">25,000,000₫</p>
          <button className="add-to-cart">Thêm vào giỏ hàng</button>
        </div>
        <div className="product-card">
          <img src="/images/product2.jpg" alt="Product 2" />
          <h3>iPhone 14 Pro Max</h3>
          <p className="price">30,000,000₫</p>
          <button className="add-to-cart">Thêm vào giỏ hàng</button>
        </div>
        <div className="product-card">
          <img src="/images/product3.jpg" alt="Product 3" />
          <h3>Tai nghe Sony WH-1000XM5</h3>
          <p className="price">7,500,000₫</p>
          <button className="add-to-cart">Thêm vào giỏ hàng</button>
        </div>
      </div>
    </section>
  );
};

export default BestSellers;
