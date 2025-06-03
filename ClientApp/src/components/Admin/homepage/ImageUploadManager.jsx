import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  LinearProgress,
  Tooltip,
  Paper
} from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import { 
  Upload, 
  Image as ImageIcon, 
  X, 
  Eye,
  Check,
  Folder,
  Download,
  Heart,
  Trash2,
  Plus,
  Camera,
  Link2
} from 'lucide-react';
import axios from 'axios';

// Enhanced animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
`;

// Enhanced Styled Components
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '20px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    overflow: 'hidden',
  }
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  borderBottom: '1px solid rgba(0,0,0,0.06)',
  '& .MuiTabs-indicator': {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    height: 3,
    borderRadius: '3px 3px 0 0',
  },
}));

const StyledTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9rem',
  color: '#64748b',
  minHeight: '60px',
  '&.Mui-selected': {
    color: '#667eea',
  },
  '&:hover': {
    color: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.04)',
  },
}));

const DropZone = styled(Paper)(({ theme, isDragActive }) => ({
  border: `2px dashed ${isDragActive ? '#667eea' : '#e2e8f0'}`,
  borderRadius: '16px',
  padding: '40px 20px',
  textAlign: 'center',
  backgroundColor: isDragActive ? 'rgba(102, 126, 234, 0.02)' : '#ffffff',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    borderColor: '#667eea',
    backgroundColor: 'rgba(102, 126, 234, 0.02)',
    transform: 'scale(1.01)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: '-100%',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(90deg, transparent, rgba(102, 126, 234, 0.1), transparent)',
    transition: 'left 0.6s ease',
  },
  '&:hover::before': {
    left: '100%',
  }
}));

const ImageCard = styled(Paper)(({ theme, isSelected }) => ({
  position: 'relative',
  borderRadius: '12px',
  overflow: 'hidden',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  border: isSelected ? '3px solid #667eea' : '2px solid transparent',
  transform: isSelected ? 'scale(1.02)' : 'scale(1)',
  boxShadow: isSelected 
    ? '0 8px 30px rgba(102, 126, 234, 0.3)' 
    : '0 2px 8px rgba(0,0,0,0.1)',
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
  },
  '& .overlay': {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(102, 126, 234, 0.8), rgba(118, 75, 162, 0.8))',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: isSelected ? 1 : 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover .overlay': {
    opacity: 1,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  borderRadius: '12px',
  color: 'white',
  padding: '12px 24px',
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
  '&:hover': {
    background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px rgba(102, 126, 234, 0.4)',
  },
}));

const PreviewContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
  marginTop: '16px',
  maxHeight: '200px',
  overflowY: 'auto',
  padding: '8px',
  background: '#f8fafc',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
}));

const PreviewCard = styled(Paper)(({ theme }) => ({
  position: 'relative',
  width: '80px',
  height: '80px',
  borderRadius: '8px',
  overflow: 'hidden',
  animation: `${fadeInUp} 0.3s ease`,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  '& .remove-btn': {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'rgba(239, 68, 68, 0.9)',
    color: 'white',
    minWidth: '20px',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    padding: 0,
    '&:hover': {
      background: '#dc2626',
      transform: 'scale(1.1)',
    }
  }
}));

const LoadingOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(255, 255, 255, 0.9)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  backdropFilter: 'blur(4px)',
}));

const ImageUploadManager = ({ 
  open, 
  onClose, 
  onImageSelect, 
  allowMultiple = false,
  selectedImages = [],
  title = "Quản lý hình ảnh"
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [galleryImages, setGalleryImages] = useState([]);
  const [selectedGalleryImages, setSelectedGalleryImages] = useState(selectedImages);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Enhanced drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  // Fetch gallery images on component mount
  useEffect(() => {
    if (open) {
      fetchGalleryImages();
    }
  }, [open]);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/upload`);
      setGalleryImages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const newFiles = files.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setUploadFiles(prev => [...prev, ...newFiles]);
  };

  const removeUploadFile = (index) => {
    setUploadFiles(prev => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].preview);
      updated.splice(index, 1);
      return updated;
    });
  };

  const uploadImages = async () => {
    if (uploadFiles.length === 0) return;

    try {
      setUploading(true);
      const uploadPromises = uploadFiles.map(async (fileObj) => {
        const formData = new FormData();
        formData.append('file', fileObj.file);
        
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        
        return response.data.imageUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      
      // Clear upload files and refresh gallery
      setUploadFiles([]);
      await fetchGalleryImages();
      
      // Auto-select uploaded images
      if (allowMultiple) {
        setSelectedGalleryImages(prev => [...prev, ...uploadedUrls]);
      } else {
        setSelectedGalleryImages([uploadedUrls[0]]);
      }
      
      setTabValue(0); // Switch to gallery tab
    } catch (error) {
      console.error('Failed to upload images:', error);
      alert('Lỗi khi tải lên hình ảnh');
    } finally {
      setUploading(false);
    }
  };

  const handleGalleryImageSelect = (imageUrl) => {
    if (allowMultiple) {
      setSelectedGalleryImages(prev => {
        const isSelected = prev.includes(imageUrl);
        if (isSelected) {
          return prev.filter(url => url !== imageUrl);
        } else {
          return [...prev, imageUrl];
        }
      });
    } else {
      setSelectedGalleryImages([imageUrl]);
    }
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    
    if (allowMultiple) {
      setSelectedGalleryImages(prev => [...prev, urlInput.trim()]);
    } else {
      setSelectedGalleryImages([urlInput.trim()]);
    }
    setUrlInput('');
  };

  const handleConfirm = () => {
    onImageSelect(allowMultiple ? selectedGalleryImages : selectedGalleryImages[0]);
    onClose();
  };

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewOpen(true);
  };

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    return imageUrl.startsWith('http') 
      ? imageUrl 
      : `${process.env.REACT_APP_API_BASE_URL}${imageUrl}`;
  };

  return (
    <>
      <StyledDialog 
        open={open} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { height: '80vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{title}</Typography>
            <IconButton onClick={onClose}>
              <X size={24} />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          <StyledTabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            sx={{ mb: 3 }}
          >
            <StyledTab 
              label={`Thư viện (${galleryImages.length})`} 
              icon={<Folder size={16} />} 
            />
            <StyledTab 
              label="Tải lên" 
              icon={<Upload size={16} />} 
            />
            <StyledTab 
              label="URL" 
              icon={<ImageIcon size={16} />} 
            />
          </StyledTabs>

          {/* Gallery Tab */}
          {tabValue === 0 && (
            <Box>
              {selectedGalleryImages.length > 0 && (
                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Đã chọn ({selectedGalleryImages.length}):
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selectedGalleryImages.map((imageUrl, index) => (
                      <Chip
                        key={index}
                        label={`Ảnh ${index + 1}`}
                        onDelete={() => {
                          setSelectedGalleryImages(prev => 
                            prev.filter((_, i) => i !== index)
                          );
                        }}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {loading ? (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              ) : (
                <ImageList 
                  sx={{ height: 400 }} 
                  cols={4} 
                  rowHeight={120}
                  gap={8}
                >
                  {galleryImages.map((image, index) => {
                    const imageUrl = image.imageUrl || image;
                    const fullImageUrl = getImageUrl(imageUrl);
                    const isSelected = selectedGalleryImages.includes(imageUrl);
                    
                    return (
                      <ImageListItem 
                        key={index}
                        sx={{ 
                          cursor: 'pointer',
                          border: isSelected ? '3px solid #1976d2' : '1px solid #e0e0e0',
                          borderRadius: 1,
                          overflow: 'hidden',
                          position: 'relative'
                        }}
                      >
                        <img
                          src={fullImageUrl}
                          alt={`Gallery ${index}`}
                          loading="lazy"
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }}
                          onClick={() => handleGalleryImageSelect(imageUrl)}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/150?text=Error';
                          }}
                        />
                        {isSelected && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 4,
                              right: 4,
                              backgroundColor: '#1976d2',
                              borderRadius: '50%',
                              p: 0.5
                            }}
                          >
                            <Check size={16} color="white" />
                          </Box>
                        )}
                        <ImageListItemBar
                          sx={{ 
                            background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%)',
                            '& .MuiImageListItemBar-title': {
                              fontSize: '0.75rem'
                            }
                          }}
                          title={`Ảnh ${index + 1}`}
                          position="bottom"
                          actionIcon={
                            <IconButton
                              sx={{ color: 'rgba(255, 255, 255, 0.54)' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePreview(fullImageUrl);
                              }}
                            >
                              <Eye size={16} />
                            </IconButton>
                          }
                        />
                      </ImageListItem>
                    );
                  })}
                </ImageList>
              )}
            </Box>
          )}

          {/* Upload Tab */}
          {tabValue === 1 && (
            <Box>
              <input
                type="file"
                multiple={allowMultiple}
                accept="image/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                id="image-upload-input"
              />
              <label htmlFor="image-upload-input">
                <Button
                  component="span"
                  variant="outlined"
                  startIcon={<Upload />}
                  fullWidth
                  sx={{ mb: 2, py: 2 }}
                >
                  Chọn {allowMultiple ? 'các' : ''} hình ảnh
                </Button>
              </label>

              <DropZone
                isDragActive={dragActive}
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Typography variant="body1" color="text.secondary" paragraph>
                  Kéo và thả hình ảnh vào đây, hoặc nhấp để chọn tệp
                </Typography>
                <input
                  type="file"
                  multiple={allowMultiple}
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="image-upload-input-drop"
                />
                <label htmlFor="image-upload-input-drop">
                  <Button
                    variant="contained"
                    component="span"
                    startIcon={<Upload />}
                    sx={{ mt: 1 }}
                  >
                    Tải lên từ máy tính
                  </Button>
                </label>
              </DropZone>

              {uploadFiles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Đã chọn ({uploadFiles.length}):
                  </Typography>
                  <Grid container spacing={2}>
                    {uploadFiles.map((fileObj, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Box position="relative">
                          <Avatar
                            src={fileObj.preview}
                            alt={fileObj.name}
                            variant="rounded"
                            sx={{ width: '100%', height: 100 }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => removeUploadFile(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              backgroundColor: 'error.main',
                              color: 'white',
                              '&:hover': { backgroundColor: 'error.dark' }
                            }}
                          >
                            <X size={16} />
                          </IconButton>
                          <Typography 
                            variant="caption" 
                            display="block"
                            noWrap
                            title={fileObj.name}
                          >
                            {fileObj.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  
                  <GradientButton
                    variant="contained"
                    onClick={uploadImages}
                    disabled={uploading}
                    startIcon={uploading ? <CircularProgress size={16} /> : <Upload />}
                    sx={{ mt: 2 }}
                    fullWidth
                  >
                    {uploading ? 'Đang tải lên...' : 'Tải lên'}
                  </GradientButton>
                </Box>
              )}
            </Box>
          )}

          {/* URL Tab */}
          {tabValue === 2 && (
            <Box>
              <TextField
                fullWidth
                label="URL hình ảnh"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.jpg"
                sx={{ mb: 2 }}
              />
              
              <Button
                variant="contained"
                onClick={handleUrlAdd}
                disabled={!urlInput.trim()}
                fullWidth
              >
                Thêm URL
              </Button>

              {urlInput && (
                <Box mt={2} display="flex" justifyContent="center">
                  <Avatar
                    src={urlInput}
                    alt="URL Preview"
                    variant="rounded"
                    sx={{ width: 200, height: 150 }}
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Box display="flex" justifyContent="space-between" width="100%">
            <Typography variant="body2" color="text.secondary">
              {allowMultiple 
                ? `Đã chọn ${selectedGalleryImages.length} hình ảnh`
                : selectedGalleryImages.length > 0 ? 'Đã chọn 1 hình ảnh' : 'Chưa chọn hình ảnh'
              }
            </Typography>
            <Box>
              <Button onClick={onClose} sx={{ mr: 1 }}>
                Hủy
              </Button>
              <Button 
                variant="contained" 
                onClick={handleConfirm}
                disabled={selectedGalleryImages.length === 0}
              >
                Xác nhận
              </Button>
            </Box>
          </Box>
        </DialogActions>
      </StyledDialog>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Xem trước hình ảnh</Typography>
            <IconButton onClick={() => setPreviewOpen(false)}>
              <X size={24} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center">
            <img
              src={previewImage}
              alt="Preview"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ImageUploadManager;
