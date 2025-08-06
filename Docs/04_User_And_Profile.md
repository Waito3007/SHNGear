# Module 4: Quản lý Người dùng và Hồ sơ cá nhân

Module này tập trung vào các chức năng cho phép người dùng quản lý thông tin cá nhân, địa chỉ giao hàng và các hoạt động liên quan đến tài khoản của họ. Các chức năng xác thực cốt lõi đã được mô tả trong `01_Authentication.md`.

## 1. Các Controllers liên quan

*   `UserController.cs`: Ngoài các chức năng quản lý của admin, controller này cũng chứa các endpoint để người dùng tự cập nhật thông tin cá nhân và xem các thống kê.
*   `AddressController.cs`: Chuyên xử lý các hoạt động CRUD cho địa chỉ giao hàng của người dùng.
*   `AuthController.cs`: Chứa các endpoint `GET /api/auth/profile` và `PUT /api/auth/profile` để người dùng đang đăng nhập tự quản lý hồ sơ của mình.

## 2. Chức năng chính

### 2.1. Quản lý Hồ sơ cá nhân (`/api/auth/profile`)

*   **Mô tả:** Cho phép người dùng đã đăng nhập xem và chỉnh sửa thông tin cơ bản của mình.
*   **Yêu cầu:** Cần JWT hợp lệ.
*   **Endpoints:**
    *   `GET /api/auth/profile`: Trả về thông tin của người dùng đang đăng nhập (Id, FullName, Email, PhoneNumber, Gender, DateOfBirth).
    *   `PUT /api/auth/profile`: Cập nhật thông tin cá nhân dựa trên dữ liệu từ `EditProfileDto`.

### 2.2. Quản lý Địa chỉ (`/api/address/...`)

*   **Mô tả:** Cung cấp các chức năng để người dùng quản lý sổ địa chỉ của mình, phục vụ cho việc giao hàng nhanh chóng.
*   **Các endpoints:**
    *   `POST /api/address/add`: Thêm một địa chỉ mới cho người dùng.
    *   `GET /api/address/user/{userId}`: Lấy danh sách tất cả các địa chỉ của một người dùng.
    *   `GET /api/address/{id}`: Lấy thông tin chi tiết của một địa chỉ cụ thể.
    *   `PUT /api/address/update/{id}`: Cập nhật một địa chỉ đã có.
    *   `DELETE /api/address/delete/{id}`: Xóa một địa chỉ.

### 2.3. Chức năng dành cho Admin (`/api/users/...`)

*   **Mô tả:** Các chức năng này cho phép quản trị viên xem và quản lý toàn bộ người dùng trong hệ thống.
*   **Endpoints:**
    *   `GET /api/users`: Lấy danh sách toàn bộ người dùng, bao gồm cả thông tin vai trò (role).
    *   `GET /api/users/{id}`: Xem chi tiết một người dùng.
    *   `PUT /api/users/{id}`: Admin cập nhật thông tin của một người dùng bất kỳ (họ tên, email, giới tính, vai trò, trạng thái active).
    *   `PUT /api/users/{id}/role`: Thay đổi vai trò của người dùng.

### 2.4. Thống kê Người dùng (Admin)

*   **Mô tả:** Cung cấp các số liệu tổng quan về người dùng cho admin.
*   **Endpoints:**
    *   `GET /api/users/statistics`: Lấy các số liệu thống kê nhanh như tổng số người dùng, người dùng mới trong ngày, số người dùng đang hoạt động.
    *   `GET /api/users/growth`: Lấy dữ liệu về sự tăng trưởng người dùng theo từng tháng, phục vụ cho việc vẽ biểu đồ.

## 3. Các DTOs liên quan

*   `UserDto`: Dùng khi admin tạo người dùng mới.
*   `AdminUserUpdateDto`: Dùng khi admin cập nhật thông tin người dùng.
*   `EditProfileDto`: Dùng khi người dùng tự cập nhật hồ sơ của mình.
*   `AddressDto`: Dữ liệu chi tiết của một địa chỉ.
*   `CreateAddressDTO`: Dữ liệu để tạo hoặc cập nhật một địa chỉ.

## 4. Luồng hoạt động

1.  **Người dùng đăng nhập:** Sau khi đăng nhập, người dùng có thể truy cập vào trang "Tài khoản của tôi".
2.  **Xem/Cập nhật hồ sơ:** Tại đây, người dùng có thể gọi `GET /api/auth/profile` để xem thông tin và `PUT /api/auth/profile` để cập nhật.
3.  **Quản lý địa chỉ:** Người dùng vào mục "Sổ địa chỉ", hệ thống sẽ gọi `GET /api/address/user/{userId}` để hiển thị danh sách. Người dùng có thể thêm, sửa, xóa địa chỉ thông qua các endpoint tương ứng trong `AddressController`.
4.  **Thanh toán:** Khi thanh toán, danh sách địa chỉ đã lưu sẽ được hiển thị để người dùng chọn nhanh, giúp tiết kiệm thời gian nhập liệu.
