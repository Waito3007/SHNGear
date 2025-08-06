import { chatSignalR } from '../services/ChatSignalRService';

class ChatTestRunner {
    constructor() {
        this.testResults = [];
        this.currentTestSession = null;
    }

    // Test suite runner
    async runAllTests() {
        console.log('🧪 Starting AI Chat System Tests...');
        
        const testSuites = [
            this.testBasicConnection,
            this.testAIResponses,
            this.testContextTracking,
            this.testProductSearch,
            this.testOrderInquiry,
            this.testEscalation,
            this.testMultiSession,
            this.testErrorHandling
        ];

        for (const testSuite of testSuites) {
            try {
                await testSuite.call(this);
            } catch (error) {
                console.error(`❌ Test suite failed: ${testSuite.name}`, error);
                this.testResults.push({
                    suite: testSuite.name,
                    status: 'FAILED',
                    error: error.message
                });
            }
        }

        this.printTestReport();
        return this.testResults;
    }

    // Test 1: Basic Connection
    async testBasicConnection() {
        console.log('🔗 Testing SignalR Connection...');
        
        try {
            await chatSignalR.connect();
            this.assert(chatSignalR.isConnected, 'SignalR should be connected');
            
            this.testResults.push({
                suite: 'Basic Connection',
                status: 'PASSED',
                message: 'SignalR connection established successfully'
            });
        } catch (error) {
            throw new Error(`Connection failed: ${error.message}`);
        }
    }

    // Test 2: AI Responses
    async testAIResponses() {
        console.log('🤖 Testing AI Response System...');
        
        const testMessages = [
            { input: "Xin chào", expectedIntent: "greeting", minConfidence: 0.8 },
            { input: "Tôi muốn mua iPhone", expectedIntent: "product_search", minConfidence: 0.7 },
            { input: "Giá điện thoại bao nhiêu", expectedIntent: "price_inquiry", minConfidence: 0.7 },
            { input: "Đơn hàng của tôi ở đâu", expectedIntent: "order_status", minConfidence: 0.8 },
            { input: "Cảm ơn bạn", expectedIntent: "thanks", minConfidence: 0.9 }
        ];

        const session = await this.createTestSession();
        let passedTests = 0;

        for (const test of testMessages) {
            const response = await this.sendTestMessage(session.sessionId, test.input);
            
            if (response.intent === test.expectedIntent && response.confidenceScore >= test.minConfidence) {
                passedTests++;
                console.log(`✅ "${test.input}" -> ${response.intent} (${response.confidenceScore})`);
            } else {
                console.log(`❌ "${test.input}" -> Expected: ${test.expectedIntent}, Got: ${response.intent}`);
            }
        }

        this.testResults.push({
            suite: 'AI Responses',
            status: passedTests === testMessages.length ? 'PASSED' : 'PARTIAL',
            message: `${passedTests}/${testMessages.length} tests passed`
        });
    }

    // Test 3: Context Tracking
    async testContextTracking() {
        console.log('🧠 Testing Context Tracking...');
        
        const session = await this.createTestSession();
        
        // Conversation sequence
        const conversation = [
            "Tôi muốn mua iPhone",
            "Giá bao nhiêu?", // Should understand "giá iPhone"
            "Có màu đỏ không?", // Should understand "iPhone màu đỏ"
            "Tôi mua luôn" // Should understand purchase intent for iPhone
        ];

        let contextMaintained = true;
        
        for (let i = 0; i < conversation.length; i++) {
            const response = await this.sendTestMessage(session.sessionId, conversation[i]);
            
            if (i > 0 && !response.context?.includes('iPhone')) {
                contextMaintained = false;
                break;
            }
        }

        this.testResults.push({
            suite: 'Context Tracking',
            status: contextMaintained ? 'PASSED' : 'FAILED',
            message: contextMaintained ? 'Context maintained throughout conversation' : 'Context lost during conversation'
        });
    }

    // Test 4: Product Search
    async testProductSearch() {
        console.log('🔍 Testing Product Search...');
        
        const session = await this.createTestSession();
        const searchQueries = [
            "Tìm iPhone 15",
            "Laptop Dell gaming",
            "Tai nghe Sony",
            "Điện thoại Samsung dưới 10 triệu"
        ];

        let successfulSearches = 0;

        for (const query of searchQueries) {
            const response = await this.sendTestMessage(session.sessionId, query);
            
            if (response.productRecommendations && response.productRecommendations.length > 0) {
                successfulSearches++;
            }
        }

        this.testResults.push({
            suite: 'Product Search',
            status: successfulSearches === searchQueries.length ? 'PASSED' : 'PARTIAL',
            message: `${successfulSearches}/${searchQueries.length} searches returned products`
        });
    }

