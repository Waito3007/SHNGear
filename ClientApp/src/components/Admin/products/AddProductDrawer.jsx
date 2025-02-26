import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';

const ProductDrawer = ({ isOpen, onClose, onAddProduct }) => {
    const [product, setProduct] = useState({
        name: "",
        description: "",
        price: 0,
        category: "SmartPhone",
        stockQuantity: 0,
        images: []
    });
    
    const [uploading, setUploading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct({ ...product, [name]: value });
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
        setProduct((prev) => ({
            ...prev,
            images: uploadedImages.filter((url) => url !== null),
        }));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("https://localhost:7107/api/products", {
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category,
                stockQuantity: product.stockQuantity,
                imageUrls: product.images // Gửi URL ảnh từ API
            });
            onAddProduct(response.data);
            onClose();
        } catch (error) {
            console.error("Failed to add product", error);
        }
    };

    return (
        <Drawer anchor='right' open={isOpen} onClose={onClose}>
            <div style={{ width: 400, padding: 20 }}>
                <h2>Add New Product</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label="Name"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Description"
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Price"
                        name="price"
                        type="number"
                        value={product.price}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
                    />
                    <TextField
                        label="Category"
                        name="category"
                        select
                        value={product.category}
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
                        label="Stock Quantity"
                        name="stockQuantity"
                        type="number"
                        value={product.stockQuantity}
                        onChange={handleChange}
                        fullWidth
                        margin="normal"
                        required
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
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button onClick={onClose} style={{ marginRight: 10 }}>Cancel</Button>
                        <Button type="submit" variant="contained" color="primary" disabled={uploading}>
                            {uploading ? 'Uploading...' : 'Add Product'}
                        </Button>
                    </div>
                </form>
            </div>
        </Drawer>
    );
};

export default ProductDrawer;