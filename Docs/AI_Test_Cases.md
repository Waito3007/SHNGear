# 🧪 Test Cases cho AI Chat System

## 📋 Tổng quan Test Strategy

Đảm bảo AI chat system hoạt động chính xác với các kịch bản thực tế và edge cases.

## 🎯 Test Categories

### 1. Intent Recognition Tests

#### A. Product Search Tests

```json
{
  "test_cases": [
    {
      "id": "PS001",
      "input": "Tôi muốn tìm điện thoại iPhone",
      "expected_intent": "product_search",
      "expected_entities": {
        "product_category": "phone",
        "brand": "iphone"
      },
      "confidence_threshold": 0.8
    },
    {
      "id": "PS002",
      "input": "Có laptop nào giá khoảng 15 triệu không?",
      "expected_intent": "product_search",
      "expected_entities": {
        "product_category": "laptop",
        "budget": 15000000
      },
      "confidence_threshold": 0.8
    },
    {
      "id": "PS003",
      "input": "Tai nghe gaming tốt",
      "expected_intent": "product_search",
      "expected_entities": {
        "product_category": "headphone",
        "usage": "gaming"
      },
      "confidence_threshold": 0.7
    }
  ]
}
```

#### B. Price Inquiry Tests

```json
{
  "test_cases": [
    {
      "id": "PI001",
      "input": "iPhone 15 Pro Max giá bao nhiêu?",
      "expected_intent": "price_inquiry",
      "expected_entities": {
        "product": "iPhone 15 Pro Max"
      },
      "confidence_threshold": 0.9
    },
    {
      "id": "PI002",
      "input": "Có khuyến mãi gì không?",
      "expected_intent": "price_inquiry",
      "confidence_threshold": 0.6
    }
  ]
}
```

#### C. Order Status Tests

```json
{
  "test_cases": [
    {
      "id": "OS001",
      "input": "Kiểm tra đơn hàng #12345",
      "expected_intent": "order_status",
      "expected_entities": {
        "order_id": "12345"
      },
      "confidence_threshold": 0.9
    },
    {
      "id": "OS002",
      "input": "Đơn hàng của tôi đã giao chưa?",
      "expected_intent": "order_status",
      "confidence_threshold": 0.8
    }
  ]
}
```

### 2. Context Continuity Tests

#### A. Multi-turn Conversation

```json
{
  "conversation_flow": [
    {
      "turn": 1,
      "user": "Tôi muốn mua laptop",
      "expected_ai": "Bạn muốn laptop cho mục đích gì? Gaming, văn phòng hay đồ họa?",
      "context_state": "product_discovery"
    },
    {
      "turn": 2,
      "user": "Để làm đồ họa",
      "expected_ai": "Ngân sách của bạn khoảng bao nhiêu?",
      "context_entities": {
        "product_category": "laptop",
        "usage": "graphics"
      }
    },
    {
      "turn": 3,
      "user": "Khoảng 25 triệu",
      "expected_ai": "Tôi gợi ý một số laptop phù hợp...",
      "context_entities": {
        "product_category": "laptop",
        "usage": "graphics",
        "budget": 25000000
      }
    }
  ]
}
```

#### B. Context Switch Tests

```json
{
  "test_cases": [
    {
      "id": "CS001",
      "scenario": "User switches from product search to order inquiry",
      "conversation": [
        "Tôi muốn mua iPhone",
        "À mà kiểm tra đơn hàng #67890 trước",
        "iPhone này có màu gì?"
      ],
      "expected_behavior": "AI should handle context switch and remember previous iPhone inquiry"
    }
  ]
}
```

### 3. Edge Cases Tests

#### A. Ambiguous Queries

```json
{
  "test_cases": [
    {
      "id": "AQ001",
      "input": "Cái này",
      "expected_response": "Bạn đang đề cập đến sản phẩm nào? Tôi có thể giúp bạn tìm hiểu thêm.",
      "should_escalate": false
    },
    {
      "id": "AQ002",
      "input": "Tốt không?",
      "expected_response": "Bạn muốn hỏi về sản phẩm nào? Hãy cho tôi biết thêm chi tiết.",
      "should_escalate": false
    }
  ]
}
```

