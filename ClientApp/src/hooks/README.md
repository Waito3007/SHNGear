# SHNGear Custom Hooks

## 🎯 Overview

This directory contains a comprehensive collection of custom React hooks designed to improve code organization, reusability, and maintainability in the SHNGear e-commerce application. The hooks are organized into three main categories: API operations, Authentication, and UI utilities.

## 📁 Directory Structure

```
hooks/
├── api/                    # API-related hooks
│   ├── useApi.js          # Base API operations
│   ├── useProducts.js     # Product management
│   ├── useCart.js         # Shopping cart functionality
│   ├── useOrders.js       # Order management
│   ├── useReviews.js      # Review system
│   ├── useAddresses.js    # Address management
│   ├── useAdmin.js        # Admin functionality
│   ├── useChat.js         # Chat system with SignalR
│   └── useFeatures.js     # Special features (loyalty, vouchers, etc.)
├── auth/                  # Authentication hooks
│   └── useAuth.js         # Authentication and user management
├── ui/                    # UI utility hooks
│   └── useUI.js           # Form handling, pagination, modals, etc.
├── index.js               # Main export file
├── README.md              # This file
├── EXAMPLES.md            # Comprehensive usage examples
└── MIGRATION.md           # Guide for migrating existing components
```

## 🚀 Quick Start

### Installation

The hooks are already integrated into the project. Simply import what you need:

```javascript
// Import specific hooks
import { useProducts, useCart, useAuth } from "../hooks";

// Import all hooks
import * as hooks from "../hooks";

// Import by category
import { useProducts } from "../hooks/api/useProducts";
```

### Basic Usage

```javascript
import React from "react";
import { useProducts, useCart, useAuth } from "../hooks";

function ProductPage() {
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          {isAuthenticated && (
            <button onClick={() => addItem(product.id, 1)}>Add to Cart</button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## 📚 Documentation

### Core Documentation

- **[EXAMPLES.md](./EXAMPLES.md)** - Comprehensive usage examples for all hooks
- **[MIGRATION.md](./MIGRATION.md)** - Guide for migrating existing components to use hooks

### Hook Categories

#### 🔌 API Hooks (`/api`)

Handle all backend communication and data management:

- **`useApi`** - Base API operations with error handling and loading states
- **`useProducts`** - Product listing, searching, filtering, and management
- **`useCart`** - Shopping cart operations for both authenticated and guest users
- **`useOrders`** - Order creation, tracking, and history management
- **`useReviews`** - Product review system with moderation capabilities
- **`useAddresses`** - User address management and shipping zones
- **`useAdmin`** - Administrative functions for user and product management
- **`useChat`** - Real-time chat system with SignalR integration
- **`useFeatures`** - Special features like flash sales, loyalty programs, and vouchers

#### 🔐 Authentication Hooks (`/auth`)

Manage user authentication and authorization:

- **`useAuth`** - Complete authentication system with login, registration, and profile management

#### 🎨 UI Hooks (`/ui`)

Provide reusable UI functionality:

- **`useUI`** - Collection of utility hooks for forms, pagination, modals, and common UI patterns

## 🛠️ Hook Features

### Common Features Across All Hooks

- ✅ **Loading States** - Automatic loading state management
- ✅ **Error Handling** - Consistent error handling patterns
- ✅ **Caching** - Smart data caching and synchronization
- ✅ **Optimistic Updates** - Immediate UI updates with rollback on failure
- ✅ **Automatic Retry** - Retry failed requests with exponential backoff
- ✅ **Performance Optimization** - Uses `useCallback` and `useMemo` appropriately
- ✅ **TypeScript Ready** - Structured for easy TypeScript migration
- ✅ **Testing Friendly** - Designed for easy mocking and testing

### API Hook Features

- 🔄 **CRUD Operations** - Create, Read, Update, Delete patterns
- 📄 **Pagination** - Built-in pagination support
- 🔍 **Search & Filtering** - Debounced search with advanced filtering
- 🎯 **Real-time Updates** - SignalR integration for live data
- 💾 **Local Storage** - Automatic persistence for offline support
- 🔐 **Authentication** - Automatic token management

### UI Hook Features

- 📝 **Form Management** - Complete form state with validation
- 🎛️ **Advanced Controls** - Pagination, modals, tooltips, and more
- 📱 **Responsive Utilities** - Window size and scroll position tracking
- ⌨️ **Keyboard Navigation** - Keyboard event handling
- 🖱️ **Mouse Interactions** - Click outside detection and hover states
- 📋 **Clipboard Operations** - Copy/paste functionality
- 📤 **File Upload** - File handling with progress tracking

## 🎯 Use Cases

### E-commerce Operations

```javascript
// Product catalog with search and filters
const { products, loading, search, filter } = useProducts();

// Shopping cart management
const { items, addItem, removeItem, totalPrice } = useCart();

// Order processing
const { createOrder, trackOrder, orderHistory } = useOrders();
```

### User Management

```javascript
// Authentication
const { user, login, logout, isAuthenticated } = useAuth();

// User reviews and ratings
const { submitReview, userReviews, productRating } = useReviews();

// Address management
const { addresses, addAddress, setDefaultAddress } = useAddresses();
```

### Administrative Functions

```javascript
// Admin dashboard
const { users, products, analytics } = useAdmin();

// Customer support chat
const { messages, sendMessage, customerList } = useChat();

// Special promotions
const { flashSales, loyaltyPoints, vouchers } = useFeatures();
```

### UI Enhancement

```javascript
// Form handling
const { values, errors, handleSubmit } = useForm();

