import { Chip } from '@mui/material'; // Import Chip nếu cần sử dụng trong các component khác

// Hàm định dạng tiền tệ
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return 'N/A';
  return amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
};

// Hàm định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    if (isNaN(date)) throw new Error('Invalid date');
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'Ngày không hợp lệ';
  }
};

// Hàm định dạng địa chỉ
const formatAddress = (address) => {
  if (!address || typeof address !== 'object') return 'Chưa có thông tin địa chỉ';
  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.city,
    address.state,
    address.zipCode,
    address.country,
  ].filter(Boolean); // Lọc bỏ các phần tử rỗng hoặc null/undefined
  return parts.join(', ');
};

// Hàm lấy màu cho trạng thái
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'delivered': return 'success';
    case 'processing': return 'info';
    case 'shipped': return 'primary';
    case 'cancelled': return 'error';
    case 'pending': return 'warning';
    default: return 'default'; // Màu mặc định
  }
};

// Hàm lấy tên hiển thị của trạng thái
const getStatusDisplayName = (status) => {
  switch (status) {
      case "Pending": return "Chờ xác nhận";
      case "Processing": return "Đã xác nhận";
      case "Shipped": return "Đang vận chuyển";
      case "Delivered": return "Đã xong";
      case "Cancelled": return "Đã hủy";
      case "WaitingForPayment": return "Chờ thanh toán";
      case "Paid": return "Đã thanh toán";
      case "ShippedPayment": return "Đang vận chuyển (đã thanh toán)";
      default: return status;
  }
};

// Mapping ID phương thức thanh toán sang tên
const paymentMethodMap = {
  1: 'Tiền mặt',
  2: 'MoMo',
  3: 'PayPal',
  // Thêm các phương thức khác nếu cần
};

const getPaymentMethodName = (id) => paymentMethodMap[id] || 'Không xác định';

// Component hiển thị Chip trạng thái
const StatusChip = ({ status }) => (
  <Chip
    label={status || 'Unknown'}
    color={getStatusColor(status)}
    size="small"
  />
);
// Hàm xác định các trạng thái được phép chuyển đổi
const getAllowedStatuses = (currentStatus) => {
  switch (currentStatus) {
      case "Pending": return ["Processing", "Cancelled"];
      case "Processing": return ["Shipped", "Cancelled"];
      case "Shipped": return ["Delivered"];
      case "WaitingForPayment": return ["Paid", "Cancelled"];
      case "Paid": return ["ShippedPayment"];
      case "ShippedPayment": return ["Delivered"];
      default: return [];
  }
};
// Hàm lấy màu trạng thái cho chip (ví dụ)
const getStatusChipClass = (status) => {
  switch (status) {
    case "Delivered": return "bg-green-100 text-green-800 hover:bg-green-200";
    case "Processing": return "bg-blue-100 text-blue-800 hover:bg-blue-200"; // Thay Processing sang Blue
    case "Shipped": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"; // Thay Shipped sang Yellow
    case "ShippedPayment": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
    case "Paid": return "bg-purple-100 text-purple-800 hover:bg-purple-200"; // Thêm màu Paid
    case "WaitingForPayment": return "bg-orange-100 text-orange-800 hover:bg-orange-200"; // Thêm màu chờ thanh toán
    case "Pending": return "bg-gray-100 text-gray-800 hover:bg-gray-200"; // Thêm màu Pending
    case "Cancelled": return "bg-red-100 text-red-800 hover:bg-red-200";
    default: return "bg-gray-100 text-gray-800 hover:bg-gray-200";
  }
};

// (Có thể đặt ở ngoài component hoặc trong file utils.js)
const getFormattedDateString = (date) => {
  return date.toISOString().split("T")[0];
};

const getDateNDaysAgo = (daysAgo) => {
  const date = new Date(); // Lấy ngày giờ hiện tại theo múi giờ của client
  date.setDate(date.getDate() - daysAgo);
  return getFormattedDateString(date);
};

const getToday = () => {
  return getFormattedDateString(new Date());
};
export {
  formatCurrency,
  formatDate,
  formatAddress,
  getStatusColor,
  getPaymentMethodName,
  StatusChip,
  getStatusChipClass,
  getStatusDisplayName,
  getAllowedStatuses,
  getDateNDaysAgo,
  getToday,
};