"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs, orderBy, limit, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search, X, Users, GraduationCap, Building, Shield,
    CheckCircle, Loader2, UserPlus
} from "lucide-react";
import { UserProfile } from "@/types";

interface SearchPeopleProps {
    className?: string;
}

export default function SearchPeople({ className = "" }: SearchPeopleProps) {
    const { user } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [recentProfiles, setRecentProfiles] = useState<UserProfile[]>([]);
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

    // Fetch recent profiles when dropdown opens
    useEffect(() => {
        if (showDropdown && recentProfiles.length === 0) {
            fetchRecentProfiles();
        }
    }, [showDropdown]);

    const fetchRecentProfiles = async () => {
        try {
            // Simplified query without orderBy to avoid composite index
            const q = query(
                collection(db, "users"),
                limit(10)
            );
            const snapshot = await getDocs(q);
            const profiles: UserProfile[] = [];
            snapshot.forEach((doc) => {
                if (doc.id !== user?.uid) {
                    profiles.push(doc.data() as UserProfile);
                }
            });
            // Sort client-side by createdAt
            profiles.sort((a, b) => {
                const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });
            setRecentProfiles(profiles.slice(0, 5));
        } catch (error) {
            console.error("Error fetching recent profiles:", error);
        }
    };

    // Search users
    const handleSearch = async (searchTerm: string) => {
        setSearchQuery(searchTerm);

        if (searchTerm.length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            // Search by displayName (case-insensitive would need additional setup)
            const usersRef = collection(db, "users");
            const snapshot = await getDocs(usersRef);

            const matchedUsers: UserProfile[] = [];
            const lowerSearch = searchTerm.toLowerCase();

            snapshot.forEach((doc) => {
                const data = doc.data() as UserProfile;
                if (
                    doc.id !== user?.uid &&
                    (data.displayName?.toLowerCase().includes(lowerSearch) ||
                        data.email?.toLowerCase().includes(lowerSearch) ||
                        data.department?.toLowerCase().includes(lowerSearch))
                ) {
                    matchedUsers.push(data);
                }
            });

            setResults(matchedUsers.slice(0, 8));
        } catch (error) {
            console.error("Error searching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (profile: UserProfile) => {
        switch (profile.role) {
            case 'admin':
                return (
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30 text-xs">
                        <Shield className="h-2 w-2 mr-1" />
                        Admin
                    </Badge>
                );
            case 'faculty':
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs">
                        <Building className="h-2 w-2 mr-1" />
                        Faculty
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                        <GraduationCap className="h-2 w-2 mr-1" />
                        Student
                    </Badge>
                );
        }
    };

    const handleProfileClick = (profile: UserProfile) => {
        setShowDropdown(false);
        setSearchQuery("");
        router.push(`/profile/${profile.uid}`);
    };

    const displayResults = searchQuery.length >= 2 ? results : recentProfiles;

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search people..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowDropdown(true)}
                    className="pl-9 pr-8 w-[200px] lg:w-[280px] bg-muted/50"
                />
                {searchQuery && (
                    <button
                        onClick={() => { setSearchQuery(""); setResults([]); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-lg shadow-lg z-50 overflow-hidden">
                    {/* Quick Links */}
                    <div className="p-2 border-b flex gap-2">
                        <Link href="/people?filter=students" onClick={() => setShowDropdown(false)}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <GraduationCap className="h-3 w-3" />
                                All Students
                            </Button>
                        </Link>
                        <Link href="/people?filter=faculty" onClick={() => setShowDropdown(false)}>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                                <Building className="h-3 w-3" />
                                All Faculty
                            </Button>
                        </Link>
                    </div>

                    {/* Results */}
                    <div className="max-h-[300px] overflow-y-auto">
                        {loading ? (
                            <div className="p-4 text-center">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                            </div>
                        ) : displayResults.length > 0 ? (
                            <div className="p-2">
                                <p className="text-xs text-muted-foreground px-2 mb-2">
                                    {searchQuery.length >= 2 ? "Search Results" : "Recent People"}
                                </p>
                                {displayResults.map((profile) => (
                                    <button
                                        key={profile.uid}
                                        onClick={() => handleProfileClick(profile)}
                                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors text-left"
                                    >
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={profile.photoURL} />
                                            <AvatarFallback className="text-sm">
                                                {profile.displayName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">
                                                    {profile.displayName}
                                                </p>
                                                {profile.verified && (
                                                    <CheckCircle className="h-3 w-3 text-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getRoleBadge(profile)}
                                                {profile.department && (
                                                    <span className="text-xs text-muted-foreground truncate">
                                                        {profile.department}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : searchQuery.length >= 2 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                No users found for "{searchQuery}"
                            </div>
                        ) : (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                                <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                Start typing to search people
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
