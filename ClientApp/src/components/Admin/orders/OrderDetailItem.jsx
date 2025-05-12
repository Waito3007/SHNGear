import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
// Import các hàm tiện ích nếu cần (ví dụ formatCurrency)
import { formatCurrency } from '../../../utils/FormatInfo'; // Giả sử bạn tạo file utils.js

const OrderDetailItem = React.memo(({ item, variantDetail }) => {
  const product = variantDetail?.product || {};
  const variant = variantDetail?.variant || {};
  const images = variantDetail?.images || [];

  // Tìm ảnh chính hoặc ảnh đầu tiên
  const primaryImage = images.find(img => img.isPrimary) || images[0];
  const imageUrl = primaryImage
    ? `${process.env.REACT_APP_API_BASE_URL}${primaryImage.imageUrl}`
    : 'https://via.placeholder.com/80?text=No+Image'; // Placeholder rõ ràng hơn

  return (
    <ListItem
      sx={{ px: 0, py: 2, flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px dashed #eee' }}
    >
      <Box sx={{ display: 'flex', width: '100%', mb: 1 }}>
        <ListItemAvatar sx={{ mr: 1 }}>
          <Avatar
            src={imageUrl}
            alt={product.name || 'Sản phẩm'}
            variant="square"
            sx={{ width: 80, height: 80, borderRadius: '4px', backgroundColor: '#f5f5f5' }}
            imgProps={{ loading: 'lazy' }} // Thêm lazy loading cho ảnh
            onError={(e) => { // Xử lý lỗi tải ảnh tốt hơn
              e.target.onerror = null;
              e.target.src = 'https://via.placeholder.com/80?text=Error';
            }}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography variant="body1" fontWeight="medium" sx={{ mb: 0.5 }}>
              {product.name || 'Sản phẩm không xác định'}
            </Typography>
          }
          secondary={
            <>
              <Typography variant="body2" color="text.secondary">
                Phân loại: {variant.color || 'N/A'} - {variant.storage || 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SKU: {variant.sku || 'N/A'}
              </Typography>
            </>
          }
        />
        <Box sx={{ textAlign: 'right', ml: 1, minWidth: '100px' }}>
          <Typography variant="body2" color="text.secondary">
            {item.quantity} × {formatCurrency(item.price)}
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {formatCurrency(item.quantity * item.price)}
          </Typography>
        </Box>
      </Box>

      {/* Có thể thêm thông tin chi tiết khác nếu cần */}
      {/* <Box sx={{ pl: { xs: 0, sm: '96px' }, width: '100%', mt: 1 }}> // Điều chỉnh padding left
          <Typography variant="caption" color="text.secondary">
              <strong>Giá gốc:</strong> {formatCurrency(variant.price)}
              {variant.discountPrice && ` | <strong>Giá giảm:</strong> ${formatCurrency(variant.discountPrice)}`}
          </Typography>
      </Box> */}
    </ListItem>
  );
});

export default OrderDetailItem;