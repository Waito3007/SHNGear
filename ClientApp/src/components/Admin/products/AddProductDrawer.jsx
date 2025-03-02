import { useState, useEffect } from 'react';
import { Drawer } from '@mui/material';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import { X } from 'lucide-react';

const ProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
    const { register, handleSubmit, reset, control } = useForm({
        defaultValues: {
            name: '',
            description: '',
            categoryId: '',
            brandId: '',
            images: [],
            variants: [],
        }
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

    useEffect(() => {
        axios.get('https://localhost:7107/api/categories')
            .then(response => setCategories(response.data.$values || []))
            .catch(error => console.error('Error fetching categories:', error));

        axios.get('https://localhost:7107/api/brands')
            .then(response => setBrands(response.data.$values || []))
            .catch(error => console.error('Error fetching brands:', error));
    }, []);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploadingImage(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('https://localhost:7107/api/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            appendImage({ imageUrl: response.data.url, isPrimary: imageFields.length === 0 });
        } catch (error) {
            console.error('Image upload failed:', error);
        } finally {
            setUploadingImage(false);
        }
    };

    const onSubmit = async (data) => {
        try {
            const response = await axios.post('https://localhost:7107/api/Products', data);
            onAddProduct(response.data);
            reset();
            onClose();
        } catch (error) {
            console.error('Error adding product:', error.response?.data || error.message);
        }
    };

    return (
        <Drawer anchor='right' open={isOpen} onClose={onClose}>
            <div className='w-96 p-6 bg-gray-900 h-full text-white'>
                <div className='flex justify-between items-center mb-4'>
                    <h2 className='text-xl font-semibold'>Thêm sản phẩm</h2>
                    <button onClick={onClose} className='text-gray-400 hover:text-white'><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <label className='block text-sm'>Tên sản phẩm</label>
                    <input {...register('name')} className='w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md' required />

                    <label className='block text-sm'>Mô tả</label>
                    <textarea {...register('description')} className='w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md' required />

                    <label className='block text-sm'>Danh mục</label>
                    <select {...register('categoryId')} className='w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md'>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                    </select>

                    <label className='block text-sm'>Thương hiệu</label>
                    <select {...register('brandId')} className='w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md'>
                        {brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                    </select>

                    {/* Hình ảnh */}
                    <label className='block text-sm'>Hình ảnh</label>
                    <input type='file' accept='image/*' onChange={handleImageUpload} className='w-full p-2 mb-3 bg-gray-800 border border-gray-700 rounded-md' />
                    {uploadingImage && <p className="text-sm text-gray-400">Đang tải ảnh...</p>}
                    <div className="mt-2">
                        {imageFields.map((img, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <img src={img.imageUrl} alt="Uploaded" className="w-20 h-20 object-cover rounded-md" />
                                <button type="button" onClick={() => removeImage(index)} className="text-red-500">Xóa</button>
                            </div>
                        ))}
                    </div>

                    {/* Biến thể sản phẩm */}
                    <label className='block text-sm mt-3'>Biến thể sản phẩm</label>
                    {variantFields.map((variant, index) => (
                        <div key={index} className="p-3 mb-3 border border-gray-700 rounded-md">
                            <label className='block text-xs'>Màu sắc</label>
                            <input {...register(`variants.${index}.color`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' required />

                            <label className='block text-xs'>Dung lượng</label>
                            <input {...register(`variants.${index}.storage`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' required />

                            <label className='block text-xs'>Giá</label>
                            <input type='number' {...register(`variants.${index}.price`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' required />

                            <label className='block text-xs'>Giá giảm</label>
                            <input type='number' {...register(`variants.${index}.discountPrice`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' />

                            <label className='block text-xs'>Số lượng tồn</label>
                            <input type='number' {...register(`variants.${index}.stockQuantity`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' required />

                            <label className='block text-xs'>Flash Sale - Ngày bắt đầu</label>
                            <input type='datetime-local' {...register(`variants.${index}.flashSaleStart`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' />

                            <label className='block text-xs'>Flash Sale - Ngày kết thúc</label>
                            <input type='datetime-local' {...register(`variants.${index}.flashSaleEnd`)} className='w-full p-1 mb-2 bg-gray-800 border border-gray-700 rounded-md' />

                            <button type="button" onClick={() => removeVariant(index)} className="text-red-500 mt-2">Xóa biến thể</button>
                        </div>
                    ))}
                    <button type="button" onClick={() => appendVariant({})} className="text-blue-500">Thêm biến thể</button>

                    <button type='submit' className='w-full bg-indigo-600 hover:bg-indigo-500 p-2 rounded-md text-white mt-4'>Thêm sản phẩm</button>
                </form>
            </div>
        </Drawer>
    );
};

export default ProductDrawer;
