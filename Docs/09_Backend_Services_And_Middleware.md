# Module 9: Dịch vụ Backend và Middleware

Module này đi sâu vào các lớp logic nghiệp vụ cốt lõi (Services) và các thành phần xử lý yêu cầu ở tầng giữa (Middleware) của hệ thống backend. Đây là nơi các quy tắc kinh doanh được thực thi và các yêu cầu được xử lý trước khi đến các controllers.

## 1. Lớp Dịch vụ (Services)

Thư mục `Services` chứa các lớp (classes) chịu trách nhiệm thực thi logic nghiệp vụ cụ thể. Các controllers thường ủy quyền các tác vụ phức tạp cho các service này.

*   **`AIService.cs`:**
    *   **Chức năng:** Trái tim của hệ thống AI Chat. Xử lý tin nhắn người dùng, phát hiện ý định, trích xuất thực thể, tìm kiếm trong cơ sở tri thức, tính toán độ tin cậy của câu trả lời, và quyết định khi nào cần chuyển tiếp cuộc trò chuyện đến admin. Tích hợp với `GeminiService` để tạo phản hồi AI.
    *   **Phụ thuộc:** `AppDbContext`, `ILogger`, `ContextManager`, `GeminiService`, `IConfiguration`.

*   **`BlogPostService.cs`:**
    *   **Chức năng:** Quản lý các hoạt động CRUD (Create, Read, Update, Delete) cho các bài viết blog, bao gồm việc lấy danh sách, chi tiết, tạo mới, cập nhật và xóa bài viết.
    *   **Phụ thuộc:** `AppDbContext`.

*   **`ChatService.cs`:**
    *   **Chức năng:** Quản lý các phiên chat và tin nhắn. Xử lý việc tạo/lấy session, gửi tin nhắn từ người dùng và admin, và thông báo tin nhắn mới theo thời gian thực qua SignalR.
    *   **Phụ thuộc:** `AppDbContext`, `ILogger`, `IHubContext<ChatHub>`.

*   **`CloudinaryService.cs`:**
    *   **Chức năng:** Cung cấp các phương thức để tải lên và xóa hình ảnh từ dịch vụ lưu trữ đám mây Cloudinary.
    *   **Phụ thuộc:** `IConfiguration` (để lấy thông tin cấu hình Cloudinary).

*   **`ContextManager.cs`:**
    *   **Chức năng:** Quản lý ngữ cảnh (context) của các cuộc trò chuyện AI. Lưu trữ lịch sử tin nhắn, thông tin người dùng, các chủ đề và thực thể đã được đề cập để AI có thể duy trì ngữ cảnh và đưa ra phản hồi phù hợp.
    *   **Phụ thuộc:** `AppDbContext`, `ILogger`.

*   **`DatabaseSeeder.cs`:**
    *   **Chức năng:** Chứa logic để khởi tạo dữ liệu ban đầu cho database khi ứng dụng khởi động, đặc biệt là dữ liệu cho cơ sở tri thức AI (`AIKnowledgeBase`).
    *   **Phụ thuộc:** `AppDbContext`, `ILogger`.

*   **`EmailService.cs`:**
    *   **Chức năng:** Cung cấp các phương thức để gửi email, bao gồm gửi mã OTP (One-Time Password) cho xác thực và gửi email xác nhận đơn hàng cho khách hàng.
    *   **Phụ thuộc:** `IConfiguration` (để lấy thông tin cấu hình SMTP).

*   **`GeminiService.cs`:**
    *   **Chức năng:** Giao tiếp với API của Google Gemini để tạo ra các phản hồi AI thông minh. Nó xây dựng các prompt dựa trên tin nhắn người dùng và ngữ cảnh, gửi yêu cầu đến Gemini, và xử lý phản hồi. Có cơ chế caching để tối ưu hiệu suất.
    *   **Phụ thuộc:** `HttpClient`, `IConfiguration`, `ILogger`, `IMemoryCache`.

*   **`JwtService.cs`:**
    *   **Chức năng:** Tạo và quản lý JSON Web Tokens (JWT) được sử dụng để xác thực và ủy quyền người dùng trong hệ thống.
    *   **Phụ thuộc:** `IConfiguration` (để lấy khóa bí mật JWT).

*   **`KnowledgeBaseSeeder.cs`:**
    *   **Chức năng:** Cung cấp dữ liệu mặc định cho cơ sở tri thức AI (`AIKnowledgeBase`), bao gồm các câu hỏi thường gặp, thông tin sản phẩm, chính sách, v.v.

