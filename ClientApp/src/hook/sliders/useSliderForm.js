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
            images: initialImage
        },
        mode: 'onChange',
    });
    
    const handleFormSubmit = async (data, uploadedImages) => {
        try {
            if(!uploadedImages || uploadedImages.length === 0) {
                console.error("No images provided for the slider.");
                return;
            }
            const sliderData = {
                title: data.title,
                linkToProduct: data.linkToProduct,
                images: uploadedImages.map(img => ({ imageUrl: img.imageUrl }))
            };
            if (typeof data.status !== 'undefined' && data.status !== null && data.status !== "") {
                sliderData.status = data.status;
            }
            console.log('Slider data gửi lên:', sliderData);
            const response = await axios.post(`${API_BASE_URL}/api/Slider`, sliderData);
            onAddSlider(response.data);
            reset();
            onClose();
            return response.data;
        } catch (error) {
            console.error("Error submitting slider data:", error);
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
        formState,
        handleFormSubmit,
    };
};