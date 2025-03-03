import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const EditProductDrawer = ({ isOpen, onClose, product, onUpdateProduct }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categoryId: '',
        brandId: '',
        variants: [],
        images: [], // Thêm trường images để chứa danh sách link ảnh
    });
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                categoryId: product.categoryId || '',
                brandId: product.brandId || '',
                variants: product.variants?.$values?.length > 0
                    ? product.variants.$values.map(variant => ({
                        color: variant.color || '',
                        storage: variant.storage || '',
                        price: variant.price || '',
                        discountPrice: variant.discountPrice || '',
                        stockQuantity: variant.stockQuantity || '',
                        flashSaleStart: variant.flashSaleStart || '',
                        flashSaleEnd: variant.flashSaleEnd || '',
                    }))
                    : [{ color: '', storage: '', price: '', discountPrice: '', stockQuantity: '', flashSaleStart: '', flashSaleEnd: '' }],
                images: product.images?.$values?.length > 0
                    ? product.images.$values.map(img => ({ imageUrl: img.imageUrl || '', isPrimary: img.isPrimary || false }))
                    : [{ imageUrl: '', isPrimary: false }], // Khởi tạo với một ô ảnh trống
            });
        }
    }, [product]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/categories");
                setCategories(response.data.$values || []);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setCategories([]);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/brands");
                setBrands(response.data.$values || []);
            } catch (error) {
                console.error("Lỗi khi lấy thương hiệu:", error);
                setBrands([]);
            }
        };
        fetchBrands();
    }, []);

    const handleChange = (e, index, type) => {
        const { name, value } = e.target;
        if (type === 'variant' && index !== undefined) {
            // Cập nhật biến thể
            setFormData(prev => {
                const newVariants = [...prev.variants];
                newVariants[index] = { ...newVariants[index], [name]: value };
                return { ...prev, variants: newVariants };
            });
        } else if (type === 'image' && index !== undefined) {
            // Cập nhật ảnh
            setFormData(prev => {
                const newImages = [...prev.images];
                newImages[index] = { ...newImages[index], [name]: value };
                return { ...prev, images: newImages };
            });
        } else {
            // Cập nhật các trường khác
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { color: '', storage: '', price: '', discountPrice: '', stockQuantity: '', flashSaleStart: '', flashSaleEnd: '' }],
        }));
    };

    const removeVariant = (index) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const addImage = () => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, { imageUrl: '', isPrimary: false }],
        }));
    };

    const removeImage = (index) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updatedData = {
                name: formData.name,
                description: formData.description,
                categoryId: formData.categoryId,
                brandId: formData.brandId,
                variants: formData.variants.map(variant => ({
                    color: variant.color,
                    storage: variant.storage,
                    price: parseFloat(variant.price),
                    discountPrice: parseFloat(variant.discountPrice),
                    stockQuantity: parseInt(variant.stockQuantity, 10),
                    flashSaleStart: variant.flashSaleStart || null,
                    flashSaleEnd: variant.flashSaleEnd || null,
                })),
                images: formData.images.map(img => ({
                    imageUrl: img.imageUrl,
                    isPrimary: img.isPrimary,
                })),
            };

            const response = await axios.put(
                `https://localhost:7107/api/products/${product.id}`,
                updatedData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 204 || response.status === 200) {
                onUpdateProduct({ ...product, ...updatedData });
                onClose();
            }
        } catch (error) {
            setError('Lỗi khi cập nhật sản phẩm: ' + error.message);
            console.error('Lỗi khi cập nhật sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer anchor="right" open={isOpen} onClose={onClose}>
            <div style={{ width: 500, padding: 20 }}>
                <h2>Edit Product</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Category"
                        name="categoryId"
                        select
                        value={formData.categoryId}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No categories available</MenuItem>
                        )}
                    </TextField>
                    <TextField
                        label="Brand"
                        name="brandId"
                        select
                        value={formData.brandId}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                    >
                        {brands.length > 0 ? (
                            brands.map((brand) => (
                                <MenuItem key={brand.id} value={brand.id}>
                                    {brand.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>No brands available</MenuItem>
                        )}
                    </TextField>

                    <h3>Images</h3>
                    {formData.images.map((image, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                            <TextField
                                label="Image URL"
                                name="imageUrl"
                                value={image.imageUrl}
                                onChange={(e) => handleChange(e, index, 'image')}
                                fullWidth
                                margin="normal"
                            />
                            <IconButton onClick={() => removeImage(index)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ))}
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addImage}
                        style={{ marginBottom: 20 }}
                    >
                        Add Image
                    </Button>

                    <h3>Variants</h3>
                    {formData.variants.map((variant, index) => (
                        <div key={index} style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}>
                            <TextField
                                label="Color"
                                name="color"
                                value={variant.color}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Storage"
                                name="storage"
                                value={variant.storage}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Price"
                                name="price"
                                type="number"
                                value={variant.price}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Discount Price"
                                name="discountPrice"
                                type="number"
                                value={variant.discountPrice}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Stock Quantity"
                                name="stockQuantity"
                                type="number"
                                value={variant.stockQuantity}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                            />
                            <TextField
                                label="Flash Sale Start"
                                name="flashSaleStart"
                                type="datetime-local"
                                value={variant.flashSaleStart}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                label="Flash Sale End"
                                name="flashSaleEnd"
                                type="datetime-local"
                                value={variant.flashSaleEnd}
                                onChange={(e) => handleChange(e, index, 'variant')}
                                fullWidth
                                margin="normal"
                                InputLabelProps={{ shrink: true }}
                            />
                            <IconButton onClick={() => removeVariant(index)} color="error">
                                <DeleteIcon />
                            </IconButton>
                        </div>
                    ))}
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={addVariant}
                        style={{ marginBottom: 20 }}
                    >
                        Add Variant
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        disabled={loading}
                        fullWidth
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default EditProductDrawer;