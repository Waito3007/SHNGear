import React, { useState, useEffect } from "react";

const ProductReviews = ({ productVariantId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [userId] = useState(1); // 🔹 ID người dùng (có thể lấy từ Auth)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/review/product/${productVariantId}`
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
  }, [productVariantId]);

  // 📌 Gửi đánh giá mới
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (comment.trim() === "" || rating < 1 || rating > 5) {
      alert("Vui lòng nhập nội dung và chọn số sao từ 1-5.");
      return;
    }

    const newReview = {
      productVariantId,
      userId,
      rating,
      comment,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) throw new Error("Gửi đánh giá thất bại.");

      const addedReview = await response.json();
      setReviews([addedReview, ...reviews]); // Thêm đánh giá mới vào đầu danh sách
      setShowForm(false);
      setComment("");
      setRating(5);
    } catch (err) {
      alert(err.message);
    }
  };

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
                <p className="font-bold text-red-500">
                  {review.user?.username || "Người dùng ẩn danh"}
                </p>
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
      <button
        className="mt-4 w-1/4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition mx-auto block"
        onClick={() => setShowForm(!showForm)}
      >
        {showForm ? "Đóng" : "Đánh giá sản phẩm"}
      </button>

      {/* Form nhập đánh giá */}
      {showForm && (
        <form
          onSubmit={handleSubmitReview}
          className="mt-4 p-4 border rounded-lg"
        >
          <label className="block mb-2">Số sao:</label>
          <select
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
            className="border p-2 rounded w-full"
          >
            {[5, 4, 3, 2, 1].map((star) => (
              <option key={star} value={star}>
                {star} ⭐
              </option>
            ))}
          </select>

          <label className="block mt-2">Nhận xét:</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="border p-2 rounded w-full"
            rows="3"
            placeholder="Nhập đánh giá..."
          ></textarea>

          <button
            type="submit"
            className="mt-2 w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
          >
            Gửi đánh giá
          </button>
        </form>
      )}
    </div>
  );
};

export default ProductReviews;