// Pagination
const { currentPage, totalPages, goToPage } = usePagination();

// Modal management
const { isOpen, openModal, closeModal } = useModal();
```

## 🏗️ Architecture

### Design Principles

1. **Single Responsibility** - Each hook has a clear, focused purpose
2. **Composition** - Hooks can be combined for complex functionality
3. **Consistency** - Similar patterns across all hooks
4. **Performance** - Optimized for minimal re-renders
5. **Error Resilience** - Graceful error handling and recovery
6. **Developer Experience** - Easy to use with clear APIs

### State Management

- **Local State** - Component-specific state using `useState`
- **Shared State** - Cross-component state using Context API
- **Persistent State** - Local/session storage for data persistence
- **Server State** - API data with caching and synchronization

### Error Boundaries

All hooks implement consistent error handling:

```javascript
const { data, loading, error, retry } = useApiHook();

if (error) {
  return <ErrorComponent error={error} onRetry={retry} />;
}
```

## 🔧 Configuration

### Environment Variables

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.shngear.com
REACT_APP_API_TIMEOUT=30000

# SignalR Configuration
REACT_APP_SIGNALR_HUB_URL=https://api.shngear.com/chathub

# Feature Flags
REACT_APP_ENABLE_CHAT=true
REACT_APP_ENABLE_LOYALTY_PROGRAM=true
```

### Hook Configuration

Many hooks accept configuration options:

```javascript
const { products } = useProducts({
  autoLoad: true, // Load data on mount
  cacheTimeout: 300000, // Cache for 5 minutes
  retryAttempts: 3, // Retry failed requests 3 times
  enableRealtime: true, // Enable real-time updates
});
```

## 🧪 Testing

### Testing Hooks

```javascript
import { renderHook, act } from "@testing-library/react-hooks";
import { useProducts } from "../hooks";

test("should load products", async () => {
  const { result, waitForNextUpdate } = renderHook(() => useProducts());

  expect(result.current.loading).toBe(true);
  await waitForNextUpdate();
  expect(result.current.products).toHaveLength(10);
});
```

### Mocking Hooks

```javascript
jest.mock("../hooks", () => ({
  useProducts: jest.fn(() => ({
    products: mockProducts,
    loading: false,
    error: null,
  })),
}));
```

## 📈 Performance

### Optimization Strategies

1. **Memoization** - Using `useMemo` for expensive calculations
2. **Callback Optimization** - Using `useCallback` for event handlers
3. **Debouncing** - Reducing API calls for search and filters
4. **Lazy Loading** - Loading data only when needed
5. **Caching** - Intelligent data caching with invalidation
6. **Bundle Splitting** - Tree-shaking unused hook code

### Performance Monitoring

```javascript
// Built-in performance tracking
const { data, loading, performanceMetrics } = useProducts();

console.log(`API call took ${performanceMetrics.duration}ms`);
```

## 🔄 Migration Guide

For migrating existing components to use these hooks, see [MIGRATION.md](./MIGRATION.md).

### Quick Migration Steps

1. **Identify** components with repetitive state management
2. **Replace** `useState` and `useEffect` with appropriate custom hooks
3. **Update** imports and remove unused code
4. **Test** thoroughly to ensure functionality is preserved
5. **Optimize** by combining multiple hooks where beneficial

## 🤝 Contributing

### Adding New Hooks

1. Follow the established patterns in existing hooks
2. Include comprehensive JSDoc comments
3. Add error handling and loading states
4. Optimize for performance
5. Write tests and documentation
6. Update the main index file

### Hook Template

```javascript
/**
 * Custom hook for [functionality description]
 * @param {Object} options - Configuration options
 * @returns {Object} Hook state and methods
 */
export const useCustomHook = (options = {}) => {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Hook logic here...

  return {
    // State
    data: state,
    loading,
    error,

    // Methods
    action: useCallback(() => {
      // Action implementation
    }, []),
  };
};
```

## 🐛 Troubleshooting

### Common Issues

**Hook Rules Violations**

- Ensure hooks are called at the top level of components
- Don't call hooks inside loops, conditions, or nested functions

**Infinite Re-renders**

- Check dependency arrays in `useEffect`
- Use `useCallback` and `useMemo` appropriately

**State Not Updating**

- Verify state updates are immutable
- Check for stale closures in async operations

**Performance Issues**

- Use React DevTools Profiler to identify bottlenecks
- Optimize expensive calculations with `useMemo`
- Debounce frequent API calls

### Debug Mode

Enable debug logging:

```javascript
const { data, loading, error } = useProducts({ debug: true });
```

## 📞 Support

For questions, issues, or contributions:

1. Check existing documentation
2. Review example usage in [EXAMPLES.md](./EXAMPLES.md)
3. Follow migration guide in [MIGRATION.md](./MIGRATION.md)
4. Create an issue with detailed reproduction steps

## 🗺️ Roadmap

### Upcoming Features

- [ ] TypeScript conversion for better type safety
- [ ] More granular error handling with error boundaries
- [ ] Offline support with service workers
- [ ] Advanced caching strategies
- [ ] Performance analytics and monitoring
- [ ] Automated testing suite
- [ ] Storybook integration for hook documentation

### Version History

- **v1.0.0** - Initial implementation with core hooks
- **v1.1.0** - Added chat and admin functionality
- **v1.2.0** - Enhanced UI hooks and performance optimizations

---

**Built with ❤️ for the SHNGear team**

This hook system provides a solid foundation for maintainable, reusable React code. Happy coding! 🚀
