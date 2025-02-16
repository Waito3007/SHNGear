import React, { useState, useEffect, useRef } from "react";
import {
  Menu,
  ShoppingCart,
  User,
  ChevronDown,
  Monitor,
  Smartphone,
  Headphones,
} from "lucide-react";
import "./Navbar.css";
import logo from "../../Assets/img/Phone/logo.png"; // Import logo

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
            <Menu size={22} strokeWidth={2} />
            Danh mục
            <ChevronDown size={20} />
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
        <input type="text" placeholder="Tìm kiếm sản phẩm..." className="search-input" />

        {/* Avatar */}
        <User size={35} strokeWidth={2} className="avatar-icon" />

        {/* Nút Giỏ hàng */}
        <button className="cart-button">
          <ShoppingCart size={22} strokeWidth={2} />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
