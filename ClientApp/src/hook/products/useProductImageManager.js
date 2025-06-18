// src/hooks/useProductImageManager.js
import { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useProductImageManager = (initialLocalImages = [], initialImageUrls = [""]) => {
  const [tabValue, setTabValue] = useState(0); // 0: Upload, 1: URL
  const [localImages, setLocalImages] = useState(initialLocalImages); // { file, preview, isPrimary }
  const [imageUrls, setImageUrls] = useState(initialImageUrls); // Mảng các URL ảnh
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  const handleImageUploadFromDevice = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setImageError(""); // Xóa lỗi cũ
    const newImages = files.map((file, idx) => ({
      file,
      preview: URL.createObjectURL(file),
      // Nếu chưa có ảnh nào, ảnh đầu tiên được chọn sẽ là primary
      isPrimary: localImages.length === 0 && idx === 0,
    }));

    setLocalImages((prev) => {
      const combined = [...prev, ...newImages];
      // Đảm bảo chỉ có một ảnh primary nếu có nhiều ảnh được thêm cùng lúc
      if (
        combined.filter((img) => img.isPrimary).length > 1 ||
        (prev.length > 0 &&
          combined.some(
            (img) => img.isPrimary && !prev.find((p) => p.file === img.file)?.isPrimary
          ))
      ) {
        return combined.map((img, index) => ({ ...img, isPrimary: index === 0 }));
      }
      if (combined.length > 0 && !combined.some((img) => img.isPrimary)) {
        combined[0].isPrimary = true;
      }
      return combined;
    });
  };

  const handleRemoveLocalImage = (indexToRemove) => {
    const imageToRemove = localImages[indexToRemove];
    URL.revokeObjectURL(imageToRemove.preview); // Giải phóng bộ nhớ
    setLocalImages((prev) => {
        const updated = prev.filter((_, index) => index !== indexToRemove);
        // Nếu ảnh bị xóa là primary và còn ảnh khác, đặt ảnh đầu tiên còn lại làm primary
        if (imageToRemove.isPrimary && updated.length > 0 && !updated.some(img => img.isPrimary)) {
            updated[0].isPrimary = true;
        }
        return updated;
    });
  };

  const setPrimaryLocalImage = (indexToSetPrimary) => {
    setLocalImages(prev => prev.map((img, index) => ({
        ...img,
        isPrimary: index === indexToSetPrimary
    })));
  };


  const handleAddUrlField = () => {
    setImageUrls((prev) => [...prev, ""]);
  };

  const handleUrlInputChange = (index, value) => {
    setImageError(""); // Xóa lỗi cũ
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleRemoveUrlInput = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
  };

  const processImagesForSubmission = async () => {
    setUploadingImage(true);
    setImageError("");
    let processedImages = [];

    try {
      if (tabValue === 0) { // Tab Upload ảnh
        if (localImages.length === 0) {
          setImageError("Vui lòng chọn ít nhất một ảnh để tải lên.");
          setUploadingImage(false);
          return { error: "Vui lòng chọn ít nhất một ảnh để tải lên.", images: [] };
        }

        processedImages = await Promise.all(
          localImages.map(async (img) => {
            const formData = new FormData();
            formData.append("file", img.file);
            // Bạn có thể thêm các metadata khác vào formData nếu API yêu cầu
            // formData.append("isPrimary", img.isPrimary); 
            const response = await axios.post(
              `${API_BASE_URL}/api/upload`,
              formData,
              { headers: { "Content-Type": "multipart/form-data" } }
            );
            return {
              imageUrl: response.data.imageUrl, // Giả sử API trả về URL của ảnh đã upload
              isPrimary: img.isPrimary,
            };
          })
        );
      } else { // Tab URL ảnh
        const validUrls = imageUrls.filter(url => url && url.trim() !== "");
        if (validUrls.length === 0) {
          setImageError("Vui lòng nhập ít nhất một URL ảnh hợp lệ.");
          setUploadingImage(false);
          return { error: "Vui lòng nhập ít nhất một URL ảnh hợp lệ.", images: [] };
        }
        // Đảm bảo chỉ có một ảnh primary (ảnh đầu tiên trong danh sách URL hợp lệ)
        processedImages = validUrls.map((url, index) => ({
          imageUrl: url,
          isPrimary: index === 0,
        }));
      }
    } catch (error) {
      console.error("Error processing images:", error);
      setImageError("Lỗi trong quá trình xử lý ảnh. Vui lòng thử lại.");
      setUploadingImage(false);
      return { error: "Lỗi trong quá trình xử lý ảnh.", images: [] };
    }

    setUploadingImage(false);
    // Đảm bảo có ít nhất một ảnh và một ảnh primary
    if (processedImages.length > 0 && !processedImages.some(img => img.isPrimary)) {
        processedImages[0].isPrimary = true;
    }
    return { images: processedImages, error: null };
  };

  const resetImageManager = () => {
    setLocalImages(initialLocalImages);
    imageUrls.forEach(url => { if (url && url.startsWith('blob:')) URL.revokeObjectURL(url); }); // Cần cẩn thận nếu URL preview cũng là blob
    localImages.forEach(img => URL.revokeObjectURL(img.preview));
    setImageUrls(initialImageUrls);
    setTabValue(0);
    setImageError("");
    setUploadingImage(false);
  };


  return {
    tabValue,
    setTabValue,
    localImages,
    handleImageUploadFromDevice,
    handleRemoveLocalImage,
    setPrimaryLocalImage,
    imageUrls,
    handleAddUrlField,
    handleUrlInputChange,
    handleRemoveUrlInput,
    uploadingImage,
    imageError,
    setImageError, // Để form có thể set lỗi nếu cần
    processImagesForSubmission,
    resetImageManager,
  };
};