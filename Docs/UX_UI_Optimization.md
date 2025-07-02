# 🎨 UX/UI Optimization cho AI Chat

## 📱 Visual Design Principles

### 1. Conversational Interface Design

#### A. Message Bubble Design

```css
/* User messages - Right aligned */
.user-message {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 18px 18px 4px 18px;
  margin-left: 60px;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* AI messages - Left aligned */
.ai-message {
  background: #f8f9ff;
  color: #2d3748;
  border-radius: 18px 18px 18px 4px;
  margin-right: 60px;
  border: 1px solid #e2e8f0;
  position: relative;
}

/* AI avatar */
.ai-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #4fd1c7, #06b6d4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
```

#### B. Typing Indicators

```jsx
const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-bubble">
      <div className="typing-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <span className="typing-text">SHN Assistant đang soạn tin...</span>
  </div>
);

// CSS Animation
.typing-dots span {
  animation: typing 1.4s infinite ease-in-out;
}
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

### 2. Smart Suggestions & Quick Replies

#### A. Contextual Suggestions

```jsx
const SmartSuggestions = ({ context, onSuggestionClick }) => {
  const suggestions = useMemo(() => {
    switch (context.state) {
      case "greeting":
        return [
          { text: "🔍 Tìm sản phẩm", action: "search_products" },
          { text: "📦 Kiểm tra đơn hàng", action: "check_order" },
          { text: "💬 Hỗ trợ kỹ thuật", action: "support" },
          { text: "🎁 Khuyến mãi hot", action: "promotions" },
        ];

      case "product_search":
        return [
          { text: "📱 Điện thoại", action: "category:phone" },
          { text: "💻 Laptop", action: "category:laptop" },
          { text: "🎧 Tai nghe", action: "category:headphone" },
          { text: "⚡ Gaming gear", action: "category:gaming" },
        ];

      case "price_inquiry":
        return [
          { text: "💰 Dưới 10 triệu", action: "budget:10m" },
          { text: "💎 10-20 triệu", action: "budget:20m" },
          { text: "🔥 Trên 20 triệu", action: "budget:20m+" },
          { text: "🎯 So sánh giá", action: "compare_price" },
        ];
    }
  }, [context.state]);

  return (
    <div className="smart-suggestions">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          className="suggestion-chip"
          onClick={() => onSuggestionClick(suggestion)}
        >
          {suggestion.text}
        </button>
      ))}
    </div>
  );
};
```

#### B. Quick Actions Bar

```jsx
const QuickActionsBar = ({ onAction }) => (
  <div className="quick-actions-bar">
    <button className="quick-action" onClick={() => onAction("search")}>
      <SearchIcon />
      <span>Tìm kiếm</span>
    </button>

    <button className="quick-action" onClick={() => onAction("order_status")}>
      <PackageIcon />
      <span>Đơn hàng</span>
    </button>

    <button className="quick-action" onClick={() => onAction("support")}>
      <HeadphonesIcon />
      <span>Hỗ trợ</span>
    </button>

    <button className="quick-action" onClick={() => onAction("promotions")}>
      <GiftIcon />
      <span>Khuyến mãi</span>
    </button>
  </div>
);
```

### 3. Progressive Disclosure & Smart Forms

#### A. Guided Product Discovery

```jsx
const ProductDiscoveryFlow = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const steps = [
    {
      question: "Bạn đang tìm loại sản phẩm nào?",
      type: "category_select",
      options: ["Điện thoại", "Laptop", "Tai nghe", "Phụ kiện"],
    },
    {
      question: "Ngân sách dự kiến của bạn?",
      type: "budget_slider",
      min: 1000000,
      max: 50000000,
    },
    {
      question: "Mục đích sử dụng chính?",
      type: "usage_select",
      options: ["Công việc", "Gaming", "Học tập", "Giải trí"],
    },
  ];

  return (
    <div className="discovery-flow">
      <ProgressBar current={step} total={steps.length} />
      <StepComponent step={steps[step - 1]} onChange={setFormData} />
      <NavigationButtons onNext={() => setStep((s) => s + 1)} />
    </div>
  );
};
```

#### B. Smart Input with Auto-complete

```jsx
const SmartInput = ({ onSend, suggestions }) => {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = useMemo(
    () =>
      suggestions
        .filter((s) => s.toLowerCase().includes(input.toLowerCase()))
        .slice(0, 5),
    [input, suggestions]
  );

  return (
    <div className="smart-input-container">
      <div className="input-wrapper">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhập tin nhắn..."
          onFocus={() => setShowSuggestions(true)}
        />

        <div className="input-actions">
          <button className="attach-btn">📎</button>
          <button className="voice-btn">🎤</button>
          <button className="send-btn" onClick={() => onSend(input)}>
            ➤
          </button>
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="auto-suggestions">
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              className="suggestion-item"
              onClick={() => {
                setInput(suggestion);
                setShowSuggestions(false);
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 4. Rich Message Types

#### A. Product Cards

```jsx
const ProductCard = ({ product, onAction }) => (
  <div className="product-card">
    <div className="product-image">
      <img src={product.image} alt={product.name} />
      {product.discount && (
        <div className="discount-badge">-{product.discount}%</div>
      )}
    </div>

    <div className="product-info">
      <h4>{product.name}</h4>
      <div className="price-info">
        {product.originalPrice && (
          <span className="original-price">{product.originalPrice}</span>
        )}
        <span className="current-price">{product.price}</span>
      </div>

      <div className="product-features">
        {product.features.slice(0, 3).map((feature) => (
          <span key={feature} className="feature-tag">
            {feature}
          </span>
        ))}
      </div>
    </div>

    <div className="product-actions">
      <button
        className="btn-secondary"
        onClick={() => onAction("view", product)}
      >
        Xem chi tiết
      </button>
      <button
        className="btn-primary"
        onClick={() => onAction("add_cart", product)}
      >
        Thêm giỏ hàng
      </button>
    </div>
  </div>
);
```

#### B. Order Status Cards

```jsx
const OrderStatusCard = ({ order }) => (
  <div className="order-status-card">
    <div className="order-header">
      <span className="order-id">#{order.id}</span>
      <span className={`status-badge status-${order.status}`}>
        {order.statusText}
      </span>
    </div>

    <div className="order-timeline">
      {order.timeline.map((step, index) => (
        <div
          key={index}
          className={`timeline-step ${step.completed ? "completed" : ""}`}
        >
          <div className="step-icon">{step.icon}</div>
          <div className="step-info">
            <div className="step-title">{step.title}</div>
            <div className="step-time">{step.time}</div>
          </div>
        </div>
      ))}
    </div>

    <div className="order-actions">
      <button onClick={() => trackOrder(order.id)}>
        📍 Theo dõi vận chuyển
      </button>
      <button onClick={() => viewOrderDetails(order.id)}>
        📄 Chi tiết đơn hàng
      </button>
    </div>
  </div>
);
```

### 5. Micro-interactions & Animations

#### A. Message Animations

```css
/* Message slide-in animation */
@keyframes slideInMessage {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.message {
  animation: slideInMessage 0.3s ease-out;
}

/* Pulse animation for new messages */
@keyframes pulseNotification {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.new-message {
  animation: pulseNotification 0.5s ease-in-out;
}
```

#### B. Loading States

```jsx
const MessageSkeleton = () => (
  <div className="message-skeleton">
    <div className="skeleton-avatar"></div>
    <div className="skeleton-content">
      <div className="skeleton-line skeleton-line-1"></div>
      <div className="skeleton-line skeleton-line-2"></div>
      <div className="skeleton-line skeleton-line-3"></div>
    </div>
  </div>
);

// CSS for skeleton loading
.skeleton-line {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### 6. Accessibility & Inclusivity

#### A. Keyboard Navigation

```jsx
const ChatInput = () => {
  const handleKeyDown = (e) => {
    switch (e.key) {
      case "Enter":
        if (e.shiftKey) {
          // New line
          return;
        } else {
          // Send message
          e.preventDefault();
          sendMessage();
        }
        break;

      case "ArrowUp":
        // Edit last message
        if (e.altKey) {
          editLastMessage();
        }
        break;

      case "Escape":
        // Clear input
        clearInput();
        break;
    }
  };

  return (
    <textarea
      onKeyDown={handleKeyDown}
      aria-label="Nhập tin nhắn chat"
      placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter để xuống dòng)"
    />
  );
};
```

#### B. Screen Reader Support

```jsx
const Message = ({ message, isAI }) => (
  <div
    className={`message ${isAI ? "ai-message" : "user-message"}`}
    role="log"
    aria-live={isAI ? "polite" : "off"}
    aria-label={`${isAI ? "Tin nhắn từ AI" : "Tin nhắn của bạn"}: ${
      message.content
    }`}
  >
    <div className="message-content">{message.content}</div>

    <div className="message-meta">
      <time
        dateTime={message.timestamp}
        aria-label={`Gửi lúc ${formatTime(message.timestamp)}`}
      >
        {formatTime(message.timestamp)}
      </time>
    </div>
  </div>
);
```

### 7. Performance Optimizations

#### A. Virtual Scrolling for Long Conversations

```jsx
const VirtualizedMessageList = ({ messages }) => {
  const { scrollElementRef, wrapperProps, list } = useVirtual({
    size: messages.length,
    estimateSize: useCallback(() => 80, []), // Estimated message height
    overscan: 5,
  });

  return (
    <div ref={scrollElementRef} className="message-list-container">
      <div {...wrapperProps}>
        {list.map((virtualRow) => (
          <div
            key={virtualRow.index}
            className="virtual-message-wrapper"
            style={{
              height: virtualRow.size,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <Message message={messages[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

#### B. Optimistic UI Updates

```jsx
const useChatOptimistic = () => {
  const [messages, setMessages] = useState([]);
  const [optimisticMessages, setOptimisticMessages] = useState([]);

  const sendMessage = async (content) => {
    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      content,
      sender: "user",
      timestamp: new Date(),
      status: "sending",
    };

    // Add optimistic message immediately
    setOptimisticMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await chatAPI.sendMessage(content);

      // Remove optimistic message and add real ones
      setOptimisticMessages((prev) => prev.filter((m) => m.id !== tempId));
      setMessages((prev) => [
        ...prev,
        response.userMessage,
        response.aiMessage,
      ]);
    } catch (error) {
      // Mark message as failed
      setOptimisticMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, status: "failed" } : m))
      );
    }
  };

  return {
    allMessages: [...messages, ...optimisticMessages],
    sendMessage,
  };
};
```

### 8. Mobile-First Responsive Design

#### A. Touch-Friendly Interface

```css
/* Mobile optimizations */
@media (max-width: 768px) {
  .chat-container {
    height: 100vh;
    height: 100dvh; /* Dynamic viewport height */
  }

  .suggestion-chip {
    min-height: 44px; /* Apple's recommended touch target */
    min-width: 44px;
    padding: 8px 16px;
  }

  .message {
    font-size: 16px; /* Prevent zoom on iOS */
    line-height: 1.4;
  }

  .input-wrapper {
    padding: 12px;
    background: white;
    border-top: 1px solid #e0e0e0;
    /* Safe area for iPhone notch */
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}
```

#### B. Gesture Support

```jsx
const SwipeableMessage = ({ message, onSwipe }) => {
  const [{ x }, api] = useSpring(() => ({ x: 0 }));

  const bind = useDrag(
    ({ active, movement: [mx], direction: [xDir], cancel }) => {
      if (active && Math.abs(mx) > 50) {
        cancel();
        onSwipe(message, xDir > 0 ? "right" : "left");
      }

      api.start({
        x: active ? mx : 0,
        immediate: active,
      });
    }
  );

  return (
    <animated.div {...bind()} style={{ x }} className="swipeable-message">
      <Message message={message} />
    </animated.div>
  );
};
```

### 9. Dark Mode Support

```css
/* CSS Variables for theming */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9ff;
  --text-primary: #2d3748;
  --text-secondary: #718096;
  --border-color: #e2e8f0;
  --shadow: rgba(0, 0, 0, 0.1);
}

[data-theme="dark"] {
  --bg-primary: #1a202c;
  --bg-secondary: #2d3748;
  --text-primary: #f7fafc;
  --text-secondary: #a0aec0;
  --border-color: #4a5568;
  --shadow: rgba(0, 0, 0, 0.3);
}

.chat-container {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}
```

### 10. Error States & Offline Support

```jsx
const ChatErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="offline-state">
        <div className="offline-icon">📵</div>
        <h3>Không có kết nối</h3>
        <p>Vui lòng kiểm tra kết nối internet và thử lại</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="error-state">
        <div className="error-icon">⚠️</div>
        <h3>Đã xảy ra lỗi</h3>
        <p>Chat tạm thời không khả dụng. Vui lòng thử lại sau</p>
        <button onClick={() => setHasError(false)}>Thử lại</button>
      </div>
    );
  }

  return children;
};
```

Những tối ưu UX/UI này sẽ tạo ra trải nghiệm chat AI mượt mà, thân thiện và chuyên nghiệp cho người dùng SHN-Gear.
