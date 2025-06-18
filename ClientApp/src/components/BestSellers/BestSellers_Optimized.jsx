import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/autoplay";

const DiscountProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use optimized featured products API with caching
        const [featuredResponse, categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/featured?count=20`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`)
        ]);

        if (!featuredResponse.ok) throw new Error("Không thể tải sản phẩm nổi bật");
        if (!categoriesResponse.ok) throw new Error("Không thể tải danh mục");
        if (!brandsResponse.ok) throw new Error("Không thể tải thương hiệu");

        const [featuredData, categoriesData, brandsData] = await Promise.all([
          featuredResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json()
        ]);

        // Handle response data
        const categoriesArray = categoriesData.$values || categoriesData || [];
        const brandsArray = brandsData.$values || brandsData || [];
        const featuredProducts = featuredData || [];

        // Find phone category for filtering (optional since featured API may include all categories)
        const phoneCategory = categoriesArray.find(cat => cat.name === "Điện Thoại");

        // Process featured products (already optimized from API)
        const processedProducts = featuredProducts
          .filter(product => {
            // If no phone category found, show all featured products
            if (!phoneCategory) return true;
            // Filter by phone category
            return product.categoryName === "Điện Thoại" || 
                   product.categoryName === phoneCategory.name;
          })
          .map((product) => {
            const oldPrice = product.minPrice || 0;
            const newPrice = product.minDiscountPrice || oldPrice;
            const discountAmount = oldPrice - newPrice;
            const discount = oldPrice > 0 && newPrice < oldPrice
              ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
              : "0%";

            return {
              id: product.id,
              name: product.name,
              oldPrice,
              newPrice,
              discount,
              discountAmount,
              image: product.primaryImage?.imageUrl || "/images/placeholder.jpg",
              features: [
                "Sản phẩm nổi bật",
                product.brandName || "Không có thương hiệu",
                "Khuyến mãi đặc biệt",
              ],
            };
          });

        setProducts(processedProducts);
        setCategories(categoriesArray);
        setBrands(brandsArray);
      } catch (err) {
        console.error("Featured products API error:", err);
        // Fallback to original API if new API fails
        await fetchDataFallback();
      } finally {
        setLoading(false);
      }
    };

    // Fallback function using original full-details API
    const fetchDataFallback = async () => {
      try {
        console.log("Using fallback API...");
        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/full-details`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`)
        ]);

        if (!productsResponse.ok) throw new Error("Không thể tải sản phẩm");
        if (!categoriesResponse.ok) throw new Error("Không thể tải danh mục");
        if (!brandsResponse.ok) throw new Error("Không thể tải thương hiệu");

        const [productsData, categoriesData, brandsData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json()
        ]);

        // Handle response data
        const categoriesArray = categoriesData.$values || categoriesData || [];
        const brandsArray = brandsData.$values || brandsData || [];
        const productsArray = productsData.$values || productsData || [];

        const phoneCategory = categoriesArray.find(cat => cat.name === "Điện Thoại");
        if (!phoneCategory) {
          console.warn("Không tìm thấy danh mục 'Điện Thoại', hiển thị tất cả sản phẩm");
        }

        const phoneProducts = productsArray
          .filter(product => !phoneCategory || product.categoryId === phoneCategory.id)
          .map((product) => {
            const variant = product.variants?.[0] || {};
            const image = product.images?.[0]?.imageUrl || "/images/placeholder.jpg";
            const oldPrice = variant.price || 0;
            const newPrice = variant.discountPrice || oldPrice;
            const discountAmount = oldPrice - newPrice;
            const discount = oldPrice > 0
              ? `-${Math.round((discountAmount / oldPrice) * 100)}%`
              : "0%";

            const brand = brandsArray.find(b => b.id === product.brandId);

            return {
              id: product.id,
              name: product.name,
              oldPrice,
              newPrice,
              discount,
              discountAmount,
              image,
              features: [
                variant.storage || "Không xác định",
                brand?.name || "Không có thương hiệu",
                "Hiệu suất cao",
              ],
            };
          });

        setProducts(phoneProducts);
        setCategories(categoriesArray);
        setBrands(brandsArray);
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
        console.error("Fallback API error:", err);
      }
    };

    fetchData();
  }, []);

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
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không có sản phẩm nào để hiển thị</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Sản Phẩm Nổi Bật
        </h2>
        <button 
          onClick={() => navigate('/products')}
          className="text-red-500 hover:text-red-600 font-semibold"
        >
          Xem tất cả →
        </button>
      </div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
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
        className="discount-slider"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id}>
            <div 
              className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer p-4"
              onClick={() => navigate(`/products/${product.id}`)}
            >
              {/* Discount Badge */}
              {product.discount !== "0%" && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-bold z-10">
                  {product.discount}
                </div>
              )}
              
              {/* Product Image */}
              <div className="relative mb-4">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              {/* Product Info */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-800 line-clamp-2">
                  {product.name}
                </h3>
                
                {/* Features */}
                <div className="space-y-1">
                  {product.features.map((feature, index) => (
                    <p key={index} className="text-sm text-gray-600">
                      • {feature}
                    </p>
                  ))}
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mt-4">
                  <div className="space-y-1">
                    {product.newPrice < product.oldPrice ? (
                      <>
                        <p className="text-lg font-bold text-red-500">
                          {product.newPrice.toLocaleString('vi-VN')}₫
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          {product.oldPrice.toLocaleString('vi-VN')}₫
                        </p>
                      </>
                    ) : (
                      <p className="text-lg font-bold text-gray-800">
                        {product.oldPrice.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                  </div>
                  
                  <button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors duration-200">
                    Mua ngay
                  </button>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default DiscountProductSlider;
