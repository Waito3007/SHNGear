import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, User, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Menu, MenuItem, Avatar, IconButton } from "@mui/material";
import "./Navbar.css";
import menuIcon from "../../assets/icon/menu.svg";
import logo from "../../assets/img/Phone/logo.png";
import AuthModal from "../Auth/AuthModal";

function Navbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("AvatarUrl"));
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("AvatarUrl");
    setIsLoggedIn(false);
    setAvatarUrl(null);
    setAnchorEl(null);
  };

  // Cập nhật: Xử lý tìm kiếm sản phẩm và danh mục
  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Tìm danh mục có tên khớp với từ khóa tìm kiếm
      const matchedCategory = categories.find((category) =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

      if (matchedCategory) {
        // Nếu tìm thấy danh mục, điều hướng đến danh mục đó
        navigate(`/ProductList?categoryId=${matchedCategory.id}`);
      } else {
        // Nếu không tìm thấy danh mục, thực hiện tìm kiếm sản phẩm
        navigate(`/ProductList?search=${encodeURIComponent(searchQuery)}`);
      }
    }
  };

  // Xử lý tìm kiếm khi nhấn Enter
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
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
          {/* Dropdown danh mục */}
          <button
            className="menu-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <img src={menuIcon} alt="Menu" />
            Danh mục
          </button>
          {isDropdownOpen && (
            <div className="dropdown-menu">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.id}
                    className="dropdown-item"
                    onClick={() => {
                      navigate(`/ProductList?categoryId=${category.id}`);
                      setIsDropdownOpen(false);
                    }}
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

        {/* Ô tìm kiếm */}
        <div className="search-bar">
          <input
            type="text"
            placeholder="Tìm kiếm sản phẩm hoặc danh mục..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress} // Nhấn Enter để tìm kiếm
          />
          <button
            type="submit"
            className="search-button"
            onClick={handleSearch}
          >
            <Search />
          </button>
        </div>

        <div className="avatarandcart">
          {isLoggedIn ? (
            <>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
                <Avatar src={avatarUrl || "default-avatar.png"} alt="Avatar" />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => navigate("/profile")}>
                  Thông tin cá nhân
                </MenuItem>
                <MenuItem onClick={() => navigate("/orders")}>
                  Đơn hàng của tôi
                </MenuItem>
                <MenuItem onClick={() => navigate("/loyalty")}>
                  Khách hàng thân thiết
                </MenuItem>
                <MenuItem onClick={() => navigate("/address")}>
                  Sổ địa chỉ nhận hàng
                </MenuItem>
                <MenuItem onClick={handleLogout}>Đăng xuất</MenuItem>
              </Menu>
            </>
          ) : (
            <User
              size={35}
              className="avatar-icon"
              onClick={() => setIsAuthModalOpen(true)}
            />
          )}
          <button className="cart-button"onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={22} />
            Giỏ Hàng
          </button>
        </div>
      </div>

      {/* Modal đăng nhập */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </nav>
  );
}

export default Navbar;
