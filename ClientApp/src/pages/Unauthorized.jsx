import { useNavigate } from 'react-router-dom';
import { 
  Container,
  Typography,
  Paper,
  Box,
  Button,
  Divider
} from '@mui/material';
import { 
  Lock as LockIcon,
  Home as HomeIcon
} from '@mui/icons-material';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <LockIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom color="error">
          Truy Cập Bị Từ Chối
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi.
        </Typography>
        
        <Divider sx={{ my: 3 }} />
        
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={handleGoHome}
        >
          Quay Về Trang Chủ
        </Button>
      </Paper>
    </Container>
  );
};

export default Unauthorized;