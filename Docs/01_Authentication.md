# Module 1: Xác thực và Quản lý người dùng

Module này chịu trách nhiệm cho tất cả các chức năng liên quan đến tài khoản người dùng, bao gồm đăng ký, đăng nhập, phân quyền và quản lý thông tin cá nhân.

## 1. Các Controllers liên quan

*   `AuthController.cs`: Xử lý đăng ký, đăng nhập, tạo JWT, và quản lý thông tin cá nhân của người dùng đang đăng nhập.
*   `UserController.cs`: Quản lý người dùng từ góc độ admin (xem danh sách, cập nhật, xóa) và các thống kê liên quan đến người dùng.
*   `RoleController.cs`: Quản lý các vai trò (roles) trong hệ thống.

## 2. Chức năng chính

### 2.1. Đăng ký tài khoản (`POST /api/auth/register`)

*   **Mô tả:** Cho phép người dùng mới tạo tài khoản bằng cách cung cấp thông tin cá nhân và mật khẩu.
*   **Input:** `RegisterDto` (bao gồm `FullName`, `Email`, `Password`).
*   **Logic:**
    1.  Kiểm tra xem email đã tồn tại trong hệ thống chưa (`/api/auth/check-email`).
    2.  Nếu email chưa tồn tại, hệ thống sẽ mã hóa mật khẩu (sử dụng `BCrypt.Net.BCrypt.HashPassword`).
    3.  Tạo một bản ghi `User` mới trong database với vai trò mặc định là "User".
*   **Output:** Thông báo đăng ký thành công.

### 2.2. Đăng nhập (`POST /api/auth/login`)

*   **Mô tả:** Xác thực người dùng và cấp một JSON Web Token (JWT) để truy cập các tài nguyên được bảo vệ.
*   **Input:** `LoginDto` (bao gồm `Email`, `Password`).
*   **Logic:**
    1.  Tìm người dùng dựa trên email.
    2.  So sánh mật khẩu người dùng cung cấp với mật khẩu đã được mã hóa trong database.
    3.  Nếu xác thực thành công, tạo một JWT.
*   **JWT Payload:** Token chứa các thông tin (claims) quan trọng như `UserId`, `Email`, và `Role`.
*   **Output:** Trả về JWT cho client.

### 2.3. Quản lý thông tin cá nhân (`GET /api/auth/profile`, `PUT /api/auth/profile`)

*   **Mô tả:** Cho phép người dùng đã đăng nhập xem và cập nhật thông tin cá nhân của họ.
*   **Yêu cầu:** Cần có JWT hợp lệ trong header `Authorization`.
*   **Logic:**
    *   `GET`: Lấy `UserId` từ token, truy vấn database và trả về thông tin người dùng.
    *   `PUT`: Lấy `UserId` từ token, nhận dữ liệu từ `EditProfileDto` và cập nhật thông tin tương ứng trong database.

### 2.4. Quản lý người dùng (Admin) (`/api/users/...`)

*   **Mô tả:** Cung cấp các endpoint cho quản trị viên để quản lý tất cả người dùng trong hệ thống.
*   **Yêu cầu:** Người dùng phải có vai trò "Admin".
*   **Các endpoints:**
    *   `GET /api/users`: Lấy danh sách tất cả người dùng cùng với vai trò của họ.
    *   `GET /api/users/{id}`: Lấy thông tin chi tiết của một người dùng.
    *   `POST /api/users`: Thêm người dùng mới (thường dùng cho việc tạo tài khoản admin hoặc nhân viên).
    *   `PUT /api/users/{id}`: Cập nhật thông tin của một người dùng (thường do admin thực hiện).
    *   `PUT /api/users/{id}/role`: Cập nhật vai trò cho một người dùng.

### 2.5. Quản lý vai trò (Admin) (`/api/roles/...`)

*   **Mô tả:** Cho phép admin quản lý các vai trò trong hệ thống.
*   **Yêu cầu:** Người dùng phải có vai trò "Admin".
*   **Các endpoints:**
    *   `GET /api/roles`: Lấy danh sách tất cả các vai trò.
    *   `POST /api/roles`: Tạo một vai trò mới.
    *   `PUT /api/roles/{id}`: Cập nhật tên của một vai trò.
    *   `DELETE /api/roles/{id}`: Xóa một vai trò (chỉ khi không có người dùng nào đang được gán vai trò đó).

## 3. Các DTOs liên quan

*   `RegisterDto`: Dữ liệu để đăng ký.
*   `LoginDto`: Dữ liệu để đăng nhập.
*   `EditProfileDto`: Dữ liệu để chỉnh sửa thông tin cá nhân.
*   `AdminUserUpdateDto`: Dữ liệu admin dùng để cập nhật thông tin người dùng.
*   `UserDto`: Dữ liệu để tạo người dùng mới từ admin.
*   `RoleUpdateDto`: Dữ liệu để cập nhật vai trò của người dùng.

## 4. Luồng xác thực và phân quyền

1.  Người dùng đăng nhập và nhận về một JWT.
2.  Client lưu trữ JWT này (thường trong `localStorage` hoặc `sessionStorage`).
3.  Với mỗi yêu cầu cần xác thực, client gửi JWT trong header `Authorization` theo dạng `Bearer <token>`.
4.  Backend middleware sẽ kiểm tra tính hợp lệ của token, giải mã nó để lấy thông tin người dùng (đặc biệt là `UserId` và `Role`).
5.  Các endpoint được đánh dấu với `[Authorize]` sẽ yêu cầu token hợp lệ. Các endpoint có `[Authorize(Roles = "Admin")]` sẽ yêu cầu token hợp lệ và người dùng phải có vai trò là "Admin".
