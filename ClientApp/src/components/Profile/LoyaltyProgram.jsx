import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { Star, Casino, EmojiEvents } from '@mui/icons-material';

const LoyaltyProgram = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [spinResult, setSpinResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Vui lòng đăng nhập để xem trạng thái thành viên');
          return;
        }

        const decoded = jwtDecode(token);
        const id = parseInt(decoded.sub, 10);
        if (!Number.isInteger(id)) {
          setError('Token không hợp lệ');
          return;
        }
        setUserId(id);

        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          setError('Token đã hết hạn, vui lòng đăng nhập lại');
          return;
        }

        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status?userId=${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        console.log('Loyalty Data:', response.data); // Debug response
        setLoyaltyData(response.data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu thành viên:', err);
        setError('Không thể tải thông tin chương trình khách hàng thân thiết');
        showSnackbar('Không thể tải thông tin thành viên', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  const handleSpinWheel = async () => {
    try {
      setSpinning(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/spin-wheel?userId=${userId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Spin Result:', response.data); // Debug spin result
      setSpinResult(response.data);
      setOpenDialog(true);
      showSnackbar('Quay thành công!', 'success');

      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoyaltyData(updatedResponse.data);
    } catch (err) {
      console.error('Lỗi khi quay vòng quay:', err);
      setError('Không thể quay vòng quay may mắn');
      showSnackbar(err.response?.data || 'Không thể quay vòng quay', 'error');
    } finally {
      setSpinning(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'Admin':
        return <Star color="error" sx={{ fontSize: 40 }} />;
      case 'VIP 1':
        return <Star color="primary" sx={{ fontSize: 40 }} />;
      case 'VIP 2':
        return <Star color="secondary" sx={{ fontSize: 40 }} />;
      case 'VIP 3':
        return <Star color="warning" sx={{ fontSize: 40 }} />;
      default:
        return <Star sx={{ fontSize: 40 }} />;
    }
  };

  const getProgressValue = (currentPoints, rank) => {
    switch (rank) {
      case 'Admin':
        return 100;
      case 'VIP 1':
        return (currentPoints / 50000) * 100;
      case 'VIP 2':
        return (currentPoints / 125000) * 100;
      case 'VIP 3':
        return (currentPoints / 225000) * 100;
      default:
        return (currentPoints / 50000) * 100;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: '800px', margin: '2rem auto', padding: '0 1rem' }}>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1 }} />
        Chương trình Khách hàng thân thiết
      </Typography>
      {loyaltyData && (
        <Card sx={{ mb: 4, boxShadow: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3} display="flex" justifyContent="center">
                <Avatar sx={{ 
                  width: 120, 
                  height: 120, 
                  bgcolor: 'background.paper',
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}>
                  {getRankIcon(loyaltyData.currentRank)}
                </Avatar>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="h5" component="div" sx={{ mb: 1 }}>
                  Hạng hiện tại: <strong>{loyaltyData.currentRank}</strong>
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Điểm tích lũy: <strong>{loyaltyData.currentPoints.toLocaleString()}</strong>
                </Typography>
                {loyaltyData.currentRank !== "Admin" && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Cần thêm <strong>
                        {(loyaltyData.pointsNeededForNextRank || 0).toLocaleString()}
                      </strong> điểm để lên hạng tiếp theo
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={getProgressValue(loyaltyData.currentPoints, loyaltyData.currentRank)}
                      sx={{ 
                        height: 10, 
                        borderRadius: 5, 
                        mt: 1,
                        backgroundColor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 5,
                        }
                      }}
                    />
                  </Box>
                )}
                <Box sx={{ mt: 3 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    startIcon={<Casino />}
                    onClick={handleSpinWheel}
                    disabled={spinning || !loyaltyData.canSpin}
                    sx={{
                      fontWeight: 'bold',
                      boxShadow: 2,
                      '&:hover': { boxShadow: 4 }
                    }}
                  >
                    {spinning ? (
                      <>
                        <CircularProgress size={24} sx={{ mr: 1 }} />
                        Đang quay...
                      </>
                    ) : (
                      `Quay vòng quay (${(loyaltyData.spinCost || 0).toLocaleString()} điểm)`
                    )}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle sx={{ bgcolor: 'primary.light', color: 'white' }}>
          Kết quả vòng quay
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText>
            {spinResult?.prizeType === "Voucher" ? (
              `Chúc mừng! Bạn đã nhận được voucher trị giá <strong>${(spinResult.voucher?.discountAmount || 0).toLocaleString()}₫</strong>`
            ) : (
              "Rất tiếc! Bạn không trúng phần thưởng lần này."
            )}
          </DialogContentText>
          {spinResult?.prizeType === "Voucher" && (
            <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.100', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                {spinResult.voucher?.code || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Hạn sử dụng: {spinResult.voucher?.expiryDate ? new Date(spinResult.voucher.expiryDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Typography>
            </Box>
          )}
          <DialogContentText sx={{ mt: 2 }}>
            Điểm còn lại: <strong>{(spinResult?.remainingPoints || 0).toLocaleString()}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: 'primary.main' }}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyProgram;