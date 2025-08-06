import { Drawer, IconButton, TextField, Button, Typography, CircularProgress, InputBase, Box, Tabs, Tab } from "@mui/material";
import { useState, useRef } from "react";
import { Close } from "@mui/icons-material";
import { useSliderForm } from "hook/sliders/useSliderForm";


const AddSliderDrawer = ({ isOpen, onClose, onAddSlider }) => {
  const sliderForm = useSliderForm({
    onAddSlider,
    onClose,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageError, setImageError] = useState("");
  const [imageTab, setImageTab] = useState(0); // 0: link, 1: file
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
      sliderForm.setValue && sliderForm.setValue("imageUrl", "");
    }
  };

  const handleMainSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);
    let imageUrl = formData.imageUrl;
    if (imageTab === 1) {
      if (!selectedFile) {
        setImageError("Vui lòng chọn file ảnh.");
        setSubmitting(false);
        return;
      }
      try {
        const data = new FormData();
        data.append("file", selectedFile);
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
        const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/upload`, {
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
        setImageError("Upload ảnh thất bại hoặc quá lâu. Vui lòng thử lại hoặc chọn ảnh khác.");
        setSubmitting(false);
        return;
      }
    } else {
      if (!imageUrl || imageUrl.trim() === "") {
        setImageError("Vui lòng nhập URL hình ảnh.");
        setSubmitting(false);
        return;
      }
      if (imageError) {
        setImageError("URL hình ảnh không hợp lệ hoặc không load được ảnh.");
        setSubmitting(false);
        return;
      }
    }
    try {
      const result = await sliderForm.handleFormSubmit({ ...formData, imageUrl });
      if (result && result.error) {
        setImageError(result.error);
      }
    } catch (error) {
      setImageError("Lỗi gửi dữ liệu slider.");
      console.error("Error submitting slider data:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    sliderForm.resetForm();
    onClose();
  };

  return(
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%", overflowY: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Thêm Slider</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>
        <form onSubmit={sliderForm.handleSubmit(handleMainSubmit)}>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Tiêu đề slider</Typography>
            <InputBase {...sliderForm.register("title", { required: "Tiêu đề Slider là bắt buộc" })} fullWidth required placeholder="Nhập tiêu đề Slider" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
          </Box>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Tabs value={imageTab} onChange={(_, v) => setImageTab(v)} aria-label="Chọn cách thêm ảnh" sx={{ mb: 2 }}>
              <Tab label="Nhập link ảnh" />
              <Tab label="Chọn file ảnh" />
            </Tabs>
            {imageTab === 0 ? (
              <Box>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...sliderForm.register("imageUrl", {
                    required: "URL hình ảnh là bắt buộc",
                    onChange: (e) => {
                      const url = e.target.value;
                      setImagePreview(url);
                      setImageError("");
                      setSelectedFile(null);
                    }
                  })}
                  placeholder="Nhập URL hình ảnh"
                  required
                  error={!!imageError}
                  helperText={imageError}
                />
                {imagePreview && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }}
                      onError={() => setImageError("Không thể load ảnh từ URL này.")}
                      onLoad={() => setImageError("")}
                    />
                  </Box>
                )}
              </Box>
            ) : (
              <Box>
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
              </Box>
            )}
            {imageError && (
              <Typography color="error" variant="body2" mt={1}>
                {imageError}
              </Typography>
            )}
          </Box>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Liên kết đến sản phẩm</Typography>
            <InputBase
              {...sliderForm.register("linkToProduct")}
              fullWidth
              placeholder="Nhập URL liên kết sản phẩm"
              sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}
            />
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
                type="button" 
                variant="outlined" 
                onClick={handleCloseDrawer} 
                sx={{ mr: 1, borderRadius: 2 }}
                disabled={sliderForm.formState?.isSubmitting}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ bgcolor: "black", color: "white", borderRadius: 2, "&:hover": { bgcolor: "grey.800" }, "&:disabled": { bgcolor: "grey.400"} }}
            >
              { submitting ? <CircularProgress size={24} color="inherit" /> : "Thêm slider" }
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
}

export default AddSliderDrawer;
