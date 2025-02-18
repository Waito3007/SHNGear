import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  ChevronDown,
  Monitor,
  Smartphone,
  Headphones,
} from "lucide-react";
import "./Navbar.css";
import menu from "../../assets/icon/menu.svg"
import logo from "../../assets/img/Phone/logo.png"; // Import logo

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <img src={logo} alt="SHN Gear" className="navbar-logo" />

        {/* Nút Danh mục */}
        <div className="menu-container" ref={dropdownRef}>
          <button className="menu-button" onClick={toggleDropdown}>
            <img src={menu} alt="Menu" />
            Danh mục
          </button>

          {/* Dropdown menu */}
          {isDropdownOpen && (
            <div className="dropdown-menu">
              <div className="dropdown-item">
                <Monitor size={18} />
                Laptop & PC
              </div>
              <div className="dropdown-item">
                <Smartphone size={18} />
                Điện thoại
              </div>
              <div className="dropdown-item">
                <Headphones size={18} />
                Phụ kiện
              </div>
            </div>
          )}
        </div>
        
        {/* Ô tìm kiếm */}
<div className="search-bar">
  <input type="text" placeholder="Tìm kiếm sản phẩm..." className="search-input" />
  <button type="submit" title="Tìm kiếm" className="search-button">
  <svg class="feather feather-search" fill="none" height="24" stroke="black" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
  </button>
</div>

          <div className="avatarandcart">
        {/* Avatar */}
        <User size={35} strokeWidth={2} className="avatar-icon" />
        {/* Nút Giỏ hàng */}
        <button className="cart-button">
          <ShoppingCart size={22} strokeWidth={2} />
          Giỏ Hàng
        </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
