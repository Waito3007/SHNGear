import React from "react";

const products = [
  {
    id: 1,
    name: "iPhone 15 Pro Max",
    price: "33.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 2,
    name: "Samsung Galaxy S24 Ultra",
    price: "28.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 3,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 4,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 5,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 6,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 7,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 8,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
  {
    id: 9,
    name: "Laptop ASUS ROG",
    price: "40.990.000đ",
    image:
      "https://th.bing.com/th?id=OIP.99qJd0KiYicICEzUQ8l13wAAAA&w=250&h=250&c=8&rs=1&qlt=90&o=6&dpr=1.3&pid=3.1&rm=2",
  },
];

const ProductGrid = () => {
  return (
    <main style={styles.productGrid}>
      {products.map((product) => (
        <div key={product.id} style={styles.productCard}>
          <img
            src={product.image}
            alt={product.name}
            style={styles.productImage}
          />
          <h4>{product.name}</h4>
          <p>{product.price}</p>
          <button style={styles.buyButton}>Mua ngay</button>
        </div>
      ))}
    </main>
  );
};

const styles = {
  productGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
    gap: "20px",
    flex: 1,
    gridTemplateColumns: "repeat(4, 1fr)",
  },
  productCard: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
    textAlign: "center",
  },
  productImage: {
    width: "100%",
    height: "260px",
    objectFit: "cover",
    borderRadius: "5px",
  },
  buyButton: {
    marginTop: "10px",
    padding: "10px",
    width: "100%",
    background: "#ff4500",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ProductGrid;
