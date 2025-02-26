import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const EditProductDrawer = ({ isOpen, onClose, product, onUpdateProduct }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stockQuantity: '',
        images: []
    });

    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discountPrice: product.discountPrice,
                category: product.category,
                stockQuantity: product.stockQuantity,
                images: Array.isArray(product.images) ? product.images : []
            });
        }
    }, [product]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageUpload = async (files) => {
        setUploading(true);
        const uploadedImages = await Promise.all(
            [...files].map(async (file) => {
                const formData = new FormData();
                formData.append("file", file);
    
                try {
                    const response = await axios.post(
                        "https://localhost:7107/api/products/upload-image",
                        formData,
                        {
                            headers: { "Content-Type": "multipart/form-data" }
                        }
                    );
                    return response.data.imageUrl; // API trả về { ImageUrl: "URL" }
                } catch (error) {
                    console.error("Upload ảnh thất bại", error);
                    return null;
                }
            })
        );
    
        setUploading(false);
        setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...uploadedImages.filter((url) => url !== null)],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`https://localhost:7107/api/products/${product.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });
            if (response.ok) {
                const updatedProduct = await response.json();
                onUpdateProduct(updatedProduct);
                onClose();
            } else {
                console.error('Failed to update product');
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    return (
        <Drawer anchor='right' open={isOpen} onClose={onClose}>
            <div style={{ width: 400, padding: 20 }}>
                <h2>Edit Product</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label='Name'
                        name='name'
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        label='Description'
                        name='description'
                        value={formData.description}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        label='Price'
                        name='price'
                        type='number'
                        value={formData.price}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        label='Discount Price'
                        name='discountPrice'
                        type='number'
                        value={formData.discountPrice}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <TextField
                        label="Category"
                        name="category"
                        select
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    >
                        <MenuItem value="SmartPhone">SmartPhone</MenuItem>
                        <MenuItem value="Laptop">Laptop</MenuItem>
                        <MenuItem value="Headphone">Headphone</MenuItem>
                    </TextField>
                    <TextField
                        label='Stock Quantity'
                        name='stockQuantity'
                        type='number'
                        value={formData.stockQuantity}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <input
                        type="file"
                        name="images"
                        multiple
                        onChange={(e) => handleImageUpload(e.target.files)}
                        style={{ margin: "20px 0" }}
                    />
                    {uploading && (
                        <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                            <CircularProgress />
                        </div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
                        {formData.images.map((url, index) => (
                            <img key={index} src={url} alt={`Product Image ${index + 1}`} style={{ width: '100px', height: '100px', objectFit: 'cover' }} />
                        ))}
                    </div>
                    <Button type='submit' variant='contained' color='primary' disabled={uploading}>
                        {uploading ? 'Uploading...' : 'Save'}
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default EditProductDrawer;