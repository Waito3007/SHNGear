import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import CompareModal from "../CompareProduct/CompareModal";

const ProductGrid = ({
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
}) => {  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [compareModalOpen, setCompareModalOpen] = useState(false);
  const [compareCount, setCompareCount] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      setLoading(true);
      try {
        const [productsRes, brandsRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
        ]);

        if (!productsRes.ok) throw new Error("Không thể tải sản phẩm");
        if (!brandsRes.ok) throw new Error("Không thể tải thương hiệu");

        const productsData = await productsRes.json();
        const brandsData = await brandsRes.json();

        const brandsMap = (brandsData.$values || brandsData || []).reduce(
          (acc, brand) => {
            acc[brand.id] = brand.name;
            return acc;
          },
          {}
        );

        let filteredProducts = productsData.$values || productsData || [];

        if (searchQuery) {
          filteredProducts = filteredProducts.filter((product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        if (selectedCategory) {
          filteredProducts = filteredProducts.filter(
            (product) => product.categoryId === selectedCategory
          );
        }

        if (selectedPriceRange && selectedPriceRange !== "all") {
          const [minPrice, maxPrice] = selectedPriceRange
            .split("-")
            .map(Number);
          filteredProducts = filteredProducts.filter((product) => {
            const price =
              product.variants?.[0]?.discountPrice ||
              product.variants?.[0]?.price ||
              0;
            return price >= minPrice && price <= maxPrice;
          });
        }

        if (selectedBrand && selectedBrand.length > 0) {
          const selectedBrandsArray = selectedBrand.map(Number); // Chuyển ID thương hiệu thành số
          filteredProducts = filteredProducts.filter((product) =>
            selectedBrandsArray.includes(product.brandId)
          );
        }

        const processedProducts = filteredProducts.map((product) => {
          const variant = product.variants?.[0] || {};
          const image =
            product.images?.[0]?.imageUrl || "/images/placeholder.jpg";
          const oldPrice = variant.price || 0;
          const newPrice = variant.discountPrice || oldPrice;
          const discountAmount = oldPrice - newPrice;
          const discount =
            oldPrice > 0
              ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
              : "0%";

          return {
            id: product.id,
            name: product.name,
            categoryId: product.categoryId,
            oldPrice,
            newPrice,
            discount,
            discountAmount,
            image,
            features: [
              variant.storage || "Không xác định",
              brandsMap[product.brandId] || "Không có thương hiệu",
              "Hiệu suất cao",
            ],
          };
        });        setProducts(processedProducts);
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };    fetchProductsAndBrands();
  }, [selectedCategory, selectedPriceRange, selectedBrand, searchQuery]);
  // Theo dõi số lượng sản phẩm trong compareList
  useEffect(() => {
    const updateCompareCount = () => {
      const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
      setCompareCount(compareList.length);
      console.log("Updated compare count:", compareList.length);
    };

    updateCompareCount();
    
    // Listen for localStorage changes và custom events
    window.addEventListener("storage", updateCompareCount);
    window.addEventListener("compareListChanged", updateCompareCount);
    
    return () => {
      window.removeEventListener("storage", updateCompareCount);
      window.removeEventListener("compareListChanged", updateCompareCount);
    };
  }, []);// Function để thêm/xóa sản phẩm khỏi compare list
  const toggleCompare = (productId, productName) => {
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
    console.log("Current compare list:", compareList);
    console.log("Toggling product:", productId, productName);
    
    if (compareList.includes(productId)) {
      // Xóa khỏi danh sách
      const updatedList = compareList.filter(id => id !== productId);
      localStorage.setItem("compareList", JSON.stringify(updatedList));
      setCompareCount(updatedList.length);
      console.log("Removed from compare list. New list:", updatedList);
      
      // Trigger custom event để update trong cùng tab
      window.dispatchEvent(new Event('compareListChanged'));
      alert(`Đã xóa "${productName}" khỏi danh sách so sánh!`);
    } else {
      // Thêm vào danh sách (giới hạn tối đa 4 sản phẩm)
      if (compareList.length >= 4) {
        alert("Chỉ có thể so sánh tối đa 4 sản phẩm cùng lúc!");
        return;
      }
      
      compareList.push(productId);
      localStorage.setItem("compareList", JSON.stringify(compareList));
      setCompareCount(compareList.length);
      console.log("Added to compare list. New list:", compareList);
      
      // Trigger custom event để update trong cùng tab
      window.dispatchEvent(new Event('compareListChanged'));
      alert(`Đã thêm "${productName}" vào danh sách so sánh!`);
    }
    
    // Force re-render để update UI
    setProducts(prevProducts => [...prevProducts]);
  };  // Function để mở modal so sánh
  const openCompareModal = () => {
    console.log("openCompareModal function called!");
    const compareList = JSON.parse(localStorage.getItem("compareList") || "[]");
    console.log("Opening compare modal with list:", compareList);
    console.log("Current compareModalOpen state:", compareModalOpen);
    
    if (compareList.length < 1) { // Thay đổi từ 2 thành 1 để test
      alert("Cần ít nhất 1 sản phẩm để so sánh!");
      return;
    }
    
    console.log("Setting compareModalOpen to true...");
    setCompareModalOpen(true);
    console.log("Modal should be opening now!");
    
    // Test bằng cách log modal state sau một chút
    setTimeout(() => {
      console.log("Modal state after timeout:", compareModalOpen);
    }, 100);
  };

  if (loading) {
    return <div className="text-center py-6">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }
  return (
    <div className="w-full py-8 bg-gradient-to-br from-gray-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Sản phẩm nổi bật</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-purple-600 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">Khám phá những sản phẩm công nghệ tốt nhất với giá tốt nhất</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📱</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Không có sản phẩm phù hợp</h3>
            <p className="text-gray-500">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => {
              const isInCompare = JSON.parse(localStorage.getItem("compareList") || "[]").includes(product.id);
              
              return (
                <div
                  key={product.id}
                  className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-red-200 transform hover:-translate-y-2 cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  {/* Product Image Container */}
                  <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                    {/* Discount Badge */}
                    {product.discount !== "0%" && (
                      <div className="absolute top-4 left-4 z-20">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          {product.discount}
                        </div>
                      </div>
                    )}

                    {/* Compare Badge */}
                    {isInCompare && (
                      <div className="absolute top-4 right-4 z-20">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Đã chọn
                        </div>
                      </div>
                    )}

                    {/* Product Image */}
                    <div className="absolute inset-0 flex items-center justify-center p-6">
                      <img
                        src={
                          product.image?.startsWith("http")
                            ? product.image
                            : `${process.env.REACT_APP_API_BASE_URL}/${product.image}`
                        }
                        alt={product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://via.placeholder.com/300?text=No+Image";
                        }}
                      />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    {/* Product Name */}
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-red-600 transition-colors duration-300">
                      {product.name}
                    </h3>

                    {/* Features */}
                    <div className="mb-4">
                      <ul className="space-y-2">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <div className="w-1.5 h-1.5 bg-gradient-to-r from-red-400 to-pink-500 rounded-full mr-3 flex-shrink-0"></div>
                            <span className="truncate">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price Section */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 line-through">
                          {product.oldPrice.toLocaleString()}đ
                        </span>
                        <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Giảm {Math.round((product.discountAmount / product.oldPrice) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                          {product.newPrice.toLocaleString()}đ
                        </span>
                        <span className="text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-medium">
                          Tiết kiệm {product.discountAmount.toLocaleString()}đ
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                          isInCompare
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg"
                            : "bg-gradient-to-r from-gray-100 to-gray-200 hover:from-red-500 hover:to-pink-600 text-gray-700 hover:text-white border-2 border-gray-200 hover:border-transparent"
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCompare(product.id, product.name);
                        }}
                      >
                        {isInCompare ? (
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Đã chọn
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            So sánh
                          </span>
                        )}
                      </button>

                      <button
                        className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Add to cart logic here
                          alert("Thêm vào giỏ hàng!");
                        }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13v7a1 1 0 001 1h9a1 1 0 001-1v-7M7 13L5.4 5M17 16v2a1 1 0 01-1 1H8a1 1 0 01-1-1v-2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-transparent group-hover:from-red-500/5 group-hover:via-transparent group-hover:to-transparent transition-all duration-500 pointer-events-none rounded-2xl"></div>
                </div>
              );
            })}
          </div>
        )}        {/* Modern Floating Compare Button */}
        {compareCount > 0 && (
          <div className="fixed bottom-8 right-8 z-50 animate-slideUp">
            <div className="relative">
              {/* Pulse animation background */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl animate-pulse opacity-75"></div>
              
              <button
                onClick={openCompareModal}
                className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 transition-all duration-300 transform hover:scale-110 hover:shadow-3xl group"
              >
                {/* Icon with animation */}
                <div className="relative">
                  <svg className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  
                  {/* Count badge */}
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-bounce">
                    {compareCount}
                  </div>
                </div>
                
                <div className="flex flex-col items-start">
                  <span className="font-bold text-lg">So sánh</span>
                  <span className="text-xs text-white/80">{compareCount} sản phẩm</span>
                </div>
                
                {/* Arrow indicator */}
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              {/* Floating particles effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                <div className="absolute bottom-0 right-0 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                <div className="absolute top-1/2 right-0 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        )}
      </div>        {/* Compare Modal */}
      <CompareModal 
          isOpen={compareModalOpen} 
          onClose={() => {
            console.log("Modal close button clicked");
            setCompareModalOpen(false);
          }}
        />
      </div>
  );
};

export default ProductGrid;
