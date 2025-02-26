import React from "react";
import SamsungS24 from "../../assets/img/Phone/samsung_S24.jpg";
import SonyWH1000XM5 from "../../assets/img/HeadPhone/SonyWH-1000XM5.jpg";
import LaptopDellXPS13 from "../../assets/img/Laptop/Laptop_Dell_XPS_13.jpg";
import { useNavigate } from "react-router-dom";
import "./BestSellers.css";

const BestSellers = () => {
  const navigate = useNavigate();
  const products = [
    { img: LaptopDellXPS13, name: "Laptop Dell XPS 13", price: "25,000,000₫" },
    { img: SamsungS24, name: "Samsung S24", price: "30,000,000₫" },
    {
      img: SonyWH1000XM5,
      name: "Tai nghe Sony WH-1000XM5",
      price: "7,500,000₫",
    },
  ];

  return (
    <section className="best-sellers">
      <h2>Sản phẩm bán chạy</h2>
      <div className="products-grid">
        {products.map((product, index) => (
          <div className="product-card" onClick={() => navigate(`/product/`)}>
            <img src={product.img} alt={product.name} />
            <h3>{product.name}</h3>
            <p className="price">{product.price}</p>
            <button className="add-to-cart">🛒 Thêm vào giỏ hàng</button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BestSellers;
