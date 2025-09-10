# Nền tảng Thương mại điện tử SHN-Gear

Dự án SHN-Gear là một nền tảng thương mại điện tử (E-commerce) toàn diện, hiện đại được xây dựng với backend là ASP.NET Core và frontend là React. Hệ thống được thiết kế để cung cấp trải nghiệm mua sắm trực tuyến mượt mà, an toàn và thông minh.

Điểm nhấn của dự án là việc tích hợp Trí tuệ nhân tạo (AI) thông qua Google Gemini API để cung cấp dịch vụ chatbot tư vấn sản phẩm, nâng cao trải nghiệm khách hàng và tự động hóa quy trình hỗ trợ.

## Bảng tổng quan kiến trúc

| Thành phần            | Công nghệ/Dịch vụ                                | Mục đích                                                              |
| --------------------- | ------------------------------------------------ | --------------------------------------------------------------------- |
| **Backend Framework** | ASP.NET Core 8                                   | Xây dựng API và logic phía máy chủ mạnh mẽ, hiệu suất cao.             |
| **Frontend Library**  | React (với Craco)                                | Tạo ứng dụng trang đơn (SPA) năng động, đáp ứng và hiện đại.          |
| **Database ORM**      | Entity Framework Core                            | Quản lý dữ liệu, migrations và tương tác với cơ sở dữ liệu SQL.        |
| **Cấu hình**          | File `.env` (DotNetEnv)                          | Quản lý các biến môi trường an toàn và linh hoạt.                      |
| **Real-time Engine**  | SignalR                                          | Cung cấp các tính năng thời gian thực như dịch vụ AI Chat.             |
| **Dịch vụ AI**        | Google Gemini API                                | Cung cấp khả năng chatbot thông minh để hỗ trợ khách hàng.             |
| **Xác thực**          | JWT (JSON Web Tokens)                            | Bảo mật các API endpoint và quản lý phiên làm việc của người dùng.      |
| **Cổng thanh toán**   | PayPal, MoMo                                     | Cung cấp nhiều tùy chọn thanh toán an toàn khi thanh toán.             |
| **Lưu trữ file**      | Cloudinary                                       | Xử lý lưu trữ và phân phối hình ảnh, media trên nền tảng đám mây.      |
| **Styling**           | Tailwind CSS                                     | Sử dụng framework CSS utility-first để phát triển giao diện nhanh chóng.|

## Tính năng chính

(Các tính năng không đổi so với phiên bản trước)

## Hướng dẫn cài đặt chi tiết

### Yêu cầu tiên quyết
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js và npm](https://nodejs.org/en/) (phiên bản 18.x trở lên)
- [Git](https://git-scm.com/)
- Một hệ quản trị cơ sở dữ liệu (ví dụ: SQL Server).

### 1. Cài đặt Backend (ASP.NET Core)

1.  **Clone repository về máy:**
    ```bash
    git clone <your-repository-url>
    cd SHNGear-2
    ```

2.  **Cấu hình biến môi trường (Rất quan trọng):**
    - Tại thư mục gốc của dự án, tạo một file mới tên là `.env`.
    - Sao chép toàn bộ nội dung từ file `.env.example` và dán vào file `.env` vừa tạo.
    - **Cập nhật các giá trị** trong file `.env` bằng thông tin cấu hình thực tế của bạn. Ứng dụng sẽ đọc các biến này khi khởi chạy để kết nối dịch vụ.

    **Ví dụ cấu hình database trong file `.env`:**
    ```dotenv
    # Cấu hình Database - Thay bằng thông tin của bạn
    DB_SERVER=your_sql_server_address
    DB_NAME=your_database_name
    DB_USER=your_database_user
    DB_PASSWORD=your_database_password
    DB_ENCRYPT=True
    DB_TRUST_SERVER_CERTIFICATE=True
    DB_MULTIPLE_ACTIVE_RESULT_SETS=True

    # Cập nhật các biến khác cho JWT, Cloudinary, PayPal...
    JWT_SECRET_KEY=your_super_secret_key_that_is_long_and_random
    # ... các cấu hình khác
    ```

3.  **Áp dụng Database Migrations:**
    Sau khi đã cấu hình file `.env`, hãy dùng công cụ dòng lệnh của Entity Framework Core để tạo cơ sở dữ liệu. Ứng dụng sẽ tự động xây dựng chuỗi kết nối từ các biến môi trường bạn đã cung cấp.
    ```bash
    dotnet ef database update
    ```

4.  **Chạy Backend:**
    ```bash
    dotnet run
    ```
    API sẽ khởi động và thường chạy tại địa chỉ `https://localhost:7032`.

### 2. Cài đặt Frontend (React)

1.  **Điều hướng đến thư mục `ClientApp`:**
    ```bash
    cd ClientApp
    ```

2.  **Cài đặt dependencies:**
    ```bash
    npm install
    ```

3.  **Cấu hình biến môi trường cho Frontend:**
    - Trong thư mục `ClientApp`, tạo một file tên là `.env.development.local`.
    - Thêm dòng sau vào file, đảm bảo URL trỏ đúng đến địa chỉ API backend đang chạy.
    ```
    REACT_APP_API_BASE_URL=https://localhost:7032
    ```

4.  **Chạy Frontend:**
    ```bash
    npm start
    ```
    Ứng dụng React sẽ tự động mở trong trình duyệt tại `http://localhost:3000`.

## Cấu trúc dự án

(Cấu trúc dự án không đổi so với phiên bản trước)

---
*Tài liệu này đã được cập nhật với hướng dẫn cấu hình chi tiết dựa trên biến môi trường.*