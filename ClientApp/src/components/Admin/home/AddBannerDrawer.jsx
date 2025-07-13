import { Drawer, IconButton, TextField, Button, Typography, CircularProgress, InputBase, Box, Tab, Tabs} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useBannerForm } from "hook/banners/useBannerForm";
import { useBannerImageManager } from "hook/banners/useBannerImageManager";
import { useBannerData } from "hook/banners/useBannerData";


const AddBannerDrawer = ({ isOpen, onClose, onAddBanner }) => {
  const { loading: dataLoading, error: dataError } = useBannerData();
  const imageManager = useBannerImageManager();
  const bannerForm = useBannerForm({
    onAddBanner,
    onClose: () => {
      onClose();
      imageManager.resetImageManager();
    },
  });

  const handleMainSubmit = async (formData) => {
    imageManager.setImageError("");
    const { images: processedImages, error: imageProcessingError } = await imageManager.processImagesForSubmission();
    if (imageProcessingError) {
      imageManager.setImageError(imageProcessingError);
      console.error("Error processing images:", imageProcessingError);
      return;
    }

    if (!processedImages || processedImages.length === 0) {
      imageManager.setImageError("Vui lòng tải lên một ảnh.");
      return;
    }

    try {
      await bannerForm.handleFormSubmit(formData, processedImages);
    } catch (error) {
      console.error("Error submitting banner data:", error);
    }
  };

  const handleCloseDrawer = () => {
    bannerForm.resetForm();
    imageManager.resetImageManager();
    onClose();
  };

  if(dataLoading) {
    return(
      <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer}>
        <Box sx={{ width: 400, p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <CircularProgress />
        </Box>
      </Drawer>
    );
  }

  return(
    <Drawer anchor="right" open={isOpen} onClose={handleCloseDrawer} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%", overflowY: "auto" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">Thêm Banner</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>
        
        {dataError && <Typography color="error" mb={2}>{dataError}</Typography>}

        <form onSubmit={bannerForm.handleSubmit(handleMainSubmit)}>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Tiêu đề Banner</Typography>
            <InputBase {...bannerForm.register("title", { required: "Tiêu đề Banner là bắt buộc" })} fullWidth required placeholder="Nhập tiêu đề Banner" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
          </Box>
          
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Hình ảnh</Typography>
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
              </Box>
            )}
            {imageManager.imageError && (
              <Typography color="error" mt={1} variant="caption">{imageManager.imageError}</Typography>
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
                type="button" 
                variant="outlined" 
                onClick={handleCloseDrawer} 
                sx={{ mr: 1, borderRadius: 2 }}
                disabled={imageManager.uploadingImage || bannerForm.formState?.isSubmitting}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={imageManager.uploadingImage || bannerForm.formState?.isSubmitting} // Vô hiệu hóa khi đang tải ảnh hoặc submit form
                sx={{ bgcolor: "black", color: "white", borderRadius: 2, "&:hover": { bgcolor: "grey.800" }, "&:disabled": { bgcolor: "grey.400"} }}
            >
              { (imageManager.uploadingImage || bannerForm.formState?.isSubmitting) ? <CircularProgress size={24} color="inherit" /> : "Thêm banner" }
            </Button>
            </Box>
        </form>
      </Box>
    </Drawer>
  );
}

export default AddBannerDrawer;
