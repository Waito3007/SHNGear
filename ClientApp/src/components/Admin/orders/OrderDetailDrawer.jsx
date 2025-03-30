import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Chip,
  CircularProgress,
  Grid,
  Tooltip,
  ImageList,
  ImageListItem,
  Button,
  ButtonGroup,
} from '@mui/material';
import { Close, PictureAsPdf, InsertDriveFile, Receipt } from '@mui/icons-material';
import axios from 'axios';

const OrderDetailDrawer = ({ orderId, open, onClose }) => {
  const [order, setOrder] = useState(null);
  const [variantDetails, setVariantDetails] = useState({});
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    } else {
      setOrder(null);
      setVariantDetails({});
    }
  }, [open, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`https://localhost:7107/api/orders/${orderId}/details`);
      setOrder(response.data);
      if (response.data.items?.length > 0) {
        await fetchVariantDetails(response.data.items);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVariantDetails = async (items) => {
    try {
      const variantPromises = items.map((item) =>
        axios.get(`https://localhost:7107/api/products/by-variant/${item.variantId}`)
      );
      const variantResponses = await Promise.all(variantPromises);
      const details = variantResponses.reduce((acc, res, index) => {
        acc[items[index].variantId] = res.data;
        return acc;
      }, {});
      setVariantDetails(details);
    } catch (error) {
      console.error('Failed to fetch variant details:', error);
    }
  };

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const response = await axios.get(
        `https://localhost:7107/api/orders/${orderId}/export/excel`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${orderId}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export Excel:', error);
      alert('Xuất file Excel thất bại');
    } finally {
      setExporting(false);
    }
  };

  const handleExportImage = async () => {
    try {
      setExporting(true);
      const response = await axios.get(
        `https://localhost:7107/api/orders/${orderId}/export/image`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${orderId}.png`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export image:', error);
      alert('Xuất hình ảnh thất bại');
    } finally {
      setExporting(false);
    }
  };

  const handleExportTemplate = async () => {
    try {
      setExporting(true);
      const response = await axios.get(
        `https://localhost:7107/api/orders/${orderId}/export/template`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `HoaDon_${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export template:', error);
      alert('Xuất hóa đơn theo mẫu thất bại');
    } finally {
      setExporting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'success';
      case 'Processing': return 'info';
      case 'Shipped': return 'primary';
      case 'Cancelled': return 'error';
      default: return 'warning';
    }
  };

  const formatCurrency = (amount) => {
    return amount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) ?? 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatAddress = (address) => {
    if (!address) return 'Chưa có thông tin địa chỉ';
    const { addressLine1, addressLine2, city, state, zipCode, country } = address;
    return `${addressLine1}${addressLine2 ? ', ' + addressLine2 : ''}, ${city}${
      state ? ', ' + state : ''
    }, ${zipCode}, ${country}`;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: '70%', md: '50%' }, maxWidth: '600px' },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            Chi tiết đơn hàng
          </Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        {/* Nút xuất hóa đơn */}
        <Box sx={{ mb: 3 }}>
          <ButtonGroup fullWidth variant="contained" disabled={exporting || !order}>
            <Button 
              startIcon={exporting ? <CircularProgress size={20} /> : <InsertDriveFile />}
              onClick={handleExportExcel}
              color="success"
            >
              Excel
            </Button>
            <Button 
              startIcon={exporting ? <CircularProgress size={20} /> : <Receipt />}
              onClick={handleExportImage}
              color="error"
            >
              Ảnh hóa đơn
            </Button>
            <Button 
              startIcon={exporting ? <CircularProgress size={20} /> : <PictureAsPdf />}
              onClick={handleExportTemplate}
              color="primary"
            >
              PDF
            </Button>
          </ButtonGroup>
        </Box>

        {loading && !order ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : order ? (
          <>
            {/* Thông tin chung */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Thông tin đơn hàng
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Mã đơn hàng:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {order.id}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đặt hàng:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatDate(order.orderDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Tổng tiền:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {formatCurrency(order.totalAmount)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phương thức thanh toán:
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {order.paymentMethodId === 1 ? 'Tiền mặt' : 'MoMo'}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Trạng thái:
                  </Typography>
                  <Chip
                    label={order.orderStatus || 'Unknown'}
                    color={getStatusColor(order.orderStatus)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Địa chỉ giao hàng:
                  </Typography>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {order.address?.fullName || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {order.address?.phoneNumber || 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatAddress(order.address)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Danh sách sản phẩm */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                Sản phẩm trong đơn hàng
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {order.items?.length > 0 ? (
                <List>
                  {order.items.map((item, index) => {
                    const variantData = variantDetails[item.variantId] || {};
                    const product = variantData.product || {};
                    const variant = variantData.variant || {};
                    const images = variantData.images || [];

                    return (
                      <ListItem
                        key={index}
                        sx={{ px: 0, py: 2, flexDirection: 'column', alignItems: 'flex-start' }}
                      >
                        <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
                          <ListItemAvatar>
                            <Avatar
                              src={
                                images.find((img) => img.isPrimary)?.imageUrl ||
                                images[0]?.imageUrl ||
                                'https://via.placeholder.com/80'
                              }
                              alt={product.name || 'Sản phẩm'}
                              variant="square"
                              sx={{ width: 80, height: 80, mr: 2 }}
                            />
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography variant="body1" fontWeight="medium">
                                {product.name || 'Sản phẩm không xác định'}
                              </Typography>
                            }
                            secondary={
                              <Typography variant="body2" color="text.secondary">
                                Loại: {variant.color || 'N/A'} -{' '}
                                {variant.storage || 'N/A'}
                              </Typography>
                            }
                          />
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" color="text.secondary">
                              {item.quantity} × {formatCurrency(item.price)}
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {formatCurrency(item.quantity * item.price)}
                            </Typography>
                          </Box>
                        </Box>

                        {/* Thông tin chi tiết sản phẩm */}
                        <Box sx={{ pl: 10, width: '100%' }}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Danh mục:</strong> {product.category || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Thương hiệu:</strong> {product.brand || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Mô tả:</strong> {product.description || 'Không có mô tả'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Giá gốc:</strong> {formatCurrency(variant.price)}
                          </Typography>
                          {variant.discountPrice && (
                            <Typography variant="body2" color="text.secondary">
                              <strong>Giá giảm:</strong> {formatCurrency(variant.discountPrice)}
                            </Typography>
                          )}

                          {/* Hiển thị tất cả hình ảnh */}
                          {images.length > 0 ? (
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                Hình ảnh sản phẩm:
                              </Typography>
                              <ImageList cols={3} gap={8}>
                                {images.map((img) => (
                                  <ImageListItem key={img.id}>
                                    <Tooltip title={img.isPrimary ? 'Ảnh chính' : 'Ảnh phụ'}>
                                      <img
                                        src={img.imageUrl}
                                        alt={product.name || 'Sản phẩm'}
                                        style={{
                                          width: '100%',
                                          height: 'auto',
                                          border: img.isPrimary ? '2px solid #000' : 'none',
                                        }}
                                        loading="lazy"
                                      />
                                    </Tooltip>
                                  </ImageListItem>
                                ))}
                              </ImageList>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Không có hình ảnh sản phẩm.
                            </Typography>
                          )}
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có sản phẩm trong đơn hàng.
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Không tìm thấy thông tin đơn hàng
          </Typography>
        )}
      </Box>
    </Drawer>
  );
};

export default OrderDetailDrawer;