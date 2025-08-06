# SHNGear Custom Hooks Documentation

## Overview

This documentation provides examples and usage patterns for all custom hooks in the SHNGear application. The hooks are organized into three main categories: API, Authentication, and UI.

## Table of Contents

- [Installation & Setup](#installation--setup)
- [API Hooks](#api-hooks)
- [Authentication Hooks](#authentication-hooks)
- [UI Hooks](#ui-hooks)
- [Best Practices](#best-practices)
- [Error Handling](#error-handling)

## Installation & Setup

### Import Hooks

```javascript
// Import specific hooks
import { useProducts, useCart, useAuth } from "../hooks";

// Or import all hooks
import * as hooks from "../hooks";

// Import by category
import { useProducts } from "../hooks/api/useProducts";
import { useAuth } from "../hooks/auth/useAuth";
import { useDebounce } from "../hooks/ui/useUI";
```

### Environment Setup

Ensure your environment has these variables configured:

```
REACT_APP_API_BASE_URL=https://api.shngear.com
REACT_APP_SIGNALR_HUB_URL=https://api.shngear.com/chathub
```

## API Hooks

### useProducts Hook

```javascript
import React from "react";
import { useProducts, useProductSearch } from "../hooks";

function ProductList() {
  // Basic product loading
  const {
    products,
    loading,
    error,
    totalCount,
    loadProducts,
    refreshProducts,
  } = useProducts({
    page: 1,
    limit: 12,
    category: "electronics",
  });

  // Product search with debouncing
  const { searchResults, isSearching, searchError, search, clearSearch } =
    useProductSearch();

  const handleSearch = (query) => {
    search(query, {
      categories: ["electronics", "accessories"],
      minPrice: 0,
      maxPrice: 1000,
      sortBy: "relevance",
    });
  };

  if (loading) return <div>Loading products...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        onChange={(e) => handleSearch(e.target.value)}
      />

      <div className="products-grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <button onClick={refreshProducts}>Refresh</button>
    </div>
  );
}
```

### useCart Hook

```javascript
import React from "react";
import { useCart } from "../hooks";

function ShoppingCart() {
  const {
    items,
    totalItems,
    totalPrice,
    loading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    applyVoucher,
    voucher,
  } = useCart();

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addItem(productId, quantity, {
        size: "L",
        color: "red",
      });
      // Success feedback handled by hook
    } catch (error) {
      console.error("Failed to add item:", error);
    }
  };

  return (
    <div className="cart">
      <h2>Shopping Cart ({totalItems} items)</h2>

      {items.map((item) => (
        <div key={item.id} className="cart-item">
          <img src={item.product.image} alt={item.product.name} />
          <div>
            <h4>{item.product.name}</h4>
            <p>${item.price}</p>
            <div>
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <span>{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                +
              </button>
              <button onClick={() => removeItem(item.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}

      <div className="cart-summary">
        <p>Total: ${totalPrice}</p>
        {voucher && <p>Discount: -{voucher.discount}%</p>}
        <button onClick={clearCart}>Clear Cart</button>
      </div>
    </div>
  );
}
```

### useOrders Hook

```javascript
import React from "react";
import { useOrders, useOrderTracking } from "../hooks";

function OrderHistory() {
  const { orders, loading, pagination, loadOrders, cancelOrder, reorder } =
    useOrders();

  // Track specific order
  const { trackingInfo, isTracking } = useOrderTracking("ORDER123");

  React.useEffect(() => {
    loadOrders({ page: 1, limit: 10, status: "all" });
  }, [loadOrders]);

  return (
    <div className="order-history">
      <h2>Order History</h2>

      {orders.map((order) => (
        <div key={order.id} className="order-card">
          <div className="order-header">
            <h3>Order #{order.orderNumber}</h3>
            <span className={`status ${order.status}`}>{order.status}</span>
          </div>

          <div className="order-details">
            <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Total: ${order.total}</p>
            <p>Items: {order.items.length}</p>
          </div>

          <div className="order-actions">
            {order.status === "pending" && (
              <button onClick={() => cancelOrder(order.id)}>
                Cancel Order
              </button>
            )}
            <button onClick={() => reorder(order.id)}>Reorder</button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Authentication Hooks

### useAuth Hook

```javascript
import React from "react";
import { useAuth } from "../hooks";

function LoginForm() {
  const {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
    updateProfile,
  } = useAuth();

  const [credentials, setCredentials] = React.useState({
    email: "",
    password: "",
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(credentials.email, credentials.password);
      // Redirect handled by hook
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  if (loading) return <div>Authenticating...</div>;

  if (isAuthenticated) {
    return (
      <div className="user-profile">
        <h2>Welcome, {user.firstName}!</h2>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
        <button onClick={logout}>Logout</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleLogin} className="login-form">
      <h2>Login</h2>
      <input
        type="email"
        placeholder="Email"
        value={credentials.email}
        onChange={(e) =>
          setCredentials({
            ...credentials,
            email: e.target.value,
          })
        }
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={credentials.password}
        onChange={(e) =>
          setCredentials({
            ...credentials,
            password: e.target.value,
          })
        }
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

## UI Hooks

### useForm Hook

```javascript
import React from "react";
import { useForm } from "../hooks";

function ContactForm() {
  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
  } = useForm({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: {
      name: (value) =>
        value.length < 2 ? "Name must be at least 2 characters" : null,
      email: (value) =>
        !/\S+@\S+\.\S+/.test(value) ? "Invalid email address" : null,
      message: (value) =>
        value.length < 10 ? "Message must be at least 10 characters" : null,
    },
    onSubmit: async (formData) => {
      // Submit form data
      await submitContactForm(formData);
    },
  });

  return (
    <form onSubmit={handleSubmit} className="contact-form">
      <div className="form-group">
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.name && touched.name ? "error" : ""}
        />
        {errors.name && touched.name && (
          <span className="error-message">{errors.name}</span>
        )}
      </div>

      <div className="form-group">
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={values.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.email && touched.email ? "error" : ""}
        />
        {errors.email && touched.email && (
          <span className="error-message">{errors.email}</span>
        )}
      </div>

      <div className="form-group">
        <textarea
          name="message"
          placeholder="Your Message"
          value={values.message}
          onChange={handleChange}
          onBlur={handleBlur}
          className={errors.message && touched.message ? "error" : ""}
        />
        {errors.message && touched.message && (
          <span className="error-message">{errors.message}</span>
        )}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"}
        </button>
        <button type="button" onClick={resetForm}>
          Reset
        </button>
      </div>
    </form>
  );
}
```

### useDebounce Hook

```javascript
import React from "react";
import { useDebounce, useProducts } from "../hooks";

function ProductSearch() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { searchResults, isSearching } = useProducts();

  React.useEffect(() => {
    if (debouncedSearchTerm) {
      // This will only fire after user stops typing for 500ms
      searchProducts(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="product-search">
      <input
        type="text"
        placeholder="Search products..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {isSearching && <div>Searching...</div>}

      <div className="search-results">
        {searchResults.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
```

### usePagination Hook

```javascript
import React from "react";
import { usePagination } from "../hooks";

function ProductPagination({ totalItems, itemsPerPage, onPageChange }) {
  const {
    currentPage,
    totalPages,
    pages,
    canGoPrevious,
    canGoNext,
    goToPage,
    goToPrevious,
    goToNext,
    goToFirst,
    goToLast,
  } = usePagination({
    totalItems,
    itemsPerPage,
    initialPage: 1,
    siblingCount: 1,
  });

  React.useEffect(() => {
    onPageChange(currentPage);
  }, [currentPage, onPageChange]);

  return (
    <div className="pagination">
      <button onClick={goToFirst} disabled={!canGoPrevious}>
        First
      </button>

      <button onClick={goToPrevious} disabled={!canGoPrevious}>
        Previous
      </button>

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => goToPage(page)}
          className={page === currentPage ? "active" : ""}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button onClick={goToNext} disabled={!canGoNext}>
        Next
      </button>

      <button onClick={goToLast} disabled={!canGoNext}>
        Last
      </button>

      <span className="pagination-info">
        Page {currentPage} of {totalPages} ({totalItems} total items)
      </span>
    </div>
  );
}
```

## Advanced Usage Examples

### Combining Multiple Hooks

```javascript
import React from "react";
import {
  useProducts,
  useCart,
  useAuth,
  useDebounce,
  usePagination,
  useLocalStorage,
} from "../hooks";

function AdvancedProductPage() {
  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filters, setFilters] = useLocalStorage("productFilters", {
    category: "",
    priceRange: [0, 1000],
    brand: "",
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const { products, loading, totalCount, loadProducts } = useProducts({
    search: debouncedSearch,
    filters,
    page: currentPage,
    limit: 12,
  });

  const { currentPage, totalPages, goToPage } = usePagination({
    totalItems: totalCount,
    itemsPerPage: 12,
  });

  // Auto-load products when dependencies change
  React.useEffect(() => {
    loadProducts();
  }, [debouncedSearch, filters, currentPage]);

  const handleAddToCart = async (product) => {
    if (!isAuthenticated) {
      // Redirect to login
      return;
    }

    await addItem(product.id, 1);
  };

  return (
    <div className="advanced-product-page">
      {/* Search and filters */}
      <div className="search-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filters.category}
          onChange={(e) =>
            setFilters({
              ...filters,
              category: e.target.value,
            })
          }
        >
          <option value="">All Categories</option>
          <option value="electronics">Electronics</option>
          <option value="clothing">Clothing</option>
        </select>
      </div>

      {/* Product grid */}
      <div className="products-grid">
        {loading ? (
          <div>Loading...</div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              <img src={product.image} alt={product.name} />
              <h3>{product.name}</h3>
              <p>${product.price}</p>
              <button onClick={() => handleAddToCart(product)}>
                Add to Cart
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => goToPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

## Best Practices

### 1. Error Handling

```javascript
import { useProducts, useToast } from "../hooks";

function ProductListWithErrorHandling() {
  const { products, loading, error } = useProducts();
  const { showToast } = useToast();

  React.useEffect(() => {
    if (error) {
      showToast({
        message: "Failed to load products. Please try again.",
        type: "error",
      });
    }
  }, [error, showToast]);

  // Component logic...
}
```

### 2. Loading States

```javascript
import { useProducts } from "../hooks";

function ProductListWithLoading() {
  const { products, loading, error } = useProducts();

  if (loading) {
    return (
      <div className="loading-skeleton">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton-card" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <h3>Oops! Something went wrong</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Render products...
}
```

### 3. Performance Optimization

```javascript
import React from "react";
import { useProducts, useDebounce } from "../hooks";

function OptimizedProductSearch() {
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Memoize expensive calculations
  const { products, loading } = useProducts({
    search: debouncedSearch,
  });

  const filteredProducts = React.useMemo(() => {
    return products.filter((product) => product.inStock && product.price > 0);
  }, [products]);

  // Memoize event handlers
  const handleSearchChange = React.useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search products..."
      />

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div>
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
```

## Error Handling Patterns

### Global Error Boundary

```javascript
import React from "react";
import { useToast } from "../hooks";

function ErrorBoundary({ children }) {
  const { showToast } = useToast();

  React.useEffect(() => {
    const handleError = (error) => {
      showToast({
        message: "An unexpected error occurred",
        type: "error",
      });
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, [showToast]);

  return children;
}
```

### Hook Error Recovery

```javascript
import { useProducts } from "../hooks";

function ProductsWithRetry() {
  const { products, loading, error, loadProducts } = useProducts();

  const handleRetry = React.useCallback(() => {
    loadProducts();
  }, [loadProducts]);

  if (error) {
    return (
      <div className="error-container">
        <p>Failed to load products</p>
        <button onClick={handleRetry}>Retry</button>
      </div>
    );
  }

  // Normal rendering...
}
```

## Testing Hooks

### Example Test Setup

```javascript
// __tests__/hooks/useProducts.test.js
import { renderHook, act } from "@testing-library/react-hooks";
import { useProducts } from "../../hooks";

describe("useProducts", () => {
  test("should load products successfully", async () => {
    const { result, waitForNextUpdate } = renderHook(() => useProducts());

    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.products).toHaveLength(10);
  });

  test("should handle search", async () => {
    const { result } = renderHook(() => useProducts());

    act(() => {
      result.current.searchProducts("laptop");
    });

    expect(result.current.loading).toBe(true);
  });
});
```

This documentation provides comprehensive examples for using all the custom hooks in the SHNGear application. Each hook is designed to be reusable, performant, and easy to test.
