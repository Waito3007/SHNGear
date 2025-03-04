import React from "react";

const FilterSection = () => {
  return (
    <aside style={styles.filterSection}>
      <h3 style={styles.filterTitle}>Bộ lọc</h3>
      <div style={styles.filterOption}>
        <label>Khoảng giá:</label>
        <select style={styles.selectBox}>
          <option>Dưới 10 triệu</option>
          <option>10 - 20 triệu</option>
          <option>20 - 30 triệu</option>
          <option>Trên 30 triệu</option>
        </select>
      </div>
      <div style={styles.filterOption}>
        <label>Hãng sản xuất:</label>
        <select style={styles.selectBox}>
          <option>Apple</option>
          <option>Samsung</option>
          <option>ASUS</option>
          <option>Dell</option>
        </select>
      </div>
    </aside>
  );
};

const styles = {
  filterSection: {
    width: "250px",
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  filterTitle: {
    fontSize: "18px",
    fontWeight: "bold",
    marginBottom: "10px",
  },
  filterOption: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "15px",
    whiteSpace: "nowrap",
  },
  selectBox: {
    padding: "8px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    cursor: "pointer",
  },
};

export default FilterSection;
