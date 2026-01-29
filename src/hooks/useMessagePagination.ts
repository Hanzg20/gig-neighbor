import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Message {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    isRead: boolean;
    messageType: string;
    metadata?: any;
}

interface UseMessagePaginationOptions {
    conversationId: string;
    pageSize?: number;
    initialLoad?: boolean;
}

export const useMessagePagination = ({
    conversationId,
    pageSize = 20,
    initialLoad = true
}: UseMessagePaginationOptions) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Keep track of the oldest message timestamp for pagination
    const oldestMessageRef = useRef<string | null>(null);
    const loadingRef = useRef(false);
    const observerRef = useRef<IntersectionObserver | null>(null);
    const sentinelRef = useRef<HTMLDivElement | null>(null);

    /**
     * Load messages with pagination
     */
    const loadMessages = useCallback(async (reset: boolean = false) => {
        if (loadingRef.current || (!hasMore && !reset)) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            let query = supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conversationId)
                .order('created_at', { ascending: false })
                .limit(pageSize);

            // Add pagination cursor if not resetting
            if (!reset && oldestMessageRef.current) {
                query = query.lt('created_at', oldestMessageRef.current);
            }

            const { data, error: fetchError } = await query;

            if (fetchError) {
                throw fetchError;
            }

            if (data) {
                // Check if there are more messages
                setHasMore(data.length === pageSize);

                // Update oldest message reference
                if (data.length > 0) {
                    oldestMessageRef.current = data[data.length - 1].created_at;
                }

                // Transform and append messages
                const transformedMessages = data.map(msg => ({
                    id: msg.id,
                    content: msg.content,
                    senderId: msg.sender_id,
                    createdAt: msg.created_at,
                    isRead: msg.is_read,
                    messageType: msg.message_type,
                    metadata: msg.metadata
                }));

                setMessages(prev => {
                    if (reset) {
                        return transformedMessages.reverse(); // Newest at bottom
                    }
                    // Prepend older messages
                    return [...transformedMessages.reverse(), ...prev];
                });
            }
        } catch (err) {
            console.error('Error loading messages:', err);
            setError('Failed to load messages');
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [conversationId, pageSize, hasMore]);

    /**
     * Load more messages when scrolling to top
     */
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            loadMessages(false);
        }
    }, [loading, hasMore, loadMessages]);

    /**
     * Reset and reload messages
     */
    const reset = useCallback(() => {
        oldestMessageRef.current = null;
        setHasMore(true);
        loadMessages(true);
    }, [loadMessages]);

    /**
     * Add new message to the list (for real-time updates)
     */
    const addMessage = useCallback((message: Message) => {
        setMessages(prev => [...prev, message]);
    }, []);

    /**
     * Set up intersection observer for infinite scrolling
     */
    const setupIntersectionObserver = useCallback((element: HTMLDivElement | null) => {
        // Clean up previous observer
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        if (!element) return;

        sentinelRef.current = element;

        observerRef.current = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (entry.isIntersecting && hasMore && !loading) {
                    loadMore();
                }
            },
            {
                root: null,
                rootMargin: '100px',
                threshold: 0.1
            }
        );

        observerRef.current.observe(element);
    }, [hasMore, loading, loadMore]);

    // Initial load
    useEffect(() => {
        if (initialLoad && conversationId) {
            reset();
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [conversationId]);

    return {
        messages,
        loading,
        hasMore,
        error,
        loadMore,
        reset,
        addMessage,
        setupIntersectionObserver
    };
};

/**
 * Hook for virtual scrolling with large message lists
 */
export const useVirtualMessages = (messages: Message[], containerHeight: number) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });
    const itemHeight = 80; // Average message height in pixels
    const buffer = 5; // Number of items to render outside visible area

    const handleScroll = useCallback((scrollTop: number) => {
        const start = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
        const visibleCount = Math.ceil(containerHeight / itemHeight);
        const end = Math.min(messages.length, start + visibleCount + buffer * 2);

        setVisibleRange({ start, end });
    }, [messages.length, containerHeight]);

    const visibleMessages = messages.slice(visibleRange.start, visibleRange.end);
    const topSpacerHeight = visibleRange.start * itemHeight;
    const bottomSpacerHeight = (messages.length - visibleRange.end) * itemHeight;

    return {
        visibleMessages,
        topSpacerHeight,
        bottomSpacerHeight,
        handleScroll,
        totalHeight: messages.length * itemHeight
    };
};