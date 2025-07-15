# Module 5: Bán hàng và Khuyến mãi

Module này bao gồm các chức năng giúp thúc đẩy doanh số và thu hút khách hàng, như quản lý voucher, banner quảng cáo, slider trang chủ và các chương trình giảm giá có giới hạn thời gian (flash sale).

## 1. Các Controllers liên quan

*   `VoucherController.cs`: Quản lý mã giảm giá (voucher).
*   `BannerController.cs`: Quản lý các banner quảng cáo.
*   `SliderController.cs`: Quản lý các slider hiển thị trên trang chủ.
*   `ProductsController.cs`: Chứa logic để quản lý chức năng Flash Sale cho sản phẩm.
*   `HomepageConfigController.cs`: Quản lý cấu hình hiển thị các thành phần trên trang chủ, bao gồm cả banner và slider.

## 2. Chức năng chính

### 2.1. Quản lý Voucher (`/api/vouchers/...`)

*   **Mô tả:** Cho phép admin tạo và quản lý các mã giảm giá. Người dùng có thể áp dụng các mã này khi thanh toán để được giảm giá.
*   **Các endpoints:**
    *   `GET /api/vouchers`: Lấy danh sách tất cả các voucher.
    *   `POST /api/vouchers`: Tạo một voucher mới.
    *   `PUT /api/vouchers/{id}`: Cập nhật thông tin voucher.
    *   `DELETE /api/vouchers/{id}`: Xóa voucher.
    *   `POST /api/vouchers/assign`: Gán một voucher cụ thể cho một người dùng (ít dùng, thường voucher có thể dùng chung).
    *   `POST /api/vouchers/apply`: Endpoint quan trọng để kiểm tra và áp dụng voucher vào đơn hàng. Hệ thống sẽ kiểm tra mã code, tính hợp lệ, và trạng thái sử dụng của voucher.

### 2.2. Quản lý Banner (`/api/banner/...`)

*   **Mô tả:** Quản lý các hình ảnh banner, thường được sử dụng để quảng bá các sự kiện, sản phẩm mới, hoặc chương trình khuyến mãi đặc biệt.
*   **Các endpoints:**
    *   `GET /api/banner`: Lấy danh sách tất cả các banner.
    *   `POST /api/banner`: Thêm một banner mới.
    *   `PUT /api/banner/{id}`: Cập nhật thông tin của một banner (tiêu đề, ảnh, link liên kết).
    *   `DELETE /api/banner/{id}`: Xóa một banner.

### 2.3. Quản lý Slider (`/api/slider/...`)

*   **Mô tả:** Quản lý các slide (thường là hình ảnh lớn) hiển thị nổi bật trên trang chủ, giúp thu hút sự chú ý của người dùng ngay từ cái nhìn đầu tiên.
*   **Các endpoints:**
    *   `GET /api/slider`: Lấy danh sách tất cả các slider.
    *   `POST /api/slider`: Thêm một slider mới.
    *   `PUT /api/slider/{id}`: Cập nhật thông tin của một slider.
    *   `DELETE /api/slider/{id}`: Xóa một slider.

### 2.4. Quản lý Flash Sale (trong `ProductsController`)

*   **Mô tả:** Cho phép thiết lập một mức giá đặc biệt cho sản phẩm trong một khoảng thời gian giới hạn, tạo cảm giác khẩn trương và thúc đẩy mua sắm.
*   **Logic:**
    *   Mỗi sản phẩm (`Product`) có các trường: `IsFlashSale` (boolean), `FlashSalePrice` (decimal?), `FlashSaleStartDate` (DateTime?), `FlashSaleEndDate` (DateTime?).
    *   Khi một sản phẩm được lấy ra, hệ thống sẽ kiểm tra xem thời gian hiện tại có nằm trong khoảng `FlashSaleStartDate` và `FlashSaleEndDate` hay không để quyết định giá hiển thị cho người dùng.
*   **Các endpoints:**
    *   `PUT /api/products/{id}/set-flash-sale`: Kích hoạt chế độ flash sale cho một sản phẩm, yêu cầu cung cấp giá và thời gian bắt đầu/kết thúc.
    *   `PUT /api/products/{id}/clear-flash-sale`: Tắt chế độ flash sale cho một sản phẩm.
    *   `GET /api/products/flash-sale`: Lấy danh sách tất cả các sản phẩm đang trong thời gian flash sale.

### 2.5. Cấu hình Trang chủ (`/api/homepage-config`)

*   **Mô tả:** Đây là một controller rất linh hoạt, cho phép admin tùy chỉnh bố cục và nội dung của trang chủ mà không cần can thiệp vào code.
*   **Logic:**
    *   Lưu trữ một cấu hình JSON lớn trong database.
    *   Cấu hình này định nghĩa thứ tự xuất hiện của các thành phần (hero section, slider, banner, danh mục, sản phẩm bán chạy...) và nội dung chi tiết cho từng thành phần.
*   **Endpoints:**
    *   `GET /api/homepage-config`: Lấy cấu hình trang chủ hiện tại.
    *   `PUT /api/homepage-config`: Cập nhật toàn bộ cấu hình trang chủ.

## 3. Các DTOs liên quan

*   `VoucherDto`: Thông tin của một voucher.
*   `ApplyVoucherDto`: Dữ liệu để áp dụng voucher, chứa `Code` và `UserId`.
*   `BannerDto`: Thông tin của một banner.
*   `SliderDto`: Thông tin của một slider.
*   `FlashSaleUpdateDto`: Dữ liệu để thiết lập flash sale cho sản phẩm.
*   `HomepageConfigDto`: Cấu trúc dữ liệu JSON phức tạp để định nghĩa trang chủ.
