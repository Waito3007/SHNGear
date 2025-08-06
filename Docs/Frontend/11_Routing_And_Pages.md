# Module 11: Điều hướng và Các trang (Routing & Pages)

Module này mô tả cấu trúc điều hướng của ứng dụng và các trang chính, dựa trên định nghĩa trong file `AppRoutes.js`.

## 1. Hệ thống Điều hướng (Routing)

*   **Thư viện:** `react-router-dom` được sử dụng để quản lý toàn bộ việc điều hướng.
*   **Cấu hình:** File `AppRoutes.js` xuất ra một mảng các đối tượng, mỗi đối tượng định nghĩa một route bao gồm:
    *   `path`: Đường dẫn URL (ví dụ: `/`, `/admin/products`, `/productlist`).
    *   `element`: Component `page` sẽ được render khi URL khớp với `path`.
    *   `requiresAdmin`: Một thuộc tính tùy chỉnh (`true`/`false`) để đánh dấu các route yêu cầu quyền quản trị viên.
*   **Bảo vệ Route (Protected Routes):** Mặc dù không thấy rõ trong `AppRoutes.js`, nhưng thuộc tính `requiresAdmin: true` gợi ý rằng có một component cấp cao hơn (thường là một component tên là `ProtectedRoute` hoặc logic tương tự trong `App.js`) sẽ kiểm tra trạng thái đăng nhập và vai trò của người dùng (lấy từ `AuthContext`) trước khi cho phép truy cập vào các route này. Nếu người dùng không phải admin, họ sẽ bị chuyển hướng đến trang `/unauthorized`.

## 2. Các Trang chính (Pages)

Dựa trên `AppRoutes.js`, ứng dụng được chia thành hai khu vực chính: trang cho người dùng (Public Pages) và trang quản trị (Admin Pages).

### 2.1. Trang cho Người dùng (Public Pages)

Đây là các trang mà mọi khách truy cập đều có thể xem.

*   **`HomePage` (`/`)**
    *   **Component:** `src/pages/Home/HomePage.js`
    *   **Mô tả:** Trang chủ của website, là điểm đến đầu tiên của người dùng. Trang này rất năng động, hiển thị các thành phần được cấu hình từ `HomepageConfigController` ở backend, bao gồm hero section, sliders, banners, danh mục nổi bật, sản phẩm bán chạy, và các sản phẩm được ghim.

*   **`ProductList` (`/productlist`)**
    *   **Component:** `src/pages/ProductList/ProductList.js`
    *   **Mô tả:** Trang hiển thị danh sách các sản phẩm. Người dùng có thể lọc sản phẩm theo danh mục, thương hiệu, khoảng giá và các thuộc tính khác. Đây là trang chính để khám phá sản phẩm.

*   **`ProductPage` (`/ProductPage/:id`)** (Lưu ý: Route có thể cần sửa thành `/product/:id`)
    *   **Component:** `src/pages/ProductPage/ProductPage.js`
    *   **Mô tả:** Trang chi tiết của một sản phẩm. Hiển thị tất cả thông tin về sản phẩm: hình ảnh, mô tả, thông số kỹ thuật, các biến thể (màu sắc, dung lượng), giá, đánh giá từ người dùng khác, và các sản phẩm liên quan.

*   **`Shoppingcart` (`/shoppingcart`)**
    *   **Component:** `src/pages/shoppingcart/shoppingcart.js`
    *   **Mô tả:** Trang giỏ hàng, nơi người dùng có thể xem lại các sản phẩm đã chọn, cập nhật số lượng, và tiến hành thanh toán.

*   **`ProfilePage` (`/Profile`)**
    *   **Component:** `src/pages/ProfilePage/ProfilePage.js`
    *   **Mô tả:** Trang quản lý tài khoản cá nhân. Yêu cầu người dùng phải đăng nhập. Tại đây, người dùng có thể xem lịch sử đơn hàng, quản lý địa chỉ, và cập nhật thông tin cá nhân.

*   **`LoyaltyPage` (`/loyalty`)**
    *   **Component:** `src/pages/Loyalty/LoyaltyPage.js`
    *   **Mô tả:** Trang chương trình khách hàng thân thiết, nơi người dùng xem điểm, thứ hạng và tham gia vòng quay may mắn.

*   **`BlogList` & `BlogPostDetail` (`/blog`, `/blog/:id`)**
    *   **Component:** `src/components/Admin/blog/BlogList.js`, `src/components/Admin/blog/BlogPostDetail.js`
    *   **Mô tả:** Các trang để người dùng đọc các bài viết blog.

*   **`Unauthorized` (`/unauthorized`)**
    *   **Component:** `src/pages/Unauthorized/Unauthorized.js`
    *   **Mô tả:** Trang thông báo lỗi khi người dùng cố gắng truy cập một tài nguyên mà họ không có quyền.

### 2.2. Trang Quản trị (Admin Pages)

Đây là các trang được bảo vệ, chỉ tài khoản có vai trò `Admin` mới có thể truy cập.

*   **`OverviewPage` (`/admin/overview`)**: Bảng điều khiển chính, hiển thị các số liệu thống kê tổng quan.
*   **`ProductsPage` (`/admin/products`)**: Giao diện để quản lý (thêm, sửa, xóa) sản phẩm.
*   **`OrdersPage` (`/admin/orders`)**: Giao diện quản lý đơn hàng.
*   **`UsersPage` (`/admin/users`)**: Giao diện quản lý người dùng.
*   **`ManageHomePage` (`/admin/home`)**: Giao diện kéo-thả hoặc cấu hình để quản lý bố cục và nội dung trang chủ.
*   **`CategoryAdminPage`, `SliderAdminPage`, `BannerAdminPage`**: Các trang chuyên biệt để quản lý danh mục, slider và banner.
*   **`FlashSaleAdminPage` (`/admin/flash-sale`)**: Giao diện quản lý các sản phẩm flash sale.
*   **`ReviewManagementPage` (`/admin/reviews`)**: Trang để duyệt và quản lý các đánh giá của người dùng.
*   **`LuckySpinPage` (`/admin/lucky-spin`)**: Trang cấu hình cho vòng quay may mắn.
*   **`BlogList` & `BlogPostEditor` (`/admin/blog/...`)**: Các trang để admin viết, chỉnh sửa và quản lý bài viết blog.
