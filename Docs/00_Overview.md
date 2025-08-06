# Tổng quan hệ thống SHN-Gear

Đây là tài liệu tổng quan về kiến trúc, công nghệ sử dụng và luồng hoạt động chung của hệ thống website thương mại điện tử SHN-Gear.

## 1. Kiến trúc và Công nghệ

Hệ thống được xây dựng dựa trên kiến trúc Single Page Application (SPA) với các thành phần chính sau:

*   **Backend:**
    *   **Framework:** ASP.NET Core 6
    *   **Ngôn ngữ:** C#
    *   **Database:** SQL Server (quản lý qua Entity Framework Core)
    *   **API:** Cung cấp các RESTful APIs để giao tiếp với frontend.
    *   **Xác thực:** Sử dụng JSON Web Tokens (JWT) để bảo vệ các API.
*   **Frontend:**
    *   **Thư viện:** React.js
    *   **Ngôn ngữ:** JavaScript (với JSX)
    *   **Styling:** Tailwind CSS
    *   **State Management:** React Context hoặc Redux (cần kiểm tra thêm)
*   **Real-time:**
    *   **SignalR:** Được sử dụng cho các tính năng real-time như Chat.
*   **Thanh toán:**
    *   Tích hợp với các cổng thanh toán như **MoMo** và **PayPal**.
*   **Dịch vụ khác:**
    *   **Cloudinary:** Để lưu trữ và quản lý hình ảnh.
    *   **Email Service:** Để gửi email (ví dụ: xác nhận đơn hàng, OTP).

## 2. Luồng hoạt động chính

### 2.1. Luồng người dùng (User Flow)

1.  **Trang chủ:** Người dùng truy cập trang chủ, nơi hiển thị các sản phẩm nổi bật, banner, slider, và các danh mục chính.
2.  **Xem sản phẩm:** Người dùng có thể duyệt qua các danh mục, tìm kiếm sản phẩm, hoặc xem chi tiết một sản phẩm cụ thể.
3.  **Giỏ hàng:** Người dùng thêm sản phẩm vào giỏ hàng. Giỏ hàng được quản lý bằng session cho khách và lưu vào database cho người dùng đã đăng nhập.
4.  **Thanh toán:** Người dùng tiến hành thanh toán, nhập thông tin giao hàng, chọn phương thức thanh toán (COD, MoMo, PayPal), và áp dụng voucher (nếu có).
5.  **Xác nhận đơn hàng:** Sau khi đặt hàng thành công, hệ thống sẽ gửi email xác nhận cho người dùng.
6.  **Quản lý tài khoản:** Người dùng có thể đăng ký, đăng nhập, xem lịch sử đơn hàng, quản lý địa chỉ, và cập nhật thông tin cá nhân.

### 2.2. Luồng quản trị viên (Admin Flow)

1.  **Đăng nhập:** Quản trị viên đăng nhập vào trang quản trị.
2.  **Dashboard:** Xem các thống kê tổng quan về doanh thu, đơn hàng, và người dùng.
3.  **Quản lý sản phẩm:** Thêm, sửa, xóa sản phẩm, danh mục, và thương hiệu.
4.  **Quản lý đơn hàng:** Xem danh sách đơn hàng, cập nhật trạng thái đơn hàng.
5.  **Quản lý người dùng:** Xem danh sách người dùng, quản lý vai trò.
6.  **Quản lý nội dung:** Quản lý bài viết blog, banner, slider.
7.  **Quản lý khuyến mãi:** Quản lý voucher và các chương trình khuyến mãi.

## 3. Các module chức năng chính

Dựa trên phân tích các controllers, hệ thống bao gồm các module chức năng chính sau:

*   **Authentication:** Đăng ký, đăng nhập, quản lý token.
*   **Product Management:** Quản lý sản phẩm, danh mục, thương hiệu, thông số kỹ thuật.
*   **Order & Checkout:** Quản lý giỏ hàng, đặt hàng, thanh toán.
*   **User Management:** Quản lý thông tin người dùng, địa chỉ.
*   **Sales & Promotions:** Quản lý voucher, banner, slider, flash sale.
*   **Content Management:** Quản lý bài viết blog.
*   **AI Chat Service:** Hỗ trợ khách hàng qua chat AI.
*   **Review System:** Hệ thống đánh giá sản phẩm.
*   **Loyalty Program:** Chương trình khách hàng thân thiết và vòng quay may mắn.

Các file tài liệu tiếp theo sẽ đi sâu vào chi tiết từng module này.
