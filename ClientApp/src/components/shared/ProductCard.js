import React from "react";

const ProductCard = ({ product }) => {
  // Xử lý ảnh chính xác, hỗ trợ cả link tuyệt đối và tương đối
  let primaryImage = "/images/default-product.png";
  if (product.images && product.images.length > 0) {
    const imgObj =
      product.images.find((img) => img.isPrimary) || product.images[0];
    if (imgObj?.imageUrl) {
      primaryImage = imgObj.imageUrl.startsWith("http")
        ? imgObj.imageUrl
        : `${
            process.env.REACT_APP_API_BASE_URL
              ? process.env.REACT_APP_API_BASE_URL.replace(/\/$/, "")
              : ""
          }/${imgObj.imageUrl.replace(/^\//, "")}`;
    }
  }

  const isFlashSaleActive =
    product.isFlashSale &&
    product.flashSalePrice &&
    new Date(product.flashSaleStartDate) <= new Date() &&
    new Date(product.flashSaleEndDate) >= new Date();

  return (
    <div className="group relative bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden transition-all duration-300 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:transform hover:-translate-x-1 hover:-translate-y-1 h-full flex flex-col">
      {/* Tech Grid Background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)`,
          backgroundSize: "10px 10px",
        }}
      />

      {/* Corner Tech Indicators */}
      <div className="absolute top-1 left-1 w-3 h-3 border-l border-t border-black opacity-30 z-10" />
      <div className="absolute top-1 right-1 w-3 h-3 border-r border-t border-black opacity-30 z-10" />
      <div className="absolute bottom-1 left-1 w-3 h-3 border-l border-b border-black opacity-30 z-10" />
      <div className="absolute bottom-1 right-1 w-3 h-3 border-r border-b border-black opacity-30 z-10" />

      {/* Flash Sale Badge */}
      {isFlashSaleActive && (
        <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-mono font-bold z-20">
          FLASH SALE
        </div>
      )}

      <div className="relative overflow-hidden bg-gray-50">
        {/* Image Container với aspect ratio cố định */}
        <div className="aspect-square w-full relative overflow-hidden bg-white border-b-2 border-gray-200">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-contain object-center transition-all duration-300 group-hover:scale-110 p-4"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "/images/default-product.png";
            }}
          />

          {/* Tech Overlay Effects */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Tech Scan Line Effect */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-black to-transparent opacity-20 group-hover:animate-pulse" />

            {/* Corner Tech Lines */}
            <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-black opacity-20" />
            <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-black opacity-20" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-black opacity-20" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-black opacity-20" />

            {/* Gradient Overlay on Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Image Loading Placeholder */}
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center opacity-0 transition-opacity duration-300">
            <div className="text-gray-400 font-mono text-xs">ĐANG TẢI...</div>
          </div>
        </div>

        {/* Tech Status Bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center justify-between text-xs font-mono">
            <span>XEM CHI TIẾT</span>
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse" />
              <div
                className="w-1 h-1 bg-blue-400 rounded-full animate-pulse"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 text-left bg-white relative flex-grow flex flex-col">
        {/* Product Status Indicator */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-mono text-gray-500">SẴN HÀNG</span>
          </div>
          <div className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 border border-gray-300">
            #{product.id}
          </div>
        </div>

        <h3 className="font-mono text-sm font-bold text-black mb-3 leading-tight flex-grow min-h-[2.5rem] flex items-start">
          <a
            href={`/product/${product.id}`}
            className="hover:text-gray-700 transition-colors line-clamp-2"
          >
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </a>
        </h3>

        {/* Price Section */}
        <div className="mb-4 mt-auto">
          {isFlashSaleActive ? (
            <div className="space-y-2">
              <div className="flex items-baseline space-x-2">
                <p className="text-lg font-bold text-red-600 font-mono">
                  {product.flashSalePrice?.toLocaleString("vi-VN")}₫
                </p>
                <p className="text-sm text-gray-500 line-through font-mono">
                  {product.variants[0]?.price?.toLocaleString("vi-VN")}₫
                </p>
              </div>
              <div className="bg-red-50 border border-red-200 px-2 py-1 text-center">
                <span className="text-xs font-mono text-red-600 font-bold">
                  TIẾT KIỆM{" "}
                  {(
                    ((product.variants[0]?.price - product.flashSalePrice) /
                      product.variants[0]?.price) *
                    100
                  ).toFixed(0)}
                  %
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-2">
              <p className="text-lg font-bold text-black font-mono">
                {product.variants[0]?.price?.toLocaleString("vi-VN")}₫
              </p>
            </div>
          )}
        </div>

        {/* Tech Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 mt-auto">
          <div className="flex items-center space-x-1">
            <div className="w-1 h-1 bg-blue-500 rounded-full" />
            <span className="text-xs font-mono text-gray-500">TECH GEAR</span>
          </div>
          <div className="text-xs font-mono text-gray-400">v1.0</div>
        </div>
      </div>

      {/* Tech Add to Cart Button */}
      <div className="absolute top-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
        <button className="p-3 bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] hover:transform hover:-translate-x-1 hover:-translate-y-1 transition-all">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
