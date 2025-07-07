import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Flaslsalebanner from "../../assets/img/anhcuanghia/hot-sale-cuoi-tuan.gif";
import { useFlashSaleProducts } from "@/hooks/api/useFlashSaleProducts";

const INITIAL_PRODUCTS_TO_SHOW = 10;

const FlashSale = () => {
  const { products, loading, error } = useFlashSaleProducts();
  const [visibleCount, setVisibleCount] = useState(INITIAL_PRODUCTS_TO_SHOW);
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    if (products.length > 0 && products[0].flashSaleEndDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const endDate = new Date(products[0].flashSaleEndDate).getTime();
        const diff = endDate - now;

        if (diff <= 0) {
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
          clearInterval(timer);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft({ hours, minutes, seconds });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [products]);

  const handleLoadMore = () => {
    setVisibleCount(prevCount => prevCount + INITIAL_PRODUCTS_TO_SHOW);
  };

  const getPrimaryImage = (images) => {
    if (!images || images.length === 0) return "https://via.placeholder.com/300";
    const primaryImage = images.find(img => img.isPrimary);
    const imageUrl = primaryImage?.imageUrl || images[0]?.imageUrl;
    return imageUrl?.startsWith("http") ? imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${imageUrl}`;
  };

  const getDisplayPrice = (variants, flashSalePrice) => {
    const originalPrice = variants?.[0]?.price || 0;
    const displayPrice = flashSalePrice ?? originalPrice;
    const oldPrice = flashSalePrice ? originalPrice : null;
    const discountAmount = oldPrice ? oldPrice - displayPrice : 0;

    return { displayPrice, oldPrice, discountAmount };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
        <span className="ml-3 text-gray-600">Đang tải sản phẩm...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-3xl my-6">
        <p className="font-bold">Lỗi</p>
        <p>{error}</p>
      </div>
    );
  }

  if (products.length === 0) {
    return null; // Don't render the component if there are no flash sale products
  }

  return (
    <div className="w-full bg-gradient-to-b from-red-50 to-white py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <img
            src={Flaslsalebanner}
            alt="Flash Sale Banner"
            className="max-w-full h-auto mx-auto"
            style={{ maxHeight: '150px' }}
          />
          <div className="mt-6 flex justify-center">
            <div className="bg-white shadow-lg rounded-lg p-4 inline-flex items-center space-x-4 border-2 border-red-200">
              <span className="text-sm font-medium text-gray-600">Kết thúc sau:</span>
              <div className="flex items-center space-x-2">
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Giờ</span>
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Phút</span>
                </div>
                <span className="text-red-600 font-bold">:</span>
                <div className="bg-red-600 text-white rounded p-2 min-w-[50px] text-center">
                  <span className="block text-xl font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
                  <span className="text-xs">Giây</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-12">
          {products.slice(0, visibleCount).map((product) => {
            const { displayPrice, oldPrice, discountAmount } = getDisplayPrice(product.variants, product.flashSalePrice);
            return (
              <div key={product.id} className="h-full flex flex-col">
                <div
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group relative border-2 border-transparent hover:border-red-500 flex flex-col h-full"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="absolute top-0 left-0 bg-red-600 text-white text-xs font-bold px-3 py-1 z-10 clip-path-ribbon">
                    HOT SALE
                  </div>
                  <div className="relative aspect-square bg-gray-50 flex-shrink-0">
                    <img
                      src={getPrimaryImage(product.images)}
                      alt={product.name}
                      className="absolute top-0 left-0 w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300"; }}
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-grow" style={{ minHeight: '280px' }}>
                    <div className="flex justify-between items-start mb-2">
                      {oldPrice && (
                        <span className="text-gray-500 text-sm line-through">
                          {oldPrice.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                      <span className="text-red-600 font-bold text-lg ml-auto">
                        {displayPrice.toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2" style={{ height: '3.5rem' }}>
                      {product.name}
                    </h3>
                    <div className="mb-3 min-h-[28px]">
                      {discountAmount > 0 && (
                        <span className="inline-block bg-red-100 text-red-800 text-xs font-bold px-2 py-1 rounded">
                          Tiết kiệm {discountAmount.toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>
                    <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-md mt-auto">
                      MUA NGAY
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {products.length > visibleCount && (
          <div className="text-center mt-8">
            <button
              onClick={handleLoadMore}
              className="bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white font-bold py-3 px-8 rounded-full transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Xem thêm sản phẩm
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        .clip-path-ribbon {
          clip-path: polygon(0 0, 100% 0, 95% 50%, 100% 100%, 0 100%);
          width: 80px;
        }
      `}</style>
    </div>
  );
};

export default FlashSale;

