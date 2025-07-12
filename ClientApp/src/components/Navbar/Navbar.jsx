import React, { useState, useEffect, useRef } from "react";
import {
  ShoppingCart,
  User,
  Search,
  Scale,
  Star,
  MapPin,
  LogOut,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import { useUserProfile } from "@/hooks/api/useUserProfile";
import { useCategories } from "@/hooks/api/useCategories";
import { useBrands } from "@/hooks/api/useBrands";
import { useSearch } from "@/hooks/api/useSearch";
import { useAuthModal } from "@/contexts/AuthModalContext";
import menuIcon from "@/assets/icon/menu.svg";
// import logo from "@/assets/img/Phone/logo.png";
import CartDrawer from "@/components/shoppingcart/CartDrawer"; // Import Drawer

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownProfileOpen, setIsDropdownProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [anchorEl, setAnchorEl] = useState(null);
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Custom hooks
  const { user, initUserId, fetchUserProfile } = useUserProfile();
  const { categories } = useCategories();
  const { brands } = useBrands();
  const { openAuthModal } = useAuthModal();
  const {
    results: searchResults,
    loading: searchLoading,
    search,
  } = useSearch();

  // Khởi tạo user profile
  useEffect(() => {
    const id = initUserId();
    if (id) fetchUserProfile(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search và đóng dropdown danh mục khi tìm kiếm
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.trim().length > 0) {
        search(searchTerm);
        setIsDropdownOpen(false); // Đóng dropdown danh mục khi bắt đầu tìm kiếm
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, search]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        // setSearchResults(null); // Đã loại bỏ state này, không cần làm gì
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("AvatarUrl");
    setIsLoggedIn(false);
    setAnchorEl(null);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleItemClick = (type, id) => {
    navigate(
      type === "product"
        ? `/product/${id}`
        : type === "category"
        ? `/ProductList?categoryId=${id}`
        : `/ProductList?brandIds=${id}`
    );
    setSearchTerm("");
  };
  // Real-time system clock
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemStatus, setSystemStatus] = useState("OPERATIONAL");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-[80px] md:h-[70px]">
      {/* Tech Grid Background */}
      <div className="fixed top-0 left-0 w-full h-[80px] md:h-[70px] z-[999]">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "20px 20px",
          }}
        />
      </div>

      {/* Corner Tech Indicators */}
      <div className="fixed top-2 left-2 z-[1001] flex items-center gap-2">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        {/* <div className="text-[10px] font-mono text-black/60 tracking-wider">
          SYS_ONLINE
        </div> */}
      </div>
      <div className="fixed top-2 right-2 z-[1001] flex items-center gap-2">
        {/* <div className="text-[10px] font-mono text-black/60 tracking-wider">
          {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
        </div> */}
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      <nav className="fixed top-0 left-0 z-[1000] w-full h-[80px] md:h-[70px] bg-white backdrop-blur-[20px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-b-2 border-black transition-all duration-300">
        {/* Animated scan line */}
        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse"></div>

        <div className="flex items-center justify-between w-full mx-auto px-12 lg:px-8 md:px-6 gap-6 lg:gap-5 md:gap-4 h-full relative">
          {/* Logo Hidden - Enhanced Tech System Text */}
          <div
            className="flex items-center gap-3 group cursor-pointer"
            onClick={() => navigate("/")}
          >
            <div className="flex flex-col">
              <span className="text-2xl md:text-xl font-mono font-bold text-black tracking-widest group-hover:tracking-[0.3em] transition-all duration-300">
                SHN GEAR
              </span>
              <div className="text-[11px] font-mono text-black/60 tracking-[0.25em] flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                {systemStatus} | v2.0_TECH
              </div>
            </div>
          </div>

          {/* Advanced Tech Menu - Hidden on mobile */}
          <div className="relative font-mono hidden md:block" ref={dropdownRef}>
            {/* Enhanced Tech Menu Button */}
            <button
              className="flex items-center justify-center leading-[1.4] rounded-[14px] px-[18px] py-[10px] text-sm font-mono font-semibold cursor-pointer transition-all duration-300 gap-2 whitespace-nowrap w-auto border-[2px] border-black relative overflow-hidden min-h-[44px] bg-white backdrop-blur-[20px] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:scale-[0.98] tracking-wider"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              {/* Tech grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
                  backgroundSize: "8px 8px",
                }}
              />

              {/* Animated scan line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <img
                src={menuIcon}
                alt="Menu"
                className="opacity-90 brightness-0 hover:opacity-100 relative z-10"
              />
              <span className="relative z-10 tracking-[0.1em]">DANH MỤC</span>
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1 w-[320px] bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-lg border-2 border-black z-50 overflow-hidden">
                {/* Tech Header */}
                <div className="bg-black p-3 border-b-2 border-black relative overflow-hidden">
                  {/* Tech pattern background */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "12px 12px",
                    }}
                  />

                  <h3 className="text-sm font-mono font-bold text-white flex items-center relative z-10 tracking-[0.15em]">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    DANH MỤC SẢN PHẨM
                    <div className="ml-auto text-[10px] font-mono text-white/60">
                      v2.0
                    </div>
                  </h3>

                  {/* Animated scan line */}
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-pulse"></div>
                </div>

                {/* Content with enhanced tech styling */}
                <div className="max-h-[65vh] overflow-y-auto custom-scrollbar relative">
                  {/* Tech grid background */}
                  <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                      backgroundImage: `
                        linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                      `,
                      backgroundSize: "20px 20px",
                    }}
                  />

                  {/* Categories Section */}
                  <div className="p-2 relative z-10">
                    {categories
                      .filter((c) => !c.parentId)
                      .map((category) => (
                        <div key={category.id} className="mb-1 group">
                          {/* Parent Category */}
                          <div
                            className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-black/5 transition-all duration-300 cursor-pointer border border-transparent hover:border-black/20"
                            onClick={() =>
                              navigate(`/ProductList?categoryId=${category.id}`)
                            }
                          >
                            <div className="flex items-center">
                              <div className="w-8 h-8 flex items-center justify-center bg-black rounded-lg mr-3 text-white relative overflow-hidden">
                                {/* Tech icon background */}
                                <div
                                  className="absolute inset-0 opacity-20"
                                  style={{
                                    backgroundImage:
                                      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                                    backgroundSize: "4px 4px",
                                  }}
                                />
                                {category.icon || (
                                  <svg
                                    className="w-4 h-4 relative z-10"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>
                              <span className="font-mono font-medium text-black tracking-wider">
                                {category.name}
                              </span>
                            </div>
                            {categories.some(
                              (c) => c.parentId === category.id
                            ) && (
                              <div className="w-6 h-6 bg-black/10 rounded flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300">
                                <svg
                                  className="w-3 h-3"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                          </div>

                          {/* Subcategories */}
                          {categories.some(
                            (c) => c.parentId === category.id
                          ) && (
                            <div className="ml-12 mt-1 space-y-1">
                              {categories
                                .filter((c) => c.parentId === category.id)
                                .map((subCategory) => (
                                  <div
                                    key={subCategory.id}
                                    className="px-3 py-1.5 text-sm rounded-lg hover:bg-black/5 cursor-pointer flex items-center transition-all duration-300 border border-transparent hover:border-black/10"
                                    onClick={() =>
                                      navigate(
                                        `/ProductList?categoryId=${subCategory.id}`
                                      )
                                    }
                                  >
                                    <div className="w-2 h-2 bg-black rounded-full mr-2"></div>
                                    <span className="text-black font-mono text-xs tracking-wide">
                                      {subCategory.name}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>

                  {/* Enhanced Brands Section */}
                  <div className="border-t-2 border-black/20 mx-3"></div>
                  <div className="p-3 relative z-10">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-mono font-bold text-black uppercase tracking-[0.2em]">
                        THƯƠNG HIỆU
                      </h4>
                      <button
                        className="text-xs text-black hover:text-black/60 transition-colors font-mono tracking-wider px-2 py-1 border border-black/20 rounded hover:bg-black hover:text-white"
                        onClick={() => navigate("/Productlist")}
                      >
                        XEM TẤT CẢ →
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {brands.slice(0, 6).map((brand) => (
                        <div
                          key={brand.id}
                          className="text-center cursor-pointer group"
                          onClick={() =>
                            navigate(`/ProductList?brandId=${brand.id}`)
                          }
                        >
                          <div className="w-full aspect-square bg-white border-2 border-black/20 rounded-lg flex items-center justify-center p-2 group-hover:border-black group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 relative overflow-hidden">
                            {/* Tech pattern overlay */}
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-[0.05] transition-opacity duration-300"
                              style={{
                                backgroundImage:
                                  "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.5) 1px, transparent 0)",
                                backgroundSize: "6px 6px",
                              }}
                            />
                            {brand.logo ? (
                              <img
                                src={brand.logo}
                                alt={brand.name}
                                className="w-full h-full object-contain relative z-10"
                              />
                            ) : (
                              <span className="text-lg font-mono font-bold text-black relative z-10">
                                {brand.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <span className="block mt-2 text-xs font-mono font-medium text-black truncate px-1 tracking-wide">
                            {brand.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech Footer */}
                <div className="bg-black/5 px-3 py-2 border-t-2 border-black text-center relative overflow-hidden">
                  {/* Background pattern */}
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "linear-gradient(45deg, rgba(0,0,0,0.1) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.1) 25%, transparent 25%)",
                      backgroundSize: "8px 8px",
                    }}
                  />
                  <button
                    className="text-xs text-black hover:text-white font-mono font-medium transition-all duration-300 px-3 py-1 border border-black rounded hover:bg-black tracking-wider relative z-10"
                    onClick={() => navigate("/productlist")}
                  >
                    XEM THÊM →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Advanced Tech Search Bar */}
          <div
            className={`relative flex items-center justify-center rounded-[16px] backdrop-blur-[25px] p-0.5 max-w-[500px] w-[500px] lg:max-w-[400px] lg:w-[400px] md:max-w-[300px] md:w-full shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-[2px] transition-all duration-500 ease-out min-h-[48px] group ${
              searchResults && searchTerm.trim().length > 0
                ? "bg-white border-black scale-[1.05] translate-y-[-4px]"
                : "bg-white border-black hover:scale-[1.02] hover:translate-y-[-2px] focus-within:scale-[1.05] focus-within:translate-y-[-4px]"
            }`}
            ref={searchRef}
          >
            {/* Tech Grid Pattern Background */}
            <div
              className="absolute inset-0 rounded-[16px] opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "12px 12px",
              }}
            />

            {/* Animated scan line at top */}
            <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse"></div>

            <form
              onSubmit={handleSearchSubmit}
              className="relative flex items-center justify-between w-full z-10"
            >
              {/* Search icon with tech styling */}
              <div className="flex items-center pl-4">
                <div className="relative">
                  <Search className="h-4 w-4 text-black/60 group-focus-within:text-black transition-colors duration-300" />
                  {/* Pulse ring on focus */}
                  <div className="absolute inset-0 rounded-full border-2 border-black/20 opacity-0 group-focus-within:opacity-100 group-focus-within:animate-ping"></div>
                </div>
              </div>

              <input
                type="text"
                placeholder="TÌM KIẾM..."
                className="border-none outline-none px-2 py-2.5 text-sm font-mono font-medium w-full bg-transparent text-black placeholder:text-black/40 placeholder:font-mono transition-all duration-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && search(searchTerm)}
                style={{
                  letterSpacing: "0.05em",
                }}
              />

              {/* Enhanced Tech Submit Button */}
              <button
                type="submit"
                className="relative bg-black border-none cursor-pointer p-2 w-8 h-8 rounded-[12px] flex justify-center items-center transition-all duration-300 mr-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] hover:scale-110 hover:translate-x-[-2px] hover:translate-y-[-2px] active:scale-95 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] focus:outline-none group/btn overflow-hidden"
              >
                {/* Tech pattern overlay */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)",
                    backgroundSize: "4px 4px",
                  }}
                />

                {/* Scan line effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>

                <Search className="h-3.5 w-3.5 text-white relative z-10" />
              </button>
            </form>

            {/* Advanced Tech Search Results Dropdown */}
            {searchResults && searchTerm.trim().length > 0 && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-[20px] border-[2px] border-black z-50 w-[28rem] max-h-[70vh] overflow-hidden">
                {/* Tech header with animated scan line */}
                <div className="relative">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-black via-gray-600 to-black"></div>
                  <div className="absolute top-0 left-0 h-1 w-20 bg-gradient-to-r from-white/50 to-transparent animate-pulse"></div>
                </div>

                {/* Tech grid pattern background */}
                <div
                  className="absolute inset-0 opacity-[0.02]"
                  style={{
                    backgroundImage: `
                      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                    `,
                    backgroundSize: "20px 20px",
                  }}
                />

                <div
                  className="overflow-y-auto max-h-[70vh] custom-scrollbar relative z-10"
                  style={{
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(0,0,0,0.3) transparent",
                  }}
                >
                  {searchLoading ? (
                    <div className="p-6 flex items-center justify-center text-sm text-black">
                      {/* Enhanced tech loading */}
                      <div className="relative">
                        <div className="w-8 h-8 border-2 border-black/20 rounded-full animate-spin border-t-black"></div>
                        <div className="absolute inset-0 w-8 h-8 border-2 border-transparent rounded-full animate-ping border-t-black/40"></div>
                        <div className="absolute inset-2 w-4 h-4 border border-black/60 rounded-full animate-pulse"></div>
                      </div>
                      <span className="ml-3 font-mono font-medium tracking-wider">
                        ĐANG TẢI DỮ LIỆU...
                      </span>
                    </div>
                  ) : (
                    <div className="divide-y divide-black/10">
                      {/* Enhanced Products Section */}
                      {searchResults.products.length > 0 && (
                        <div className="py-3">
                          <div className="px-5 py-2 text-xs font-mono font-bold text-black uppercase tracking-[0.2em] flex items-center">
                            <div className="w-2 h-2 bg-black rounded-full mr-2 animate-pulse"></div>
                            <span>SẢN PHẨM</span>
                            <div className="ml-auto text-[10px] font-mono text-black/60">
                              {searchResults.products.length}
                            </div>
                          </div>
                          {searchResults.products.slice(0, 3).map((product) => (
                            <div
                              key={product.id}
                              className="px-5 py-3 hover:bg-black/5 cursor-pointer flex items-center transition-all duration-300 group relative overflow-hidden border-l-2 border-transparent hover:border-black"
                              onClick={() =>
                                handleItemClick("product", product.id)
                              }
                            >
                              {/* Tech scan line */}
                              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-black/80 to-black transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>

                              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black">
                                <img
                                  src={
                                    product.imageUrl?.startsWith("http")
                                      ? product.imageUrl
                                      : `${process.env.REACT_APP_API_BASE_URL}${
                                          product.imageUrl?.startsWith("/")
                                            ? ""
                                            : "/"
                                        }${product.imageUrl}`
                                  }
                                  alt={product.name}
                                  className="w-full h-full object-contain"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "/images/default-product.png";
                                  }}
                                />
                              </div>
                              <div className="ml-4 min-w-0 flex-1">
                                <p className="text-sm font-mono font-semibold text-black truncate group-hover:tracking-wider transition-all duration-300">
                                  {product.name}
                                </p>
                                <div className="flex items-center mt-1.5">
                                  <span className="text-sm font-mono font-bold text-black bg-black/10 px-2 py-0.5 rounded-lg border border-black/20">
                                    {product.price.toLocaleString("vi-VN")}₫
                                  </span>
                                  {product.discountedPrice && (
                                    <span className="ml-2 text-xs text-black/40 line-through font-mono">
                                      {product.discountedPrice.toLocaleString(
                                        "vi-VN"
                                      )}
                                      ₫
                                    </span>
                                  )}
                                </div>
                              </div>
                              {/* Tech arrow */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-6 h-6 bg-black rounded flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Enhanced Categories Section */}
                      {searchResults.categories.length > 0 && (
                        <div className="py-3">
                          <div className="px-5 py-2 text-xs font-mono font-bold text-black uppercase tracking-[0.2em] flex items-center">
                            <div className="w-2 h-2 bg-black/70 rounded-full mr-2 animate-pulse"></div>
                            <span>DANH MỤC</span>
                            <div className="ml-auto text-[10px] font-mono text-black/60">
                              {searchResults.categories.length}
                            </div>
                          </div>
                          {searchResults.categories
                            .slice(0, 3)
                            .map((category) => (
                              <div
                                key={category.id}
                                className="px-5 py-3 hover:bg-black/5 cursor-pointer flex items-center transition-all duration-300 group relative overflow-hidden border-l-2 border-transparent hover:border-black/70"
                                onClick={() =>
                                  handleItemClick("category", category.id)
                                }
                              >
                                <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-black/60 to-black/80 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>

                                <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black">
                                  <svg
                                    className="w-6 h-6 text-black"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeWidth="2"
                                      d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                                    />
                                  </svg>
                                </div>
                                <div className="ml-4 flex-1">
                                  <p className="text-sm font-mono font-semibold text-black group-hover:tracking-wider transition-all duration-300">
                                    {category.name}
                                  </p>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                  <div className="w-6 h-6 bg-black/70 rounded flex items-center justify-center">
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={3}
                                        d="M9 5l7 7-7 7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Enhanced Brands Section */}
                      {searchResults.brands.length > 0 && (
                        <div className="py-3">
                          <div className="px-5 py-2 text-xs font-mono font-bold text-black uppercase tracking-[0.2em] flex items-center">
                            <div className="w-2 h-2 bg-black/50 rounded-full mr-2 animate-pulse"></div>
                            <span>THƯƠNG HIỆU</span>
                            <div className="ml-auto text-[10px] font-mono text-black/60">
                              {searchResults.brands.length}
                            </div>
                          </div>
                          {searchResults.brands.slice(0, 3).map((brand) => (
                            <div
                              key={brand.id}
                              className="px-5 py-3 hover:bg-black/5 cursor-pointer flex items-center transition-all duration-300 group relative overflow-hidden border-l-2 border-transparent hover:border-black/50"
                              onClick={() => handleItemClick("brand", brand.id)}
                            >
                              <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-black/40 to-black/60 transform scale-y-0 group-hover:scale-y-100 transition-transform duration-300 origin-center"></div>

                              <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border border-black flex items-center justify-center">
                                {brand.logoUrl ? (
                                  <img
                                    src={brand.logoUrl}
                                    alt={brand.name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <span className="text-lg font-mono font-bold text-black">
                                    {brand.name.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <p className="text-sm font-mono font-semibold text-black group-hover:tracking-wider transition-all duration-300">
                                  {brand.name}
                                </p>
                              </div>
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="w-6 h-6 bg-black/50 rounded flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={3}
                                      d="M9 5l7 7-7 7"
                                    />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Enhanced Footer */}
                      {searchResults.products.length > 0 ||
                      searchResults.categories.length > 0 ||
                      searchResults.brands.length > 0 ? (
                        <div className="p-4 bg-black/5 border-t-2 border-black">
                          <button
                            className="w-full bg-black text-white font-mono font-semibold py-3 px-4 rounded-xl hover:bg-black/80 transition-all duration-300 flex items-center justify-center group shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)] active:translate-x-[1px] active:translate-y-[1px] tracking-wider"
                            onClick={() => navigate(`/productlist`)}
                          >
                            <span>HIỆN THÊM</span>
                            <svg
                              className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 7l5 5m0 0l-5 5m5-5H6"
                              />
                            </svg>
                          </button>
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-black/10 rounded-full flex items-center justify-center border-2 border-black/20">
                            <svg
                              className="w-8 h-8 text-black/60"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeWidth="1.5"
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-mono font-semibold text-black mb-1 tracking-wider">
                            TRỐNG
                          </h3>
                          <p className="text-xs text-black/60 font-mono tracking-wide">
                            HÃY THỬ BẰNG TỪ KHOÁ KHÁC
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* Enhanced Tech Avatar and Cart */}
          <div className="flex items-center gap-3 sm:gap-2">
            {/* Avatar Section */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() =>
                      setIsDropdownProfileOpen(!isDropdownProfileOpen)
                    }
                    className="cursor-pointer bg-white backdrop-blur-[20px] border-[2px] border-black rounded-full p-2 transition-all duration-300 text-black h-11 w-11 sm:h-10 sm:w-10 font-mono font-semibold text-sm flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                    aria-label="Tech User Menu"
                    aria-haspopup="true"
                    aria-expanded={!!anchorEl}
                  >
                    {/* Tech pattern background */}
                    <div
                      className="absolute inset-0 opacity-[0.1] rounded-full"
                      style={{
                        backgroundImage:
                          "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
                        backgroundSize: "6px 6px",
                      }}
                    />

                    {/* Pulse ring */}
                    <div className="absolute inset-0 rounded-full border border-black/20 animate-pulse"></div>

                    <User className="w-6 h-6 text-black opacity-90 relative z-10" />
                  </button>

                  {isDropdownProfileOpen && (
                    <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-2 border-black z-50 overflow-hidden">
                      {/* Tech header */}
                      <div className="px-4 py-3 border-b-2 border-black bg-black text-white relative overflow-hidden">
                        {/* Tech pattern */}
                        <div
                          className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage: `
                              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: "12px 12px",
                          }}
                        />
                        <p className="text-sm font-mono font-medium relative z-10 tracking-wider">
                          {user?.fullName || "GUEST"}
                        </p>
                        <p className="text-xs text-white/60 truncate font-mono relative z-10">
                          {user?.email || "user@system.local"}
                        </p>
                      </div>

                      <div className="py-1 flex flex-col relative">
                        {/* Tech grid background */}
                        <div
                          className="absolute inset-0 opacity-[0.02]"
                          style={{
                            backgroundImage: `
                              linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                            `,
                            backgroundSize: "20px 20px",
                          }}
                        />

                        {/* Admin access */}
                        {user?.role?.id === 1 && (
                          <NavLink
                            to="/admin/overview"
                            className={({ isActive }) =>
                              `px-4 py-3 text-sm text-black hover:bg-black/5 transition-all duration-300 flex items-center font-mono tracking-wide border-l-2 border-transparent hover:border-black relative z-10${
                                isActive ? " bg-black/5 border-black" : ""
                              }`
                            }
                          >
                            <Settings className="w-4 h-4 mr-3" />
                            GIAO DIỆN QUẢN TRỊ
                          </NavLink>
                        )}

                        <NavLink
                          to="/profile/info"
                          className={({ isActive }) =>
                            `px-4 py-3 text-sm text-black hover:bg-black/5 transition-all duration-300 flex items-center font-mono tracking-wide border-l-2 border-transparent hover:border-black relative z-10${
                              isActive ? " bg-black/5 border-black" : ""
                            }`
                          }
                        >
                          <User className="w-4 h-4 mr-3" />
                          THÔNG TIN NGƯỜI DÙNG
                        </NavLink>

                        <NavLink
                          to="/profile/orders"
                          className={({ isActive }) =>
                            `px-4 py-3 text-sm text-black hover:bg-black/5 transition-all duration-300 flex items-center font-mono tracking-wide border-l-2 border-transparent hover:border-black relative z-10${
                              isActive ? " bg-black/5 border-black" : ""
                            }`
                          }
                        >
                          <ShoppingBag className="w-4 h-4 mr-3" />
                          LỊCH SỬ MUA HÀNG
                        </NavLink>

                        <NavLink
                          to="/profile/loyalty"
                          className={({ isActive }) =>
                            `px-4 py-3 text-sm text-black hover:bg-black/5 transition-all duration-300 flex items-center font-mono tracking-wide border-l-2 border-transparent hover:border-black relative z-10${
                              isActive ? " bg-black/5 border-black" : ""
                            }`
                          }
                        >
                          <Star className="w-4 h-4 mr-3" />
                          KHÁCH HÀNG THÂN THIẾT
                        </NavLink>

                        <NavLink
                          to="/profile/address"
                          className={({ isActive }) =>
                            `px-4 py-3 text-sm text-black hover:bg-black/5 transition-all duration-300 flex items-center font-mono tracking-wide border-l-2 border-transparent hover:border-black relative z-10${
                              isActive ? " bg-black/5 border-black" : ""
                            }`
                          }
                        >
                          <MapPin className="w-4 h-4 mr-3" />
                          SỔ ĐỊA CHỈ
                        </NavLink>

                        <NavLink
                          to="/"
                          onClick={() => {
                            handleLogout();
                          }}
                          className="px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 flex items-center mt-1 border-t-2 border-black font-mono tracking-wide border-l-2 border-transparent hover:border-red-600 relative z-10"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          ĐĂNG XUẤT
                        </NavLink>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal()}
                  className="cursor-pointer bg-white backdrop-blur-[20px] border-[2px] border-black rounded-full p-2 transition-all duration-300 text-black h-11 w-11 sm:h-10 sm:w-10 font-mono font-semibold text-sm flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
                  aria-label="System Login"
                >
                  {/* Tech pattern background */}
                  <div
                    className="absolute inset-0 opacity-[0.1] rounded-full"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
                      backgroundSize: "6px 6px",
                    }}
                  />

                  {/* Pulse ring */}
                  <div className="absolute inset-0 rounded-full border border-black/20 animate-pulse"></div>

                  <User className="w-6 h-6 text-black opacity-90 relative z-10" />
                </button>
              )}
            </div>

            {/* Enhanced Tech Cart Button */}
            <button
              className="flex items-center justify-center leading-[1.4] rounded-[14px] p-2 text-sm font-mono font-semibold cursor-pointer transition-all duration-300 gap-0 whitespace-nowrap w-11 h-11 sm:w-11 sm:h-11 border-[2px] border-black relative overflow-hidden min-h-[44px] min-w-[44px] bg-white backdrop-blur-[20px] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px]"
              onClick={() => setIsCartOpen(true)}
            >
              {/* Tech pattern background */}
              <div
                className="absolute inset-0 opacity-[0.1] rounded-[14px]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.3) 1px, transparent 0)",
                  backgroundSize: "6px 6px",
                }}
              />

              {/* Animated scan line */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/10 to-transparent -skew-x-12 -translate-x-full hover:translate-x-full transition-transform duration-700"></div>

              {/* Pulse ring */}
              <div className="absolute inset-2 rounded-[10px] border border-black/20 animate-pulse"></div>

              <ShoppingCart
                size={18}
                className="text-black opacity-90 relative z-10"
              />
            </button>
          </div>
        </div>

        <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      </nav>
    </div>
  );
};

export default Navbar;
