'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Send,
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Smile,
    ArrowLeft
} from 'lucide-react';

interface Message {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
    timestamp: string;
    type: 'text' | 'image' | 'file';
    isRead: boolean;
}

interface Conversation {
    id: string;
    participantId: string;
    participantName: string;
    participantAvatar: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    orderId?: string;
    productTitle?: string;
    productImage?: string;
}

export default function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchConversations();

        // Check if mobile
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchConversations = async () => {
        try {
            // Mock data - replace with actual API call
            const mockConversations: Conversation[] = [
                {
                    id: '1',
                    participantId: 'seller1',
                    participantName: 'TechStore Inc',
                    participantAvatar: 'https://via.placeholder.com/40',
                    lastMessage: 'The item has been shipped and should arrive tomorrow',
                    lastMessageTime: '2 min ago',
                    unreadCount: 2,
                    orderId: 'ORD-12345',
                    productTitle: 'iPhone 15 Pro Max 256GB',
                    productImage: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbf1?w=100'
                },
                {
                    id: '2',
                    participantId: 'buyer1',
                    participantName: 'John Doe',
                    participantAvatar: 'https://via.placeholder.com/40',
                    lastMessage: 'Is the MacBook still available?',
                    lastMessageTime: '1 hour ago',
                    unreadCount: 0,
                    orderId: 'ORD-12346',
                    productTitle: 'MacBook Pro M3 14-inch',
                    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100'
                },
                {
                    id: '3',
                    participantId: 'seller2',
                    participantName: 'ElectroWorld',
                    participantAvatar: 'https://via.placeholder.com/40',
                    lastMessage: 'Thank you for your purchase!',
                    lastMessageTime: '3 hours ago',
                    unreadCount: 0,
                    orderId: 'ORD-12347',
                    productTitle: 'Samsung Galaxy S24 Ultra',
                    productImage: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100'
                }
            ];

            setConversations(mockConversations);
            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch conversations:', error);
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            // Mock messages - replace with actual API call
            console.log('Fetching messages for conversation:', conversationId);
            const mockMessages: Message[] = [
                {
                    id: '1',
                    senderId: 'seller1',
                    senderName: 'TechStore Inc',
                    content: 'Hello! Thank you for your purchase. I will ship the item today.',
                    timestamp: '2024-01-15T10:00:00Z',
                    type: 'text',
                    isRead: true
                },
                {
                    id: '2',
                    senderId: 'current_user',
                    senderName: 'You',
                    content: 'Great! When can I expect delivery?',
                    timestamp: '2024-01-15T10:05:00Z',
                    type: 'text',
                    isRead: true
                },
                {
                    id: '3',
                    senderId: 'seller1',
                    senderName: 'TechStore Inc',
                    content: 'The item has been shipped and should arrive tomorrow. Here is the tracking number: 1Z999AA1234567890',
                    timestamp: '2024-01-15T14:30:00Z',
                    type: 'text',
                    isRead: false
                }
            ];

            setMessages(mockMessages);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConversation) return;

        const message: Message = {
            id: Date.now().toString(),
            senderId: 'current_user',
            senderName: 'You',
            content: newMessage,
            timestamp: new Date().toISOString(),
            type: 'text',
            isRead: true
        };

        setMessages(prev => [...prev, message]);
        setNewMessage('');

        // Update conversation last message
        setConversations(prev => prev.map(conv =>
            conv.id === selectedConversation.id
                ? { ...conv, lastMessage: newMessage, lastMessageTime: 'now' }
                : conv
        ));

        // TODO: Send to API
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-gray-100 flex">
            {/* Conversations List */}
            <div className={`bg-white border-r border-gray-200 ${isMobile && selectedConversation ? 'hidden' : 'w-full md:w-1/3'
                }`}>
                {/* Header */}
                <div className="p-4 border-b border-gray-200">
                    <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                    <div className="mt-3 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Conversations */}
                <div className="overflow-y-auto h-full">
                    {conversations.map((conversation) => (
                        <div
                            key={conversation.id}
                            onClick={() => setSelectedConversation(conversation)}
                            className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                                }`}
                        >
                            <div className="flex items-start space-x-3">
                                <img
                                    src={conversation.participantAvatar}
                                    alt={conversation.participantName}
                                    className="w-12 h-12 rounded-full"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {conversation.participantName}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {conversation.lastMessageTime}
                                        </p>
                                    </div>

                                    {conversation.productTitle && (
                                        <div className="flex items-center mt-1">
                                            <img
                                                src={conversation.productImage}
                                                alt={conversation.productTitle}
                                                className="w-6 h-6 rounded object-cover mr-2"
                                            />
                                            <p className="text-xs text-gray-500 truncate">
                                                {conversation.productTitle}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-sm text-gray-600 truncate">
                                            {conversation.lastMessage}
                                        </p>
                                        {conversation.unreadCount > 0 && (
                                            <span className="bg-blue-600 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                                {conversation.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${isMobile && !selectedConversation ? 'hidden' : ''
                }`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {isMobile && (
                                        <button
                                            onClick={() => setSelectedConversation(null)}
                                            className="text-gray-500 hover:text-gray-700"
                                        >
                                            <ArrowLeft className="h-5 w-5" />
                                        </button>
                                    )}
                                    <img
                                        src={selectedConversation.participantAvatar}
                                        alt={selectedConversation.participantName}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">
                                            {selectedConversation.participantName}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            Order: {selectedConversation.orderId}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                        <Phone className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                        <Video className="h-5 w-5" />
                                    </button>
                                    <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                        <MoreVertical className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.senderId === 'current_user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.senderId === 'current_user'
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 text-gray-900'
                                            }`}
                                    >
                                        <p className="text-sm">{message.content}</p>
                                        <p className={`text-xs mt-1 ${message.senderId === 'current_user'
                                                ? 'text-blue-100'
                                                : 'text-gray-500'
                                            }`}>
                                            {formatTime(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Message Input */}
                        <div className="bg-white border-t border-gray-200 p-4">
                            <div className="flex items-center space-x-2">
                                <button className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Type a message..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                    <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-500 hover:text-gray-700">
                                        <Smile className="h-5 w-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={sendMessage}
                                    disabled={!newMessage.trim()}
                                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gray-50">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Send className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Select a conversation
                            </h3>
                            <p className="text-gray-500">
                                Choose a conversation from the list to start messaging
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}