import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./Navbar.css";
import menu from "../../assets/icon/menu.svg";
import logo from "../../assets/img/Phone/logo.png";
import AuthModal from "../Auth/AuthModal";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://localhost:7107/api/categories");
        if (!response.ok) throw new Error("Không thể tải danh mục");
        const data = await response.json();
        setCategories(data.$values || data || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };

    fetchCategories();
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/ProductList?categoryId=${categoryId}`);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <img
          src={logo}
          alt="SHN Gear"
          className="navbar-logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        />

        <div className="menu-container" ref={dropdownRef}>
          <button className="menu-button" onClick={toggleDropdown}>
            <img src={menu} alt="Menu" />
            Danh mục
          </button>

          {isDropdownOpen && (
            <div className="dropdown-menu">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="dropdown-item"
                    onClick={() => handleCategoryClick(category.id)}
                  >
                    <span>{category.name}</span>
                  </div>
                ))
              ) : (
                <div className="dropdown-item">Không có danh mục</div>
              )}
            </div>
          )}
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm..."
            className="search-input"
          />
          <button type="submit" className="search-button">
            <svg
              className="feather feather-search"
              fill="none"
              height="24"
              stroke="black"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="24"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" x2="16.65" y1="16.65" />
            </svg>
          </button>
        </div>

        <div className="avatarandcart">
          <User
            size={35}
            className="avatar-icon"
            onClick={() => setIsAuthModalOpen(true)}
          />
          <button
            className="cart-button"
            onClick={() => navigate("/shoppingcart")}
          >
            <ShoppingCart size={22} />
            Giỏ Hàng
          </button>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
