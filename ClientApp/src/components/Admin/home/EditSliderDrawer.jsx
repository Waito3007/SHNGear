import React, { useState, useEffect, useCallback, } from "react";
import { Drawer, IconButton, TextField, Button, Typography, Stack, Box, Alert, FormControlLabel, Checkbox, Snackbar, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const initialImageState = { imageUrl: '', isPrimary: false};
const EditSliderDrawer = ({ isOpen, onClose, slider, onUpdateSldier }) => {
  const [formData, setFormData] = useState({
    title: '',
    images: [initialImageState],
    link: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
      if(slider) {
        setFormData({
          titlle: slider.title || "",
          images:
            slider.images?.length > 0 ? slider.images.map((img) => ({
              imageUrl: img.imageUrl || "",
              isPrimary: img.isPrimary || false,
            })) : [initialImageState],
          link: slider.link || "",
        });
      } else {
        setFormData({
          title: "",
          images: [initialImageState],
          link: ""
        })
      }
    }, [slider]);

  const handleChange = useCallback ((e, index, type) => {
    const { name, value, checked, type: inputType} = e.target;

    setFormData((prev) =>{
      const newState = { ...prev };
      if(type === "link" && index !== undefined) {
        const newLink = [...newState.link];
        newLink[index] = {
          ...newLink[index],
          [name]: inputType === "checkbox" ? checked : value,
        }
      } else if (type === "image" && index !== undefined) {
        let newImages = newState.images.map((img, i) => {
          if(i === index) {
            return {
              ...img,
              [name]: inputType === "checkbox" ? checked : value,
            };
          }
          return img;
        });

        if(name === "isPrimary" && checked){
          newImages = newImages.map((img, i) => ({
            ...img,
            isPrimary: i === index,
          }));
        }
        newImages.images = newImages;
      } else {
        newState[name] = value;
      }
      return newState;
    });
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
      setError("Vui lòng chọn 1 ảnh.");
    setLoading(false);
    return;
    }
    
    try{
      const updatedData = {
        title: formData.title,
        images: formData.images
          .filter(img => img.imageUrl && img.imageUrl.trim() !== "")
          .map(img => ({
            imageUrl: img.imageUrl,
            isPrimary: img.isPrimary || false,
          })),
      };

      console.log("Submitting data:", updatedData);
      const response = await axios.put(
        `${API_BASE_URL}/api/Slider/${slider.id}`,
        updatedData,
        {headers: { "Content-Type": "application/json" }}
      );

      if(response.status === 204 || response.status === 200) {
        const updatedSliderData = response.data && Object.keys(response.data).length > 0 ? response.data : { ...slider, ...updatedData};
        onUpdateSldier(updatedSliderData);
        setSuccessMessage("Slider đã được cập nhật thành công!");
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
      setError(`Lỗi khi cập nhật Slider: ${errorMessage}`);
      console.error("Lỗi khi cập nhật sản phẩm:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [formData, slider, onUpdateSldier]);

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
          <Stack spacing={2.5}>
            <TextField
              label="Tiêu đề Slider"
              name="name"
              value ={formData.value}
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
                  label={`URL Hình ảnh ${index + 1}`}
                  name="imageUrl"
                  value={image.imageUrl}
                  onChange={(e) => handleChange(e, index, "image")}
                  fullWidth
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

export default React.memo(EditSliderDrawer);
