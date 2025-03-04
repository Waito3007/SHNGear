import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import "swiper/css";
import "swiper/css/navigation";

const RelatedProducts = ({ categoryId, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!categoryId || !currentProductId) {
      console.log("Thiếu categoryId hoặc currentProductId");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Gọi API để lấy danh sách sản phẩm...");
        const res = await fetch("http://localhost:7107/api/products");
        if (!res.ok) throw new Error("Lỗi khi tải sản phẩm");
        const data = await res.json();
        const allProducts = Array.isArray(data) ? data : data.$values || [];

        console.log("Dữ liệu từ API:", allProducts);

        if (allProducts.length === 0) {
          console.log("Không có sản phẩm nào từ API");
          setProducts([]);
          return;
        }

        const currentProduct = allProducts.find(
          (p) => p.id === currentProductId
        );
        if (!currentProduct) {
          console.log(
            "Không tìm thấy sản phẩm hiện tại với ID:",
            currentProductId
          );
          setProducts([]);
          return;
        }

        console.log("Sản phẩm hiện tại:", currentProduct);
        const brandId = currentProduct.brandId;
        if (!brandId) {
          console.log("Sản phẩm hiện tại không có brandId");
          setProducts([]);
          return;
        }

        console.log("Thương hiệu của sản phẩm hiện tại:", brandId);
        const relatedProducts = allProducts
          .filter(
            (product) =>
              product.brandId === brandId && product.id !== currentProductId
          )
          .map((product) => ({
            id: product.id,
            name: product.name,
            oldPrice: product.variants?.[0]?.price || 0,
            newPrice:
              product.variants?.[0]?.discountPrice ||
              product.variants?.[0]?.price ||
              0,
            discount: product.variants?.[0]?.price
              ? `-${Math.round(
                  ((product.variants[0].price -
                    product.variants[0].discountPrice) /
                    product.variants[0].price) *
                    100
                )}%`
              : "0%",
            image: product.images?.[0]?.imageUrl || "/images/placeholder.jpg",
            features: [
              product.variants?.[0]?.storage || "Không xác định",
              "Hiệu suất cao",
            ],
          }));

        console.log("Sản phẩm liên quan:", relatedProducts);
        setProducts(relatedProducts);
      } catch (err) {
        console.error("Lỗi khi tải sản phẩm:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [categoryId, currentProductId]);

  if (loading) {
    return (
      <div className="text-center py-6">Đang tải sản phẩm liên quan...</div>
    );
  }

  if (error) {
    return <div className="text-center py-6 text-red-500">Lỗi: {error}</div>;
  }

  return (
    <div className="w-full flex justify-center py-6">
      <div className="max-w-[1200px] w-full px-4 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-left">
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
                  className="bg-white p-4 rounded-lg shadow-md border w-[250px] cursor-pointer transition-transform duration-200 hover:scale-105"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-40 object-contain mb-3"
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
                    <p className="text-gray-800 text-sm font-medium">
                      {product.name}
                    </p>
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

export default RelatedProducts;
