# Ghi chú Tích hợp Chatbot AI (RAG)

Đây là tài liệu ghi lại quá trình nâng cấp và tích hợp hệ thống chatbot AI với phương pháp Retrieval-Augmented Generation (RAG).

## Giai đoạn 1: Phân tích và Triển khai RAG cơ bản

**Ngày:** 21/07/2025

### Các thay đổi đã thực hiện:

1.  **Tạo `KnowledgeBaseService.cs`:**
    *   **Mục đích:** Dịch vụ này chịu trách nhiệm đọc dữ liệu trực tiếp từ cơ sở dữ liệu (cụ thể là các bảng `Products`, `Categories`, `Brands`) để xây dựng một cơ sở tri thức (knowledge base) về sản phẩm.
    *   **Cơ chế:** Dữ liệu sản phẩm được định dạng thành một chuỗi văn bản có cấu trúc, mô tả chi tiết từng sản phẩm (tên, loại, thương hiệu, mô tả, giá cả).
    *   **Caching:** Kết quả được cache trong 15 phút để giảm tải cho database và tăng tốc độ phản hồi.

2.  **Cập nhật `AIService.cs`:**
    *   `KnowledgeBaseService` đã được inject vào `AIService`.
    *   Phương thức `HandleWithGeminiAI` được sửa đổi để:
        *   Gọi `_knowledgeBaseService.GetProductKnowledgeAsync()` để lấy thông tin sản phẩm mới nhất.
        *   Chèn toàn bộ kiến thức sản phẩm này vào phần ngữ cảnh (context) của prompt gửi đến Gemini API.
    *   **Kết quả:** AI giờ đây có khả năng trả lời các câu hỏi của người dùng (`intent: general`) dựa trên dữ liệu sản phẩm thực tế có trong hệ thống.

3.  **Cập nhật `ChatService.cs`:**
    *   Kích hoạt lại việc gọi đến `AIService` bằng cách inject và gọi phương thức `ProcessAIResponse`.
    *   Luồng xử lý AI đã được phục hồi, cho phép các tin nhắn của người dùng được `AIService` xử lý.

4.  **Cập nhật `Program.cs`:**
    *   Đăng ký `KnowledgeBaseService` và `AIService` vào container dependency injection của ứng dụng, cho phép các dịch vụ khác sử dụng chúng.

### Kiến trúc luồng dữ liệu RAG:

```
Người dùng -> ChatController -> ChatService -> AIService
                                                  |
                                                  v
                                     KnowledgeBaseService -> Database (Products)
                                                  |
                                                  v
[Product Knowledge] + [User Query] -> GeminiService -> Gemini API -> [Câu trả lời]
```

### Bước tiếp theo:

*   Triển khai cơ chế quản lý giới hạn token và duy trì lịch sử hội thoại.

---

## Giai đoạn 2: Quản lý Ngữ cảnh và Tóm tắt Hội thoại

**Ngày:** 21/07/2025

### Vấn đề:

Khi cuộc trò chuyện kéo dài, việc gửi toàn bộ lịch sử cho mô hình AI sẽ gây tốn kém và có thể vượt quá giới hạn token cho phép, dẫn đến mất ngữ cảnh.

### Giải pháp:

Triển khai cơ chế tóm tắt hội thoại tự động để duy trì ngữ cảnh mà không cần gửi toàn bộ lịch sử.

### Các thay đổi đã thực hiện:

1.  **Cập nhật `GeminiService.cs`:**
    *   Đã thêm một phương thức mới: `SummarizeConversationAsync(string conversationHistory)`.
    *   **Mục đích:** Phương thức này nhận một chuỗi lịch sử hội thoại, tạo một prompt chuyên dụng để yêu cầu Gemini tóm tắt, và trả về một bản tóm tắt ngắn gọn.

2.  **Cập nhật `AIService.cs`:**
    *   Phương thức `ProcessMessageAsync` giờ đây sẽ tải toàn bộ lịch sử tin nhắn của phiên chat hiện tại từ database.
    *   Phương thức `HandleWithGeminiAI` được nâng cấp để xây dựng một ngữ cảnh "thông minh":
        *   **Ngưỡng tóm tắt:** Nếu cuộc trò chuyện có nhiều hơn 10 tin nhắn, dịch vụ sẽ tự động gọi `SummarizeConversationAsync`.
        *   **Xây dựng Prompt:** Prompt mới gửi đến Gemini bao gồm 4 phần, theo thứ tự ưu tiên:
            1.  **Kiến thức sản phẩm:** Dữ liệu từ `KnowledgeBaseService`.
            2.  **Bản tóm tắt:** Tóm tắt các phần cũ của cuộc trò chuyện (nếu có).
            3.  **Tin nhắn gần đây:** 6 tin nhắn cuối cùng để AI nắm bắt diễn biến tức thời.
            4.  **Bối cảnh hiện tại:** Thông tin về người dùng, từ khóa, v.v.

### Kiến trúc luồng dữ liệu mới:

```
(Lịch sử > 10 tin nhắn)
Lịch sử cũ -> GeminiService.SummarizeConversationAsync -> [Bản tóm tắt]

[Bản tóm tắt] + [Tin nhắn gần đây] + [Kiến thức sản phẩm] + [User Query] -> GeminiService -> Gemini API -> [Câu trả lời]
```

### Kết quả:

*   Hệ thống có thể xử lý các cuộc trò chuyện dài mà không bị mất ngữ cảnh.
*   Tối ưu hóa số lượng token gửi đến API, giúp tiết kiệm chi phí và tăng tốc độ phản hồi.
*   Hoàn thành yêu cầu về quản lý token và duy trì hội thoại trong `chatbox.md`.
