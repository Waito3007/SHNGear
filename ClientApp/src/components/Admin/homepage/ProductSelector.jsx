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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  CircularProgress,
  Badge,
  Paper
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { X, Search, Filter, ShoppingCart } from 'lucide-react';
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
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.8);
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
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
      }
    },
    '&.Mui-focused': {
      background: '#ffffff',
      '& .MuiOutlinedInput-notchedOutline': {
        borderColor: '#667eea',
        borderWidth: '2px',
      }
    }
  }
}));

const FilterSelect = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
    },
    '&.Mui-focused': {
      background: '#ffffff',
    }
  }
}));

const ProductCard = styled(Card)(({ theme, isSelected }) => ({
  height: '100%',
  border: isSelected ? '3px solid #667eea' : '2px solid #e2e8f0',
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
      ? '0 12px 40px rgba(102, 126, 234, 0.3)'
      : '0 8px 30px rgba(0,0,0,0.12)',
    '& .product-image': {
      transform: 'scale(1.1)',
    },
    '& .price-tag': {
      transform: 'scale(1.05)',
    }
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
    transition: 'left 0.6s ease',
    zIndex: 1,
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  color: 'white',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
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

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: '20px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  color: 'white',
  fontWeight: 500,
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'scale(1.02)',
  },
  '& .MuiChip-deleteIcon': {
    color: 'rgba(255, 255, 255, 0.8)',
    '&:hover': {
      color: 'white',
    }
  }
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
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    fontWeight: 600,
    fontSize: '0.75rem',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
  }
}));

const PriceTag = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  color: 'white',
  padding: '4px 12px',
  borderRadius: '12px',
  fontWeight: 600,
  fontSize: '0.875rem',
  display: 'inline-block',
  transition: 'all 0.3s ease',
  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
}));

