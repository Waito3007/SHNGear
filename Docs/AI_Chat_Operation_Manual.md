# 📚 Hướng dẫn Vận hành AI Chat System

## 🎯 Tổng quan

Tài liệu này hướng dẫn team kỹ thuật và vận hành cách quản lý, bảo trì và tối ưu hệ thống AI Chat của SHN-Gear.

## 👥 Phân quyền và Vai trò

### 1. AI Chat Administrator

**Quyền hạn:**

- Quản lý Knowledge Base
- Cấu hình escalation rules
- Xem analytics và reports
- Quản lý prompt templates
- Backup/restore dữ liệu

**Trách nhiệm:**

- Monitor AI performance daily
- Update knowledge base weekly
- Review escalation logs
- Optimize AI responses

### 2. Customer Service Manager

**Quyền hạn:**

- Xem dashboard chat sessions
- Quản lý team admin chat
- Cấu hình business hours
- Set priority rules

**Trách nhiệm:**

- Assign chats to admins
- Monitor response times
- Handle escalated cases
- Train new chat admins

### 3. Technical Support

**Quyền hạn:**

- Server monitoring
- Database maintenance
- Performance optimization
- Bug fixes and updates

**Trách nhiệm:**

- Ensure system uptime
- Handle technical escalations
- Maintain integrations
- Security monitoring

## 🔧 Quản lý Knowledge Base

### 1. Thêm Knowledge Base mới

```sql
-- Template thêm KB entry
INSERT INTO AIKnowledgeBase (
    Question, Answer, Keywords, Category,
    MinConfidenceScore, CreatedBy, CreatedAt
) VALUES (
    'iPhone 15 có màu gì?',
    'iPhone 15 có 5 màu: Hồng, Vàng, Xanh lá, Xanh dương, Đen. Tất cả đều có sẵn tại SHN-Gear với giá tốt nhất thị trường.',
    'iPhone 15,màu,color,pink,yellow,green,blue,black',
    'ProductInfo',
    0.7,
    'admin@shn-gear.com',
    GETDATE()
);
```

### 2. Cập nhật KB định kỳ

#### Hàng tuần:

```bash
# Script review unknown questions
python scripts/review_unknown_questions.py --week

# Output: unknowns_week_XX.csv
# Review manually và thêm vào KB
```

#### Hàng tháng:

```bash
# Optimize KB performance
python scripts/optimize_knowledge_base.py --month

# Remove duplicates
python scripts/remove_duplicate_kb.py

# Update confidence scores based on usage
python scripts/update_confidence_scores.py
```

### 3. Import/Export Knowledge Base

```python
# Export KB to CSV
import pandas as pd
from sqlalchemy import create_engine

def export_knowledge_base():
    engine = create_engine('mssql://...')
    df = pd.read_sql("""
        SELECT Question, Answer, Keywords, Category, MinConfidenceScore
        FROM AIKnowledgeBase
        WHERE IsActive = 1
    """, engine)
    df.to_csv(f'kb_export_{datetime.now().strftime("%Y%m%d")}.csv', index=False)

# Import KB from CSV
def import_knowledge_base(csv_file):
    df = pd.read_csv(csv_file)
    for _, row in df.iterrows():
        # Validate and insert
        insert_kb_entry(row)
```

## 🎛️ Cấu hình AI Parameters

### 1. Confidence Thresholds

```json
{
  "confidence_settings": {
    "high_confidence": 0.8,
    "medium_confidence": 0.6,
    "low_confidence": 0.4,
    "escalation_threshold": 0.3
  },

  "escalation_rules": {
    "vip_customer_threshold": 0.7,
    "technical_issue_threshold": 0.5,
    "complaint_threshold": 0.2,
    "consecutive_failures": 3
  }
}
```

### 2. Intent Recognition Tuning

```python
# Cập nhật intent patterns
def update_intent_patterns():
    patterns = {
        'product_search': [
            r'(tìm|kiếm|xem|có|bán).*?(điện thoại|laptop|tai nghe)',
            r'(muốn mua|cần|dự định mua).*?(iphone|samsung|macbook)',
            # Thêm patterns mới dựa trên data thực tế
        ],

        'price_inquiry': [
            r'(giá|bao nhiêu|tiền|cost|price)',
            r'(khuyến mãi|giảm giá|sale|discount)',
            # Patterns cho price
        ]
    }

    # Save to config file
    save_intent_config(patterns)
```

