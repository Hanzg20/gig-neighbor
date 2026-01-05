import { create } from 'zustand';
import { repositoryFactory } from '@/services/repositories/factory';

export interface Conversation {
    id: string;
    participantA: string;
    participantB: string;
    orderId?: string;
    lastMessageAt: string;
    createdAt: string;
    // UI enrichment
    otherUserName?: string;
    otherUserAvatar?: string;
    lastMessagePreview?: string;
    unreadCount?: number;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

interface MessageState {
    conversations: Conversation[];
    messages: Message[];
    activeConversationId: string | null;
    totalUnreadCount: number;
    isLoading: boolean;
    error: string | null;
    unsubscribe: (() => void) | null;

    loadConversations: (userId: string) => Promise<void>;
    loadMessages: (conversationId: string) => Promise<void>;
    loadUnreadCount: (userId: string) => Promise<void>;
    sendMessage: (senderId: string, content: string) => Promise<void>;
    createConversation: (userA: string, userB: string, orderId?: string) => Promise<Conversation>;
    setActiveConversation: (conversationId: string) => void;
    subscribeToActiveConversation: () => void;
    cleanup: () => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    conversations: [],
    messages: [],
    activeConversationId: null,
    totalUnreadCount: 0,
    isLoading: false,
    error: null,
    unsubscribe: null,

    loadConversations: async (userId: string) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getMessageRepository();
            const conversations = await repo.getConversations(userId);
            set({ conversations, isLoading: false });
        } catch (error: any) {
            console.error('Failed to load conversations:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    loadMessages: async (conversationId: string) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getMessageRepository();
            const messages = await repo.getMessages(conversationId);
            set({ messages, isLoading: false });
        } catch (error: any) {
            console.error('Failed to load messages:', error);
            set({ error: error.message, isLoading: false });
        }
    },

    loadUnreadCount: async (userId: string) => {
        try {
            const repo = repositoryFactory.getMessageRepository();
            const count = await repo.getUnreadCount(userId);
            set({ totalUnreadCount: count });
        } catch (error: any) {
            console.error('Failed to load unread count:', error);
        }
    },

    sendMessage: async (senderId: string, content: string) => {
        const { activeConversationId } = get();
        if (!activeConversationId || !content.trim()) return;

        try {
            const repo = repositoryFactory.getMessageRepository();
            const newMessage = await repo.sendMessage(activeConversationId, senderId, content);

            // Optimistic update - message will also come via subscription
            set(state => ({
                messages: [...state.messages, newMessage]
            }));
        } catch (error: any) {
            console.error('Failed to send message:', error);
            set({ error: error.message });
        }
    },

    createConversation: async (userA: string, userB: string, orderId?: string) => {
        set({ isLoading: true, error: null });
        try {
            const repo = repositoryFactory.getMessageRepository();
            const conversation = await repo.createConversation(userA, userB, orderId);

            set(state => ({
                conversations: [conversation, ...state.conversations],
                activeConversationId: conversation.id,
                isLoading: false
            }));

            // Also load messages for this new conversation
            get().loadMessages(conversation.id);
            get().subscribeToActiveConversation();

            return conversation;
        } catch (error: any) {
            console.error('Failed to create conversation:', error);
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    setActiveConversation: (conversationId: string) => {
        const { cleanup } = get();
        cleanup(); // Unsubscribe from previous conversation

        set({ activeConversationId: conversationId, messages: [] });
        get().loadMessages(conversationId);
        get().subscribeToActiveConversation();
    },

    subscribeToActiveConversation: () => {
        const { activeConversationId } = get();
        if (!activeConversationId) return;

        const repo = repositoryFactory.getMessageRepository();
        const unsubscribe = repo.subscribeToMessages(activeConversationId, (newMessage) => {
            set(state => {
                // Avoid duplicates
                if (state.messages.find(m => m.id === newMessage.id)) {
                    return state;
                }
                return { messages: [...state.messages, newMessage] };
            });
        });

        set({ unsubscribe });
    },

    cleanup: () => {
        const { unsubscribe } = get();
        if (unsubscribe) {
            unsubscribe();
            set({ unsubscribe: null });
        }
    }
}));
