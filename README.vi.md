# Nền tảng Thương mại điện tử SHN-Gear

**🌐 Language / Ngôn ngữ:**
- [English](README.md) | **Tiếng Việt** (Hiện tại)

---

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

### 🛒 **Tính năng Thương mại điện tử Cốt lõi**
- **Quản lý Sản phẩm**: Catalog toàn diện cho điện thoại, laptop và tai nghe
- **Giỏ hàng & Thanh toán**: Quy trình mua hàng được tối ưu với nhiều phương thức thanh toán
- **Quản lý Đơn hàng**: Hệ thống theo dõi và quản lý đơn hàng hoàn chỉnh
- **Hồ sơ Người dùng**: Tài khoản cá nhân hóa với lịch sử đơn hàng và preferences
- **Hệ thống Đánh giá**: Phản hồi khách hàng và đánh giá sản phẩm

### 🤖 **Hỗ trợ Khách hàng thông qua AI (Hệ thống RAG)**
Nền tảng tích hợp chatbot thông minh được hỗ trợ bởi **Google Gemini API** với khả năng **Retrieval-Augmented Generation (RAG)** có thể truy cập và truy vấn các bảng cơ sở dữ liệu sau:

#### **📊 Các Bảng Cơ sở Dữ liệu mà AI Chatbot có thể đọc:**
- **`Products`** - Thông tin sản phẩm, thông số kỹ thuật, giá cả và tình trạng có sẵn
- **`Categories`** - Danh mục sản phẩm và phân loại
- **`Brands`** - Thông tin và chi tiết thương hiệu
- **`ProductSpecifications`** - Thông số kỹ thuật chi tiết
- **`Orders`** - Trạng thái đơn hàng, theo dõi và lịch sử
- **`Reviews`** - Đánh giá và xếp hạng của khách hàng
- **`Users`** - Thông tin tài khoản và preferences người dùng
- **`ChatMessages`** & **`ChatSessions`** - Lịch sử cuộc trò chuyện và ngữ cảnh
- **`AIKnowledgeBase`** - FAQ và bài viết kiến thức được định nghĩa trước
- **`Vouchers`** - Thông tin khuyến mãi và giảm giá
- **`LoyaltyPoints`** - Dữ liệu chương trình khách hàng thân thiết

#### **🧠 Khả năng AI:**
- **Nhận diện Ý định**: Tự động phát hiện truy vấn khách hàng (tìm kiếm sản phẩm, trạng thái đơn hàng, hỗ trợ kỹ thuật, v.v.)
- **Nhận thức Ngữ cảnh**: Duy trì lịch sử cuộc trò chuyện và ngữ cảnh người dùng
- **Gợi ý Sản phẩm**: Đề xuất sản phẩm dựa trên preferences và truy vấn của người dùng
- **Hỗ trợ Thời gian thực**: Chat trực tiếp với phản hồi tự động
- **Tích hợp Cơ sở Tri thức**: Truy cập thông tin sản phẩm và chính sách toàn diện
- **Xử lý Chuyển tiếp**: Chuyển giao liền mạch các truy vấn phức tạp cho nhân viên

### 💳 **Thanh toán & Khách hàng thân thiết**
- **Nhiều Cổng Thanh toán**: PayPal, MoMo, thẻ tín dụng và COD
- **Chương trình Khách hàng thân thiết**: Hệ thống điểm với phần thưởng vòng quay
- **Hệ thống Voucher**: Mã giảm giá và ưu đãi khuyến mãi

### 🎨 **UI/UX Hiện đại**
- **Thiết kế Responsive**: Tối ưu cho mọi thiết bị sử dụng Tailwind CSS
- **Cập nhật Thời gian thực**: Thông báo trực tiếp qua SignalR
- **Dashboard Quản trị**: Giao diện quản lý toàn diện

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

## 🤖 AI Chatbot & Hệ thống RAG

### Tổng quan
Nền tảng SHN-Gear tích hợp chatbot AI tiên tiến sử dụng **Retrieval-Augmented Generation (RAG)** để cung cấp hỗ trợ khách hàng thông minh. Hệ thống kết hợp sức mạnh của Google Gemini API với cơ sở tri thức toàn diện để đưa ra các phản hồi chính xác và phù hợp ngữ cảnh.

### Các Bảng Cơ sở Dữ liệu mà AI có thể truy cập
Chatbot có thể đọc và truy vấn các bảng cơ sở dữ liệu sau để cung cấp hỗ trợ toàn diện:

| Bảng | Mục đích | Sử dụng AI |
|------|----------|------------|
| `Products` | Catalog sản phẩm | Gợi ý sản phẩm, thông số kỹ thuật, giá cả |
| `Categories` | Phân loại sản phẩm | Tìm kiếm và lọc theo danh mục |
| `Brands` | Thông tin thương hiệu | Truy vấn và so sánh thương hiệu |
| `ProductSpecifications` | Chi tiết kỹ thuật | Hỗ trợ kỹ thuật chi tiết và so sánh |
| `Orders` | Quản lý đơn hàng | Trạng thái, theo dõi, lịch sử đơn hàng |
| `Reviews` | Phản hồi khách hàng | Đánh giá chất lượng và gợi ý sản phẩm |
| `Users` | Hồ sơ người dùng | Gợi ý cá nhân hóa và hỗ trợ |
| `ChatMessages` & `ChatSessions` | Dữ liệu cuộc trò chuyện | Duy trì ngữ cảnh và luồng trò chuyện |
| `AIKnowledgeBase` | FAQ và chính sách | Phản hồi chuẩn và thông tin chính sách |
| `Vouchers` | Khuyến mãi | Thông tin giảm giá và ưu đãi |
| `LoyaltyPoints` | Chương trình khách hàng thân thiết | Số dư điểm và thông tin phần thưởng |

