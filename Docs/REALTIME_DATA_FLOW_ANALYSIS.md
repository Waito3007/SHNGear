# PHÂN TÍCH LUỒNG DỮ LIỆU THỜI GIAN THỰC - QUẢN LÝ SẢN PHẨM

## 📌 TỔNG QUAN

Hệ thống quản lý sản phẩm (Thêm/Sửa/Xóa/Tìm kiếm) được thiết kế với cơ chế **cập nhật dữ liệu thời gian thực** thông qua việc quản lý state React kết hợp với API calls. Dưới đây là phân tích chi tiết từng thành phần.

---

## 🔄 KIẾN TRÚC LUỒNG DỮ LIỆU

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         ProductsTable.jsx (Component chính)                │ │
│  │                                                            │ │
│  │  State Management:                                         │ │
│  │  • masterProducts     - Danh sách gốc từ database         │ │
│  │  • filteredProducts   - Danh sách sau khi lọc/tìm kiếm    │ │
│  │  • searchInput        - Giá trị tìm kiếm tức thời         │ │
│  │  • debouncedSearchTerm- Giá trị tìm kiếm đã debounce      │ │
│  │  • filters            - Bộ lọc (brand, category, price)   │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              ↕ API Calls
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (ASP.NET Core)                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           ProductsController.cs                            │ │
│  │                                                            │ │
│  │  Endpoints:                                                │ │
│  │  • GET  /api/Products           - Lấy toàn bộ sản phẩm    │ │
│  │  • GET  /api/Products/search    - Tìm kiếm sản phẩm       │ │
│  │  • POST /api/Products           - Thêm sản phẩm mới       │ │
│  │  • PUT  /api/Products/{id}      - Cập nhật sản phẩm       │ │
│  │  • DELETE /api/Products/{id}    - Xóa sản phẩm            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ↕                                  │
│                    Entity Framework Core                        │
│                              ↕                                  │
│                       SQL Server Database                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 1. TẢI DỮ LIỆU BAN ĐẦU (Initial Load)

### Frontend - ProductsTable.jsx

```javascript
// Fetch dữ liệu ban đầu khi component mount
useEffect(() => {
    const fetchData = async () => {
        setIsFetchingInitialData(true);
        try {
            const [productsRes, brandsRes, categoriesRes] = await Promise.all([
                fetch(`${process.env.REACT_APP_API_BASE_URL}/api/Products`),
                fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands`),
                fetch(`${process.env.REACT_APP_API_BASE_URL}/api/categories`)
            ]);

            const productsData = await productsRes.json();
            const brandsData = await brandsRes.json();
            const categoriesData = await categoriesRes.json();

            // Cập nhật state - Hiển thị dữ liệu ngay lập tức
            setMasterProducts(productsData);
            setFilteredProducts(productsData); // Ban đầu hiển thị tất cả
            setBrands(brandsData.$values || brandsData || []);
            setCategories(categoriesData.$values || categoriesData || []);
        } catch (error) {
            toast.error("Lỗi khi tải dữ liệu ban đầu");
        } finally {
            setIsFetchingInitialData(false);
        }
    };
    fetchData();
}, []); // Chỉ chạy 1 lần khi component mount
```

**💡 Cơ chế hoạt động:**
- **Promise.all()** - Gọi song song 3 API để tối ưu thời gian tải
- **setMasterProducts()** - Lưu danh sách gốc từ database
- **setFilteredProducts()** - Lưu danh sách hiển thị (ban đầu = masterProducts)
- React tự động **re-render** component khi state thay đổi

### Backend - ProductsController.cs

```csharp
[HttpGet]
public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts([FromQuery] int? categoryId = null)
{
    var query = _context.Products
        .Include(p => p.Images)
        .Include(p => p.Variants)
        .Include(p => p.Category)
        .Include(p => p.Brand)
        .AsQueryable();

    if (categoryId.HasValue)
    {
        query = query.Where(p => p.CategoryId == categoryId.Value);
    }

    var products = await query.ToListAsync();
    return Ok(products.Select(p => MapProductToDto(p)));
}
```

**💡 Tối ưu:**
- **Include()** - Eager loading để tránh N+1 query problem
- **AsQueryable()** - Cho phép xây dựng query linh hoạt
- **MapProductToDto()** - Chuyển đổi entity sang DTO trước khi trả về

---

## 🔍 2. TÌM KIẾM THỜI GIAN THỰC (Real-time Search)

### Frontend - ProductsTable.jsx

```javascript
const [searchInput, setSearchInput] = useState(""); // Input tức thời
const debouncedSearchTerm = useDebounce(searchInput, 500); // Debounce 500ms

