import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";

const ProductGrid = ({ selectedCategory }) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProductsAndBrands = async () => {
      setLoading(true);
      try {
        const [productsRes, brandsRes] = await Promise.all([
          fetch("https://localhost:7107/api/Products"),
          fetch("https://localhost:7107/api/brands"),
        ]);

        if (!productsRes.ok) throw new Error("Không thể tải sản phẩm");
        if (!brandsRes.ok) throw new Error("Không thể tải thương hiệu");

        const productsData = await productsRes.json();
        const brandsData = await brandsRes.json();

        // Xử lý danh sách thương hiệu thành dạng object { brandId: brandName }
        const brandsMap = (brandsData.$values || brandsData || []).reduce(
          (acc, brand) => {
            acc[brand.id] = brand.name;
            return acc;
          },
          {}
        );

        // Lọc sản phẩm theo selectedCategory (nếu API không hỗ trợ query)
        const allProducts = productsData.$values || productsData || [];
        const filteredProducts = selectedCategory
          ? allProducts.filter(
              (product) => product.categoryId === selectedCategory
            )
          : allProducts;

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
        });

        setProducts(processedProducts);
        setBrands(brandsMap);
      } catch (err) {
        setError("Không thể tải dữ liệu: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProductsAndBrands();
  }, [selectedCategory]); // Mỗi khi selectedCategory thay đổi, gọi API lại

  if (loading) {
    return <div className="text-center py-6">Đang tải sản phẩm...</div>;
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">{error}</div>;
  }

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-12">
            Hiện không có sản phẩm
          </p>
        ) : (
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
                  className="bg-white p-4 rounded-lg shadow-md border w-[250px] cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-contain mb-3 hover:scale-110 transition-transform"
                    onError={(e) => (e.target.src = "/images/placeholder.jpg")} // Xử lý ảnh lỗi
                  />
                  <div className="text-gray-700 text-sm space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500 line-through">
                        {product.oldPrice.toLocaleString()} đ
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
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
