import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, User, Search, Star, MapPin, LogOut, ShoppingBag, Settings } from "lucide-react";
import { useNavigate, NavLink } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from "jwt-decode";
import menuIcon from "../../assets/icon/menu.svg";
import logo from "../../assets/img/Phone/logo.png";
import AuthModal from "../Auth/AuthModal";
import CartDrawer from "../shoppingcart/CartDrawer";

const Navbar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const [isDropdownProfileOpen, setIsDropdownProfileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [anchorEl, setAnchorEl] = useState(null);
  const dropdownRef = useRef(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
        try {
            const decoded = jwtDecode(token);
            const id = parseInt(decoded.sub, 10);
            if (!Number.isInteger(id)) return;
            setUserId(id);
            fetchUserProfile(id);
        } catch (error) {
            console.error("Lỗi khi giải mã token:", error);
        }
    }
  }, []);

  const fetchUserProfile = async (id) => {
    try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
    } catch (error) {
        console.error("Lỗi khi lấy thông tin user:", error);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
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
    const fetchBrands = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`);
        if (!response.ok) throw new Error("Không thể tải danh mục");
        const data = await response.json();
        setBrands(data.$values || data || []);
      } catch (error) {
        console.error("Lỗi tải danh mục:", error);
      }
    };
    fetchBrands();
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
    setUser(null);
    navigate("/");
  };

  const fetchSearchResults = async () => {
    if (!searchTerm.trim()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/search?query=${encodeURIComponent(searchTerm)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
      setSearchResults(null);
    }
  };

  const handleItemClick = (type, id) => {
    navigate(
      type === 'product' ? `/product/${id}` :
      type === 'category' ? `/ProductList?categoryId=${id}` :
      `/ProductList?brandIds=${id}`
    );
    setSearchTerm('');
    setSearchResults(null);
  };

  return (    <div className="relative h-20 lg:h-24">
      <nav className="fixed top-0 left-0 w-full z-50 bg-gradient-to-br from-indigo-600 to-purple-600 backdrop-blur-md shadow-2xl border-b border-white/10 transition-all duration-300">
        <div className="flex items-center justify-between max-w-7xl mx-auto px-4 lg:px-8 gap-4 lg:gap-8 h-20 lg:h-24 relative z-10">
          {/* Logo */}          <img
            src={logo}
            alt="SHN Gear"
            className="h-12 lg:h-16 w-auto cursor-pointer hover:scale-105 transition-transform duration-200 filter drop-shadow-lg"
            style={{ 
              imageRendering: 'crisp-edges',
              WebkitImageRendering: 'crisp-edges',
              MozImageRendering: 'crisp-edges'
            }}
            onClick={() => navigate("/")}
          />

          {/* Menu Dropdown */}
          <div className="relative font-sans" ref={dropdownRef}>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/20 focus:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <img src={menuIcon} alt="Menu" className="w-4 h-4" />
              Danh mục
            </button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1 w-80 bg-white shadow-2xl rounded-lg border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-200">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    DANH MỤC SẢN PHẨM
                  </h3>
                </div>

                {/* Content with scroll */}
                <div className="max-h-[65vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {/* Categories Section */}
                  <div className="p-2">
                    {categories.filter(c => !c.parentId).map((category) => (
                      <div key={category.id} className="mb-1 group">
                        {/* Parent Category */}
                        <div className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-purple-50 transition-colors cursor-pointer"
                          onClick={() => navigate(`/ProductList?categoryId=${category.id}`)}>
                          <div className="flex items-center">
                            <div className="w-8 h-8 flex items-center justify-center bg-blue-100 rounded-lg mr-3 text-blue-600">
                              {category.icon || (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                            <span className="font-medium text-gray-800">{category.name}</span>
                          </div>
                          {categories.some(c => c.parentId === category.id) && (
                            <svg className="w-4 h-4 text-gray-400 group-hover:text-purple-500 transition-colors" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>

                        {/* Subcategories */}
                        {categories.some(c => c.parentId === category.id) && (
                          <div className="ml-12 mt-1 space-y-1">
                            {categories.filter(c => c.parentId === category.id).map((subCategory) => (
                              <div key={subCategory.id} className="px-3 py-1.5 text-sm rounded-lg hover:bg-blue-50 cursor-pointer flex items-center transition-colors"
                                onClick={() => navigate(`/ProductList?categoryId=${subCategory.id}`)}>
                                <div className="w-2 h-2 bg-blue-300 rounded-full mr-2"></div>
                                <span className="text-gray-700">{subCategory.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Brands Section */}
                  <div className="border-t border-gray-100 mx-3"></div>
                  <div className="p-3">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">THƯƠNG HIỆU</h4>
                      <button className="text-xs text-blue-600 hover:text-blue-800 transition-colors" 
                        onClick={() => navigate('/Productlist')}>
                        Xem tất cả →
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3">
                      {brands.slice(0, 6).map((brand) => (
                        <div key={brand.id} className="text-center cursor-pointer group" 
                          onClick={() => navigate(`/ProductList?brandId=${brand.id}`)}>
                          <div className="w-full aspect-square bg-white border border-gray-200 rounded-lg flex items-center justify-center p-2 group-hover:border-blue-300 transition-all shadow-sm">
                            {brand.logo ? (
                              <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                            ) : (
                              <span className="text-lg font-bold text-gray-400">{brand.name.charAt(0)}</span>
                            )}
                          </div>
                          <span className="block mt-2 text-xs font-medium text-gray-700 truncate px-1">{brand.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-3 py-2 border-t border-gray-100 text-center">
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    onClick={() => navigate('/productlist')}>
                    Xem tất cả sản phẩm →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md lg:max-w-lg relative" ref={searchRef}>
            <form 
              onSubmit={handleSearchSubmit} 
              className="relative flex items-center w-full"
            >
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full px-4 py-2.5 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 transition-all duration-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => searchTerm && fetchSearchResults()}
              />
              <button 
                type="submit" 
                className="absolute right-2 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-md transition-all duration-200"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>

            {/* Search Results Dropdown */}
            {searchResults && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 bg-white shadow-lg rounded-lg border border-gray-200 z-50 w-[28rem] max-h-[70vh] overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 flex items-center justify-center text-sm text-gray-500">
                    <svg className="animate-spin h-5 w-5 mr-3 text-blue-500" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3-2.647z"></path>
                    </svg>
                    Đang tìm kiếm...
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {/* Products */}
                    {searchResults.products?.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</div>
                        {searchResults.products.slice(0, 3).map((product) => (
                          <div
                            key={product.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150"
                            onClick={() => handleItemClick('product', product.id)}
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden">
                              <img
                                src={product.imageUrl?.startsWith("http") 
                                  ? product.imageUrl 
                                  : `${process.env.REACT_APP_API_BASE_URL}${product.imageUrl?.startsWith('/') ? '' : '/'}${product.imageUrl}`}
                                alt={product.name}
                                className="w-full h-full object-contain"
                                onError={(e) => { 
                                  e.target.onerror = null; 
                                  e.target.src = "/images/default-product.png";
                                }}
                              />
                            </div>
                            <div className="ml-3 min-w-0">
                              <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
                              <div className="flex items-center mt-1">
                                <span className="text-sm font-semibold text-blue-600">
                                  {product.price?.toLocaleString('vi-VN')}đ
                                </span>
                                {product.discountedPrice && (
                                  <span className="ml-2 text-xs text-gray-400 line-through">
                                    {product.discountedPrice.toLocaleString('vi-VN')}đ
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Categories */}
                    {searchResults.categories?.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Danh mục</div>
                        {searchResults.categories.slice(0, 3).map((category) => (
                          <div
                            key={category.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150"
                            onClick={() => handleItemClick('category', category.id)}
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-md flex items-center justify-center">
                              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path>
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{category.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Brands */}
                    {searchResults.brands?.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Thương hiệu</div>
                        {searchResults.brands.slice(0, 3).map((brand) => (
                          <div
                            key={brand.id}
                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center transition-colors duration-150"
                            onClick={() => handleItemClick('brand', brand.id)}
                          >
                            <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-md overflow-hidden flex items-center justify-center">
                              {brand.logoUrl ? (
                                <img 
                                  src={brand.logoUrl} 
                                  alt={brand.name} 
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <span className="text-lg font-bold text-gray-400">{brand.name.charAt(0)}</span>
                              )}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{brand.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Footer */}
                    {(searchResults.products?.length > 0 || searchResults.categories?.length > 0 || searchResults.brands?.length > 0) ? (
                      <div className="p-3 text-center bg-gray-50">
                        <button
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            navigate(`/productlist`);
                            setSearchResults(null);
                          }}
                        >
                          Xem tất cả {searchResults.totalResults} kết quả →
                        </button>
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-700">Không tìm thấy kết quả</h3>
                        <p className="mt-1 text-sm text-gray-500">Thử với từ khóa tìm kiếm khác</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile & Cart */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownProfileOpen(!isDropdownProfileOpen)}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                  aria-label="Menu người dùng"
                >
                  <User className="w-6 h-6 text-white" />
                </button>
                
                {isDropdownProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 origin-top-right bg-white rounded-lg shadow-xl z-50 overflow-hidden transition-all duration-200 ease-out">
                    <div className="py-1 flex flex-col">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">
                          Xin chào, {user?.fullName || 'Khách'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {user?.email || 'user@example.com'}
                        </p>
                      </div>
                      
                      {user?.role?.id === 1 && (
                        <NavLink 
                          to="/admin/overview"
                          className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                        >
                          <Settings className="w-4 h-4 mr-3" />
                          Trang quản trị
                        </NavLink>
                      )}
                      
                      <NavLink 
                        to="/profile/info"
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                      >
                        <User className="w-4 h-4 mr-3" />
                        Thông tin cá nhân
                      </NavLink>
                      
                      <NavLink 
                        to="/profile/orders"
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                      >
                        <ShoppingBag className="w-4 h-4 mr-3" />
                        Đơn hàng của tôi
                      </NavLink>
                      
                      <NavLink 
                        to="/profile/loyalty"
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                      >
                        <Star className="w-4 h-4 mr-3" />
                        Khách hàng thân thiết
                      </NavLink>
                      
                      <NavLink 
                        to="/profile/address"
                        className="px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        Sổ địa chỉ
                      </NavLink>
                      
                      <button
                        onClick={handleLogout}
                        className="px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center mt-1 border-t border-gray-100 w-full text-left"
                      >
                        <LogOut className="w-4 h-4 mr-3" />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 rounded-full hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="Đăng nhập"
              >
                <User className="w-6 h-6 text-white" />
              </button>
            )}

            <button 
              className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-white font-medium hover:bg-white/20 transition-all duration-200 border border-white/20 hover:border-white/30"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">Giỏ Hàng</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Modals */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
};

export default Navbar;
           