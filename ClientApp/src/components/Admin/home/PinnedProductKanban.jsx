
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Box, Typography, Grid, Card, CardContent, Button } from "@mui/material";
import Header from "@/components/Admin/common/Header";
import PushPin from "@mui/icons-material/PushPin";
import { toast } from "react-toastify";
import MuiPagination from "@mui/material/Pagination";
import { Select, MenuItem, TextField as MuiTextField, InputLabel, FormControl } from "@mui/material";
import { motion } from "framer-motion";
import { Search, Filter, X } from "lucide-react";
import useDebounce from "utils/useDebounce";
const PinnedProductKanban = () => {
  const [products, setProducts] = useState([]);
  const [pinnedProducts, setPinnedProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearchTerm = useDebounce(searchInput, 500);
  const [filters, setFilters] = useState({ brandId: '', categoryId: '', minPrice: '', maxPrice: '' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [pageUnpinned, setPageUnpinned] = useState(1);
  const [pagePinned, setPagePinned] = useState(1);
  const productsPerPage = 5;
  // ...existing code...
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsRes, pinnedRes, brandsRes, categoriesRes] = await Promise.all([
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/pinned`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
          fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
        ]);
        if (!productsRes.ok || !pinnedRes.ok || !brandsRes.ok || !categoriesRes.ok) {
          throw new Error('Network response was not ok for one or more resources.');
        }
        const productsData = await productsRes.json();
        const pinnedData = await pinnedRes.json();
        const brandsData = await brandsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData);
        setPinnedProducts(pinnedData);
        setBrands(brandsData.$values || brandsData || []);
        setCategories(categoriesData.$values || categoriesData || []);
      } catch (error) {
        toast.error("Lỗi khi tải dữ liệu: " + error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

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

  const handleTogglePin = async (productId, currentPinnedState) => {
  
    console.log("[DEBUG] handleTogglePin", { productId, currentPinnedState });
    if (!productId || productId === 0) {
      toast.error("ID sản phẩm không hợp lệ!");
      console.error("[DEBUG] ID sản phẩm không hợp lệ", productId);
      return;
    }
    try {
      const bodyData = { isPinned: !currentPinnedState };
      console.log("[DEBUG] API PUT", `/api/products/${productId}/pin`, bodyData);
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}/pin`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });
      let result = null;
      try {
        result = await response.clone().json();
      } catch (e) {
        result = await response.text();
      }
      console.log("[DEBUG] API response", response.status, result);
      if (!response.ok) {
        toast.error("Cập nhật trạng thái ghim thất bại");
        console.error("[DEBUG] API error", response.status, result);
        return;
      }
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, isPinned: !currentPinnedState } : p));
      // Cập nhật pinnedProducts ngay lập tức ở frontend
      if (currentPinnedState) {
        setPinnedProducts(prev => prev.filter(p => p.id !== productId));
      } else {
        const justPinned = products.find(p => p.id === productId);
        if (justPinned) setPinnedProducts(prev => [...prev, { ...justPinned, isPinned: true }]);
      }
      // Sau đó fetch lại để đồng bộ với backend
      const pinnedRes = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products/pinned`);
      let pinnedResult = null;
      try {
        pinnedResult = await pinnedRes.clone().json();
      } catch (e) {
        pinnedResult = await pinnedRes.text();
      }
      console.log("[DEBUG] Fetch pinned products", pinnedRes.status, pinnedResult);
      if (pinnedRes.ok) {
        setPinnedProducts(pinnedResult);
      }
      toast.success(currentPinnedState ? "Đã bỏ ghim sản phẩm!" : "Đã ghim sản phẩm!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi ghim sản phẩm");
      console.error("[DEBUG] Exception", error);
    }
  };
  // Lọc và tìm kiếm cho cột chưa ghim
  const filteredUnpinnedProducts = useMemo(() => {
    let filtered = products.filter(p => !p.isPinned);
    if (filters.brandId) filtered = filtered.filter(p => p.brandId == filters.brandId);
    if (filters.categoryId) filtered = filtered.filter(p => p.categoryId == filters.categoryId);
    if (filters.minPrice) filtered = filtered.filter(p => p.variants?.[0]?.price >= Number(filters.minPrice));
    if (filters.maxPrice) filtered = filtered.filter(p => p.variants?.[0]?.price <= Number(filters.maxPrice));
    if (debouncedSearchTerm.trim()) {
      filtered = filtered.filter(p => p.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
    }
    return filtered;
  }, [products, filters, debouncedSearchTerm]);
  
  const handleSearchInputChange = useCallback((e) => setSearchInput(e.target.value), []);
  const handleFilterChange = useCallback((e) => {
  const { name, value } = e.target;
  setFilters(prev => ({ ...prev, [name]: value }));
 }, []);
 const resetClientFilters = useCallback(() => {
  setFilters({ brandId: '', categoryId: '', minPrice: '', maxPrice: '' });
  setSearchInput("");
  setPageUnpinned(1);
  toast.info("Đã xóa bộ lọc.");
 }, []);
const handlePageUnpinnedChange = useCallback((event, value) => setPageUnpinned(value), []);
const handlePagePinnedChange = useCallback((event, value) => setPagePinned(value), []);

  const filteredPinnedProducts = useMemo(() => pinnedProducts, [pinnedProducts]);
  // Phân trang
  const totalPagesUnpinned = Math.ceil(filteredUnpinnedProducts.length / productsPerPage);
  const totalPagesPinned = Math.ceil(filteredPinnedProducts.length / productsPerPage);
  const pagedUnpinned = filteredUnpinnedProducts.slice((pageUnpinned - 1) * productsPerPage, pageUnpinned * productsPerPage);
  const pagedPinned = filteredPinnedProducts.slice((pagePinned - 1) * productsPerPage, pagePinned * productsPerPage);

  // Bước 1: Loại bỏ sản phẩm có id = 0 khỏi danh sách đã ghim khi render
  const pagedPinnedValid = pagedPinned.filter(p => p.id && p.id !== 0);
  return (
    <Box sx={{ flexGrow: 1, bgcolor: '#1a202c', minHeight: '100vh', color: '#e2e8f0' }}>
      <Header title="Quản lý sản phẩm ghim" />
      <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4, px: { xs: 2, lg: 6 } }}>
        <Grid container spacing={3}>
          {/* Chưa ghim */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3, bgcolor: '#fff', boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>
                  Chưa ghim
                </Typography>
                {/* Thanh tìm kiếm và lọc */}
                <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <MuiTextField
                    label="Tìm kiếm sản phẩm"
                    variant="outlined"
                    size="small"
                    value={searchInput}
                    onChange={handleSearchInputChange}
                    InputProps={{
                      startAdornment: <Search className="text-gray-400 mr-2" size={18} />,
                      sx: { borderRadius: '8px', bgcolor: '#F3F4F6', input: { color: '#111827' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E5E7EB' } }
                    }}
                    InputLabelProps={{sx: {color: '#6B7280'}}}
                    sx={{ minWidth: 220 }}
                  />
                  <Button 
                    variant="outlined"
                    startIcon={isFilterOpen ? <X size={18} /> : <Filter size={18} />}
                    onClick={() => setIsFilterOpen(!isFilterOpen)}
                    sx={{color: '#2563EB', borderColor: '#2563EB', fontWeight: 600}}
                  >
                    {isFilterOpen ? 'Đóng lọc' : 'Lọc sản phẩm'}
                  </Button>
                </Box>
                {isFilterOpen && (
                  <Box sx={{ background: '#F8FAFC', p: 3, borderRadius: 3, border: '1px solid #E5E7EB', mb: 2, boxShadow: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, alignItems: { xs: 'stretch', sm: 'flex-end' } }}>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 0 }}>
                          <InputLabel sx={{color: '#2563EB', fontWeight: 600}}>Thương hiệu</InputLabel>
                          <Select name="brandId" value={filters.brandId} label="Thương hiệu" onChange={handleFilterChange} sx={{color: filters.brandId ? '#111827' : '#6B7280', bgcolor: '#fff', borderRadius: 2, '.MuiOutlinedInput-notchedOutline': {borderColor: '#E5E7EB'}}}>
                            <MenuItem value=""><em>Tất cả thương hiệu</em></MenuItem>
                            {brands.map(brand => (<MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small" sx={{ bgcolor: '#fff', borderRadius: 2, boxShadow: 0 }}>
                          <InputLabel sx={{color: '#2563EB', fontWeight: 600}}>Danh mục</InputLabel>
                          <Select name="categoryId" value={filters.categoryId} label="Danh mục" onChange={handleFilterChange} sx={{color: filters.categoryId ? '#111827' : '#6B7280', bgcolor: '#fff', borderRadius: 2, '.MuiOutlinedInput-notchedOutline': {borderColor: '#E5E7EB'}}}>
                            <MenuItem value=""><em>Tất cả danh mục</em></MenuItem>
                            {categories.map(cat => (<MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Box>
                      <Button onClick={resetClientFilters} size="medium" variant="outlined" sx={{color: '#ef4444', borderColor: '#ef4444', fontWeight: 700, borderRadius: 2, px: 2, py: 1, boxShadow: 0, minWidth: 120, height: 40}}>Xóa bộ lọc</Button>
                    </Box>
                  </Box>
                )}
                {isLoading ? (
                  <Typography color="text.secondary">Đang tải...</Typography>
                ) : pagedUnpinned.length === 0 ? (
                  <Typography color="text.secondary">Tất cả sản phẩm đều đã ghim.</Typography>
                ) : (
                  pagedUnpinned.map((p, idx) => (
                    <Box key={p.id && p.id !== 0 ? p.id : `unpinned-${idx}`} sx={{ mb: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
                      <img
                        src={p.images?.[0]?.imageUrl?.startsWith('http') ? p.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${p.images?.[0]?.imageUrl}`}
                        alt={p.name || 'product image'}
                        style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid #E5E7EB', background: '#fff' }}
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=Error'; }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600} sx={{ color: '#111827' }}>{p.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>{getBrandName(p.brandId)} | {getCategoryName(p.categoryId)}</Typography>
                        <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 500 }}>
                          {p.variants?.[0]?.discountPrice ? `${p.variants[0].discountPrice.toLocaleString()} VND` : (p.variants?.[0]?.price ? `${p.variants[0].price.toLocaleString()} VND` : 'N/A')}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        sx={{ minWidth: 40, fontWeight: 600, borderRadius: 2, boxShadow: 0 }}
                        onClick={() => handleTogglePin(p.id, false)}
                        startIcon={<PushPin sx={{ transform: 'rotate(45deg)' }} />}
                      >
                        Ghim sản phẩm
                      </Button>
                    </Box>
                  ))
                )}
                {/* Phân trang cho chưa ghim */}
                {totalPagesUnpinned > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <MuiPagination
                      count={totalPagesUnpinned}
                      page={pageUnpinned}
                      onChange={handlePageUnpinnedChange}
                      color="primary"
                      size="medium"
                      sx={{ '& .MuiPaginationItem-root': { color: '#374151' } }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          {/* Đã ghim */}
          <Grid item xs={12} md={6}>
            <Card elevation={2} sx={{ borderRadius: 3, bgcolor: '#fff', boxShadow: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: '#374151' }}>
                  Đã ghim
                </Typography>
                {isLoading ? (
                  <Typography color="text.secondary">Đang tải...</Typography>
                ) : pagedPinnedValid.length === 0 ? (
                  <Typography color="text.secondary">Không có sản phẩm nào đã ghim.</Typography>
                ) : (
                  pagedPinnedValid.map((p, idx) => (
                    <Box key={p.id} sx={{ mb: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 2, boxShadow: 1 }}>
                      <img
                        src={p.images?.[0]?.imageUrl?.startsWith('http') ? p.images[0].imageUrl : `${process.env.REACT_APP_API_BASE_URL}/${p.images?.[0]?.imageUrl}`}
                        alt={p.name || 'product image'}
                        style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', border: '1px solid #E5E7EB', background: '#fff' }}
                        onError={e => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/100?text=Error'; }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography fontWeight={600} sx={{ color: '#111827' }}>{p.name}</Typography>
                        <Typography variant="body2" sx={{ color: '#6B7280' }}>{getBrandName(p.brandId)} | {getCategoryName(p.categoryId)}</Typography>
                        <Typography variant="body2" sx={{ color: '#2563EB', fontWeight: 500 }}>
                          {p.variants?.[0]?.discountPrice ? `${p.variants[0].discountPrice.toLocaleString()} VND` : (p.variants?.[0]?.price ? `${p.variants[0].price.toLocaleString()} VND` : 'N/A')}
                        </Typography>
                      </Box>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        sx={{ minWidth: 40, fontWeight: 600, borderRadius: 2, boxShadow: 0 }}
                        onClick={() => handleTogglePin(p.id, true)}
                        startIcon={<PushPin />}
                      >
                        Bỏ ghim
                      </Button>
                    </Box>
                  ))
                )}
                {/* Phân trang cho đã ghim */}
                {totalPagesPinned > 1 && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <MuiPagination
                      count={totalPagesPinned}
                      page={pagePinned}
                      onChange={handlePagePinnedChange}
                      color="primary"
                      size="medium"
                      sx={{ '& .MuiPaginationItem-root': { color: '#374151' } }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default PinnedProductKanban;