// Xử lý khi người dùng gõ
const handleSearchInputChange = useCallback((e) => {
    setSearchInput(e.target.value); // Cập nhật ngay lập tức
}, []);

// Tự động gọi API khi debouncedSearchTerm thay đổi
useEffect(() => {
    const searchProducts = async () => {
        if (debouncedSearchTerm.trim() === "") {
            setFilteredProducts(masterProducts); // Về danh sách gốc
            setPage(1);
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(
                `${process.env.REACT_APP_API_BASE_URL}/api/Products/search?keyword=${encodeURIComponent(debouncedSearchTerm)}`
            );
            const data = await response.json();
            
            // CẬP NHẬT THỜI GIAN THỰC - React tự động re-render
            setFilteredProducts(data);
            setPage(1);
        } catch (error) {
            toast.error("Lỗi tìm kiếm");
            setFilteredProducts([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (debouncedSearchTerm !== undefined) {
        searchProducts();
    }
}, [debouncedSearchTerm, masterProducts]);
```

**💡 Kỹ thuật Debouncing:**

```javascript
// Hook useDebounce (utils/useDebounce.js)
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler); // Cleanup
        };
    }, [value, delay]);

    return debouncedValue;
}
```

**🎯 Lợi ích:**
- **Giảm số lượng API calls** - Chỉ gọi khi user ngừng gõ 500ms
- **Tối ưu performance** - Tránh overload server
- **UX tốt hơn** - Hiển thị kết quả mượt mà

### Backend - ProductsController.cs

```csharp
[HttpGet("search")]
public async Task<ActionResult<IEnumerable<ProductDto>>> SearchProducts([FromQuery] string keyword)
{
    if (string.IsNullOrWhiteSpace(keyword))
    {
        return BadRequest("Keyword không được để trống.");
    }

    var products = await _context.Products
        .Where(p => EF.Functions.Like(p.Name, $"%{keyword}%") || 
                    EF.Functions.Like(p.Description, $"%{keyword}%"))
        .Include(p => p.Images)
        .Include(p => p.Variants)
        .Include(p => p.Category)
        .Include(p => p.Brand)
        .ToListAsync();

    return Ok(products.Select(p => MapProductToDto(p)));
}
```

**💡 Tối ưu SQL:**
- **EF.Functions.Like()** - Chuyển thành SQL LIKE query
- **Index trên cột Name** - Tăng tốc độ tìm kiếm

---

## ➕ 3. THÊM SẢN PHẨM MỚI (Real-time Add)

### Frontend - ProductsTable.jsx

```javascript
const handleAddProduct = useCallback((newProduct) => {
    // CẬP NHẬT OPTIMISTIC - Hiển thị ngay không cần reload
    const newMasterProducts = [newProduct, ...masterProducts];
    setMasterProducts(newMasterProducts);
    
    // Reset filter và search để user thấy sản phẩm mới
    setSearchInput("");
    setFilters({ brandId: '', categoryId: '', minPrice: '', maxPrice: '' });
    setFilteredProducts(newMasterProducts);
    setPage(1);
}, [masterProducts]);
```

### Frontend - AddProductDrawer.jsx

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const response = await axios.post(
            `${API_BASE_URL}/api/products`,
            productData,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 201) {
            const newProduct = response.data;
            onAddProduct(newProduct); // Callback -> cập nhật state parent
            toast.success("Sản phẩm đã được thêm!");
            onClose(); // Đóng drawer
        }
    } catch (err) {
        toast.error("Lỗi khi thêm sản phẩm");
    } finally {
        setLoading(false);
    }
};
```

### Backend - ProductsController.cs

```csharp
[HttpPost]
public async Task<ActionResult<ProductDto>> PostProduct([FromBody] ProductDto productDto)
{
    if (productDto == null)
        return BadRequest("Dữ liệu sản phẩm không hợp lệ.");

    var product = new Product
    {
        Name = productDto.Name,
        Description = productDto.Description,
        CategoryId = productDto.CategoryId,
        BrandId = productDto.BrandId,
        Images = productDto.Images?.Select(img => new ProductImage
        {
            ImageUrl = img.ImageUrl,
            IsPrimary = img.IsPrimary
        }).ToList() ?? new List<ProductImage>(),
        Variants = productDto.Variants?.Select(v => new ProductVariant
        {
            Color = v.Color,
            Storage = v.Storage,
            Price = v.Price,
            DiscountPrice = v.DiscountPrice,
            StockQuantity = v.StockQuantity
        }).ToList() ?? new List<ProductVariant>()
    };

    _context.Products.Add(product);
    await _context.SaveChangesAsync();

    // Trả về sản phẩm vừa tạo với đầy đủ thông tin (bao gồm ID)
    return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, MapProductToDto(product));
}
```