### Cách hoạt động
1. **Nhận diện Ý định**: AI phân tích tin nhắn người dùng để hiểu ý định
2. **Truy xuất Tri thức**: Hệ thống truy vấn các bảng dữ liệu và cơ sở tri thức liên quan
3. **Xây dựng Ngữ cảnh**: Kết hợp thông tin truy xuất với lịch sử cuộc trò chuyện
4. **Tạo Phản hồi**: Google Gemini tạo ra phản hồi phù hợp ngữ cảnh và chính xác
5. **Đánh giá Độ tin cậy**: Hệ thống đánh giá chất lượng phản hồi và chuyển tiếp khi cần

### Khả năng chính
- **Tìm kiếm Sản phẩm Thời gian thực**: Gợi ý và so sánh sản phẩm tức thì
- **Hỗ trợ Đơn hàng**: Kiểm tra trạng thái, theo dõi và thông tin giao hàng
- **Hỗ trợ Kỹ thuật**: Thông số kỹ thuật chi tiết và khắc phục sự cố
- **Thông tin Chính sách**: Vận chuyển, đổi trả, bảo hành và thanh toán
- **Bộ nhớ Cuộc trò chuyện**: Duy trì ngữ cảnh trong suốt cuộc trò chuyện
- **Xử lý Chuyển tiếp**: Chuyển giao liền mạch cho nhân viên khi cần thiết

## Cấu trúc dự án

```
SHNGear-2/
├── 📁 Controllers/           # API Controllers
│   ├── AuthController.cs     # Xác thực & ủy quyền
│   ├── ProductsController.cs # Quản lý sản phẩm
│   ├── ChatController.cs     # Chức năng AI Chat
│   ├── OrderController.cs    # Xử lý đơn hàng
│   └── ...                   # Các API endpoints khác
│
├── 📁 Services/              # Lớp Logic Nghiệp vụ
│   ├── AIService.cs          # Xử lý AI cốt lõi & nhận diện ý định
│   ├── GeminiService.cs      # Tích hợp Google Gemini API
│   ├── ChatService.cs        # Quản lý chat & SignalR
│   ├── KnowledgeBaseService.cs # Truy xuất kiến thức RAG
│   └── ...                   # Các dịch vụ nghiệp vụ khác
│
├── 📁 Models/                # Models Cơ sở Dữ liệu
│   ├── Products.cs           # Entity sản phẩm
│   ├── AIKnowledgeBase.cs    # Cơ sở tri thức AI
│   ├── ChatMessage.cs        # Tin nhắn chat
│   ├── ChatSession.cs        # Phiên chat
│   └── ...                   # Các entities khác
│
├── 📁 Data/                  # Database Context & Knowledge Base
│   ├── AppDbContext.cs       # EF Core database context
│   └── WebsiteKnowledgeBase.json # File cơ sở tri thức AI
│
├── 📁 ClientApp/             # React Frontend
│   ├── src/
│   │   ├── components/       # React components tái sử dụng
│   │   ├── pages/           # Page components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # Tích hợp API
│   │   └── utils/           # Utility functions
│   └── ...
│
├── 📁 Hubs/                  # SignalR Hubs
│   └── ChatHub.cs           # Giao tiếp chat thời gian thực
│
├── 📁 Migrations/            # EF Core Database Migrations
├── 📁 DTOs/                  # Data Transfer Objects
├── 📁 Configuration/         # Cấu hình ứng dụng
└── 📁 Docs/                  # Tài liệu
    ├── 06_AI_Chat_Service.md # Tài liệu dịch vụ AI
    └── ...                   # Các file tài liệu khác
```

---

## 📚 Tài liệu Bổ sung

- **[Tài liệu Dịch vụ AI Chat](Docs/06_AI_Chat_Service.md)** - Chi tiết implementation dịch vụ AI
- **[Tài liệu Frontend](Docs/Frontend/)** - React components và quản lý state
- **[Dịch vụ Backend](Docs/09_Backend_Services_And_Middleware.md)** - Kiến trúc lớp service

## 🤝 Đóng góp

Chúng tôi hoan nghênh các đóng góp! Vui lòng đọc hướng dẫn đóng góp và quy tắc ứng xử trước khi gửi pull requests.

## 📄 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT - xem file LICENSE để biết chi tiết.

---

**🌐 Language / Ngôn ngữ:**
- [English](README.md) | **Tiếng Việt** (Hiện tại)

*Tài liệu này cung cấp hướng dẫn cài đặt toàn diện và chi tiết kỹ thuật cho nền tảng thương mại điện tử SHN-Gear với hỗ trợ khách hàng bằng AI.*