"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Users, GraduationCap, Building, Shield, Search,
    CheckCircle, Loader2, ArrowLeft, Filter
} from "lucide-react";
import { UserProfile, UserRole } from "@/types";

export default function PeoplePage() {
    const searchParams = useSearchParams();
    const filterParam = searchParams.get("filter") as "students" | "faculty" | null;
    const { user } = useAuth();

    const [filter, setFilter] = useState<"all" | "students" | "faculty">(filterParam || "all");
    const [people, setPeople] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchPeople();
    }, [filter]);

    const fetchPeople = async () => {
        setLoading(true);
        try {
            let q;
            if (filter === "students") {
                q = query(
                    collection(db, "users"),
                    where("role", "==", "student"),
                    orderBy("displayName")
                );
            } else if (filter === "faculty") {
                q = query(
                    collection(db, "users"),
                    where("role", "in", ["faculty", "admin"]),
                    orderBy("displayName")
                );
            } else {
                q = query(
                    collection(db, "users"),
                    orderBy("displayName")
                );
            }

            const snapshot = await getDocs(q);
            const profiles: UserProfile[] = [];
            snapshot.forEach((doc) => {
                profiles.push(doc.data() as UserProfile);
            });
            setPeople(profiles);
        } catch (error) {
            console.error("Error fetching people:", error);
            // Fallback without ordering if index doesn't exist
            try {
                const snapshot = await getDocs(collection(db, "users"));
                const profiles: UserProfile[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data() as UserProfile;
                    if (filter === "all" ||
                        (filter === "students" && data.role === "student") ||
                        (filter === "faculty" && (data.role === "faculty" || data.role === "admin"))) {
                        profiles.push(data);
                    }
                });
                setPeople(profiles.sort((a, b) =>
                    (a.displayName || "").localeCompare(b.displayName || "")
                ));
            } catch (e) {
                console.error("Fallback error:", e);
            }
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (profile: UserProfile) => {
        switch (profile.role) {
            case 'admin':
                return (
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                    </Badge>
                );
            case 'faculty':
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                        <Building className="h-3 w-3 mr-1" />
                        Faculty
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Student
                    </Badge>
                );
        }
    };

    const filteredPeople = people.filter(p =>
        p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.department?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const studentCount = people.filter(p => p.role === "student").length;
    const facultyCount = people.filter(p => p.role === "faculty" || p.role === "admin").length;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Users className="h-6 w-6" />
                        Community
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Browse and connect with students and faculty
                    </p>
                </div>
            </div>

            {/* Stats & Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex gap-2">
                    <Button
                        variant={filter === "all" ? "default" : "outline"}
                        onClick={() => setFilter("all")}
                        className="gap-2"
                    >
                        <Users className="h-4 w-4" />
                        All ({people.length})
                    </Button>
                    <Button
                        variant={filter === "students" ? "default" : "outline"}
                        onClick={() => setFilter("students")}
                        className="gap-2"
                    >
                        <GraduationCap className="h-4 w-4" />
                        Students ({studentCount})
                    </Button>
                    <Button
                        variant={filter === "faculty" ? "default" : "outline"}
                        onClick={() => setFilter("faculty")}
                        className="gap-2"
                    >
                        <Building className="h-4 w-4" />
                        Faculty ({facultyCount})
                    </Button>
                </div>
                <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Filter by name or department..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* People Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : filteredPeople.length === 0 ? (
                <Card>
                    <CardContent className="py-16 text-center">
                        <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No people found</h3>
                        <p className="text-muted-foreground">
                            {searchQuery ? `No results for "${searchQuery}"` : "No users registered yet"}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPeople.map((profile) => (
                        <Link key={profile.uid} href={`/profile/${profile.uid}`}>
                            <Card className="h-full card-hover cursor-pointer">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-4">
                                        <Avatar className="h-14 w-14 border-2 border-primary/20">
                                            <AvatarImage src={profile.photoURL} />
                                            <AvatarFallback className="text-lg">
                                                {profile.displayName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold truncate">
                                                    {profile.displayName}
                                                </h3>
                                                {profile.verified && (
                                                    <CheckCircle className="h-4 w-4 text-blue-500 flex-shrink-0" />
                                                )}
                                            </div>
                                            {getRoleBadge(profile)}
                                            {profile.department && (
                                                <p className="text-sm text-muted-foreground mt-2 truncate">
                                                    {profile.department}
                                                </p>
                                            )}
                                            {profile.year && (
                                                <p className="text-xs text-muted-foreground">
                                                    {profile.year}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex gap-4 mt-4 pt-4 border-t text-sm text-muted-foreground">
                                        <span>{profile.followersCount || 0} followers</span>
                                        <span>{profile.ridesShared || 0} rides</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
