import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

const RelatedProducts = ({ productId, brandId, categoryId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const productsRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`);
        if (!productsRes.ok) throw new Error("Không thể tải sản phẩm.");
        const productsData = await productsRes.json();

        const brandsRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`);
        if (!brandsRes.ok) throw new Error("Không thể tải thương hiệu.");
        const brandsData = await brandsRes.json();

        const productsArray = productsData.$values || productsData || [];
        const brandsArray = brandsData.$values || brandsData || [];

        const filteredProducts = productsArray
          .filter(
            (product) =>
              product.id !== productId &&
              (product.brandId === brandId || product.categoryId === categoryId)
          )
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
                "Hiệu suất cao",
              ],
            };
          });

        setRelatedProducts(filteredProducts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [productId, brandId, categoryId]);

  if (loading) return <p>Đang tải sản phẩm liên quan...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
          Sản phẩm liên quan
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
          {relatedProducts.map((product) => (
            <SwiperSlide key={product.id} className="flex justify-center">
              <div
                className="bg-white p-4 rounded-lg shadow-md border w-[250px] cursor-pointer"
                onClick={() => navigate(`/product/${product.id}`)}
              >
                <img
                  src={
                      product.image?.startsWith("http")
                          ? product.image // Ảnh từ API (URL đầy đủ)
                          : `${process.env.REACT_APP_API_BASE_URL}/${product.image}` // Ảnh local từ wwwroot
                  }
                  alt={product.name}
                  className="w-full h-40 object-contain mb-3 hover:scale-110"
                  onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/150"; }}
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
      </div>
    </div>
  );
};

export default RelatedProducts;
