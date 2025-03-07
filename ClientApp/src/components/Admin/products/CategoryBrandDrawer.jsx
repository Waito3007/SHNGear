import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';

const CategoryBrandDrawer = ({ open, onClose }) => {
    const [category, setCategory] = useState({
        name: '',
        description: '',
        image: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCategory({ ...category, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7107/api/categories', category);
            console.log('Category added:', response.data);
            onClose();
        } catch (error) {
            console.error('Failed to add category:', error);
        }
    };

    return (
        <Drawer anchor='right' open={open} onClose={onClose}>
            <div style={{ width: 400, padding: 20 }}>
                <h2>Add New Category</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label='Name'
                        name='name'
                        value={category.name}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                        required
                    />
                    <TextField
                        label='Description'
                        name='description'
                        value={category.description}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                        required
                    />
                    <TextField
                        label='Image URL'
                        name='image'
                        value={category.image}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <Button type='submit' variant='contained' color='primary'>
                        Add Category
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default CategoryBrandDrawer; 