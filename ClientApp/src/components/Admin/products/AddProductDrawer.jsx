import { useState, useEffect } from "react";
import { Drawer, IconButton, TextField, Select, MenuItem, Button, Typography, Box, CircularProgress } from "@mui/material";
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

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: "images",
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  });

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, brandsRes] = await Promise.all([
          axios.get("https://localhost:7107/api/categories"),
          axios.get("https://localhost:7107/api/brands"),
        ]);
        setCategories(categoriesRes.data.$values || categoriesRes.data || []);
        setBrands(brandsRes.data.$values || brandsRes.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setUploadingImage(true);
    setImageError("");

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        const response = await axios.post("https://localhost:7107/api/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return { imageUrl: response.data, isPrimary: imageFields.length === 0 };
      });
      
      const uploadedImages = await Promise.all(uploadPromises);
      uploadedImages.forEach((img) => appendImage(img));
    } catch (error) {
      console.error("Image upload failed:", error);
      setImageError("Tải ảnh thất bại, vui lòng thử lại.");
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const productData = {
        ...data,
        categoryId: parseInt(data.categoryId),
        brandId: parseInt(data.brandId),
        images: data.images.map(({ imageUrl, isPrimary }) => ({ imageUrl, isPrimary })),
        variants: data.variants.map((variant) => ({
          ...variant,
          price: parseFloat(variant.price),
          discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
        })),
      };

      const response = await axios.post("https://localhost:7107/api/Products", productData);
      onAddProduct(response.data);
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Thêm sản phẩm</Typography>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField {...register("name", { required: true })} label="Tên sản phẩm" fullWidth margin="dense" required />
          <TextField {...register("description", { required: true })} label="Mô tả" fullWidth margin="dense" required multiline rows={3} />
          
          <Select {...register("categoryId", { required: true })} fullWidth margin="dense" displayEmpty>
            <MenuItem value="">Chọn danh mục</MenuItem>
            {categories.map((cat) => (
              <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
            ))}
          </Select>
          
          <Select {...register("brandId", { required: true })} fullWidth margin="dense" displayEmpty>
            <MenuItem value="">Chọn thương hiệu</MenuItem>
            {brands.map((brand) => (
              <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
            ))}
          </Select>
          
          <Typography variant="body2" mt={2}>Hình ảnh</Typography>
          <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
          {uploadingImage && <CircularProgress size={20} />}
          {imageError && <Typography color="error">{imageError}</Typography>}

          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button type="submit" variant="contained">Thêm sản phẩm</Button>
          </Box>
        </form>
      </Box>
    </Drawer>
  );
};

export default ProductDrawer;