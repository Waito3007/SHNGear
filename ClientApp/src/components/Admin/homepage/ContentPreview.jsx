import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Chip,
  Avatar,
  Paper,
  styled,
  keyframes,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import { 
  X, 
  Eye, 
  Monitor, 
  Smartphone, 
  Star, 
  Play,
  Sparkles,
  Globe,
  Heart
} from 'lucide-react';

// Styled Components with Animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    backdropFilter: 'blur(10px)',
    overflow: 'hidden',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '20px 24px',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${shimmer} 3s infinite`,
  },
}));

const PreviewCard = styled(Paper)(({ theme, isActive }) => ({
  padding: '24px',
  marginBottom: '20px',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  ...(isActive ? {
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    border: '2px solid #4ade80',
    boxShadow: '0 8px 24px rgba(74, 222, 128, 0.2)',
  } : {
    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
    border: '2px solid #e2e8f0',
    opacity: 0.7,
  }),
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: isActive 
      ? '0 12px 32px rgba(74, 222, 128, 0.3)'
      : '0 8px 24px rgba(0,0,0,0.1)',
  },
}));

const StatusChip = styled(Chip)(({ theme, isActive }) => ({
  borderRadius: '20px',
  fontWeight: 600,
  marginRight: '12px',
  ...(isActive ? {
    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
    color: 'white',
  } : {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)',
    color: '#64748b',
  }),
}));

const HeroSection = styled(Box)(({ theme }) => ({
  height: '250px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${shimmer} 4s infinite`,
  },
}));

const ProductCard = styled(Card)(({ theme }) => ({
  height: '100%',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid transparent',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
    borderColor: '#667eea',
  },
}));

const CategoryCard = styled(Card)(({ theme }) => ({
  cursor: 'pointer',
  borderRadius: '16px',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: '2px solid transparent',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  '&:hover': {
    transform: 'scale(1.05)',
    borderColor: '#667eea',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.2)',
  },
}));

const BannerBox = styled(Box)(({ theme, variant = 'primary' }) => ({
  height: '180px',
  borderRadius: '16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'white',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  ...(variant === 'primary' && {
    background: 'linear-gradient(45deg, #ff6b6b, #ffa500)',
  }),
  ...(variant === 'secondary' && {
    background: 'linear-gradient(45deg, #4ecdc4, #44a08d)',
  }),
  '&:hover': {
    transform: 'scale(1.02)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${shimmer} 3s infinite`,
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  padding: '20px',
  borderRadius: '16px',
  height: '100%',
  transition: 'all 0.3s ease',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '2px solid transparent',
  '&:hover': {
    borderColor: '#667eea',
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.15)',
  },
}));

const NewsletterSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  padding: '32px',
  borderRadius: '16px',
  textAlign: 'center',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
    animation: `${shimmer} 4s infinite`,
  },
}));

const ViewportButton = styled(IconButton)(({ theme, isActive }) => ({
  borderRadius: '12px',
  margin: '0 4px',
  transition: 'all 0.2s ease',
  ...(isActive && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
  }),
  '&:hover': {
    transform: 'scale(1.1)',
    background: isActive 
      ? 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)'
      : 'rgba(102, 126, 234, 0.1)',
  },
}));

const GradientButton = styled(Button)(({ theme, variant = 'primary' }) => ({
  borderRadius: '12px',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '14px',
  boxShadow: 'none',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
      transform: 'translateY(-2px)',
      boxShadow: '0 8px 20px rgba(102, 126, 234, 0.4)',
    },
  }),
  ...(variant === 'secondary' && {
    background: 'transparent',
    color: '#64748b',
    border: '2px solid #e2e8f0',
    '&:hover': {
      background: '#f8fafc',
      borderColor: '#cbd5e1',
    },
  }),
}));

