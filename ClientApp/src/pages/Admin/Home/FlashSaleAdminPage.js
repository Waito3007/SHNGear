import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AutoComplete, Button, Table, InputNumber, DatePicker, message, Popconfirm, Space, Card, Typography, Select, Spin, Alert, Input } from 'antd';
import { SearchOutlined, DeleteOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const FlashSaleAdminPage = () => {
  const [products, setProducts] = useState([]); // All products for selection
  const [flashSaleProducts, setFlashSaleProducts] = useState([]); // Products currently on flash sale
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [searchedProductsOptions, setSearchedProductsOptions] = useState([]);

  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
  const [newFlashSalePrice, setNewFlashSalePrice] = useState(0);
  const [newFlashSaleStartDate, setNewFlashSaleStartDate] = useState(null);
  const [newFlashSaleEndDate, setNewFlashSaleEndDate] = useState(null);

  useEffect(() => {
    fetchFlashSaleProducts();
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products`);
      setProducts(response.data.$values || response.data || []);
    } catch (err) {
      message.error('Failed to load all products for selection.');
      console.error(err);
    }
  };

  const fetchFlashSaleProducts = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/Products/flash-sale`);
      const detailedProducts = data.$values || data || [];

      const combinedProducts = detailedProducts.map(flashSaleProduct => {
        const primaryImage = flashSaleProduct?.images?.find(img => img.isPrimary) || flashSaleProduct?.images?.[0];
        const imageUrl = primaryImage ? (primaryImage.imageUrl.startsWith("http") ? primaryImage.imageUrl : `${API_BASE_URL}/${primaryImage.imageUrl}`) : "https://via.placeholder.com/50";

        // Determine original price from variants (assuming first variant for simplicity, or find min price)
        const originalPrice = flashSaleProduct.variants?.[0]?.price || 0;

        return {
          ...flashSaleProduct,
          imageUrl: imageUrl,
          originalPrice: originalPrice,
        };
      });
      setFlashSaleProducts(combinedProducts);
    } catch (err) {
      setError('Failed to load flash sale products.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchProduct = (value) => {
    if (value) {
      const filtered = products.filter(p => p.name.toLowerCase().includes(value.toLowerCase()));
      setSearchedProductsOptions(filtered.map(p => ({
        value: p.id,
        label: (
          <Space>
            <img src={p.images?.[0]?.imageUrl?.startsWith("http") ? p.images[0].imageUrl : `${API_BASE_URL}/${p.images?.[0]?.imageUrl}`} alt={p.name} style={{ width: 30, height: 30, objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/30"; }} />
            {p.name}
          </Space>
        ),
        product: p
      })));
    } else {
      setSearchedProductsOptions([]);
    }
    setSearchText(value);
  };

  const handleSelectProduct = (value, option) => {
    setSelectedProductToAdd(option.product);
    setSearchText(option.product.name); // Keep selected product name in search input
  };

  const handleSetFlashSale = async () => {
    if (!selectedProductToAdd || !newFlashSalePrice || !newFlashSaleStartDate || !newFlashSaleEndDate) {
      message.error('Please fill all flash sale fields.');
      return;
    }

    try {
      await axios.put(`${API_BASE_URL}/api/products/${selectedProductToAdd.id}/set-flash-sale`, {
        flashSalePrice: newFlashSalePrice,
        flashSaleStartDate: newFlashSaleStartDate.toISOString(),
        flashSaleEndDate: newFlashSaleEndDate.toISOString(),
      });
      message.success('Flash sale set successfully!');
      resetForm();
      fetchFlashSaleProducts();
    } catch (err) {
      message.error('Failed to set flash sale.');
      console.error(err);
    }
  };

  const handleClearFlashSale = async (productId) => {
    try {
      await axios.put(`${API_BASE_URL}/api/products/${productId}/clear-flash-sale`);
      message.success('Flash sale cleared successfully!');
      fetchFlashSaleProducts();
    } catch (err) {
      message.error('Failed to clear flash sale.');
      console.error(err);
    }
  };

  const resetForm = () => {
    setSelectedProductToAdd(null);
    setNewFlashSalePrice(0);
    setNewFlashSaleStartDate(null);
    setNewFlashSaleEndDate(null);
    setSearchText('');
  };

  const priceOptions = [100000, 500000, 1000000, 2000000, 5000000];

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
      render: (price) => (
        <Text strong type="danger">
          {price?.toLocaleString('vi-VN')}đ
        </Text>
      )
    },
    {
      title: 'Start Date',
      dataIndex: 'flashSaleStartDate',
      key: 'flashSaleStartDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
    },
    {
      title: 'End Date',
      dataIndex: 'flashSaleEndDate',
      key: 'flashSaleEndDate',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm:ss') : 'N/A'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title="Are you sure you want to clear flash sale for this product?" onConfirm={() => handleClearFlashSale(record.id)} okText="Yes" cancelText="No">
          <Button danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen"><Spin size="large" /></div>;
  }

  if (error) {
    return <div className="p-8"><Alert message="Error" description={error} type="error" showIcon /></div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-900 min-h-screen text-white">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6">Manage Flash Sales</h1>

      <Card title={<span className="text-lg font-semibold text-white">Set Product for Flash Sale</span>} bordered={false} className="shadow-sm mb-8 bg-gray-800" headStyle={{background:'#1f2937', border:'none'}} bodyStyle={{background:'#1f2937'}}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Text strong className="text-white">Select Product:</Text>
          <AutoComplete
            value={searchText}
            onSearch={handleSearchProduct}
            onSelect={handleSelectProduct}
            options={searchedProductsOptions}
            style={{ width: '100%' }}
            placeholder="Search product by name..."
          >
            <Input prefix={<SearchOutlined />} />
          </AutoComplete>

          {selectedProductToAdd && (
            <Text type="secondary" className="text-gray-300">Selected: {selectedProductToAdd.name}</Text>
          )}

          <Text strong className="text-white">Flash Sale Price:</Text>
          <InputNumber
            className="w-full"
            value={newFlashSalePrice}
            onChange={setNewFlashSalePrice}
            formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + 'đ'}
            parser={value => value.replace(/\s?đ|(,*)/g, '')}
            min={0}
          />
          <Space wrap>
            {priceOptions.map(price => (
              <Button key={price} onClick={() => setNewFlashSalePrice(price)}>
                {price.toLocaleString('vi-VN')}đ
              </Button>
            ))}
          </Space>

          <Text strong className="text-white">Start Date/Time:</Text>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value={newFlashSaleStartDate}
            onChange={setNewFlashSaleStartDate}
            style={{ width: '100%' }}
          />

          <Text strong className="text-white">End Date/Time:</Text>
          <DatePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            value={newFlashSaleEndDate}
            onChange={setNewFlashSaleEndDate}
            style={{ width: '100%' }}
          />

          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSetFlashSale}
            size="large"
            style={{ width: '100%' }}
          >
            Set Flash Sale
          </Button>
        </Space>
      </Card>

      <Card title={<span className="text-lg font-semibold text-white">Current Flash Sale Products</span>} bordered={false} className="shadow-sm bg-gray-800" headStyle={{background:'#1f2937', border:'none'}} bodyStyle={{background:'#1f2937'}}>
        <Table
          columns={columns}
          dataSource={flashSaleProducts}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          bordered
        />
      </Card>
    </div>
  );
};

export default FlashSaleAdminPage;
