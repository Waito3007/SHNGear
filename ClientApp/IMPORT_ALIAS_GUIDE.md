# Import Alias Configuration

## Tổng quan

Đã thiết lập import alias cho frontend React app để giúp việc import các module trở nên ngắn gọn và dễ quản lý hơn.

## Cấu hình

### 1. jsconfig.json

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/utils/*": ["utils/*"],
      "@/services/*": ["services/*"],
      "@/assets/*": ["assets/*"],
      "@/styles/*": ["assets/styles/*"],
      "@/contexts/*": ["contexts/*"],
      "@/hooks/*": ["hook/*"],
      "@/config/*": ["config/*"]
    }
  },
  "include": ["src"]
}
```

### 2. VS Code Settings (.vscode/settings.json)

Đã cấu hình VS Code để hỗ trợ auto-complete và IntelliSense với các alias.

## Các Alias Đã Thiết Lập

| Alias            | Đường dẫn thực        | Mô tả               |
| ---------------- | --------------------- | ------------------- |
| `@/*`            | `src/*`               | Root của src folder |
| `@/components/*` | `src/components/*`    | Tất cả components   |
| `@/pages/*`      | `src/pages/*`         | Tất cả pages        |
| `@/utils/*`      | `src/utils/*`         | Utility functions   |
| `@/services/*`   | `src/services/*`      | API services        |
| `@/assets/*`     | `src/assets/*`        | Static assets       |
| `@/styles/*`     | `src/assets/styles/*` | CSS/Style files     |
| `@/contexts/*`   | `src/contexts/*`      | React contexts      |
| `@/hooks/*`      | `src/hook/*`          | Custom hooks        |
| `@/config/*`     | `src/config/*`        | Configuration files |

## Ví dụ Sử dụng

### Trước (Relative imports):

```javascript
import Navbar from "../../components/Navbar/Navbar";
import ProductList from "../pages/ProductList";
import { formatCurrency } from "../../utils/formatCurrency";
import logo from "../../../assets/img/Phone/logo.png";
```

### Sau (Alias imports):

```javascript
import Navbar from "@/components/Navbar/Navbar";
import ProductList from "@/pages/ProductList";
import { formatCurrency } from "@/utils/formatCurrency";
import logo from "@/assets/img/Phone/logo.png";
```

## Lợi ích

1. **Dễ đọc**: Import paths ngắn gọn và rõ ràng hơn
2. **Dễ bảo trì**: Không cần thay đổi import khi di chuyển file
3. **Tránh lỗi**: Giảm thiểu lỗi đường dẫn relative phức tạp
4. **IntelliSense**: VS Code hỗ trợ auto-complete tốt hơn
5. **Consistent**: Tất cả imports đều có format nhất quán

## Files Đã Cập Nhật

Các file sau đã được cập nhật để sử dụng import alias:

### Core Files:

- `src/App.js`
- `src/AppRoutes.js`
- `src/index.js`

### Layout Components:

- `src/components/layouts/AdminLayout.js`

### Pages:

- `src/pages/Home/Home.jsx`
- `src/pages/ProductList.jsx`
- `src/pages/ProductPage.jsx`
- `src/pages/shoppingcart.jsx`

### Admin Pages:

- `src/pages/Admin/OverviewPage.jsx`
- `src/pages/Admin/SalesPage.jsx`
- `src/pages/Admin/OrdersPage.jsx`
- `src/pages/Admin/UsersPage.jsx`
- `src/pages/Admin/SettingsPage.jsx`

### Components:

- `src/components/Navbar/Navbar.jsx`

## Hướng dẫn Tiếp tục

Để tiếp tục cập nhật các file còn lại, hãy thay thế các relative imports bằng alias imports theo pattern:

```javascript
// Thay thế
import Component from "../../../components/Component";

// Bằng
import Component from "@/components/Component";
```

## Testing

Sau khi cập nhật, hãy chạy các lệnh sau để đảm bảo mọi thứ hoạt động:

```bash
cd ClientApp
npm start
```

Nếu có lỗi import, hãy kiểm tra:

1. Đường dẫn alias có đúng không
2. File có tồn tại ở vị trí được import không
3. VS Code có restart sau khi thay đổi jsconfig.json không