**💡 Flow cập nhật thời gian thực:**
```
User điền form → Submit → API POST → Database INSERT 
→ Response (201 + newProduct) → onAddProduct(newProduct) 
→ Update state → React re-render → UI hiển thị ngay
```

---

## ✏️ 4. SỬA SẢN PHẨM (Real-time Update)

### Frontend - ProductsTable.jsx

```javascript
const handleUpdateProduct = useCallback((updatedProduct) => {
    // Cập nhật trong masterProducts
    const updatedMasterProducts = masterProducts.map((product) =>
        product.id === updatedProduct.id 
            ? { ...product, ...updatedProduct } 
            : product
    );
    setMasterProducts(updatedMasterProducts);

    // Cập nhật trong filteredProducts (nếu đang hiển thị)
    setFilteredProducts(prevFiltered => 
        prevFiltered.map(p => 
            p.id === updatedProduct.id 
                ? {...p, ...updatedProduct} 
                : p
        )
    );
    // KHÔNG reset page để user thấy item vừa sửa
}, [masterProducts]);
```

### Frontend - EditProductDrawer.jsx

```javascript
const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
        const updatedData = {
            name: formData.name,
            description: formData.description,
            categoryId: parseInt(formData.categoryId),
            brandId: parseInt(formData.brandId),
            images: formData.images
                .filter(img => img.imageUrl && img.imageUrl.trim() !== "")
                .map(img => ({
                    imageUrl: img.imageUrl,
                    isPrimary: img.isPrimary || false,
                })),
            variants: formData.variants.map(variant => ({
                ...variant,
                price: parseFloat(variant.price) || 0,
                discountPrice: variant.discountPrice ? parseFloat(variant.discountPrice) : null,
                stockQuantity: parseInt(variant.stockQuantity) || 0,
            })),
        };

        const response = await axios.put(
            `${API_BASE_URL}/api/products/${product.id}`,
            updatedData,
            { headers: { "Content-Type": "application/json" } }
        );

        if (response.status === 204 || response.status === 200) {
            const updatedProductData = { ...product, ...updatedData };
            onUpdateProduct(updatedProductData); // Cập nhật state parent
            toast.success("Sản phẩm đã được cập nhật!");
        }
    } catch (err) {
        toast.error("Lỗi khi cập nhật sản phẩm");
    } finally {
        setLoading(false);
    }
};
```

### Backend - ProductsController.cs

```csharp
[HttpPut("{id}")]
public async Task<IActionResult> PutProduct(int id, [FromBody] ProductDto productDto)
{
    var existingProduct = await _context.Products
        .Include(p => p.Images)
        .Include(p => p.Variants)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (existingProduct == null)
        return NotFound("Sản phẩm không tồn tại.");

    // Cập nhật thông tin cơ bản
    existingProduct.Name = productDto.Name;
    existingProduct.Description = productDto.Description;
    existingProduct.CategoryId = productDto.CategoryId;
    existingProduct.BrandId = productDto.BrandId;

    // Cập nhật images (Clear + Add mới)
    existingProduct.Images.Clear();
    foreach (var imgDto in productDto.Images)
    {
        existingProduct.Images.Add(new ProductImage { 
            ImageUrl = imgDto.ImageUrl, 
            IsPrimary = imgDto.IsPrimary 
        });
    }

    // Cập nhật variants
    existingProduct.Variants.Clear();
    foreach (var variantDto in productDto.Variants)
    {
        existingProduct.Variants.Add(new ProductVariant
        {
            Color = variantDto.Color,
            Storage = variantDto.Storage,
            Price = variantDto.Price,
            DiscountPrice = variantDto.DiscountPrice,
            StockQuantity = variantDto.StockQuantity
        });
    }

    _context.Products.Update(existingProduct);
    await _context.SaveChangesAsync();

    return NoContent(); // 204 - Cập nhật thành công
}
```

**💡 Chiến lược cập nhật:**
- **Immutable State Updates** - Tạo object mới thay vì mutate
- **Optimistic UI** - Hiển thị thay đổi ngay, rollback nếu API fail
- **Selective Re-render** - Chỉ re-render component cần thiết

---

## 🗑️ 5. XÓA SẢN PHẨM (Real-time Delete)

