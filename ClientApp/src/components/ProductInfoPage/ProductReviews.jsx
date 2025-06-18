import React, { useState, useEffect, useCallback } from "react";
import { 
  Snackbar, 
  Alert, 
  CircularProgress, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  TextField, 
  Rating, 
  Avatar, 
  Chip,
  Divider,
  LinearProgress
} from "@mui/material";
import { 
  Star, 
  StarBorder, 
  Person, 
  RateReview, 
  Send,
  Close 
} from "@mui/icons-material";
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

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = reviews.length;

  return (
    <Box sx={{ p: 0 }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
          <RateReview sx={{ mr: 1, verticalAlign: 'middle' }} />
          Đánh giá & Bình luận
        </Typography>
        
        {/* Average Rating Display */}
        <Card sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 3 }}>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ff9800', mb: 1 }}>
              {averageRating.toFixed(1)}
            </Typography>
            <Rating value={averageRating} readOnly precision={0.1} size="large" sx={{ mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Dựa trên {totalReviews} đánh giá
            </Typography>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        {totalReviews > 0 && (
          <Card sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, textAlign: 'center' }}>
                Phân bố đánh giá
              </Typography>
              {[5, 4, 3, 2, 1].map((star) => (
                <Box key={star} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography sx={{ minWidth: 20 }}>{star}</Typography>
                  <Star sx={{ color: '#ff9800', fontSize: 16, mx: 0.5 }} />
                  <LinearProgress 
                    variant="determinate" 
                    value={totalReviews > 0 ? (ratingDistribution[star] / totalReviews) * 100 : 0}
                    sx={{ 
                      flexGrow: 1, 
                      mx: 1, 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: '#f5f5f5',
                      '& .MuiLinearProgress-bar': { bgcolor: '#ff9800' }
                    }} 
                  />
                  <Typography sx={{ minWidth: 30, fontSize: '0.875rem', color: 'text.secondary' }}>
                    {ratingDistribution[star]}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography color="text.secondary">Đang tải đánh giá...</Typography>
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Reviews List */}
      {!loading && !error && (
        <Box sx={{ mb: 4 }}>
          {reviews.length > 0 ? (
            <Box sx={{ space: 2 }}>
              {reviews.map((review, index) => (
                <Card key={review.id} sx={{ mb: 2, boxShadow: 1, '&:hover': { boxShadow: 2 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 40, height: 40 }}>
                        <Person />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#d32f2f' }}>
                            {review.userName}
                          </Typography>
                          <Chip 
                            label={`${review.rating} ⭐`} 
                            size="small" 
                            sx={{ 
                              bgcolor: '#fff3e0', 
                              color: '#e65100',
                              fontWeight: 'bold'
                            }} 
                          />
                        </Box>
                        <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6 }}>
                          {review.comment}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          ) : (
            <Card sx={{ textAlign: 'center', py: 6 }}>
              <CardContent>
                <RateReview sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Chưa có đánh giá nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy là người đầu tiên đánh giá sản phẩm này
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Add Review Button */}
      {!hasReviewed && currentUserId && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Button
            variant="contained"
            size="large"
            startIcon={showForm ? <Close /> : <RateReview />}
            onClick={() => setShowForm(!showForm)}
            sx={{
              borderRadius: 3,
              px: 4,
              py: 1.5,
              textTransform: 'none',
              fontSize: '1rem',
              boxShadow: 2,
              '&:hover': { boxShadow: 4 }
            }}
          >
            {showForm ? "Đóng form đánh giá" : "Viết đánh giá"}
          </Button>
        </Box>
      )}

      {/* Review Form */}
      {showForm && (
        <Card sx={{ mb: 3, boxShadow: 3 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#1976d2' }}>
              Chia sẻ đánh giá của bạn
            </Typography>
            
            <Box component="form" onSubmit={handleSubmitReview} sx={{ space: 3 }}>
              <Box sx={{ mb: 3, textAlign: 'center' }}>
                <Typography component="legend" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Đánh giá của bạn:
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue || 1)}
                  size="large"
                  sx={{ fontSize: '2rem' }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {rating === 5 && "Tuyệt vời! 🌟"}
                  {rating === 4 && "Rất tốt! 👍"}
                  {rating === 3 && "Bình thường 😐"}
                  {rating === 2 && "Không tốt 👎"}
                  {rating === 1 && "Rất tệ 😞"}
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                label="Nhận xét của bạn"
                placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                sx={{ mb: 3 }}
                required
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={() => setShowForm(false)}
                  sx={{ px: 4, borderRadius: 2 }}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  startIcon={<Send />}
                  sx={{ 
                    px: 4, 
                    borderRadius: 2,
                    boxShadow: 2,
                    '&:hover': { boxShadow: 4 }
                  }}
                >
                  Gửi đánh giá
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Login prompt for non-logged in users */}
      {!currentUserId && (
        <Card sx={{ textAlign: 'center', bgcolor: '#f8f9fa' }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Đăng nhập để có thể đánh giá và bình luận sản phẩm
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Already reviewed message */}
      {hasReviewed && (
        <Alert severity="info" sx={{ textAlign: 'center' }}>
          Bạn đã đánh giá sản phẩm này rồi. Cảm ơn phản hồi của bạn!
        </Alert>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductReviews;