    // Test 5: Order Inquiry
    async testOrderInquiry() {
        console.log('📦 Testing Order Inquiry...');
        
        const session = await this.createTestSession('user123'); // Mock user ID
        const response = await this.sendTestMessage(session.sessionId, "Đơn hàng của tôi ở đâu?");
        
        const hasOrderInfo = response.intent === 'order_status' && 
                           (response.message.includes('đơn hàng') || response.message.includes('order'));

        this.testResults.push({
            suite: 'Order Inquiry',
            status: hasOrderInfo ? 'PASSED' : 'FAILED',
            message: hasOrderInfo ? 'Order status inquiry handled correctly' : 'Order inquiry not recognized'
        });
    }

    // Test 6: Escalation
    async testEscalation() {
        console.log('🚨 Testing Escalation Logic...');
        
        const session = await this.createTestSession();
        
        // Send complex query that should trigger escalation
        const complexQuery = "Tôi có vấn đề phức tạp với sản phẩm xyz123 không có trong danh sách";
        const response = await this.sendTestMessage(session.sessionId, complexQuery);
        
        const shouldEscalate = response.confidenceScore < 0.4 || response.requiresEscalation;

        this.testResults.push({
            suite: 'Escalation Logic',
            status: shouldEscalate ? 'PASSED' : 'FAILED',
            message: shouldEscalate ? 'Low confidence query triggered escalation' : 'Escalation not triggered when expected'
        });
    }

    // Test 7: Multi-Session
    async testMultiSession() {
        console.log('👥 Testing Multi-Session Support...');
        
        const sessions = await Promise.all([
            this.createTestSession('user1'),
            this.createTestSession('user2'),
            this.createTestSession('user3')
        ]);

        const responses = await Promise.all(
            sessions.map(session => 
                this.sendTestMessage(session.sessionId, "Xin chào")
            )
        );

        const allResponded = responses.every(response => response && response.message);

        this.testResults.push({
            suite: 'Multi-Session Support',
            status: allResponded ? 'PASSED' : 'FAILED',
            message: allResponded ? 'All sessions handled concurrently' : 'Some sessions failed to respond'
        });
    }

    // Test 8: Error Handling
    async testErrorHandling() {
        console.log('⚠️ Testing Error Handling...');
        
        const session = await this.createTestSession();
        
        try {
            // Test with empty message
            await this.sendTestMessage(session.sessionId, "");
            
            // Test with very long message
            const longMessage = "a".repeat(10000);
            await this.sendTestMessage(session.sessionId, longMessage);
            
            // Test with special characters
            await this.sendTestMessage(session.sessionId, "!@#$%^&*()_+{}|:<>?");
            
            this.testResults.push({
                suite: 'Error Handling',
                status: 'PASSED',
                message: 'System handled edge cases gracefully'
            });
        } catch (error) {
            this.testResults.push({
                suite: 'Error Handling',
                status: 'FAILED',
                message: `Error handling failed: ${error.message}`
            });
        }
    }

    // Helper Methods
    async createTestSession(userId = null) {
        const response = await fetch('/api/chat/sessions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: userId,
                type: 'AI',
                isTest: true
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to create test session');
        }
        
        return await response.json();
    }

    async sendTestMessage(sessionId, message) {
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionId,
                message: message,
                type: 'Text'
            })
        });
        
        if (!response.ok) {
            throw new Error('Failed to send test message');
        }
        
        return await response.json();
    }

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    printTestReport() {
        console.log('\n📊 TEST REPORT');
        console.log('='.repeat(50));
        
        const passed = this.testResults.filter(r => r.status === 'PASSED').length;
        const failed = this.testResults.filter(r => r.status === 'FAILED').length;
        const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
        
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`⚠️ Partial: ${partial}`);
        console.log(`📈 Success Rate: ${Math.round((passed / this.testResults.length) * 100)}%`);
        
        console.log('\nDetailed Results:');
        this.testResults.forEach(result => {
            const icon = result.status === 'PASSED' ? '✅' : result.status === 'FAILED' ? '❌' : '⚠️';
            console.log(`${icon} ${result.suite}: ${result.message}`);
        });
    }
}

// Export for use in development
export const runChatTests = async () => {
    const tester = new ChatTestRunner();
    return await tester.runAllTests();
};

export default ChatTestRunner;
