import React, { useState, useEffect } from "react";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `https://localhost:7107/api/Products/${productId}/reviews`
        );
        if (!response.ok) {
          throw new Error("Chưa có đánh giá.");
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [productId]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Đánh giá & Bình luận</h3>

      {/* Hiển thị trạng thái tải hoặc lỗi */}
      {loading && <p className="text-gray-500 text-center">Đang tải...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Hiển thị danh sách đánh giá */}
      {!loading && !error && (
        <div className="space-y-4">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={index} className="border-b pb-3">
                <p className="font-bold text-red-500">{review.user}</p>
                <p className="text-gray-700">{review.comment}</p>
                <p className="text-yellow-500">⭐ {review.rating} / 5</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">Chưa có đánh giá nào.</p>
          )}
        </div>
      )}

      {/* Nút Đánh giá sản phẩm */}
      <button className="mt-4 w-1/4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mx-auto block">
        Đánh giá sản phẩm
      </button>
    </div>
  );
};

export default ProductReviews;