const ProductSelector = ({
  open,
  onClose,
  onProductSelect,
  allowMultiple = true,
  selectedProducts = [],
  title = "Chọn sản phẩm",
  maxSelection = null
}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProductIds, setSelectedProductIds] = useState(selectedProducts.map(p => p.id || p));
  const itemsPerPage = 12;

  // Fetch initial data
  useEffect(() => {
    if (open) {
      fetchData();
    }  }, [open]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes, brandsRes] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`),
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/brands`)
      ]);

      setProducts(productsRes.data || []);
      setCategories(categoriesRes.data || []);
      setBrands(brandsRes.data || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };
  const filterProducts = useCallback(() => {
    let filtered = [...products];

    // Search by name
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    // Filter by brand
    if (selectedBrand) {
      filtered = filtered.filter(product => product.brandId === selectedBrand);
    }

    setFilteredProducts(filtered);
    setCurrentPage(1);  }, [products, searchTerm, selectedCategory, selectedBrand]);

  // Filter products when search/filter criteria change
  useEffect(() => {
    filterProducts();
  }, [filterProducts]);

  const handleProductToggle = (product) => {
    if (allowMultiple) {
      setSelectedProductIds(prev => {
        const isSelected = prev.includes(product.id);
        if (isSelected) {
          return prev.filter(id => id !== product.id);
        } else {
          // Check max selection limit
          if (maxSelection && prev.length >= maxSelection) {
            alert(`Chỉ có thể chọn tối đa ${maxSelection} sản phẩm`);
            return prev;
          }
          return [...prev, product.id];
        }
      });
    } else {
      setSelectedProductIds([product.id]);
    }
  };

  const handleConfirm = () => {
    const selectedProductData = products.filter(product => 
      selectedProductIds.includes(product.id)
    );
    onProductSelect(allowMultiple ? selectedProductData : selectedProductData[0]);
    onClose();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedBrand('');
  };

  const getProductImage = (product) => {
    const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
    if (!primaryImage?.imageUrl) return 'https://via.placeholder.com/200?text=No+Image';
    
    return primaryImage.imageUrl.startsWith('http') 
      ? primaryImage.imageUrl 
      : `${process.env.REACT_APP_API_BASE_URL}${primaryImage.imageUrl}`;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Không xác định';
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand?.name || 'Không xác định';
  };

  const getProductPrice = (product) => {
    const variant = product.variants?.[0];
    if (!variant) return 0;
    return variant.discountPrice || variant.price || 0;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
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
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            fontWeight: 700 
          }}>
            {title}
          </Typography>
          <StatsBadge badgeContent={selectedProductIds.length} color="primary">
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
        {/* Enhanced Search and Filter Section */}
        <FilterPaper elevation={0}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <SearchField
                fullWidth
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: 8, color: '#667eea' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FilterSelect fullWidth>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Danh mục"
                >
                  <MenuItem value="">Tất cả danh mục</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FilterSelect>
            </Grid>
            <Grid item xs={12} md={3}>
              <FilterSelect fullWidth>
                <InputLabel>Thương hiệu</InputLabel>
                <Select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  label="Thương hiệu"
                >
                  <MenuItem value="">Tất cả thương hiệu</MenuItem>
                  {brands.map((brand) => (
                    <MenuItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </MenuItem>
                  ))}
                </Select>
              </FilterSelect>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Filter />}
                fullWidth
                sx={{
                  borderRadius: '12px',
                  borderColor: '#667eea',
                  color: '#667eea',
                  '&:hover': {
                    borderColor: '#5a67d8',
                    backgroundColor: 'rgba(102, 126, 234, 0.04)',
                    transform: 'translateY(-2px)',
                  }
                }}
              >
                Xóa bộ lọc
              </Button>
            </Grid>
          </Grid>
        </FilterPaper>

        {/* Enhanced Selected Products Summary */}
        {selectedProductIds.length > 0 && (
          <Box mb={3} p={2} sx={{
            background: 'linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%)',
            borderRadius: '16px',
            border: '2px solid #667eea'
          }}>
            <Typography variant="subtitle2" gutterBottom sx={{ color: '#667eea', fontWeight: 600 }}>
              Đã chọn ({selectedProductIds.length}{maxSelection ? `/${maxSelection}` : ''}):
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {selectedProductIds.slice(0, 5).map((productId) => {
                const product = products.find(p => p.id === productId);
                return product ? (
                  <StyledChip
                    key={productId}
                    label={product.name}
                    onDelete={() => handleProductToggle(product)}
                    size="small"
                  />
                ) : null;
              })}
              {selectedProductIds.length > 5 && (
                <StyledChip
                  label={`+${selectedProductIds.length - 5} khác`}
                  size="small"
                />
              )}
            </Box>
          </Box>
        )}

        {/* Enhanced Products Grid */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={60} sx={{ color: '#667eea' }} />
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {paginatedProducts.map((product) => {
                const isSelected = selectedProductIds.includes(product.id);
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <ProductCard
                      isSelected={isSelected}
                      onClick={() => handleProductToggle(product)}
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
                          onChange={() => handleProductToggle(product)}
                          color="primary"
                          sx={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            '&:hover': {
                              backgroundColor: 'rgba(255, 255, 255, 1)',
                              transform: 'scale(1.1)',
                            },
                            '&.Mui-checked': {
                              backgroundColor: 'rgba(102, 126, 234, 0.1)',
                            }
                          }}
                        />
                      </Box>

                      <CardMedia
                        component="img"
                        height="160"
                        image={getProductImage(product)}
                        alt={product.name}
                        className="product-image"
                        sx={{ 
                          objectFit: 'contain', 
                          p: 2,
                          transition: 'transform 0.3s ease',
                        }}
                      />
                      
                      <CardContent sx={{ pt: 1, position: 'relative', zIndex: 2 }}>
                        <Typography
                          variant="body2"
                          fontWeight="600"
                          noWrap
                          title={product.name}
                          sx={{ mb: 1, color: '#1e293b' }}
                        >
                          {product.name}
                        </Typography>
                        
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                          {getCategoryName(product.categoryId)} • {getBrandName(product.brandId)}
                        </Typography>
                        
                        <PriceTag className="price-tag">
                          {formatPrice(getProductPrice(product))}
                        </PriceTag>
                        
                        {product.variants?.length > 0 && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                            Tồn kho: {product.variants.reduce((total, variant) => total + (variant.stockQuantity || 0), 0)}
                          </Typography>
                        )}
                      </CardContent>
                    </ProductCard>
                  </Grid>
                );
              })}
            </Grid>

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={4}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={(e, page) => setCurrentPage(page)}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '12px',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.08)',
                        transform: 'scale(1.05)',
                      },
                      '&.Mui-selected': {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                        }
                      }
                    }
                  }}
                />
              </Box>
            )}

            {filteredProducts.length === 0 && !loading && (
              <Box textAlign="center" py={6} sx={{
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                borderRadius: '16px',
                border: '2px dashed #cbd5e0'
              }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Không tìm thấy sản phẩm nào
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
                </Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)' }}>
        <Box display="flex" justifyContent="space-between" width="100%" alignItems="center">
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            {filteredProducts.length} sản phẩm • {selectedProductIds.length} đã chọn
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
              disabled={selectedProductIds.length === 0}
              startIcon={<ShoppingCart size={16} />}
            >
              Xác nhận ({selectedProductIds.length})
            </GradientButton>
          </Box>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default ProductSelector;
