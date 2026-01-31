"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Loader2, Mail, ArrowLeft, Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { Message } from "@/types";
import { format } from "date-fns";

export default function MessagesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (!user) return;

        // Simplified query - sort client-side to avoid index
        const messagesQuery = query(
            collection(db, "messages"),
            where("receiverId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
            const msgs: Message[] = [];
            snapshot.forEach((doc) => {
                msgs.push({ id: doc.id, ...doc.data() } as Message);
            });
            // Sort by createdAt desc client-side
            msgs.sort((a, b) => {
                const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });
            setMessages(msgs);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user, authLoading, router]);

    const markAsRead = async (messageId: string) => {
        try {
            await updateDoc(doc(db, "messages", messageId), {
                read: true
            });
        } catch (error) {
            console.error("Error marking message as read:", error);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const unreadCount = messages.filter(m => !m.read).length;

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <MessageCircle className="h-6 w-6" />
                            Messages
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} unread messages` : "All caught up!"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            {messages.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Mail className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No messages yet</h3>
                        <p className="text-muted-foreground">
                            When someone sends you a message, it will appear here.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`transition-colors ${!msg.read ? 'border-primary/50 bg-primary/5' : ''}`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-start gap-4">
                                    <Link href={`/profile/${msg.senderId}`}>
                                        <Avatar className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                                            <AvatarFallback>
                                                {msg.senderName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <Link href={`/profile/${msg.senderId}`} className="hover:underline">
                                                <span className="font-semibold">{msg.senderName || "Unknown"}</span>
                                            </Link>
                                            <div className="flex items-center gap-2">
                                                {!msg.read && (
                                                    <Badge variant="default" className="text-xs">New</Badge>
                                                )}
                                                <span className="text-xs text-muted-foreground">
                                                    {msg.createdAt?.toDate ?
                                                        format(msg.createdAt.toDate(), "MMM d, h:mm a") :
                                                        "Just now"
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground">{msg.content}</p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Link href={`/profile/${msg.senderId}`}>
                                                <Button size="sm" variant="outline">
                                                    View Profile
                                                </Button>
                                            </Link>
                                            {!msg.read && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => msg.id && markAsRead(msg.id)}
                                                    className="gap-1"
                                                >
                                                    <Check className="h-3 w-3" />
                                                    Mark as Read
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
