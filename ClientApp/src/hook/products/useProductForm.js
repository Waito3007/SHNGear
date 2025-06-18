// src/hooks/products/useProductForm.js
import { useForm } from "react-hook-form";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useProductForm = ({ onAddProduct, onClose, initialImages = [], initialImageUrls = [""] }) => {
  const { 
    register, 
    handleSubmit, 
    reset, 
    control, 
    setValue, 
    watch,
    formState // Lấy toàn bộ formState từ useForm
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      brandId: "",
      images: initialImages,
      variants: [],
    },
    mode: "onChange", // Hoặc "onBlur" hoặc "onSubmit" (mặc định)
  });

  // Destructure errors từ formState để tiện sử dụng nếu muốn, hoặc trả về cả formState
  const { errors } = formState;

  const handleFormSubmit = async (data, uploadedImages) => {
    try {
      if (uploadedImages.length === 0) {
        console.error("No images provided for the product.");
        return;
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
        `${API_BASE_URL}/api/Products`,
        productData
      );

      onAddProduct(response.data);
      reset(); 
      onClose(); 
      return response.data;
    } catch (error) {
      console.error("Error adding product:", error);
      throw error;
    }
  };

  return {
    register,
    handleSubmit,
    control,
    resetForm: reset,
    setValue,
    watch,
    formState, // Trả về toàn bộ formState (bao gồm errors, isSubmitting, isValid, v.v.)
    // HOẶC chỉ trả về errors nếu bạn chỉ cần nó:
    // errors,
    handleFormSubmit,
  };
};