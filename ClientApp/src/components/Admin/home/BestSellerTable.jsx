import { motion } from "framer-motion";
import { toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import CSS cho react-toastify
import { Search, Filter, X, Loader } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import Button from "@mui/material/Button"; // MUI Button
import MuiPagination from "@mui/material/Pagination"; // Đổi tên để tránh trùng lặp nếu có
import { Select, MenuItem, TextField as MuiTextField, InputLabel, FormControl,Grid, Box } from "@mui/material"; // Thêm các component MUI cần thiết
import useDebounce from "utils/useDebounce"; // Import hook debounce
import PushPin from "@mui/icons-material/PushPin";

const BestSellerTable = () => {
    const [masterProducts, setMasterProducts] = useState([]); // Đổi tên từ products để rõ ràng hơn
    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Dùng cho các thao tác loading cụ thể (vd: delete)
    const [isFetchingInitialData, setIsFetchingInitialData] = useState(true); // Dùng cho loading ban đầu

    const [searchInput, setSearchInput] = useState(""); // Input tìm kiếm tức thời
    const debouncedSearchTerm = useDebounce(searchInput, 500); // Debounce giá trị tìm kiếm

    const [filteredProducts, setFilteredProducts] = useState([]); // Danh sách sản phẩm sau khi tìm kiếm hoặc lọc

    const [page, setPage] = useState(1);
    const productsPerPage = 5;

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
                 if (filters.brandId || filters.categoryId || filters.minPrice || filters.maxPrice) {
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


    const handleTogglePin = async (productId, currentPinnedState) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}/pin`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ isPinned: !currentPinnedState }),
        });

        if (!response.ok) {
            throw new Error("Cập nhật trạng thái ghim thất bại");
        }

        // Cập nhật cả masterProducts và filteredProducts mà không reset trang
        setMasterProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isPinned: !currentPinnedState } : p
            )
        );

        setFilteredProducts(prev =>
            prev.map(p =>
                p.id === productId ? { ...p, isPinned: !currentPinnedState } : p
            )
        );

        toast.success(currentPinnedState ? "Đã bỏ ghim sản phẩm!" : "Đã ghim sản phẩm!");
    } catch (error) {
        toast.error("Có lỗi xảy ra khi ghim sản phẩm");
        console.error(error);
    }};

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

    const handlePageChange = useCallback((event, value)  => {
        setPage(value);
    }, []);

    // Pagination logic
    const currentProducts = useMemo(() => {
        const indexOfLastProduct = page * productsPerPage;
        const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
        return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    }, [filteredProducts, page, productsPerPage]);

    const totalPages = useMemo(() => Math.ceil(filteredProducts.length / productsPerPage), [filteredProducts.length, productsPerPage]);


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
                                    <button onClick={() => handleTogglePin(product.id, product.isPinned)} 
                                        className={`p-1.5 rounded-full ${ product.isPinned ? 'text-yellow-400 hover:text-yellow-300' : 'text-gray-400 hover:text-white' } hover:bg-gray-600/50`} 
                                        title={product.isPinned ? 'Bỏ ghim sản phẩm' : 'Ghim sản phẩm'}
                                        >
                                        {product.isPinned ? (
                                            <PushPin size={18} className="text-yellow-400" />
                                            ) : (
                                            <PushPin size={18} className="rotate-45 text-gray-400" />
                                            )}
                                    </button>
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
        </motion.div>
    );
};

export default BestSellerTable;