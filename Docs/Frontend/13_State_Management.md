# Module 13: Quản lý Trạng thái (State Management)

Module này giải thích cách ứng dụng React quản lý và chia sẻ trạng thái (state) giữa các component, đảm bảo dữ liệu được đồng bộ và giao diện người dùng được cập nhật một cách nhất quán.

## 1. Tổng quan

Ứng dụng sử dụng kết hợp hai phương pháp quản lý trạng thái chính:

*   **Local State (useState, useReducer):** Dùng cho các trạng thái chỉ liên quan đến một component duy nhất hoặc một cây component nhỏ (ví dụ: trạng thái của một form nhập liệu, trạng thái đóng/mở của một dropdown).
*   **Global State (React Context API):** Dùng cho các trạng thái cần được chia sẻ trên toàn bộ ứng dụng, giúp tránh việc phải truyền props qua nhiều cấp (prop drilling).

## 2. React Context API

Thư mục `src/contexts` là trung tâm của việc quản lý trạng thái toàn cục. Dựa trên phân tích, có các context chính sau:

### 2.1. `AuthContext`

*   **File:** `src/contexts/AuthContext.jsx` (Tên file có thể khác, nhưng chức năng là cốt lõi)
*   **Mục đích:** Quản lý trạng thái xác thực của người dùng trên toàn ứng dụng.
*   **State được lưu trữ:**
    *   `user`: Một object chứa thông tin của người dùng đã đăng nhập (id, email, fullName, role).
    *   `token`: Chuỗi JWT được trả về từ backend.
    *   `isAuthenticated`: Một boolean cho biết người dùng đã đăng nhập hay chưa.
    *   `isLoading`: Một boolean để xử lý trạng thái chờ trong khi xác thực token lúc khởi động ứng dụng.
*   **Hàm cung cấp (Actions):**
    *   `login(email, password)`: Gọi API đăng nhập, nếu thành công thì lưu `user` và `token` vào state và `localStorage`.
    *   `logout()`: Xóa thông tin người dùng và token khỏi state và `localStorage`, cập nhật `isAuthenticated` thành `false`.
    *   `loadUserFromToken()`: Hàm này thường được gọi khi ứng dụng khởi động, kiểm tra xem có token trong `localStorage` không. Nếu có, nó sẽ giải mã token để lấy thông tin người dùng và cập nhật vào state.
*   **Cách sử dụng:** Bất kỳ component nào cần thông tin người dùng hoặc cần thực hiện đăng xuất đều có thể sử dụng hook `useAuth()`.

### 2.2. `AuthModalContext`

*   **File:** `src/contexts/AuthModalContext.js` (hoặc logic tương tự trong `AuthContext.jsx`)
*   **Mục đích:** Điều khiển việc hiển thị modal Đăng nhập/Đăng ký từ bất kỳ đâu trong ứng dụng.
*   **State được lưu trữ:**
    *   `isAuthModalOpen`: Một boolean để kiểm soát trạng thái hiển thị của modal.
*   **Hàm cung cấp (Actions):**
    *   `openAuthModal()`: Set `isAuthModalOpen` thành `true`.
    *   `closeAuthModal()`: Set `isAuthModalOpen` thành `false`.
*   **Cách sử dụng:** Ví dụ, khi một người dùng chưa đăng nhập nhấn vào nút "Thêm vào giỏ hàng", sự kiện `onClick` có thể gọi `openAuthModal()` để yêu cầu người dùng đăng nhập trước.

### 2.3. `CartContext` (Dự đoán)

*   **Mục đích:** Quản lý trạng thái của giỏ hàng.
*   **State được lưu trữ:**
    *   `cartItems`: Một mảng các sản phẩm trong giỏ hàng.
*   **Hàm cung cấp (Actions):**
    *   `addToCart(product, quantity)`: Thêm sản phẩm vào giỏ hàng.
    *   `removeFromCart(productId)`: Xóa sản phẩm khỏi giỏ hàng.
    *   `updateQuantity(productId, quantity)`: Cập nhật số lượng.
    *   `clearCart()`: Xóa toàn bộ giỏ hàng.
*   **Logic:** Context này sẽ tương tác với `CartController` ở backend. Khi người dùng đăng nhập, nó sẽ đồng bộ giỏ hàng từ `localStorage` (nếu có) lên database.

## 3. Dịch vụ Singleton cho Real-time

*   **File:** `src/services/ChatSignalRService.js`
*   **Mô tả:** Thay vì dùng Context, kết nối SignalR được quản lý bằng một class Singleton. Đây là một lựa chọn thiết kế tốt vì kết nối SignalR là một đối tượng phức tạp và nên chỉ có một instance duy nhất trong suốt vòng đời của ứng dụng.
*   **Cách hoạt động:**
    1.  Một instance duy nhất của `ChatSignalRService` được tạo và export.
    2.  Các component (ví dụ: `ChatWindow`) import instance này.
    3.  Component `ChatWindow` gọi `chatSignalR.connect()` khi được mount và `chatSignalR.disconnect()` khi unmount.
    4.  Nó sử dụng các phương thức như `chatSignalR.on('messageReceived', ...)` để đăng ký lắng nghe sự kiện và `chatSignalR.sendMessage(...)` để gửi tin nhắn.
*   **Ưu điểm:** Tách biệt hoàn toàn logic quản lý kết nối real-time ra khỏi các component React, giúp code sạch sẽ và dễ quản lý hơn.
