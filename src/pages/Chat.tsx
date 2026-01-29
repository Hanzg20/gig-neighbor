import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/Header";
import { Search, MoreVertical, Phone, Video, Image, Mic, Send, MessageCircle, DollarSign, Package, CheckCircle2, Clock, ChevronRight, Hash, Loader2 } from "lucide-react";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useOrderStore } from "@/stores/orderStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useMessageReadStatus } from "@/hooks/useMessageReadStatus";
import { MessageNotificationService } from "@/services/MessageNotificationService";
import { QuickReplyTemplates } from "@/components/chat/QuickReplyTemplates";
import { useMessagePagination } from "@/hooks/useMessagePagination";

const Chat = () => {
    const navigate = useNavigate();
    const { currentUser } = useAuthStore();
    const {
        conversations,
        messages,
        activeConversationId,
        isLoading,
        loadConversations,
        setActiveConversation,
        sendMessage,
        sendQuote,
        cleanup
    } = useMessageStore();
    const { orders } = useOrderStore();

    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const notificationService = useRef<MessageNotificationService | null>(null);

    // Initialize notification service
    useEffect(() => {
        notificationService.current = MessageNotificationService.getInstance();
        notificationService.current.loadOptions();
    }, []);

    // Integrate message read status sync
    useMessageReadStatus(activeConversationId, currentUser?.id || '');

    // Load conversations on mount
    useEffect(() => {
        if (currentUser?.id) {
            loadConversations(currentUser.id);
            // Check for offline messages
            notificationService.current?.checkOfflineMessages(currentUser.id);
        }
        return () => cleanup();
    }, [currentUser?.id]);

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const activeConversation = useMemo(() =>
        conversations.find(c => c.id === activeConversationId),
        [conversations, activeConversationId]);

    const activeOrder = useMemo(() =>
        activeConversation?.orderId ? orders.find(o => o.id === activeConversation.orderId) : null,
        [orders, activeConversation]);

    const handleSendMessage = async () => {
        if (!input.trim() || !currentUser?.id) return;
        await sendMessage(currentUser.id, input);
        setInput("");
    };

    const handleSendQuote = async () => {
        if (!activeOrder || !currentUser?.id) return;
        const amountStr = prompt("Enter custom price (CAD):");
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            toast.error("Invalid amount");
            return;
        }
        await sendQuote(currentUser.id, activeOrder.id, Math.round(amount * 100));
        toast.success("Quote sent!");
    };

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Please login to view messages</p>
                        <Button onClick={() => navigate('/login')} className="rounded-xl">
                            Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background/50 flex flex-col overflow-hidden">
            <Header />

            <div className="flex-1 container max-w-7xl py-4 flex gap-4 h-[calc(100vh-80px)] overflow-hidden">
                {/* Slim Sidebar */}
                <div className="hidden md:flex w-72 flex-col bg-card/40 backdrop-blur-md border border-border/50 rounded-3xl overflow-hidden shadow-sm">
                    <div className="p-4 border-b border-border/50">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h2 className="font-bold text-lg tracking-tight">Messages</h2>
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                                {conversations.reduce((acc, curr) => acc + (curr.unreadCount || 0), 0)} New
                            </Badge>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-muted/50 border-none outline-none text-xs"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {isLoading && conversations.length === 0 ? (
                            <div className="p-8 text-center text-xs text-muted-foreground animate-pulse">Loading conversations...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <MessageCircle className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p className="text-xs">No chats yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={`sidebar-conv-${conv.id}`}
                                    onClick={() => setActiveConversation(conv.id)}
                                    className={cn(
                                        "w-full px-4 py-3 flex items-center gap-3 transition-all relative group",
                                        activeConversationId === conv.id ? 'bg-primary/5' : 'hover:bg-muted/30'
                                    )}
                                >
                                    {activeConversationId === conv.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
                                    )}
                                    <div className="relative flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center border border-primary/10">
                                            <span className="text-sm font-black text-primary/80">
                                                {(conv.otherUserName || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        {conv.unreadCount && conv.unreadCount > 0 && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-card">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <span className={cn(
                                                "text-sm font-semibold truncate",
                                                activeConversationId === conv.id ? 'text-primary' : 'text-foreground'
                                            )}>
                                                {conv.otherUserName || 'User'}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground">
                                                {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate opacity-70">
                                            {conv.lastMessagePreview || 'New message'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Chat Area */}
                <div className="flex-1 flex flex-col bg-card/60 backdrop-blur-xl border border-border/50 rounded-3xl overflow-hidden shadow-2xl relative">
                    {activeConversationId ? (
                        <>
                            {/* Compact Transition header (Taobao Style) */}
                            <div className="px-4 py-3 border-b border-border/40 flex justify-between items-center bg-muted/10">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/5">
                                        <span className="text-xs font-bold text-primary">
                                            {(activeConversation?.otherUserName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold tracking-tight">{activeConversation?.otherUserName || 'User'}</h3>
                                        <div className="flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">Online</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5">
                                        <Phone className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-primary/5">
                                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                    </Button>
                                </div>
                            </div>

                            {/* Slim Order Context Card */}
                            {activeOrder && (
                                <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 flex items-center justify-between group transition-all hover:bg-primary/10">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="w-10 h-10 rounded-lg bg-white overflow-hidden border border-border/50 flex-shrink-0">
                                            <img src={activeOrder.snapshot.masterImages[0]} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="h-4 px-1.5 text-[9px] font-black uppercase text-primary border-primary/20">
                                                    ORDER
                                                </Badge>
                                                <span className="text-xs font-bold truncate">{activeOrder.snapshot.masterTitle}</span>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                Status: <span className="text-primary">{activeOrder.status.replace('_', ' ')}</span> • {activeOrder.pricing.total.formatted}
                                            </p>
                                        </div>
                                    </div>
                                    <Link to={`/orders/${activeOrder.id}`} className="flex items-center text-[10px] font-black text-primary uppercase tracking-tighter hover:underline px-2 py-1">
                                        Details <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </Link>
                                </div>
                            )}

                            {/* Messages List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-chat-pattern">
                                {messages.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-10 opacity-50">
                                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                            <Hash className="w-8 h-8 text-muted-foreground" />
                                        </div>
                                        <h4 className="text-sm font-bold">End-to-end encrypted</h4>
                                        <p className="text-xs max-w-xs mt-2">Messages are secure. Start your neighborhood conversation now.</p>
                                    </div>
                                ) : (
                                    messages.map((msg, idx) => {
                                        const isMe = msg.senderId === currentUser?.id;
                                        const isSystem = msg.messageType === 'SYSTEM';
                                        const isQuote = msg.messageType === 'QUOTE';

                                        if (isSystem) {
                                            return (
                                                <div key={msg.id} className="flex justify-center my-4">
                                                    <Badge variant="secondary" className="bg-muted/50 text-[10px] font-medium text-muted-foreground border-none">
                                                        {msg.content}
                                                    </Badge>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={msg.id} className={cn("flex flex-col", isMe ? 'items-end' : 'items-start')}>
                                                <div className={cn(
                                                    "max-w-[85%] sm:max-w-[70%] group relative",
                                                )}>
                                                    <div className={cn(
                                                        "px-3 py-2 rounded-2xl shadow-sm text-sm",
                                                        isMe
                                                            ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground rounded-tr-none'
                                                            : 'bg-white border border-border/50 text-foreground rounded-tl-none',
                                                        isQuote && 'bg-orange-50 border-orange-200 text-orange-950 rounded-2xl'
                                                    )}>
                                                        {isQuote ? (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 border-b border-orange-200 pb-1.5 mb-1.5">
                                                                    <DollarSign className="w-4 h-4 text-orange-600" />
                                                                    <span className="font-bold text-base">Custom Quote</span>
                                                                </div>
                                                                <div className="bg-white/50 p-2 rounded-lg border border-orange-200">
                                                                    <p className="text-lg font-black text-orange-600">${(msg.metadata?.amount / 100).toFixed(2)}</p>
                                                                    <p className="text-[10px] text-orange-800 opacity-70 italic">{msg.metadata?.description || 'Service price adjustment'}</p>
                                                                </div>
                                                                {!isMe && (
                                                                    <Button size="sm" className="w-full h-8 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg text-xs" onClick={() => navigate(`/orders/${msg.metadata?.orderId}`)}>
                                                                        Review & Approve
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <p className="leading-relaxed">{msg.content}</p>
                                                        )}
                                                    </div>
                                                    <div className={cn(
                                                        "flex items-center gap-1.5 mt-1 px-1",
                                                        isMe ? 'flex-row-reverse' : 'flex-row'
                                                    )}>
                                                        <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-tighter opacity-50">
                                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                        {isMe && (
                                                            <CheckCircle2
                                                                className={cn(
                                                                    "w-3 h-3",
                                                                    msg.isRead ? "text-primary" : "text-muted-foreground"
                                                                )}
                                                                title={msg.isRead ? "Read" : "Sent"}
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Ultra Slim Input Area */}
                            <div className="p-3 bg-muted/5 border-t border-border/40">
                                <div className="flex flex-col gap-2">
                                    {/* Quick Actions Bar */}
                                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                                        {activeOrder?.status === 'PENDING_QUOTE' && currentUser?.id === activeOrder.providerId && (
                                            <Button variant="outline" size="sm" className="h-6 px-2 rounded-full border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 text-[10px] font-bold" onClick={handleSendQuote}>
                                                <DollarSign className="w-3 h-3 mr-1" /> SEND QUOTE
                                            </Button>
                                        )}
                                        <QuickReplyTemplates
                                            onSelectReply={(text) => setInput(text)}
                                            context={currentUser?.id === activeOrder?.providerId ? 'seller' : 'buyer'}
                                        />
                                        <Badge variant="outline" className="h-6 rounded-full border-muted text-[9px] cursor-pointer hover:bg-muted font-bold opacity-60">
                                            📷 PHOTO
                                        </Badge>
                                        <Badge variant="outline" className="h-6 rounded-full border-muted text-[9px] cursor-pointer hover:bg-muted font-bold opacity-60">
                                            📍 LOCATION
                                        </Badge>
                                    </div>

                                    <div className="flex items-end gap-2 bg-white/80 border border-border/50 p-1.5 rounded-2xl shadow-inner focus-within:ring-2 ring-primary/20 transition-all">
                                        <textarea
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            placeholder="Message..."
                                            className="flex-1 bg-transparent border-none outline-none text-sm resize-none py-1.5 px-2 min-h-[36px] max-h-32 custom-scrollbar"
                                            rows={1}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSendMessage();
                                                }
                                            }}
                                        />
                                        <Button
                                            size="icon"
                                            className="h-8 w-8 rounded-xl bg-primary shadow-md shrink-0 mb-0.5"
                                            onClick={handleSendMessage}
                                            disabled={!input.trim()}
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-muted/10 p-12">
                            <div className="relative mb-8">
                                <div className="w-24 h-24 rounded-full bg-primary/5 flex items-center justify-center animate-pulse">
                                    <MessageCircle className="w-12 h-12 text-primary/30" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center backdrop-blur-sm border border-white/50">
                                    <Hash className="w-5 h-5 text-secondary" />
                                </div>
                            </div>
                            <h2 className="text-xl font-black tracking-tighter mb-2">Neighborhood Chat</h2>
                            <p className="text-sm text-muted-foreground text-center max-w-sm leading-relaxed">
                                Connect with your neighbors in Kanata Lakes. Select a conversation to start chatting about services or rentals.
                            </p>
                            <Button variant="outline" className="mt-8 rounded-2xl border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate('/orders')}>
                                View Your Orders
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
