import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import BestSellerSection from '@/components/BestSellers/BestSellers'; // Import the BestSellerSection component

const BestSellerAdminPage = () => {
  const [homepageConfig, setHomepageConfig] = useState(null);
  const [bestSellerProductIds, setBestSellerProductIds] = useState([]);
  const [bestSellerProductsDetails, setBestSellerProductsDetails] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const fetchHomepageConfig = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`);
      const config = response.data;
      setHomepageConfig(config);
      if (config.components.best_seller && config.components.best_seller.productIds) {
        setBestSellerProductIds(config.components.best_seller.productIds);
      }
    } catch (err) {
      setError('Failed to load homepage configuration.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductDetails = useCallback(async (ids) => {
    if (ids.length === 0) {
      setBestSellerProductsDetails([]);
      return;
    }
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/by-ids?ids=${ids.join(',')}`);
      setBestSellerProductsDetails(response.data);
    } catch (err) {
      console.error('Failed to fetch product details:', err);
      setBestSellerProductsDetails([]); // Clear if error
    }
  }, []);

  useEffect(() => {
    fetchHomepageConfig();
  }, [fetchHomepageConfig]);

  useEffect(() => {
    if (bestSellerProductIds.length > 0) {
      fetchProductDetails(bestSellerProductIds);
    } else {
      setBestSellerProductsDetails([]);
    }
  }, [bestSellerProductIds, fetchProductDetails]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      setSearchLoading(true);
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/products/search?keyword=${searchQuery}`);
      // Filter out products already in the best seller list
      const filteredResults = response.data.filter(product => !bestSellerProductIds.includes(product.id));
      setSearchResults(filteredResults);
    } catch (err) {
      console.error('Failed to search products:', err);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const addProductToBestSellers = (product) => {
    if (!bestSellerProductIds.includes(product.id)) {
      setBestSellerProductIds(prevIds => [...prevIds, product.id]);
      setSearchResults(prevResults => prevResults.filter(p => p.id !== product.id)); // Remove from search results
    }
  };

  const removeProductFromBestSellers = (productId) => {
    setBestSellerProductIds(prevIds => prevIds.filter(id => id !== productId));
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedIds = Array.from(bestSellerProductIds);
    const [removed] = reorderedIds.splice(result.source.index, 1);
    reorderedIds.splice(result.destination.index, 0, removed);

    setBestSellerProductIds(reorderedIds);
  };

  const handleSave = async () => {
    if (!homepageConfig) return;

    try {
      setSaving(true);
      const updatedConfig = { ...homepageConfig };
      updatedConfig.components.best_seller = {
        ...updatedConfig.components.best_seller,
        enabled: true, // Ensure it's enabled when saving products
        productIds: bestSellerProductIds,
      };
      // Ensure 'best_seller' is in the layout if not already
      if (!updatedConfig.layout.includes('best_seller')) {
        updatedConfig.layout.push('best_seller');
      }

      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/homepage-config`, updatedConfig);
      alert('Best Seller configuration saved successfully!');
    } catch (err) {
      setError('Failed to save Best Seller configuration.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading Best Seller Admin...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const previewData = {
    enabled: homepageConfig?.components?.best_seller?.enabled || true,
    title: homepageConfig?.components?.best_seller?.title || "Best Sellers",
    productIds: bestSellerProductIds,
  };

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Best Sellers</h1>

      {/* Search and Add Products */}
      <div className="mb-8 p-4 border border-gray-700 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Add Products</h2>
        <div className="flex mb-4">
          <input
            type="text"
            className="flex-grow p-2 rounded-l-md bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-electric-blue"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
          />
          <button
            onClick={handleSearch}
            className="bg-electric-blue text-white px-4 py-2 rounded-r-md hover:bg-electric-blue-dark transition-colors duration-200"
            disabled={searchLoading}
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-md p-2">
          {searchResults.length === 0 && !searchLoading && <p className="text-gray-400">No results or start typing to search.</p>}
          {searchResults.map(product => (
            <div key={product.id} className="flex items-center justify-between p-2 border-b border-gray-700 last:border-b-0">
              <div className="flex items-center">
                {product.images && product.images.length > 0 && (
                  <img src={product.images[0].imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded mr-3" />
                )}
                <span>{product.name}</span>
              </div>
              <button
                onClick={() => addProductToBestSellers(product)}
                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors duration-200"
              >
                Add
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Best Seller List (Drag and Drop) */}
      <div className="mb-8 p-4 border border-gray-700 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Current Best Sellers ({bestSellerProductIds.length})</h2>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="best-sellers-list">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="min-h-[100px] border border-gray-600 rounded-md p-2 bg-gray-800"
              >
                {bestSellerProductsDetails.length === 0 && <p className="text-gray-400 text-center py-4">Drag products here or add from search.</p>}
                {bestSellerProductsDetails.map((product, index) => (
                  <Draggable key={product.id} draggableId={product.id.toString()} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="flex items-center justify-between p-3 mb-2 bg-gray-700 rounded-md shadow-md border border-gray-600"
                      >
                        <div className="flex items-center">
                          {product.images && product.images.length > 0 && (
                            <img src={product.images[0].imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
                          )}
                          <span className="font-medium">{product.name}</span>
                        </div>
                        <button
                          onClick={() => removeProductFromBestSellers(product.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <button
          onClick={handleSave}
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-md text-lg hover:bg-blue-700 transition-colors duration-200 w-full"
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Best Seller Configuration'}
        </button>
      </div>

      {/* Live Preview */}
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
        <h2 className="text-2xl font-semibold mb-4">Live Preview</h2>
        <BestSellerSection data={previewData} />
      </div>
    </div>
  );
};

export default BestSellerAdminPage;
