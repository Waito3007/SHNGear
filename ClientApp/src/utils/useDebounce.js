// useDebounce.js
import { useState, useEffect } from 'react';

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Thiết lập một timeout để cập nhật giá trị đã debounce sau khoảng thời gian delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Hủy timeout nếu value hoặc delay thay đổi, hoặc khi component unmount
    // Điều này quan trọng để tránh cập nhật state trên một component đã unmount
    // hoặc khi giá trị thay đổi nhanh chóng.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Chỉ chạy lại effect nếu value hoặc delay thay đổi

  return debouncedValue;
}

export default useDebounce;