# Module 8: Các Chức năng Khác

Module này mô tả các chức năng bổ sung quan trọng, giúp tăng cường sự tương tác của người dùng và xây dựng cộng đồng xung quanh thương hiệu SHN-Gear.

## 1. Các Controllers liên quan

*   `BlogPostsController.cs`: Quản lý các bài viết blog.
*   `ReviewsController.cs`: Quản lý hệ thống đánh giá và bình luận sản phẩm.
*   `LoyaltyController.cs` & `LoyaltySpinController.cs`: Quản lý chương trình khách hàng thân thiết, điểm thưởng và vòng quay may mắn.
*   `UploadController.cs`: Xử lý việc tải lên các file media (chủ yếu là hình ảnh).

## 2. Chi tiết các chức năng

### 2.1. Hệ thống Blog (`/api/blogposts/...`)

*   **Mô tả:** Cung cấp một nền tảng để đăng tải các bài viết tin tức, thủ thuật, đánh giá chi tiết về sản phẩm công nghệ, giúp thu hút và giữ chân người dùng.
*   **Phân quyền:**
    *   **Mọi người dùng:** Có thể xem danh sách bài viết (`GET /api/blogposts`) và đọc chi tiết một bài viết (`GET /api/blogposts/{id}`).
    *   **Admin:** Có toàn quyền tạo (`POST`), cập nhật (`PUT`), và xóa (`DELETE`) bài viết. Các hành động này yêu cầu quyền `Admin`.
*   **Cấu trúc:** Mỗi bài viết (`BlogPost`) bao gồm tiêu đề, nội dung, ngày tạo, tác giả (`UserId`), và có thể có các hình ảnh liên quan (`BlogImage`).

### 2.2. Hệ thống Đánh giá Sản phẩm (`/api/review/...`)

*   **Mô tả:** Cho phép người dùng đã mua hàng để lại đánh giá (rating từ 1-5 sao) và bình luận về sản phẩm, tạo ra nội dung do người dùng tạo (UGC) và tăng độ tin cậy cho sản phẩm.
*   **Logic quan trọng:**
    *   **Chỉ người đã mua hàng mới được đánh giá:** Trước khi cho phép tạo review (`POST /api/review`), hệ thống sẽ kiểm tra xem `UserId` đó có đơn hàng nào chứa `ProductId` tương ứng và đã ở trạng thái `Delivered` hay không.
    *   **Duyệt đánh giá:** Các đánh giá mới sẽ không được hiển thị ngay. Chúng cần được admin duyệt qua. Admin có thể duyệt (`PUT /api/review/{id}/approve`) hoặc từ chối (`PUT /api/review/{id}/reject`) một đánh giá.
*   **Endpoints:**
    *   `GET /api/review/product/{productId}`: Lấy danh sách các đánh giá đã được duyệt của một sản phẩm.
    *   `GET /api/review/product/{productId}/stats`: Lấy các thống kê chi tiết về đánh giá của sản phẩm (điểm trung bình, phân phối sao, số lượng review...).
    *   `POST /api/review`: Người dùng gửi đánh giá mới.
    *   `GET /api/review/all`: (Admin) Xem tất cả các đánh giá với bộ lọc (theo trạng thái duyệt, rating, sản phẩm...).

### 2.3. Chương trình Khách hàng thân thiết & Vòng quay May mắn (Loyalty)

*   **Mô tả:** Một hệ thống phức hợp để thưởng cho các khách hàng trung thành, khuyến khích họ quay trở lại mua sắm.
*   **Hệ thống Điểm và Hạng (`LoyaltyController`):**
    *   Người dùng tích điểm khi mua hàng (ví dụ: 500 điểm cho mỗi đơn hàng `Delivered`).
    *   Dựa trên số điểm, người dùng được xếp hạng (VIP 0, VIP 1, VIP 2, VIP 3).
    *   Hạng càng cao, ưu đãi càng lớn.
    *   Endpoint `GET /api/loyalty/my-status?userId=...` cho phép người dùng xem hạng, điểm và điểm cần thiết để lên hạng tiếp theo.
*   **Vòng quay May mắn (`LoyaltySpinController` & `LoyaltyController`):**
    *   Người dùng có thể dùng điểm tích lũy để tham gia vòng quay may mắn.
    *   Chi phí cho mỗi lượt quay phụ thuộc vào hạng của người dùng (`CalculateSpinCost`).
    *   Phần thưởng (thường là voucher giảm giá) cũng phụ thuộc vào hạng (`GenerateRandomPrize`).
    *   Endpoint `POST /api/loyalty/spin-wheel?userId=...` xử lý logic quay, trừ điểm và trả về phần thưởng.
    *   `LoyaltySpinController` cung cấp các API để admin cấu hình vòng quay (chi phí, phần thưởng, v.v.).

### 2.4. Tải lên Hình ảnh (`/api/upload/...`)

*   **Mô tả:** Một controller tiện ích cung cấp API để tải lên các file hình ảnh. Các hình ảnh này sau đó có thể được sử dụng cho sản phẩm, bài viết blog, banner, slider...
*   **Logic:**
    *   Nhận file từ request `IFormFile`.
    *   Lưu file vào thư mục `wwwroot` trên server với một tên file duy nhất (thường kết hợp `DateTime.Ticks` và tên file gốc).
    *   Trả về đường dẫn URL tương đối của ảnh đã lưu (ví dụ: `/638777301336393535_iphone_16_pro_max.png`).
*   **Endpoints:**
    *   `POST /api/upload`: Tải lên một ảnh mới.
    *   `GET /api/upload`: Lấy danh sách tất cả các ảnh đã tải lên.
    *   `DELETE /api/upload/{fileName}`: Xóa một ảnh.
