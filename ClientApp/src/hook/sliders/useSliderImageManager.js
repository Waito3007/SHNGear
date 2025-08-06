import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const useSliderImageManager = (initialImages = [], initialImageUrls = [""]) => {
    const [tabValue, setTabValue] = useState(0);
    const [localImages, setLocalImages] = useState(initialImages);
    const [imageUrls, setImageUrls] = useState(initialImageUrls);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imageError, setImageError] = useState("");

    const handleImageUploadFromDevice = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) {
            return;
        }
        setImageError("");
        const newImages = files.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setLocalImages((prev) => [...prev, ...newImages]);
    };

    const handleAddUrlField = () => {
        setImageUrls((prev) => [...prev, ""]);
    };

    const handleUrlInputChange = (index, value) => {
        setImageError("");
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const handleRemoveUrlInput = (index) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        setImageUrls(newUrls);
    };

    const processImagesForSubmission = async () => {
        setUploadingImages(true);
        setImageError("");
        let processedImages = [];

        try {
            if(tabValue === 0) {
                // Upload file ảnh từ máy
                if(localImages.length === 0) {
                    setImageError("Vui lòng chọn ảnh để tải lên.");
                    setUploadingImages(false);
                    return { error: "Vui lòng chọn ảnh để tải lên." };
                }
                processedImages = await Promise.all(
                    localImages.map(async (img) => {
                        const formData = new FormData();
                        formData.append("file", img.file);
                        const respose = await axios.post(
                            `${API_BASE_URL}/api/upload`, 
                            formData, 
                            { headers: { "Content-Type": "multipart/form-data" } }
                        );  
                        return{
                            imageUrl: respose.data.imageUrl,
                        };
                    })
                );
            } else {
                // Nhập URL ảnh
                const validUrls = imageUrls.filter(url => url && url.trim() !== "");
                if(validUrls.length === 0) {
                    setImageError("Vui lòng nhập ít nhất một URL ảnh.");
                    setUploadingImages(false);
                    return { error: "Vui lòng nhập ít nhất một URL ảnh." };
                }
                processedImages = validUrls.map((url, idx) => ({
                    imageUrl: url,
                }));
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            setImageError("Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.");
            setUploadingImages(false);
            return { error: "Đã xảy ra lỗi khi tải ảnh lên. Vui lòng thử lại.", images: [] };
        }

        setUploadingImages(false);
        return { images: processedImages, error: null };
    };
    const resetImageManager = () => {
        setLocalImages(initialImages);
        imageUrls.forEach(url => { if(url && url.startsWith('blob')) URL.revokeObjectURL(url); });
        localImages.forEach(img => URL.revokeObjectURL(img.preview));
        setImageUrls(initialImageUrls);
        setTabValue(0);
        setImageError("");
        setUploadingImages(false);
    };
    return {
        tabValue,
        setTabValue,
        localImages,
        handleImageUploadFromDevice,
        imageUrls,
        handleAddUrlField,
        handleUrlInputChange,
        handleRemoveUrlInput,
        uploadingImages,
        imageError,
        setImageError,
        processImagesForSubmission,
        resetImageManager
    };
};