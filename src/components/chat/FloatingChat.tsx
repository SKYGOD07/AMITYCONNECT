"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { collection, query, where, limit, onSnapshot, doc, getDoc, addDoc, serverTimestamp, orderBy, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    MessageCircle, X, ChevronUp, Loader2, ArrowLeft, Send
} from "lucide-react";
import { UserProfile, Message } from "@/types";
import { format } from "date-fns";

interface Conversation {
    id: string;
    participant: UserProfile;
    lastMessage?: string;
    lastMessageAt?: any;
    unread: number;
}

export default function FloatingChat() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [unreadTotal, setUnreadTotal] = useState(0);

    // Chat view state
    const [activeChat, setActiveChat] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Real-time listener for conversations
    useEffect(() => {
        if (!user) return;

        const userProfileCache = new Map<string, UserProfile>();

        const receivedQuery = query(
            collection(db, "messages"),
            where("receiverId", "==", user.uid),
            limit(50)
        );

        const sentQuery = query(
            collection(db, "messages"),
            where("senderId", "==", user.uid),
            limit(50)
        );

        let receivedMessages: any[] = [];
        let sentMessages: any[] = [];

        const processMessages = async () => {
            const conversationMap = new Map<string, { lastMessage: string; lastMessageAt: any; unread: number }>();
            const userIds = new Set<string>();

            receivedMessages.forEach((data) => {
                userIds.add(data.senderId);
                const existing = conversationMap.get(data.senderId);

                if (!existing) {
                    conversationMap.set(data.senderId, {
                        lastMessage: data.content,
                        lastMessageAt: data.createdAt,
                        unread: data.read ? 0 : 1
                    });
                } else {
                    const existingTime = existing.lastMessageAt?.toDate?.()?.getTime() || 0;
                    const newTime = data.createdAt?.toDate?.()?.getTime() || 0;
                    if (newTime > existingTime) {
                        existing.lastMessage = data.content;
                        existing.lastMessageAt = data.createdAt;
                    }
                    if (!data.read) existing.unread++;
                }
            });

            sentMessages.forEach((data) => {
                userIds.add(data.receiverId);
                const existing = conversationMap.get(data.receiverId);

                if (!existing) {
                    conversationMap.set(data.receiverId, {
                        lastMessage: data.content,
                        lastMessageAt: data.createdAt,
                        unread: 0
                    });
                } else {
                    const existingTime = existing.lastMessageAt?.toDate?.()?.getTime() || 0;
                    const newTime = data.createdAt?.toDate?.()?.getTime() || 0;
                    if (newTime > existingTime) {
                        existing.lastMessage = data.content;
                        existing.lastMessageAt = data.createdAt;
                    }
                }
            });

            const convs: Conversation[] = [];
            for (const uid of userIds) {
                if (uid === user.uid) continue;

                try {
                    let userData = userProfileCache.get(uid);

                    if (!userData) {
                        const userDoc = await getDoc(doc(db, "users", uid));
                        if (userDoc.exists()) {
                            userData = userDoc.data() as UserProfile;
                            userProfileCache.set(uid, userData);
                        }
                    }

                    if (userData) {
                        const convData = conversationMap.get(uid);
                        convs.push({
                            id: uid,
                            participant: userData,
                            lastMessage: convData?.lastMessage,
                            lastMessageAt: convData?.lastMessageAt,
                            unread: convData?.unread || 0
                        });
                    }
                } catch (e) {
                    console.error("Error fetching user:", e);
                }
            }

            convs.sort((a, b) => {
                const aTime = a.lastMessageAt?.toDate?.()?.getTime() || 0;
                const bTime = b.lastMessageAt?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });

            setConversations(convs.slice(0, 10));
            setUnreadTotal(convs.reduce((sum, c) => sum + c.unread, 0));
            setLoading(false);
        };

        const unsubReceived = onSnapshot(receivedQuery, (snapshot) => {
            receivedMessages = [];
            snapshot.forEach((doc) => {
                receivedMessages.push({ id: doc.id, ...doc.data() });
            });
            processMessages();
        }, (error) => {
            console.error("Error in received messages listener:", error);
            setLoading(false);
        });

        const unsubSent = onSnapshot(sentQuery, (snapshot) => {
            sentMessages = [];
            snapshot.forEach((doc) => {
                sentMessages.push({ id: doc.id, ...doc.data() });
            });
            processMessages();
        }, (error) => {
            console.error("Error in sent messages listener:", error);
            setLoading(false);
        });

        return () => {
            unsubReceived();
            unsubSent();
        };
    }, [user]);

    // Load messages when opening a chat
    useEffect(() => {
        if (!activeChat || !user) return;

        setLoadingMessages(true);

        // Query for messages between current user and active chat participant
        const messagesQuery = query(
            collection(db, "messages"),
            where("senderId", "in", [user.uid, activeChat.id]),
            limit(100)
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const allMessages: Message[] = [];
            snapshot.forEach((docSnap) => {
                const data = docSnap.data();
                // Filter for messages between these two users
                if (
                    (data.senderId === user.uid && data.receiverId === activeChat.id) ||
                    (data.senderId === activeChat.id && data.receiverId === user.uid)
                ) {
                    allMessages.push({ id: docSnap.id, ...data } as Message);

                    // Mark received messages as read
                    if (data.receiverId === user.uid && !data.read) {
                        updateDoc(doc(db, "messages", docSnap.id), { read: true });
                    }
                }
            });

            // Sort by createdAt
            allMessages.sort((a, b) => {
                const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                return aTime - bTime;
            });

            setMessages(allMessages);
            setLoadingMessages(false);
        }, (error) => {
            console.error("Error loading messages:", error);
            setLoadingMessages(false);
        });

        return () => unsubscribe();
    }, [activeChat, user]);

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeChat || !user || sendingMessage) return;

        setSendingMessage(true);
        try {
            // Get current user's profile
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const userProfile = userDoc.exists() ? userDoc.data() : {};

            await addDoc(collection(db, "messages"), {
                senderId: user.uid,
                senderName: userProfile.displayName || user.displayName || "User",
                senderPhoto: userProfile.photoURL || user.photoURL || "",
                receiverId: activeChat.id,
                receiverName: activeChat.participant.displayName,
                content: newMessage.trim(),
                read: false,
                createdAt: serverTimestamp()
            });

            setNewMessage("");
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSendingMessage(false);
        }
    };

    const openChat = (conv: Conversation) => {
        setActiveChat(conv);
    };

    const closeChat = () => {
        setActiveChat(null);
        setMessages([]);
    };

    if (!user) return null;

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => { setIsOpen(!isOpen); setIsMinimized(false); setActiveChat(null); }}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageCircle className="h-6 w-6" />
                {unreadTotal > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadTotal > 9 ? "9+" : unreadTotal}
                    </span>
                )}
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className={`fixed bottom-6 right-6 z-50 w-80 bg-popover border rounded-2xl shadow-2xl overflow-hidden transition-all ${isMinimized ? 'h-14' : 'h-[450px]'}`}>
                    {/* Header */}
                    <div
                        className="h-14 px-4 flex items-center justify-between bg-primary text-primary-foreground cursor-pointer"
                        onClick={() => !activeChat && setIsMinimized(!isMinimized)}
                    >
                        <div className="flex items-center gap-2">
                            {activeChat ? (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                                        onClick={(e) => { e.stopPropagation(); closeChat(); }}
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={activeChat.participant.photoURL} />
                                        <AvatarFallback className="text-xs bg-white/20">
                                            {activeChat.participant.displayName?.charAt(0) || "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold truncate max-w-[120px]">
                                        {activeChat.participant.displayName}
                                    </span>
                                </>
                            ) : (
                                <>
                                    <MessageCircle className="h-5 w-5" />
                                    <span className="font-semibold">Messages</span>
                                    {unreadTotal > 0 && (
                                        <Badge className="bg-white/20 text-white">{unreadTotal}</Badge>
                                    )}
                                </>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {!activeChat && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                                >
                                    <ChevronUp className={`h-4 w-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground hover:bg-white/20"
                                onClick={(e) => { e.stopPropagation(); setIsOpen(false); setActiveChat(null); }}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Content */}
                    {!isMinimized && (
                        <div className="flex flex-col h-[calc(100%-3.5rem)]">
                            {activeChat ? (
                                // Chat View
                                <>
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                        {loadingMessages ? (
                                            <div className="flex items-center justify-center h-full">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                                <MessageCircle className="h-10 w-10 mb-2 opacity-50" />
                                                <p className="text-sm">No messages yet</p>
                                                <p className="text-xs">Start the conversation!</p>
                                            </div>
                                        ) : (
                                            <>
                                                {messages.map((msg) => (
                                                    <div
                                                        key={msg.id}
                                                        className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div
                                                            className={`max-w-[75%] px-3 py-2 rounded-2xl ${msg.senderId === user.uid
                                                                    ? 'bg-primary text-primary-foreground rounded-br-md'
                                                                    : 'bg-muted rounded-bl-md'
                                                                }`}
                                                        >
                                                            <p className="text-sm break-words">{msg.content}</p>
                                                            <p className={`text-xs mt-1 ${msg.senderId === user.uid ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                                                }`}>
                                                                {(msg.createdAt as any)?.toDate
                                                                    ? format((msg.createdAt as any).toDate(), "h:mm a")
                                                                    : "Now"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                                <div ref={messagesEndRef} />
                                            </>
                                        )}
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-3 border-t">
                                        <form
                                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                                            className="flex gap-2"
                                        >
                                            <Input
                                                placeholder="Write a message..."
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                className="flex-1"
                                                disabled={sendingMessage}
                                            />
                                            <Button
                                                type="submit"
                                                size="icon"
                                                disabled={!newMessage.trim() || sendingMessage}
                                            >
                                                {sendingMessage ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Send className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </form>
                                    </div>
                                </>
                            ) : (
                                // Conversations List
                                <>
                                    {loading ? (
                                        <div className="flex-1 flex items-center justify-center">
                                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : conversations.length === 0 ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-muted-foreground">
                                            <MessageCircle className="h-12 w-12 mb-3 opacity-50" />
                                            <p className="text-center text-sm">No conversations yet</p>
                                            <p className="text-center text-xs mt-1">Start chatting by visiting someone&apos;s profile</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto">
                                            {conversations.map((conv) => (
                                                <button
                                                    key={conv.id}
                                                    onClick={() => openChat(conv)}
                                                    className={`w-full p-3 flex items-center gap-3 hover:bg-muted transition-colors border-b text-left ${conv.unread > 0 ? 'bg-primary/5' : ''}`}
                                                >
                                                    <Avatar className="h-10 w-10">
                                                        <AvatarImage src={conv.participant.photoURL} />
                                                        <AvatarFallback>
                                                            {conv.participant.displayName?.charAt(0) || "?"}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold' : ''}`}>
                                                                {conv.participant.displayName}
                                                            </p>
                                                            {conv.lastMessageAt?.toDate && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    {format(conv.lastMessageAt.toDate(), "h:mm a")}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground truncate">
                                                            {conv.lastMessage || "No messages"}
                                                        </p>
                                                    </div>
                                                    {conv.unread > 0 && (
                                                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                                                            {conv.unread}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="p-3 border-t">
                                        <Link href="/messages" onClick={() => setIsOpen(false)}>
                                            <Button variant="outline" className="w-full gap-2">
                                                <MessageCircle className="h-4 w-4" />
                                                View All Messages
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
