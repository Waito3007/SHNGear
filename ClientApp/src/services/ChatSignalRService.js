import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

class ChatSignalRService {
    constructor() {
        this.connection = null;
        this.isConnected = false;
        this.connectionId = null;
        this.eventHandlers = {};
    }

    async connect(userId = null, sessionId = null) {
        try {
            // Build connection
            this.connection = new HubConnectionBuilder()
                .withUrl(`${process.env.REACT_APP_API_BASE_URL || 'https://localhost:7157'}/chatHub`, {
                    withCredentials: true,
                    headers: userId ? { 'X-User-Id': userId } : {}
                })
                .withAutomaticReconnect([0, 2000, 10000, 30000])
                .configureLogging(LogLevel.Information)
                .build();

            // Setup event handlers
            this.setupEventHandlers();

            // Start connection
            await this.connection.start();
            this.isConnected = true;
            this.connectionId = this.connection.connectionId;

            console.log('✅ SignalR Connected:', this.connectionId);

            // Join session if provided
            if (sessionId) {
                await this.joinSession(sessionId);
            }

            return this.connectionId;
        } catch (error) {
            console.error('❌ SignalR Connection failed:', error);
            throw error;
        }
    }

    setupEventHandlers() {
        // Receive messages
        this.connection.on('ReceiveMessage', (message) => {
            console.log('📨 Message received:', message);
            this.emit('messageReceived', message);
        });

        // AI response
        this.connection.on('ReceiveAIResponse', (response) => {
            console.log('🤖 AI Response:', response);
            this.emit('aiResponse', response);
        });

        // Session updates
        this.connection.on('SessionUpdated', (session) => {
            console.log('🔄 Session updated:', session);
            this.emit('sessionUpdated', session);
        });

        // Admin joined
        this.connection.on('AdminJoined', (adminInfo) => {
            console.log('👨‍💼 Admin joined:', adminInfo);
            this.emit('adminJoined', adminInfo);
        });

        // Typing indicators
        this.connection.on('UserTyping', (info) => {
            this.emit('userTyping', info);
        });

        // Connection state changes
        this.connection.onreconnecting(() => {
            console.log('🔄 SignalR Reconnecting...');
            this.isConnected = false;
            this.emit('reconnecting');
        });

        this.connection.onreconnected(() => {
            console.log('✅ SignalR Reconnected');
            this.isConnected = true;
            this.emit('reconnected');
        });

        this.connection.onclose(() => {
            console.log('❌ SignalR Disconnected');
            this.isConnected = false;
            this.emit('disconnected');
        });
    }

    // Send message
    async sendMessage(sessionId, message, messageType = 'Text') {
        if (!this.isConnected) {
            throw new Error('SignalR not connected');
        }

        try {
            await this.connection.invoke('SendMessage', sessionId, message, messageType);
        } catch (error) {
            console.error('❌ Failed to send message:', error);
            throw error;
        }
    }

    // Join session
    async joinSession(sessionId) {
        if (!this.isConnected) {
            throw new Error('SignalR not connected');
        }

        try {
            await this.connection.invoke('JoinSession', sessionId);
            console.log(`📨 Joined session: ${sessionId}`);
        } catch (error) {
            console.error('❌ Failed to join session:', error);
            throw error;
        }
    }

    // Leave session
    async leaveSession(sessionId) {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.connection.invoke('LeaveSession', sessionId);
            console.log(`👋 Left session: ${sessionId}`);
        } catch (error) {
            console.error('❌ Failed to leave session:', error);
        }
    }

    // Send typing indicator
    async sendTyping(sessionId, isTyping) {
        if (!this.isConnected) {
            return;
        }

        try {
            await this.connection.invoke('SendTyping', sessionId, isTyping);
        } catch (error) {
            console.error('❌ Failed to send typing indicator:', error);
        }
    }

    // Event system
    on(event, callback) {
        if (!this.eventHandlers[event]) {
            this.eventHandlers[event] = [];
        }
        this.eventHandlers[event].push(callback);
    }

    off(event, callback) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event] = this.eventHandlers[event].filter(cb => cb !== callback);
        }
    }

    emit(event, data) {
        if (this.eventHandlers[event]) {
            this.eventHandlers[event].forEach(callback => callback(data));
        }
    }

    // Disconnect
    async disconnect() {
        if (this.connection) {
            await this.connection.stop();
            this.isConnected = false;
            this.connectionId = null;
            console.log('👋 SignalR Disconnected');
        }
    }

    // Get connection state
    getConnectionState() {
        return {
            isConnected: this.isConnected,
            connectionId: this.connectionId,
            state: this.connection?.state
        };
    }
}

// Export singleton instance
export const chatSignalR = new ChatSignalRService();
export default chatSignalR;
