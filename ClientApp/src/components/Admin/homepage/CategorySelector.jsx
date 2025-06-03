import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Checkbox,
  Chip,
  IconButton,
  CircularProgress,
  Badge,
  Avatar,
  Paper
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { X, Search, Folder, Tag, Layers, TrendingUp } from 'lucide-react';
import axios from 'axios';

// Enhanced animations and keyframes
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

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

const glow = keyframes`
  0%, 100% {
    box-shadow: 0 0 5px rgba(67, 56, 202, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(67, 56, 202, 0.8);
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

// Enhanced Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  }
}));

const SearchField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '16px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4338ca',
      }
    },
    '&.Mui-focused': {
      background: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#4338ca',
        borderWidth: '2px',
      }
    }
  }
}));

const CategoryCard = styled(Card)(({ theme, isSelected, isParent }) => ({
  height: '100%',
  border: isSelected ? '3px solid #4338ca' : '2px solid #e2e8f0',
  borderRadius: '16px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isSelected 
    ? 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  animation: isSelected ? `${glow} 2s ease-in-out infinite` : 'none',
  '&:hover': {
    transform: 'translateY(-4px) scale(1.02)',
    boxShadow: isSelected
      ? '0 12px 40px rgba(67, 56, 202, 0.3)'
      : '0 8px 30px rgba(0,0,0,0.12)',
    '& .category-image': {
      transform: 'scale(1.1)',
    },
    '& .product-count': {
      transform: 'scale(1.1)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: isParent 
      ? 'linear-gradient(90deg, transparent, rgba(67, 56, 202, 0.1), transparent)'
      : 'linear-gradient(90deg, transparent, rgba(99, 102, 241, 0.1), transparent)',
    transition: 'left 0.6s ease',
    zIndex: 1,
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const ChildCategoryCard = styled(Paper)(({ theme, isSelected }) => ({
  border: isSelected ? '2px solid #4338ca' : '1px solid #e2e8f0',
  borderRadius: '12px',
  cursor: 'pointer',
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  background: isSelected 
    ? 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)'
    : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  '&:hover': {
    transform: 'translateX(4px)',
    boxShadow: isSelected
      ? '0 4px 20px rgba(67, 56, 202, 0.2)'
      : '0 2px 12px rgba(0,0,0,0.08)',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
  borderRadius: '12px',
  color: 'white',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(67, 56, 202, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(67, 56, 202, 0.4)',
  },
  '&:disabled': {
    background: 'linear-gradient(135deg, #e2e8f0 0%, #cbd5e0 100%)',
    color: '#64748b',
    boxShadow: 'none',
    transform: 'none',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const StyledChip = styled(Chip)(({ theme, variant }) => ({
  borderRadius: '20px',
  fontWeight: 500,
  transition: 'all 0.3s ease',
  ...(variant === 'primary' && {
    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)',
      transform: 'scale(1.05)',
    },
    '& .MuiChip-deleteIcon': {
      color: 'rgba(255, 255, 255, 0.8)',
      '&:hover': {
        color: 'white',
      }
    }
  }),
  ...(variant === 'count' && {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    '&:hover': {
      background: 'linear-gradient(135deg, #047857 0%, #065f46 100%)',
    }
  }),
  ...(variant === 'info' && {
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: 'white',
    fontSize: '0.7rem',
    '&:hover': {
      background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
    }
  })
}));

const FilterPaper = styled(Paper)(({ theme }) => ({
  padding: '24px',
  borderRadius: '16px',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  border: '1px solid #e2e8f0',
  marginBottom: '24px',
  animation: `${fadeInUp} 0.6s ease`,
}));

const StatsBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    boxShadow: '0 2px 8px rgba(67, 56, 202, 0.3)',
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
  padding: '12px 16px',
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
}));

const CategorySelector = ({
  open,
  onClose,
  onCategorySelect,
  allowMultiple = true,
  selectedCategories = [],
  title = "Chọn danh mục",
  maxSelection = null
}) => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryIds, setSelectedCategoryIds] = useState(
    selectedCategories.map(c => c.id || c)
  );
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`);
      const categoriesData = response.data || [];
      
      // Fetch product count for each category
      const categoriesWithCount = await Promise.all(
        categoriesData.map(async (category) => {
          try {
            const productResponse = await axios.get(
              `${process.env.REACT_APP_API_BASE_URL}/api/products?categoryId=${category.id}`
            );
            return {
              ...category,
              productCount: productResponse.data?.length || 0
            };
          } catch (error) {
            return {
              ...category,
              productCount: 0
            };
          }
        })
      );

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = useCallback(() => {
    let filtered = [...categories];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm]);

  // Fetch categories when dialog opens
  useEffect(() => {
    if (open) {
      fetchCategories();
    }
  }, [open]);

  // Filter categories when search term changes
  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, filterCategories]);

  const handleCategoryToggle = (category) => {
    if (allowMultiple) {
      setSelectedCategoryIds(prev => {
        const isSelected = prev.includes(category.id);
        if (isSelected) {
          return prev.filter(id => id !== category.id);
        } else {
          // Check max selection limit
          if (maxSelection && prev.length >= maxSelection) {
            alert(`Chỉ có thể chọn tối đa ${maxSelection} danh mục`);
            return prev;
          }
          return [...prev, category.id];
        }
      });
    } else {
      setSelectedCategoryIds([category.id]);
    }
  };

  const handleConfirm = () => {
    const selectedCategoryData = categories.filter(category => 
      selectedCategoryIds.includes(category.id)
    );
    onCategorySelect(allowMultiple ? selectedCategoryData : selectedCategoryData[0]);
    onClose();
  };

  const getCategoryImage = (category) => {
    if (!category.image) return 'https://via.placeholder.com/120?text=No+Image';
    
    return category.image.startsWith('http') 
      ? category.image 
      : `${process.env.REACT_APP_API_BASE_URL}${category.image}`;
  };

  const getParentCategories = () => {
    return filteredCategories.filter(category => !category.parentId);
  };

  const getChildCategories = (parentId) => {
    return filteredCategories.filter(category => category.parentId === parentId);
  };
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ 
            background: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700 
          }}>
            {title}
          </Typography>
          <StatsBadge badgeContent={selectedCategoryIds.length} color="primary">
            <IconButton onClick={onClose} sx={{
              background: 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                transform: 'scale(1.1)',
              }
            }}>
              <X size={24} />
            </IconButton>
          </StatsBadge>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Enhanced Search Section */}
        <FilterPaper elevation={0}>
          <SearchField
            fullWidth
            placeholder="Tìm kiếm danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search size={20} style={{ marginRight: 8, color: '#4338ca' }} />
            }}
          />
        </FilterPaper>

        {/* Enhanced Selected Categories Summary */}
        {selectedCategoryIds.length > 0 && (
          <Box mb={3} p={2} sx={{
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
            borderRadius: '16px',
            border: '2px solid #4338ca'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#4338ca', fontWeight: 600 }}>
              Đã chọn ({selectedCategoryIds.length}{maxSelection ? `/${maxSelection}` : ''}):
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedCategoryIds.map((categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return category ? (
                  <StyledChip
                    variant="primary"
                    key={categoryId}
                    label={category.name}
                    onDelete={() => handleCategoryToggle(category)}
                    size="small"
                    avatar={<Avatar src={getCategoryImage(category)} sx={{ width: 24, height: 24 }} />}
                  />
                ) : null;
              })}
            </Box>
          </Box>
        )}

        {/* Enhanced Categories Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={60} sx={{ color: '#4338ca' }} />
          </Box>
        ) : (
          <>
            {/* Enhanced Parent Categories */}
            <SectionHeader>
              <Layers size={20} color="#4338ca" />
              <Typography variant="h6" sx={{ ml: 1, color: '#4338ca', fontWeight: 600 }}>
                Danh mục chính ({getParentCategories().length})
              </Typography>
            </SectionHeader>
            
            <Grid container spacing={3}>
              {getParentCategories().map((category) => {
                const isSelected = selectedCategoryIds.includes(category.id);
                const childCategories = getChildCategories(category.id);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={category.id}>
                    <CategoryCard
                      isSelected={isSelected}
                      isParent={true}
                      onClick={() => handleCategoryToggle(category)}
                    >
                      {/* Enhanced Selection Checkbox */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          left: 12,
                          zIndex: 2
                        }}
                      >
                        <Checkbox
                          checked={isSelected}
                          onChange={() => handleCategoryToggle(category)}
                          color="primary"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              transform: 'scale(1.1)',
                            },
                            '&.Mui-checked': {
                              backgroundColor: 'rgba(67, 56, 202, 0.1)',
                            }
                          }}
                        />
                      </Box>

                      {/* Enhanced Product Count Badge */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          zIndex: 2
                        }}
                      >
                        <StyledChip
                          variant="count"
                          label={`${category.productCount || 0} SP`}
                          size="small"
                          className="product-count"
                        />
                      </Box>

                      <CardMedia
                        component="img"
                        height="120"
                        image={getCategoryImage(category)}
                        alt={category.name}
                        className="category-image"
                        sx={{ 
                          objectFit: 'contain', 
                          p: 2,
                          backgroundColor: '#f8fafc',
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      
                      <CardContent sx={{ pt: 1, position: 'relative', zIndex: 2 }}>
                        <Typography
                          variant="body1"
                          fontWeight="600"
                          textAlign="center"
                          noWrap
                          title={category.name}
                          sx={{ mb: 1, color: '#1e293b' }}
                        >
                          {category.name}
                        </Typography>
                        
                        {category.description && (
                          <Typography 
                            variant="caption" 
                            color="text.secondary" 
                            display="block"
                            textAlign="center"
                            sx={{
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              mb: 1
                            }}
                          >
                            {category.description}
                          </Typography>
                        )}

                        {/* Enhanced Child Categories Indicator */}
                        {childCategories.length > 0 && (
                          <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                            <StyledChip
                              variant="info"
                              label={`${childCategories.length} danh mục con`}
                              size="small"
                              icon={<Folder size={14} />}
                            />
                          </Box>
                        )}
                      </CardContent>
                    </CategoryCard>
                  </Grid>
                );
              })}
            </Grid>

            {/* Enhanced Child Categories Section */}
            {searchTerm && getParentCategories().some(parent => getChildCategories(parent.id).length > 0) && (
              <Box mt={4}>
                <SectionHeader>
                  <TrendingUp size={20} color="#6366f1" />
                  <Typography variant="h6" sx={{ ml: 1, color: '#6366f1', fontWeight: 600 }}>
                    Danh mục con
                  </Typography>
                </SectionHeader>
                
                <Grid container spacing={2}>
                  {getParentCategories().map(parent => 
                    getChildCategories(parent.id).map(child => {
                      const isSelected = selectedCategoryIds.includes(child.id);
                      return (
                        <Grid item xs={12} sm={6} md={6} key={child.id}>
                          <ChildCategoryCard
                            isSelected={isSelected}
                            onClick={() => handleCategoryToggle(child)}
                            elevation={0}
                          >
                            <CardContent sx={{ py: 2 }}>
                              <Box display="flex" alignItems="center">
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleCategoryToggle(child)}
                                  color="primary"
                                  size="small"
                                />
                                <Box ml={1} flexGrow={1}>
                                  <Typography variant="body2" fontWeight="600" sx={{ color: '#1e293b' }}>
                                    {child.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Thuộc: {parent.name}
                                  </Typography>
                                </Box>
                                <StyledChip
                                  variant="count"
                                  label={child.productCount || 0}
                                  size="small"
                                />
                              </Box>
                            </CardContent>
                          </ChildCategoryCard>
                        </Grid>
                      );
                    })
                  )}
                </Grid>
              </Box>
            )}

            {filteredCategories.length === 0 && !loading && (
              <Box textAlign="center" py={6} sx={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                border: '2px dashed #cbd5e0'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy danh mục nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy thử điều chỉnh từ khóa tìm kiếm
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {filteredCategories.length} danh mục • {selectedCategoryIds.length} đã chọn
          </Typography>
          <Box display="flex" gap={2}>
            <Button 
              onClick={onClose} 
              sx={{ 
                borderRadius: '12px',
                px: 3,
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  color: '#ef4444',
                }
              }}
            >
              Hủy
            </Button>
            <GradientButton
              onClick={handleConfirm}
              disabled={selectedCategoryIds.length === 0}
              startIcon={<Tag size={16} />}
            >
              Xác nhận ({selectedCategoryIds.length})
            </GradientButton>
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default CategorySelector;