### 3. Response Templates

```python
# Templates cho từng intent
RESPONSE_TEMPLATES = {
    'product_search': {
        'found_products': """
        Tôi tìm thấy {count} sản phẩm phù hợp:

        {product_list}

        Bạn muốn xem chi tiết sản phẩm nào?
        """,

        'no_products': """
        Tôi chưa tìm thấy sản phẩm phù hợp.
        Bạn có thể mô tả rõ hơn:
        - Loại sản phẩm cụ thể
        - Ngân sách dự kiến
        - Mục đích sử dụng
        """
    },

    'greeting': {
        'new_user': "Xin chào! Tôi là SHN Assistant. Tôi có thể giúp bạn tìm sản phẩm công nghệ phù hợp. Bạn cần hỗ trợ gì?",
        'returning_user': "Chào {name}! Rất vui được gặp lại bạn. Hôm nay tôi có thể giúp gì?",
        'vip_user': "Xin chào {name}! Chào mừng thành viên VIP của SHN-Gear. Tôi sẵn sàng hỗ trợ bạn ⭐"
    }
}
```

## 📊 Monitoring và Analytics

### 1. Key Performance Indicators (KPIs)

#### A. AI Performance Metrics

```sql
-- Daily AI performance report
SELECT
    DATE(CreatedAt) as Date,
    COUNT(*) as TotalMessages,
    AVG(AIConfidenceScore) as AvgConfidence,
    COUNT(CASE WHEN RequiresEscalation = 1 THEN 1 END) as EscalationCount,
    COUNT(CASE WHEN RequiresEscalation = 1 THEN 1 END) * 100.0 / COUNT(*) as EscalationRate
FROM ChatMessages
WHERE CreatedAt >= DATEADD(day, -7, GETDATE())
    AND Sender = 'ai'
GROUP BY DATE(CreatedAt)
ORDER BY Date DESC;
```

#### B. User Satisfaction Metrics

```sql
-- Weekly satisfaction report
SELECT
    DATEPART(week, CreatedAt) as Week,
    AVG(CASE WHEN Metadata LIKE '%satisfaction%'
        THEN CAST(JSON_VALUE(Metadata, '$.satisfaction') as FLOAT)
        END) as AvgSatisfaction,
    COUNT(DISTINCT SessionId) as UniqueSessions,
    AVG(DATEDIFF(minute, MIN(CreatedAt), MAX(CreatedAt))) as AvgSessionDuration
FROM ChatMessages
WHERE CreatedAt >= DATEADD(week, -4, GETDATE())
GROUP BY DATEPART(week, CreatedAt);
```

### 2. Real-time Dashboard

```javascript
// Dashboard component showing live metrics
const AIPerformanceDashboard = () => {
  const [metrics, setMetrics] = useState({});

  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetch("/api/ai/metrics").then((r) => r.json());
      setMetrics(data);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-dashboard">
      <MetricCard
        title="AI Confidence Score"
        value={metrics.avgConfidence}
        format="percentage"
        status={metrics.avgConfidence > 0.7 ? "good" : "warning"}
      />

      <MetricCard
        title="Escalation Rate"
        value={metrics.escalationRate}
        format="percentage"
        status={metrics.escalationRate < 0.2 ? "good" : "warning"}
      />

      <MetricCard
        title="Response Time"
        value={metrics.avgResponseTime}
        format="duration"
        status={metrics.avgResponseTime < 2000 ? "good" : "warning"}
      />
    </div>
  );
};
```

### 3. Alert System

