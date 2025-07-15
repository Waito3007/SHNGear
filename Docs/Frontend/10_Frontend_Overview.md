# Module 10: Tổng quan Giao diện (Frontend)

Phần này của tài liệu tập trung vào kiến trúc và các công nghệ được sử dụng để xây dựng giao diện người dùng (UI) và trải nghiệm người dùng (UX) cho hệ thống SHN-Gear.

## 1. Kiến trúc và Công nghệ chính

Frontend được xây dựng dưới dạng một **Single Page Application (SPA)** sử dụng **React.js**. Cấu hình dự án được tùy chỉnh bằng **Craco** (`@craco/craco`) để tích hợp **Tailwind CSS**.

### 1.1. Các thư viện cốt lõi

*   **Framework:** React.js v18.2.0
*   **Routing (Điều hướng):** `react-router-dom` được sử dụng để quản lý các tuyến đường (routes) và điều hướng giữa các trang mà không cần tải lại toàn bộ trang.
*   **API Communication:** `axios` là thư viện chính để gửi các yêu cầu HTTP (GET, POST, PUT, DELETE) đến backend ASP.NET Core.
*   **State Management:** React Context API (thư mục `src/contexts`) được sử dụng để quản lý và chia sẻ trạng thái toàn cục giữa các component, chẳng hạn như thông tin xác thực người dùng, nội dung giỏ hàng.
*   **Real-time Communication:** Thư viện `@microsoft/signalr` được dùng để thiết lập kết nối thời gian thực với `ChatHub` ở backend, phục vụ cho tính năng live chat.

### 1.2. Thư viện Giao diện (UI Libraries)

Dự án sử dụng một cách tiếp cận đa dạng và kết hợp nhiều thư viện UI nổi tiếng, cho thấy sự linh hoạt trong việc lựa chọn component phù hợp cho từng ngữ cảnh:

*   **Tailwind CSS:** Là framework CSS tiện ích (utility-first) chính, cung cấp các class cấp thấp để xây dựng giao diện một cách nhanh chóng và tùy biến cao.
*   **Ant Design (`antd`):** Cung cấp một bộ sưu tập lớn các component UI chất lượng cao, thường được sử dụng cho các khu vực phức tạp như bảng dữ liệu, form trong trang quản trị.
*   **Material-UI (`@mui/material`):** Một thư viện component phổ biến khác theo ngôn ngữ thiết kế Material Design của Google.
*   **Bootstrap (`bootstrap`, `reactstrap`):** Một framework UI lâu đời, có thể được sử dụng cho các layout hoặc component cơ bản.
*   **Shadcn/UI & Lucide Icons:** Một bộ sưu tập các component có thể tùy chỉnh cao, được xây dựng trên nền tảng Tailwind CSS, cho thấy xu hướng hiện đại hóa giao diện.
*   **Flowbite (`flowbite-react`):** Một bộ component khác được xây dựng trên Tailwind CSS.

### 1.3. Các công cụ khác

*   **Form Management:** `react-hook-form` được sử dụng để quản lý trạng thái, xác thực và gửi dữ liệu từ các form một cách hiệu quả.
*   **Notifications:** `react-toastify` được dùng để hiển thị các thông báo (toast) cho người dùng (ví dụ: "Thêm vào giỏ hàng thành công").
*   **Charts:** `recharts` được sử dụng để vẽ các biểu đồ trong trang dashboard quản trị.

## 2. Cấu trúc thư mục `src`

Cấu trúc thư mục được tổ chức một cách rõ ràng, tuân thủ các quy ước tốt nhất của cộng đồng React:

```
/src
├── /assets         # Chứa các tài nguyên tĩnh như hình ảnh, icons, fonts
├── /components     # Các UI component nhỏ, có khả năng tái sử dụng cao
├── /contexts       # Định nghĩa các React Context cho state management
├── /hooks          # Chứa các custom hooks để tái sử dụng logic
├── /pages          # Các component lớn, đại diện cho một trang hoàn chỉnh
├── /services       # Logic giao tiếp với API backend
├── /utils          # Các hàm tiện ích chung
├── App.js          # Component gốc của ứng dụng, định nghĩa layout chính
├── AppRoutes.js    # Định nghĩa tất cả các routes của ứng dụng
├── index.js        # Điểm vào của ứng dụng React
└── setupProxy.js   # Cấu hình proxy để chuyển tiếp các yêu cầu API đến backend trong môi trường development
```

## 3. Luồng hoạt động chung

1.  **Initialization:** `index.js` render component `App.js`.
2.  **Routing:** `App.js` sử dụng `AppRoutes.js` để xác định component `page` nào sẽ được hiển thị dựa trên URL hiện tại.
3.  **Layout:** `App.js` thường chứa layout chung của trang (ví dụ: Header, Footer, Sidebar) và hiển thị page component tương ứng ở giữa.
4.  **Data Fetching:** Các `page` hoặc `component` sẽ gọi các hàm trong `services` để lấy dữ liệu từ backend.
5.  **State & UI:** Dữ liệu từ API được lưu vào state (cục bộ hoặc toàn cục qua `context`). React sẽ tự động render lại giao diện khi state thay đổi.
6.  **User Interaction:** Người dùng tương tác với UI, kích hoạt các sự kiện (event), dẫn đến việc gọi lại các hàm xử lý, cập nhật state và lặp lại chu trình.
