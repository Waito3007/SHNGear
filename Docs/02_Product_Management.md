# Module 2: Quản lý Sản phẩm

Module này là trung tâm của hệ thống e-commerce, chịu trách nhiệm quản lý tất cả các khía cạnh của sản phẩm, từ danh mục, thương hiệu đến thông số kỹ thuật chi tiết.

## 1. Các Controllers liên quan

*   `ProductsController.cs`: Quản lý vòng đời của sản phẩm (CRUD), tìm kiếm, sản phẩm liên quan, flash sale, và so sánh sản phẩm.
*   `CategoriesController.cs`: Quản lý danh mục sản phẩm.
*   `BrandController.cs`: Quản lý thương hiệu sản phẩm.
*   `SpecificationsController.cs`: Quản lý thông số kỹ thuật chi tiết cho từng sản phẩm.

## 2. Chức năng chính

### 2.1. Quản lý Sản phẩm (`/api/products/...`)

*   **Mô tả:** Cung cấp đầy đủ các hoạt động CRUD cho sản phẩm.
*   **Các endpoints chính:**
    *   `GET /api/products`: Lấy danh sách tất cả sản phẩm. Có thể lọc theo `categoryId`.
    *   `GET /api/products/{id}`: Lấy thông tin chi tiết của một sản phẩm, bao gồm hình ảnh, biến thể, thương hiệu, và đánh giá trung bình.
    *   `POST /api/products`: Tạo một sản phẩm mới. Yêu cầu dữ liệu từ `ProductDto`.
    *   `PUT /api/products/{id}`: Cập nhật thông tin một sản phẩm.
    *   `DELETE /api/products/{id}`: Xóa một sản phẩm.

*   **Biến thể sản phẩm (`ProductVariant`):**
    *   Mỗi sản phẩm có thể có nhiều biến thể (ví dụ: theo màu sắc, dung lượng lưu trữ).
    *   Mỗi biến thể có giá, giá khuyến mãi, và số lượng tồn kho (`StockQuantity`) riêng.
    *   Endpoint `GET /api/products/{id}/variants` cho phép lấy danh sách các biến thể của một sản phẩm.

*   **Flash Sale:**
    *   Sản phẩm có thể được thiết lập để bán flash sale trong một khoảng thời gian nhất định.
    *   Các endpoints `PUT /api/products/{id}/set-flash-sale` và `PUT /api/products/{id}/clear-flash-sale` dùng để quản lý trạng thái flash sale.
    *   Endpoint `GET /api/products/flash-sale` lấy danh sách các sản phẩm đang trong thời gian flash sale.

*   **Chức năng khác:**
    *   `GET /api/products/related-by-brand/{brandId}/{currentProductId}`: Lấy các sản phẩm liên quan cùng thương hiệu.
    *   `POST /api/products/compare`: So sánh thông tin chi tiết (bao gồm cả thông số kỹ thuật) của một danh sách các sản phẩm.
    *   `GET /api/products/search?keyword=...`: Tìm kiếm sản phẩm theo từ khóa.

### 2.2. Quản lý Danh mục (`/api/categories/...`)

*   **Mô tả:** Cho phép quản lý các danh mục sản phẩm.
*   **Các endpoints:**
    *   `GET /api/categories`: Lấy danh sách tất cả danh mục.
    *   `POST /api/categories`: Tạo danh mục mới.
    *   `PUT /api/categories/{id}`: Cập nhật thông tin danh mục.
    *   `DELETE /api/categories/{id}`: Xóa danh mục.
    *   `GET /api/categories/product-count`: Thống kê số lượng sản phẩm trong mỗi danh mục.

### 2.3. Quản lý Thương hiệu (`/api/brands/...`)

*   **Mô tả:** Cho phép quản lý các thương hiệu.
*   **Các endpoints:**
    *   `GET /api/brands`: Lấy danh sách tất cả thương hiệu.
    *   `POST /api/brands`: Tạo thương hiệu mới.
    *   `PUT /api/brands/{id}`: Cập nhật thông tin thương hiệu.
    *   `DELETE /api/brands/{id}`: Xóa thương hiệu (chỉ khi không có sản phẩm nào thuộc thương hiệu đó).

### 2.4. Quản lý Thông số kỹ thuật (`/api/specifications/...`)

*   **Mô tả:** Quản lý các thông số kỹ thuật chi tiết cho từng sản phẩm, giúp cho việc hiển thị thông tin và so sánh sản phẩm được chi tiết và chính xác.
*   **Các endpoints:**
    *   `GET /api/specifications/by-product/{productId}`: Lấy tất cả thông số của một sản phẩm.
    *   `POST /api/specifications`: Tạo một thông số mới cho sản phẩm.
    *   `PUT /api/specifications/{id}`: Cập nhật một thông số.
    *   `DELETE /api/specifications/{id}`: Xóa một thông số.
    *   `POST /api/specifications/bulk`: Tạo hàng loạt thông số cho nhiều sản phẩm cùng lúc.

## 3. Các DTOs liên quan

*   `ProductDto`: Đại diện cho dữ liệu sản phẩm khi giao tiếp với client. Bao gồm thông tin về hình ảnh, biến thể, thương hiệu, đánh giá, và trạng thái flash sale.
*   `ProductVariantDto`: Thông tin về một biến thể sản phẩm.
*   `CategoryDto`: Thông tin về danh mục.
*   `BrandDto`: Thông tin về thương hiệu.
*   `ProductSpecificationDto`: Thông tin về một thông số kỹ thuật.
*   `CreateProductDto`, `CreateCategoryDto`, `CreateProductSpecificationDto`: Các DTO dùng để tạo mới các đối tượng tương ứng.

## 4. Cấu trúc dữ liệu (Models)

*   **`Product`**: Bảng chính chứa thông tin cơ bản của sản phẩm.
*   **`ProductVariant`**: Bảng chứa các biến thể của sản phẩm, liên kết với `Product` bằng `ProductId`.
*   **`ProductImage`**: Bảng chứa các URL hình ảnh cho sản phẩm.
*   **`Category`**: Bảng danh mục.
*   **`Brand`**: Bảng thương hiệu.
*   **`ProductSpecification`**: Bảng chứa các cặp `Name-Value` cho thông số kỹ thuật của sản phẩm.