```python
# Automated alerts for AI performance issues
def check_ai_performance():
    metrics = get_last_hour_metrics()

    alerts = []

    # Check confidence score
    if metrics['avg_confidence'] < 0.6:
        alerts.append({
            'type': 'LOW_CONFIDENCE',
            'message': f'AI confidence dropped to {metrics["avg_confidence"]:.2f}',
            'severity': 'WARNING'
        })

    # Check escalation rate
    if metrics['escalation_rate'] > 0.3:
        alerts.append({
            'type': 'HIGH_ESCALATION',
            'message': f'Escalation rate increased to {metrics["escalation_rate"]:.2f}',
            'severity': 'CRITICAL'
        })

    # Check response time
    if metrics['avg_response_time'] > 5000:
        alerts.append({
            'type': 'SLOW_RESPONSE',
            'message': f'AI response time: {metrics["avg_response_time"]}ms',
            'severity': 'WARNING'
        })

    # Send alerts
    for alert in alerts:
        send_alert_notification(alert)

# Schedule to run every hour
schedule.every().hour.do(check_ai_performance)
```

## 🛠️ Troubleshooting Common Issues

### 1. AI Confidence thấp đột ngột

**Nguyên nhân có thể:**

- Knowledge Base outdated
- New product categories không có data
- Intent patterns không match với user behavior mới

**Cách xử lý:**

```bash
# 1. Analyze recent failed queries
python scripts/analyze_low_confidence.py --days 3

# 2. Review unknown questions
SELECT TOP 50 Content, AIIntent, AIConfidenceScore
FROM ChatMessages
WHERE AIConfidenceScore < 0.4
    AND CreatedAt > DATEADD(day, -3, GETDATE())
ORDER BY CreatedAt DESC;

# 3. Update KB with missing info
# 4. Retrain intent patterns if needed
```

### 2. Escalation Rate cao bất thường

**Debug checklist:**

```python
def debug_high_escalation():
    # Check escalation reasons
    reasons = db.query("""
        SELECT AIIntent, COUNT(*) as Count,
               AVG(AIConfidenceScore) as AvgConfidence
        FROM ChatMessages
        WHERE RequiresEscalation = 1
            AND CreatedAt > DATEADD(hour, -24, GETDATE())
        GROUP BY AIIntent
        ORDER BY Count DESC
    """)

    # Analyze conversation context
    sessions = db.query("""
        SELECT SessionId, COUNT(*) as MessageCount
        FROM ChatMessages cm
        WHERE EXISTS (
            SELECT 1 FROM ChatMessages cm2
            WHERE cm2.SessionId = cm.SessionId
                AND cm2.RequiresEscalation = 1
        )
        GROUP BY SessionId
        HAVING COUNT(*) > 5  -- Long conversations before escalation
    """)

    return {
        'escalation_by_intent': reasons,
        'long_conversations': sessions
    }
```

### 3. Performance Issues

**Memory optimization:**

```python
# Clear context cache periodically
def cleanup_context_cache():
    current_time = time.time()
    expired_sessions = []

    for session_id, context in active_contexts.items():
        if current_time - context.last_activity > 1800:  # 30 minutes
            expired_sessions.append(session_id)

    for session_id in expired_sessions:
        del active_contexts[session_id]

    logger.info(f"Cleaned up {len(expired_sessions)} expired contexts")

# Schedule cleanup every 10 minutes
schedule.every(10).minutes.do(cleanup_context_cache)
```

**Database optimization:**

```sql
-- Index optimization for chat queries
CREATE INDEX IX_ChatMessages_CreatedAt_Sender
ON ChatMessages (CreatedAt, Sender)
INCLUDE (SessionId, AIConfidenceScore);

CREATE INDEX IX_ChatSessions_LastActivityAt
ON ChatSessions (LastActivityAt)
INCLUDE (Status, Type);

-- Archive old messages (older than 6 months)
INSERT INTO ChatMessages_Archive
SELECT * FROM ChatMessages
WHERE CreatedAt < DATEADD(month, -6, GETDATE());

DELETE FROM ChatMessages
WHERE CreatedAt < DATEADD(month, -6, GETDATE());
```

## 🔄 Backup và Recovery

### 1. Daily Backup Procedures

