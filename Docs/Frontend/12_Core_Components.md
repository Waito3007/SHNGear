# Module 12: Các Thành phần Cốt lõi (Core Components)

Module này mô tả các component quan trọng, có khả năng tái sử dụng cao, tạo nên nền tảng cho giao diện người dùng của ứng dụng.

## 1. Tổng quan

Thư mục `src/components` được cấu trúc rất chi tiết theo từng tính năng, cho thấy một hệ thống component được tổ chức tốt. Các component này bao gồm từ các yếu tố UI cơ bản (nút, input) cho đến các khối chức năng phức tạp (biểu đồ, trình soạn thảo).

## 2. Các Component Layout và Điều hướng

*   **`Navbar` (`src/components/Navbar`)**
    *   **Mô tả:** Thanh điều hướng chính của trang web, luôn hiển thị ở đầu trang. Nó chứa logo, các liên kết đến danh mục sản phẩm, thanh tìm kiếm, icon giỏ hàng, và nút đăng nhập/hồ sơ người dùng.
    *   **Logic:** Tương tác với `AuthContext` để hiển thị trạng thái đăng nhập (hiển thị nút "Đăng nhập" hoặc avatar người dùng). Hiển thị số lượng sản phẩm trong giỏ hàng bằng cách lấy dữ liệu từ `CartContext`.

*   **`Footer` (`src/components/Footer`)**
    *   **Mô tả:** Phần chân trang, chứa các thông tin bổ sung như liên kết nhanh, thông tin liên hệ, và các liên kết mạng xã hội.

*   **`ProtectedRoute.jsx` (`src/components/ProtectedRoute.jsx`)**
    *   **Mô tả:** Đây là một Higher-Order Component (HOC) hoặc một component bao bọc (wrapper). Nó đóng vai trò then chốt trong việc bảo vệ các route dành cho admin.
    *   **Logic:**
        1.  Sử dụng `useAuth` hook để truy cập vào trạng thái xác thực của người dùng.
        2.  Kiểm tra xem người dùng đã đăng nhập (`isAuthenticated`) và có vai trò là `Admin` (`user.role === 'Admin'`) hay không.
        3.  Nếu điều kiện thỏa mãn, nó sẽ render component con (chính là trang admin).
        4.  Nếu không, nó sẽ điều hướng người dùng đến trang `/unauthorized` hoặc trang đăng nhập.

## 3. Các Component Chức năng

*   **`Chat` (`src/components/Chat`)**
    *   **Mô tả:** Toàn bộ giao diện cửa sổ chat, bao gồm khung chat, ô nhập liệu, và các bong bóng tin nhắn.
    *   **Logic:** Tương tác mạnh mẽ với `ChatSignalRService` để gửi và nhận tin nhắn real-time. Nó cũng gọi các API trong `ChatController` để tạo session và lấy lịch sử trò chuyện.

*   **`Auth` (`src/components/Auth`)**
    *   **Mô tả:** Chứa các form Đăng nhập (`Login.jsx`) và Đăng ký (`Register.jsx`), thường được hiển thị bên trong một modal.
    *   **Logic:** Sử dụng `react-hook-form` để quản lý input và validation. Khi người dùng submit form, nó sẽ gọi các hàm từ `authService` (hoặc trực tiếp `axios`) để gửi yêu cầu đến `AuthController` ở backend.

*   **`ProductCard` (Vị trí có thể trong `src/components/List` hoặc `shared`)**
    *   **Mô tả:** Component nhỏ gọn để hiển thị thông tin tóm tắt của một sản phẩm trong danh sách (hình ảnh, tên, giá, nút thêm vào giỏ hàng).
    *   **Tái sử dụng:** Được dùng ở nhiều nơi như trang chủ, trang danh sách sản phẩm, và trong phần sản phẩm liên quan.

*   **`Admin` (`src/components/Admin`)**
    *   **Mô tả:** Đây là một thư mục lớn chứa rất nhiều component con dành riêng cho trang quản trị, ví dụ:
        *   `Admin/blog/BlogPostEditor`: Trình soạn thảo văn bản (có thể là `react-quill`) để viết và sửa bài blog.
        *   `Admin/home/PinnedProductKanban`: Một bảng Kanban để quản lý các sản phẩm được ghim trên trang chủ.
        *   Các bảng dữ liệu (sử dụng `antd` Table) để hiển thị danh sách sản phẩm, đơn hàng, người dùng.
        *   Các biểu đồ (sử dụng `recharts`) để trực quan hóa dữ liệu kinh doanh.

## 4. Component Đặc biệt

*   **`SessionExpiredModal.jsx` (`src/components/SessionExpiredModal.jsx`)**
    *   **Mô tả:** Một modal tự động hiển thị khi API trả về lỗi 401 (Unauthorized). Điều này xảy ra khi JWT của người dùng hết hạn.
    *   **Logic:** Thường được kích hoạt bởi một `axios interceptor`. Interceptor này sẽ bắt các response có mã lỗi 401, sau đó gọi một hàm (có thể từ `AuthContext`) để hiển thị modal này, buộc người dùng phải đăng nhập lại.
