# Tóm tắt các chức năng chính của dự án SHN Gear

Dự án SHN Gear là một ứng dụng thương mại điện tử (e-commerce) toàn diện, được xây dựng trên nền tảng ASP.NET Core làm backend API và React làm frontend SPA. Dự án tích hợp nhiều tính năng quản lý sản phẩm, người dùng, đơn hàng, cũng như các tính năng nâng cao như hệ thống chat AI và quản lý nội dung.

## I. Các chức năng cốt lõi của E-commerce

1.  **Quản lý Sản phẩm:**
    *   Tạo, đọc, cập nhật, xóa (CRUD) sản phẩm.
    *   Quản lý thông số kỹ thuật sản phẩm (Product Specifications).
    *   Quản lý hình ảnh sản phẩm (Product Images).
    *   Quản lý biến thể sản phẩm (Product Variants) với giá cả và chiết khấu.
    *   Phân loại sản phẩm theo danh mục (Categories) và thương hiệu (Brands).
    *   Đánh dấu sản phẩm bán chạy nhất (Best Sellers).
    *   Quản lý Flash Sale.

2.  **Giỏ hàng & Đặt hàng:**
    *   Thêm, xóa, cập nhật số lượng sản phẩm trong giỏ hàng (Shopping Cart).
    *   Quản lý đơn hàng (Order Management) với các trạng thái khác nhau.
    *   Quản lý địa chỉ giao hàng (Address Management).

3.  **Thanh toán:**
    *   Hỗ trợ nhiều phương thức thanh toán (Payment Methods): Tiền mặt, MoMo, PayPal.
    *   Tích hợp cổng thanh toán PayPal.

4.  **Người dùng & Xác thực:**
    *   Đăng ký, đăng nhập người dùng (Authentication).
    *   Quản lý vai trò người dùng (Roles): Admin, VIP 1, VIP 2, VIP 3.
    *   Quản lý thông tin hồ sơ người dùng (User Profile).
    *   Hệ thống điểm thưởng và chương trình khách hàng thân thiết (Loyalty Program).

5.  **Đánh giá Sản phẩm:**
    *   Người dùng có thể viết và quản lý đánh giá (Reviews) cho sản phẩm.
    *   Quản lý và phê duyệt đánh giá từ phía Admin.

6.  **Tìm kiếm:**
    *   Chức năng tìm kiếm sản phẩm toàn diện.

7.  **Voucher & Khuyến mãi:**
    *   Quản lý và áp dụng các mã giảm giá (Vouchers).
    *   Quản lý Voucher của người dùng.

## II. Các chức năng của Bảng điều khiển Admin

1.  **Tổng quan Dashboard:** Cung cấp cái nhìn tổng thể về hiệu suất hệ thống.
2.  **Quản lý Sản phẩm, Người dùng, Đơn hàng, Danh mục, Thương hiệu:** Các giao diện CRUD đầy đủ cho các thực thể chính của hệ thống.
3.  **Báo cáo & Phân tích:** Cung cấp dữ liệu về doanh số bán hàng và các phân tích khác.
4.  **Cấu hình Trang chủ:** Quản lý các thành phần hiển thị trên trang chủ như banner, sản phẩm nổi bật, flash sale.
5.  **Quản lý Đánh giá:** Duyệt, chỉnh sửa hoặc xóa các đánh giá sản phẩm.
6.  **Quản lý Blog/Tin tức:** (Mới thêm) Tạo, chỉnh sửa, xóa và quản lý trạng thái xuất bản các bài viết blog/tin tức với trình soạn thảo Rich Text Editor.

## III. Các chức năng AI & Chat

1.  **Hệ thống Chat AI:**
    *   Tích hợp AI (Gemini Service) để trả lời các câu hỏi của người dùng.
    *   Sử dụng SignalR cho giao tiếp thời gian thực.
    *   Quản lý ngữ cảnh cuộc trò chuyện (Context Manager).
    *   Cơ sở tri thức AI (AI Knowledge Base) để lưu trữ thông tin và cải thiện phản hồi.
    *   Chức năng xuất cơ sở tri thức ra file (Knowledge Export Service).
    *   Quản lý phiên chat và tin nhắn chat.

## IV. Các chức năng hạ tầng & tiện ích

1.  **Tải lên tệp:** Tích hợp Cloudinary để quản lý và lưu trữ hình ảnh.
2.  **Dịch vụ Email:** Gửi email thông báo và xác nhận.
3.  **Middleware Rate Limit:** Giới hạn số lượng yêu cầu đến API để bảo vệ hệ thống.
4.  **Database Seeding:** Tự động điền dữ liệu mẫu vào cơ sở dữ liệu khi khởi động.

## V. Công nghệ sử dụng

*   **Backend:** ASP.NET Core (C#)
*   **Database:** SQL Server (sử dụng Entity Framework Core)
*   **Frontend:** React.js (JavaScript/TypeScript)
*   **Real-time:** SignalR
*   **AI:** Google Gemini (thông qua GeminiService)
*   **Lưu trữ tệp:** Cloudinary
*   **Thanh toán:** PayPal, MoMo
*   **UI/UX:** Tailwind CSS, Material Design principles (dựa trên các thư viện React)

File này cung cấp một cái nhìn tổng quan về các khả năng của dự án SHN Gear. Mỗi chức năng có thể được mở rộng và chi tiết hơn trong các tài liệu riêng biệt.