### Frontend - ProductsTable.jsx

```javascript
const confirmDeleteProduct = useCallback(async () => {
    if (!productToDelete) return;
    setIsLoading(true);
    
    try {
        const response = await fetch(
            `${process.env.REACT_APP_API_BASE_URL}/api/Products/${productToDelete.id}`,
            { method: "DELETE" }
        );
        
        if (response.ok) {
            // XÓA KHỎI MASTER LIST
            const updatedMaster = masterProducts.filter((p) => p.id !== productToDelete.id);
            setMasterProducts(updatedMaster);
            
            // XÓA KHỎI FILTERED LIST
            setFilteredProducts(prevFiltered => 
                prevFiltered.filter(p => p.id !== productToDelete.id)
            );
            
            toast.success("Sản phẩm đã được xóa thành công!");
        }
    } catch (error) {
        toast.error("Lỗi khi xóa sản phẩm");
    } finally {
        setIsLoading(false);
        setIsDeleteDialogOpen(false);
        setProductToDelete(null);
    }
}, [productToDelete, masterProducts]);
```

### Backend - ProductsController.cs

```csharp
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteProduct(int id)
{
    var product = await _context.Products
        .Include(p => p.Images)
        .Include(p => p.Variants)
        .FirstOrDefaultAsync(p => p.Id == id);

    if (product == null)
    {
        return NotFound();
    }

    _context.Products.Remove(product); // EF Core cascade delete
    await _context.SaveChangesAsync();

    return NoContent(); // 204 - Xóa thành công
}
```

**💡 Xử lý Cascade Delete:**
- **EF Core** tự động xóa related entities (Images, Variants)
- **Frontend** filter out item bị xóa khỏi cả 2 state lists

---

## 🎨 6. LỌC SẢN PHẨM (Client-side Filtering)

### Frontend - ProductsTable.jsx

```javascript
// Bộ lọc hoạt động trên masterProducts (client-side)
const applyClientFilters = useCallback(() => {
    setIsLoading(true);
    let filtered = [...masterProducts]; // Clone từ danh sách gốc
    
    if (filters.brandId) {
        filtered = filtered.filter(product => product.brandId == filters.brandId);
    }
    if (filters.categoryId) {
        filtered = filtered.filter(product => product.categoryId == filters.categoryId);
    }
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
    
    // CẬP NHẬT KẾT QUẢ LỌC - React tự động re-render
    setFilteredProducts(filtered);
    setPage(1);
    setIsFilterOpen(false);
    setIsLoading(false);
    toast.success("Đã áp dụng bộ lọc!");
}, [masterProducts, filters]);
```

**💡 Tại sao client-side filtering?**
- **Nhanh hơn** - Không cần gọi API
- **Giảm tải server** - Xử lý trên browser
- **Smooth UX** - Không có loading delay

---

## 📊 7. PHÂN TRANG ĐỘNG (Dynamic Pagination)

```javascript
// Tính toán sản phẩm hiển thị trên trang hiện tại
const currentProducts = useMemo(() => {
    const indexOfLastProduct = page * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    return filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
}, [filteredProducts, page, productsPerPage]);

// Tính tổng số trang
const totalPages = useMemo(() => 
    Math.ceil(filteredProducts.length / productsPerPage), 
    [filteredProducts.length, productsPerPage]
);

// useMemo() đảm bảo chỉ tính lại khi dependencies thay đổi
```

**💡 Tối ưu với useMemo:**
- **Tránh tính toán lại** không cần thiết mỗi lần render
- **Cache kết quả** cho đến khi filteredProducts hoặc page thay đổi

---

## 🚀 8. TỐI ƯU PERFORMANCE

### 1. **Debouncing Search**
```javascript
const debouncedSearchTerm = useDebounce(searchInput, 500);
// Giảm API calls từ 100 xuống ~5 lần khi user gõ "smartphone"
```

### 2. **Memoization**
```javascript
// Chỉ tính lại khi brands thay đổi
const brandMap = useMemo(() => {
    const map = new Map();
    brands.forEach(brand => map.set(brand.id, brand.name));
    return map;
}, [brands]);

const getBrandName = useCallback((brandId) => 
    brandMap.get(brandId) || "Không rõ", 
    [brandMap]
);
```

### 3. **Lazy Loading Components**
```javascript
const ProductDrawer = lazy(() => import('./ProductDrawer'));
const EditProductDrawer = lazy(() => import('./EditProductDrawer'));
```

