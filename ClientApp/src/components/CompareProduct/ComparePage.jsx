import React, { useState, useEffect } from "react";
import Navbar from "../Navbar/Navbar";
import Footer from "../Footer/Footer";

const ComparePage = () => {
  const [products, setProducts] = useState([]);

  // Load danh sách sản phẩm cần so sánh
  const fetchCompareProducts = () => {
    const ids = JSON.parse(localStorage.getItem("compareList") || "[]");
    if (ids.length < 2) {
      setProducts([]);
      return;
    }

    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/compare`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ids),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể lấy dữ liệu so sánh");
        return res.json();
      })
      .then((data) => {
        setProducts(data);
      })
      .catch((error) => {
        console.error("Lỗi khi tải dữ liệu so sánh:", error);
      });
  };

  useEffect(() => {
    fetchCompareProducts();
  }, []);

  // Hàm xoá sản phẩm khỏi localStorage và cập nhật giao diện
  const removeFromCompare = (productId) => {
    const currentList = JSON.parse(localStorage.getItem("compareList") || "[]");
    const updatedList = currentList.filter((id) => id !== productId);
    localStorage.setItem("compareList", JSON.stringify(updatedList));
    fetchCompareProducts();
  };

    return (
    <>
      <Navbar />
      <div className="min-h-[600px] max-w-7xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-center mb-6">So sánh sản phẩm</h2>

        {products.length < 2 ? (
          <div className="text-center text-gray-500 text-lg mt-12">
            Vui lòng chọn ít nhất 2 sản phẩm để so sánh.
          </div>
        ) : (
          <div className="flex gap-6 overflow-x-auto pb-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="min-w-[250px] border rounded-lg shadow p-4 bg-white relative"
              >
                <button
                  onClick={() => removeFromCompare(product.id)}
                  className="absolute top-2 right-2 text-sm bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  X
                </button>

                <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
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
                
                <p><strong>Thương hiệu:</strong> {product.brand}</p>
                <p><strong>Danh mục:</strong> {product.category}</p>
                <p className="text-sm mt-2">{product.description}</p>

                <h4 className="font-semibold mt-4">Biến thể:</h4>
                {product.variants.map((variant, i) => (
                  <div key={i} className="mt-2 text-sm border-t pt-2">
                    <p>Màu: {variant.color} - Dung lượng: {variant.storage}</p>
                    <p>Giá: {variant.price.toLocaleString()}đ</p>
                    {variant.discountPrice && (
                      <p>Giá KM: {variant.discountPrice.toLocaleString()}đ</p>
                    )}
                    <p>Còn lại: {variant.stockQuantity} sản phẩm</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ComparePage;