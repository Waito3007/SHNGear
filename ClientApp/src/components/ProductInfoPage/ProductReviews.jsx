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
  LinearProgress,
  Paper,
  Fade,
} from "@mui/material";
import {
  Star,
  CheckCircle,
  Person,
  RateReview,
  Send,
  Close,
  TrendingUp,
  BarChart,
} from "@mui/icons-material";
import {
  useReviews,
  useSubmitReview,
  useUserReview,
} from "@/hooks/api/useReviews";
import { jwtDecode } from "jwt-decode";

const ProductReviews = ({ productId, onReviewUpdate }) => {
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const token = localStorage.getItem("token");
  let currentUserId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      // The user ID is stored in the 'sub' claim as per JWT standard
      currentUserId = parseInt(decoded.sub, 10) || null;
    } catch (err) {
      console.error("Token decode error:", err);
      currentUserId = null;
    }
  }

  const {
    reviews,
    loading,
    error,
    averageRating,
    fetchReviews,
    fetchAverageRating,
  } = useReviews(productId);
  const { userReview, refetchUserReview } = useUserReview(
    currentUserId && !isNaN(currentUserId) ? currentUserId : null,
    productId
  );
  const { submitReview } = useSubmitReview(productId, () => {
    fetchReviews();
    fetchAverageRating();
    refetchUserReview();
    // Cập nhật product data trong parent component
    if (onReviewUpdate) {
      onReviewUpdate();
    }
  });

  // Xử lý khi không có dữ liệu hoặc API trả về rỗng
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const safeAverageRating =
    typeof averageRating === "number" && !isNaN(averageRating)
      ? averageRating
      : 0;

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!token || !currentUserId) {
      setSnackbar({
        open: true,
        message: "Vui lòng đăng nhập để đánh giá",
        severity: "warning",
      });
      return;
    }

    if (!comment.trim() || rating < 1 || rating > 5) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đầy đủ thông tin đánh giá",
        severity: "warning",
      });
      return;
    }

    try {
      await submitReview({ rating, comment });
      setShowForm(false);
      setComment("");
      setRating(5);
      setSnackbar({
        open: true,
        message: "Đánh giá của bạn đã được gửi và đang chờ kiểm duyệt!",
        severity: "success",
      });
    } catch (err) {
      // Hiển thị thông báo chi tiết từ backend nếu có
      const errorMsg =
        err?.response?.data?.message || err?.message || "Gửi đánh giá thất bại";
      setSnackbar({ open: true, message: errorMsg, severity: "error" });
    }
  };

  // Check if user has reviewed, considering both general reviews and their specific review
  const hasReviewed =
    safeReviews.some((r) => r.userId === Number(currentUserId)) || !!userReview;

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    safeReviews.forEach((review) => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });
    return distribution;
  };

  const ratingDistribution = getRatingDistribution();
  const totalReviews = safeReviews.length;

  // Tech-style Review Section
  return (
    <Box
      sx={{
        bgcolor: "#ffffff",
        borderRadius: 2,
        border: "2px solid #000000",
        background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
        overflow: "hidden",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background:
            "linear-gradient(90deg, #000000 0%, #333333 50%, #000000 100%)",
          zIndex: 1,
        },
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.12)",
        },
        transition: "all 0.3s ease",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          p: 4,
          background: "linear-gradient(135deg, #000000 0%, #1a1a1a 100%)",
          color: "#ffffff",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, #ffffff 50%, transparent 100%)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Box
            sx={{
              width: 6,
              height: 40,
              bgcolor: "#ffffff",
              borderRadius: 1,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontFamily: "'Roboto Mono', monospace",
              textTransform: "uppercase",
              letterSpacing: "2px",
              color: "#ffffff",
            }}
          >
            # Reviews & Ratings
          </Typography>
          <Box
            sx={{
              bgcolor: "rgba(255,255,255,0.1)",
              borderRadius: 2,
              px: 2,
              py: 1,
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Roboto Mono', monospace",
                fontWeight: "bold",
              }}
            >
              {totalReviews} Reviews
            </Typography>
          </Box>
        </Box>

        {/* Rating Statistics */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 900,
                fontFamily: "'Roboto Mono', monospace",
                color: "#ffffff",
              }}
            >
              {safeAverageRating.toFixed(1)}
            </Typography>
            <Box>
              <Rating
                value={safeAverageRating}
                precision={0.1}
                readOnly
                size="large"
                sx={{
                  color: "#ffffff",
                  "& .MuiRating-iconFilled": {
                    color: "#ffffff",
                  },
                  "& .MuiRating-iconEmpty": {
                    color: "rgba(255,255,255,0.3)",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.8)",
                  fontFamily: "'Roboto Mono', monospace",
                  mt: 0.5,
                }}
              >
                Based on {totalReviews} reviews
              </Typography>
            </Box>
          </Box>

          {/* Rating Distribution */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            {[5, 4, 3, 2, 1].map((star) => (
              <Box
                key={star}
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 60,
                    fontFamily: "'Roboto Mono', monospace",
                    color: "#ffffff",
                  }}
                >
                  {star} Stars
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={
                    totalReviews > 0
                      ? (ratingDistribution[star] / totalReviews) * 100
                      : 0
                  }
                  sx={{
                    flex: 1,
                    height: 8,
                    borderRadius: 1,
                    bgcolor: "rgba(255,255,255,0.2)",
                    "& .MuiLinearProgress-bar": {
                      bgcolor: "#ffffff",
                      borderRadius: 1,
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    minWidth: 30,
                    fontFamily: "'Roboto Mono', monospace",
                    color: "#ffffff",
                  }}
                >
                  {ratingDistribution[star]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Review Form Section */}
      {!hasReviewed && token && (
        <Box sx={{ p: 4, borderBottom: "1px solid #e0e0e0" }}>
          <Button
            onClick={() => setShowForm(!showForm)}
            variant="outlined"
            startIcon={<RateReview />}
            sx={{
              borderColor: "#000000",
              color: "#000000",
              borderWidth: 2,
              fontFamily: "'Roboto Mono', monospace",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              "&:hover": {
                borderWidth: 2,
                borderColor: "#000000",
                bgcolor: "rgba(0, 0, 0, 0.05)",
              },
            }}
          >
            {showForm ? "Cancel Review" : "Write a Review"}
          </Button>

          <Fade in={showForm}>
            <Box sx={{ mt: 3, display: showForm ? "block" : "none" }}>
              <Paper
                sx={{
                  p: 3,
                  border: "2px solid #000000",
                  borderRadius: 2,
                  background:
                    "linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 2,
                    fontFamily: "'Roboto Mono', monospace",
                    fontWeight: "bold",
                    color: "#000000",
                  }}
                >
                  Share Your Experience
                </Typography>
                <Box component="form" onSubmit={handleSubmitReview}>
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 1,
                        fontFamily: "'Roboto Mono', monospace",
                        fontWeight: "bold",
                        color: "#000000",
                      }}
                    >
                      Rating:
                    </Typography>
                    <Rating
                      value={rating}
                      onChange={(event, newValue) => setRating(newValue)}
                      size="large"
                      sx={{
                        color: "#000000",
                        "& .MuiRating-iconFilled": {
                          color: "#000000",
                        },
                      }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Write your review here..."
                    variant="outlined"
                    sx={{
                      mb: 3,
                      "& .MuiOutlinedInput-root": {
                        borderColor: "#000000",
                        "&:hover fieldset": {
                          borderColor: "#000000",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#000000",
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<Send />}
                    sx={{
                      bgcolor: "#000000",
                      color: "#ffffff",
                      fontFamily: "'Roboto Mono', monospace",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      "&:hover": {
                        bgcolor: "#333333",
                      },
                    }}
                  >
                    Submit Review
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Fade>
        </Box>
      )}

      {/* Reviews List */}
      <Box sx={{ p: 4 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress sx={{ color: "#000000" }} />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : safeReviews.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              border: "2px dashed #e0e0e0",
              borderRadius: 2,
            }}
          >
            <RateReview sx={{ fontSize: 48, color: "#cccccc", mb: 2 }} />
            <Typography
              variant="h6"
              sx={{
                color: "#666666",
                fontFamily: "'Roboto Mono', monospace",
              }}
            >
              No reviews yet. Be the first to review!
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {safeReviews.map((review, index) => (
              <Card
                key={review.id || index}
                sx={{
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  background:
                    "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
                  "&:hover": {
                    borderColor: "#000000",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{ display: "flex", alignItems: "flex-start", gap: 3 }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: "#000000",
                        color: "#ffffff",
                        width: 50,
                        height: 50,
                        fontFamily: "'Roboto Mono', monospace",
                        fontWeight: "bold",
                      }}
                    >
                      {review.userName?.charAt(0)?.toUpperCase() || "U"}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 1,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{
                            fontFamily: "'Roboto Mono', monospace",
                            fontWeight: "bold",
                            color: "#000000",
                          }}
                        >
                          {review.userName || "Anonymous User"}
                        </Typography>
                        <Chip
                          icon={<CheckCircle />}
                          label="Verified"
                          size="small"
                          sx={{
                            bgcolor: "#000000",
                            color: "#ffffff",
                            fontFamily: "'Roboto Mono', monospace",
                            fontSize: "0.75rem",
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Rating
                          value={review.rating}
                          readOnly
                          size="small"
                          sx={{
                            color: "#000000",
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#666666",
                            fontFamily: "'Roboto Mono', monospace",
                          }}
                        >
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body1"
                        sx={{
                          color: "#333333",
                          lineHeight: 1.6,
                          fontFamily: "'Roboto', sans-serif",
                        }}
                      >
                        {review.comment}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Box>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductReviews;
