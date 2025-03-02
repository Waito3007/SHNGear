import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import axios from 'axios';

const EditProductDrawer = ({ isOpen, onClose, product, onUpdateProduct }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        brand: '',
        stockQuantity: ''
    });

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                description: product.description || '',
                price: product.price || '',
                discountPrice: product.discountPrice || '',
                category: product.categoryId || '',
                brand: product.brandId || '',
                stockQuantity: product.stockQuantity || ''
            });
        }
    }, [product]);

    // Fetch danh mục sản phẩm từ API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/categories");
                if (response.data && Array.isArray(response.data.$values)) {
                    setCategories(response.data.$values);
                } else {
                    setCategories([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    // Fetch danh sách thương hiệu từ API
    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await axios.get("https://localhost:7107/api/brands");
                if (response.data && Array.isArray(response.data.$values)) {
                    setBrands(response.data.$values);
                } else {
                    setBrands([]);
                }
            } catch (error) {
                console.error("Lỗi khi lấy thương hiệu:", error);
                setBrands([]);
            }
        };

        fetchBrands();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedData = {
                name: formData.name,
                description: formData.description,
                categoryId: formData.category,
                brandId: formData.brand,  // Thêm brandId vào dữ liệu cập nhật
                price: parseFloat(formData.price),
                discountPrice: parseFloat(formData.discountPrice),
                stockQuantity: parseInt(formData.stockQuantity, 10),
            };

            const response = await axios.put(
                `https://localhost:7107/api/products/${product.id}`,
                updatedData,
                { headers: { 'Content-Type': 'application/json' } }
            );

            if (response.status === 200) {
                onUpdateProduct(response.data);
                onClose();
            } else {
                console.error('Cập nhật sản phẩm thất bại:', response);
            }
        } catch (error) {
            console.error('Lỗi khi cập nhật sản phẩm:', error);
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
                    >
                        {categories.length > 0 ? (
                            categories.map((cat) => (
                                <MenuItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </MenuItem>
                            ))
                        ) : (
                            <MenuItem disabled>Không có danh mục nào</MenuItem>
                        )}
                    </TextField>

                    {/* Chọn thương hiệu */}
                    <TextField
                        label="Brand"
                        name="brand"
                        select
                        value={formData.brand}
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
                            <MenuItem disabled>Không có thương hiệu nào</MenuItem>
                        )}
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
                    <Button type='submit' variant='contained' color='primary'>
                        Save
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default EditProductDrawer;
