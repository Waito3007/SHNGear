# Module 14: Tương tác với API

Module này mô tả cách ứng dụng frontend giao tiếp với backend API để lấy và gửi dữ liệu.

## 1. Tổng quan

Việc tương tác với API là xương sống của ứng dụng, cho phép giao diện người dùng hiển thị dữ liệu động và thực hiện các hành động như đăng nhập, đặt hàng, v.v.

## 2. Các phương thức Giao tiếp

Dự án sử dụng cả `axios` và `fetch` để gọi API, với sự phân bổ như sau:

### 2.1. Sử dụng `axios` (Chủ yếu trong Admin Dashboard)

*   **Thư viện:** `axios` là một thư viện mạnh mẽ và phổ biến để thực hiện các yêu cầu HTTP.
*   **Cách sử dụng:** Trong các trang quản trị như `ProductsPage.jsx` và `OrdersPage.jsx`, `axios` được sử dụng trực tiếp trong các `useEffect` hook để lấy dữ liệu từ backend. Các yêu cầu có thể được thực hiện song song bằng `Promise.all` để tối ưu hiệu suất.
*   **Cấu hình (Dự đoán):** Mặc dù không thấy một file cấu hình `axios` tập trung rõ ràng, nhưng thông thường, `axios` sẽ được cấu hình để:
    *   Sử dụng `baseURL` từ biến môi trường (`process.env.REACT_APP_API_BASE_URL`).
    *   Tự động đính kèm JWT (`Authorization: Bearer <token>`) vào header của mọi yêu cầu cần xác thực thông qua `axios interceptors`.
    *   Xử lý các lỗi phổ biến (ví dụ: `401 Unauthorized`) thông qua `axios interceptors` để tự động đăng xuất người dùng hoặc hiển thị modal yêu cầu đăng nhập lại (`SessionExpiredModal`).

### 2.2. Sử dụng `fetch` trực tiếp (Chủ yếu trong các trang Public)

*   **Mô tả:** Một số component, như `ProductPage.jsx`, sử dụng hàm `fetch` gốc của trình duyệt để gọi API.
*   **Ưu điểm:** Không cần thư viện bên ngoài.
*   **Nhược điểm:**
    *   Cần phải xử lý thủ công nhiều thứ hơn (ví dụ: chuyển đổi response sang JSON bằng `.json()`, kiểm tra `response.ok`).
    *   Thiếu các tính năng nâng cao như interceptor, dẫn đến việc lặp lại code (ví dụ: logic đính kèm token, xử lý lỗi) ở nhiều nơi nếu không có một wrapper tùy chỉnh.

## 3. Service Layer (Lớp Dịch vụ)

*   **Mục đích:** Để đóng gói và tái sử dụng logic gọi API, dự án có thể có một "service layer" trong thư mục `src/services`.
*   **Ví dụ (dự đoán):** Có thể có các file như `productService.js`, `orderService.js`, `authService.js`.
*   **Cấu trúc một file service:**
    ```javascript
    // src/services/productService.js
    import axios from '../api/axiosConfig'; // Import instance đã được cấu hình

    const getProductById = (id) => {
      return axios.get(`/api/products/${id}`);
    };

    const getProductsByCategory = (categoryId) => {
      return axios.get(`/api/products?categoryId=${categoryId}`);
    };

    const productService = {
      getProductById,
      getProductsByCategory,
    };

    export default productService;
    ```
*   **Sử dụng:** Các component chỉ cần import service và gọi hàm tương ứng mà không cần quan tâm đến chi tiết của việc gọi API.
    ```javascript
    // Trong một component
    import productService from '../services/productService';

    // ...
    const product = await productService.getProductById(id);
    ```

## 4. Quản lý Biến Môi trường

*   URL của backend API được lưu trong các file môi trường (`.env.development`, `.env.production`).
*   Biến `REACT_APP_API_BASE_URL` được sử dụng trong code để tham chiếu đến URL này.
*   Điều này giúp dễ dàng chuyển đổi giữa môi trường development (ví dụ: `https://localhost:7157`) và production mà không cần thay đổi code.
