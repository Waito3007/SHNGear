import React, { useState, useEffect, useCallback } from "react";
import { Snackbar, Alert, CircularProgress } from "@mui/material";
import { jwtDecode } from "jwt-decode";

const ProductReviews = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const token = localStorage.getItem("token");
  let currentUserId = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      currentUserId = decoded.nameid || decoded.sub || decoded.UserId || null;
    } catch (err) {
      console.error("Token decode error:", err);
    }
  }

  const fetchReviews = useCallback(async (signal) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/review/product/${productId}`,
        { signal }
      );

      if (!response.ok) throw new Error("Không thể tải đánh giá");

      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error("Lỗi fetch review:", err);
      setError(`Không thể tải đánh giá: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  const fetchAverageRating = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/review/product/${productId}/average-rating`);
      const avg = await res.json();
      setAverageRating(avg);
    } catch (err) {
      console.error("Lỗi fetch rating:", err);
    }
  }, [productId]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000); // Giảm thời gian tải xuống còn 3 giây

    if (productId) {
      fetchReviews(controller.signal);
      fetchAverageRating();
    }

    return () => clearTimeout(timeout); // Dọn timeout
  }, [productId, fetchReviews, fetchAverageRating]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token || !currentUserId) {
      setSnackbar({ open: true, message: "Vui lòng đăng nhập để đánh giá", severity: "warning" });
      return;
    }

    if (!comment.trim() || rating < 1 || rating > 5) {
      setSnackbar({ open: true, message: "Vui lòng nhập đầy đủ thông tin đánh giá", severity: "warning" });
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, rating, comment }),
      });

      if (!response.ok) throw new Error(await response.text());

      await fetchReviews(); // Cập nhật lại đánh giá
      fetchAverageRating();

      setShowForm(false);
      setComment("");
      setRating(5);
      setSnackbar({ open: true, message: "Gửi đánh giá thành công", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: `Lỗi gửi đánh giá: ${err.message}`, severity: "error" });
    }
  };

  const hasReviewed = reviews.some((r) => r.userId === Number(currentUserId));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-2 text-center">Đánh giá & Bình luận</h3>
      <p className="text-yellow-600 font-medium text-center">⭐ Trung bình: {averageRating.toFixed(1)} / 5</p>

      {loading && (
        <div className="flex justify-center items-center gap-2 text-gray-500 mt-4">
          <CircularProgress size={20} />
          <span>Đang tải đánh giá...</span>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-center mt-4">
          ❌ {error || "Không thể tải đánh giá, thử lại sau."}
        </p>
      )}

      {!loading && !error && (
        <>
          {reviews.length > 0 ? (
            <div className="space-y-4 mt-4">
              {reviews.map((review) => (
                <div key={review.id} className="border-b pb-3">
                  <p className="font-bold text-red-500">{review.userName}</p>
                  <p className="text-gray-700">{review.comment}</p>
                  <p className="text-yellow-500">⭐ {review.rating} / 5</p>
                  <p className="text-sm text-gray-400">{new Date(review.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center mt-4">Chưa có đánh giá nào.</p>
          )}
        </>
      )}

      {!hasReviewed && (
        <button
          className="mt-4 w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Đóng" : "Đánh giá sản phẩm"}
        </button>
      )}

      {showForm && (
        <form onSubmit={handleSubmitReview} className="mt-4 p-4 border rounded space-y-3">
          <div>
            <label className="font-medium">Số sao:</label>
            <select
              value={rating}
              onChange={(e) => setRating(+e.target.value)}
              className="border p-2 w-full rounded"
            >
              {[5, 4, 3, 2, 1].map((s) => (
                <option key={s} value={s}>{s} ⭐</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-medium">Nhận xét:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="border p-2 w-full rounded"
              rows="3"
              placeholder="Nhập nhận xét của bạn..."
            ></textarea>
          </div>

          <button type="submit" className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Gửi đánh giá
          </button>
        </form>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </div>
  );
};

export default ProductReviews;
