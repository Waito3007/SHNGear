import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductDrawer from './AddProductDrawer'; // Import the new ProductDrawer component

const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        fetch('https://localhost:7107/api/products')
            .then(response => response.json())
            .then(data => {
                if (data && data.$values && Array.isArray(data.$values)) {
                    setProducts(data.$values);
                    setFilteredProducts(data.$values);
                } else {
                    console.error('Error: Data is not in the expected format');
                }
            })
            .catch(error => console.error('Error fetching products:', error));
    }, []);

    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);
        const filtered = products.filter(
            (product) => product.name.toLowerCase().includes(term) || product.category.toLowerCase().includes(term)
        );

        setFilteredProducts(filtered);
    };

    const handleAddProduct = (newProduct) => {
        setProducts([...products, newProduct]);
        setFilteredProducts([...products, newProduct]);
    };

    return (
        <motion.div
            className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className='flex justify-between items-center mb-6'>
                <h2 className='text-xl font-semibold text-gray-100'>Danh sách sản phẩm</h2>
                
				<div className='relative'>
                    <input
                        type='text'
                        placeholder='Tìm kiếm sản phẩm...'
                        className='bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className='absolute left-3 top-2.5 text-gray-400' size={18} />
                </div>
				<button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => setIsDrawerOpen(true)}>
                <Plus size={18} />
                </button>
            </div>

            <div className='overflow-x-auto'>
                <table className='min-w-full divide-y divide-gray-700'>
                    <thead>
                        <tr>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Tên
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Danh mục
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Giá
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Tồn kho
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Bán
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Hành động
                            </th>
                        </tr>
                    </thead>

                    <tbody className='divide-y divide-gray-700'>
                        {filteredProducts.map((product) => (
                            <motion.tr
                                key={product.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className='px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center'>
                                    <img
                                        src={product.images && product.images.$values && product.images.$values.length > 0 ? product.images.$values[0].imageUrl : 'https://via.placeholder.com/50'}
                                        alt='Product img'
                                        className='size-10 rounded-full'
                                    />
                                    {product.name}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {product.category}
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    ${product.price ? product.price.toFixed(2) : 'N/A'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.stockQuantity}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>{product.sales}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2'>
                                        <Edit size={18} />
                                    </button>
                                    <button className='text-red-400 hover:text-red-300'>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ProductDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAddProduct={handleAddProduct} />
        </motion.div>
    );
};

export default ProductsTable;
