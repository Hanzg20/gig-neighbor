import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { Search, MoreVertical, Phone, Video, Image, Mic, Send, MessageCircle } from "lucide-react";
import { useState } from "react";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";

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
        cleanup
    } = useMessageStore();

    const [input, setInput] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations on mount
    useEffect(() => {
        if (currentUser?.id) {
            loadConversations(currentUser.id);
        }
        return () => cleanup();
    }, [currentUser?.id]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async () => {
        if (!input.trim() || !currentUser?.id) return;
        await sendMessage(currentUser.id, input);
        setInput("");
    };

    const activeConversation = conversations.find(c => c.id === activeConversationId);

    if (!currentUser) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                        <p className="text-muted-foreground mb-4">Please login to view messages</p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-6 py-2 bg-primary text-primary-foreground rounded-xl"
                        >
                            Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <div className="flex-1 container max-w-6xl py-6 flex gap-6 h-[calc(100vh-80px)]">
                {/* Chat List (Sidebar) */}
                <div className="w-full md:w-80 bg-card border border-border rounded-3xl flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-border">
                        <h2 className="font-bold text-xl mb-4">Messages</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search contacts..."
                                className="w-full pl-10 pr-4 py-2 rounded-xl bg-muted outline-none text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {isLoading && conversations.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">Loading...</div>
                        ) : conversations.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">
                                <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                                <p>No conversations yet</p>
                            </div>
                        ) : (
                            conversations.map(conv => (
                                <button
                                    key={`conv-${conv.id}`} // FIX: Unique key verified
                                    onClick={() => setActiveConversation(conv.id)}
                                    className={`w-full p-4 flex items-center gap-3 transition-colors ${activeConversationId === conv.id ? 'bg-primary/5 border-r-4 border-primary' : 'hover:bg-muted/50'}`}
                                >
                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                            <span className="text-lg font-bold text-primary">
                                                {(conv.otherUserName || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex-1 text-left overflow-hidden">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className={`font-bold truncate ${activeConversationId === conv.id ? 'text-primary' : 'text-foreground'}`}>
                                                {conv.otherUserName || 'User'}
                                            </span>
                                            <span className="text-xs text-muted-foreground flex-shrink-0">
                                                {new Date(conv.lastMessageAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {conv.lastMessagePreview || 'Start a conversation...'}
                                        </p>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="hidden md:flex flex-1 bg-card border border-border rounded-3xl flex-col overflow-hidden shadow-sm">
                    {activeConversationId ? (
                        <>
                            {/* Header */}
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                                        <span className="font-bold text-primary">
                                            {(activeConversation?.otherUserName || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold">{activeConversation?.otherUserName || 'User'}</h3>
                                        <p className="text-xs text-green-600 font-medium">Online</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-2 hover:bg-muted rounded-full">
                                        <Phone className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-full">
                                        <Video className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                    <button className="p-2 hover:bg-muted rounded-full">
                                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                {messages.map(msg => (
                                    <div key={`msg-${msg.id}`} className={`flex ${msg.senderId === currentUser?.id ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl p-4 ${msg.senderId === currentUser?.id ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted text-foreground rounded-tl-none'}`}>
                                            <p>{msg.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${msg.senderId === currentUser?.id ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-border bg-background">
                                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-2xl">
                                    <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                        <Image className="w-5 h-5" />
                                    </button>
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 bg-transparent outline-none p-2"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage();
                                            }
                                        }}
                                    />
                                    <button className="p-2 hover:bg-muted rounded-full text-muted-foreground">
                                        <Mic className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleSendMessage}
                                        className="p-2 bg-primary text-primary-foreground rounded-xl shadow-lg hover:scale-105 transition-transform"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" />
                                <p>Select a conversation to start messaging</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Chat;
