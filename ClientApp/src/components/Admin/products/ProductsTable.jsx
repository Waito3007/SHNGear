import { motion } from "framer-motion";
import { Edit, Search, Trash2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import ProductDrawer from './AddProductDrawer'; // Import the new ProductDrawer component
import EditProductDrawer from './EditProductDrawer'; // Import the EditProductDrawer component
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Button from '@mui/material/Button';
import CategoryBrandDrawer from './CategoryBrandDrawer'; // Import the CategoryBrandDrawer component
import BrandDrawer from './BrandDrawer'; // Import the BrandDrawer component
import Pagination from '@mui/material/Pagination';

const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isCategoryBrandDrawerOpen, setIsCategoryBrandDrawerOpen] = useState(false);
    const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
    const [page, setPage] = useState(1);
    const productsPerPage = 11;

    useEffect(() => {
        fetch('https://localhost:7107/api/Products')
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

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEditDrawerOpen(true);
    };

    const handleUpdateProduct = (updatedProduct) => {
        const updatedProducts = products.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product
        );
        setProducts(updatedProducts);
        setFilteredProducts(updatedProducts);
    };

    const handleDeleteProduct = (product) => {
        setProductToDelete(product);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteProduct = async () => {
        try {
            const response = await fetch(`https://localhost:7107/api/Products/${productToDelete.id}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const updatedProducts = products.filter((product) => product.id !== productToDelete.id);
                setProducts(updatedProducts);
                setFilteredProducts(updatedProducts);
                setIsDeleteDialogOpen(false);
                setProductToDelete(null);
            } else {
                console.error('Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Calculate the products to display on the current page
    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

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
                <button className='text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400' onClick={() => setIsDrawerOpen(true)}>
                    Thêm Sản Phẩm
                </button>
                <button className='text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400' onClick={() => setIsCategoryBrandDrawerOpen(true)}>
                    Thêm Danh Mục
                </button>
                <button className='text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400' onClick={() => setIsBrandDrawerOpen(true)}>
                    Thêm Thương hiệu
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
                                Brand
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Danh mục
                            </th>
                            <th className='px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider'>
                                Giá
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
                        {currentProducts.map((product) => (
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
                                    {product.brand ? product.brand.name : "Không có thương hiệu"
                                    }
                                </td>

                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {product.category ? product.category.name : 'Chưa có danh mục'}
                                </td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {product.variants ? product.price: 'Chưa có mặt hàng này'}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    {product.variants ? product.variants.color: "Chưa có màu"}</td>
                                <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-300'>
                                    <button className='text-indigo-400 hover:text-indigo-300 mr-2' onClick={() => handleEditProduct(product)}>
                                        <Edit size={18} />
                                    </button>
                                    <button className='text-red-400 hover:text-red-300' onClick={() => handleDeleteProduct(product)}>
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Pagination
                count={Math.ceil(filteredProducts.length / productsPerPage)}
                page={page}
                onChange={handlePageChange}
                color='primary'
                className='mt-4 flex justify-center'
            />

            <ProductDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} onAddProduct={handleAddProduct} />
            <EditProductDrawer
                isOpen={isEditDrawerOpen}
                onClose={() => setIsEditDrawerOpen(false)}
                product={selectedProduct}
                onUpdateProduct={handleUpdateProduct}
            />

            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">{"Xác nhận xóa sản phẩm"}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsDeleteDialogOpen(false)} color="primary">
                        Hủy
                    </Button>
                    <Button onClick={confirmDeleteProduct} color="primary" autoFocus>
                        Xóa
                    </Button>
                </DialogActions>
            </Dialog>

            <CategoryBrandDrawer open={isCategoryBrandDrawerOpen} onClose={() => setIsCategoryBrandDrawerOpen(false)} />
            <BrandDrawer open={isBrandDrawerOpen} onClose={() => setIsBrandDrawerOpen(false)} />
        </motion.div>
    );
};

export default ProductsTable;
