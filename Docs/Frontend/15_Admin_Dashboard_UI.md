# Module 15: Giao diện Trang Quản trị (Admin Dashboard UI)

Trang quản trị là một ứng dụng con (sub-application) phức tạp bên trong hệ thống React, cung cấp cho quản trị viên các công cụ mạnh mẽ để quản lý toàn bộ website.

## 1. Bố cục (Layout)

*   Giao diện trang quản trị thường có một bố cục cố định, bao gồm:
    *   **Sidebar (Thanh bên):** Một thanh điều hướng dọc ở bên trái, chứa các liên kết đến các trang quản lý khác nhau (Tổng quan, Sản phẩm, Đơn hàng, Người dùng, v.v.). Sidebar này giúp admin dễ dàng chuyển đổi giữa các chức năng.
    *   **Header (Đầu trang):** Một thanh ngang ở trên cùng, thường chứa tên của trang hiện tại, thông tin tài khoản admin, và nút đăng xuất.
    *   **Content Area (Vùng nội dung):** Phần không gian chính ở giữa, nơi nội dung của trang quản lý tương ứng (ví dụ: bảng danh sách sản phẩm, form chỉnh sửa đơn hàng) được hiển thị.

## 2. Thư viện Component chính

*   **Ant Design (`antd`):** Đây là thư viện UI được sử dụng chủ yếu và mạnh mẽ nhất trong trang quản trị. Các component của Ant Design rất phù hợp cho việc xây dựng các giao diện quản lý phức tạp:
    *   **`Table`:** Dùng để hiển thị dữ liệu dạng bảng (danh sách sản phẩm, đơn hàng, người dùng) với các tính năng tích hợp sẵn như sắp xếp, lọc, và phân trang.
    *   **`Form`:** Dùng để xây dựng các form thêm mới hoặc chỉnh sửa dữ liệu một cách nhanh chóng và mạnh mẽ, tích hợp tốt với `react-hook-form`.
    *   **`Modal`:** Hiển thị các hộp thoại xác nhận (ví dụ: "Bạn có chắc chắn muốn xóa?") hoặc các form chỉnh sửa nhanh.
    *   **`DatePicker`, `Select`, `Input`, `Button`:** Các component form cơ bản.
    *   **`Menu`:** Dùng để xây dựng thanh Sidebar.
    *   **`Card`, `Statistic`:** Dùng để hiển thị các số liệu thống kê trên trang tổng quan.

*   **Recharts:** Thư viện dùng để vẽ các biểu đồ (đường, cột, tròn) để trực quan hóa dữ liệu doanh thu, tăng trưởng người dùng trên trang tổng quan và phân tích.

## 3. Các Trang Quản trị Tiêu biểu

*   **Trang Tổng quan (`OverviewPage`)**
    *   Sử dụng các component `Card` và `Statistic` của Ant Design để hiển thị các con số quan trọng (doanh thu, số đơn hàng, người dùng mới).
    *   Sử dụng `Recharts` để vẽ các biểu đồ về xu hướng doanh thu theo thời gian.

*   **Trang Quản lý Sản phẩm/Đơn hàng/Người dùng (`ProductsPage`, `OrdersPage`, `UsersPage`)**
    *   **Thành phần chính:** Component `Table` của Ant Design.
    *   **Chức năng:**
        *   Hiển thị danh sách dữ liệu với các cột thông tin quan trọng.
        *   Cột "Hành động" (Action) chứa các nút để thực hiện các thao tác như Sửa, Xóa, Xem chi tiết.
        *   Nút "Thêm mới" ở trên cùng để mở một trang hoặc một modal chứa form tạo mới.
        *   Có các bộ lọc (filter) và thanh tìm kiếm để người dùng dễ dàng tìm thấy dữ liệu cần thiết.

*   **Trang Quản lý Trang chủ (`ManageHomePage`, `PinnedProductKanban`)**
    *   Đây là một trang có độ phức tạp cao, có thể sử dụng các thư viện như `react-beautiful-dnd` (kéo-thả) để cho phép admin sắp xếp thứ tự xuất hiện của các module trên trang chủ hoặc quản lý danh sách sản phẩm được ghim theo dạng bảng Kanban (Trello-like).

*   **Trang Soạn thảo Blog (`BlogPostEditor`)**
    *   Sử dụng một trình soạn thảo văn bản WYSIWYG (What You See Is What You Get) như `react-quill` để admin có thể soạn thảo nội dung bài viết một cách trực quan, với các tùy chọn định dạng như in đậm, in nghiêng, chèn ảnh, v.v.

## 4. Luồng dữ liệu

1.  Khi admin điều hướng đến một trang (ví dụ: `/admin/products`), component `ProductsPage` sẽ được mount.
2.  Bên trong `useEffect`, component sẽ gọi một hàm từ service tương ứng (ví dụ: `productService.getAllProducts()`).
3.  Dữ liệu trả về từ API sẽ được lưu vào state của component.
4.  Component `Table` của Ant Design nhận dữ liệu này qua props và hiển thị ra giao diện.
5.  Khi admin thực hiện một hành động (ví dụ: nhấn nút xóa), một hàm xử lý sự kiện sẽ được gọi. Hàm này sẽ gọi đến API tương ứng (ví dụ: `productService.deleteProduct(id)`), và sau khi thành công, nó sẽ gọi lại hàm lấy dữ liệu để cập nhật lại bảng, đảm bảo dữ liệu trên giao diện luôn mới nhất.
