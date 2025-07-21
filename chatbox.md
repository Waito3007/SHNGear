Mục tiêu:
Nâng cấp hệ thống chatbot tích hợp AI cho website hiện tại, đảm bảo khả năng truy xuất và phản hồi chính xác thông tin từ cơ sở dữ liệu của hệ thống.

Yêu cầu kỹ thuật chi tiết:

Nghiên cứu mã nguồn hiện tại:

Phân tích cấu trúc hệ thống frontend/backend.

Kiểm tra luồng dữ liệu liên quan đến chatbot và các API hiện có.

Tích hợp AI với phương pháp Retrieval-Augmented Generation (RAG):

Thiết lập pipeline RAG với khả năng truy xuất dữ liệu từ database theo truy vấn người dùng.

Dữ liệu phải được phân mảnh, xử lý và indexing tối ưu (có thể dùng FAISS hoặc Weaviate).

Triển khai cơ chế truy xuất ngữ nghĩa (semantic search) trước khi đưa dữ liệu vào mô hình language model.

Kết nối trực tiếp đến database:

AI cần có khả năng đọc toàn bộ dữ liệu từ các bảng trong CSDL (PostgreSQL, MySQL, MongoDB... tùy hệ thống).

Xây dựng cơ chế mapping schema → semantic context.

Quản lý token context và đảm bảo continuity:

Khi vượt quá giới hạn token của mô hình, cần:

Ghi dữ liệu cuộc trò chuyện tạm thời vào file chatbox.md.

Tự động resume từ chatbox.md khi người dùng quay lại.

Chất lượng & độ chính xác:

Đảm bảo AI trả lời đúng, đủ, rõ ràng các câu hỏi liên quan đến dữ liệu thật trong hệ thống.

Có thể xử lý các câu hỏi phức tạp (multi-hop reasoning) bằng cách kết hợp nhiều bảng.

Kết quả mong muốn:

Chatbot AI có thể:

Truy xuất, tổng hợp và phản hồi chính xác thông tin từ database.

Duy trì lịch sử hội thoại thông minh, không bị gián đoạn dù vượt token.

Hoạt động ổn định, có thể tích hợp vào frontend (React/Vue/NextJS...).

Lưu ý thêm:

Ưu tiên sử dụng LLM mã nguồn mở (OpenChat, LLaMA, Mistral...) nếu cần host nội bộ.

Ghi chú toàn bộ pipeline triển khai trong tài liệu integration_notes.md để tiện bảo trì.
