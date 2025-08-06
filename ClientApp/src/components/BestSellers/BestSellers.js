import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "@/components/shared/ProductCard";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";

const BestSellerSection = ({ data }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!data.productIds || data.productIds.length === 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(
          `${
            process.env.REACT_APP_API_BASE_URL
          }/api/products/by-ids?ids=${data.productIds.join(",")}`
        );
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch best seller products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [data.productIds]);

  if (!data.enabled) {
    return null;
  }

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        {/* Tech Grid Background Pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="container mx-auto px-4 relative">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-12 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="font-mono text-black font-bold tracking-wider">
              ĐANG TẢI SẢN PHẨM BÁN CHẠY...
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 md:py-24 bg-white relative overflow-hidden">
      {/* Tech Grid Background Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: "20px 20px",
        }}
      />

      {/* Tech Corner Indicators */}
      <div className="absolute top-8 left-8 w-8 h-8 border-l-2 border-t-2 border-black" />
      <div className="absolute top-8 right-8 w-8 h-8 border-r-2 border-t-2 border-black" />
      <div className="absolute bottom-8 left-8 w-8 h-8 border-l-2 border-b-2 border-black" />
      <div className="absolute bottom-8 right-8 w-8 h-8 border-r-2 border-b-2 border-black" />

      <div className="container mx-auto px-4 relative">
        {/* Tech Header */}
        <div className="relative mb-16 pb-8 border-b-2 border-gray-200">
          {/* Animated Scan Line */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent animate-pulse opacity-30" />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div
                className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
              <div
                className="w-3 h-3 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              />
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 text-green-500">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              </div>
              <div className="w-4 h-4 text-black">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="w-4 h-4 text-blue-500 animate-pulse">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-2">
            <span className="text-xs font-mono text-gray-600 bg-gray-100 px-2 py-1 border border-black">
              SẢN PHẨM BÁN CHẠY
            </span>
            <span className="text-xs font-mono text-gray-600">v2.1.0</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-black font-mono tracking-wider mb-4">
            {data.title || "SẢN PHẨM HOT"}
          </h2>

          <div className="flex space-x-1 mb-4">
            <div className="w-12 h-1 bg-black" />
            <div className="w-6 h-1 bg-gray-400" />
            <div className="w-3 h-1 bg-gray-300" />
          </div>

          <div className="text-xs font-mono text-gray-500 flex justify-between">
            <span>HỆ THỐNG THỜI GIAN:</span>
            <span>
              {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
            </span>
          </div>
        </div>

        {/* Products Container */}
        <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 relative overflow-hidden">
          {/* Tech Grid Background */}
          <div
            className="absolute inset-0 opacity-3"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                               linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)`,
              backgroundSize: "15px 15px",
            }}
          />

          {/* Tech Corner Indicators */}
          <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-black" />
          <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-black" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-black" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-black" />

          <div className="relative z-10">
            {/* Status Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                ĐANG HIỂN THỊ {products.length} SẢN PHẨM
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-600">
                    ONLINE
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-600">
                    CẬP NHẬT
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Swiper Styles */}
            <style jsx>{`
              .custom-swiper .swiper-button-next,
              .custom-swiper .swiper-button-prev {
                background: black;
                color: white;
                width: 40px;
                height: 40px;
                border: 2px solid black;
                font-family: monospace;
                font-weight: bold;
                box-shadow: 4px 4px 0px 0px rgba(0, 0, 0, 0.3);
                transition: all 0.3s ease;
              }
              .custom-swiper .swiper-button-next:hover,
              .custom-swiper .swiper-button-prev:hover {
                background: rgba(0, 0, 0, 0.8);
                box-shadow: 6px 6px 0px 0px rgba(0, 0, 0, 0.3);
                transform: translate(-2px, -2px);
              }
              .custom-swiper .swiper-button-next::after,
              .custom-swiper .swiper-button-prev::after {
                font-size: 16px;
                font-weight: bold;
              }
            `}</style>

            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={30}
              slidesPerView={1}
              navigation
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                },
                768: {
                  slidesPerView: 3,
                },
                1024: {
                  slidesPerView: 4,
                },
              }}
              className="custom-swiper !pb-10"
            >
              {products.map((product, index) => (
                <SwiperSlide key={product.id}>
                  <div className="relative group">
                    {/* Product Index */}
                    <div className="absolute top-2 left-2 bg-black text-white w-8 h-8 flex items-center justify-center text-xs font-mono font-bold z-10">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    {/* Best Seller Badge */}
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs font-mono font-bold z-10">
                      HOT
                    </div>

                    <ProductCard product={product} />

                    {/* Tech indicator */}
                    <div className="absolute bottom-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        {/* Tech Footer Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>HỆ THỐNG HOẠT ĐỘNG</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>SẢN PHẨM SẴN SÀNG</span>
            </div>
          </div>

          {/* System Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                TỔNG SẢN PHẨM
              </div>
              <div className="text-green-600 text-lg font-mono font-bold">
                {products.length}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                TRẠNG THÁI
              </div>
              <div className="text-green-600 text-xs font-mono font-bold">
                HOẠT ĐỘNG
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                HIỂN THỊ
              </div>
              <div className="text-blue-600 text-xs font-mono font-bold">
                SLIDER
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                PHIÊN BẢN
              </div>
              <div className="text-blue-600 text-xs font-mono font-bold">
                v2.1.0
              </div>
            </div>
          </div>

          <div className="text-center text-xs font-mono text-gray-400">
            © SHN GEAR BESTSELLERS v2.1.0
          </div>
        </div>
      </div>
    </section>
  );
};

export default BestSellerSection;
