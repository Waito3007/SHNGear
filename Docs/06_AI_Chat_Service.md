# Module 6: Dịch vụ Chat AI

Module này cung cấp một hệ thống chat thông minh, cho phép người dùng tương tác với AI để được hỗ trợ, tư vấn sản phẩm, hoặc giải đáp thắc mắc. Hệ thống cũng có khả năng chuyển tiếp cuộc trò chuyện đến quản trị viên khi cần thiết.

## 1. Các Thành phần liên quan

*   **Controller:** `ChatController.cs` - Đóng vai trò là cổng vào cho các yêu cầu HTTP liên quan đến chat.
*   **Hub:** `ChatHub.cs` - Trung tâm xử lý kết nối real-time bằng SignalR, cho phép giao tiếp hai chiều giữa client và server.
*   **Services:**
    *   `ChatService.cs`: Xử lý logic nghiệp vụ chính của việc quản lý phiên chat, tin nhắn, và tương tác với AI.
    *   `AIService.cs` / `GeminiService.cs`: Chịu trách nhiệm giao tiếp với mô hình ngôn ngữ lớn (LLM - có thể là Gemini) để xử lý và tạo ra các câu trả lời từ AI.

## 2. Kiến trúc và Luồng hoạt động

1.  **Khởi tạo Phiên chat (Session):**
    *   Người dùng (cả khách và đã đăng nhập) mở cửa sổ chat trên frontend.
    *   Frontend gọi `POST /api/chat/session` để tạo hoặc lấy lại một phiên chat. Một `sessionId` duy nhất được tạo ra và trả về.
    *   Đồng thời, frontend thiết lập một kết nối SignalR tới `ChatHub`.

2.  **Gửi Tin nhắn:**
    *   Người dùng nhập tin nhắn và gửi đi.
    *   Frontend gọi `POST /api/chat/message` với `sessionId` và nội dung tin nhắn.
    *   `ChatController` chuyển yêu cầu đến `ChatService`.

3.  **Xử lý bởi AI:**
    *   `ChatService` lưu tin nhắn của người dùng vào database.
    *   `ChatService` gọi `AIService` để xử lý tin nhắn.
    *   `AIService` có thể truy vấn vào một **Knowledge Base** (cơ sở tri thức - `WebsiteKnowledgeBase.json`) chứa thông tin về sản phẩm, chính sách, v.v., để cung cấp ngữ cảnh cho AI.
    *   `AIService` gửi yêu cầu đến mô hình AI (ví dụ: Gemini) cùng với tin nhắn của người dùng và ngữ cảnh liên quan.

4.  **Nhận và Hiển thị Phản hồi:**
    *   AI trả về một câu trả lời.
    *   `AIService` nhận câu trả lời và `ChatService` lưu nó vào database.
    *   `ChatService` sử dụng `IHubContext<ChatHub>` để gửi tin nhắn phản hồi của AI đến client thông qua kết nối SignalR (`ReceiveMessage` event).
    *   Frontend nhận được tin nhắn và hiển thị trên giao diện chat.

5.  **Chuyển tiếp đến Admin (Escalation):**
    *   Nếu AI không thể giải quyết vấn đề hoặc người dùng yêu cầu nói chuyện với người thật, luồng chuyển tiếp sẽ được kích hoạt.
    *   Frontend gọi `POST /api/chat/{sessionId}/escalate`.
    *   `ChatService` cập nhật trạng thái của phiên chat thành "escalated" và thông báo cho tất cả các admin đang online thông qua SignalR (`ChatEscalated` event).

6.  **Admin Trả lời:**
    *   Admin nhận được thông báo và tham gia vào cuộc trò chuyện.
    *   Admin gửi tin nhắn thông qua `POST /{sessionId}/admin-message`.
    *   Tin nhắn của admin cũng được gửi đến người dùng qua SignalR.

## 3. Các Endpoints và Events chính

### 3.1. HTTP Endpoints (`ChatController`)

*   `POST /api/chat/session`: Tạo hoặc lấy phiên chat.
*   `POST /api/chat/message`: Gửi tin nhắn từ người dùng.
*   `POST /api/chat/{sessionId}/escalate`: Yêu cầu chuyển tiếp cuộc trò chuyện đến admin.
*   `GET /api/chat/session/{sessionId}`: Lấy lịch sử tin nhắn của một phiên chat.
*   `GET /api/chat/admin/sessions`: (Admin) Lấy danh sách các phiên chat đang hoạt động hoặc cần hỗ trợ.
*   `POST /api/chat/{sessionId}/admin-message`: (Admin) Gửi tin nhắn với tư cách admin.

### 3.2. SignalR Events (`ChatHub`)

*   **Client-side methods (Server gọi Client):**
    *   `ReceiveMessage`: Nhận một tin nhắn mới (từ AI hoặc admin).
    *   `ChatEscalated`: Nhận thông báo khi một cuộc trò chuyện được chuyển tiếp.
    *   `AdminJoined`: Nhận thông báo khi một admin tham gia cuộc trò chuyện.
*   **Server-side methods (Client gọi Server):**
    *   `JoinSession`: Client tham gia vào một "phòng" chat dựa trên `sessionId`.
    *   `JoinAdminGroup`: Admin tham gia vào nhóm "admins" để nhận thông báo.

## 4. Cơ sở tri thức (Knowledge Base)

*   Hệ thống sử dụng một file `WebsiteKnowledgeBase.json` để làm cơ sở tri thức cho AI.
*   File này chứa các thông tin có cấu trúc về:
    *   Sản phẩm (tên, mô tả, giá, thông số).
    *   Chính sách (bảo hành, đổi trả, vận chuyển).
    *   Các câu hỏi thường gặp (FAQ).
*   `AIService` sẽ đọc và xử lý file này để tạo ra các prompt (câu lệnh) hiệu quả hơn khi giao tiếp với mô hình AI, giúp câu trả lời của AI chính xác và phù hợp với ngữ cảnh của trang web.
