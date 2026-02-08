"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, User, AlertTriangle, Shield, MessageCircle, Users } from "lucide-react";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { UserProfile } from "@/types";
import SearchPeople from "@/components/search/SearchPeople";
import NotificationBell from "@/components/notifications/NotificationBell";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (user) {
            const fetchProfile = async () => {
                try {
                    const docRef = doc(db, "users", user.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setUserProfile(docSnap.data() as UserProfile);
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            };
            fetchProfile();
        }
    }, [user]);

    // Hide header on landing page (it has its own navigation)
    // Also hide on auth pages as they use the landing header style
    if (pathname === "/landing" || pathname === "/login" || pathname === "/signup") {
        return null;
    }

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/landing");
    };

    const isFacultyOrAdmin = userProfile?.role === 'faculty' || userProfile?.role === 'admin';

    return (
        <header className="border-b bg-background shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href={isFacultyOrAdmin ? "/faculty" : "/"} className="font-bold text-xl flex items-center gap-2 text-primary">
                        <img src="/assets/logo.png" alt="CampusFlow" className="h-8 w-auto" />
                        <span className="hidden sm:block">AmityConnect</span>
                    </Link>

                    {/* Search - only show when logged in */}
                    {user && (
                        <SearchPeople className="hidden md:block" />
                    )}
                </div>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-6">
                    <Link href="/rides" className="text-sm font-medium text-foreground/80 hover:text-primary">Ride Board</Link>
                    <Link href="/errands" className="text-sm font-medium text-foreground/80 hover:text-primary">Errands</Link>
                    <Link href="/people" className="text-sm font-medium text-foreground/80 hover:text-primary flex items-center gap-1">
                        <Users size={16} /> People
                    </Link>
                    <Link href="/sos" className="text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-1">
                        <AlertTriangle size={16} /> SOS
                    </Link>
                    {isFacultyOrAdmin && (
                        <Link href="/faculty" className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                            <Shield size={16} /> Faculty
                        </Link>
                    )}
                </nav>

                <div className="flex items-center gap-2">
                    {!loading && user ? (
                        <div className="flex items-center gap-2">
                            {/* Notification Bell */}
                            <NotificationBell />

                            {/* Role Badge */}
                            {isFacultyOrAdmin && (
                                <Badge variant="outline" className="hidden lg:flex bg-purple-500/10 text-purple-500 border-purple-500/30">
                                    <Shield className="h-3 w-3 mr-1" />
                                    {userProfile?.role === 'admin' ? 'Admin' : 'Faculty'}
                                </Badge>
                            )}

                            {/* User Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="flex items-center gap-2 px-2">
                                        {user.photoURL ? (
                                            <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border" />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">
                                                {(user.displayName || user.email || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium hidden sm:block max-w-[100px] truncate">
                                            {user.displayName || user.email?.split('@')[0]}
                                        </span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <DropdownMenuLabel>
                                        <div className="flex flex-col">
                                            <span>{user.displayName || "User"}</span>
                                            <span className="text-xs text-muted-foreground font-normal">{user.email}</span>
                                        </div>
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link href={`/profile/${user.uid}`} className="flex items-center gap-2 cursor-pointer">
                                            <User size={16} />
                                            My Profile
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/messages" className="flex items-center gap-2 cursor-pointer">
                                            <MessageCircle size={16} />
                                            Messages
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem asChild>
                                        <Link href="/people" className="flex items-center gap-2 cursor-pointer">
                                            <Users size={16} />
                                            Browse People
                                        </Link>
                                    </DropdownMenuItem>
                                    {isFacultyOrAdmin && (
                                        <DropdownMenuItem asChild>
                                            <Link href="/faculty" className="flex items-center gap-2 cursor-pointer">
                                                <Shield size={16} />
                                                Faculty Dashboard
                                            </Link>
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                                        <LogOut size={16} className="mr-2" />
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    ) : (
                        !loading && (
                            <div className="flex items-center gap-2">
                                <Link href="/login">
                                    <Button variant="ghost">Login</Button>
                                </Link>
                                <Link href="/signup">
                                    <Button>Sign Up</Button>
                                </Link>
                            </div>
                        )
                    )}
                    <ModeToggle />
                </div>
            </div>
        </header>
    );
}
