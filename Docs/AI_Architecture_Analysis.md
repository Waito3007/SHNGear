# 🏗️ Kiến trúc Logic AI cho Hệ thống Chat Realtime

## 📋 Sơ đồ Kiến trúc AI

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│     USER        │───▶│    CHAT SYSTEM   │───▶│   AI AGENT      │
│                 │    │                  │    │                 │
│ Web/Mobile App  │◀───│  ChatController  │◀───│   AIService     │
└─────────────────┘    │  ChatHub (SignalR│    │                 │
                       │  ChatService)    │    │ KnowledgeBase   │
┌─────────────────┐    │                  │    │ Intent Analysis │
│     ADMIN       │───▶│                  │    │ Response Gen    │
│                 │    │                  │    └─────────────────┘
│ Admin Dashboard │◀───│                  │           │
└─────────────────┘    └──────────────────┘           │
                              │                       │
                              ▼                       ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │    DATABASE      │    │   EXTERNAL APIs │
                       │                  │    │                 │
                       │ ChatSessions     │    │ Payment APIs    │
                       │ ChatMessages     │    │ Shipping APIs   │
                       │ AIKnowledgeBase  │    │ Product APIs    │
                       │ Users/Products   │    │ Order APIs      │
                       └──────────────────┘    └─────────────────┘
```

## 🔄 Luồng Giao tiếp

### A. User → AI Agent

```
1. User gửi tin nhắn
2. ChatController nhận request
3. ChatService xử lý và lưu message
4. AIService phân tích intent
5. AI tìm kiếm knowledge base
6. Trả về response + confidence score
7. Nếu confidence < threshold → escalate to admin
8. SignalR broadcast response realtime
```

### B. User → Admin (Escalation)

```
1. AI không thể trả lời (confidence thấp)
2. User yêu cầu nói chuyện với admin
3. System chuyển session sang "waiting_for_admin"
4. Notify admin dashboard
5. Admin nhận và phản hồi
6. SignalR đồng bộ conversation
```

### C. Admin → User (Proactive)

```
1. Admin chọn session từ dashboard
2. Gửi message trực tiếp
3. System mark session as "admin_handling"
4. User nhận response realtime
5. Context được bảo toàn
```

## 🎯 Message Routing Logic

```csharp
public enum MessageRouting
{
    AI_AUTO,           // Tự động xử lý bởi AI
    AI_WITH_CONFIRM,   // AI xử lý nhưng cần confirm
    ADMIN_REQUIRED,    // Chuyển trực tiếp cho admin
    ESCALATED         // Đã escalate từ AI
}

public class RoutingDecision
{
    public MessageRouting Route { get; set; }
    public double ConfidenceScore { get; set; }
    public string Reason { get; set; }
    public List<string> SuggestedActions { get; set; }
}
```

## 🧠 AI Decision Tree

```
Message Input
     │
     ▼
┌─────────────────┐
│ Intent Analysis │
│ - Greeting      │
│ - Product Query │
│ - Order Status  │
│ - Policy Q      │
│ - Technical     │
│ - Complaint     │
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Confidence Check│
│ High (>0.8)     │ ──→ AI Response
│ Med (0.5-0.8)   │ ──→ AI + Confirm
│ Low (<0.5)      │ ──→ Escalate
└─────────────────┘
     │
     ▼
┌─────────────────┐
│ Context Check   │
│ - Session State │
│ - User History  │
│ - Previous Msg  │
└─────────────────┘
```

## 📊 Performance Metrics

- **Response Time**: <2s cho AI, <30s cho admin
- **Accuracy**: >80% cho câu hỏi phổ biến
- **Escalation Rate**: <20% tin nhắn
- **User Satisfaction**: >4.0/5.0
- **Admin Workload**: <50 session/day/admin

## 🔧 Scalability Considerations

1. **AI Model**: Có thể tích hợp OpenAI, Azure Cognitive, hoặc custom model
2. **Caching**: Redis cho session + knowledge base
3. **Load Balancing**: Multiple AI service instances
4. **Database**: Partition theo ngày/tháng cho chat history
5. **Real-time**: SignalR scale-out với Redis backplane
