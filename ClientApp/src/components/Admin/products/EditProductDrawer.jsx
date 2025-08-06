import React, { useState, useEffect, useCallback, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close"; // Thêm icon Close
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Grid,
  Checkbox,
  FormControlLabel,
  Snackbar,
} from "@mui/material";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Giá trị khởi tạo cho một biến thể mới
const initialVariantState = {
  color: "",
  storage: "",
  price: "",
  discountPrice: "",
  stockQuantity: "",
  flashSaleStart: "",
  flashSaleEnd: "",
};

// Giá trị khởi tạo cho một ảnh mới
const initialImageState = { imageUrl: "", isPrimary: false };

// Hàm định dạng ngày giờ cho datetime-local input
const formatDateTimeForInput = (dateTimeString) => {
  if (!dateTimeString) return "";
  try {
    // Cố gắng tạo đối tượng Date, nếu không hợp lệ, trả về chuỗi rỗng
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return ""; // Kiểm tra nếu date không hợp lệ
    return date.toISOString().slice(0, 16);
  } catch (e) {
    return ""; // Trả về rỗng nếu có lỗi khi parse date
  }
};

const EditProductDrawer = ({ isOpen, onClose, product, onUpdateProduct }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    brandId: "",
    images: [initialImageState],
    variants: [initialVariantState],
  });
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Khởi tạo formData từ product prop khi product thay đổi hoặc drawer mở lần đầu với product
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        categoryId: product.categoryId || "",
        brandId: product.brandId || "",
        images:
          product.images?.length > 0
            ? product.images.map((img) => ({
                imageUrl: img.imageUrl || "",
                isPrimary: img.isPrimary || false,
              }))
            : [initialImageState],
        variants:
          product.variants?.length > 0
            ? product.variants.map((variant) => ({
                color: variant.color || "",
                storage: variant.storage || "",
                price: variant.price || "",
                discountPrice: variant.discountPrice || "",
                stockQuantity: variant.stockQuantity || "",
                flashSaleStart: formatDateTimeForInput(variant.flashSaleStart),
                flashSaleEnd: formatDateTimeForInput(variant.flashSaleEnd),
              }))
            : [initialVariantState],
      });
    } else {
      // Reset form nếu không có product (trường hợp này ít xảy ra với "Edit" drawer)
      setFormData({
        name: "",
        description: "",
        categoryId: "",
        brandId: "",
        images: [initialImageState],
        variants: [initialVariantState],
      });
    }
  }, [product]);

  // Lấy danh sách categories và brands khi drawer mở
  useEffect(() => {
    const fetchDropdownData = async () => {
      // Chỉ fetch nếu chưa có dữ liệu hoặc muốn refresh khi mở
      if (isOpen && (categories.length === 0 || brands.length === 0)) {
        setLoading(true); // Có thể thêm loading state riêng cho việc fetch này
        try {
          const [categoriesResponse, brandsResponse] = await Promise.all([
            axios.get(`${API_BASE_URL}/api/categories`),
            axios.get(`${API_BASE_URL}/api/brands`),
          ]);
          setCategories(categoriesResponse.data.$values || categoriesResponse.data || []);
          setBrands(brandsResponse.data.$values || brandsResponse.data || []);
        } catch (err) {
          console.error("Lỗi khi lấy dữ liệu categories/brands:", err);
          setError("Không thể tải dữ liệu danh mục hoặc thương hiệu.");
          // Giữ lại dữ liệu cũ nếu có, hoặc set rỗng nếu chưa có
          if (categories.length === 0) setCategories([]);
          if (brands.length === 0) setBrands([]);
        } finally {
          setLoading(false); // Kết thúc loading state riêng (nếu có)
        }
      }
    };
    fetchDropdownData();
  }, [isOpen]); // Phụ thuộc vào isOpen để fetch khi mở

  // Xử lý thay đổi giá trị trong form
  const handleChange = useCallback((e, index, type) => {
    const { name, value, checked, type: inputType } = e.target;

    setFormData((prev) => {
      const newState = { ...prev };
      if (type === "variant" && index !== undefined) {
        const newVariants = [...newState.variants];
        newVariants[index] = {
          ...newVariants[index],
          [name]: inputType === "checkbox" ? checked : value,
        };
        newState.variants = newVariants;
      } else if (type === "image" && index !== undefined) {
        let newImages = newState.images.map((img, i) => {
          if (i === index) {
            return {
              ...img,
              [name]: inputType === "checkbox" ? checked : value,
            };
          }
          return img;
        });

        // Nếu chọn ảnh này làm primary, bỏ primary của các ảnh khác
        if (name === "isPrimary" && checked) {
          newImages = newImages.map((img, i) => ({
            ...img,
            isPrimary: i === index,
          }));
        }
        newState.images = newImages;
      } else {
        newState[name] = value;
      }
      return newState;
    });
  }, []);

  const addVariant = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      variants: [...prev.variants, { ...initialVariantState }],
    }));
  }, []);

  const removeVariant = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  }, []);

  const addImage = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, { ...initialImageState }],
    }));
  }, []);

  const removeImage = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  }, []);

  // Gửi dữ liệu cập nhật lên API
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validate: Nếu có ảnh, ít nhất một ảnh phải là primary
    const hasImages = formData.images.some(img => img.imageUrl && img.imageUrl.trim() !== "");
    if (hasImages && !formData.images.some(img => img.isPrimary)) {
      setError("Vui lòng chọn một ảnh làm ảnh chính (primary).");
      setLoading(false);
      return;
    }

    try {
      const updatedData = {
        name: formData.name,
        description: formData.description,
        categoryId: parseInt(formData.categoryId),
        brandId: parseInt(formData.brandId),
        images: formData.images
          .filter(img => img.imageUrl && img.imageUrl.trim() !== "") // Chỉ gửi những ảnh có URL
          .map(img => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || false,
          })),
        variants: formData.variants.map(variant => ({
          ...variant, // Giữ lại các trường không thay đổi như color, storage
          price: parseFloat(variant.price) || 0,
          discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
          // API có thể mong muốn null nếu không có ngày
          flashSaleStart: variant.flashSaleStart || null,
          flashSaleEnd: variant.flashSaleEnd || null,
        })),
      };

      console.log("Submitting data:", updatedData);

      const response = await axios.put(
        `${API_BASE_URL}/api/products/${product.id}`,
        updatedData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 204 || response.status === 200) {
        // Dữ liệu trả về từ API có thể là sản phẩm đã cập nhật đầy đủ
        const updatedProductData = response.data && Object.keys(response.data).length > 0 ? response.data : { ...product, ...updatedData };
        onUpdateProduct(updatedProductData);
        setSuccessMessage("Sản phẩm đã được cập nhật thành công!");
        // Tự động đóng Drawer sau một khoảng thời gian hoặc để người dùng tự đóng
        // setTimeout(() => {
        //   handleCloseDrawer();
        // }, 2000);
      } else {
        setError(`Cập nhật thất bại với status: ${response.status}`);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.title || // For ASP.NET Core ModelState errors
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('; ') : null) || // For detailed validation errors
        err.message ||
        "Đã xảy ra lỗi không xác định.";
      setError(`Lỗi khi cập nhật sản phẩm: ${errorMessage}`);
      console.error("Lỗi khi cập nhật sản phẩm:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [formData, product, onUpdateProduct]); // Không cần onClose ở đây nữa, sẽ xử lý riêng

  const handleCloseDrawer = useCallback(() => {
    setError(null); // Reset lỗi khi đóng
    setSuccessMessage(null); // Reset thông báo thành công
    onClose(); // Gọi hàm onClose từ props
  }, [onClose]);

  const handleCloseSnackbar = useCallback((event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    if (successMessage) setSuccessMessage(null);
    if (error) setError(null); // Có thể muốn giữ lỗi hiển thị trên form
  }, [successMessage, error]);

  // Memoized MenuItems
  const categoryMenuItems = useMemo(() => (
    categories.length > 0 ? (
      categories.map(cat => (
        <MenuItem key={cat.id} value={cat.id}>
          {cat.name}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>
        {isOpen && categories.length === 0 && !error ? "Đang tải danh mục..." : "Không có danh mục"}
      </MenuItem>
    )
  ), [categories, isOpen, error]);

  const brandMenuItems = useMemo(() => (
    brands.length > 0 ? (
      brands.map(brand => (
        <MenuItem key={brand.id} value={brand.id}>
          {brand.name}
        </MenuItem>
      ))
    ) : (
      <MenuItem disabled>
        {isOpen && brands.length === 0 && !error ? "Đang tải thương hiệu..." : "Không có thương hiệu"}
      </MenuItem>
    )
  ), [brands, isOpen, error]);


  return (
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer}>
      <Box sx={{ width: { xs: "100vw", sm: 500, md: 600 }, p: {xs: 2, md: 3} }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            Chỉnh sửa thông tin sản phẩm
          </Typography>
          <IconButton onClick={handleCloseDrawer} aria-label="Đóng">
            <CloseIcon />
          </IconButton>
        </Stack>

        {/* Thông báo lỗi ưu tiên hiển thị trên form */}
        {error && !successMessage && ( // Chỉ hiển thị Alert lỗi nếu không có thông báo thành công
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack spacing={2.5}> {/* Tăng khoảng cách một chút */}
            <TextField
              label="Tên sản phẩm"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
              variant="outlined"
            />
            <TextField
              label="Mô tả"
              name="description"
              value={formData.description}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              required
              disabled={loading}
              variant="outlined"
            />
            <TextField
              label="Danh mục"
              name="categoryId"
              select
              value={formData.categoryId}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading || categories.length === 0}
              variant="outlined"
            >
              {categoryMenuItems}
            </TextField>
            <TextField
              label="Thương hiệu"
              name="brandId"
              select
              value={formData.brandId}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading || brands.length === 0}
              variant="outlined"
            >
              {brandMenuItems}
            </TextField>

            <Typography variant="h6" component="h2" mt={1} mb={0}> {/* Giảm margin top */}
              Hình ảnh
            </Typography>
            {formData.images.map((image, index) => (
              <Stack key={`image-${index}`} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  label={`URL Hình ảnh ${index + 1}`}
                  name="imageUrl"
                  value={image.imageUrl}
                  onChange={(e) => handleChange(e, index, "image")}
                  fullWidth
                  // required={formData.images.length === 1 || !!image.imageUrl} // Ảnh đầu tiên hoặc có URL thì bắt buộc
                  disabled={loading}
                  variant="outlined"
                  size="small"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      name="isPrimary"
                      checked={!!image.isPrimary}
                      onChange={(e) => handleChange(e, index, "image")}
                      disabled={loading}
                      size="small"
                    />
                  }
                  label="Ảnh chính"
                  sx={{ whiteSpace: 'nowrap', mr: 'auto' }} // Đẩy nút xóa sang phải
                />
                {formData.images.length > 0 && ( // Luôn cho phép xóa nếu có ảnh, có thể để lại 1 ảnh trống
                  <IconButton
                    onClick={() => removeImage(index)}
                    color="error"
                    disabled={loading}
                    aria-label={`Xóa hình ảnh ${index + 1}`}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Stack>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addImage}
              disabled={loading}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm ảnh
            </Button>

            <Typography variant="h6" component="h2" mt={1} mb={0}>
              Biến thể sản phẩm
            </Typography>
            {formData.variants.map((variant, index) => (
              <Box key={`variant-${index}`} sx={{ border: "1px solid #e0e0e0", p: 2, mb: 1.5, borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
                    <Typography variant="subtitle1" component="h3">
                        Biến thể {index + 1}
                    </Typography>
                    {formData.variants.length > 1 && (
                        <IconButton
                            onClick={() => removeVariant(index)}
                            color="error"
                            disabled={loading}
                            aria-label={`Xóa biến thể ${index + 1}`}
                            size="small"
                        >
                        <DeleteIcon />
                        </IconButton>
                    )}
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Màu sắc"
                      name="color"
                      value={variant.color}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      required
                      disabled={loading}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Dung lượng lưu trữ"
                      name="storage"
                      value={variant.storage}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      required
                      disabled={loading}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Giá"
                      name="price"
                      type="number"
                      value={variant.price}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      required
                      disabled={loading}
                      inputProps={{ min: 0, step: "any" }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Giá giảm"
                      name="discountPrice"
                      type="number"
                      value={variant.discountPrice}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      disabled={loading}
                      inputProps={{ min: 0, step: "any" }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Số lượng tồn kho"
                      name="stockQuantity"
                      type="number"
                      value={variant.stockQuantity}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      required
                      disabled={loading}
                      inputProps={{ min: 0 }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Bắt đầu Flash Sale"
                      name="flashSaleStart"
                      type="datetime-local"
                      value={variant.flashSaleStart}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Kết thúc Flash Sale"
                      name="flashSaleEnd"
                      type="datetime-local"
                      value={variant.flashSaleEnd}
                      onChange={(e) => handleChange(e, index, "variant")}
                      fullWidth
                      disabled={loading}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{ min: variant.flashSaleStart || undefined }}
                      variant="outlined"
                      size="small"
                    />
                  </Grid>
                </Grid>
              </Box>
            ))}
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addVariant}
              disabled={loading}
              size="small"
              sx={{ alignSelf: 'flex-start' }}
            >
              Thêm biến thể
            </Button>

            <Stack direction={{xs: "column", sm: "row"}} spacing={2} mt={3}>
              <Button
                variant="outlined"
                onClick={handleCloseDrawer}
                disabled={loading}
                fullWidth
              >
                Hủy
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {loading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Box>
      <Snackbar
        open={!!successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }} variant="filled">
          {successMessage}
        </Alert>
      </Snackbar>
      {/* Snackbar cho lỗi có thể không cần thiết nếu lỗi đã hiển thị rõ trên form */}
      {/* <Snackbar
        open={!!error && !successMessage}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }} variant="filled">
          {error}
        </Alert>
      </Snackbar> */}
    </Drawer>
  );
};

export default React.memo(EditProductDrawer);