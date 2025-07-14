import React, { memo, useCallback } from "react";
import {
  Box,
  Typography,
  LinearProgress,
  Rating,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  Star,
  BarChart,
  Assessment,
  RateReview,
  Timeline,
} from "@mui/icons-material";
import { useProductRatingStats } from "@/hooks/api/useReviews";

// Error Boundary component
class RatingDistributionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RatingDistribution Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể tải thống kê đánh giá. Vui lòng thử lại sau.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            {this.state.error?.message || "Đã xảy ra lỗi không xác định"}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

const RatingDistributionCore = memo(({ productId }) => {
  const { distribution, stats, computed, loading, error, refetch } = useProductRatingStats(productId);

  // Memoized retry handler
  const handleRetry = useCallback(() => {
    refetch();
  }, [refetch]);

  // Early returns for different states
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={4}>
        <CircularProgress size={40} thickness={4} />
        <Typography variant="body1" sx={{ ml: 2, color: "#666" }}>
          Đang tải thống kê đánh giá...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        action={
          <button 
            onClick={handleRetry}
            style={{
              background: 'none',
              border: '1px solid currentColor',
              color: 'inherit',
              padding: '4px 8px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Thử lại
          </button>
        }
        sx={{ 
          m: 3,
          borderRadius: 2,
          "& .MuiAlert-icon": {
            fontSize: "1.5rem"
          }
        }}
      >
        {error}
      </Alert>
    );
  }

  if (!distribution || !stats || !distribution.TotalReviews) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <RateReview sx={{ fontSize: 60, color: "#ddd", mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Chưa có đánh giá nào
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Hãy là người đầu tiên đánh giá sản phẩm này
        </Typography>
      </Box>
    );
  }

  // Safe data extraction with fallbacks
  const formatPercentage = (percentage) => {
    const num = Number(percentage);
    return isNaN(num) ? "0.0%" : `${num.toFixed(1)}%`;
  };

  const averageRating = computed?.averageRatingFormatted || Number(distribution.AverageRating || 0).toFixed(1);
  const totalReviews = computed?.totalReviews || distribution.TotalReviews || 0;
  const satisfactionRate = computed?.satisfactionRate || 0;
  
  // Safe rating distribution with defaults
  const safeRatingDistribution = distribution.RatingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const safeRatingPercentage = distribution.RatingPercentage || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return (
    <Box sx={{ p: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight="bold" 
          gutterBottom
          sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: 1.5,
            color: "#000000",
            fontFamily: "'Roboto Mono', monospace",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            "&::before": {
              content: '"# "',
              color: "#000000",
              fontWeight: 900,
            },
          }}
        >
          <BarChart sx={{ fontSize: 28 }} />
          Thống kê đánh giá
        </Typography>
        <Divider sx={{ 
          width: "80px", 
          height: "3px", 
          bgcolor: "#000000",
          border: "none",
          borderRadius: 1
        }} />
      </Box>

      <Grid container spacing={4}>
        {/* Tổng quan */}
        <Grid item xs={12} lg={4}>
          <Card 
            elevation={0}
            sx={{ 
              height: "100%",
              border: "2px solid #e0e0e0",
              borderRadius: 3,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              willChange: "transform", // Hint for GPU acceleration
              "&:hover": {
                borderColor: "#000000",
                boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  color: "#000000"
                }}
              >
                <Assessment />
                Tổng quan
              </Typography>
              
              <Box sx={{ 
                display: "flex", 
                flexDirection: "column",
                alignItems: "center", 
                textAlign: "center",
                py: 2
              }}>
                <Typography variant="h2" fontWeight="bold" sx={{ 
                  color: "#000000",
                  fontSize: "3.5rem",
                  lineHeight: 1
                }}>
                  {averageRating}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  trên 5 sao
                </Typography>
                
                <Rating 
                  value={parseFloat(averageRating)} 
                  readOnly 
                  precision={0.1}
                  size="large"
                  sx={{ 
                    fontSize: "2rem",
                    my: 1
                  }}
                />
                
                <Typography variant="body1" color="text.secondary">
                  Dựa trên {totalReviews} đánh giá
                </Typography>
                
                {/* Thêm satisfaction rate */}
                <Box sx={{ mt: 2, p: 1, backgroundColor: "#f0f8ff", borderRadius: 1 }}>
                  <Typography variant="body2" color="primary" fontWeight="medium">
                    {satisfactionRate}% khách hàng hài lòng (4-5 sao)
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Thống kê hoạt động */}
              <Box>
                <Typography 
                  variant="subtitle2" 
                  color="text.secondary" 
                  gutterBottom
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 0.5,
                    mb: 1.5
                  }}
                >
                  <Timeline sx={{ fontSize: 18 }} />
                  Hoạt động gần đây
                </Typography>
                <Grid container spacing={1}>
                  <Grid item xs={6}>
                    <Chip 
                      label={`7 ngày: ${stats.RecentActivity.Last7Days}`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ width: "100%", fontWeight: 500 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Chip 
                      label={`30 ngày: ${stats.RecentActivity.Last30Days}`}
                      size="small"
                      color="info"
                      variant="outlined"
                      sx={{ width: "100%", fontWeight: 500 }}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ mt: 1 }}>
                    <Chip 
                      label={`${stats.PendingReviews} đánh giá chờ duyệt`}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ width: "100%", fontWeight: 500 }}
                    />
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Phân bố chi tiết */}
        <Grid item xs={12} lg={8}>
          <Card 
            elevation={0}
            sx={{ 
              height: "100%",
              border: "2px solid #e0e0e0",
              borderRadius: 3,
              transition: "border-color 0.3s ease, box-shadow 0.3s ease",
              willChange: "transform",
              "&:hover": {
                borderColor: "#000000",
                boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
              }
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography 
                variant="h6" 
                fontWeight="bold" 
                gutterBottom
                sx={{ 
                  display: "flex", 
                  alignItems: "center", 
                  gap: 1,
                  color: "#000000",
                  mb: 3
                }}
              >
                <Star sx={{ color: "#FFD700" }} />
                Phân bố đánh giá
              </Typography>
              
              {[5, 4, 3, 2, 1].map((stars) => (
                <Box key={stars} sx={{ mb: 3 }}>
                  <Box sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "space-between",
                    mb: 1
                  }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography variant="body1" fontWeight="medium" sx={{ minWidth: 20 }}>
                        {stars}
                      </Typography>
                      <Star sx={{ fontSize: 18, color: "#FFD700" }} />
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                      <Typography variant="body1" fontWeight="medium">
                        {safeRatingDistribution[stars] || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({formatPercentage(safeRatingPercentage[stars] || 0)})
                      </Typography>
                    </Box>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, safeRatingPercentage[stars] || 0))}
                    sx={{
                      height: 12,
                      borderRadius: 6,
                      backgroundColor: "#f5f5f5",
                      willChange: "auto",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor: 
                          stars === 5 ? "#4CAF50" :
                          stars === 4 ? "#8BC34A" :
                          stars === 3 ? "#FFC107" :
                          stars === 2 ? "#FF9800" : "#F44336",
                        borderRadius: 6,
                        transition: "transform 0.4s ease-out",
                      },
                    }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Đánh giá gần đây */}
        {stats.LatestReviews && Array.isArray(stats.LatestReviews) && stats.LatestReviews.length > 0 && (
          <Grid item xs={12}>
            <Card 
              elevation={0}
              sx={{ 
                border: "2px solid #e0e0e0",
                borderRadius: 3,
                transition: "all 0.3s ease",
                "&:hover": {
                  borderColor: "#000000",
                  transform: "translateY(-4px)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.15)",
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: 1,
                    color: "#000000",
                    mb: 3
                  }}
                >
                  <RateReview />
                  Đánh giá gần đây
                </Typography>
                
                <Grid container spacing={2}>
                  {stats.LatestReviews.slice(0, 4).map((review, index) => (
                    <Grid item xs={12} md={6} key={review.Id || `review-${index}`}>
                      <Box 
                        sx={{ 
                          p: 3, 
                          backgroundColor: "#f8f9fa",
                          borderRadius: 2,
                          borderLeft: "4px solid #000000",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            backgroundColor: "#f0f0f0",
                            transform: "translateX(4px)",
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "space-between",
                          mb: 2 
                        }}>
                          <Rating value={Number(review.Rating) || 0} readOnly size="small" />
                          <Typography variant="caption" color="text.secondary">
                            {review.CreatedAt ? new Date(review.CreatedAt).toLocaleDateString("vi-VN") : "N/A"}
                          </Typography>
                        </Box>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            lineHeight: 1.6,
                            fontSize: "0.9rem"
                          }}
                        >
                          {review.Comment || "Không có bình luận"}
                        </Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
});

// Add display name for debugging
RatingDistributionCore.displayName = 'RatingDistributionCore';

// Main component với error boundary
const RatingDistribution = ({ productId }) => {
  return (
    <RatingDistributionErrorBoundary>
      <RatingDistributionCore productId={productId} />
    </RatingDistributionErrorBoundary>
  );
};

export default RatingDistribution;
