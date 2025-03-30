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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { Star, Discount, EmojiEvents } from '@mui/icons-material';

const LoyaltyProgram = () => {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [voucherInfo, setVoucherInfo] = useState(null);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    const fetchLoyaltyData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please login to view your loyalty status');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setLoyaltyData(response.data);
      } catch (err) {
        console.error('Error fetching loyalty data:', err);
        setError('Failed to load loyalty data');
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyData();
  }, []);

  const handleClaimVoucher = async () => {
    try {
      setClaiming(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/claim-voucher`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setVoucherInfo(response.data);
      setOpenDialog(true);
      
      // Refresh loyalty data after claiming
      const updatedResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoyaltyData(updatedResponse.data);
    } catch (err) {
      console.error('Error claiming voucher:', err);
      setError('Failed to claim voucher');
    } finally {
      setClaiming(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 'VIP 1':
        return <Star color="primary" />;
      case 'VIP 2':
        return <Star color="secondary" />;
      case 'VIP 3':
        return <Star color="warning" />;
      case 'VIP 4':
        return <Star color="success" />;
      default:
        return <Star />;
    }
  };

  const getProgressValue = (currentPoints, rank) => {
    switch (rank) {
      case 'VIP 1':
        return (currentPoints / 50000) * 100;
      case 'VIP 2':
        return (currentPoints / 125000) * 100;
      case 'VIP 3':
        return (currentPoints / 225000) * 100;
      case 'VIP 4':
        return (currentPoints / 350000) * 100;
      default:
        return 100;
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
      <Typography variant="h4" gutterBottom align="center" sx={{ mb: 4 }}>
        <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1 }} />
        Chương trình Khách hàng thân thiết
      </Typography>

      {loyaltyData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={3} display="flex" justifyContent="center">
                <Avatar sx={{ width: 100, height: 100, bgcolor: 'primary.main' }}>
                  {getRankIcon(loyaltyData.CurrentRank)}
                </Avatar>
              </Grid>
              <Grid item xs={12} md={9}>
                <Typography variant="h5" component="div">
                  Rank hiện tại: <Chip label={loyaltyData.CurrentRank} color="primary" />
                </Typography>
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Điểm tích lũy: {loyaltyData.CurrentPoints.toLocaleString()}
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Điểm cần để lên rank tiếp theo: {loyaltyData.PointsNeededForNextRank.toLocaleString()}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={getProgressValue(loyaltyData.CurrentPoints, loyaltyData.CurrentRank)}
                    sx={{ height: 10, borderRadius: 5, mt: 1 }}
                  />
                </Box>
                {loyaltyData.CanClaimVoucher && (
                  <Box sx={{ mt: 3 }}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<Discount />}
                      onClick={handleClaimVoucher}
                      disabled={claiming}
                    >
                      {claiming ? 'Đang xử lý...' : 'Nhận Voucher ' + loyaltyData.VoucherValue.toLocaleString() + '₫'}
                    </Button>
                  </Box>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
        Các mức rank và quyền lợi
      </Typography>
      <Grid container spacing={2}>
        {[
          { rank: 'VIP 1', points: '50,000', voucher: '100,000₫', color: 'primary' },
          { rank: 'VIP 2', points: '125,000', voucher: '200,000₫', color: 'secondary' },
          { rank: 'VIP 3', points: '225,000', voucher: '350,000₫', color: 'warning' },
          { rank: 'VIP 4', points: '350,000', voucher: '500,000₫', color: 'success' }
        ].map((tier) => (
          <Grid item xs={12} sm={6} md={3} key={tier.rank}>
            <Card sx={{ height: '100%', border: loyaltyData?.CurrentRank === tier.rank ? `2px solid ${tier.color}` : '' }}>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <Star color={tier.color} sx={{ mr: 1 }} />
                  <Typography variant="h6">{tier.rank}</Typography>
                </Box>
                <Typography variant="body2">Điểm yêu cầu: {tier.points}</Typography>
                <Typography variant="body2">Voucher thưởng: {tier.voucher}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Chúc mừng!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn đã nhận thành công voucher trị giá {voucherInfo?.DiscountAmount.toLocaleString()}₫
          </DialogContentText>
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" align="center">
              {voucherInfo?.VoucherCode}
            </Typography>
            <Typography variant="body2" align="center">
              HSD: {new Date(voucherInfo?.ExpiryDate).toLocaleDateString('vi-VN')}
            </Typography>
          </Box>
          <DialogContentText sx={{ mt: 2 }}>
            Voucher đã được tự động thêm vào tài khoản của bạn. Bạn có thể sử dụng khi thanh toán.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoyaltyProgram;