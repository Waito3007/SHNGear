import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AutoComplete, Button, Table, InputNumber, DatePicker, message, Popconfirm, Space, Input, Card, Typography } from 'antd';
import { SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FlashSaleManager = () => {
    const [searchText, setSearchText] = useState('');
    const [searchedProducts, setSearchedProducts] = useState([]);
    const [flashSaleProducts, setFlashSaleProducts] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFlashSaleProducts = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/Products/flash-sale`);
            // Fetch full product details for each flash sale item
            const productIds = (data.$values || data).map(p => p.id);
            if (productIds.length > 0) {
                const productsDetailResponse = await axios.get(`${API_BASE_URL}/api/Products/by-ids?ids=${productIds.join(',')}`);
                const detailedProducts = productsDetailResponse.data.$values || productsDetailResponse.data || [];

                const combinedProducts = (data.$values || data).map(flashSaleProduct => {
                    const detail = detailedProducts.find(dp => dp.id === flashSaleProduct.id);
                    const primaryImage = detail?.images?.find(img => img.isPrimary) || detail?.images?.[0];
                    const imageUrl = primaryImage ? (primaryImage.imageUrl.startsWith("http") ? primaryImage.imageUrl : `${API_BASE_URL}/${primaryImage.imageUrl}`) : "https://via.placeholder.com/50";

                    return {
                        ...flashSaleProduct,
                        name: detail?.name || `Product ${flashSaleProduct.id}`,
                        imageUrl: imageUrl,
                        originalPrice: detail?.variants?.[0]?.price || 0, // Assuming first variant price as original
                    };
                });
                setFlashSaleProducts(combinedProducts);
            } else {
                setFlashSaleProducts([]);
            }
        } catch (error) {
            message.error('Failed to load flash sale products.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFlashSaleProducts();
    }, []);

    const handleSearch = async (value) => {
        if (!value) {
            setSearchedProducts([]);
            return;
        }
        try {
            const { data } = await axios.get(`${API_BASE_URL}/api/Products/search?keyword=${value}`);
            const options = (data.$values || data).map(p => ({
                value: p.name,
                key: p.id,
                product: p,
                label: (
                    <Space>
                        <img src={p.images?.[0]?.imageUrl?.startsWith("http") ? p.images[0].imageUrl : `${API_BASE_URL}/${p.images?.[0]?.imageUrl}`} alt={p.name} style={{ width: 30, height: 30, objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/30"; }} />
                        {p.name}
                    </Space>
                )
            }));
            setSearchedProducts(options);
        } catch (error) {
            setSearchedProducts([]);
        }
    };

    const onSelect = (value, option) => {
        const product = option.product;
        if (flashSaleProducts.some(p => p.id === product.id)) {
            message.warning('Product is already in the flash sale list.');
            return;
        }
        // Add to list with default values and fetched details
        const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0];
        const imageUrl = primaryImage ? (primaryImage.imageUrl.startsWith("http") ? primaryImage.imageUrl : `${API_BASE_URL}/${primaryImage.imageUrl}`) : "https://via.placeholder.com/50";

        setFlashSaleProducts(prev => [...prev, {
            id: product.id,
            name: product.name,
            imageUrl: imageUrl,
            originalPrice: product.variants?.[0]?.price || 0,
            flashSalePrice: 0,
            flashSaleStartDate: null,
            flashSaleEndDate: null
        }]);
        setSearchText(''); // Clear search input
    };

    const handleUpdate = async (productId, field, value) => {
        const product = flashSaleProducts.find(p => p.id === productId);
        if (!product) return;

        const updatedProduct = { ...product, [field]: value };

        // Optimistic update
        setFlashSaleProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));

        const dto = {
            FlashSalePrice: updatedProduct.flashSalePrice,
            FlashSaleStartDate: updatedProduct.flashSaleStartDate,
            FlashSaleEndDate: updatedProduct.flashSaleEndDate,
        };

        try {
            await axios.put(`${API_BASE_URL}/api/Products/${productId}/set-flash-sale`, dto);
            message.success('Flash sale updated!');
        } catch (error) {
            message.error('Failed to update flash sale.');
            // Revert on failure
            setFlashSaleProducts(prev => prev.map(p => p.id === productId ? product : p));
        }
    };

    const handleRemove = async (productId) => {
        const originalList = [...flashSaleProducts];
        setFlashSaleProducts(prev => prev.filter(p => p.id !== productId));
        try {
            await axios.put(`${API_BASE_URL}/api/Products/${productId}/clear-flash-sale`);
            message.success('Product removed from flash sale.');
        } catch (error) {
            message.error('Failed to remove product from flash sale.');
            setFlashSaleProducts(originalList);
        }
    };

    const columns = [
        {
            title: 'Product',
            key: 'productInfo',
            render: (_, record) => (
                <Space>
                    <img src={record.imageUrl} alt={record.name} style={{ width: 50, height: 50, objectFit: 'contain' }} />
                    <Text>{record.name}</Text>
                </Space>
            )
        },
        {
            title: 'Original Price',
            key: 'originalPrice',
            render: (_, record) => (
                <Text delete={record.flashSalePrice !== null && record.flashSalePrice < record.originalPrice}>
                    {record.originalPrice.toLocaleString('vi-VN')}đ
                </Text>
            )
        },
        {
            title: 'Flash Sale Price',
            dataIndex: 'flashSalePrice',
            key: 'flashSalePrice',
            render: (price, record) => (
                <InputNumber
                    defaultValue={price}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ'}
                    parser={value => value.replace(/\s?đ|(,*)/g, '')}
                    onBlur={(e) => handleUpdate(record.id, 'flashSalePrice', parseFloat(e.target.value.replace(/đ|,/g, '')))}
                    style={{ width: 150 }}
                    min={0}
                />
            )
        },
        {
            title: 'Start Date',
            dataIndex: 'flashSaleStartDate',
            key: 'flashSaleStartDate',
            render: (date, record) => (
                <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={date ? dayjs(date) : null}
                    onChange={(value) => handleUpdate(record.id, 'flashSaleStartDate', value ? value.toISOString() : null)}
                    style={{ width: 180 }}
                />
            )
        },
        {
            title: 'End Date',
            dataIndex: 'flashSaleEndDate',
            key: 'flashSaleEndDate',
            render: (date, record) => (
                <DatePicker
                    showTime
                    format="YYYY-MM-DD HH:mm:ss"
                    value={date ? dayjs(date) : null}
                    onChange={(value) => handleUpdate(record.id, 'flashSaleEndDate', value ? value.toISOString() : null)}
                    style={{ width: 180 }}
                />
            )
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Popconfirm title="Are you sure you want to remove this product from flash sale?" onConfirm={() => handleRemove(record.id)} okText="Yes" cancelText="No">
                    <Button danger icon={<DeleteOutlined />} />
                </Popconfirm>
            )
        }
    ];

    return (
        <Card title="Flash Sale Management" bordered={false} style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
                <AutoComplete
                    style={{ width: '100%' }}
                    onSearch={handleSearch}
                    onSelect={onSelect}
                    placeholder="Search and add a product to flash sale..."
                    options={searchedProducts}
                    value={searchText}
                    onChange={setSearchText}
                >
                    <Input prefix={<SearchOutlined />} />
                </AutoComplete>

                <Table
                    columns={columns}
                    dataSource={flashSaleProducts}
                    rowKey="id"
                    loading={loading}
                    pagination={false}
                    bordered
                />
            </Space>
        </Card>
    );
};

export default FlashSaleManager;