#### B. Nonsensical Input

```json
{
  "test_cases": [
    {
      "id": "NS001",
      "input": "asdf qwerty xyz",
      "expected_behavior": "Polite confusion response + escalation offer",
      "confidence_threshold": 0.1
    },
    {
      "id": "NS002",
      "input": "!@#$%^&*()",
      "expected_behavior": "Request for clarification",
      "confidence_threshold": 0.0
    }
  ]
}
```

#### C. Extremely Long Messages

```json
{
  "test_cases": [
    {
      "id": "LM001",
      "input": "Lorem ipsum dolor sit amet... (500+ words)",
      "expected_behavior": "Extract key information, ask for clarification on main point",
      "max_processing_time": "3 seconds"
    }
  ]
}
```

### 4. Escalation Trigger Tests

#### A. Low Confidence Escalation

```json
{
  "test_cases": [
    {
      "id": "LC001",
      "input": "Sản phẩm bị lỗi nặng, cần đền bù",
      "expected_confidence": 0.3,
      "should_escalate": true,
      "escalation_reason": "complex_complaint"
    }
  ]
}
```

#### B. Frustration Detection

```json
{
  "conversation_sequence": [
    {
      "user": "Tôi hỏi mà sao không trả lời đúng?",
      "frustration_score": 0.4
    },
    {
      "user": "Không hiểu gì hết",
      "frustration_score": 0.7
    },
    {
      "user": "Chán quá, cho tôi nói chuyện với người thật",
      "expected_action": "immediate_escalation"
    }
  ]
}
```

### 5. Performance Tests

#### A. Response Time Tests

```json
{
  "performance_requirements": {
    "simple_query_response_time": "< 1 second",
    "complex_query_response_time": "< 3 seconds",
    "concurrent_users": 100,
    "throughput": "50 messages/second"
  }
}
```

#### B. Accuracy Tests

```json
{
  "accuracy_targets": {
    "intent_recognition": "> 85%",
    "entity_extraction": "> 80%",
    "knowledge_base_matching": "> 90%",
    "escalation_precision": "> 85%"
  }
}
```

## 🧪 Automated Test Framework

### Test Runner Implementation

```typescript
class AITestRunner {
  async runTestSuite(testSuite: TestSuite): Promise<TestResults> {
    const results = new TestResults();

    for (const testCase of testSuite.cases) {
      const result = await this.runSingleTest(testCase);
      results.add(result);
    }

    return results;
  }

  async runSingleTest(testCase: TestCase): Promise<TestResult> {
    const startTime = Date.now();

    try {
      const aiResponse = await this.aiService.processMessage(
        testCase.input,
        testCase.sessionId || this.generateSessionId()
      );

      const result = this.evaluateResponse(testCase, aiResponse);
      result.responseTime = Date.now() - startTime;

      return result;
    } catch (error) {
      return {
        testId: testCase.id,
        passed: false,
        error: error.message,
        responseTime: Date.now() - startTime,
      };
    }
  }

  private evaluateResponse(
    testCase: TestCase,
    aiResponse: AIResponse
  ): TestResult {
    const checks = {
      intentCorrect: testCase.expected_intent === aiResponse.intent,
      confidenceAboveThreshold:
        aiResponse.confidence >= testCase.confidence_threshold,
      entitiesExtracted: this.validateEntities(
        testCase.expected_entities,
        aiResponse.entities
      ),
      escalationAppropriate:
        testCase.should_escalate === aiResponse.requiresEscalation,
    };

    const passed = Object.values(checks).every((check) => check);

    return {
      testId: testCase.id,
      passed,
      details: checks,
      actualResponse: aiResponse,
      expectedResponse: testCase.expected_response,
    };
  }
}
```

## 📊 Test Data Management

### Test Data Generator

