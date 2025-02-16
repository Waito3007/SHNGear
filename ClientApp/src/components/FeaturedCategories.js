import React from "react";
import "../Assets/style/FeaturedCategories.css";

const FeaturedCategories = () => {
  return (
    <section className="featured-categories">
      <h2>Danh mục nổi bật</h2>
      <div className="categories-grid">
        <div className="category-card">
          <img src="/images/laptops.jpg" alt="Laptops" />
          <h3>Laptop</h3>
          <a href="/category/laptops">Xem thêm</a>
        </div>
        <div className="category-card">
          <img src="/images/smartphones.jpg" alt="Smartphones" />
          <h3>Điện thoại</h3>
          <a href="/category/smartphones">Xem thêm</a>
        </div>
        <div className="category-card">
          <img src="/images/accessories.jpg" alt="Accessories" />
          <h3>Phụ kiện</h3>
          <a href="/category/accessories">Xem thêm</a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
