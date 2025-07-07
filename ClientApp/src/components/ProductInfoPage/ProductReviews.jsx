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
  CheckCircle, // For verified purchase
  Person, 
  RateReview, 
  Send,
  Close 
} from "@mui/icons-material";
import { useReviews, useSubmitReview, useUserReview } from "@/hooks/api/useReviews";
import { jwtDecode } from "jwt-decode";

const ProductReviews = ({ productId }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
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

  const { reviews, loading, error, averageRating, fetchReviews, fetchAverageRating } = useReviews(productId);
  const { userReview, refetchUserReview } = useUserReview(currentUserId, productId);
  const { submitReview } = useSubmitReview(productId, () => {
    fetchReviews();
    fetchAverageRating();
    refetchUserReview(); // Refetch user's specific review after submission
  });

  // Xử lý khi không có dữ liệu hoặc API trả về rỗng
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeAverageRating = typeof averageRating === 'number' && !isNaN(averageRating) ? averageRating : 0;

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
      await submitReview({ rating, comment });
      setShowForm(false);
      setComment("");
      setRating(5);
      setSnackbar({ open: true, message: "Đánh giá của bạn đã được gửi và đang chờ kiểm duyệt!", severity: "success" });
    } catch (err) {
      setSnackbar({ open: true, message: err.message || "Gửi đánh giá thất bại", severity: "error" });
    }
  };
  
  // Check if user has reviewed, considering both general reviews and their specific review
  const hasReviewed = safeReviews.some((r) => r.userId === Number(currentUserId)) || !!userReview;

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    safeReviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = safeReviews.length;

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
              {safeAverageRating.toFixed(1)}
            </Typography>
            <Rating value={safeAverageRating} readOnly precision={0.1} size="large" sx={{ mb: 1 }} />
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
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            {error.includes('404') || error.includes('Not Found') 
              ? 'Chức năng đánh giá đang được phát triển. Vui lòng quay lại sau!'
              : `Lỗi khi tải đánh giá: ${error}`
            }
          </Typography>
        </Alert>
      )}

      {/* User's Own Review (if exists) */}
      {userReview && (
        <Card sx={{ mb: 2, boxShadow: 3, borderRadius: 2, border: '2px solid #1976d2', bgcolor: '#e3f2fd' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#1976d2', mr: 2, width: 48, height: 48, fontSize: '1.5rem' }}>
                {userReview.userName ? userReview.userName[0].toUpperCase() : '?'}
              </Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                    Đánh giá của bạn
                  </Typography>
                  <Chip 
                    icon={<Star sx={{ fontSize: 16 }} />}
                    label={`${userReview.rating}`}
                    size="small"
                    sx={{
                      bgcolor: '#ffeb3b',
                      color: '#333',
                      fontWeight: 'bold',
                      px: 1,
                    }}
                  />
                </Box>
                <Rating value={userReview.rating} readOnly size="small" sx={{ mb: 1 }} />
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: '#333' }}>
                  {userReview.comment}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(userReview.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                  {userReview.hasPurchased && (
                    <Chip
                      icon={<CheckCircle />}
                      label="Đã xác minh mua hàng"
                      size="small"
                      color="success"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                  {!userReview.isApproved && (
                    <Chip
                      label="Đang chờ duyệt"
                      size="small"
                      color="info"
                      sx={{ ml: 1, height: 20, fontSize: '0.75rem' }}
                    />
                  )}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {!loading && !error && (
        <Box sx={{ mb: 4 }}>
          {safeReviews.length > 0 ? (
            <Box>
              {safeReviews.map((review, index) => (
                <Card key={review.id} sx={{ mb: 2, boxShadow: 2, borderRadius: 2, transition: 'all 0.3s ease', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar sx={{ bgcolor: '#d32f2f', mr: 2, width: 48, height: 48, fontSize: '1.5rem' }}>
                        {review.userName ? review.userName[0].toUpperCase() : '?'}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
                            {review.userName}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              icon={<Star sx={{ fontSize: 16 }} />}
                              label={`${review.rating}`}
                              size="small"
                              sx={{
                                bgcolor: '#ffeb3b',
                                color: '#333',
                                fontWeight: 'bold',
                                px: 1,
                              }}
                            />
                            {review.hasPurchased && (
                              <Chip
                                icon={<CheckCircle />}
                                label="Đã xác minh mua hàng"
                                size="small"
                                color="success"
                                sx={{ height: 20, fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        </Box>
                        <Rating value={review.rating} readOnly size="small" sx={{ mb: 1 }} />
                        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, color: '#555' }}>
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
            <Card sx={{ textAlign: 'center', py: 6, boxShadow: 2, borderRadius: 2 }}>
              <CardContent>
                <RateReview sx={{ fontSize: 60, color: '#bdbdbd', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  {error ? 'Không thể tải đánh giá' : 'Chưa có đánh giá nào'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {error 
                    ? 'Hệ thống đang bảo trì, vui lòng thử lại sau'
                    : 'Hãy là người đầu tiên đánh giá sản phẩm này'
                  }
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>
      )}

      {/* Add Review Button */}
      {!hasReviewed && currentUserId && !error && (
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
              boxShadow: 3,
              bgcolor: '#d32f2f',
              '&:hover': { boxShadow: 5, bgcolor: '#b71c1c' }
            }}
          >
            {showForm ? "Đóng form đánh giá" : "Viết đánh giá"}
          </Button>
        </Box>
      )}

      {/* Review Form */}
      {showForm && (
        <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', color: '#d32f2f', fontWeight: 'bold' }}>
              Chia sẻ đánh giá của bạn
            </Typography>
            
            <Box component="form" onSubmit={handleSubmitReview} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography component="legend" sx={{ mb: 1, fontWeight: 'medium', color: '#555' }}>
                  Đánh giá của bạn:
                </Typography>
                <Rating
                  value={rating}
                  onChange={(event, newValue) => setRating(newValue || 1)}
                  size="large"
                  sx={{ fontSize: '2.5rem', color: '#ffeb3b' }}
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
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="large"
                  onClick={() => setShowForm(false)}
                  sx={{ px: 4, borderRadius: 2, borderColor: '#d32f2f', color: '#d32f2f', '&:hover': { borderColor: '#b71c1c', bgcolor: 'rgba(211, 47, 47, 0.04)' } }}
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
                    boxShadow: 3,
                    bgcolor: '#d32f2f',
                    '&:hover': { boxShadow: 5, bgcolor: '#b71c1c' }
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
        <Card sx={{ textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 2, boxShadow: 1 }}>
          <CardContent sx={{ py: 3 }}>
            <Typography variant="body1" color="text.secondary">
              Đăng nhập để có thể đánh giá và bình luận sản phẩm
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Already reviewed message */}
      {hasReviewed && !userReview && (
        <Alert severity="info" sx={{ textAlign: 'center', borderRadius: 2, boxShadow: 1 }}>
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

