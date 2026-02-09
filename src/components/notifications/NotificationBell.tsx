"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Bell, MessageCircle, Car, Package, AlertTriangle,
    Check, X, Loader2
} from "lucide-react";
import { format } from "date-fns";

interface Notification {
    id: string;
    type: "message" | "ride" | "errand" | "sos";
    title: string;
    description: string;
    read: boolean;
    createdAt: any;
    link?: string;
    senderId?: string;
    senderName?: string;
    senderPhoto?: string;
}

export default function NotificationBell() {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Listen for messages
    useEffect(() => {
        if (!user) return;

        // Simplified query - no orderBy to avoid composite index
        const messagesQuery = query(
            collection(db, "messages"),
            where("receiverId", "==", user.uid),
            limit(30)
        );

        const unsubMessages = onSnapshot(messagesQuery, (snapshot) => {
            const msgs: Notification[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                // Filter unread messages client-side
                if (!data.read) {
                    msgs.push({
                        id: doc.id,
                        type: "message",
                        title: `Message from ${data.senderName || "Someone"}`,
                        description: data.content?.substring(0, 50) + (data.content?.length > 50 ? "..." : ""),
                        read: data.read,
                        createdAt: data.createdAt,
                        link: `/messages`,
                        senderId: data.senderId,
                        senderName: data.senderName,
                        senderPhoto: data.senderPhoto
                    });
                }
            });

            // Sort by createdAt client-side
            msgs.sort((a, b) => {
                const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
                const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });

            setNotifications(prev => {
                const filtered = prev.filter(n => n.type !== "message");
                return [...msgs.slice(0, 10), ...filtered];
            });
            setLoading(false);
        }, (error) => {
            console.error("Error fetching messages:", error);
            setLoading(false);
        });

        return () => unsubMessages();
    }, [user]);

    // Calculate unread count
    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.read).length);
    }, [notifications]);

    const getIcon = (type: string) => {
        switch (type) {
            case "message":
                return <MessageCircle className="h-4 w-4 text-blue-500" />;
            case "ride":
                return <Car className="h-4 w-4 text-green-500" />;
            case "errand":
                return <Package className="h-4 w-4 text-orange-500" />;
            case "sos":
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            default:
                return <Bell className="h-4 w-4" />;
        }
    };

    const markAsRead = async (notificationId: string, type: string) => {
        try {
            if (type === "message") {
                await updateDoc(doc(db, "messages", notificationId), { read: true });
            }
            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllAsRead = async () => {
        for (const notif of notifications.filter(n => !n.read)) {
            await markAsRead(notif.id, notif.type);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDropdown(!showDropdown)}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-3 border-b flex items-center justify-between">
                        <h3 className="font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={markAllAsRead}
                                className="text-xs h-7"
                            >
                                <Check className="h-3 w-3 mr-1" />
                                Mark all read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">
                                <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notif) => (
                                <Link
                                    key={notif.id}
                                    href={notif.link || "#"}
                                    onClick={() => {
                                        markAsRead(notif.id, notif.type);
                                        setShowDropdown(false);
                                    }}
                                >
                                    <div className={`p-3 border-b hover:bg-muted transition-colors flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}>
                                        <div className="flex-shrink-0 mt-1">
                                            {notif.senderPhoto ? (
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={notif.senderPhoto} />
                                                    <AvatarFallback className="text-xs">
                                                        {notif.senderName?.charAt(0) || "?"}
                                                    </AvatarFallback>
                                                </Avatar>
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${notif.type === 'message' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' :
                                                    notif.type === 'ride' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' :
                                                        notif.type === 'sos' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                                                            'bg-muted text-muted-foreground'
                                                    }`}>
                                                    {getIcon(notif.type)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>
                                                {notif.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notif.description}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {notif.createdAt?.toDate ?
                                                    format(notif.createdAt.toDate(), "MMM d, h:mm a") :
                                                    "Just now"
                                                }
                                            </p>
                                        </div>
                                        {!notif.read && (
                                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-2 border-t">
                        <Link href="/messages" onClick={() => setShowDropdown(false)}>
                            <Button variant="ghost" className="w-full text-sm">
                                View all messages
                            </Button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
