import { io, Socket } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';

class SocketClient {
    private socket: Socket | null = null;
    private reconnectAttempts = 0;
    private maxReconnectAttempts = 5;

    connect(token?: string): Socket {
        if (this.socket?.connected) {
            return this.socket;
        }

        this.socket = io(SOCKET_URL, {
            auth: {
                token: token || this.getToken(),
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: this.maxReconnectAttempts,
        });

        this.setupEventListeners();

        return this.socket;
    }

    private setupEventListeners(): void {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            if (process.env.NODE_ENV === 'development') {
                console.log('✅ Socket connected:', this.socket?.id);
            }
            this.reconnectAttempts = 0;
        });

        this.socket.on('disconnect', (reason) => {
            if (process.env.NODE_ENV === 'development') {
                console.log('🔌 Socket disconnected:', reason);
            }
        });

        this.socket.on('connect_error', (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.error('❌ Socket connection error:', error);
            }
            this.reconnectAttempts++;

            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
                if (process.env.NODE_ENV === 'development') {
                    console.error('Max reconnection attempts reached');
                }
                this.disconnect();
            }
        });

        this.socket.on('error', (error) => {
            if (process.env.NODE_ENV === 'development') {
                console.error('❌ Socket error:', error);
            }
        });
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    // Auction-specific methods
    joinAuction(auctionId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join_auction', auctionId);
        }
    }

    leaveAuction(auctionId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_auction', auctionId);
        }
    }

    onNewBid(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('new_bid', callback);
        }
    }

    onAuctionEnded(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('auction_ended', callback);
        }
    }

    // User-specific methods
    joinUserRoom(userId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join_user', userId);
        }
    }

    onNotification(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('notification', callback);
        }
    }

    onMessageReceived(callback: (data: any) => void): void {
        if (this.socket) {
            this.socket.on('message_received', callback);
        }
    }

    // Message-specific methods
    joinConversation(conversationId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('join_conversation', conversationId);
        }
    }

    leaveConversation(conversationId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('leave_conversation', conversationId);
        }
    }

    sendMessage(conversationId: string, message: string): void {
        if (this.socket?.connected) {
            this.socket.emit('send_message', { conversationId, message });
        }
    }

    onTyping(callback: (data: { userId: string; conversationId: string }) => void): void {
        if (this.socket) {
            this.socket.on('user_typing', callback);
        }
    }

    emitTyping(conversationId: string): void {
        if (this.socket?.connected) {
            this.socket.emit('typing', conversationId);
        }
    }

    // Remove event listeners
    off(event: string, callback?: (...args: any[]) => void): void {
        if (this.socket) {
            this.socket.off(event, callback);
        }
    }

    private getToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('auth_token');
    }
}

// Create singleton instance
export const socketClient = new SocketClient();

// Export for testing
export { SocketClient };
