import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, Eye } from "lucide-react";

const PinnedProducts = () => {
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPinnedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/Products/pinned`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch pinned products");
        }
        const data = await response.json();
        setPinnedProducts(data);
      } catch (err) {
        setError("Không thể tải sản phẩm nổi bật.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPinnedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const calculateDiscountPercentage = (originalPrice, discountPrice) => {
    if (!originalPrice || !discountPrice || originalPrice <= discountPrice) return 0;
    return Math.round(((originalPrice - discountPrice) / originalPrice) * 100);
  };

  const getProductPrice = (product) => {
    // Ưu tiên Flash Sale price nếu đang có
    if (product.isFlashSale && product.flashSalePrice) {
      return {
        displayPrice: product.flashSalePrice,
        originalPrice: product.variants?.[0]?.price || 0,
        isFlashSale: true
      };
    }
    
    // Nếu không có Flash Sale, lấy từ variant đầu tiên
    const variant = product.variants?.[0];
    if (variant) {
      return {
        displayPrice: variant.discountPrice || variant.price,
        originalPrice: variant.price,
        isFlashSale: false
      };
    }
    
    return {
      displayPrice: 0,
      originalPrice: 0,
      isFlashSale: false
    };
  };

  const getStockQuantity = (product) => {
    return product.variants?.reduce((total, variant) => total + (variant.stockQuantity || 0), 0) || 0;
  };

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải sản phẩm nổi bật...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (pinnedProducts.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Tech Style */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-4">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
              <Star className="w-4 h-4 text-white fill-current" />
            </div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full mb-4"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá những sản phẩm công nghệ hàng đầu được khách hàng yêu thích nhất
          </p>
        </div>

        {/* Products Grid - Tech Modern Design */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {pinnedProducts.slice(0, 10).map((product) => {
            const priceInfo = getProductPrice(product);
            const discountPercentage = calculateDiscountPercentage(
              priceInfo.originalPrice,
              priceInfo.displayPrice
            );
            const stockQuantity = getStockQuantity(product);
            const hasDiscount = discountPercentage > 0;

            return (
              <div
                key={product.id}
                className="group relative bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:bg-white"
              >
                {/* Tech Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/0 to-blue-500/0 group-hover:from-blue-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500 rounded-2xl"></div>
                
                {/* Flash Sale Badge */}
                {priceInfo.isFlashSale && (
                  <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold animate-pulse shadow-lg">
                    🔥 FLASH SALE
                  </div>
                )}
                
                {/* Discount Badge */}
                {!priceInfo.isFlashSale && hasDiscount && (
                  <div className="absolute top-3 left-3 z-20 bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    -{discountPercentage}%
                  </div>
                )}

                {/* Stock Badge */}
                <div className="absolute top-3 right-3 z-20">
                  {stockQuantity > 0 ? (
                    <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      {stockQuantity} sản phẩm
                    </div>
                  ) : (
                    <div className="bg-red-500/90 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-medium">
                      Hết hàng
                    </div>
                  )}
                </div>

                {/* Product Image */}
                <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 aspect-square">
                  <img
                    src={
                      (() => {
                        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
                        if (!primaryImage) return "/placeholder-image.jpg";
                        
                        const imageUrl = primaryImage.imageUrl;
                        if (imageUrl?.startsWith('http')) return imageUrl;
                        return `${process.env.REACT_APP_API_BASE_URL}${imageUrl?.startsWith('/') ? '' : '/'}${imageUrl}`;
                      })()
                    }
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    onError={(e) => {
                      if (!e.target.src.includes('/placeholder-image.jpg')) {
                        e.target.src = '/placeholder-image.jpg';
                      }
                    }}
                  />
                  
                  {/* Tech Border Effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-center"></div>
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="flex space-x-3 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <Link
                        to={`/product/${product.id}`}
                        className="bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                      >
                        <Eye size={18} className="text-gray-700" />
                      </Link>
                      <button className="bg-blue-600/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110">
                        <ShoppingCart size={18} className="text-white" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Product Info - Enhanced Design */}
                <div className="p-4 md:p-5 relative z-10">
                  <div className="mb-3">
                    <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 group-hover:text-blue-600 transition-colors duration-300 leading-tight">
                      <Link to={`/product/${product.id}`}>
                        {product.name}
                      </Link>
                    </h3>
                  </div>

                  {/* Brand */}
                  {product.brand && (
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                      <p className="text-xs text-gray-600 font-medium">
                        {product.brand.name}
                      </p>
                    </div>
                  )}

                  {/* Variants info - Tech Style */}
                  {product.variants?.[0] && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-50 text-blue-700 border border-blue-200">
                        {product.variants[0].color}
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 border border-purple-200">
                        {product.variants[0].storage}
                      </span>
                    </div>
                  )}

                  {/* Rating - Enhanced */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`flex items-center px-2 py-1 rounded-full border ${
                        (product.averageRating || 0) > 0 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={12}
                            className={`${
                              i < Math.floor(product.averageRating || 0)
                                ? "text-yellow-500 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className={`text-xs ml-1 font-medium ${
                          (product.averageRating || 0) > 0 
                            ? 'text-yellow-700' 
                            : 'text-gray-500'
                        }`}>
                          {(product.averageRating || 0).toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      ({(product.reviewCount || 0) > 0 ? `${product.reviewCount} đánh giá` : 'Chưa có đánh giá'})
                    </span>
                  </div>

                  {/* Price - Premium Design */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-lg md:text-xl font-bold ${
                          priceInfo.isFlashSale ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {formatPrice(priceInfo.displayPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(priceInfo.originalPrice)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <div className="text-right">
                          <div className="text-xs text-green-600 font-bold">
                            Tiết kiệm
                          </div>
                          <div className="text-sm font-bold text-green-600">
                            {formatPrice(priceInfo.originalPrice - priceInfo.displayPrice)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Quick Action Bar */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Link
                        to={`/product/${product.id}`}
                        className="flex-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 py-2 px-3 rounded-lg text-xs font-medium text-center hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-200"
                      >
                        Xem chi tiết
                      </Link>
                      <button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md">
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Button - Tech Style */}
        <div className="text-center mt-16">
          <div className="inline-flex flex-col items-center">
            <Link
              to="/productlist"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 mr-2">Khám Phá Tất Cả Sản Phẩm</span>
              <svg className="relative z-10 w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Hơn {pinnedProducts.length} sản phẩm công nghệ đang chờ bạn
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PinnedProducts;