```bash
#!/bin/bash
# backup_ai_data.sh

DATE=$(date +%Y%m%d)
BACKUP_DIR="/backups/ai_chat/$DATE"

mkdir -p $BACKUP_DIR

# Backup Knowledge Base
sqlcmd -S server -d SHNGear -Q "
    SELECT * FROM AIKnowledgeBase
    WHERE IsActive = 1
" -o "$BACKUP_DIR/knowledge_base.csv" -h-1 -s"," -w 999

# Backup Chat Sessions (last 30 days)
sqlcmd -S server -d SHNGear -Q "
    SELECT * FROM ChatSessions
    WHERE CreatedAt > DATEADD(day, -30, GETDATE())
" -o "$BACKUP_DIR/chat_sessions.csv" -h-1 -s"," -w 999

# Backup AI Config
cp /app/config/ai_config.json "$BACKUP_DIR/"

# Compress backup
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_DIR" .
rm -rf "$BACKUP_DIR"

echo "Backup completed: $BACKUP_DIR.tar.gz"
```

### 2. Recovery Procedures

```python
# restore_ai_data.py
def restore_knowledge_base(backup_file):
    """Restore KB from backup CSV"""
    df = pd.read_csv(backup_file)

    # Validate data
    required_columns = ['Question', 'Answer', 'Keywords', 'Category']
    if not all(col in df.columns for col in required_columns):
        raise ValueError("Invalid backup file format")

    # Clear existing KB (with confirmation)
    confirm = input("This will replace all KB data. Type 'CONFIRM' to proceed: ")
    if confirm != 'CONFIRM':
        return

    # Restore data
    db.execute("TRUNCATE TABLE AIKnowledgeBase")

    for _, row in df.iterrows():
        db.execute("""
            INSERT INTO AIKnowledgeBase (Question, Answer, Keywords, Category, MinConfidenceScore)
            VALUES (?, ?, ?, ?, ?)
        """, row['Question'], row['Answer'], row['Keywords'], row['Category'], row['MinConfidenceScore'])

    print(f"Restored {len(df)} KB entries")
```

## 📋 Maintenance Checklist

### Daily Tasks (10 minutes)

- [ ] Check AI performance dashboard
- [ ] Review escalation alerts
- [ ] Monitor system resource usage
- [ ] Scan error logs for issues

### Weekly Tasks (30 minutes)

- [ ] Review unknown question log
- [ ] Update Knowledge Base with new info
- [ ] Analyze conversation patterns
- [ ] Check backup status
- [ ] Update product information in KB

### Monthly Tasks (2 hours)

- [ ] Comprehensive performance review
- [ ] KB optimization and cleanup
- [ ] Intent pattern analysis and updates
- [ ] User satisfaction survey review
- [ ] System security audit
- [ ] Update AI response templates

### Quarterly Tasks (4 hours)

- [ ] Major KB restructuring if needed
- [ ] AI model retraining evaluation
- [ ] Integration testing
- [ ] Disaster recovery testing
- [ ] Performance benchmarking
- [ ] Team training updates

## 📞 Emergency Contacts

| Role               | Contact                    | Escalation Level |
| ------------------ | -------------------------- | ---------------- |
| AI System Admin    | admin@shn-gear.com         | Level 1          |
| Database Admin     | dba@shn-gear.com           | Level 2          |
| DevOps Engineer    | devops@shn-gear.com        | Level 3          |
| Technical Director | tech-director@shn-gear.com | Level 4          |

## 📊 Success Metrics

### Target KPIs

- **AI Resolution Rate**: > 80%
- **Average Confidence Score**: > 0.75
- **Escalation Rate**: < 20%
- **Response Time**: < 2 seconds
- **User Satisfaction**: > 4.0/5
- **System Uptime**: > 99.5%

### Monthly Reporting Template

```markdown
# AI Chat Performance Report - [Month Year]

## Summary

- Total Conversations: [number]
- AI Resolution Rate: [percentage]
- User Satisfaction: [score/5]

## Key Improvements

- [List major improvements made]

## Issues & Resolutions

- [List issues encountered and how they were resolved]

## Next Month Focus

- [Priority areas for improvement]
```

Tài liệu này sẽ được cập nhật thường xuyên dựa trên kinh nghiệm vận hành thực tế và feedback từ team.
