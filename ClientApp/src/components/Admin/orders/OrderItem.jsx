import React from 'react';
import { Box, FormControl, InputLabel, Select, MenuItem, TextField, Button } from '@mui/material';

// Sử dụng React.memo để tránh render lại không cần thiết khi props không đổi
const OrderItem = React.memo(({ item, index, productVariantOptions, onChange, onRemove }) => {
    const handleFieldChange = (field, value) => {
        // Chuyển đổi kiểu dữ liệu phù hợp
        const processedValue = field === 'quantity' ? parseInt(value, 10) || 0 :
                              field === 'price' ? parseFloat(value) || 0 :
                              value;
        onChange(index, field, processedValue);
    };

    return (
        <Box sx={{ mb: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <FormControl fullWidth margin="normal">
                <InputLabel>Sản phẩm</InputLabel>
                <Select
                    value={item.productVariantId}
                    onChange={(e) => handleFieldChange('productVariantId', e.target.value)}
                    label="Sản phẩm"
                >
                    {/* Sử dụng options đã được memoized */}
                    {productVariantOptions}
                </Select>
            </FormControl>

            <TextField
                fullWidth
                margin="normal"
                type="number"
                label="Số lượng"
                value={item.quantity}
                onChange={(e) => handleFieldChange('quantity', e.target.value)}
                inputProps={{ min: 0 }} // Thêm ràng buộc số lượng không âm
            />

            <TextField
                fullWidth
                margin="normal"
                type="number"
                label="Đơn giá"
                value={item.price}
                onChange={(e) => handleFieldChange('price', e.target.value)}
                 inputProps={{ min: 0 }} // Thêm ràng buộc giá không âm
            />

            <Button
                variant="outlined"
                color="error"
                onClick={() => onRemove(index)}
                sx={{ mt: 1 }}
            >
                Xóa sản phẩm
            </Button>
        </Box>
    );
});

export default OrderItem;