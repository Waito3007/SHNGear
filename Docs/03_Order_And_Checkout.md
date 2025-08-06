# Module 3: Đơn hàng và Thanh toán

Module này xử lý toàn bộ quy trình từ khi người dùng thêm sản phẩm vào giỏ hàng cho đến khi hoàn tất đơn hàng và thanh toán thành công. Đây là một module phức tạp, tích hợp với nhiều dịch vụ bên ngoài như MoMo và PayPal.

## 1. Các Controllers liên quan

*   `CartController.cs`: Quản lý giỏ hàng cho cả người dùng đã đăng nhập và khách.
*   `OrderController.cs`: Xử lý việc tạo, cập nhật, xem và quản lý đơn hàng. Tích hợp với MoMo và dịch vụ email.
*   `PayPalController.cs`: Xử lý luồng thanh toán qua PayPal.
*   `PaymentMethodController.cs`: Quản lý các phương thức thanh toán được hỗ trợ.

## 2. Chức năng chính

### 2.1. Quản lý Giỏ hàng (`/api/cart/...`)

*   **Mô tả:** Cho phép người dùng thêm, xem, cập nhật và xóa sản phẩm trong giỏ hàng.
*   **Hỗ trợ cả khách và người dùng đã đăng nhập:**
    *   **Khách (Guest):** Giỏ hàng được lưu trong `Session` của trình duyệt.
    *   **Người dùng đã đăng nhập (Logged-in User):** Giỏ hàng được lưu vào database, liên kết với `UserId`.
*   **Các endpoints chính:**
    *   `POST /api/cart`: Thêm một sản phẩm (với `productVariantId` và `quantity`) vào giỏ hàng.
    *   `GET /api/cart?userId=...`: Lấy thông tin chi tiết giỏ hàng. Nếu `userId` được cung cấp, lấy từ database; nếu không, lấy từ session.
    *   `PUT /api/cart/update`: Cập nhật số lượng của một sản phẩm trong giỏ hàng.
    *   `DELETE /api/cart/remove/{productVariantId}`: Xóa một sản phẩm khỏi giỏ hàng.
    *   `DELETE /api/cart/clear`: Xóa toàn bộ sản phẩm trong giỏ hàng.

### 2.2. Quy trình Đặt hàng (`/api/orders/...`)

*   **Mô tả:** Xử lý logic phức tạp của việc tạo một đơn hàng mới.
*   **Endpoint chính:** `POST /api/orders`
*   **Input:** `OrderDto` (chứa `UserId`, `AddressId`, `PaymentMethodId`, `VoucherId`, và danh sách `OrderItems`).
*   **Logic cốt lõi:**
    1.  **Bắt đầu một transaction:** Để đảm bảo tính toàn vẹn dữ liệu.
    2.  **Xác thực dữ liệu:** Kiểm tra người dùng, voucher, và đặc biệt là số lượng tồn kho (`StockQuantity`) của từng sản phẩm.
    3.  **Tạo bản ghi `Order`:** Lưu thông tin đơn hàng vào database với trạng thái ban đầu là `Pending` (cho COD) hoặc `WaitingForPayment` (cho thanh toán online).
    4.  **Tạo các bản ghi `OrderItem`:** Lưu chi tiết các sản phẩm trong đơn hàng.
    5.  **Trừ số lượng tồn kho:** Cập nhật `StockQuantity` của các `ProductVariant` tương ứng.
    6.  **Xử lý thanh toán online (nếu có):**
        *   **MoMo (`PaymentMethodId = 2`):** Gọi `MoMoPaymentService` để tạo yêu cầu thanh toán và trả về `payUrl` cho client.
        *   **PayPal (`PaymentMethodId = 3`):** Luồng này được xử lý bởi `PayPalController`.
    7.  **Xử lý voucher:** Đánh dấu voucher là đã sử dụng (`IsUsed = true`).
    8.  **Xóa giỏ hàng:** Xóa các sản phẩm đã mua khỏi giỏ hàng của người dùng.
    9.  **Gửi Email:** Gửi email xác nhận đơn hàng cho người dùng.
    10. **Commit transaction:** Nếu tất cả các bước thành công.

### 2.3. Tích hợp Thanh toán

*   **MoMo:**
    *   `POST /api/orders`: Khi người dùng chọn MoMo, backend tạo yêu cầu và trả về URL thanh toán.
    *   `POST /api/orders/momo/callback`: Endpoint để MoMo gọi lại sau khi người dùng hoàn tất thanh toán. Backend sẽ xác thực chữ ký, cập nhật trạng thái đơn hàng thành `Paid` hoặc `PaymentFailed`.
*   **PayPal (`/api/paypal/...`):
    *   `POST /api/paypal/create-order`: Tạo đơn hàng trong database và sau đó tạo một yêu cầu thanh toán tới PayPal. Trả về `approvalUrl`.
    *   `GET /api/paypal/capture-order`: Sau khi người dùng xác nhận thanh toán trên trang PayPal, họ sẽ được chuyển hướng về URL này. Backend sẽ "capture" giao dịch và cập nhật trạng thái đơn hàng thành `Paid`.

### 2.4. Quản lý Đơn hàng (Admin)

*   **Mô tả:** Cung cấp các công cụ cho admin để theo dõi và xử lý đơn hàng.
*   **Các endpoints:**
    *   `GET /api/orders`: Lấy danh sách tất cả đơn hàng.
    *   `GET /api/orders/{id}/details`: Lấy thông tin chi tiết của một đơn hàng.
    *   `PUT /api/orders/{id}/status`: Cập nhật trạng thái đơn hàng (ví dụ: từ `Pending` sang `Delivered`). Khi chuyển sang `Delivered`, hệ thống sẽ tự động cộng điểm thưởng cho người dùng.
    *   `GET /api/orders/user/{userId}`: Lấy tất cả đơn hàng của một người dùng cụ thể.
    *   `GET /api/orders/export/excel/{orderId}`: Xuất hóa đơn ra file Excel.
    *   `GET /api/orders/export/image/{orderId}`: Xuất hóa đơn ra file ảnh PNG.
    *   `GET /api/orders/export/template/{orderId}`: Xuất hóa đơn ra file PDF.

### 2.5. Thống kê Doanh thu (Admin)

*   Module này cung cấp nhiều endpoints để admin theo dõi tình hình kinh doanh:
    *   `GET /api/orders/revenue/day`, `/week`, `/month`, `/year`: Lấy tổng doanh thu theo các khoảng thời gian.
    *   `GET /api/orders/completed-orders`: Đếm số đơn hàng đã hoàn thành.
    *   `GET /api/orders/dashboard/sales-overview`: Lấy dữ liệu tổng quan về doanh số để vẽ biểu đồ.
    *   `GET /api/orders/sales-by-category`: Thống kê doanh số theo từng danh mục sản phẩm.

## 3. Các DTOs liên quan

*   `CartDto`: Dữ liệu cho một item trong giỏ hàng.
*   `OrderDto`: Dữ liệu đầy đủ để tạo một đơn hàng mới.
*   `OrderItemDto`: Dữ liệu cho một sản phẩm trong đơn hàng.
*   `UpdateStatusDto`: Dùng để cập nhật trạng thái đơn hàng.
*   `MoMoCallbackModel`: Dữ liệu MoMo gửi về callback.
*   `PayPalOrderResponse`: Dữ liệu trả về khi tạo đơn hàng PayPal.
