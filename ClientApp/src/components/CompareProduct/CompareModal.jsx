import React, { useState, useEffect, useCallback, useMemo } from "react";
import { X, ShoppingCart, Eye, Star, Zap, CheckCircle2, AlertCircle } from "lucide-react";

const CompareModal = ({ isOpen, onClose }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Memoized API base URL
  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL, []);

  // Optimized fetchCompareProducts with useCallback
  const fetchCompareProducts = useCallback(async () => {
    const ids = JSON.parse(localStorage.getItem("compareList") || "[]");
    
    if (ids.length === 0) {
      setProducts([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${apiBaseUrl}/api/Products/compare`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ids),
      });

      if (!response.ok) {
        throw new Error(`Không thể lấy dữ liệu so sánh: ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu so sánh:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [apiBaseUrl]);

  // Optimized removeFromCompare
  const removeFromCompare = useCallback((productId) => {
    const currentList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const updatedList = currentList.filter((id) => id !== productId);
    localStorage.setItem("compareList", JSON.stringify(updatedList));
    
    // Trigger custom event
    window.dispatchEvent(new Event('compareListChanged'));
    
    // Update products immediately for better UX
    setProducts(prev => prev.filter(p => p.id !== productId));
  }, []);

  // Optimized clearAll
  const clearAll = useCallback(() => {
    localStorage.removeItem("compareList");
    window.dispatchEvent(new Event('compareListChanged'));
    setProducts([]);
    onClose();
  }, [onClose]);

  // Optimized close handler
  const handleBackgroundClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  // Effect to fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchCompareProducts();
    }
  }, [isOpen, fetchCompareProducts]);

  // Loading spinner component
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
      <p className="mt-4 text-gray-600 font-medium">Đang tải dữ liệu so sánh...</p>
    </div>
  );

  // Error component
  const ErrorDisplay = () => (
    <div className="text-center py-16">
      <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h3>
      <p className="text-gray-600 mb-6">{error}</p>
      <button
        onClick={fetchCompareProducts}
        className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <Zap className="w-4 h-4 mr-2" />
        Thử lại
      </button>
    </div>
  );

  // Empty state component
  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center">
        <ShoppingCart className="w-12 h-12 text-indigo-600" />
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3">
        Chưa có sản phẩm nào để so sánh
      </h3>
      <p className="text-gray-600 text-lg">
        Thêm ít nhất 2 sản phẩm vào danh sách để bắt đầu so sánh
      </p>
    </div>
  );

  if (!isOpen) return null;
  return (
    <div 
      className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${
        isOpen ? 'animate-fadeIn' : 'opacity-0 pointer-events-none'
      }`}
      onClick={handleBackgroundClick}
    >
      <div className={`bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden transform transition-all duration-300 ${
        isOpen ? 'animate-scaleIn' : 'scale-95 opacity-0'
      }`}>
        {/* Enhanced Modern Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white overflow-hidden">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 animate-float"></div>
          </div>
          
          <div className="relative p-6 flex justify-between items-center backdrop-blur-custom">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-glow animate-bounceIn">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gradient">So sánh sản phẩm</h2>
                <p className="text-white/80 text-sm mt-1 flex items-center animate-slideUp">
                  <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse shadow-glow"></span>
                  {products.length} sản phẩm đang được so sánh
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {products.length > 0 && (
                <button
                  onClick={clearAll}
                  className="group flex items-center gap-2 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Xóa tất cả
                </button>
              )}
              <button
                onClick={onClose}
                className="group p-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl transition-all duration-200 hover:scale-110 hover:rotate-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-120px)] bg-gradient-to-br from-gray-50 to-white">
          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorDisplay />
          ) : products.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="overflow-x-auto">
              <div className="flex gap-6 min-w-max pb-4">
                {products.map((product, index) => (
                  <div 
                    key={product.id}
                    className="min-w-[320px] bg-white border border-gray-200 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group hover:-translate-y-1"
                  >
                    {/* Product Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        #{index + 1}
                      </div>
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-4 right-4 z-20 bg-red-500/90 hover:bg-red-600 backdrop-blur-sm text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110 group/btn"
                      aria-label="Xóa khỏi so sánh"
                    >
                      <X className="w-4 h-4 group-hover/btn:rotate-90 transition-transform" />
                    </button>

                    {/* Product Image */}
                    <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                      <img
                        src={
                          product.images && product.images.length > 0
                            ? product.images[0].imageUrl?.startsWith("http")
                              ? product.images[0].imageUrl
                              : `${apiBaseUrl}/${product.images[0].imageUrl}`
                            : "https://via.placeholder.com/300"
                        }
                        alt={product.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>

                    {/* Product Info */}
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                      </h3>
                      
                      {/* Brand and Category */}
                      <div className="flex gap-2 mb-4">
                        <div className="flex-1 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
                          <p className="text-xs text-gray-600 mb-1">Thương hiệu</p>
                          <p className="font-semibold text-indigo-700">{product.brand}</p>
                        </div>
                        <div className="flex-1 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-100">
                          <p className="text-xs text-gray-600 mb-1">Danh mục</p>
                          <p className="font-semibold text-purple-700">{product.category}</p>
                        </div>
                      </div>

                      {/* Description */}
                      {product.description && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
                          <p className="text-sm text-gray-700 line-clamp-2">{product.description}</p>
                        </div>
                      )}

                      {/* Variants */}
                      <div className="border-t border-gray-200 pt-4">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                          Biến thể ({product.variants.length})
                        </h4>
                        <div className="space-y-3 max-h-40 overflow-y-auto">
                          {product.variants.slice(0, 3).map((variant, i) => (
                            <div key={i} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex justify-between items-start mb-3">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900 text-sm">
                                    {variant.color} - {variant.storage}
                                  </p>
                                </div>
                                <div className="flex items-center">
                                  {variant.stockQuantity > 0 ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mr-1" />
                                  ) : (
                                    <AlertCircle className="w-4 h-4 text-red-500 mr-1" />
                                  )}
                                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                    variant.stockQuantity > 10 
                                      ? 'bg-green-100 text-green-800' 
                                      : variant.stockQuantity > 0 
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {variant.stockQuantity > 0 ? `Còn ${variant.stockQuantity}` : 'Hết hàng'}
                                  </span>
                                </div>
                              </div>
                                <div className="flex items-center justify-between">
                                {variant.discountPrice ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-red-600">
                                      {variant.discountPrice.toLocaleString()}đ
                                    </span>
                                    <span className="text-sm text-gray-500 line-through">
                                      {variant.price.toLocaleString()}đ
                                    </span>
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full font-medium">
                                      -{Math.round((1 - variant.discountPrice / variant.price) * 100)}%
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-lg font-bold text-gray-900">
                                    {variant.price.toLocaleString()}đ
                                  </span>
                                )}
                                
                                {/* Add to Cart Button for Variant */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Add to cart logic here
                                    alert(`Đã thêm "${product.name} - ${variant.color} ${variant.storage}" vào giỏ hàng!`);
                                  }}
                                  className="ml-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                  disabled={variant.stockQuantity === 0}
                                  title={variant.stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ hàng"}
                                >
                                  <ShoppingCart className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          ))}
                          {product.variants.length > 3 && (
                            <div className="text-center py-2">
                              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                +{product.variants.length - 3} biến thể khác
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                        <button
                          onClick={() => window.location.href = `/product/${product.id}`}
                          className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center group"
                        >
                          <Eye className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                          Xem chi tiết
                        </button>
                      </div>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
