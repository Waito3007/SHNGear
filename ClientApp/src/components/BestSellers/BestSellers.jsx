import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "swiper/css";
import "swiper/css/navigation";

const DiscountProductSlider = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Hook điều hướng

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Lấy danh sách sản phẩm
        const productsResponse = await fetch(
          "https://localhost:7107/api/Products"
        );
        if (!productsResponse.ok) throw new Error("Không thể tải sản phẩm");
        const productsData = await productsResponse.json();

        // Lấy danh sách danh mục
        const categoriesResponse = await fetch(
          "https://localhost:7107/api/categories"
        );
        if (!categoriesResponse.ok) throw new Error("Không thể tải danh mục");
        const categoriesData = await categoriesResponse.json();

        // Lấy danh sách thương hiệu
        const brandsResponse = await fetch("https://localhost:7107/api/brands");
        if (!brandsResponse.ok) throw new Error("Không thể tải thương hiệu");
        const brandsData = await brandsResponse.json();

        console.log("Dữ liệu API trả về:", {
          productsData,
          categoriesData,
          brandsData,
        });

        // Xử lý dữ liệu
        const categoriesArray = categoriesData.$values || categoriesData || [];
        const brandsArray = brandsData.$values || brandsData || [];
        const productsArray = productsData.$values || productsData || [];

        // Tìm ID của danh mục "Điện Thoại"
        const phoneCategory = categoriesArray.find(
          (cat) => cat.name === "Điện Thoại"
        );
        if (!phoneCategory)
          throw new Error("Không tìm thấy danh mục 'Điện Thoại'");

        // Lọc các sản phẩm thuộc danh mục "Điện Thoại"
        const phoneProducts = productsArray
          .filter((product) => product.categoryId === phoneCategory.id)
          .map((product) => {
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

            // Tìm tên thương hiệu từ brandId
            const brand = brandsArray.find((b) => b.id === product.brandId);

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
                "Hiệu suất cao", // Có thể thay đổi tùy theo dữ liệu thực tế
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
    return <div className="text-center py-6">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Mua đúng quà - Điện thoại "Hiền Hòa"
        </h2>
        <Swiper
          modules={[Navigation]}
          navigation
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
                className="bg-white p-4 rounded-lg shadow-md border w-[250px]"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                    src={
                        product.image?.startsWith("http")
                            ? product.image // Ảnh từ API (URL đầy đủ)
                            : `https://localhost:7107/${product.image}` // Ảnh local từ wwwroot
                    }
                    alt={product.name}
                    className="w-full h-40 object-contain mb-3 hover:scale-110"
                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
                />

                <div className="text-gray-700 text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 line-through">
                      {product.oldPrice.toLocaleString()} 
                    </span>
                    <span className="text-red-500 text-sm">
                      {product.discount}
                    </span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {product.newPrice.toLocaleString()} đ
                  </p>
                  <p className="text-green-600 text-sm">
                    Giảm {product.discountAmount.toLocaleString()} đ
                  </p>
                  <p className="text-gray-800 text-sm">{product.name}</p>
                  <ul className="text-xs text-gray-600 list-disc pl-4">
                    {product.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
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