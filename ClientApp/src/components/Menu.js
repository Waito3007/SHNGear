import React from "react";
import "../components/Menu.css";

const Menu = () => {
  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <img src="Logo.jpg" alt="SHN Gear" className="navbar-logo" />
        <button className="menu-button">
          <img
            src="https://www.svgrepo.com/show/509161/menu.svg"
            alt="Menu"
            className="icon"
          />
          Danh mục
        </button>
        <input type="text" placeholder="Tìm kiếm..." className="search-input" />
        <button className="cart-button">
          <img
            src="https://www.svgrepo.com/show/439532/cart-fill.svg"
            alt="Giỏ hàng"
            className="icon"
          />
          Giỏ hàng
        </button>
        <img
          src="https://www.svgrepo.com/show/452030/avatar-default.svg"
          alt="Avatar"
          className="avatar"
        />
      </div>
    </nav>
  );
};

export default Menu;
