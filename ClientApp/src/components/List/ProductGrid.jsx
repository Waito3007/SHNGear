import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ProductGrid = ({
  selectedCategory,
  selectedPriceRange,
  selectedBrand,
}) => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
  }, [selectedCategory, selectedPriceRange, selectedBrand, searchQuery]);

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
            Không có sản phẩm phù hợp
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white p-4 rounded-lg shadow-md border cursor-pointer"
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
