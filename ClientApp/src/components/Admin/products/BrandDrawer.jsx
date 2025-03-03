import React, { useState } from 'react';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import axios from 'axios';

const BrandDrawer = ({ open, onClose }) => {
    const [brand, setBrand] = useState({
        name: '',
        description: '',
        logo: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setBrand({ ...brand, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('https://localhost:7107/api/brands', brand);
            console.log('Brand added:', response.data);
            onClose();
        } catch (error) {
            console.error('Failed to add brand:', error);
        }
    };

    return (
        <Drawer anchor='right' open={open} onClose={onClose}>
            <div style={{ width: 400, padding: 20 }}>
                <h2>Add New Brand</h2>
                <form onSubmit={handleSubmit}>
                    <TextField
                        label='Name'
                        name='name'
                        value={brand.name}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                        required
                    />
                    <TextField
                        label='Description'
                        name='description'
                        value={brand.description}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                        required
                    />
                    <TextField
                        label='Logo URL'
                        name='logo'
                        value={brand.logo}
                        onChange={handleChange}
                        fullWidth
                        margin='normal'
                    />
                    <Button type='submit' variant='contained' color='primary'>
                        Add Brand
                    </Button>
                </form>
            </div>
        </Drawer>
    );
};

export default BrandDrawer; 