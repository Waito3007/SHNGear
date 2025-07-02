# 🚨 Logic Fallback và Escalation

## 📋 Tổng quan

Hệ thống fallback và escalation đảm bảo người dùng luôn nhận được hỗ trợ tốt nhất, ngay cả khi AI không thể xử lý được câu hỏi.

## 🎯 Tiêu chí Escalation

### 1. Confidence Score Thresholds

```typescript
const CONFIDENCE_THRESHOLDS = {
  HIGH: 0.8, // AI tự tin cao → Trả lời trực tiếp
  MEDIUM: 0.6, // AI tự tin trung bình → Trả lời + xác nhận
  LOW: 0.4, // AI tự tin thấp → Escalate
  VERY_LOW: 0.2, // AI không hiểu → Escalate ngay
};
```

### 2. Auto-Escalation Triggers

#### A. Confidence Score thấp

```
- Confidence < 0.4: Escalate ngay lập tức
- Confidence 0.4-0.6: Đưa ra lựa chọn escalate
- 3 lần liên tiếp confidence < 0.6: Escalate tự động
```

#### B. User Frustration Detection

```
Từ khóa frustration:
- "không hiểu", "sai rồi", "không đúng"
- "tôi cần nói chuyện với người thật"
- "chuyển tôi đến nhân viên"
- "không hài lòng", "thất vọng"

Pattern:
- 2+ tin nhắn liên tiếp có từ khóa negative
- User gửi tin nhắn ngắn (<5 từ) nhiều lần
- User repeat cùng 1 câu hỏi >2 lần
```

#### C. Complex Query Detection

```
Technical Keywords:
- "lỗi phức tạp", "không khắc phục được"
- "kỹ thuật viên", "chuyên gia"
- "warranty claim", "technical support"

Business Keywords:
- "khiếu nại", "đền bù", "hoàn tiền"
- "pháp lý", "legal", "dispute"
- "escalate", "manager", "supervisor"
```

#### D. VIP Customer Auto-Priority

```
- VIP Level 3: Escalate ngay lập tức
- VIP Level 2: Escalate nếu confidence < 0.7
- VIP Level 1: Escalate nếu confidence < 0.5
- High-value order (>50M): Priority escalation
```

## 🔄 Escalation Flow

### Level 1: AI Fallback Responses

```typescript
const FALLBACK_RESPONSES = {
  low_confidence: {
    message:
      "Tôi chưa chắc chắn về câu trả lời này. Để đảm bảo thông tin chính xác, bạn có muốn tôi kết nối với chuyên viên tư vấn không?",
    actions: ["Kết nối chuyên viên", "Thử câu hỏi khác", "Tìm hiểu thêm"],
  },

  unclear_intent: {
    message:
      "Tôi chưa hiểu rõ ý bạn. Bạn có thể diễn đạt lại hoặc chọn một trong các chủ đề sau:",
    actions: [
      "Tìm sản phẩm",
      "Kiểm tra đơn hàng",
      "Chính sách đổi trả",
      "Hỗ trợ kỹ thuật",
    ],
  },

  technical_issue: {
    message:
      "Đây có vẻ là vấn đề kỹ thuật phức tạp. Tôi sẽ kết nối bạn với team kỹ thuật để được hỗ trợ tốt nhất.",
    actions: ["Kết nối ngay", "Gọi hotline", "Email hỗ trợ"],
  },
};
```

### Level 2: Soft Escalation (AI + Human Backup)

```typescript
const SOFT_ESCALATION = {
  message:
    "Tôi đã ghi nhận yêu cầu của bạn và đang tìm hiểu thêm. Trong lúc chờ đợi, bạn có muốn tôi kết nối với chuyên viên để được hỗ trợ ngay không?",

  background_actions: [
    "Notify available agents",
    "Prepare conversation context",
    "Queue user in priority list",
  ],

  user_options: [
    "Đợi AI tìm hiểu thêm (2-3 phút)",
    "Kết nối chuyên viên ngay",
    "Để lại tin nhắn",
  ],
};
```

### Level 3: Hard Escalation (Transfer to Human)

```typescript
const HARD_ESCALATION = {
  immediate: {
    triggers: ["VIP customer", "complaint", "legal issue"],
    message:
      "Tôi đang kết nối bạn với chuyên viên ngay lập tức. Vui lòng chờ trong giây lát.",
    sla: "< 30 seconds",
  },

  standard: {
    triggers: ["technical support", "complex query"],
    message:
      "Tôi sẽ chuyển bạn đến chuyên viên phù hợp. Thời gian chờ dự kiến: 2-3 phút.",
    sla: "< 3 minutes",
  },

  queue: {
    triggers: ["high volume", "after hours"],
    message:
      "Hiện tại có nhiều khách hàng cần hỗ trợ. Bạn có thể chờ (dự kiến 5-10 phút) hoặc để lại tin nhắn để được gọi lại.",
    sla: "< 10 minutes",
  },
};
```

## 🧠 AI Context Handover

### Context Package cho Admin

