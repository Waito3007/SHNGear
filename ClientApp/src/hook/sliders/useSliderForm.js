import { useForm } from 'react-hook-form';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const useSliderForm = ({ onAddSlider, onClose, initialImage = [], initialImageUrls = [""] }) => { 
    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        watch,
        formState
    } = useForm({
        defaultValues: {
            title: '',
            imageUrl: initialImageUrls[0] || '',
            linkToProduct: '',
            status: true
        },
        mode: 'onChange',
    });
    
    const handleFormSubmit = async (data) => {
        try {
            // Validate imageUrl: không rỗng, là link hoặc là đường dẫn file trả về từ upload
            if (!data.imageUrl || typeof data.imageUrl !== "string" || data.imageUrl.trim() === "") {
                const errMsg = "Vui lòng nhập hoặc chọn ảnh cho slider.";
                console.error(errMsg);
                return { error: errMsg };
            }
            // Kiểm tra định dạng link ảnh (có thể là http/https hoặc /uploads/...)
            const urlPattern = /^(https?:\/\/|\/)/;
            if (!urlPattern.test(data.imageUrl.trim())) {
                const errMsg = "Đường dẫn ảnh không hợp lệ. Vui lòng kiểm tra lại.";
                console.error(errMsg);
                return { error: errMsg };
            }
            const sliderData = {
                title: data.title,
                linkToProduct: data.linkToProduct,
                imageUrl: data.imageUrl.trim(),
                status: data.status
            };
            console.log('[DEBUG] Slider data gửi lên:', sliderData);
            const response = await axios.post(`${API_BASE_URL}/api/Slider`, sliderData);
            console.log('[DEBUG] API response:', response);
            if (!response.data || (response.status !== 200 && response.status !== 201)) {
                const errMsg = "API trả về dữ liệu không hợp lệ.";
                console.error(errMsg, response);
                return { error: errMsg };
            }
            onAddSlider(response.data);
            reset();
            onClose();
            return response.data;
        } catch (error) {
            let errMsg = "Lỗi gửi dữ liệu slider.";
            if (error.response && error.response.data && error.response.data.message) {
                errMsg = error.response.data.message;
            } else if (error.message) {
                errMsg = error.message;
            }
            console.error("Error submitting slider data:", errMsg, error);
            return { error: errMsg };
        }
    };
    return {
        register,
        handleSubmit,
        control,
        resetForm: reset,
        setValue,
        watch,
        formState,
        handleFormSubmit,
    };
};