import React, { useState, useEffect } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { Edit } from 'lucide-react';

const EditProductDrawer = ({ isOpen, onClose, product, onUpdateProduct }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        discountPrice: '',
        category: '',
        stockQuantity: '',
    });

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discountPrice: product.discountPrice,
                category: product.category,
                stockQuantity: product.stockQuantity,
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
                        label='Category'
                        name='category'
                        value={formData.category}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
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