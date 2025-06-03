import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  List,
  ListItem,
  Alert,
  styled,
  keyframes,
  Fade,
  Zoom,
  Chip
} from '@mui/material';
import { 
  X, 
  Move, 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  Layers,
  Sparkles,
  Layout,
  Settings
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

const SectionCard = styled(ListItem)(({ theme, isVisible }) => ({
  border: '2px solid transparent',
  borderRadius: '16px',
  marginBottom: '12px',
  padding: '16px',
  background: isVisible 
    ? 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
  opacity: isVisible ? 1 : 0.7,
  cursor: 'grab',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  animation: `${fadeInUp} 0.6s ease-out`,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
    borderColor: '#667eea',
    '&::before': {
      opacity: 1,
    },
  },
  '&:active': {
    cursor: 'grabbing',
    transform: 'scale(1.02)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
}));

const DragHandle = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginRight: '16px',
  cursor: 'grab',
  padding: '8px',
  borderRadius: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    transform: 'scale(1.1)',
  },
  '&:active': {
    cursor: 'grabbing',
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
  },
}));

const SectionIcon = styled(Typography)(({ theme }) => ({
  fontSize: '1.5em',
  marginRight: '8px',
  padding: '8px',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  width: '40px',
  height: '40px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
}));

const ControlButton = styled(IconButton)(({ theme, variant = 'default' }) => ({
  padding: '8px',
  margin: '0 2px',
  borderRadius: '10px',
  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  ...(variant === 'visibility' && {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)',
      transform: 'scale(1.1)',
    },
  }),
  ...(variant === 'move' && {
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #ee82e9 0%, #f3455a 100%)',
      transform: 'scale(1.1)',
    },
    '&:disabled': {
      background: '#e2e8f0',
      color: '#94a3b8',
    },
  }),
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

const EmptyState = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: '48px 24px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderRadius: '16px',
  border: '2px dashed #cbd5e1',
  animation: `${pulse} 2s infinite`,
  '& .empty-icon': {
    color: '#cbd5e1',
    marginBottom: '16px',
  },
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
  color: 'white',
  fontWeight: 600,
  borderRadius: '20px',
  '& .MuiChip-label': {
    padding: '8px 16px',
  },
}));

