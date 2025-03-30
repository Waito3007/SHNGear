import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            p: 4,
            borderRadius: 2,
            boxShadow: 3,
            backgroundColor: 'background.paper',
          }}
        >
          {/* Icon thành công */}
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5 }}
          >
            <CheckCircleOutlineIcon
              sx={{ fontSize: 80, color: 'success.main', mb: 2 }}
            />
          </motion.div>

          {/* Tiêu đề */}
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Thanh toán thành công!
          </Typography>

          {/* Thông báo */}
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xác nhận và sẽ được xử lý trong thời gian sớm nhất.
          </Typography>

          {/* Chi tiết đơn hàng giả lập */}
          <Box
            sx={{
              width: '100%',
              p: 2,
              mb: 3,
              borderRadius: 1,
              backgroundColor: 'grey.100',
              textAlign: 'left',
            }}
          >
          </Box>

          {/* Nút hành động */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/')}
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 2,
                fontWeight: 'bold',
                textTransform: 'none',
              }}
            >
              Quay về trang chủ
            </Button>
          </motion.div>

          {/* Thông báo phụ */}
          {/* <Typography variant="caption" color="text.secondary" sx={{ mt: 3 }}>
            Bạn sẽ nhận được email xác nhận đơn hàng trong ít phút.
          </Typography> */}
        </Box>
      </motion.div>
    </Container>
  );
};

export default PaymentSuccess;