import React from 'react';
import Laptops from '../../Asset/img/Laptop/laptops.jpg';
import Headphone from '../../Asset/img/HeadPhone/headphones.jpg'
import Smartphones from '../../Asset/img/Phone/smartphones.jpg'
import './FeaturedCategories.css';

const FeaturedCategories = () => {
  return (
    <section className="featured-categories">
      <h2>Danh mục nổi bật</h2>
      <div className="categories-grid">
        <div className="category-card">
          <img src={Laptops} alt="Laptops" />
          <h3>Laptop</h3>
          <a href="/category/laptops">Xem thêm</a>
        </div>
        <div className="category-card">
          <img src={Smartphones} alt="Smartphones" />
          <h3>Điện thoại</h3>
          <a href="/category/smartphones">Xem thêm</a>
        </div>
        <div className="category-card">
          <img src={Headphone} alt="Headphone" />
          <h3>Tai nghe</h3>
          <a href="/category/headphone">Xem thêm</a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;