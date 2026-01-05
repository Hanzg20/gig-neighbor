import { supabase } from '@/lib/supabaseClient';
import { IMessageRepository, Conversation, Message } from '../interfaces';

export class SupabaseMessageRepository implements IMessageRepository {
    async getConversations(userId: string): Promise<Conversation[]> {
        const { data, error } = await supabase
            .from('conversations')
            .select(`
                id,
                participant_a,
                participant_b,
                order_id,
                last_message_at,
                created_at
            `)
            .or(`participant_a.eq.${userId},participant_b.eq.${userId}`)
            .order('last_message_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(this.mapConversation);
    }

    async getMessages(conversationId: string): Promise<Message[]> {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        return (data || []).map(this.mapMessage);
    }

    async sendMessage(conversationId: string, senderId: string, content: string): Promise<Message> {
        const { data, error } = await supabase
            .from('messages')
            .insert({
                conversation_id: conversationId,
                sender_id: senderId,
                content
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapMessage(data);
    }

    async createConversation(participantA: string, participantB: string, orderId?: string): Promise<Conversation> {
        // Check if conversation already exists
        const { data: existing } = await supabase
            .from('conversations')
            .select('*')
            .or(`and(participant_a.eq.${participantA},participant_b.eq.${participantB}),and(participant_a.eq.${participantB},participant_b.eq.${participantA})`)
            .single();

        if (existing) {
            return this.mapConversation(existing);
        }

        const { data, error } = await supabase
            .from('conversations')
            .insert({
                participant_a: participantA,
                participant_b: participantB,
                order_id: orderId
            })
            .select()
            .single();

        if (error) throw error;
        return this.mapConversation(data);
    }

    async markAsRead(conversationId: string, userId: string): Promise<void> {
        const { error } = await supabase
            .from('messages')
            .update({ is_read: true })
            .eq('conversation_id', conversationId)
            .neq('sender_id', userId);

        if (error) throw error;
    }

    subscribeToMessages(conversationId: string, callback: (message: Message) => void): () => void {
        const channel = supabase
            .channel(`messages:${conversationId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${conversationId}`
                },
                (payload) => {
                    callback(this.mapMessage(payload.new));
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }

    async getUnreadCount(userId: string): Promise<number> {
        // First get user's conversation IDs
        const { data: convData } = await supabase
            .from('conversations')
            .select('id')
            .or(`participant_a.eq.${userId},participant_b.eq.${userId}`);

        if (!convData || convData.length === 0) return 0;

        const conversationIds = convData.map(c => c.id);

        // Then count unread messages in those conversations
        const { count, error } = await supabase
            .from('messages')
            .select('id', { count: 'exact', head: true })
            .eq('is_read', false)
            .neq('sender_id', userId)
            .in('conversation_id', conversationIds);

        if (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
        return count || 0;
    }

    async getConversationUnreadCounts(userId: string): Promise<Map<string, number>> {
        const { data, error } = await supabase
            .from('messages')
            .select('conversation_id')
            .eq('is_read', false)
            .neq('sender_id', userId);

        if (error) {
            console.error('Error getting unread counts:', error);
            return new Map();
        }

        const counts = new Map<string, number>();
        (data || []).forEach(msg => {
            const current = counts.get(msg.conversation_id) || 0;
            counts.set(msg.conversation_id, current + 1);
        });
        return counts;
    }

    private mapConversation(data: any): Conversation {
        return {
            id: data.id,
            participantA: data.participant_a,
            participantB: data.participant_b,
            orderId: data.order_id,
            lastMessageAt: data.last_message_at,
            createdAt: data.created_at
        };
    }

    private mapMessage(data: any): Message {
        return {
            id: data.id,
            conversationId: data.conversation_id,
            senderId: data.sender_id,
            content: data.content,
            isRead: data.is_read,
            createdAt: data.created_at
        };
    }
}
