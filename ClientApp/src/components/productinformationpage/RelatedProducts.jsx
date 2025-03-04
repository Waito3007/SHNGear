import React, { useEffect, useState } from "react";

const RelatedProducts = ({ brandId, currentProductId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!brandId) return;

      try {
        setLoading(true);
        const response = await fetch(
          `https://localhost:7107/api/Products/related-by-brand/${brandId}/${currentProductId}`
        );

        if (!response.ok) {
          throw new Error("Không thể tải danh sách sản phẩm liên quan.");
        }

        const data = await response.json();
        setRelatedProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [brandId, currentProductId]);

  if (loading) return <p>Đang tải sản phẩm liên quan...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Sản phẩm liên quan</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {relatedProducts.map((product) => (
          <div key={product.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
            {/* Ảnh sản phẩm */}
            <img
              src={product.images?.find(img => img.isPrimary)?.imageUrl || "/placeholder.jpg"}
              alt={product.name}
              className="w-full h-40 object-cover rounded-md"
            />
            {/* Tên sản phẩm */}
            <h3 className="text-lg font-medium mt-2 line-clamp-2">{product.name}</h3>
            {/* Giá sản phẩm */}
            {product.variants?.length > 0 && (
              <p className="text-red-500 font-semibold">
                {product.variants[0].discountPrice > 0
                  ? `${product.variants[0].discountPrice}₫`
                  : `${product.variants[0].price}₫`}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
