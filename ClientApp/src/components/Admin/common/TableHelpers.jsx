import React from 'react';

/**
 * AdminTableWrapper - Component wrapper để đảm bảo table rendering không có whitespace issues
 */
export const AdminTableWrapper = ({ children, className = "" }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full bg-gray-800">
        {children}
      </table>
    </div>
  );
};

/**
 * AdminTableBody - Wrapper cho tbody để tránh whitespace warnings
 */
export const AdminTableBody = ({ children, className = "divide-y divide-gray-600" }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

/**
 * AdminTableHeader - Wrapper cho thead
 */
export const AdminTableHeader = ({ children, className = "" }) => {
  return (
    <thead className={`bg-gray-700 ${className}`}>
      {children}
    </thead>
  );
};

/**
 * SafeTableRowRenderer - Function để render table rows safely
 */
export const SafeTableRowRenderer = ({ items = [], renderRow, emptyMessage = "Không có dữ liệu" }) => {
  if (!Array.isArray(items) || items.length === 0) {
    return (
      <tr>
        <td colSpan="100%" className="text-center py-10 text-gray-400 italic">
          {emptyMessage}
        </td>
      </tr>
    );
  }

  return items.map(renderRow);
};

const TableHelpers = {
  AdminTableWrapper,
  AdminTableBody,
  AdminTableHeader,
  SafeTableRowRenderer
};

export default TableHelpers;
