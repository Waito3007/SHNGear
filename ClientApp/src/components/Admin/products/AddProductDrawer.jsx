import { useState, useEffect } from "react";
import { Drawer, IconButton, Select, MenuItem, Button, Box, CircularProgress, InputBase, Typography } from "@mui/material";
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

  const { fields: imageFields, append: appendImage, remove  } = useFieldArray({ control, name: "images" });

const [localImages, setLocalImages] = useState([]);

const [categories, setCategories] = useState([]);
const [brands, setBrands] = useState([]);
const [localImageFields, setLocalImageFields] = useState([]); // Đổi tên để tránh trùng
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

   const handleImageUpload = (e) => {
  const files = Array.from(e.target.files);
  if (!files.length) return;

  const newImages = files.map((file) => {
    return {
      file,
      preview: URL.createObjectURL(file), // Tạo URL xem trước ảnh
      isPrimary: localImages.length === 0,
    };
  });

  setLocalImages((prevImages) => [...prevImages, ...newImages]);
};




  const onSubmit = async (data) => {
    try {
      // 1. Tải ảnh lên server trước
    if (localImages.length === 0) {
      console.error("Không có ảnh nào được chọn.");
      return;
    }

    // Kiểm tra API trước khi gửi
    console.log("Uploading images...", localImages);

    const uploadedImages = await Promise.all(
      localImages.map(async (img, index) => {
        if (!img.file) {
          console.error(`Ảnh ${index} không có file hợp lệ.`);
          return null;
        }

        const formData = new FormData();
        formData.append("file", img.file);

        try {
          const response = await axios.post("https://localhost:7107/api/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });

          if (!response.data || !response.data.imageUrl) {
            throw new Error(`API không trả về đường dẫn ảnh cho ảnh ${index}`);
          }

          return { imageUrl: response.data.imageUrl, isPrimary: img.isPrimary };
        } catch (error) {
          console.error(`Lỗi khi tải ảnh ${index}:`, error);
          return null;
        }
      })
    );

    // Loại bỏ ảnh lỗi (null)
    const validImages = uploadedImages.filter(img => img !== null);
    if (validImages.length === 0) {
      console.error("Không có ảnh nào được tải lên thành công.");
      return;
    }
     // 2. Tạo sản phẩm sau khi ảnh được tải lên
    const productData = {
      ...data,
      categoryId: parseInt(data.categoryId),
      brandId: parseInt(data.brandId),
      images: uploadedImages, // Chỉ gửi ảnh sau khi đã upload
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
    setLocalImages([]); // Xoá ảnh tạm sau khi thêm sản phẩm thành công
    onClose();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  return (
    <Drawer anchor="right" open={isOpen} onClose={onClose} BackdropProps={{ invisible: false }}>
      <Box sx={{ width: 400, p: 3, bgcolor: "background.default", height: "100%" }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} 
          sx={{  }}>
          <Box fontWeight="bold">Thêm sản phẩm</Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Tên sản phẩm */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Tên sản phẩm</Box>
            <InputBase {...register("name", { required: true })} fullWidth required placeholder="Nhập tên sản phẩm" />
          </Box>

          {/* Mô tả */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Mô tả</Box>
            <InputBase {...register("description", { required: true })} fullWidth required multiline rows={3} placeholder="Nhập mô tả sản phẩm" />
          </Box>

          {/* Category Selection */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Danh mục</Box>
            <Select {...register("categoryId", { required: true })} fullWidth displayEmpty>
              <MenuItem value="">Chọn danh mục</MenuItem>
              {categories.map((cat) => (
                <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Brand Selection */}
          <Box mt={2} p={2} border="1px solid black" borderRadius={2}>
            <Box mb={1} fontWeight="bold">Thương hiệu</Box>
            <Select {...register("brandId", { required: true })} fullWidth displayEmpty>
              <MenuItem value="">Chọn thương hiệu</MenuItem>
              {brands.map((brand) => (
                <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
              ))}
            </Select>
          </Box>

          {/* Chọn ảnh */}
<Box mt={2} p={2} border="1px solid black" borderRadius={2}>
  <Box mb={1} fontWeight="bold">Tải ảnh lên</Box>
  <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
</Box>

{/* Hiển thị ảnh đã chọn */}
<Box mt={2} display="flex" flexWrap="wrap" gap={2}>
  {localImages.map((img, index) => (
    <Box key={index} p={1} border="1px solid #ddd" borderRadius={1} position="relative">
      <img src={img.preview} alt="Preview" width={100} />
      <Button color="error" size="small" onClick={() => setLocalImages(localImages.filter((_, i) => i !== index))}>
        Xoá
      </Button>
    </Box>
  ))}
</Box>


          {/* Submit Button */}
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