*   **`LoyaltySpinService.cs`:**
    *   **Chức năng:** Quản lý hệ thống điểm khách hàng thân thiết và vòng quay may mắn. Bao gồm cập nhật điểm người dùng, lấy cấu hình vòng quay, quản lý vật phẩm và xử lý logic quay thưởng.
    *   **Phụ thuộc:** `AppDbContext`.

*   **`MoMoPaymentService.cs`:**
    *   **Chức năng:** Tích hợp với cổng thanh toán MoMo. Cung cấp phương thức để tạo yêu cầu thanh toán và xác minh chữ ký từ callback của MoMo.
    *   **Phụ thuộc:** `IConfiguration`.

*   **`PayPalService.cs`:**
    *   **Chức năng:** Tích hợp với cổng thanh toán PayPal. Cung cấp phương thức để tạo và capture các đơn hàng PayPal.
    *   **Phụ thuộc:** `IConfiguration`, `ILogger`.

*   **`UserService.cs`:**
    *   **Chức năng:** Xử lý các logic nghiệp vụ liên quan đến người dùng như đăng ký, xác thực, mã hóa mật khẩu, kiểm tra email tồn tại, lấy thông tin người dùng và cập nhật hồ sơ.
    *   **Phụ thuộc:** `AppDbContext`.

*   **`KnowledgeExportService.cs`:**
    *   **Chức năng:** Cung cấp các phương thức để xuất toàn bộ cơ sở tri thức AI ra định dạng JSON và nhập lại từ file JSON.
    *   **Phụ thuộc:** `AppDbContext`.

## 2. Lớp Middleware

Thư mục `Middleware` chứa các thành phần xử lý yêu cầu HTTP ở tầng giữa của pipeline ASP.NET Core. Chúng có thể kiểm tra, sửa đổi hoặc chuyển hướng các yêu cầu trước khi chúng đến được controller, hoặc xử lý phản hồi trước khi gửi về client.

*   **`CorsDebugMiddleware.cs`:**
    *   **Chức năng:** Một middleware gỡ lỗi CORS. Nó ghi lại thông tin chi tiết về các request CORS (Origin, Method, Path, Headers) và response headers vào log, giúp xác định nguyên nhân lỗi CORS trong quá trình phát triển.

*   **`GlobalCorsMiddleware.cs`:**
    *   **Chức năng:** Áp dụng các header CORS chung cho tất cả các request. Nó kiểm tra `Origin` của request có nằm trong danh sách các `_allowedOrigins` được cấu hình hay không và xử lý các request `OPTIONS` (preflight requests).

*   **`HeaderLoggingMiddleware.cs`:**
    *   **Chức năng:** Ghi lại tất cả các header của request và response, đặc biệt tập trung vào các request đến `/chatHub`. Hữu ích cho việc gỡ lỗi các vấn đề liên quan đến header, đặc biệt là với SignalR.

*   **`SignalRCorsMiddleware.cs`:**
    *   **Chức năng:** Được thiết kế đặc biệt để xử lý các request CORS đến SignalR Hub (`/chatHub`). Nó đảm bảo rằng các header CORS cần thiết cho SignalR (bao gồm `x-signalr-user-agent`) được thiết lập đúng cách.

*   **`SignalRNegotiationCorsMiddleware.cs`:**
    *   **Chức năng:** Tập trung vào việc xử lý các request `negotiate` của SignalR (`/chatHub/negotiate`). Nó đảm bảo các header CORS cần thiết được thiết lập đúng cách cho quá trình thương lượng kết nối SignalR.

*   **`SimpleRateLimitMiddleware.cs`:**
    *   **Chức năng:** Thực hiện giới hạn tốc độ (rate limiting) cho các request đến `/api/chat` và `/api/gemini`. Nó theo dõi số lượng request từ mỗi IP trong một khoảng thời gian nhất định và trả về lỗi `429 Too Many Requests` nếu vượt quá giới hạn.

*   **`UnifiedCorsMiddleware.cs`:**
    *   **Chức năng:** Một middleware CORS toàn diện, có vẻ là phiên bản được ưu tiên sử dụng để xử lý tất cả các vấn đề CORS. Nó kiểm tra `Origin` và đặt các header CORS đầy đủ cho tất cả các request, bao gồm cả các header đặc thù của SignalR.

## 3. Kết luận

Lớp Services là nơi chứa logic nghiệp vụ phức tạp và quan trọng nhất của ứng dụng, trong khi lớp Middleware đảm bảo các yêu cầu được xử lý an toàn, hiệu quả và tuân thủ các chính sách như CORS và giới hạn tốc độ. Sự kết hợp của hai lớp này tạo nên một backend mạnh mẽ và có khả năng mở rộng.
