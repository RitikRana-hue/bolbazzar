import { apiClient } from '../api-client';

export interface Conversation {
    id: string;
    participants: Array<{ id: string; username: string; avatar?: string }>;
    lastMessage?: Message;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: string;
    isRead: boolean;
    createdAt: string;
}

export const messagesApi = {
    async getConversations(page: number = 1, limit: number = 20): Promise<{ conversations: Conversation[]; total: number }> {
        return apiClient.get(`/messages/conversations?page=${page}&limit=${limit}`);
    },

    async getConversation(id: string): Promise<Conversation> {
        return apiClient.get(`/messages/conversations/${id}`);
    },

    async getMessages(conversationId: string, page: number = 1, limit: number = 50): Promise<{ messages: Message[]; total: number }> {
        return apiClient.get(`/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`);
    },

    async sendMessage(conversationId: string, content: string, type: string = 'text'): Promise<{ message: Message }> {
        return apiClient.post(`/messages/conversations/${conversationId}/messages`, { content, type });
    },

    async createConversation(participantId: string, initialMessage?: string): Promise<{ conversation: Conversation }> {
        return apiClient.post('/messages/conversations', { participantId, initialMessage });
    },

    async markAsRead(conversationId: string): Promise<{ message: string }> {
        return apiClient.post(`/messages/conversations/${conversationId}/read`);
    },

    async deleteConversation(id: string): Promise<{ message: string }> {
        return apiClient.delete(`/messages/conversations/${id}`);
    },
};