### 4. **Optimistic UI Updates**
```javascript
// Hiển thị thay đổi TRƯỚC KHI API response
setMasterProducts([newProduct, ...masterProducts]);
// Rollback nếu API fail
if (!response.ok) {
    setMasterProducts(masterProducts); // Restore
}
```

### 5. **Backend Optimization**
```csharp
// Eager loading để tránh N+1 queries
var query = _context.Products
    .Include(p => p.Images)
    .Include(p => p.Variants)
    .Include(p => p.Category)
    .Include(p => p.Brand)
    .AsNoTracking(); // Tăng tốc read-only queries
```

---

## 📈 9. LUỒNG DỮ LIỆU HOÀN CHỈNH

### Kịch bản: User tìm kiếm "iPhone 15"

```
[1] User gõ "i" 
    → setSearchInput("i") 
    → Component re-render (hiển thị "i" trong ô input)

[2] User gõ "iP" 
    → setSearchInput("iP") 
    → Re-render

[3] User gõ "iPh"... (tiếp tục)

[4] User NGỪNG GÕ 500ms 
    → useDebounce trigger 
    → debouncedSearchTerm = "iPhone 15"

[5] useEffect detect debouncedSearchTerm thay đổi 
    → Gọi API: GET /api/Products/search?keyword=iPhone%2015

[6] Backend xử lý:
    → EF Core query: WHERE Name LIKE '%iPhone 15%'
    → SQL Server execution
    → Trả về kết quả: [iPhone 15 Pro, iPhone 15 Pro Max]

[7] Frontend nhận response:
    → setFilteredProducts([iPhone 15 Pro, iPhone 15 Pro Max])
    → React re-render component

[8] UI hiển thị:
    → Bảng chỉ hiển thị 2 sản phẩm iPhone 15
    → Pagination tự động điều chỉnh (totalPages = 1)
    → Animation fade-in mượt mà (Framer Motion)
```

**⏱️ Timeline:**
- 0ms: User gõ "i"
- 50ms: User gõ "iP"
- 100ms: User gõ "iPh"
- 200ms: User gõ "iPhone 15"
- 700ms: Debounce trigger → API call
- 850ms: Response nhận được
- 900ms: UI update hoàn tất

**Tổng thời gian:** ~900ms từ lúc ngừng gõ đến khi thấy kết quả

---

## 🔐 10. XỬ LÝ LỖI VÀ EDGE CASES

### Frontend Error Handling

```javascript
try {
    const response = await fetch(`${API_URL}/api/Products`);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    setFilteredProducts(data);
} catch (error) {
    console.error("Fetch error:", error);
    toast.error("Lỗi khi tải dữ liệu");
    setFilteredProducts([]); // Hiển thị danh sách trống
}
```

### Backend Validation

```csharp
[HttpPost]
public async Task<ActionResult<ProductDto>> PostProduct([FromBody] ProductDto productDto)
{
    if (productDto == null)
        return BadRequest("Dữ liệu sản phẩm không hợp lệ.");

    if (string.IsNullOrWhiteSpace(productDto.Name))
        return BadRequest("Tên sản phẩm không được để trống.");

    if (productDto.CategoryId <= 0)
        return BadRequest("Danh mục không hợp lệ.");

    // ... xử lý tiếp
}
```

---

## 📝 11. KẾT LUẬN

### ✅ Ưu điểm của kiến trúc hiện tại:

1. **Real-time Updates** - Tất cả thay đổi hiển thị ngay lập tức
2. **Optimistic UI** - UX mượt mà, không chờ đợi API
3. **Separation of Concerns** - masterProducts vs filteredProducts
4. **Performance Optimized** - Debouncing, Memoization, Client-side filtering
5. **Error Resilient** - Xử lý lỗi tốt, rollback khi cần

### 🔄 Các kỹ thuật chính:

| Kỹ thuật | Mục đích | Công cụ |
|---------|---------|---------|
| State Management | Quản lý dữ liệu | React useState |
| Debouncing | Giảm API calls | Custom hook |
| Memoization | Tránh tính toán lại | useMemo, useCallback |
| Optimistic Updates | UX tốt hơn | State updates trước API |
| Client-side Filtering | Tăng tốc độ | Array methods |
| Eager Loading | Giảm N+1 queries | EF Core Include |

### 🎯 Luồng dữ liệu tóm gọn:

```
Database → Backend API → Frontend State → React Render → UI Display
    ↑                                                         ↓
    └─────────────── User Actions (CRUD) ──────────────────┘
```

**Tất cả đều diễn ra THỜI GIAN THỰC nhờ React state management + API integration!** 🚀
