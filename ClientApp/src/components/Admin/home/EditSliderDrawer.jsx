import React, { useState, useEffect, useCallback } from "react";
import { Drawer, IconButton, TextField, Button, Typography, Stack, Box, Alert, Snackbar, CircularProgress, FormControlLabel, Switch } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close"
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Tabs, Tab } from "@mui/material";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const EditSliderDrawer = ({ isOpen, onClose, slider, onUpdateSlider }) => {
  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    linkToProduct: '',
    status: true,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageTab, setImageTab] = useState(0); // 0: link, 1: file
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  
  useEffect(() => {
    if (slider) {
      setFormData({
        title: slider.title || "",
        status: !(slider.status ?? false),
        imageUrl: slider.imageUrl || "",
        linkToProduct: slider.linkToProduct || slider.link || "",
      });
      setImagePreview(slider.imageUrl || "");
      setImageTab(0);
      setSelectedFile(null);
    } else {
      setFormData({
        title: "",
        imageUrl: "",
        linkToProduct: "",
        status: true,
      });
      setImagePreview("");
      setImageTab(0);
      setSelectedFile(null);
    }
    setImageError("");
  }, [slider]);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Validate file type
    if (!file.type.match('image.*')) {
      setImageError("Chỉ chấp nhận file ảnh");
      return;
    }
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Kích thước ảnh tối đa 5MB");
      return;
    }
    setImageError("");
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear URL nếu đang ở tab upload
    if (imageTab === 1) {
      setFormData((prev) => ({ ...prev, imageUrl: "" }));
    }
  };

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === "imageUrl") {
      setImagePreview(value);
      setImageError("");
    }
  }, []);

  // Removed addImage and removeImage logic

  const handleSubmit = useCallback (async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    let imageUrl = formData.imageUrl;
    if (imageTab === 1) {
      if (!selectedFile) {
        setError("Vui lòng chọn file ảnh.");
        setLoading(false);
        return;
      }
      try {
        const data = new FormData();
        data.append("file", selectedFile);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
        const res = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: data,
          signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) throw new Error("Upload thất bại");
        const result = await res.json();
        if (!result.url && !result.imageUrl) throw new Error("Upload thất bại");
        imageUrl = result.url || result.imageUrl;
      } catch (err) {
        setError("Upload ảnh thất bại hoặc quá lâu. Vui lòng thử lại hoặc chọn ảnh khác.");
        setLoading(false);
        return;
      }
    } else {
      if (!imageUrl || imageUrl.trim() === "") {
        setError("Vui lòng nhập URL hình ảnh.");
        setLoading(false);
        return;
      }
      if (imageError) {
        setError("URL hình ảnh không hợp lệ hoặc không load được ảnh.");
        setLoading(false);
        return;
      }
    }

    if (!slider || !slider.id) {
      setError("Không tìm thấy slider để cập nhật.");
      setLoading(false);
      return;
    }
    try{
      const updatedData = {
        title: formData.title,
        linkToProduct: formData.linkToProduct,
        status: !formData.status,
        imageUrl: imageUrl,
      };

      console.log("Submitting data:", updatedData);
      const response = await axios.put(
        `${API_BASE_URL}/api/Slider/${slider.id}`,
        updatedData,
        {headers: { "Content-Type": "application/json" }}
      );

      if(response.status === 204 || response.status === 200) {
        const updatedSliderData = response.data && Object.keys(response.data).length > 0 ? response.data : { ...slider, ...updatedData};
        onUpdateSlider(updatedSliderData);
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
      console.error("Lỗi khi cập nhật Slider:", err.response || err);
    } finally {
      setLoading(false);
    }
  }, [formData, slider, onUpdateSlider, imageTab, selectedFile, imageError]);

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
            Chỉnh sửa thông tin Slider
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
              name="title"
              value={formData.title}
              onChange={handleChange}
              fullWidth
              required
              disabled={loading}
            />

            <TextField
              label="Liên kết đến sản phẩm"
              name="linkToProduct"
              value={formData.linkToProduct}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              sx={{ mt: 1 }}
            />

            <Box>
              <Tabs value={imageTab} onChange={(_, v) => setImageTab(v)} aria-label="Chọn cách thêm ảnh" sx={{ mb: 2 }}>
                <Tab label="Nhập link ảnh" />
                <Tab label="Chọn file ảnh" />
              </Tabs>
              {imageTab === 0 ? (
                <>
                  <TextField
                    label="URL Hình ảnh"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    fullWidth
                    disabled={loading}
                    variant="outlined"
                    size="small"
                    required
                    error={!!imageError}
                    helperText={imageError}
                  />
                  {imagePreview && (
                    <Box mt={2} display="flex" justifyContent="center">
                      <img
                        src={imagePreview.startsWith("http") ? imagePreview : `${API_BASE_URL}${imagePreview}`}
                        alt="Preview"
                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }}
                        onError={() => setImageError("Không thể load ảnh từ URL này.")}
                        onLoad={() => setImageError("")}
                      />
                    </Box>
                  )}
                </>
              ) : (
                <>
                  <Button
                    component="label"
                    variant="outlined"
                    fullWidth
                    sx={{ mb: 2 }}
                  >
                    Chọn file ảnh
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Button>
                  {imagePreview && (
                    <Box mt={1} display="flex" flexDirection="column" alignItems="center">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc", marginBottom: 8 }}
                      />
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          setSelectedFile(null);
                          setImagePreview("");
                          setImageError("");
                        }}
                      >
                        Xóa ảnh
                      </Button>
                    </Box>
                  )}
                </>
              )}
              {imageError && (
                <Typography color="error" variant="body2" mt={1}>
                  {imageError}
                </Typography>
              )}
            </Box>

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
            
            {/* Removed add image button */}

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
