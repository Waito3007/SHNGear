import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";

const RelatedProducts = ({ categoryId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchRelatedProducts = useCallback(async () => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Lấy danh sách sản phẩm liên quan theo categoryId
      const res = await fetch(
        `http://localhost:7107/api/categories/${categoryId}`
      );
      if (!res.ok) throw new Error("Không thể tải sản phẩm liên quan.");

      const data = await res.json();

      // Kiểm tra nếu dữ liệu trả về là một danh sách sản phẩm
      setProducts(Array.isArray(data.products) ? data.products : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchRelatedProducts();
  }, [fetchRelatedProducts]);

  if (loading)
    return <div className="text-center py-6">Đang tải sản phẩm...</div>;
  if (error)
    return <div className="text-center py-6 text-red-500">Lỗi: {error}</div>;

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Sản phẩm liên quan
        </h2>
        {products.length === 0 ? (
          <div className="text-center text-gray-500">
            Không có sản phẩm liên quan.
          </div>
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
                  className="bg-white p-4 rounded-lg shadow-md border w-[250px] cursor-pointer transition-transform duration-300 hover:scale-105"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-contain mb-3 rounded-md"
                  />
                  <div className="text-gray-700 text-sm space-y-2">
                    <p className="text-gray-900 text-lg font-semibold">
                      {product.name}
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {product.price?.toLocaleString()} đ
                    </p>
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

export default RelatedProducts;
