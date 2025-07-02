// Timezone Test Utility
// This file helps debug and verify timezone formatting

// Test current time formatting
export const testTimezoneFormatting = () => {
  const now = new Date();
  const utcTime = new Date().toISOString();

  console.log("=== TIMEZONE FORMATTING TEST ===");
  console.log("Current local time:", now.toString());
  console.log("UTC time (ISO):", utcTime);

  // Test Vietnam timezone formatting
  const vietnamTime = now.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  const vietnamDate = now.toLocaleDateString("vi-VN", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  console.log("Vietnam time (UTC+7):", vietnamTime);
  console.log("Vietnam date (UTC+7):", vietnamDate);

  // Test with a sample UTC timestamp like what would come from backend
  const sampleBackendTime = "2025-07-02T10:30:00.000Z"; // Sample UTC time
  const parsedTime = new Date(sampleBackendTime);

  const formattedSampleTime = parsedTime.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
    hour12: false,
  });

  console.log("Sample backend timestamp:", sampleBackendTime);
  console.log("Formatted to Vietnam time:", formattedSampleTime);
  console.log("==================================");

  return {
    utcTime,
    vietnamTime,
    vietnamDate,
    sampleBackendTime,
    formattedSampleTime,
  };
};

// Utility functions matching AdminChatDashboard.jsx
export const formatVietnamTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "";
  }
};

export const formatVietnamDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
    });
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
};

// Test function to verify the current time vs a UTC timestamp
export const compareTimezones = (utcTimestamp) => {
  const utcDate = new Date(utcTimestamp);
  const localTime = utcDate.toLocaleString();
  const vietnamTime = formatVietnamTime(utcTimestamp);
  const vietnamDate = formatVietnamDate(utcTimestamp);

  console.log("UTC Timestamp:", utcTimestamp);
  console.log("Local time:", localTime);
  console.log("Vietnam time (UTC+7):", vietnamTime);
  console.log("Vietnam date (UTC+7):", vietnamDate);

  return { localTime, vietnamTime, vietnamDate };
};
