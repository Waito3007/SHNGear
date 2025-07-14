import { Drawer, IconButton, TextField, Button, Typography, CircularProgress, InputBase, Box, Tabs, Tab } from "@mui/material";
import { useState } from "react";
import { Close } from "@mui/icons-material";
import { useBannerForm } from "hook/banners/useBannerForm";


const AddBannerDrawer = ({ isOpen, onClose, onAddBanner }) => {
  const bannerForm = useBannerForm({
    onAddBanner,
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
    if (!file.type.match('image.*')) {
      setImageError("Chỉ chấp nhận file ảnh");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Kích thước ảnh tối đa 5MB");
      return;
    }
    setImageError("");
    setSelectedFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (imageTab === 1) {
      bannerForm.setValue && bannerForm.setValue("imageUrl", "");
    }
  };

  const handleMainSubmit = async (formData) => {
    if (submitting) return;
    setSubmitting(true);
    let imageUrl = formData.imageUrl;
    if (imageTab === 1) {
      if (!selectedFile) {
        bannerForm.setError && bannerForm.setError("Vui lòng chọn file ảnh.");
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
        bannerForm.setError && bannerForm.setError("Upload ảnh thất bại hoặc quá lâu. Vui lòng thử lại hoặc chọn ảnh khác.");
        setSubmitting(false);
        return;
      }
    } else {
      if (!imageUrl || imageUrl.trim() === "") {
        bannerForm.setError && bannerForm.setError("Vui lòng nhập URL hình ảnh.");
        setSubmitting(false);
        return;
      }
      if (imageError) {
        bannerForm.setError && bannerForm.setError("URL hình ảnh không hợp lệ hoặc không load được ảnh.");
        setSubmitting(false);
        return;
      }
    }
    try {
      await bannerForm.handleFormSubmit({ ...formData, imageUrl });
    } catch (error) {
      bannerForm.setError && bannerForm.setError("Lỗi gửi dữ liệu banner.");
      console.error("Error submitting banner data:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseDrawer = () => {
    bannerForm.resetForm();
    onClose();
  };

  return(
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%", overflowY: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Thêm Banner</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>
        <form onSubmit={bannerForm.handleSubmit(handleMainSubmit)}>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Tiêu đề Banner</Typography>
            <InputBase {...bannerForm.register("title", { required: "Tiêu đề Banner là bắt buộc" })} fullWidth required placeholder="Nhập tiêu đề Banner" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
          </Box>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Link chuyển tới (linkTo)</Typography>
            <InputBase {...bannerForm.register("linkTo", { required: "Link chuyển tới là bắt buộc" })} fullWidth required placeholder="Nhập link chuyển tới (linkTo)" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
          </Box>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Tabs value={imageTab} onChange={(_, v) => setImageTab(v)} aria-label="Chọn cách thêm ảnh" sx={{ mb: 2 }}>
              <Tab label="Nhập link ảnh" />
              <Tab label="Chọn file ảnh" />
            </Tabs>
            {imageTab === 0 && (
              <>
                <TextField
                  fullWidth
                  variant="outlined"
                  size="small"
                  {...bannerForm.register("imageUrl", {
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
                {imagePreview ? (
                  <Box mt={2} display="flex" alignItems="center" gap={2}>
                    <img
                      src={(() => {
                        // Nếu đang ở tab file và có file, dùng URL.createObjectURL
                        if (imageTab === 1 && selectedFile && imagePreview) return imagePreview;
                        // Nếu là link http(s), dùng trực tiếp
                        if (imagePreview.startsWith("http")) return imagePreview;
                        // Nếu là đường dẫn tương đối, ghép API_BASE_URL
                        if (imagePreview) return `${process.env.REACT_APP_API_BASE_URL}${imagePreview}`;
                        return "https://via.placeholder.com/80?text=No+Image";
                      })()}
                      alt="Preview"
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }}
                      onError={() => setImageError("Không thể load ảnh từ URL này.")}
                      onLoad={() => setImageError("")}
                    />
                    <Button variant="outlined" color="error" size="small" onClick={() => { setImagePreview(""); setSelectedFile(null); bannerForm.setValue && bannerForm.setValue("imageUrl", ""); }}>
                      Xóa ảnh
                    </Button>
                  </Box>
                ) : (
                  <Box mt={2}>
                    <img src="https://via.placeholder.com/80?text=No+Image" alt="No preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                  </Box>
                )}
              </>
            )}
            {imageTab === 1 && (
              <>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ mb: 2 }}
                >
                  Chọn file ảnh
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleFileChange}
                  />
                </Button>
                {selectedFile && (
                  <Box mt={2} display="flex" alignItems="center" gap={2}>
                    <img
                      src={imagePreview ? imagePreview : "https://via.placeholder.com/80?text=No+Image"}
                      alt="Preview"
                      style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }}
                      onError={() => setImageError("Không thể load ảnh từ file này.")}
                      onLoad={() => setImageError("")}
                    />
                    <Button variant="outlined" color="error" size="small" onClick={() => { setSelectedFile(null); setImagePreview(""); setImageError(""); }}>
                      Xóa ảnh
                    </Button>
                  </Box>
                )}
                {!selectedFile && (
                  <Box mt={2}>
                    <img src="https://via.placeholder.com/80?text=No+Image" alt="No preview" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 8, border: "1px solid #ccc" }} />
                  </Box>
                )}
              </>
            )}
          </Box>
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
                type="button" 
                variant="outlined" 
                onClick={handleCloseDrawer} 
                sx={{ mr: 1, borderRadius: 2 }}
                disabled={bannerForm.formState?.isSubmitting}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={submitting}
                sx={{ bgcolor: "black", color: "white", borderRadius: 2, "&:hover": { bgcolor: "grey.800" }, "&:disabled": { bgcolor: "grey.400"} }}
            >
              { submitting ? <CircularProgress size={24} color="inherit" /> : "Thêm banner" }
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
}

export default AddBannerDrawer;
