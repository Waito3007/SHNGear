# Module 7: Bảng điều khiển Quản trị (Admin Dashboard)

Bảng điều khiển quản trị là trung tâm chỉ huy của hệ thống, nơi các quản trị viên (Admin) có thể theo dõi, quản lý và cấu hình mọi khía cạnh của trang web. Các chức năng này được tổng hợp từ nhiều controller khác nhau và được bảo vệ bằng quyền truy cập `[Authorize(Roles = "Admin")]`.

## 1. Tổng quan các chức năng

Bảng điều khiển được chia thành các khu vực quản lý chính:

1.  **Tổng quan (Dashboard Overview):** Hiển thị các số liệu thống kê quan trọng.
2.  **Quản lý Đơn hàng:** Theo dõi và xử lý đơn hàng.
3.  **Quản lý Sản phẩm:** Quản lý toàn bộ danh mục sản phẩm.
4.  **Quản lý Người dùng:** Quản lý tài khoản và vai trò người dùng.
5.  **Quản lý Nội dung & Khuyến mãi:** Cập nhật giao diện, banner, blog, và các chương trình khuyến mãi.
6.  **Quản lý Hệ thống Chat:** Tương tác và hỗ trợ người dùng.

## 2. Chi tiết các chức năng và Endpoints

### 2.1. Dashboard Overview

*   **Mô tả:** Cung cấp một cái nhìn nhanh về tình hình kinh doanh.
*   **Endpoints (`OrderController`, `UserController`, `ProductsController`):**
    *   `GET /api/orders/stats`: Lấy các thống kê chính về đơn hàng (tổng số, đã hoàn thành, đang chờ xử lý, tổng doanh thu).
    *   `GET /api/orders/dashboard/sales-overview`: Dữ liệu doanh số theo tuần/tháng/năm để vẽ biểu đồ.
    *   `GET /api/orders/sales-by-category`: Thống kê doanh số theo danh mục.
    *   `GET /api/users/statistics`: Thống kê về người dùng (tổng số, người dùng mới).
    *   `GET /api/products/low-stock`: Đếm số lượng sản phẩm sắp hết hàng.

### 2.2. Quản lý Đơn hàng

*   **Mô tả:** Xem, duyệt và cập nhật trạng thái các đơn hàng.
*   **Endpoints (`OrderController`):**
    *   `GET /api/orders`: Lấy danh sách tất cả đơn hàng.
    *   `GET /api/orders/{id}/details`: Xem chi tiết một đơn hàng.
    *   `PUT /api/orders/{id}/status`: Cập nhật trạng thái đơn hàng (ví dụ: `Pending` -> `Processing` -> `Shipped` -> `Delivered`).
    *   `GET /api/orders/export/...`: Xuất hóa đơn ra các định dạng Excel, PDF, ảnh.

### 2.3. Quản lý Sản phẩm

*   **Mô tả:** Toàn quyền quản lý sản phẩm, danh mục, thương hiệu và thông số kỹ thuật.
*   **Endpoints:**
    *   **Sản phẩm (`ProductsController`):** `POST`, `PUT`, `DELETE` tại `/api/products`.
    *   **Flash Sale (`ProductsController`):** `PUT /api/products/{id}/set-flash-sale`, `PUT /api/products/{id}/clear-flash-sale`.
    *   **Danh mục (`CategoriesController`):** `POST`, `PUT`, `DELETE` tại `/api/categories`.
    *   **Thương hiệu (`BrandController`):** `POST`, `PUT`, `DELETE` tại `/api/brands`.
    *   **Thông số (`SpecificationsController`):** `POST`, `PUT`, `DELETE` tại `/api/specifications`.

### 2.4. Quản lý Người dùng

*   **Mô tả:** Quản lý tài khoản và phân quyền.
*   **Endpoints (`UserController`, `RoleController`):**
    *   `GET /api/users`: Lấy danh sách người dùng.
    *   `PUT /api/users/{id}`: Cập nhật thông tin người dùng.
    *   `PUT /api/users/{id}/role`: Thay đổi vai trò người dùng.
    *   `GET, POST, PUT, DELETE` tại `/api/roles` để quản lý các vai trò.

### 2.5. Quản lý Nội dung & Khuyến mãi

*   **Mô tả:** Cập nhật các nội dung động và các chiến dịch marketing.
*   **Endpoints:**
    *   **Blog (`BlogPostsController`):** `POST`, `PUT`, `DELETE` tại `/api/blogposts`.
    *   **Voucher (`VoucherController`):** `POST`, `PUT`, `DELETE` tại `/api/vouchers`.
    *   **Banner (`BannerController`):** `POST`, `PUT`, `DELETE` tại `/api/banner`.
    *   **Slider (`SliderController`):** `POST`, `PUT`, `DELETE` tại `/api/slider`.
    *   **Cấu hình trang chủ (`HomepageConfigController`):** `PUT /api/homepage-config` để tùy chỉnh toàn bộ layout và nội dung trang chủ.

### 2.6. Quản lý Hệ thống Chat

*   **Mô tả:** Tương tác với các khách hàng cần hỗ trợ.
*   **Endpoints (`ChatController`):**
    *   `GET /api/chat/admin/sessions`: Lấy danh sách các cuộc trò chuyện đang chờ hoặc đang diễn ra.
    *   `POST /api/chat/{sessionId}/admin-message`: Gửi tin nhắn cho người dùng.
*   **SignalR:** Admin cần tham gia vào nhóm `admins` để nhận thông báo real-time khi có khách hàng cần hỗ trợ (`ChatEscalated` event).

## 3. Phân quyền

Tất cả các endpoint được liệt kê ở trên đều được bảo vệ bởi `[Authorize(Roles = "Admin")]`. Điều này đảm bảo rằng chỉ những người dùng có vai trò "Admin" trong JWT của họ mới có thể truy cập và thực hiện các hành động này. Các vai trò khác như "User", "VIP 0", "VIP 1"... sẽ bị từ chối truy cập.