```typescript
interface EscalationContext {
  session_id: string;
  user_profile: {
    name: string;
    email: string;
    phone: string;
    vip_level: number;
    order_history: Order[];
    previous_chats: ChatSession[];
  };

  conversation_summary: {
    main_topic: string;
    user_intent: string;
    current_issue: string;
    ai_attempts: number;
    confidence_scores: number[];
    frustration_level: "low" | "medium" | "high";
  };

  technical_context: {
    device_info?: string;
    error_codes?: string[];
    product_mentioned?: Product[];
    order_mentioned?: Order;
  };

  escalation_reason: {
    trigger: string;
    ai_limitation: string;
    urgency_level: "low" | "medium" | "high" | "critical";
    suggested_resolution: string;
  };
}
```

## 📊 Fallback Strategies

### 1. Knowledge Base Expansion

```
- Nếu AI không biết câu trả lời
- Tự động log câu hỏi vào "Unknown Questions"
- Admin review và thêm vào Knowledge Base
- AI học từ feedback của admin
```

### 2. Suggested Questions

```
- Khi user hỏi câu không rõ ràng
- AI đưa ra 3-5 câu hỏi liên quan
- "Có phải bạn muốn hỏi về..."
- Guided conversation flow
```

### 3. Contextual Help

```
- Dựa trên trang user đang xem
- Dựa trên sản phẩm trong giỏ hàng
- Dựa trên lịch sử mua hàng
- Proactive assistance
```

### 4. Multi-channel Fallback

```typescript
const FALLBACK_CHANNELS = {
  chat_unavailable: [
    "Hotline: 1900-xxx-xxx",
    "Email: support@shn-gear.com",
    "Facebook: fb.com/shn-gear",
    "Zalo OA: zalo.me/shn-gear",
  ],

  after_hours: [
    "Để lại tin nhắn → Gọi lại trong 2h",
    "Email support → Phản hồi trong 24h",
    "FAQ tự động",
    "Video hướng dẫn",
  ],
};
```

## 🎯 Performance Metrics

### Success Metrics

- **AI Resolution Rate**: >80% câu hỏi được AI giải quyết
- **Escalation Rate**: <20% tin nhắn cần escalate
- **User Satisfaction**: >4.0/5.0 stars
- **Response Time**: <2s cho AI, <30s cho human handover

### Quality Metrics

- **False Escalation**: <5% (AI escalate không cần thiết)
- **Missed Escalation**: <2% (Nên escalate nhưng không)
- **Context Retention**: >95% thông tin được truyền tải đúng
- **First Contact Resolution**: >85% vấn đề được giải quyết ngay lần đầu

## 🔧 Implementation Example

```typescript
class EscalationManager {
  async evaluateEscalation(
    context: ConversationContext,
    response: AIResponse
  ): Promise<EscalationDecision> {
    const factors = {
      confidence: response.confidence,
      frustration: this.detectFrustration(context),
      complexity: this.assessComplexity(context.lastMessage),
      userProfile: context.user.vipLevel,
      attempts: context.aiAttempts,
    };

    const score = this.calculateEscalationScore(factors);

    if (score > 0.8) {
      return {
        shouldEscalate: true,
        urgency: "high",
        reason: "High escalation score",
        channel: "immediate_transfer",
      };
    }

    if (score > 0.6) {
      return {
        shouldEscalate: true,
        urgency: "medium",
        reason: "Medium confidence issues",
        channel: "soft_escalation",
      };
    }

    return {
      shouldEscalate: false,
      suggestions: this.generateFallbackSuggestions(factors),
    };
  }

  private detectFrustration(context: ConversationContext): number {
    const frustrationKeywords = ["không hiểu", "sai", "thất vọng"];
    const recentMessages = context.messages.slice(-5);

    let frustrationScore = 0;

    for (const msg of recentMessages) {
      if (frustrationKeywords.some((kw) => msg.content.includes(kw))) {
        frustrationScore += 0.3;
      }

      if (msg.content.length < 5 && msg.sender === "user") {
        frustrationScore += 0.1;
      }
    }

    return Math.min(frustrationScore, 1.0);
  }
}
```

## 📝 Escalation Playbooks

### Playbook 1: Technical Support

```
1. AI attempts basic troubleshooting
2. If unresolved → Transfer to L1 tech support
3. L1 escalates to L2 if needed
4. L2 escalates to vendor support if needed
5. Keep user informed at each step
```

### Playbook 2: Order Issues

```
1. AI checks order status automatically
2. If complex issue → Transfer to order specialist
3. Specialist has full order context
4. Real-time resolution with order system
5. Follow-up confirmation
```

### Playbook 3: Product Consultation

```
1. AI provides basic product info
2. If detailed consultation needed → Transfer to sales
3. Sales specialist with product expertise
4. Can offer personalized recommendations
5. Direct purchase assistance
```

### Playbook 4: Complaints

```
1. Immediate escalation to customer care manager
2. Priority handling within 15 minutes
3. Full conversation context provided
4. Manager empowered to resolve immediately
5. Follow-up satisfaction survey
```

Hệ thống fallback và escalation này đảm bảo không có khách hàng nào bị "bỏ lại" và luôn có path để giải quyết vấn đề một cách hiệu quả.
