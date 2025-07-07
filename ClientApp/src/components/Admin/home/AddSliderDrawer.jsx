import { Drawer, IconButton, TextField, Button, Typography, CircularProgress, InputBase, Box, Tab, Tabs} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useSliderForm } from "hook/sliders/useSliderForm";
import { useSliderImageManager } from "hook/sliders/useSliderImageManager";
import { useSliderData } from "hook/sliders/useSliderData";


const AddSliderDrawer = ({ isOpen, onClose, onAddSlider }) => {
  const { loading: dataLoading, error: dataError } = useSliderData();
  const imageManager = useSliderImageManager();
  const sliderForm = useSliderForm({
    onAddSlider,
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
      imageManager.setImageError("Vui lòng tải lên ít nhất một ảnh.");
      return;
    }

    try {
      await sliderForm.handleFormSubmit(formData, processedImages);
    } catch (error) {
      console.error("Error submitting slider data:", error);
    }
  };

  const handleCloseDrawer = () => {
    sliderForm.resetForm();
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
          <Typography variant="h6" fontWeight="bold">Thêm Slider</Typography>
          <IconButton onClick={handleCloseDrawer}>
            <Close />
          </IconButton>
        </Box>
        
        {dataError && <Typography color="error" mb={2}>{dataError}</Typography>}

        <form onSubmit={sliderForm.handleSubmit(handleMainSubmit)}>
          <Box mt={2} p={2} border="1px solid #e0e0e0" borderRadius={2}>
            <Typography mb={1} fontWeight="medium">Tiêu đề slider</Typography>
            <InputBase {...sliderForm.register("title", { required: "Tiêu đề Slider là bắt buộc" })} fullWidth required placeholder="Nhập tiêu đề Slider" sx={{ border: '1px solid #ccc', borderRadius: 1, p: '2px 8px' }}/>
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
                      {!img.isPrimary && (
                        <Button
                            size="small"
                            onClick={() => imageManager.setPrimaryLocalImage(index)}
                            sx={{ fontSize: '0.6rem', p: '2px 4px', position: 'absolute', bottom: 0, left:0, right:0, backgroundColor: 'rgba(0,0,0,0.5)', color: 'white', '&:hover': {backgroundColor: 'rgba(0,0,0,0.7)'}}}
                        >
                            Đặt làm slider
                        </Button>
                      )}
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

          {/* Tab link tới sản phẩm hoặc danh sách sản phẩm */}
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
                disabled={imageManager.uploadingImage || sliderForm.formState?.isSubmitting}
            >
              Hủy
            </Button>
            <Button
                type="submit"
                variant="contained"
                disabled={imageManager.uploadingImage || sliderForm.formState?.isSubmitting} // Vô hiệu hóa khi đang tải ảnh hoặc submit form
                sx={{ bgcolor: "black", color: "white", borderRadius: 2, "&:hover": { bgcolor: "grey.800" }, "&:disabled": { bgcolor: "grey.400"} }}
            >
              { (imageManager.uploadingImage || sliderForm.formState?.isSubmitting) ? <CircularProgress size={24} color="inherit" /> : "Thêm slider" }
            </Button>
            </Box>
        </form>
      </Box>
    </Drawer>
  );
}

export default AddSliderDrawer;
