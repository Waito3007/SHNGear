import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AutoComplete, Button, Table, InputNumber, message, Popconfirm, Space } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const BestSellerManager = ({ sectionData, onContentChange }) => {
    const [searchText, setSearchText] = useState('');
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [bestSellerItems, setBestSellerItems] = useState(sectionData.items || []);

    useEffect(() => {
        setBestSellerItems(sectionData.items || []);
    }, [sectionData.items]);

    const fetchProductDetails = async (productIds) => {
        if (productIds.length === 0) return [];
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/Products/by-ids?ids=${productIds.join(',')}`);
            return data || [];
        } catch (error) {
            message.error('Failed to fetch product details.');
            return [];
        }
    };

    const handleSearch = async (value) => {
        if (!value) {
            setSearchedProducts([]);
            return;
        }
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/Products/search?keyword=${value}`);
            const options = (data.$values || data).map(p => ({ value: p.name, key: p.id, product: p }));
            setSearchedProducts(options);
        } catch (error) {
            setSearchedProducts([]);
        }
    };

    const onSelect = (value, option) => {
        const product = option.product;
        if (bestSellerItems.some(item => item.productId === product.id)) {
            message.warning('Product is already in the best seller list.');
            return;
        }
        const newItem = { productId: product.id, overridePrice: null };
        const updatedItems = [...bestSellerItems, newItem];
        setBestSellerItems(updatedItems);
        onContentChange('best_seller', null, { ...sectionData, items: updatedItems });
        setSearchText(''); // Clear search input
    };

    const handleUpdate = (productId, field, value) => {
        const updatedItems = bestSellerItems.map(item =>
            item.productId === productId ? { ...item, [field]: value } : item
        );
        setBestSellerItems(updatedItems);
        onContentChange('best_seller', null, { ...sectionData, items: updatedItems });
    };

    const handleRemove = (productId) => {
        const updatedItems = bestSellerItems.filter(item => item.productId !== productId);
        setBestSellerItems(updatedItems);
        onContentChange('best_seller', null, { ...sectionData, items: updatedItems });
    };

    const columns = [
        { title: 'Product ID', dataIndex: 'productId', key: 'productId' },
        {
            title: 'Product Name',
            key: 'productName',
            render: (text, record) => {
                // This will require fetching product details, which is done in BestSellers.jsx
                // For admin, we might need a separate lookup or pass product details from parent
                return `Product ${record.productId}`;
            }
        },
        {
            title: 'Override Price',
            dataIndex: 'overridePrice',
            key: 'overridePrice',
            render: (price, record) => (
                <InputNumber
                    defaultValue={price}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\s?|(,*)/g, '')}
                    onBlur={(e) => handleUpdate(record.productId, 'overridePrice', parseFloat(e.target.value.replace(/,/g, '')))}
                    style={{ width: 150 }}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Popconfirm title="Are you sure?" onConfirm={() => handleRemove(record.productId)}>
                    <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <div>
            <AutoComplete
                style={{ width: '100%', marginBottom: 16 }}
                onSearch={handleSearch}
                onSelect={onSelect}
                placeholder="Search and add a product..."
                options={searchedProducts}
                value={searchText}
                onChange={setSearchText}
            >
                <InputNumber addonAfter={<SearchOutlined />} />
            </AutoComplete>

            <Table
                columns={columns}
                dataSource={bestSellerItems}
                rowKey="productId"
                pagination={false}
            />
        </div>
    );
};

export default BestSellerManager;
