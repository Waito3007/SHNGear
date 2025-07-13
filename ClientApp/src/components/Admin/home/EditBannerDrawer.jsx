import React, { useState, useEffect, useCallback, } from "react";
import { Drawer, IconButton, TextField, Button, Typography, Stack, Box, Alert, Snackbar, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const initialImageState = { imageUrl: ''};
const EditBannerDrawer = ({ isOpen, onClose, banner, onUpdateBanner }) => {
  const [formData, setFormData] = useState({
    title: '',
    images: [initialImageState],
    status: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    if (banner) {
      setFormData({
        title: banner.title || "",
        status: !(banner.status ?? false),
        images:
          banner.images?.length > 0
            ? banner.images.map((img) => ({
                imageUrl: img.imageUrl || "",
              }))
            : [initialImageState],
      });
    } else {
      setFormData({
        title: "",
        status: true,
        images: [initialImageState],
      });
    }
  }, [banner]);

  const handleChange = useCallback((e, index, type) => {
    const { name, value, checked, type: inputType } = e.target;
    setFormData((prev) => {
      if (type === "image" && index !== undefined) {
        let newImages = prev.images.map((img, i) => {
          if (i === index) {
            return {
              ...img,
              [name]: inputType === "checkbox" ? checked : value,
            };
          }
          return img;
        });
        return { ...prev, images: newImages };
      } else {
        return { ...prev, [name]: value };
      }
    });
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

  const handleSubmit = useCallback (async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const hasImages = formData.images.some(img => img.imageUrl && img.imageUrl.trim() !== "");
    if(hasImages && !formData.images.some(img => img.imageUrl && img.imageUrl.trim() !== "")) {
      setError("Vui lòng chọn ảnh.");
    setLoading(false);
    return;
    }

    if (!banner || !banner.id) {
      setError("Không tìm thấy banner để cập nhật.");
      setLoading(false);
      return;
    }
    
    try{
      const updatedData = {
        title: formData.title,
        status: !formData.status,
        images: formData.images
          .filter(img => img.imageUrl && img.imageUrl.trim() !== "")
          .map(img => ({
            imageUrl: img.imageUrl,
          })),
      };

      console.log("Submitting data:", updatedData);
      const response = await axios.put(
        `${API_BASE_URL}/api/Banner/${banner.id}`,
        updatedData,
        {headers: { "Content-Type": "application/json" }}
      );

      if(response.status === 204 || response.status === 200) {
        const updatedBannerData = response.data && Object.keys(response.data).length > 0 ? response.data : { ...banner, ...updatedData};
        onUpdateBanner(updatedBannerData);
        setSuccessMessage("Banner đã được cập nhật thành công!");
      } else {
        setError(`Cập nhật thất bại với status: ${response.status}`)
      }

    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.title ||
        (err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('; ') : null) ||
        err.message ||
        "Đã xảy ra lỗi không xác định";
      setError(`Lỗi khi cập nhật Banner: ${errorMessage}`);
      console.error("Lỗi khi cập nhật Banner:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [formData, banner, onUpdateBanner]);

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

  return (
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer}>
      <Box sx={{ width: { xs: "100vw", sm: 500, md: 600 }, p: {xs: 2, md: 3} }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" component="h1">
            Chỉnh sửa thông tin Banner
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
          <Stack spacing={2.5}>
            <TextField
              label="Tiêu đề Banner"
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />

            <Typography variant="h6" component="h2" mt={1} mb={0}> {/* Giảm margin top */}
              Hình ảnh
            </Typography>
            {formData.images.map((image, index) => (
              <Stack key={`image-${index}`} direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <TextField
                  label={`URL Hình ảnh`}
                  name="imageUrl"
                  value={image.imageUrl}
                  onChange={(e) => handleChange(e, index, "image")}
                  fullWidth
                  disabled={loading}
                  variant="outlined"
                  size="small"
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

            <FormControlLabel
              control={
                <Switch
                  checked={formData.status ?? true}
                  onChange={(e) => setFormData((prev) => ({
                  ...prev,
                  status: e.target.checked,
                }))}
                color="primary"
                disabled={loading}
                />
              }
              label={formData.status ? "Hiển thị" : "Ẩn"}
            />
            
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addImage}
              disabled={loading}
              size="small"
              sx={{ alignSelf: 'flex-start'}}
            >
              Thêm ảnh
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
    </Drawer>
  );
};

export default React.memo(EditBannerDrawer);
