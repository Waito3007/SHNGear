import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  TextField, 
  Button, 
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Avatar
} from "@mui/material";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import axios from "axios";

const CategoryModal = ({ open, onClose, category, refreshCategories }) => {
  const [formData, setFormData] = useState({ 
    name: "", 
    description: "", 
    image: "" 
  });
  const [tabValue, setTabValue] = useState(0); // 0: URL, 1: Upload
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        image: category.image || ""
      });
      // Nếu có ảnh, mặc định chọn tab URL
      if (category.image) setTabValue(0);
    } else {
      setFormData({ name: "", description: "", image: "" });
      setImageFile(null);
      setImagePreview("");
    }
  }, [category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.match('image.*')) {
      setImageError("Chỉ chấp nhận file ảnh");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setImageError("Kích thước ảnh tối đa 2MB");
      return;
    }

    setImageError("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    // Clear URL nếu đang ở tab upload
    if (tabValue === 1) {
      setFormData({...formData, image: ""});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalImageUrl = formData.image;

      // Nếu đang ở tab upload và có file
      if (tabValue === 1 && imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/upload`, 
          formData, 
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        finalImageUrl = response.data.imageUrl;
      } else if (tabValue === 0 && !formData.image) {
        setImageError("Vui lòng nhập URL ảnh hoặc tải ảnh lên");
        setUploading(false);
        return;
      }

      const dataToSend = {
        ...formData,
        image: finalImageUrl
      };

      if (category) {
        await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/api/categories/${category.id}`, 
          { ...dataToSend, id: category.id }
        );
      } else {
        await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/categories`, 
          dataToSend
        );
      }

      await refreshCategories();
      onClose();
    } catch (error) {
      console.error("Failed to save category:", error);
      setImageError("Có lỗi xảy ra khi lưu danh mục");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 400,
          bgcolor: "white",
          p: 3,
          borderRadius: 2,
          boxShadow: 24,
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            {category ? "Chỉnh sửa danh mục" : "Thêm danh mục"}
          </Typography>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên danh mục"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Hình ảnh danh mục
            </Typography>
            
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Nhập URL" icon={<ImageIcon size={16} />} />
              <Tab label="Tải lên" icon={<Upload size={16} />} />
            </Tabs>
            
            {tabValue === 0 ? (
              // Tab URL
              <Box>
                <TextField
                  fullWidth
                  label="Hình ảnh URL"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <Box mt={2} display="flex" justifyContent="center">
                    <Avatar
                      src={formData.image}
                      alt="Preview"
                      sx={{ 
                        width: 100, 
                        height: 100,
                        border: '1px solid #ddd'
                      }}
                      variant="rounded"
                    />
                  </Box>
                )}
              </Box>
            ) : (
              // Tab Upload
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Upload size={18} />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Chọn ảnh
                  <input 
                    type="file" 
                    hidden 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </Button>
                
                {imagePreview && (
                  <Box mt={1} display="flex" flexDirection="column" alignItems="center">
                    <Avatar
                      src={imagePreview}
                      alt="Preview"
                      sx={{ 
                        width: 100, 
                        height: 100,
                        border: '1px solid #ddd',
                        mb: 1
                      }}
                      variant="rounded"
                    />
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview("");
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

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={uploading}
            sx={{ 
              mt: 2,
              height: 42,
              bgcolor: "black", 
              color: "white",
              '&:hover': {
                bgcolor: '#333'
              }
            }}
          >
            {uploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              category ? "Cập nhật" : "Thêm"
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default CategoryModal;