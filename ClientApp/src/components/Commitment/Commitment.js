import React, { useState, useEffect } from "react";
import { useBrands } from "@/hooks/api/useBrands";

const BrandTrustSection = ({ data }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const { brands, loading, error } = useBrands(true);

  // Update time every second for tech feel
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
              THƯƠNG HIỆU ĐỐI TÁC
            </span>
            <span className="text-xs font-mono text-gray-600">v2.1.0</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-black font-mono tracking-wider mb-4">
            HỆ THỐNG ĐỐI TÁC
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

        {/* Brand Logos Section */}
        <div className="mb-16">
          <div className="bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-8 relative overflow-hidden">
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

            <div className="relative z-10">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-black text-white px-4 py-2 font-mono text-sm font-bold tracking-wider">
                  CÁC THƯƠNG HIỆU ĐỐI TÁC
                </div>
              </div>

              <div className="flex justify-center items-center flex-wrap gap-x-8 gap-y-6">
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono text-black">
                      ĐANG TẢI THƯƠNG HIỆU...
                    </span>
                  </div>
                ) : error ? (
                  <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-2 font-mono text-sm">
                    LỖI: {error}
                  </div>
                ) : (
                  brands.map((brand) => (
                    <div key={brand.id} className="group relative">
                      <div className="bg-white border-2 border-gray-300 hover:border-black p-4 transition-all duration-300 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-2px] hover:translate-y-[-2px]">
                        <img
                          src={brand.logo || "/placeholder-logo.png"}
                          alt={brand.name}
                          className="h-12 md:h-16 object-contain filter grayscale group-hover:filter-none transition-all duration-300"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                      {/* Tech indicator */}
                      <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Commitments Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(data?.commitments || []).map((commitment, index) => (
            <div key={commitment.id} className="group relative">
              <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 h-full relative overflow-hidden transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:transform hover:translate-x-[-2px] hover:translate-y-[-2px]">
                {/* Tech Grid Background */}
                <div
                  className="absolute inset-0 opacity-5"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                                     linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
                    backgroundSize: "10px 10px",
                  }}
                />

                {/* Tech Corner Indicators */}
                <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-gray-300 opacity-20" />
                <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-gray-300 opacity-20" />

                {/* System Number */}
                <div className="absolute top-4 right-4 bg-black text-white w-8 h-8 flex items-center justify-center text-xs font-mono font-bold">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="relative z-10 text-center">
                  {/* Status Indicator */}
                  <div className="flex justify-center mb-4">
                    <div className="bg-black text-white px-3 py-1 text-xs font-mono font-bold tracking-wider">
                      CAM KẾT DỊCH VỤ
                    </div>
                  </div>

                  {/* Icon Container */}
                  <div className="flex items-center justify-center h-20 w-20 mx-auto mb-6 bg-white border-2 border-black relative">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-black"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    {/* Tech indicator */}
                    <div className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  </div>

                  <h3 className="font-mono text-lg font-bold text-black mb-3 tracking-wider">
                    {commitment.title}
                  </h3>

                  <p className="font-mono text-sm text-gray-700 leading-relaxed tracking-wide">
                    {commitment.description}
                  </p>

                  {/* System Stats */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>HOẠT ĐỘNG</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                        <span>SẴN SÀNG</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Animated Scan Line on Hover */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-black to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>

        {/* Tech Footer */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          {/* <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>HỆ THỐNG HOẠT ĐỘNG</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span>ĐỐI TÁC SẴN SÀNG</span>
            </div>
          </div> */}

          {/* System Stats */}
          {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                THƯƠNG HIỆU
              </div>
              <div className="text-green-600 text-lg font-mono font-bold">
                {brands?.length || 0}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3 text-center">
              <div className="text-black font-bold text-xs font-mono">
                CAM KẾT
              </div>
              <div className="text-blue-600 text-lg font-mono font-bold">
                {data?.commitments?.length || 0}
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
                PHIÊN BẢN
              </div>
              <div className="text-blue-600 text-xs font-mono font-bold">
                v2.1.0
              </div>
            </div>
          </div> */}

          <div className="text-center text-xs font-mono text-gray-400">
            © SHN_GEAR_PARTNERS_v2.1.0
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandTrustSection;
