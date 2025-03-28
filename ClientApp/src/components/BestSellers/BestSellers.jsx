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
        // Giữ nguyên phần fetch data như cũ
        const [productsResponse, categoriesResponse, brandsResponse] = await Promise.all([
          fetch("https://localhost:7107/api/Products"),
          fetch("https://localhost:7107/api/categories"),
          fetch("https://localhost:7107/api/brands")
        ]);

        if (!productsResponse.ok) throw new Error("Không thể tải sản phẩm");
        if (!categoriesResponse.ok) throw new Error("Không thể tải danh mục");
        if (!brandsResponse.ok) throw new Error("Không thể tải thương hiệu");

        const [productsData, categoriesData, brandsData] = await Promise.all([
          productsResponse.json(),
          categoriesResponse.json(),
          brandsResponse.json()
        ]);

        // Xử lý dữ liệu như cũ
        const categoriesArray = categoriesData.$values || categoriesData || [];
        const brandsArray = brandsData.$values || brandsData || [];
        const productsArray = productsData.$values || productsData || [];

        const phoneCategory = categoriesArray.find(cat => cat.name === "Điện Thoại");
        if (!phoneCategory) throw new Error("Không tìm thấy danh mục 'Điện Thoại'");

        const phoneProducts = productsArray
          .filter(product => product.categoryId === phoneCategory.id)
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
        console.error(err);
      } finally {
        setLoading(false);
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
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-auto max-w-md my-6 rounded-lg shadow-md">
        <p className="font-bold">Lỗi!</p>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-6">
      {/* Bọc thêm 1 div để tạo background trắng cho nội dung */}
      <div className="max-w-[1200px] w-full px-4 bg-white bg-opacity-90 rounded-xl shadow-xl p-6 backdrop-blur-sm">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center relative">
          <span className="relative z-10 px-4 bg-white bg-opacity-90 rounded-full">
            Mua đúng quà - Điện thoại "Hiền Hòa"
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
                {/* Ribbon giảm giá */}
                {product.discount !== "0%" && (
                  <div className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold px-2 py-1 transform rotate-12 translate-x-2 -translate-y-1 z-10">
                    {product.discount}
                  </div>
                )}
                
                <div className="relative h-40 mb-3 overflow-hidden rounded-lg">
                  <img
                    src={product.image?.startsWith("http") ? product.image : `https://localhost:7107/${product.image}`}
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
                    <span className="text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()}đ
                    </span>
                    <span className="text-red-500 font-semibold">
                      {product.newPrice.toLocaleString()}đ
                    </span>
                  </div>
                  
                  <p className="text-green-600 text-sm font-medium bg-green-50 px-2 py-1 rounded-full inline-block">
                    Giảm {product.discountAmount.toLocaleString()}đ
                  </p>
                  
                  <h3 className="text-gray-800 font-medium text-base truncate group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  
                  <ul className="text-xs text-gray-600 space-y-1">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2"></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default DiscountProductSlider;