import { useForm } from 'react-hook-form';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
export const useBannerForm = ({ onAddBanner, onClose, initialImage = [], initialImageUrls = [""] }) => { 
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
            linkTo: '',
            status: true
        },
        mode: 'onChange',
    });
    
    const handleFormSubmit = async (data) => {
        try {
            if (!data.imageUrl || data.imageUrl.trim() === "") {
                console.error("No image provided for the banner.");
                return;
            }
            const bannerData = {
                title: data.title,
                imageUrl: data.imageUrl,
                linkTo: data.linkTo,
                status: data.status
            };
            console.log('Banner data gửi lên:', bannerData);
            const response = await axios.post(`${API_BASE_URL}/api/Banner`, bannerData);
            onAddBanner(response.data);
            reset();
            onClose();
            return response.data;
        } catch (error) {
            console.error("Error submitting banner data:", error);
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