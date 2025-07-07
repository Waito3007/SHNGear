import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Admin/common/Header";
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Alert, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Button, 
  Chip, 
  Rating, 
  Grid, 
  Card, 
  CardContent,
  Snackbar,
  LinearProgress,
  TextField, // Added for filter inputs
  FormControl, // Added for select/checkbox filters
  InputLabel, // Added for select labels
  Select, // Added for dropdown filters
  MenuItem, // Added for select options
  FormGroup, // Added for checkbox group
  FormControlLabel, // Added for checkbox labels
  Checkbox // Added for boolean filters
} from "@mui/material";
import { 
  CheckCircleOutline, 
  HighlightOff, 
  Star, 
  RateReview, 
  PendingActions, 
  DoneAll,
  FilterList // Added for filter icon
} from "@mui/icons-material";
import { 
  useAllReviews, 
  useReviewAnalytics, 
  useReviewModeration 
} from "@/hooks/api/useReviews";

const ReviewManagementPage = () => {
  // Filter states
  const [filters, setFilters] = useState({
    isApproved: null,
    minRating: null,
    maxRating: null,
    productId: null,
    userId: null,
    searchComment: "",
  });

  const { allReviews, loading: reviewsLoading, error: reviewsError, refetchAllReviews } = useAllReviews(filters);
  const { analytics, loading: analyticsLoading, error: analyticsError, refetchAnalytics } = useReviewAnalytics();
  const { approveReview, rejectReview, loading: moderationLoading } = useReviewModeration();
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const handleFilterChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? (checked ? true : false) : value === '' ? null : value,
    }));
  };

  const handleApprove = async (reviewId) => {
    const success = await approveReview(reviewId);
    if (success) {
      setSnackbar({ open: true, message: "Đánh giá đã được duyệt!", severity: "success" });
      refetchAllReviews();
      refetchAnalytics();
    } else {
      setSnackbar({ open: true, message: "Duyệt đánh giá thất bại.", severity: "error" });
    }
  };

  const handleReject = async (reviewId) => {
    const success = await rejectReview(reviewId);
    if (success) {
      setSnackbar({ open: true, message: "Đánh giá đã bị từ chối!", severity: "success" });
      refetchAllReviews();
      refetchAnalytics();
    } else {
      setSnackbar({ open: true, message: "Từ chối đánh giá thất bại.", severity: "error" });
    }
  };

  if (reviewsLoading || analyticsLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: '#1a202c' }}>
        <CircularProgress sx={{ color: '#63b3ed' }} />
      </Box>
    );
  }

  if (reviewsError || analyticsError) {
    return (
      <Alert severity="error" sx={{ m: 2, bgcolor: '#2d3748', color: '#e2e8f0', '& .MuiAlert-icon': { color: '#f56565' } }}>
        Lỗi khi tải dữ liệu: {reviewsError?.message || analyticsError?.message}
      </Alert>
    );
  }

  const safeAllReviews = Array.isArray(allReviews) ? allReviews : [];
  const safeAnalytics = analytics || {};
  const ratingDistribution = safeAnalytics.ratingDistribution || [];

  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#1a202c', minHeight: '100vh', color: '#e2e8f0' }}>
      <Header title="Quản lý Đánh giá Sản phẩm" />

      <Box component="main" sx={{ maxWidth: '7xl', mx: 'auto', py: 6, px: { xs: 2, lg: 8 } }}>
        {/* Analytics Section */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <RateReview color="primary" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold' }}>Tổng số đánh giá</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#63b3ed' }}>
                  {safeAnalytics.totalReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <DoneAll color="success" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6" color="success" sx={{ fontWeight: 'bold' }}>Đánh giá đã duyệt</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#48bb78' }}>
                  {safeAnalytics.approvedReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PendingActions color="warning" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6" color="warning" sx={{ fontWeight: 'bold' }}>Đánh giá chờ duyệt</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ecc94b' }}>
                  {safeAnalytics.pendingReviews}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Star color="action" sx={{ fontSize: 30, mr: 1 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 'bold' }}>Điểm trung bình</Typography>
                </Box>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#ecc94b' }}>
                  {safeAnalytics.averageRating?.toFixed(2) || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card elevation={0} sx={{ borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Phân bố điểm</Typography>
                {ratingDistribution.length > 0 ? (
                  ratingDistribution.map((dist) => (
                    <Box key={dist.rating} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                      <Typography sx={{ minWidth: 20, color: '#e2e8f0' }}>{dist.rating}</Typography>
                      <Star sx={{ color: '#ecc94b', fontSize: 16, mx: 0.5 }} />
                      <LinearProgress 
                        variant="determinate" 
                        value={safeAnalytics.totalReviews > 0 ? (dist.count / safeAnalytics.totalReviews) * 100 : 0}
                        sx={{ 
                          flexGrow: 1, 
                          mx: 1, 
                          height: 8, 
                          borderRadius: 4,
                          bgcolor: '#4a5568',
                          '& .MuiLinearProgress-bar': { bgcolor: '#ecc94b' }
                        }} 
                      />
                      <Typography sx={{ minWidth: 30, fontSize: '0.875rem', color: 'text.secondary' }}>
                        {dist.count}
                      </Typography>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">Không có dữ liệu phân bố điểm.</Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: '#2d3748', color: '#e2e8f0' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, color: '#e2e8f0' }}>
              <FilterList sx={{ mr: 1 }} /> Bộ lọc
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: '#a0aec0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5568' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#63b3ed' }, '& .MuiSvgIcon-root': { color: '#e2e8f0' } }}>
                  <InputLabel>Trạng thái duyệt</InputLabel>
                  <Select
                    name="isApproved"
                    value={filters.isApproved === null ? '' : filters.isApproved}
                    label="Trạng thái duyệt"
                    onChange={handleFilterChange}
                    sx={{ color: '#e2e8f0', bgcolor: '#4a5568' }}
                  >
                    <MenuItem value="" sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>Tất cả</MenuItem>
                    <MenuItem value={true} sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>Đã duyệt</MenuItem>
                    <MenuItem value={false} sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>Chờ duyệt</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: '#a0aec0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5568' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#63b3ed' }, '& .MuiSvgIcon-root': { color: '#e2e8f0' } }}>
                  <InputLabel>Điểm tối thiểu</InputLabel>
                  <Select
                    name="minRating"
                    value={filters.minRating === null ? '' : filters.minRating}
                    label="Điểm tối thiểu"
                    onChange={handleFilterChange}
                    sx={{ color: '#e2e8f0', bgcolor: '#4a5568' }}
                  >
                    <MenuItem value="" sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>Tất cả</MenuItem>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <MenuItem key={rating} value={rating} sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>{rating} Sao</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small" sx={{ '& .MuiInputLabel-root': { color: '#a0aec0' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4a5568' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#63b3ed' }, '& .MuiSvgIcon-root': { color: '#e2e8f0' } }}>
                  <InputLabel>Điểm tối đa</InputLabel>
                  <Select
                    name="maxRating"
                    value={filters.maxRating === null ? '' : filters.maxRating}
                    label="Điểm tối đa"
                    onChange={handleFilterChange}
                    sx={{ color: '#e2e8f0', bgcolor: '#4a5568' }}
                  >
                    <MenuItem value="" sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>Tất cả</MenuItem>
                    {[1, 2, 3, 4, 5].map(rating => (
                      <MenuItem key={rating} value={rating} sx={{ bgcolor: '#2d3748', color: '#e2e8f0' }}>{rating} Sao</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="ID Sản phẩm"
                  name="productId"
                  value={filters.productId || ''}
                  onChange={handleFilterChange}
                  type="number"
                  InputLabelProps={{ style: { color: '#a0aec0' } }}
                  InputProps={{ style: { color: '#e2e8f0' }, sx: { '& fieldset': { borderColor: '#4a5568' }, '&:hover fieldset': { borderColor: '#63b3ed' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  size="small"
                  label="ID Người dùng"
                  name="userId"
                  value={filters.userId || ''}
                  onChange={handleFilterChange}
                  type="number"
                  InputLabelProps={{ style: { color: '#a0aec0' } }}
                  InputProps={{ style: { color: '#e2e8f0' }, sx: { '& fieldset': { borderColor: '#4a5568' }, '&:hover fieldset': { borderColor: '#63b3ed' } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  fullWidth
                  size="small"
                  label="Tìm kiếm bình luận"
                  name="searchComment"
                  value={filters.searchComment}
                  onChange={handleFilterChange}
                  InputLabelProps={{ style: { color: '#a0aec0' } }}
                  InputProps={{ style: { color: '#e2e8f0' }, sx: { '& fieldset': { borderColor: '#4a5568' }, '&:hover fieldset': { borderColor: '#63b3ed' } } }}
                />
              </Grid>
            </Grid>
          </Paper>
        </motion.div>

        {/* Reviews Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          <Paper elevation={0} sx={{ borderRadius: 2, overflow: 'hidden', bgcolor: '#2d3748' }}>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: '#4a5568' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Sản phẩm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Điểm</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Bình luận</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Ngày tạo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#e2e8f0' }}>Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {safeAllReviews.length > 0 ? (
                    safeAllReviews.map((review) => (
                      <TableRow key={review.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#2d3748' }, '&:nth-of-type(even)': { bgcolor: '#1a202c' } }}>
                        <TableCell sx={{ color: '#e2e8f0' }}>{review.id}</TableCell>
                        <TableCell sx={{ color: '#e2e8f0' }}>{review.productName || review.productId}</TableCell> {/* Display product name or ID as fallback */}
                        <TableCell sx={{ color: '#e2e8f0' }}>{review.userName}</TableCell>
                        <TableCell><Rating value={review.rating} readOnly size="small" sx={{ color: '#ecc94b' }} /></TableCell>
                        <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#e2e8f0' }}>{review.comment}</TableCell>
                        <TableCell sx={{ color: '#e2e8f0' }}>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>
                          <Chip
                            label={review.isApproved ? "Đã duyệt" : "Chờ duyệt"}
                            color={review.isApproved ? "success" : "warning"}
                            size="small"
                            icon={review.isApproved ? <CheckCircleOutline /> : <PendingActions />}
                          />
                        </TableCell>
                        <TableCell>
                          {!review.isApproved && (
                            <Button 
                              variant="contained" 
                              color="success" 
                              size="small" 
                              onClick={() => handleApprove(review.id)} 
                              disabled={moderationLoading}
                              startIcon={<CheckCircleOutline />}
                              sx={{ mr: 1 }}
                            >
                              Duyệt
                            </Button>
                          )}
                          {review.isApproved && (
                            <Button 
                              variant="outlined" 
                              color="warning" 
                              size="small" 
                              onClick={() => handleReject(review.id)} 
                              disabled={moderationLoading}
                              startIcon={<HighlightOff />}
                            >
                              Từ chối
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4, color: '#e2e8f0' }}>
                        Không có đánh giá nào để hiển thị.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </motion.div>

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
    </Box>
  );
};

export default ReviewManagementPage;
