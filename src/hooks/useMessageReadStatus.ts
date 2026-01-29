import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useMessageStore } from '@/stores/messageStore';

/**
 * Hook for managing message read status with real-time synchronization
 */
export const useMessageReadStatus = (conversationId: string | null, currentUserId: string) => {
    const { messages, updateMessageReadStatus } = useMessageStore();

    // Mark messages as read when viewing conversation
    const markMessagesAsRead = useCallback(async () => {
        if (!conversationId || !currentUserId) return;

        // Find unread messages sent to current user
        const unreadMessages = messages.filter(
            msg => msg.conversationId === conversationId &&
                   msg.senderId !== currentUserId &&
                   !msg.isRead
        );

        if (unreadMessages.length === 0) return;

        // Batch update in database
        const messageIds = unreadMessages.map(msg => msg.id);
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true, read_at: new Date().toISOString() })
            .in('id', messageIds)
            .eq('conversation_id', conversationId)
            .neq('sender_id', currentUserId);

        if (!error) {
            // Update local state
            updateMessageReadStatus(messageIds, true);
        }
    }, [conversationId, currentUserId, messages]);

    // Subscribe to read status updates
    useEffect(() => {
        if (!conversationId) return;

        const channel = supabase
            .channel(`read-status-${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    if (payload.new.is_read !== payload.old.is_read) {
                        updateMessageReadStatus([payload.new.id], payload.new.is_read);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [conversationId]);

    // Auto-mark as read when viewing
    useEffect(() => {
        const timer = setTimeout(() => {
            markMessagesAsRead();
        }, 500); // Small delay to ensure messages are loaded

        return () => clearTimeout(timer);
    }, [conversationId, messages.length]);

    return {
        markMessagesAsRead
    };
};