```typescript
class TestDataGenerator {
  generateProductSearchQueries(count: number): TestCase[] {
    const templates = [
      "Tôi muốn mua {product} {brand}",
      "Có {product} nào giá {budget} không?",
      "Tìm {product} tốt cho {usage}",
      "{product} {brand} có {feature} không?",
    ];

    const products = ["điện thoại", "laptop", "tai nghe"];
    const brands = ["iPhone", "Samsung", "Dell", "Asus"];
    const budgets = ["10 triệu", "15tr", "20 million"];

    return this.generateFromTemplates(templates, { products, brands, budgets });
  }

  generateNegativeTestCases(): TestCase[] {
    return [
      { input: "", expected_behavior: "request_input" },
      { input: "   ", expected_behavior: "request_input" },
      {
        input: new Array(1000).fill("a").join(""),
        expected_behavior: "length_limit_error",
      },
    ];
  }
}
```

## 🎯 Test Scenarios by User Journey

### Journey 1: First-time Buyer

```json
{
  "user_profile": {
    "type": "new_customer",
    "knowledge_level": "beginner"
  },
  "conversation_flow": [
    "Chào bạn, tôi muốn mua điện thoại",
    "Tôi không biết nên chọn loại nào",
    "Khoảng 10 triệu có điện thoại gì tốt?",
    "iPhone và Samsung khác nhau thế nào?",
    "Tôi chọn iPhone 15 được không?",
    "Làm sao để đặt mua?"
  ],
  "expected_ai_behavior": [
    "Welcome + gather requirements",
    "Educational approach + simple recommendations",
    "Budget-based filtering",
    "Detailed comparison",
    "Confirm choice + purchase guidance",
    "Step-by-step ordering process"
  ]
}
```

### Journey 2: Tech-savvy Customer

```json
{
  "user_profile": {
    "type": "power_user",
    "knowledge_level": "expert"
  },
  "conversation_flow": [
    "MacBook Pro M3 Max 16GB vs 32GB RAM performance difference?",
    "Có support PCIe 4.0 SSD upgrade không?",
    "Warranty coverage cho liquid damage?",
    "Bulk order discount cho 10 units?"
  ],
  "expected_ai_behavior": [
    "Technical detailed comparison",
    "Specific hardware specifications",
    "Detailed warranty terms",
    "Business sales escalation"
  ]
}
```

### Journey 3: Problem Resolution

```json
{
  "user_profile": {
    "type": "existing_customer",
    "issue_type": "product_defect"
  },
  "conversation_flow": [
    "Laptop tôi mua tuần trước bị lỗi màn hình",
    "Đã thử restart nhiều lần rồi",
    "Tôi muốn đổi máy mới",
    "Khi nào có thể lấy máy mới?"
  ],
  "expected_ai_behavior": [
    "Issue acknowledgment + information gathering",
    "Troubleshooting validation",
    "Return/exchange process explanation",
    "Timeline and next steps"
  ]
}
```

## 📈 Continuous Testing Strategy

### Daily Automated Tests

- Regression test suite (30 min)
- Performance benchmarks (15 min)
- New knowledge base validation (10 min)

### Weekly Comprehensive Tests

- Full intent recognition test (2 hours)
- Edge cases and stress testing (1 hour)
- User journey simulation (1 hour)

### Monthly AI Model Evaluation

- Accuracy assessment on real conversations
- False positive/negative analysis
- Knowledge base gap identification
- Performance trend analysis

## 🔍 Test Reporting Dashboard

```typescript
interface TestMetrics {
  accuracy: {
    intent_recognition: number;
    entity_extraction: number;
    response_relevance: number;
  };

  performance: {
    avg_response_time: number;
    p95_response_time: number;
    throughput: number;
  };

  escalation: {
    escalation_rate: number;
    false_escalation_rate: number;
    missed_escalation_rate: number;
  };

  user_satisfaction: {
    conversation_completion_rate: number;
    user_rating: number;
    issue_resolution_rate: number;
  };
}
```

Hệ thống test này đảm bảo AI chat luôn hoạt động ổn định và cải thiện liên tục dựa trên feedback thực tế.
