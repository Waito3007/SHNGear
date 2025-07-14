// Utility để render table rows mà không có whitespace issues
export const renderTableRows = (items, renderItem) => {
  return items.map(renderItem);
};

// Component wrapper để tránh whitespace issues trong Material-UI Tables
export const TableBodyWrapper = ({ children }) => {
  return children;
};

// Hook để format table data properly
export const useTableFormatting = () => {
  const formatTableRows = (data, renderFn) => {
    if (!Array.isArray(data)) return [];
    return data.map(renderFn);
  };

  return { formatTableRows };
};