const ContentPreview = ({
  open,
  onClose,
  settings,
  selectedProducts = [],
  selectedCategories = []
}) => {
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return 'https://via.placeholder.com/300?text=No+Image';
    return imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.REACT_APP_API_BASE_URL}${imageUrl}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getProductPrice = (product) => {
    const variant = product.variants?.[0];
    if (!variant) return 0;
    return variant.discountPrice || variant.price || 0;
  };
  const PreviewSection = ({ title, children, isActive = true }) => (
    <PreviewCard isActive={isActive}>
      <Box display="flex" alignItems="center" mb={3}>
        <StatusChip 
          label={isActive ? "Đang hoạt động" : "Không hoạt động"} 
          isActive={isActive}
          size="small"
        />
        <Typography 
          variant="h6" 
          fontWeight="600"
          color={isActive ? '#1e293b' : '#64748b'}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </PreviewCard>
  );

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { height: '90vh' }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <StyledDialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Eye size={28} />
            <Typography variant="h5" fontWeight="700">
              Xem trước trang chủ
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <ViewportButton isActive={true}>
              <Monitor size={20} />
            </ViewportButton>
            <ViewportButton isActive={false}>
              <Smartphone size={20} />
            </ViewportButton>
            <IconButton 
              onClick={onClose}
              sx={{ 
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'scale(1.1)',
                }
              }}
            >
              <X size={24} />
            </IconButton>
          </Box>
        </Box>
      </StyledDialogTitle>

      <DialogContent dividers sx={{ background: 'transparent', padding: '24px' }}>
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          {/* Hero Section Preview */}
          <Fade in={open} timeout={600}>
            <div>
              <PreviewSection 
                title="Banner chính (Hero)" 
                isActive={settings?.hero?.isActive}
              >
                {settings?.hero?.isActive ? (
                  <HeroSection>
                    {settings.hero.backgroundImage && (
                      <Box
                        component="img"
                        src={getImageUrl(settings.hero.backgroundImage)}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          opacity: 0.7
                        }}
                      />
                    )}
                    <Box sx={{ textAlign: 'center', color: 'white', zIndex: 2, position: 'relative' }}>
                      <Typography variant="h4" fontWeight="bold" gutterBottom>
                        {settings.hero.title || 'Tiêu đề chính'}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }} gutterBottom>
                        {settings.hero.subtitle || 'Mô tả phụ'}
                      </Typography>
                      {settings.hero.ctaText && (
                        <GradientButton
                          variant="secondary"
                          size="large"
                          sx={{ mt: 2 }}
                        >
                          <Play size={16} style={{ marginRight: '8px' }} />
                          {settings.hero.ctaText}
                        </GradientButton>
                      )}
                    </Box>
                  </HeroSection>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Banner chính đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>          {/* Featured Categories Preview */}
          <Fade in={open} timeout={800}>
            <div>
              <PreviewSection 
                title="Danh mục nổi bật" 
                isActive={settings?.categories?.isActive}
              >
                {settings?.categories?.isActive ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Sparkles size={24} color="#667eea" />
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {settings.categories.title || 'Danh mục nổi bật'}
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {selectedCategories.slice(0, 4).map((category, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Zoom in={open} timeout={1000 + index * 100}>
                            <CategoryCard>
                              <CardMedia
                                component="img"
                                height="120"
                                image={getImageUrl(category.image)}
                                alt={category.name}
                                sx={{ objectFit: 'contain', p: 2 }}
                              />
                              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                                <Typography variant="body1" fontWeight="600" color="#1e293b">
                                  {category.name}
                                </Typography>
                                <Typography variant="body2" color="#64748b" mt={0.5}>
                                  {category.productCount || 0} sản phẩm
                                </Typography>
                              </CardContent>
                            </CategoryCard>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Danh mục nổi bật đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>

          {/* Featured Products Preview */}
          <Fade in={open} timeout={1000}>
            <div>
              <PreviewSection 
                title="Sản phẩm nổi bật" 
                isActive={settings?.productShowcase?.isActive}
              >
                {settings?.productShowcase?.isActive ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Heart size={24} color="#ef4444" />
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {settings.productShowcase.title || 'Sản phẩm nổi bật'}
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {selectedProducts.slice(0, 4).map((product, index) => (
                        <Grid item xs={6} sm={3} key={index}>
                          <Zoom in={open} timeout={1200 + index * 100}>
                            <ProductCard>
                              <CardMedia
                                component="img"
                                height="160"
                                image={getImageUrl(product.images?.[0]?.imageUrl)}
                                alt={product.name}
                                sx={{ objectFit: 'contain', p: 2 }}
                              />
                              <CardContent sx={{ py: 2 }}>
                                <Typography 
                                  variant="body1" 
                                  fontWeight="600"
                                  color="#1e293b"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    mb: 1
                                  }}
                                >
                                  {product.name}
                                </Typography>
                                <Typography variant="h6" color="#667eea" fontWeight="700">
                                  {formatPrice(getProductPrice(product))}
                                </Typography>
                                <Box display="flex" alignItems="center" mt={1}>
                                  <Star size={14} fill="#ffc107" color="#ffc107" />
                                  <Typography variant="body2" ml={0.5} color="#64748b">
                                    4.5 (100 đánh giá)
                                  </Typography>
                                </Box>
                              </CardContent>
                            </ProductCard>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Sản phẩm nổi bật đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>          {/* Promotional Banners Preview */}
          <Fade in={open} timeout={1400}>
            <div>
              <PreviewSection 
                title="Banner khuyến mãi" 
                isActive={settings?.banners?.isActive}
              >
                {settings?.banners?.isActive ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Globe size={24} color="#f59e0b" />
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {settings.banners.title || 'Khuyến mãi đặc biệt'}
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Zoom in={open} timeout={1600}>
                          <BannerBox variant="primary">
                            <Box textAlign="center" position="relative" zIndex={2}>
                              <Typography variant="h5" fontWeight="bold" mb={1}>
                                GIẢM GIÁ 50%
                              </Typography>
                              <Typography variant="body1">
                                Cho tất cả sản phẩm
                              </Typography>
                            </Box>
                          </BannerBox>
                        </Zoom>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Zoom in={open} timeout={1700}>
                          <BannerBox variant="secondary">
                            <Box textAlign="center" position="relative" zIndex={2}>
                              <Typography variant="h5" fontWeight="bold" mb={1}>
                                MIỄN PHÍ VẬN CHUYỂN
                              </Typography>
                              <Typography variant="body1">
                                Đơn hàng từ 500K
                              </Typography>
                            </Box>
                          </BannerBox>
                        </Zoom>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Banner khuyến mãi đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>

          {/* Customer Testimonials Preview */}
          <Fade in={open} timeout={1800}>
            <div>
              <PreviewSection 
                title="Đánh giá khách hàng" 
                isActive={settings?.testimonials?.isActive}
              >
                {settings?.testimonials?.isActive ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Star size={24} color="#f59e0b" />
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {settings.testimonials.title || 'Khách hàng nói gì về chúng tôi'}
                      </Typography>
                    </Box>
                    <Grid container spacing={3}>
                      {[1, 2, 3].map((item, index) => (
                        <Grid item xs={12} md={4} key={item}>
                          <Zoom in={open} timeout={2000 + index * 100}>
                            <TestimonialCard>
                              <Box display="flex" alignItems="center" mb={2}>
                                <Avatar 
                                  sx={{ 
                                    mr: 2,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    color: 'white',
                                    fontWeight: 'bold'
                                  }}
                                >
                                  N
                                </Avatar>
                                <Box>
                                  <Typography variant="body1" fontWeight="600" color="#1e293b">
                                    Nguyễn Văn A
                                  </Typography>
                                  <Box display="flex" alignItems="center">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <Star key={star} size={12} fill="#ffc107" color="#ffc107" />
                                    ))}
                                  </Box>
                                </Box>
                              </Box>
                              <Typography variant="body2" color="#64748b" fontStyle="italic">
                                "Sản phẩm tuyệt vời, dịch vụ chu đáo. Tôi sẽ quay lại mua sắm tiếp."
                              </Typography>
                            </TestimonialCard>
                          </Zoom>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Đánh giá khách hàng đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>

          {/* Brand Story Preview */}
          <Fade in={open} timeout={2200}>
            <div>
              <PreviewSection 
                title="Câu chuyện thương hiệu" 
                isActive={settings?.brandStory?.isActive}
              >
                {settings?.brandStory?.isActive ? (
                  <Box>
                    <Box display="flex" alignItems="center" gap={2} mb={3}>
                      <Heart size={24} color="#ec4899" />
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {settings.brandStory.title || 'Về chúng tôi'}
                      </Typography>
                    </Box>
                    <Grid container spacing={4} alignItems="center">
                      <Grid item xs={12} md={6}>
                        <Typography variant="body1" paragraph color="#475569" lineHeight={1.7}>
                          {settings.brandStory.description || 'Câu chuyện về thương hiệu và sứ mệnh của chúng tôi trong việc mang đến những sản phẩm công nghệ tốt nhất cho khách hàng...'}
                        </Typography>
                        <GradientButton variant="secondary" startIcon={<Eye size={16} />}>
                          Tìm hiểu thêm
                        </GradientButton>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          component="img"
                          src="https://via.placeholder.com/400x250?text=Brand+Story"
                          sx={{
                            width: '100%',
                            height: 250,
                            objectFit: 'cover',
                            borderRadius: '16px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                            transition: 'transform 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.02)',
                            }
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Câu chuyện thương hiệu đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>

          {/* Newsletter Preview */}
          <Fade in={open} timeout={2400}>
            <div>
              <PreviewSection 
                title="Đăng ký nhận tin" 
                isActive={settings?.newsletter?.isActive}
              >
                {settings?.newsletter?.isActive ? (
                  <NewsletterSection>
                    <Box position="relative" zIndex={2}>
                      <Box display="flex" alignItems="center" justifyContent="center" gap={2} mb={2}>
                        <Sparkles size={28} />
                        <Typography variant="h5" fontWeight="700">
                          {settings.newsletter.title || 'Đăng ký nhận tin khuyến mãi'}
                        </Typography>
                      </Box>
                      <Typography variant="body1" paragraph sx={{ opacity: 0.9, mb: 3 }}>
                        {settings.newsletter.description || 'Nhận thông báo về những sản phẩm mới và ưu đãi đặc biệt'}
                      </Typography>
                      <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
                        <Box
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            px: 3,
                            py: 2,
                            minWidth: 250,
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.3)',
                          }}
                        >
                          <Typography variant="body1" color="rgba(255,255,255,0.8)">
                            Nhập email của bạn...
                          </Typography>
                        </Box>
                        <GradientButton 
                          variant="secondary" 
                          sx={{ 
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.3)',
                            }
                          }}
                        >
                          Đăng ký
                        </GradientButton>
                      </Box>
                    </Box>
                  </NewsletterSection>
                ) : (
                  <Typography color="text.secondary" textAlign="center" py={4}>
                    Đăng ký nhận tin đã bị tắt
                  </Typography>
                )}
              </PreviewSection>
            </div>
          </Fade>
        </Box>
      </DialogContent>

      <DialogActions sx={{ 
        padding: '20px 24px', 
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderTop: '1px solid #e2e8f0' 
      }}>
        <GradientButton variant="primary" onClick={onClose}>
          <Eye size={16} style={{ marginRight: '8px' }} />
          Đóng xem trước
        </GradientButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default ContentPreview;
