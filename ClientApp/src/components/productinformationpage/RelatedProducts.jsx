import React, { useEffect, useState } from "react";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("https://localhost:7107/api/Products");

        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm.");
        }

        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p>Đang tải danh sách sản phẩm...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Danh sách sản phẩm</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
        {products.map((product) => {
          // Lấy biến thể có giá thấp nhất (ưu tiên giá giảm)
          const lowestVariant = product.variants?.reduce((min, variant) => {
            const minPrice =
              min.discountPrice > 0 ? min.discountPrice : min.price;
            const variantPrice =
              variant.discountPrice > 0 ? variant.discountPrice : variant.price;
            return variantPrice < minPrice ? variant : min;
          }, product.variants?.[0]);

          return (
            <div
              key={product.id}
              className="border p-4 rounded-lg shadow-sm hover:shadow-md transition w-[160px]"
            >
              {/* Ảnh sản phẩm */}
              <img
                src={
                  product.images?.find((img) => img.isPrimary)?.imageUrl ||
                  product.images?.[0]?.imageUrl ||
                  "/placeholder.jpg"
                }
                alt={product.name}
                className="w-36 h-36 object-cover rounded-md"
              />
              {/* Tên sản phẩm */}
              <h3 className="text-sm font-medium mt-2 line-clamp-2">
                {product.name}
              </h3>
              {/* Hiển thị giá thấp nhất ngay dưới tên */}
              {lowestVariant && (
                <div className="mt-1">
                  {lowestVariant.discountPrice > 0 ? (
                    <>
                      <p className="text-red-500 font-semibold text-lg">
                        {lowestVariant.discountPrice.toLocaleString()}₫
                      </p>
                      <p className="text-gray-500 line-through text-sm">
                        {lowestVariant.price.toLocaleString()}₫
                      </p>
                    </>
                  ) : (
                    <p className="text-gray-700 font-medium text-lg">
                      {lowestVariant.price.toLocaleString()}₫
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductList;
