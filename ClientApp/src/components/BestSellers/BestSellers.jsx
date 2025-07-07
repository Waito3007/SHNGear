import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BestSellers = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBestSellerProducts = async () => {
      if (!data || !data.items || data.items.length === 0) {
        setLoading(false);
        return;
      }

      const productIds = data.items.map(item => item.productId);
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/Products/by-ids?ids=${productIds.join(',')}`);
        const fetchedProducts = response.data.$values || response.data || [];

        // Map fetched products with override prices from config
        const combinedProducts = fetchedProducts.map(product => {
          const configItem = data.items.find(item => item.productId === product.id);
          const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
          const imageUrl = primaryImage ? (primaryImage.imageUrl.startsWith("http") ? primaryImage.imageUrl : `${API_BASE_URL}/${primaryImage.imageUrl}`) : "https://via.placeholder.com/300";

          // Determine prices
          const originalVariantPrice = product.variants?.[0]?.price || 0;
          const displayPrice = configItem?.overridePrice ?? originalVariantPrice;
          const oldPrice = (configItem?.overridePrice && configItem.overridePrice < originalVariantPrice) ? originalVariantPrice : null;
          const discountAmount = oldPrice ? oldPrice - displayPrice : 0;

          return {
            ...product,
            image: imageUrl,
            oldPrice: oldPrice,
            newPrice: displayPrice,
            discountAmount: discountAmount,
            // You might want to calculate discount percentage here if needed
          };
        });
        setProducts(combinedProducts);
      } catch (err) {
        setError("Không thể tải sản phẩm bán chạy: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellerProducts();
  }, [data]);

  if (!data || !data.enabled || products.length === 0) {
    return null; // Don't render if section is not enabled or no products
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12 space-x-2">
        <div className="animate-bounce w-4 h-4 bg-red-500 rounded-full"></div>
        <div className="animate-bounce w-4 h-4 bg-red-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
        <div className="animate-bounce w-4 h-4 bg-red-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-md my-6 rounded-lg shadow-md">
        <p className="font-bold">Lỗi!</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center relative">
          <span className="relative z-10 px-4 bg-white bg-opacity-90 rounded-full">
            {data.title || "Sản phẩm bán chạy"}
          </span>
          <span className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-400 to-transparent z-0"></span>
        </h2>
        
        <Swiper
          modules={[Navigation, Autoplay]}
          navigation
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          spaceBetween={20}
          slidesPerView={1}
          breakpoints={{
            640: { slidesPerView: 2 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
          }}
          className="pb-6"
        >
          {products.map((product) => (
            <SwiperSlide key={product.id} className="flex justify-center">
              <div
                className="bg-white bg-opacity-95 p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl hover:border-red-300 transition-all duration-300 relative overflow-hidden group"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                {/* Discount ribbon - only show if there's a discount amount */}
                {product.discountAmount > 0 && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 transform rotate-12 translate-x-2 -translate-y-1 z-10">
                    -{((product.discountAmount / product.oldPrice) * 100).toFixed(0)}%
                  </div>
                )}
                
                <div className="relative h-40 mb-3 overflow-hidden rounded-lg">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { 
                      e.target.onerror = null; 
                      e.target.src = "https://via.placeholder.com/150"; 
                    }}
                  />
                </div>

                <div className="text-gray-700 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    {product.oldPrice && (
                      <span className="text-gray-500 line-through">
                        {product.oldPrice.toLocaleString('vi-VN')}đ
                      </span>
                    )}
                    <span className="text-red-500 font-semibold ml-auto">
                      {product.newPrice.toLocaleString('vi-VN')}đ
                    </span>
                  </div>
                  
                  {product.discountAmount > 0 && (
                    <p className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full inline-block">
                      Tiết kiệm {product.discountAmount.toLocaleString('vi-VN')}đ
                    </p>
                  )}
                  
                  <h3 className="text-gray-800 font-medium text-base truncate group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  {/* Features are not directly available from product DTO, remove or adapt */}
                  {/* <ul className="text-xs text-gray-600 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul> */}
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default BestSellers;
