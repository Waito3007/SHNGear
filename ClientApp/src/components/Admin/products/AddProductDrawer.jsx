// src/components/ProductDrawer.js
import { useEffect } from "react";
import {
  Drawer,
  IconButton,
  Select,
  MenuItem,
  Button,
  Box,
  CircularProgress,
  InputBase,
  Typography,
  Tabs,
  Tab,
  TextField,
} from "@mui/material";
import { Close } from "@mui/icons-material";
// import { useFieldArray } from "react-hook-form"; // Sẽ được quản lý trong useProductForm nếu cần field array cho variants

// Import các custom hooks
import { useProductForm } from "../../../hook/products/useProductForm";
import { useProductImageManager } from "../../../hook/products/useProductImageManager";
import { useProductData } from "../../../hook/products/useProductData";

const ProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
  const { categories, brands, loading: dataLoading, error: dataError } = useProductData();
  const imageManager = useProductImageManager();
  const productForm = useProductForm({
    onAddProduct,
    onClose: () => { // Khi form đóng (sau submit thành công hoặc hủy)
      onClose(); // Gọi prop onClose từ component cha
      imageManager.resetImageManager(); // Reset trạng thái của image manager
      // productForm.resetForm() đã được gọi bên trong handleFormSubmit
    },
  });
  const { errors } = productForm.formState; 

  // Đồng bộ lại imageError từ imageManager lên form nếu cần thiết để hiển thị tập trung
  // Hoặc bạn có thể hiển thị imageError.message trực tiếp từ imageManager.imageError

  const handleMainSubmit = async (formData) => {
    imageManager.setImageError(""); // Xóa lỗi ảnh cũ trước khi submit
    const { images: processedImages, error: imageProcessingError } = await imageManager.processImagesForSubmission();

    if (imageProcessingError) {
      // Hiển thị lỗi xử lý ảnh, productForm.setError có thể dùng ở đây nếu bạn muốn tích hợp với react-hook-form errors
      imageManager.setImageError(imageProcessingError);
      console.error("Image processing error:", imageProcessingError);
      return; // Dừng submit nếu có lỗi ảnh
    }

    if (processedImages.length === 0) {
        imageManager.setImageError("Vui lòng cung cấp ít nhất một ảnh cho sản phẩm.");
        return;
    }

    try {
      await productForm.handleFormSubmit(formData, processedImages);
      // Sau khi submit thành công, reset image manager
      imageManager.resetImageManager();
    } catch (error) {
      // Lỗi từ handleFormSubmit (ví dụ API error) đã được log trong hook
      // Bạn có thể thêm logic hiển thị lỗi chung ở đây nếu muốn
      console.error("Product submission failed:", error);
    }
  };
  
  // Khi drawer đóng (không phải do submit thành công, ví dụ bấm nút X hoặc click ra ngoài)
  const handleCloseDrawer = () => {
    productForm.resetForm(); // Reset các trường của form
    imageManager.resetImageManager(); // Reset trạng thái của image manager
    onClose(); // Gọi prop onClose từ component cha
  };


  if (dataLoading) {
    return (
      <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 400, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Drawer>
    );
  }

  return (
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%", overflowY: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Thêm sản phẩm</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>

        {dataError && <Typography color="error" mb={2}>{dataError}</Typography>}

        <form onSubmit={productForm.handleSubmit(handleMainSubmit)}>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Tên sản phẩm</Typography>
            <InputBase {...productForm.register("name", { required: "Tên sản phẩm là bắt buộc" })} fullWidth required placeholder="Nhập tên sản phẩm" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
            {/* {productForm.formState.errors.name && <Typography color="error" variant="caption">{productForm.formState.errors.name.message}</Typography>} */}
          </Box>

          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Mô tả</Typography>
            <InputBase {...productForm.register("description", { required: "Mô tả là bắt buộc" })} fullWidth required multiline rows={3} placeholder="Nhập mô tả sản phẩm" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '8px' }}/>
            {/* {productForm.formState.errors.description && <Typography color="error" variant="caption">{productForm.formState.errors.description.message}</Typography>} */}
          </Box>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Danh mục</Typography>
            <Select 
              {...productForm.register("categoryId", { required: "Vui lòng chọn danh mục" })} 
              fullWidth 
              displayEmpty 
              defaultValue=""
              error={!!errors?.categoryId} // Sử dụng optional chaining (?.), an toàn hơn nếu errors có thể undefined ban đầu
              sx={{borderColor: errors?.categoryId ? 'red' : undefined }}
            >
              <MenuItem value="" disabled>Chọn danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
            {errors?.categoryId && <Typography color="error" variant="caption" sx={{mt: 0.5}}>{errors.categoryId.message}</Typography>}
          </Box>

          {/* Ví dụ với trường Thương hiệu */}
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Thương hiệu</Typography>
            <Select 
              {...productForm.register("brandId", { required: "Vui lòng chọn thương hiệu" })} 
              fullWidth 
              displayEmpty 
              defaultValue=""
              error={!!errors?.brandId}
              sx={{borderColor: errors?.brandId ? 'red' : undefined }}
            >
              <MenuItem value="" disabled>Chọn thương hiệu</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
              ))}
            </Select>
            {errors?.brandId && <Typography color="error" variant="caption" sx={{mt: 0.5}}>{errors.brandId.message}</Typography>}
          </Box>
          {/* Phần chọn ảnh với Tab */}
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Ảnh sản phẩm</Typography>
            <Tabs value={imageManager.tabValue} onChange={(e, newValue) => imageManager.setTabValue(newValue)} indicatorColor="primary" textColor="primary">
              <Tab label="Tải ảnh lên" />
              <Tab label="Nhập URL" />
            </Tabs>

            {imageManager.tabValue === 0 ? (
              // Tab Upload ảnh
              <Box mt={2}>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={imageManager.handleImageUploadFromDevice}
                  style={{ display: 'block', marginBottom: '16px' }}
                />
                {imageManager.uploadingImage && <CircularProgress size={24} sx={{my: 1}}/>}
                <Box mt={1} display="flex" flexWrap="wrap" gap={1}>
                  {imageManager.localImages.map((img, index) => (
                    <Box key={index} position="relative" border={img.isPrimary ? "2px solid blue" : "1px solid #ccc"} p={0.5} borderRadius={1}>
                      <img src={img.preview} alt={`Preview ${index}`} width={80} height={80} style={{ objectFit: 'cover', display: 'block' }} />
                      <Button
                        size="small"
                        color="error"
                        variant="contained"
                        onClick={() => imageManager.handleRemoveLocalImage(index)}
                        sx={{ position: 'absolute', top: -5, right: -5, minWidth: '20px', height: '20px', p:0, borderRadius: '50%' }}
                      >
                        X
                      </Button>
                      {!img.isPrimary && (
                        <Button
                            size="small"
                            onClick={() => imageManager.setPrimaryLocalImage(index)}
                            sx={{ fontSize: '0.6rem', p: '2px 4px', position: 'absolute', bottom: 0, left:0, right:0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'}}}
                        >
                            Đặt làm chính
                        </Button>
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              // Tab URL ảnh
              <Box mt={2}>
                {imageManager.imageUrls.map((url, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      size="small"
                      value={url}
                      onChange={(e) => imageManager.handleUrlInputChange(index, e.target.value)}
                      placeholder="Nhập URL ảnh"
                    />
                    {imageManager.imageUrls.length > 1 && (
                      <IconButton onClick={() => imageManager.handleRemoveUrlInput(index)} size="small" sx={{ml: 0.5}}>
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                 {imageManager.uploadingImage && <CircularProgress size={24} sx={{my: 1}}/>}
                <Button onClick={imageManager.handleAddUrlField} variant="outlined" size="small" sx={{ mt: 1 }}>
                  Thêm URL khác
                </Button>
              </Box>
            )}
            {imageManager.imageError && (
              <Typography color="error" mt={1} variant="caption">{imageManager.imageError}</Typography>
            )}
          </Box>

          {/* TODO: Thêm FieldArray cho variants nếu cần */}
          {/* Ví dụ: <ProductVariantsControl control={productForm.control} register={productForm.register} /> */}

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
                type="button" 
                variant="outlined" 
                onClick={handleCloseDrawer} 
                sx={{ mr: 1, borderRadius: 2 }}
                disabled={imageManager.uploadingImage || productForm.formState?.isSubmitting}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={imageManager.uploadingImage || productForm.formState?.isSubmitting} // Vô hiệu hóa khi đang tải ảnh hoặc submit form
                sx={{ bgcolor: "black", color: "white", borderRadius: 2, "&:hover": { bgcolor: "grey.800" }, "&:disabled": { bgcolor: "grey.400"} }}
            >
              { (imageManager.uploadingImage || productForm.formState?.isSubmitting) ? <CircularProgress size={24} color="inherit" /> : "Thêm Sản phẩm" }
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default ProductDrawer;