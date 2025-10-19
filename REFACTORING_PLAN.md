# Kế hoạch Tái cấu trúc Dự án SHN-Gear

## Mục tiêu

Mục tiêu của việc tái cấu trúc này là cải thiện cấu trúc của dự án SHN-Gear để dễ bảo trì, mở rộng và kiểm thử hơn. Chúng tôi sẽ đạt được điều này bằng cách áp dụng các mẫu thiết kế đã được thiết lập và phân tách rõ ràng các mối quan tâm.

## Kiến trúc Đề xuất

Chúng tôi sẽ áp dụng kiến trúc Lát cắt dọc (Vertical Slice Architecture) trên toàn bộ ứng dụng. Mỗi tính năng sẽ được đóng gói trong thư mục riêng, chứa tất cả các thành phần cần thiết (Controller, Service, Repository, DTOs, v.v.).

Kiến trúc này sẽ được hỗ trợ bởi các mẫu sau:

*   **Mẫu Repository:** Để trừu tượng hóa quyền truy cập dữ liệu và giảm mã lặp lại.
*   **Lớp Dịch vụ:** Để chứa logic nghiệp vụ, giữ cho các bộ điều khiển gọn gàng và tập trung vào việc xử lý các yêu cầu HTTP.
*   **Dependency Injection:** Để quản lý các phụ thuộc và thúc đẩy mã ghép nối lỏng lẻo.

## Các bước Tái cấu trúc

Việc tái cấu trúc sẽ được thực hiện theo từng tính năng để giảm thiểu sự gián đoạn và cho phép xác minh gia tăng.

1.  **Tái cấu trúc Tính năng Người dùng:**
    *   Tạo thư mục `Features/Users`.
    *   Tạo `IUserRepository` và `UserRepository`.
    *   Tạo `IUserService` và `UserService`.
    *   Di chuyển và tái cấu trúc `UsersController`, `AuthController` và `RoleController` vào lớp dịch vụ người dùng.
    *   Cập nhật `Program.cs` để đăng ký các dịch vụ và kho lưu trữ mới.

2.  **Tái cấu trúc Tính năng Đơn hàng:**
    *   Tạo thư mục `Features/Orders`.
    *   Tạo `IOrderRepository` và `OrderRepository`.
    *   Tạo `IOrderService` và `OrderService`.
    *   Di chuyển và tái cấu trúc `OrderController` và `PaymentMethodController`.
    *   Cập nhật `Program.cs`.

3.  **Tái cấu trúc Tính năng Giỏ hàng:**
    *   Tạo thư mục `Features/Carts`.
    *   Tạo `ICartRepository` và `CartRepository`.
    *   Tạo `ICartService` và `CartService`.
    *   Di chuyển và tái cấu trúc `CartController`.
    *   Cập nhật `Program.cs`.

4.  **Tái cấu trúc các Tính năng khác:**
    *   Áp dụng cùng một mẫu cho các tính năng còn lại (Blogs, Reviews, Categories, v.v.).

## Lợi ích

*   **Cải thiện Khả năng Bảo trì:** Dễ dàng tìm và sửa đổi mã liên quan đến một tính năng cụ thể.
*   **Tăng Khả năng Mở rộng:** Thêm các tính năng mới mà không ảnh hưởng đến các tính năng hiện có.
*   **Cải thiện Khả năng Kiểm thử:** Các thành phần được tách biệt có thể được kiểm thử đơn vị một cách độc lập.
*   **Cấu trúc Dự án Rõ ràng hơn:** Dễ dàng hơn cho các nhà phát triển mới hiểu và đóng góp.
