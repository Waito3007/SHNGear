import { motion } from "framer-motion";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho react-toastify
import { Edit, Search, Trash2, Settings, Filter, X, CirclePlus, ChartColumnStacked, Loader,Notebook    } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import ProductDrawer from "./AddProductDrawer";
import EditProductDrawer from "./EditProductDrawer";
import AddSpecificationDrawer from "./AddSpecificationDrawer";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button"; // MUI Button
import MuiPagination from "@mui/material/Pagination"; // Đổi tên để tránh trùng lặp nếu có
import { Select, MenuItem, TextField as MuiTextField, InputLabel, FormControl,Grid, Box, Typography } from "@mui/material"; // Thêm các component MUI cần thiết

import CategoryBrandDrawer from "./CategoryBrandDrawer";
import BrandDrawer from "./BrandDrawer";
import VoucherDrawer from "./VoucherDrawer";
import useDebounce from "utils/useDebounce"; // Import hook debounce

const ProductsTable = () => {
    const [masterProducts, setMasterProducts] = useState([]); // Đổi tên từ products để rõ ràng hơn
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Dùng cho các thao tác loading cụ thể (vd: delete)
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(true); // Dùng cho loading ban đầu

    const [searchInput, setSearchInput] = useState(""); // Input tìm kiếm tức thời
    const debouncedSearchTerm = useDebounce(searchInput, 500); // Debounce giá trị tìm kiếm

    const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi tìm kiếm hoặc lọc
    
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [productToDelete, setProductToDelete] = useState(null);
    const [isCategoryBrandDrawerOpen, setIsCategoryBrandDrawerOpen] = useState(false);
    const [isBrandDrawerOpen, setIsBrandDrawerOpen] = useState(false);
    const [isVoucherDrawerOpen, setIsVoucherDrawerOpen] = useState(false);
    const [isSpecDrawerOpen, setIsSpecDrawerOpen] = useState(false);
    const [selectedProductForSpec, setSelectedProductForSpec] = useState(null);

    const [page, setPage] = useState(1);
    const productsPerPage = 11;

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        brandId: '',
        categoryId: '',
        minPrice: '',
        maxPrice: ''
    });

    // Fetch dữ liệu ban đầu
    useEffect(() => {
        const fetchData = async () => {
            setIsFetchingInitialData(true);
            try {
                const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
                    fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
                ]);

                if (!productsRes.ok || !brandsRes.ok || !categoriesRes.ok) {
                    throw new Error('Network response was not ok for one or more resources.');
                }

                const productsData = await productsRes.json();
                const brandsData = await brandsRes.json();
                const categoriesData = await categoriesRes.json();

                setMasterProducts(productsData);
                setFilteredProducts(productsData); // Ban đầu hiển thị tất cả sản phẩm
                setBrands(brandsData.$values || brandsData || []);
                setCategories(categoriesData.$values || categoriesData || []);
            } catch (error) {
                console.error("Fetch error:", error);
                toast.error("Lỗi khi tải dữ liệu ban đầu: " + error.message);
            } finally {
                setIsFetchingInitialData(false);
            }
        };
        fetchData();
    }, []);

    // Memoize maps để tra cứu nhanh
    const brandMap = useMemo(() => {
        const map = new Map();
        brands.forEach(brand => map.set(brand.id, brand.name));
        return map;
    }, [brands]);

    const categoryMap = useMemo(() => {
        const map = new Map();
        categories.forEach(category => map.set(category.id, category.name));
        return map;
    }, [categories]);

    const getBrandName = useCallback((brandId) => brandMap.get(brandId) || "Không rõ", [brandMap]);
    const getCategoryName = useCallback((categoryId) => categoryMap.get(categoryId) || "Không rõ", [categoryMap]);

    // Tìm kiếm sản phẩm (API call) - sử dụng debouncedSearchTerm
    useEffect(() => {
        const searchProducts = async () => {
            if (debouncedSearchTerm.trim() === "") {
                // Nếu không có search term, và không có filter nào đang active (hoặc logic reset filter đã chạy)
                // thì nên hiển thị lại danh sách dựa trên filter hiện tại hoặc danh sách gốc
                // Tạm thời, nếu search trống, apply lại filter trên master list.
                // Hoặc, nếu muốn search ghi đè filter, thì phải có logic kết hợp.
                // Giữ logic hiện tại: search trống -> về danh sách đã filter client-side (nếu có) hoặc master list.
                // Để đơn giản, nếu search trống, và filter cũng trống, thì về master list.
                // Nếu search trống, nhưng filter có, thì applyFilter sẽ chạy (nếu có nút Apply)
                // Trong logic này, search trống thì quay về danh sách gốc (masterProducts) và filter sẽ được apply sau nếu người dùng nhấn nút.
                // Hoặc, filteredProducts sẽ tự cập nhật nếu nó là useMemo.
                // Vì filteredProducts là state, khi search trống, ta nên đặt lại filteredProducts dựa trên masterProducts và filters hiện tại.
                // Cách đơn giản nhất là khi search trống, reset filteredProducts về masterProducts, và user phải tự apply filter lại.
                 if (filters.brandId || filters.categoryId || filters.minPrice || filters.maxPrice) {
                    // Nếu có filter đang active, giữ nguyên filteredProducts (user có thể đang muốn search trong list đã filter)
                    // HOẶC: chạy lại applyFilters trên masterProducts nếu muốn search trống là reset về filter trên toàn bộ.
                    // Hiện tại, handleSearch là API call, nên khi search trống, nó sẽ setFilteredProducts = masterProducts.
                    // Điều này có nghĩa là search sẽ xóa hiệu lực của client filter.
                    // => Cần điều chỉnh:
                    // 1. Search API -> results. Set filteredProducts = results.
                    // 2. Client filters -> operate on masterProducts. Set filteredProducts = filter_results.
                    // Đây là 2 luồng riêng biệt cập nhật filteredProducts.
                    // => Nếu search trống, set filteredProducts về masterProducts (để filter có thể áp dụng lại trên masterProducts).
                    setFilteredProducts(masterProducts);
                } else {
                    setFilteredProducts(masterProducts);
                }
                setPage(1);
                return;
            }

            setIsLoading(true); // Loading cho tìm kiếm
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/search?keyword=${encodeURIComponent(debouncedSearchTerm)}`);
                if (!response.ok) {
                    const errorData = await response.text(); // Hoặc .json() nếu API trả về JSON error
                    throw new Error(errorData || "Không tìm thấy sản phẩm nào khớp.");
                }
                const data = await response.json();
                setFilteredProducts(data);
                setPage(1);
            } catch (error) {
                console.error("Lỗi khi tìm kiếm sản phẩm:", error);
                toast.error(error.message || "Lỗi tìm kiếm.");
                setFilteredProducts([]); // Hiển thị danh sách trống nếu lỗi
            } finally {
                setIsLoading(false);
            }
        };

        // Chỉ chạy search nếu debouncedSearchTerm không phải là giá trị ban đầu (tránh chạy khi mount)
        // hoặc khi nó thực sự thay đổi.
        if (debouncedSearchTerm !== undefined) { // Kiểm tra kỹ hơn, có thể không cần nếu initial là ""
             searchProducts();
        }

    }, [debouncedSearchTerm, masterProducts]); // Thêm masterProducts để khi search trống, nó biết lấy từ đâu

    const handleSearchInputChange = useCallback((e) => {
        setSearchInput(e.target.value);
    }, []);


    // Hàm áp dụng bộ lọc (client-side, hoạt động trên masterProducts)
    const applyClientFilters = useCallback(() => {
        setIsLoading(true); // Báo hiệu loading khi áp dụng filter
        let filtered = [...masterProducts]; // Luôn lọc từ danh sách gốc
        
        if (filters.brandId) {
            filtered = filtered.filter(product => product.brandId == filters.brandId);
        }
        if (filters.categoryId) {
            filtered = filtered.filter(product => product.categoryId == filters.categoryId);
        }
        if (filters.minPrice) {
            filtered = filtered.filter(product => product.variants?.[0]?.price >= Number(filters.minPrice));
        }
        if (filters.maxPrice) {
            filtered = filtered.filter(product => product.variants?.[0]?.price <= Number(filters.maxPrice));
        }
        
        // Nếu có search term đang active, có thể muốn kết hợp kết quả search và filter.
        // Tuy nhiên, theo logic hiện tại, search và filter đang ghi đè `filteredProducts`.
        // Để đơn giản và giữ logic cũ: Apply filter luôn dựa trên `masterProducts`.
        // Nếu muốn filter trên kết quả search, `sourceForFilter` phải là kết quả search.
        // => Giả định: Khi apply filter client, nó sẽ ghi đè kết quả search. Nếu muốn search lại, user phải search.
        setSearchInput(""); // Xóa search term khi apply filter client-side để tránh nhầm lẫn
        setFilteredProducts(filtered);
        setPage(1);
        setIsFilterOpen(false); // Đóng panel filter
        setIsLoading(false);
        toast.success("Đã áp dụng bộ lọc!");
    }, [masterProducts, filters]);

    // Hàm reset bộ lọc
    const resetClientFilters = useCallback(() => {
        setFilters({ brandId: '', categoryId: '', minPrice: '', maxPrice: '' });
        // Nếu có search term đang active, reset filter sẽ quay về kết quả search đó
        // Hoặc, reset filter sẽ xóa cả search term. Chọn cách thứ 2 cho đơn giản.
        if (searchInput) {
            // Nếu đang có search, việc reset filter nên trả về masterProducts và xóa search
            setSearchInput(""); // Điều này sẽ trigger useEffect của debouncedSearchTerm và set lại filteredProducts
        } else {
            setFilteredProducts(masterProducts); // Nếu không search, về master list
        }
        setPage(1);
        toast.info("Đã xóa bộ lọc.");
    }, [masterProducts, searchInput]);

    const handleFilterChange = useCallback((e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    }, []);


    // CRUD operations
    const handleAddProduct = useCallback((newProduct) => {
        const newMasterProducts = [newProduct, ...masterProducts];
        setMasterProducts(newMasterProducts);
        // Sau khi thêm, nên reset các filter và search để user thấy sản phẩm mới
        // Hoặc chỉ cập nhật filteredProducts nếu sản phẩm mới khớp filter hiện tại
        // Đơn giản nhất: reset về master list đã cập nhật, user tự filter/search lại
        setSearchInput("");
        setFilters({ brandId: '', categoryId: '', minPrice: '', maxPrice: '' });
        setFilteredProducts(newMasterProducts); 
        setPage(1);
    }, [masterProducts]);

    const handleUpdateProduct = useCallback((updatedProduct) => {
        const updatedMasterProducts = masterProducts.map((product) =>
            product.id === updatedProduct.id ? { ...product, ...updatedProduct } : product
        );
        setMasterProducts(updatedMasterProducts);

        // Cập nhật filteredProducts nếu item đó đang hiển thị
        setFilteredProducts(prevFiltered => 
            prevFiltered.map(p => p.id === updatedProduct.id ? {...p, ...updatedProduct} : p)
        );
        // Không reset page ở đây để user thấy item vừa sửa
    }, [masterProducts]);

    const confirmDeleteProduct = useCallback(async () => {
        // ... (giữ nguyên logic confirmDeleteProduct, nhưng cập nhật masterProducts)
        if (!productToDelete) return;
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/${productToDelete.id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                const updatedMaster = masterProducts.filter((p) => p.id !== productToDelete.id);
                setMasterProducts(updatedMaster);
                // Nếu sản phẩm bị xóa nằm trong filteredProducts, cũng xóa nó đi
                setFilteredProducts(prevFiltered => prevFiltered.filter(p => p.id !== productToDelete.id));
                toast.success("Sản phẩm đã được xóa thành công!");
            } else {
                // ... xử lý lỗi
            }
        } catch (error) { /* ... */ } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
            setProductToDelete(null);
        }
    }, [productToDelete, masterProducts]);

    const handlePageChange = useCallback((event, value) => setPage(value), []);
    const handleEditProduct = useCallback((product) => { setSelectedProduct(product); setIsEditDrawerOpen(true); }, []);
    const handleDeleteProduct = useCallback((product) => { setProductToDelete(product); setIsDeleteDialogOpen(true); }, []);
    const handleAddSpecification = useCallback((product) => { setSelectedProductForSpec(product); setIsSpecDrawerOpen(true); }, []);


    // Pagination logic
    const currentProducts = useMemo(() => {
        const indexOfLastProduct = page * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }, [filteredProducts, page, productsPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredProducts.length / productsPerPage), [filteredProducts.length, productsPerPage]);

    // Handlers cho các Drawer
    const toggleDrawer = useCallback((setter, value) => setter(value), []);


    if (isFetchingInitialData) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)', color: 'white', flexDirection: 'column' }}>
                <Loader  color="inherit" size={50} />
                <Typography sx={{ mt: 2, fontSize: '1.1rem' }}>Đang tải dữ liệu sản phẩm...</Typography>
            </Box>
        );
    }


    return (
        <motion.div
            className="bg-gray-800 bg-opacity-70 backdrop-blur-xl shadow-2xl rounded-xl p-4 md:p-6 border border-gray-700 min-h-[calc(100vh-120px)] flex flex-col"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
        >
            {/* Header và các nút actions */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-3">
                <h2 className="text-2xl font-bold text-gray-100 tracking-tight">
                    Danh sách sản phẩm
                </h2>
                <div className="flex flex-wrap gap-2">
                    <Button variant="contained" startIcon={<CirclePlus size={18}/>} onClick={() => toggleDrawer(setIsDrawerOpen, true)} sx={{bgcolor: '#2563EB', '&:hover': { bgcolor: '#1D4ED8' }}}>Thêm Sản Phẩm</Button>
                    <Button variant="outlined" startIcon={<ChartColumnStacked  size={18}/>} onClick={() => toggleDrawer(setIsCategoryBrandDrawerOpen, true)} sx={{color: '#A5B4FC', borderColor: '#4F46E5'}}>Danh Mục</Button>
                    <Button variant="outlined" startIcon={<Notebook  size={18}/>} onClick={() => toggleDrawer(setIsBrandDrawerOpen, true)} sx={{color: '#A5B4FC', borderColor: '#4F46E5'}}>Thương hiệu</Button>
                    <Button variant="outlined" startIcon={<Settings size={18}/>} onClick={() => toggleDrawer(setIsVoucherDrawerOpen, true)} sx={{color: '#A5B4FC', borderColor: '#4F46E5'}}>Voucher</Button>
                </div>
            </div>

            {/* Search và nút Filter */}
            <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
                <div className="relative flex-grow max-w-xs">
                    <MuiTextField
                        label="Tìm kiếm sản phẩm"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={searchInput}
                        onChange={handleSearchInputChange}
                        InputProps={{
                            startAdornment: <Search className="text-gray-400 mr-2" size={18} />,
                            sx: { borderRadius: '8px', bgcolor: 'rgba(30,41,59,0.7)', input: { color: 'white' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#4B5563' } }
                        }}
                        InputLabelProps={{sx: {color: '#9CA3AF'}}}
                    />
                </div>
                <Button 
                    variant="outlined"
                    startIcon={isFilterOpen ? <X size={18} /> : <Filter size={18} />}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    sx={{color: '#A5B4FC', borderColor: '#4F46E5'}}
                >
                    {isFilterOpen ? 'Đóng lọc' : 'Lọc sản phẩm'}
                </Button>
            </div>
            
            {/* Panel bộ lọc (nếu isFilterOpen là true) */}
            {isFilterOpen && (
                <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom:0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: '1rem' }}
                    exit={{ opacity: 0, height: 0, marginBottom:0 }}
                    className="bg-gray-700/50 p-4 rounded-lg border border-gray-600"
                >
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth size="small">
                                <InputLabel sx={{color: '#9CA3AF'}}>Thương hiệu</InputLabel>
                                <Select name="brandId" value={filters.brandId} label="Thương hiệu" onChange={handleFilterChange} sx={{color: filters.brandId ? 'white' : '#9CA3AF', bgcolor: 'rgba(30,41,59,0.7)', '.MuiOutlinedInput-notchedOutline': {borderColor: '#4B5563'}}}>
                                    <MenuItem value=""><em>Tất cả thương hiệu</em></MenuItem>
                                    {brands.map(brand => (<MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                             <FormControl fullWidth size="small">
                                <InputLabel sx={{color: '#9CA3AF'}}>Danh mục</InputLabel>
                                <Select name="categoryId" value={filters.categoryId} label="Danh mục" onChange={handleFilterChange} sx={{color: filters.categoryId ? 'white' : '#9CA3AF', bgcolor: 'rgba(30,41,59,0.7)', '.MuiOutlinedInput-notchedOutline': {borderColor: '#4B5563'}}}>
                                    <MenuItem value=""><em>Tất cả danh mục</em></MenuItem>
                                    {categories.map(cat => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <MuiTextField type="number" name="minPrice" label="Giá từ (VND)" value={filters.minPrice} onChange={handleFilterChange} fullWidth size="small" InputLabelProps={{sx:{color:"#9CA3AF"}}} InputProps={{sx:{color:"white", bgcolor: 'rgba(30,41,59,0.7)', '.MuiOutlinedInput-notchedOutline': {borderColor: '#4B5563'}}}} />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.5}>
                            <MuiTextField type="number" name="maxPrice" label="Đến (VND)" value={filters.maxPrice} onChange={handleFilterChange} fullWidth size="small" InputLabelProps={{sx:{color:"#9CA3AF"}}} InputProps={{sx:{color:"white", bgcolor: 'rgba(30,41,59,0.7)', '.MuiOutlinedInput-notchedOutline': {borderColor: '#4B5563'}}}} />
                        </Grid>
                        <Grid item xs={12} md={1} container spacing={1} justifyContent="flex-end">
                           <Button onClick={resetClientFilters} size="small" sx={{color: '#CBD5E1', minWidth: 'auto', padding: '6px'}}>Xóa</Button>
                           <Button onClick={applyClientFilters} variant="contained" size="small" sx={{bgcolor: '#4F46E5', minWidth: 'auto', padding: '6px'}}>Lọc</Button>
                        </Grid>
                    </Grid>
                </motion.div>
            )}
            
            {/* Bảng hiển thị sản phẩm */}
            <div className="overflow-x-auto custom-scrollbar flex-grow rounded-lg border border-gray-700/50">
                <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-700 bg-opacity-40 sticky top-0 z-10 backdrop-blur-sm">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Sản phẩm</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Thương hiệu</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Danh mục</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Giá gốc</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Giá bán</th>
                            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-300 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-600">
                        {isLoading && currentProducts.length === 0 && ( // Hiển thị loading khi đang tìm kiếm và chưa có kết quả nào
                             <tr><td colSpan={6} className="text-center py-10"><Loader  size={30} sx={{color: 'white'}} /></td></tr>
                        )}
                        {!isLoading && currentProducts.length === 0 && !isFetchingInitialData && (
                             <tr><td colSpan={6} className="text-center py-10 text-gray-400 italic">Không tìm thấy sản phẩm nào.</td></tr>
                        )}
                        {currentProducts.map((product) => (
                            <motion.tr
                                key={product.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                className="hover:bg-gray-700/60"
                            >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={product.images?.[0]?.imageUrl?.startsWith("http") ? product.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${product.images?.[0]?.imageUrl}`}
                                            alt={product.name || "product image"}
                                            className="w-12 h-12 rounded-md object-cover border border-gray-600"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/100?text=Error"; }}
                                        />
                                        <span className="truncate max-w-xs" title={product.name}>{product.name || "Chưa có tên"}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getBrandName(product.brandId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getCategoryName(product.categoryId)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                                    {product.variants?.[0]?.price ? `${product.variants[0].price.toLocaleString()} VND` : "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-400 font-semibold">
                                    {product.variants?.[0]?.discountPrice ? `${product.variants[0].discountPrice.toLocaleString()} VND` : (product.variants?.[0]?.price ? `${product.variants[0].price.toLocaleString()} VND` : "N/A")}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 text-center">
                                    <button onClick={() => handleEditProduct(product)} className="text-sky-400 hover:text-sky-300 p-1.5 rounded-full hover:bg-gray-600/50" title="Sửa sản phẩm"><Edit size={18} /></button>
                                    <button onClick={() => handleAddSpecification(product)} className="text-teal-400 hover:text-teal-300 p-1.5 ml-1.5 rounded-full hover:bg-gray-600/50" title="Quản lý thông số"><Settings size={18} /></button>
                                    <button onClick={() => handleDeleteProduct(product)} className="text-rose-400 hover:text-rose-300 p-1.5 ml-1.5 rounded-full hover:bg-gray-600/50" title="Xóa sản phẩm"><Trash2 size={18} /></button>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Phân trang */}
            {totalPages > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2, mt: 'auto', borderTop:'1px solid rgba(75, 85, 99, 0.5)', paddingTop: '1rem' }}>
                    <MuiPagination
                        count={totalPages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        size="small"
                        sx={{ '& .MuiPaginationItem-root': { color: '#9CA3AF', fontWeight:'medium' }, '& .MuiPaginationItem-root.Mui-selected': { backgroundColor: 'rgba(79, 70, 229, 0.9)', color: 'white', '&:hover': { backgroundColor: 'rgba(79, 70, 229, 1)'}}, '& .MuiPaginationItem-ellipsis': { color: '#9CA3AF' }, '& .MuiPaginationItem-icon': {color: '#A5B4FC'} }}
                    />
                </Box>
            )}

            {/* Các Drawers và Dialogs */}
            <ProductDrawer isOpen={isDrawerOpen} onClose={() => toggleDrawer(setIsDrawerOpen, false)} onAddProduct={handleAddProduct} />
            <EditProductDrawer isOpen={isEditDrawerOpen} onClose={() => toggleDrawer(setIsEditDrawerOpen, false)} product={selectedProduct} onUpdateProduct={handleUpdateProduct} />
            <AddSpecificationDrawer open={isSpecDrawerOpen} onClose={() => toggleDrawer(setIsSpecDrawerOpen, false)} product={selectedProductForSpec} />
            <CategoryBrandDrawer open={isCategoryBrandDrawerOpen} onClose={() => toggleDrawer(setIsCategoryBrandDrawerOpen, false)} />
            <BrandDrawer open={isBrandDrawerOpen} onClose={() => toggleDrawer(setIsBrandDrawerOpen, false)} />
            <VoucherDrawer open={isVoucherDrawerOpen} onClose={() => toggleDrawer(setIsVoucherDrawerOpen, false)} />

            <Dialog open={isDeleteDialogOpen} onClose={() => toggleDrawer(setIsDeleteDialogOpen, false)}>
                <DialogTitle sx={{bgcolor: 'rgb(31,41,55)', color: 'white'}}>{"Xác nhận xóa sản phẩm"}</DialogTitle>
                <DialogContent sx={{bgcolor: 'rgb(31,41,55)', color: 'rgb(209,213,219)'}}>
                    <DialogContentText sx={{color: 'rgb(209,213,219)'}}>
                        Bạn có chắc chắn muốn xóa sản phẩm "{productToDelete?.name}" không? Hành động này không thể hoàn tác.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{bgcolor: 'rgb(31,41,55)'}}>
                    <Button onClick={() => toggleDrawer(setIsDeleteDialogOpen, false)} sx={{color: '#A5B4FC'}}>Hủy</Button>
                    <Button onClick={confirmDeleteProduct} sx={{color: '#F87171'}} autoFocus disabled={isLoading}>
                        {isLoading ? <Loader  size={20} color="inherit"/> : "Xóa"}
                    </Button>
                </DialogActions>
            </Dialog>
        </motion.div>
    );
};

export default ProductsTable;