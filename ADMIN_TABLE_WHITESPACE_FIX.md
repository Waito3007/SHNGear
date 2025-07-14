# Fix DOM Nesting Warning trong Admin Tables

## Vấn đề

Lỗi `validateDOMNesting(...): Whitespace text nodes cannot appear as a child of <tr>` xảy ra khi có khoảng trắng (whitespace) không mong muốn giữa các thẻ `<tr>` trong table.

## Nguyên nhân

- Xuống dòng và khoảng trắng giữa các JSX elements trong table
- Format code tự động tạo ra whitespace không cần thiết

## Cách sửa

### ❌ SAI - Có whitespace giữa các TableRow:

```jsx
<TableBody>
  {items.map((item) => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
    </TableRow>
  ))}
</TableBody>
```

### ✅ ĐÚNG - Không có whitespace:

```jsx
<TableBody>
  {items.map((item) => (
    <TableRow key={item.id}>
      <TableCell>{item.name}</TableCell>
    </TableRow>
  ))}
</TableBody>
```

### ❌ SAI - HTML tables với comments và whitespace:

```jsx
<tbody className="divide-y divide-gray-600">
  {items.map((item) => (
    <motion.tr key={item.id} className="hover:bg-gray-700/60">
      {/* Comment tạo ra whitespace */}
      <td className="px-6 py-4">{item.name}</td>

      {/* Xuống dòng tạo ra whitespace */}
      <td className="px-6 py-4">{item.status}</td>
    </motion.tr>
  ))}
</tbody>
```

### ✅ ĐÚNG - Loại bỏ comments và whitespace trong JSX:

```jsx
<tbody className="divide-y divide-gray-600">
  {items.map((item) => (
    <motion.tr key={item.id} className="hover:bg-gray-700/60">
      <td className="px-6 py-4">{item.name}</td>
      <td className="px-6 py-4">{item.status}</td>
    </motion.tr>
  ))}
</tbody>
```

## Files đã được sửa

- ✅ `ReviewManagementPage.jsx`
- ✅ `BannersTable.jsx`
- ✅ `SlidersTable.jsx`
- ✅ `BrandDrawer.jsx` (đã ổn)
- ✅ `CategoryBrandDrawer.jsx` (đã ổn)
- ✅ `VoucherDrawer.jsx` (đã ổn)
- ✅ `ProductsTable.jsx` (đã ổn)
- ✅ `OrdersTable.jsx` (đã ổn)
- ✅ `UsersTable.jsx` (đã ổn)

## Helper Components

Sử dụng các helper components đã tạo trong `/components/Admin/common/TableHelpers.jsx`:

```jsx
import {
  AdminTableWrapper,
  AdminTableBody,
  SafeTableRowRenderer,
} from "@/components/Admin/common/TableHelpers";

// Sử dụng SafeTableRowRenderer để tránh lỗi
<AdminTableBody>
  <SafeTableRowRenderer
    items={data}
    renderRow={(item) => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
      </TableRow>
    )}
    emptyMessage="Không có dữ liệu"
  />
</AdminTableBody>;
```

## Quy tắc coding

1. Luôn đặt closing tag của TableBody, tbody ngay sau closing parenthesis của map function
2. Không sử dụng comments inline trong table JSX
3. Không xuống dòng giữa các table elements
4. Sử dụng helper components khi có thể
5. Test với React Developer Tools để đảm bảo không có whitespace warnings

## Kiểm tra

Sau khi sửa, kiểm tra console không còn warning:

```
Warning: validateDOMNesting(...): Whitespace text nodes cannot appear as a child of <tr>
```