const DragDropManager = ({
  open,
  onClose,
  onOrderUpdate,
  sections = []
}) => {
  const [sectionOrder, setSectionOrder] = useState(
    sections.map((section, index) => ({
      ...section,
      order: index,
      isVisible: section.isVisible !== false
    }))
  );

  const moveSection = useCallback((fromIndex, toIndex) => {
    setSectionOrder(prev => {
      const newOrder = [...prev];
      const [movedItem] = newOrder.splice(fromIndex, 1);
      newOrder.splice(toIndex, 0, movedItem);
      
      // Update order values
      return newOrder.map((item, index) => ({
        ...item,
        order: index
      }));
    });
  }, []);

  const toggleSectionVisibility = useCallback((sectionId) => {
    setSectionOrder(prev => 
      prev.map(section => 
        section.id === sectionId 
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  }, []);

  const handleSave = () => {
    onOrderUpdate(sectionOrder);
    onClose();
  };

  const getSectionIcon = (sectionType) => {
    switch (sectionType) {
      case 'hero': return '🎯';
      case 'categories': return '📂';
      case 'products': return '🛍️';
      case 'banners': return '🏷️';
      case 'testimonials': return '💬';
      case 'brandStory': return '📖';
      case 'newsletter': return '📧';
      default: return '📄';
    }
  };

  const getSectionTitle = (sectionType) => {
    switch (sectionType) {
      case 'hero': return 'Hero Banner';
      case 'categories': return 'Danh mục nổi bật';
      case 'products': return 'Sản phẩm nổi bật';
      case 'banners': return 'Banner khuyến mãi';
      case 'testimonials': return 'Đánh giá khách hàng';
      case 'brandStory': return 'Câu chuyện thương hiệu';
      case 'newsletter': return 'Đăng ký nhận tin';
      default: return sectionType;
    }
  };
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
      TransitionComponent={Fade}
      TransitionProps={{ timeout: 600 }}
    >
      <StyledDialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center" position="relative" zIndex={1}>
          <Box display="flex" alignItems="center" gap={2}>
            <Layout size={28} />
            <Typography variant="h5" fontWeight="700">
              Sắp xếp thứ tự sections
            </Typography>
          </Box>
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
      </StyledDialogTitle>

      <DialogContent dividers sx={{ background: 'transparent', padding: '24px' }}>
        <Fade in={open} timeout={800}>
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
              border: '1px solid #81d4fa',
              '& .MuiAlert-icon': {
                color: '#0277bd',
              },
            }}
          >
            Kéo thả để sắp xếp thứ tự hiển thị các phần trên trang chủ. 
            Sử dụng nút mắt để ẩn/hiện từng phần.
          </Alert>
        </Fade>

        <List sx={{ padding: 0 }}>
          {sectionOrder.map((section, index) => (
            <Zoom in={open} timeout={800 + index * 100} key={section.id}>
              <SectionCard isVisible={section.isVisible}>
                <Box display="flex" alignItems="center" width="100%" position="relative" zIndex={1}>
                  {/* Drag Handle */}
                  <DragHandle>
                    <Move size={20} />
                  </DragHandle>

                  {/* Section Info */}
                  <Box flex={1}>
                    <Box display="flex" alignItems="center" gap={2} mb={1}>
                      <SectionIcon>
                        {getSectionIcon(section.type)}
                      </SectionIcon>
                      <Typography variant="h6" fontWeight="600" color="#1e293b">
                        {getSectionTitle(section.type)}
                      </Typography>
                      {section.isVisible && (
                        <StatusChip 
                          label="Hiển thị" 
                          size="small"
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="#64748b" sx={{ ml: 6 }}>
                      Thứ tự: {index + 1} • ID: {section.id}
                    </Typography>
                  </Box>

                  {/* Controls */}
                  <Box display="flex" alignItems="center" gap={1}>
                    {/* Move Up/Down Buttons */}
                    <ControlButton
                      variant="move"
                      size="small"
                      onClick={() => moveSection(index, Math.max(0, index - 1))}
                      disabled={index === 0}
                    >
                      <ArrowUp size={16} />
                    </ControlButton>
                    <ControlButton
                      variant="move"
                      size="small"
                      onClick={() => moveSection(index, Math.min(sectionOrder.length - 1, index + 1))}
                      disabled={index === sectionOrder.length - 1}
                    >
                      <ArrowDown size={16} />
                    </ControlButton>

                    {/* Visibility Toggle */}
                    <ControlButton
                      variant="visibility"
                      size="small"
                      onClick={() => toggleSectionVisibility(section.id)}
                    >
                      {section.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </ControlButton>
                  </Box>
                </Box>
              </SectionCard>
            </Zoom>
          ))}
        </List>

        {sectionOrder.length === 0 && (
          <Fade in={open} timeout={1000}>
            <EmptyState>
              <Box className="empty-icon">
                <Layers size={64} />
              </Box>
              <Typography variant="h5" color="#64748b" fontWeight="600" mb={1}>
                Không có section nào
              </Typography>
              <Typography variant="body1" color="#94a3b8">
                Các section sẽ được hiển thị khi bạn thêm nội dung
              </Typography>
            </EmptyState>
          </Fade>
        )}
      </DialogContent>

      <DialogActions sx={{ padding: '20px 24px', background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Sparkles size={20} color="#667eea" />
            <Typography variant="body1" color="#475569" fontWeight="500">
              {sectionOrder.filter(s => s.isVisible).length} / {sectionOrder.length} section hiển thị
            </Typography>
          </Box>
          <Box display="flex" gap={2}>
            <GradientButton variant="secondary" onClick={onClose}>
              Hủy
            </GradientButton>
            <GradientButton variant="primary" onClick={handleSave}>
              <Settings size={16} style={{ marginRight: '8px' }} />
              Lưu thứ tự
            </GradientButton>
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default DragDropManager;
