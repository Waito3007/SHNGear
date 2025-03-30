import { useState, useEffect } from "react";
import { 
  Drawer, 
  IconButton, 
  Select, 
  MenuItem, 
  Button, 
  Box, 
  CircularProgress, 
  InputBase, 
  Typography,
  Tabs,
  Tab,
  TextField
} from "@mui/material";
import { Close } from "@mui/icons-material";
import { useForm, useFieldArray } from "react-hook-form";
import axios from "axios";

const ProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
  const { register, handleSubmit, reset, control } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      images: [],
      variants: [],
    },
  });

  const [tabValue, setTabValue] = useState(0); // 0: Upload, 1: URL
  const [localImages, setLocalImages] = useState([]);
  const [imageUrls, setImageUrls] = useState([""]); // Mảng các URL ảnh
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/categories`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
        ]);
        setCategories(categoriesRes.data.$values || categoriesRes.data || []);
        setBrands(brandsRes.data.$values || brandsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Xử lý tải ảnh từ máy
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      isPrimary: localImages.length === 0,
    }));

    setLocalImages((prev) => [...prev, ...newImages]);
  };

  // Xử lý thêm URL ảnh
  const handleAddUrlField = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleRemoveUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const onSubmit = async (data) => {
    try {
      let uploadedImages = [];
      
      // Xử lý ảnh tùy theo tab đang chọn
      if (tabValue === 0) {
        // Tab Upload ảnh
        if (localImages.length === 0) {
          setImageError("Vui lòng chọn ít nhất một ảnh");
          return;
        }

        uploadedImages = await Promise.all(
          localImages.map(async (img) => {
            const formData = new FormData();
            formData.append("file", img.file);
            const response = await axios.post(
              `${process.env.REACT_APP_API_BASE_URL}/api/upload`, 
              formData, 
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            return { 
              imageUrl: response.data.imageUrl, 
              isPrimary: img.isPrimary 
            };
          })
        );
      } else {
        // Tab URL ảnh
        const validUrls = imageUrls.filter(url => url.trim() !== "");
        if (validUrls.length === 0) {
          setImageError("Vui lòng nhập ít nhất một URL ảnh");
          return;
        }

        uploadedImages = validUrls.map((url, index) => ({
          imageUrl: url,
          isPrimary: index === 0 // Đặt ảnh đầu tiên là primary
        }));
      }

      const productData = {
        ...data,
        categoryId: parseInt(data.categoryId),
        brandId: parseInt(data.brandId),
        images: uploadedImages,
        variants: data.variants.map((variant) => ({
          ...variant,
          price: parseFloat(variant.price),
          discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
        })),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/Products`, 
        productData
      );
      
      onAddProduct(response.data);
      reset();
      setLocalImages([]);
      setImageUrls([""]);
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box fontWeight="bold">Thêm sản phẩm</Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Các trường thông tin sản phẩm (giữ nguyên) */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Tên sản phẩm</Box>
            <InputBase {...register("name", { required: true })} fullWidth required placeholder="Nhập tên sản phẩm" />
          </Box>

          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Mô tả</Box>
            <InputBase {...register("description", { required: true })} fullWidth required multiline rows={3} placeholder="Nhập mô tả sản phẩm" />
          </Box>

          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Danh mục</Box>
            <Select {...register("categoryId", { required: true })} fullWidth displayEmpty>
              <MenuItem value="">Chọn danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </Box>

          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Thương hiệu</Box>
            <Select {...register("brandId", { required: true })} fullWidth displayEmpty>
              <MenuItem value="">Chọn thương hiệu</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Phần chọn ảnh với Tab */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Ảnh sản phẩm</Box>
            
            <Tabs value={tabValue} onChange={(e, newValue) => setTabValue(newValue)}>
              <Tab label="Tải ảnh lên" />
              <Tab label="Nhập URL" />
            </Tabs>
            
            {tabValue === 0 ? (
              // Tab Upload ảnh
              <Box mt={2}>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                />
                <Box mt={2} display="flex" flexWrap="wrap" gap={2}>
                  {localImages.map((img, index) => (
                    <Box key={index} position="relative">
                      <img src={img.preview} alt="Preview" width={100} height={100} style={{ objectFit: 'cover' }} />
                      <Button 
                        size="small" 
                        color="error"
                        onClick={() => setLocalImages(localImages.filter((_, i) => i !== index))}
                        sx={{ position: 'absolute', top: 0, right: 0 }}
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
                {imageUrls.map((url, index) => (
                  <Box key={index} display="flex" alignItems="center" mb={1}>
                    <TextField
                      fullWidth
                      value={url}
                      onChange={(e) => handleUrlChange(index, e.target.value)}
                      placeholder="Nhập URL ảnh"
                    />
                    {imageUrls.length > 1 && (
                      <IconButton onClick={() => handleRemoveUrl(index)}>
                        <Close fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button onClick={handleAddUrlField} variant="outlined" sx={{ mt: 1 }}>
                  Thêm URL khác
                </Button>
              </Box>
            )}
            
            {imageError && (
              <Typography color="error" mt={1}>{imageError}</Typography>
            )}
          </Box>

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained" sx={{ mt: 2, bgcolor: "black", color: "white", borderRadius: 2 }}>
              Thêm Sản phẩm
            </Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default ProductDrawer;