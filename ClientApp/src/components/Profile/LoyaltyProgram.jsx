import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  LinearProgress,
  Button,
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  IconButton,
} from '@mui/material';
import { Casino, EmojiEvents, Celebration, InfoOutlined } from '@mui/icons-material';

const SpinWheel = ({ onSpin, spinning, disabled, spinCost }) => {
  const [rotation, setRotation] = useState(0);

  const rewards = [
    'Giải nhất',
    'Giải nhì',
    'Giải ba',
    'Khuyến khích',
    'Giải May mắn',
    'Giải ba',
  ];

  const spinVariants = {
    idle: { rotate: 0 },
    spinning: {
      rotate: 360 * 5 + Math.random() * 360,
      transition: { duration: 3, ease: 'easeOut' },
    },
  };

  const handleSpin = () => {
    if (!spinning && !disabled) {
      setRotation((prev) => prev + 360 * 5 + Math.random() * 360);
      onSpin();
    }
  };

  return (
    <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <motion.div
        variants={spinVariants}
        animate={spinning ? 'spinning' : 'idle'}
        style={{
          width: 450,
          height: 450,
          borderRadius: '50%',
          background: 'conic-gradient(#ff4d4d, #ffeb3b, #4caf50, #2196f3, #9c27b0, #ff9800, #ff4d4d)',
          position: 'relative',
          border: '10px solid #fff',
          boxShadow: '0 0 25px rgba(0,0,0,0.5)',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            bgcolor: 'white',
            borderRadius: '50%',
            width: 100,
            height: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          }}
        >
          <Casino sx={{ fontSize: 60, color: '#1976d2' }} />
        </Box>

        {rewards.map((reward, index) => {
          const angle = (360 / rewards.length) * index;
          return (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                transform: `rotate(${angle}deg)`,
                pointerEvents: 'none',
              }}
            >
              <Typography
                sx={{
                  position: 'absolute',
                  top: '15%',
                  left: '50%',
                  transform: 'translateX(-50%) rotate(0deg)',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '20px',
                  textShadow: '2px 2px 5px rgba(0,0,0,0.6)',
                  whiteSpace: 'nowrap',
                }}
              >
                {reward}
              </Typography>
            </Box>
          );
        })}
      </motion.div>

      <Box
        sx={{
          position: 'absolute',
          top: -30,
          width: 50,
          height: 50,
          bgcolor: 'red',
          clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
          zIndex: 1,
          boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        }}
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSpin}
        disabled={spinning || disabled}
        sx={{
          mt: 4,
          fontWeight: 'bold',
          padding: '15px 40px',
          fontSize: '18px',
          borderRadius: '30px',
          boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
          '&:hover': { boxShadow: '0 8px 25px rgba(0,0,0,0.3)' },
        }}
      >
        {spinning ? (
          <>
            <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
            Đang quay...
          </>
        ) : (
          `Quay ngay (${spinCost.toLocaleString()} điểm)`
        )}
      </Button>
    </Box>
  );
};

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
    severity: 'success',
  });
  const [userId, setUserId] = useState(null);
  const [openRulesDialog, setOpenRulesDialog] = useState(false); // State cho modal thể lệ

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

        setLoyaltyData(response.data);
      } catch (err) {
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

      setSpinResult(response.data);
      setTimeout(() => {
        setOpenDialog(true);
        setSpinning(false);
        showSnackbar('Quay thành công!', 'success');
      }, 3000);

      const updatedResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/loyalty/my-status?userId=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLoyaltyData(updatedResponse.data);
    } catch (err) {
      setError('Không thể quay vòng quay may mắn');
      showSnackbar(err.response?.data || 'Không thể quay vòng quay', 'error');
      setSpinning(false);
    }
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
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
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
        <CircularProgress size={60} thickness={5} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography color="error" variant="h6">
            {error}
          </Typography>
          <Button variant="outlined" color="primary" sx={{ mt: 2 }} onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5', py: 4 }}>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ maxWidth: '1000px', margin: '0 auto', px: 2, position: 'relative' }}>
        {/* Nút dấu ! ở góc trên bên phải */}
        <IconButton
          onClick={() => setOpenRulesDialog(true)}
          sx={{
            position: 'absolute',
            top: 10,
            right: 10,
            color: '#1976d2',
            bgcolor: 'white',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            '&:hover': { bgcolor: '#e3f2fd' },
          }}
        >
          <InfoOutlined sx={{ fontSize: 30 }} />
        </IconButton>

        <Paper
          elevation={4}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #e3f2fd 100%)',
            mb: 4,
          }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              color: '#1976d2',
              textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <EmojiEvents sx={{ verticalAlign: 'middle', mr: 1, fontSize: 40 }} />
            Chương trình Khách hàng Thân thiết
          </Typography>

          {loyaltyData && (
            <Card sx={{ boxShadow: '0 8px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
              <CardContent>
                <Grid container spacing={4} alignItems="center">
                  <Grid item xs={12}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333', mb: 2, textAlign: 'center' }}>
                      Hạng hiện tại: <span style={{ color: '#1976d2' }}>{loyaltyData.currentRank}</span>
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#555', mb: 2, textAlign: 'center' }}>
                      Điểm tích lũy:{' '}
                      <span style={{ fontWeight: 'bold', color: '#4caf50' }}>
                        {loyaltyData.currentPoints.toLocaleString()}
                      </span>
                    </Typography>
                    {loyaltyData.currentRank !== 'Admin' && (
                      <Box sx={{ mb: 4, maxWidth: 600, mx: 'auto' }}>
                        <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center' }}>
                          Cần thêm{' '}
                          <strong style={{ color: '#ff9800' }}>
                            {(loyaltyData.pointsNeededForNextRank || 0).toLocaleString()}
                          </strong>{' '}
                          điểm để lên hạng tiếp theo
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={getProgressValue(loyaltyData.currentPoints, loyaltyData.currentRank)}
                          sx={{
                            height: 12,
                            borderRadius: 6,
                            mt: 1,
                            backgroundColor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 6,
                              background: 'linear-gradient(to right, #4caf50, #81c784)',
                            },
                          }}
                        />
                      </Box>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
                      <SpinWheel
                        onSpin={handleSpinWheel}
                        spinning={spinning}
                        disabled={!loyaltyData.canSpin}
                        spinCost={loyaltyData.spinCost || 0}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Paper>

        {/* Dialog kết quả vòng quay */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden' } }}
        >
          <DialogTitle
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Celebration sx={{ mr: 1 }} />
            Kết quả vòng quay
          </DialogTitle>
          <DialogContent sx={{ pt: 3, pb: 2 }}>
            <DialogContentText sx={{ fontSize: '1.1rem', color: '#333' }}>
              {spinResult?.prizeType === 'Voucher' ? (
                <>
                  Chúc mừng! Bạn đã nhận được voucher trị giá{' '}
                  <strong style={{ color: '#4caf50' }}>
                    {(spinResult.voucher?.discountAmount || 0).toLocaleString()}₫
                  </strong>
                </>
              ) : (
                'Rất tiếc! Bạn không trúng phần thưởng lần này.'
              )}
            </DialogContentText>
            {spinResult?.prizeType === 'Voucher' && (
              <Paper
                elevation={2}
                sx={{
                  mt: 2,
                  p: 2,
                  background: 'linear-gradient(to right, #e8f5e9, #c8e6c9)',
                  borderRadius: 2,
                  textAlign: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
                  {spinResult.voucher?.code || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 1, color: '#555' }}>
                  Hạn sử dụng:{' '}
                  {spinResult.voucher?.expiryDate
                    ? new Date(spinResult.voucher.expiryDate).toLocaleDateString('vi-VN')
                    : 'N/A'}
                </Typography>
              </Paper>
            )}
            <DialogContentText sx={{ mt: 2, fontSize: '1.1rem', color: '#333' }}>
              Điểm còn lại:{' '}
              <strong style={{ color: '#1976d2' }}>
                {(spinResult?.remainingPoints || 0).toLocaleString()}
              </strong>
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenDialog(false)}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 20, px: 4 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>

        {/* Dialog thể lệ */}
        <Dialog
          open={openRulesDialog}
          onClose={() => setOpenRulesDialog(false)}
          PaperProps={{ sx: { borderRadius: 3, overflow: 'hidden', minWidth: '500px' } }}
        >
          <DialogTitle
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              py: 2,
            }}
          >
            <InfoOutlined sx={{ mr: 1 }} />
            Thể lệ chương trình
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
              Quy định quay vòng quay may mắn
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - Mỗi lần quay sẽ tiêu tốn số điểm tương ứng với hạng thành viên:
            </Typography>
            <Typography variant="body2" sx={{ ml: 2 }}>
              • VIP 0: 5000 điểm<br />
              • VIP 1: 5000 điểm<br />
              • VIP 2: 5000 điểm<br />
              • VIP 3: 5000 điểm
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 3, mb: 2 }}>
              Phần thưởng theo hạng thành viên
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>VIP 0</strong>:<br />
              • 50% cơ hội nhận voucher 50,000₫<br />
              • 30% cơ hội nhận voucher 20,000₫<br />
              • 20% không nhận được gì
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>VIP 1</strong>:<br />
              • 40% cơ hội nhận voucher 100,000₫<br />
              • 30% cơ hội nhận voucher 50,000₫<br />
              • 30% cơ hội nhận voucher 20,000₫
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>VIP 2</strong>:<br />
              • 30% cơ hội nhận voucher 200,000₫<br />
              • 30% cơ hội nhận voucher 100,000₫<br />
              • 40% cơ hội nhận voucher 50,000₫
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              - <strong>VIP 3</strong>:<br />
              • 20% cơ hội nhận voucher 350,000₫<br />
              • 30% cơ hội nhận voucher 200,000₫<br />
              • 50% cơ hội nhận voucher 100,000₫
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, color: '#555' }}>
              Lưu ý: Voucher có hạn sử dụng 30 ngày kể từ ngày nhận.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setOpenRulesDialog(false)}
              variant="contained"
              color="primary"
              sx={{ borderRadius: 20, px: 4 }}
            >
              Đóng
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
};

export default LoyaltyProgram;