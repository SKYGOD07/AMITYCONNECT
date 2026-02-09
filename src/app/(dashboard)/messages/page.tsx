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
                <Card className="border-dashed">
                    <CardContent className="py-20 text-center">
                        <div className="w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <MessageCircle className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No messages yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            Start a conversation with other students or faculty members by visiting their profiles.
                        </p>
                        <Link href="/people" className="mt-6 inline-block">
                            <Button>Browse People</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <Card
                            key={msg.id}
                            className={`transition-all hover:shadow-md ${!msg.read ? 'border-l-4 border-l-primary bg-primary/5' : 'hover:bg-muted/50'}`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <Link href={`/profile/${msg.senderId}`}>
                                        <div className="relative">
                                            <Avatar className="h-12 w-12 cursor-pointer border-2 border-background shadow-sm hover:scale-105 transition-transform">
                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                    {msg.senderName?.charAt(0) || "?"}
                                                </AvatarFallback>
                                            </Avatar>
                                            {!msg.read && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-primary border-2 border-background"></span>
                                                </span>
                                            )}
                                        </div>
                                    </Link>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <Link href={`/profile/${msg.senderId}`} className="hover:underline">
                                                <span className={`font-semibold text-lg ${!msg.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                                    {msg.senderName || "Unknown"}
                                                </span>
                                            </Link>
                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                                                {msg.createdAt?.toDate ?
                                                    format(msg.createdAt.toDate(), "MMM d, h:mm a") :
                                                    "Just now"
                                                }
                                            </span>
                                        </div>
                                        <p className={`text-sm leading-relaxed ${!msg.read ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                                            {msg.content}
                                        </p>
                                        <div className="flex items-center gap-3 mt-4">
                                            {!msg.read && (
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    onClick={() => msg.id && markAsRead(msg.id)}
                                                    className="h-8 text-xs gap-1.5 rounded-full"
                                                >
                                                    <CheckCheck className="h-3 w-3" />
                                                    Mark as Read
                                                </Button>
                                            )}
                                            <Link href={`/profile/${msg.senderId}`}>
                                                <Button size="sm" variant={msg.read ? "outline" : "ghost"} className="h-8 text-xs gap-1.5 rounded-full">
                                                    <Mail className="h-3 w-3" />
                                                    Reply
                                                </Button>
                                            </Link>
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
