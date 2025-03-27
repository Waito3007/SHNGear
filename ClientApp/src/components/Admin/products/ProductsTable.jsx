import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { Edit, Search, Trash2, Settings, Filter, X } from "lucide-react"; // Thêm Settings icon
import { useState, useEffect } from "react";
import ProductDrawer from "./AddProductDrawer";
import EditProductDrawer from "./EditProductDrawer";
import AddSpecificationDrawer from "./AddSpecificationDrawer"; // Thêm Drawer mới
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import CategoryBrandDrawer from "./CategoryBrandDrawer";
import BrandDrawer from "./BrandDrawer";
import Pagination from "@mui/material/Pagination";
import VoucherDrawer from "./VoucherDrawer"; // Thêm VoucherDrawer
import { Category } from "@mui/icons-material";

const ProductsTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [brands, setBrands] = useState([]); // Thêm state cho brands
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isCategoryBrandDrawerOpen, setIsCategoryBrandDrawerOpen] = useState(false);
    const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
    const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false); // Thêm state cho VoucherDrawer
    const [page, setPage] = useState(1);
    const productsPerPage = 11;


    // Thêm các state mới cho bộ lọc
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        brandId: '',
        categoryId: '',
        minPrice: '',
        maxPrice: ''
    });


    // Logic gọi API đã chỉnh sửa
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                    fetch("https://localhost:7107/api/Products"),
                    fetch("https://localhost:7107/api/brands"),
                    fetch("https://localhost:7107/api/categories")
                ]);

                const productsData = await productsRes.json();
                const brandsData = await brandsRes.json();
                const categoriesData = await categoriesRes.json();

                setProducts(productsData);
                setFilteredProducts(productsData);
                setBrands(brandsData.$values || brandsData || []);
                setCategories(categoriesData.$values || categoriesData || []);
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Lỗi khi tải dữ liệu");
            }
        };

        fetchData();
    }, []);
    

    // Hàm áp dụng bộ lọc
    const applyFilters = () => {
        let filtered = [...products];
        
        // Lọc theo brand
        if (filters.brandId) {
            filtered = filtered.filter(product => product.brandId == filters.brandId);
        }
        
        // Lọc theo category
        if (filters.categoryId) {
            filtered = filtered.filter(product => product.categoryId == filters.categoryId);
        }
        
        // Lọc theo giá
        if (filters.minPrice) {
            filtered = filtered.filter(product => 
                product.variants?.[0]?.price >= Number(filters.minPrice)
            );
        }
        
        if (filters.maxPrice) {
            filtered = filtered.filter(product => 
                product.variants?.[0]?.price <= Number(filters.maxPrice)
            );
        }
        
        setFilteredProducts(filtered);
        setPage(1); // Reset về trang đầu tiên khi lọc
        setIsFilterOpen(false);
    };

    // Hàm reset bộ lọc
    const resetFilters = () => {
        setFilters({
            brandId: '',
            categoryId: '',
            minPrice: '',
            maxPrice: ''
        });
        setFilteredProducts(products);
        setPage(1);
    };

   const handleSearch = async (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setPage(1); // Reset về trang đầu tiên khi tìm kiếm

    if (term.trim() === "") {
        setFilteredProducts(products); // Hiển thị lại danh sách gốc thay vì xóa hết
        return;
    }

    try {
        const response = await fetch(`https://localhost:7107/api/Products/search?keyword=${encodeURIComponent(term)}`);
        if (!response.ok) throw new Error("Không tìm thấy sản phẩm nào.");
        
        const data = await response.json();
        setFilteredProducts(data);
    } catch (error) {
        console.error("Lỗi khi tìm kiếm sản phẩm:", error);
        setFilteredProducts([]); // Nếu lỗi, hiển thị danh sách trống
    }
};


    const getBrandName = (brandId) => {
    const brand = brands.find((b) => b.id === brandId);
    return brand ? brand.name : "Không xác định";
};

    const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Không xác định";
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
    if (!productToDelete) return;
    setIsLoading(true);
    try {
        const response = await fetch(`https://localhost:7107/api/Products/${productToDelete.id}`, {
            method: "DELETE",
        });

        if (response.ok) {
            const updatedProducts = products.filter((p) => p.id !== productToDelete.id);
            setProducts(updatedProducts);
            setFilteredProducts(updatedProducts); // Cập nhật luôn danh sách tìm kiếm
            toast.success("Sản phẩm đã được xóa thành công!");
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        } else {
            const errorMessage = await response.text();
            toast.error(`Lỗi: ${errorMessage || "Không thể xóa sản phẩm"}`);
        }
    } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm, vui lòng thử lại!");
        console.error("Error deleting product:", error);
    } finally {
        setIsLoading(false);
    }
};


    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = filteredProducts.slice(
        indexOfFirstProduct,
        indexOfLastProduct
    );

    return (
        <motion.div
            className="bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-100">
                    Danh sách sản phẩm
                </h2>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        className="bg-gray-700 text-white placeholder-gray-400 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onChange={handleSearch}
                        value={searchTerm}
                    />
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                </div>
                <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                    onClick={() => setIsDrawerOpen(true)}
                >
                    Thêm Sản Phẩm
                </button>
                <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                    onClick={() => setIsCategoryBrandDrawerOpen(true)}
                >
                    Danh Mục
                </button>
                <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                    onClick={() => setIsBrandDrawerOpen(true)}
                >
                    Thương hiệu
                </button>
                <button
                    className="text-indigo-400 hover:text-indigo-300 mr-2 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                    onClick={() => setIsVoucherDrawerOpen(true)} // Thêm nút mở VoucherDrawer
                >
                    Voucher
                </button>
                
            </div>
            {/* Thêm nút mở bộ lọc */}
            <div className="flex justify-between items-center mb-4">
                <button 
                    className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                    {isFilterOpen ? <X size={18} /> : <Filter size={18} />}
                    {isFilterOpen ? 'Đóng lọc' : 'Lọc sản phẩm'}
                </button>
                
                {/* Hiển thị số sản phẩm đang hiển thị */}
                <span className="text-gray-400 text-sm">
                    Hiển thị {filteredProducts.length} sản phẩm
                </span>
            </div>

            {/* Panel bộ lọc */}
            {isFilterOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-gray-700 p-4 rounded-lg mb-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Lọc theo brand */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1 whitespace-nowrap">Thương hiệu</label>
                            <select
                                className="w-full bg-gray-800 text-white rounded p-2"
                                value={filters.brandId}
                                onChange={(e) => setFilters({...filters, brandId: e.target.value})}
                            >
                                <option value="">Tất cả thương hiệu</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Lọc theo category */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1 whitespace-nowrap">Danh mục</label>
                            <select
                                className="w-full bg-gray-800 text-white rounded p-2"
                                value={filters.categoryId}
                                onChange={(e) => setFilters({...filters, categoryId: e.target.value})}
                            >
                                <option value="">Tất cả danh mục</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Lọc theo giá tối thiểu */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1 whitespace-nowrap">Giá từ (VND)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-800 text-white rounded p-2"
                                placeholder="Tối thiểu"
                                value={filters.minPrice}
                                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                            />
                        </div>
                        
                        {/* Lọc theo giá tối đa */}
                        <div>
                            <label className="block text-gray-400 text-sm mb-1 whitespace-nowrap">Đến (VND)</label>
                            <input
                                type="number"
                                className="w-full bg-gray-800 text-white rounded p-2"
                                placeholder="Tối đa"
                                value={filters.maxPrice}
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                            />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-4">
                        <button 
                            className="text-gray-300 hover:text-white text-sm rounded-lg px-3 py-1 border border-gray-500"
                            onClick={resetFilters}
                        >
                            Xóa lọc
                        </button>
                        <button 
                            className="text-indigo-400 hover:text-indigo-300 text-sm rounded-lg px-3 py-1 border border-indigo-400"
                            onClick={applyFilters}
                        >
                            Áp dụng
                        </button>
                    </div>
                </motion.div>
            )}
            
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Tên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Brand
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Danh mục
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Giá
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Bán
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Hành động
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-700">
                        {currentProducts.map((product) => (
                            <motion.tr
                                key={product.id} // Giả sử id vẫn được trả về từ API
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100 flex gap-2 items-center">
                                <img
                                src={
                                    product.images?.[0]?.imageUrl?.startsWith("http")
                                        ? product.images[0].imageUrl // Ảnh từ API (URL đầy đủ)
                                        : `https://localhost:7107/${product.images?.[0]?.imageUrl}` // Ảnh local trong wwwroot
                                }
                                alt="Product img"
                                className="size-10 rounded-full"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/50"; }}
                            />


                                {product.name || "Không có tên"}
                            </td>

                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {getBrandName(product.brandId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {/* Tương tự với CategoryId */}
                                    {getCategoryName(product.categoryId)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {product.variants?.[0]?.price
                                        ? `${product.variants[0].price.toLocaleString()} VND`
                                        : "Chưa có giá"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {product.variants?.[0]?.discountPrice
                                        ? `${product.variants[0].discountPrice.toLocaleString()} VND`
                                        : "Không có giá giảm"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    <button
                                        className="text-indigo-400 hover:text-indigo-300 mr-2"
                                        onClick={() => handleEditProduct(product)}
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="text-red-400 hover:text-red-300"
                                        onClick={() => handleDeleteProduct(product)}
                                    >
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
                color="primary"
                className="mt-4 flex justify-center"
            />
            <ProductDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                onAddProduct={handleAddProduct}
            />
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
                <DialogTitle id="alert-dialog-title">
                    {"Xác nhận xóa sản phẩm"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không
                        thể hoàn tác.
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

            <CategoryBrandDrawer
                open={isCategoryBrandDrawerOpen}
                onClose={() => setIsCategoryBrandDrawerOpen(false)}
            />
            <BrandDrawer
                open={isBrandDrawerOpen}
                onClose={() => setIsBrandDrawerOpen(false)}
            />
            <VoucherDrawer
                open={isVoucherDrawerOpen}
                onClose={() => setIsVoucherDrawerOpen(false)}
            />
        </motion.div>
    );
};

export default ProductsTable;