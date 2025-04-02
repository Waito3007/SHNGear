import React, { useState, useEffect } from "react";
import { 
  Modal, 
  Box, 
  Typography, 
  Button, 
  TextField, 
  IconButton,
  Tabs,
  Tab,
  CircularProgress
} from "@mui/material";
import { X, Upload } from "lucide-react";
import axios from "axios";

const BrandModal = ({ open, onClose, brand, refreshBrands }) => {
  const [brandData, setBrandData] = useState({ 
    name: "", 
    description: "", 
    logo: "" 
  });
  const [tabValue, setTabValue] = useState(0); // 0: URL, 1: Upload
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (brand) {
      setBrandData(brand);
      // Nếu brand có logo, mặc định chọn tab URL
      if (brand.logo) setTabValue(0);
    } else {
      setBrandData({ name: "", description: "", logo: "" });
      setLogoFile(null);
      setLogoPreview("");
    }
  }, [brand]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBrandData({ ...brandData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    // Clear URL nếu đang ở tab upload
    if (tabValue === 1) {
      setBrandData({...brandData, logo: ""});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      let finalLogoUrl = brandData.logo;

      // Nếu đang ở tab upload và có file
      if (tabValue === 1 && logoFile) {
        const formData = new FormData();
        formData.append("file", logoFile);
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/upload`, 
          formData, 
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        
        finalLogoUrl = response.data.imageUrl;
      }

      const dataToSend = {
        ...brandData,
        logo: finalLogoUrl
      };

      if (brand) {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/brands/${brand.id}`, dataToSend);
      } else {
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/brands`, dataToSend);
      }

      refreshBrands();
      onClose();
    } catch (error) {
      console.error("Failed to save brand:", error);
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
            {brand ? "Chỉnh sửa thương hiệu" : "Thêm thương hiệu"}
          </Typography>
          <IconButton onClick={onClose}>
            <X size={24} />
          </IconButton>
        </Box>
        
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Tên thương hiệu"
            name="name"
            value={brandData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          
          <TextField
            fullWidth
            label="Mô tả"
            name="description"
            value={brandData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={3}
          />

          <Box mt={2} mb={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Logo thương hiệu
            </Typography>
            
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              sx={{ mb: 2 }}
            >
              <Tab label="Nhập URL" />
              <Tab label="Tải lên" />
            </Tabs>
            
            {tabValue === 0 ? (
              // Tab URL
              <TextField
                fullWidth
                label="Logo URL"
                name="logo"
                value={brandData.logo}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            ) : (
              // Tab Upload
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Upload size={18} />}
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
                
                {logoPreview && (
                  <Box mt={1} position="relative" width={100}>
                    <img 
                      src={logoPreview} 
                      alt="Logo preview" 
                      style={{ 
                        width: '100%', 
                        height: 'auto',
                        borderRadius: 4
                      }} 
                    />
                    <IconButton
                      size="small"
                      onClick={() => {
                        setLogoFile(null);
                        setLogoPreview("");
                      }}
                      sx={{
                        position: 'absolute',
                        top: -8,
                        right: -8,
                        backgroundColor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        '&:hover': {
                          backgroundColor: 'rgba(0,0,0,0.8)'
                        }
                      }}
                    >
                      <X size={16} />
                    </IconButton>
                  </Box>
                )}
              </Box>
            )}
          </Box>

          <Button 
            type="submit" 
            variant="contained" 
            fullWidth
            disabled={uploading}
            sx={{ 
              mt: 2, 
              bgcolor: "black", 
              color: "white", 
              borderRadius: 2,
              height: 42
            }}
          >
            {uploading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              brand ? "Cập nhật" : "Thêm"
            )}
          </Button>
        </form>
      </Box>
    </Modal>
  );
};

export default BrandModal;