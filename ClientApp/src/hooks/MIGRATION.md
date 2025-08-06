# Migration Guide: Refactoring Components to Use Custom Hooks

## Overview

This guide helps you migrate existing React components in the SHNGear application to use the new custom hooks. This refactoring will improve code organization, reusability, and maintainability.

## Table of Contents

- [Before You Start](#before-you-start)
- [Common Migration Patterns](#common-migration-patterns)
- [Step-by-Step Migration Examples](#step-by-step-migration-examples)
- [Breaking Changes](#breaking-changes)
- [Testing After Migration](#testing-after-migration)
- [Rollback Strategy](#rollback-strategy)

## Before You Start

### Prerequisites

1. Ensure all custom hooks are properly installed and exported from `../hooks/index.js`
2. Review the [EXAMPLES.md](./EXAMPLES.md) documentation
3. Create a backup of your components before migration
4. Set up proper testing environment

### Migration Strategy

1. **Identify components** with repetitive state management
2. **Extract state logic** to appropriate hooks
3. **Replace useState/useEffect** with custom hooks
4. **Test thoroughly** after each migration
5. **Update imports** and clean up unused code

## Common Migration Patterns

### Pattern 1: API Data Fetching

**Before:**

```javascript
// OLD: Direct API calls in component
function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

**After:**

```javascript
// NEW: Using custom hook
import { useProducts } from "../hooks";

function ProductList() {
  const { products, loading, error } = useProducts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
```

### Pattern 2: Form State Management

**Before:**

```javascript
// OLD: Manual form handling
function ContactForm() {
  const [values, setValues] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    // Validation logic
    if (touched[name]) {
      validateField(name, value);
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "email":
        if (!/\S+@\S+\.\S+/.test(value)) {
          error = "Invalid email";
        }
        break;
      case "name":
        if (value.length < 2) {
          error = "Name too short";
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitForm(values);
      setValues({ name: "", email: "", message: "" });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // JSX remains the same...
}
```

**After:**

```javascript
// NEW: Using useForm hook
import { useForm } from "../hooks";

function ContactForm() {
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useForm({
    initialValues: {
      name: "",
      email: "",
      message: "",
    },
    validationSchema: {
      email: (value) => (!/\S+@\S+\.\S+/.test(value) ? "Invalid email" : null),
      name: (value) => (value.length < 2 ? "Name too short" : null),
    },
    onSubmit: async (formData) => {
      await submitForm(formData);
    },
  });

  // JSX remains the same...
}
```

### Pattern 3: Authentication State

**Before:**

```javascript
// OLD: Manual auth handling
function Header() {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Component JSX...
}
```

**After:**

```javascript
// NEW: Using useAuth hook
import { useAuth } from "../hooks";

function Header() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  // Component JSX remains the same...
}
```

## Step-by-Step Migration Examples

### Example 1: Product Page Component

**Step 1: Identify current state management**

```javascript
// Current ProductPage.jsx
function ProductPage({ productId }) {
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Multiple useEffect hooks for different data...
  // Manual cart management...
  // Review submission logic...
}
```

**Step 2: Plan hook replacements**

- `useState` for product → `useProduct(productId)`
- `useState` for reviews → `useProductReviews(productId)`
- `useState` for cart → `useCart()`
- `useState` for related → `useRelatedProducts(productId)`

**Step 3: Implement migration**

```javascript
// Migrated ProductPage.jsx
import {
  useProduct,
  useProductReviews,
  useCart,
  useRelatedProducts,
} from "../hooks";

function ProductPage({ productId }) {
  // Replace multiple state hooks with specific hooks
  const { product, loading: productLoading } = useProduct(productId);
  const {
    reviews,
    loading: reviewsLoading,
    submitReview,
  } = useProductReviews(productId);
  const { addItem, loading: cartLoading } = useCart();
  const { relatedProducts } = useRelatedProducts(productId);

  const loading = productLoading || reviewsLoading;

  const handleAddToCart = async () => {
    await addItem(product.id, 1);
  };

  const handleSubmitReview = async (reviewData) => {
    await submitReview(reviewData);
  };

  // Rest of component logic simplified...
}
```

**Step 4: Test and verify**

- Ensure all functionality works as before
- Check for any missing features
- Verify error handling still works

### Example 2: Shopping Cart Component

**Step 1: Current implementation**

```javascript
// Current Cart.jsx - lots of state management
function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [voucher, setVoucher] = useState(null);

  const addItem = async (productId, quantity) => {
    setLoading(true);
    try {
      // API call logic
      // Update state
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    // Similar pattern...
  };

  const applyVoucher = async (code) => {
    // Voucher logic...
  };

  // More methods...
}
```

**Step 2: Migrate to hooks**

```javascript
// Migrated Cart.jsx
import { useCart } from "../hooks";

function Cart() {
  const {
    items,
    totalPrice: total,
    loading,
    voucher,
    addItem,
    removeItem,
    updateQuantity,
    applyVoucher,
    clearCart,
  } = useCart();

  // Component now focuses only on rendering logic
  return (
    <div className="cart">
      {loading && <div>Updating cart...</div>}

      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
          onRemove={() => removeItem(item.id)}
        />
      ))}

      <CartSummary
        total={total}
        voucher={voucher}
        onApplyVoucher={applyVoucher}
        onClearCart={clearCart}
      />
    </div>
  );
}
```

### Example 3: Search Component

**Step 1: Current search logic**

```javascript
// Current ProductSearch.jsx
function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});

  // Debouncing logic
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm) {
        performSearch(searchTerm);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const performSearch = async (term) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${term}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
}
```

**Step 2: Use combined hooks**

```javascript
// Migrated ProductSearch.jsx
import { useProductSearch, useDebounce } from "../hooks";

function ProductSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedTerm = useDebounce(searchTerm, 500);

  const {
    searchResults: results,
    isSearching: loading,
    search,
    clearSearch,
  } = useProductSearch();

  useEffect(() => {
    if (debouncedTerm) {
      search(debouncedTerm);
    } else {
      clearSearch();
    }
  }, [debouncedTerm, search, clearSearch]);

  // Simplified component logic...
}
```

## Breaking Changes

### Import Changes

**Before:**

```javascript
import { useState, useEffect } from "react";
```

**After:**

```javascript
import { useProducts, useCart, useAuth } from "../hooks";
```

### State Structure Changes

Some hooks may return state in a different structure:

**Before:**

```javascript
const [products, setProducts] = useState([]);
const [loading, setLoading] = useState(false);
```

**After:**

```javascript
const { products, loading, error, refetch } = useProducts();
```

### Method Naming Changes

Some method names may have changed for consistency:

**Before:**

```javascript
const updateCart = () => {
  /* ... */
};
```

**After:**

```javascript
const { updateQuantity } = useCart(); // More specific naming
```

## Testing After Migration

### 1. Unit Tests

Update your tests to work with hooks:

```javascript
// Before
import { render, screen } from "@testing-library/react";
import ProductList from "./ProductList";

test("renders product list", () => {
  render(<ProductList />);
  // Test implementation...
});
```

```javascript
// After - Mock the hooks
import { render, screen } from "@testing-library/react";
import { useProducts } from "../hooks";
import ProductList from "./ProductList";

jest.mock("../hooks", () => ({
  useProducts: jest.fn(),
}));

test("renders product list", () => {
  useProducts.mockReturnValue({
    products: mockProducts,
    loading: false,
    error: null,
  });

  render(<ProductList />);
  // Test implementation...
});
```

### 2. Integration Tests

Test that hooks work together properly:

```javascript
test("product page loads product and reviews", async () => {
  render(<ProductPage productId="123" />);

  // Wait for product to load
  await waitFor(() => {
    expect(screen.getByText("Product Name")).toBeInTheDocument();
  });

  // Wait for reviews to load
  await waitFor(() => {
    expect(screen.getByText("Customer Reviews")).toBeInTheDocument();
  });
});
```

### 3. E2E Tests

Ensure the user experience remains the same:

```javascript
// Cypress test
describe("Product shopping flow", () => {
  it("should add product to cart and checkout", () => {
    cy.visit("/products/123");
    cy.get('[data-testid="add-to-cart"]').click();
    cy.get('[data-testid="cart-icon"]').click();
    cy.get('[data-testid="checkout"]').click();
    // Continue testing...
  });
});
```

## Rollback Strategy

### 1. Keep Original Files

Before migration, backup original components:

```bash
cp ProductList.jsx ProductList.jsx.backup
```

### 2. Feature Flags

Use feature flags to toggle between old and new implementations:

```javascript
import { useFeatureFlag } from "../utils";
import ProductListOld from "./ProductList.old";
import ProductListNew from "./ProductList.new";

function ProductList(props) {
  const useNewHooks = useFeatureFlag("use-custom-hooks");

  return useNewHooks ? (
    <ProductListNew {...props} />
  ) : (
    <ProductListOld {...props} />
  );
}
```

### 3. Gradual Migration

Migrate components one by one:

1. Start with simple components (no complex state)
2. Move to components with basic API calls
3. Finally migrate complex components with multiple state interactions

### 4. Monitoring

Add monitoring to catch issues early:

```javascript
import { useEffect } from "react";
import { logError } from "../utils/monitoring";

function MigratedComponent() {
  const { data, error } = useCustomHook();

  useEffect(() => {
    if (error) {
      logError("Hook error in MigratedComponent", {
        error,
        component: "MigratedComponent",
        hook: "useCustomHook",
      });
    }
  }, [error]);

  // Component logic...
}
```

## Best Practices for Migration

### 1. Migrate Incrementally

- Don't migrate all components at once
- Start with leaf components (no child components using old patterns)
- Move up the component tree gradually

### 2. Maintain Backward Compatibility

- Keep old components working during migration
- Use feature flags or conditional rendering
- Ensure APIs remain stable

### 3. Update Documentation

- Update component documentation
- Add examples of new hook usage
- Document any breaking changes

### 4. Team Communication

- Inform team about migration progress
- Share learnings and best practices
- Coordinate to avoid conflicts

### 5. Performance Monitoring

- Monitor bundle size changes
- Check for performance regressions
- Optimize hooks if needed

## Migration Checklist

- [ ] Backup original components
- [ ] Identify components to migrate
- [ ] Plan migration order (simple → complex)
- [ ] Update imports to use new hooks
- [ ] Replace manual state management with hooks
- [ ] Update tests
- [ ] Test functionality thoroughly
- [ ] Update documentation
- [ ] Deploy with feature flags
- [ ] Monitor for issues
- [ ] Remove old code after verification

## Troubleshooting Common Issues

### Issue 1: Hook Rules Violations

**Problem:** Hooks called conditionally or in loops
**Solution:** Ensure hooks are always called at the top level

### Issue 2: Infinite Re-renders

**Problem:** Missing dependencies in useEffect
**Solution:** Use ESLint plugin and proper dependency arrays

### Issue 3: State Not Updating

**Problem:** Incorrect hook usage or stale closures
**Solution:** Review hook implementation and dependencies

### Issue 4: Performance Issues

**Problem:** Too many re-renders or heavy computations
**Solution:** Use useMemo, useCallback, and optimize hook logic

This migration guide should help you systematically refactor your components to use the new custom hooks while maintaining functionality and minimizing risks.
