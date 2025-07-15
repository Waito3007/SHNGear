import React, { useState, useEffect } from "react";
import axios from "axios";
import CategoryImage from "../shared/CategoryImage";

const FeaturedCategories = ({ data }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Fetch categories from the new API endpoint
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/categories`
        );
        // Filter for active categories if the API doesn't do it by default
        // (Our new API does, but keeping this for robustness)
        setCategories(response.data);
      } catch (err) {
        setError("Không thể tải danh mục sản phẩm.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

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
          {/* Loading Header */}
          <div className="text-center mb-16">
            <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 inline-block">
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
              </div>
              <div className="font-mono text-black font-bold tracking-wider">
                ĐANG TẢI DANH MỤC SẢN PHẨM...
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(8)].map((_, index) => (
              <div
                key={index}
                className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 animate-pulse"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 mb-4 bg-gray-200 border border-gray-300"></div>
                  <div className="h-6 w-24 bg-gray-200 border border-gray-300"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 md:py-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4 relative">
          <div className="text-center">
            <div className="bg-white border-2 border-red-500 shadow-[8px_8px_0px_0px_rgba(239,68,68,1)] p-8 inline-block">
              <div className="font-mono text-red-600 font-bold tracking-wider">
                {error}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
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
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div className="w-4 h-4 text-black">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
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
              DANH MỤC SẢN PHẨM
            </span>
            <span className="text-xs font-mono text-gray-600">v2.1.0</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-black font-mono tracking-wider mb-4">
            KHÁM PHÁ DANH MỤC
          </h2>

          <div className="flex space-x-1 mb-4">
            <div className="w-12 h-1 bg-black" />
            <div className="w-6 h-1 bg-gray-400" />
            <div className="w-3 h-1 bg-gray-300" />
          </div>

          {/* <div className="text-xs font-mono text-gray-500 flex justify-between">
            <span>HỆ THỐNG THỜI GIAN:</span>
            <span>
              {currentTime.toLocaleTimeString("vi-VN", { hour12: false })}
            </span>
          </div> */}
        </div>

        {/* Categories Container */}
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
              {/* <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                HIỂN THỊ {categories.length} DANH MỤC
              </div> */}
              {/* <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-600">
                    HOẠT ĐỘNG
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-xs font-mono text-gray-600">
                    CẬP NHẬT
                  </span>
                </div>
              </div> */}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <a
                  key={category.id}
                  href={`/ProductList?categoryId=${category.id}`}
                  className="group relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:transform hover:-translate-x-1 hover:-translate-y-1"
                >
                  {/* Category Index */}
                  <div className="absolute top-2 left-2 bg-black text-white w-6 h-6 flex items-center justify-center text-xs font-mono font-bold z-10">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  {/* Tech Grid Background */}
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                                       linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                      backgroundSize: "8px 8px",
                    }}
                  />

                  {/* Corner Tech Indicators */}
                  <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-black opacity-30" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-black opacity-30" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-black opacity-30" />

                  <div className="p-6 text-center relative">
                    {/* Tech Scan Line */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent opacity-20 group-hover:animate-pulse" />

                    <div className="flex flex-col items-center">
                      {/* Image Container */}
                      <div className="relative mb-4">
                        <div className="h-24 w-24 bg-gray-100 border-2 border-gray-300 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:border-black">
                          <CategoryImage
                            category={category}
                            className="h-20 w-20 object-contain transition-all duration-300 group-hover:scale-110"
                          />
                        </div>

                        {/* Status LED */}
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                      </div>

                      {/* Category Info */}
                      <div className="space-y-2">
                        <h3 className="font-mono text-sm font-bold text-black transition-colors duration-300 group-hover:text-gray-700 line-clamp-2">
                          {category.name}
                        </h3>

                        {/* Tech ID */}
                        {/* <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 border border-gray-300 inline-block">
                          ID: {category.id}
                        </div> */}
                      </div>

                      {/* Hover Effect Bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                    </div>
                  </div>

                  {/* Tech Access Button */}
                  <div className="absolute top-1/2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <div className="w-6 h-6 bg-black text-white flex items-center justify-center text-xs font-mono">
                      →
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Tech Footer Stats */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          {/*<div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>HỆ THỐNG HOẠT ĐỘNG</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>DANH MỤC SẴN SÀNG</span>
            </div>
          </div> */}

          {/* System Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                TỔNG DANH MỤC
              </div>
              <div className="text-green-600 text-lg font-mono font-bold">
                {categories.length}
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
                GRID
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
          </div> */}

          <div className="text-center text-xs font-mono text-gray-400">
            © SHN GEAR CATEGORIES v2.1.0
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCategories;
