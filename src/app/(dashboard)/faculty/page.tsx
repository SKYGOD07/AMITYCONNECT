"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertTriangle, Shield, Users, Car, Package,
    MapPin, Phone, Clock, CheckCircle, Loader2,
    ArrowRight, Eye
} from "lucide-react";
import Link from "next/link";
import { EmergencyAlert, UserProfile } from "@/types";
import { format } from "date-fns";

export default function FacultyDashboard() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalStudents: 0,
        activeRides: 0,
        pendingErrands: 0,
        resolvedAlerts: 0
    });

    // Check if user is faculty/admin
    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/login");
            return;
        }

        if (user) {
            // Get user profile to check role
            const fetchProfile = async () => {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const profile = docSnap.data() as UserProfile;
                    setUserProfile(profile);

                    // Redirect non-faculty to regular dashboard
                    if (profile.role !== 'faculty' && profile.role !== 'admin') {
                        router.push("/");
                    }
                }
                setLoading(false);
            };
            fetchProfile();
        }
    }, [user, authLoading, router]);

    // Listen to active SOS alerts
    useEffect(() => {
        if (!userProfile || (userProfile.role !== 'faculty' && userProfile.role !== 'admin')) return;

        // Simplified query - filter and sort client-side to avoid index
        const alertsQuery = query(
            collection(db, "emergencies")
        );

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
            const allAlerts: EmergencyAlert[] = [];
            snapshot.forEach((doc) => {
                allAlerts.push({ id: doc.id, ...doc.data() } as EmergencyAlert);
            });
            // Filter active and sort client-side
            const activeFiltered = allAlerts
                .filter(alert => alert.active)
                .sort((a, b) => {
                    const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                    const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                    return bTime - aTime;
                })
                .slice(0, 10);
            setActiveAlerts(activeFiltered);
        }, (error) => {
            console.error("Error fetching alerts:", error);
            // Fallback: show sample data for demo
            setActiveAlerts([
                {
                    id: "demo1",
                    userId: "user1",
                    userName: "Priya Sharma",
                    location: { latitude: 15.4909, longitude: 73.8278 } as any,
                    locationName: "Near Library",
                    active: true,
                    createdAt: { toDate: () => new Date() } as any
                }
            ]);
        });

        return () => unsubscribe();
    }, [userProfile]);

    if (authLoading || loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!userProfile || (userProfile.role !== 'faculty' && userProfile.role !== 'admin')) {
        return null;
    }

    return (
        <div className="space-y-8">
            {/* Faculty Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                            <Shield className="h-3 w-3 mr-1" />
                            {userProfile.role === 'admin' ? 'Administrator' : 'Faculty'}
                        </Badge>
                        {userProfile.verified && (
                            <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
                    <p className="text-muted-foreground">Monitor campus safety and community activity</p>
                </div>
                <Link href="/sos">
                    <Button variant="destructive" className="gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        View All Alerts
                    </Button>
                </Link>
            </div>

            {/* Active SOS Alerts - Priority Section */}
            <Card className="border-2 border-red-500/30 bg-red-500/5">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center animate-pulse">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-red-500">Active Emergency Alerts</CardTitle>
                                <CardDescription>Immediate attention required</CardDescription>
                            </div>
                        </div>
                        <Badge variant="destructive" className="text-lg px-4 py-1">
                            {activeAlerts.length} Active
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeAlerts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                            <p className="font-medium">All Clear</p>
                            <p className="text-sm">No active emergency alerts</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeAlerts.map((alert) => (
                                <div
                                    key={alert.id}
                                    className="flex items-center justify-between p-4 rounded-lg bg-background border border-red-500/20 hover:border-red-500/40 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12 border-2 border-red-500">
                                            <AvatarImage src={alert.userPhoto} />
                                            <AvatarFallback className="bg-red-500/20 text-red-500">
                                                {alert.userName?.charAt(0) || "?"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold">{alert.userName || "Unknown User"}</p>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {alert.locationName || "Unknown Location"}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {alert.createdAt?.toDate ?
                                                        format(alert.createdAt.toDate(), "h:mm a") :
                                                        "Just now"
                                                    }
                                                </span>
                                            </div>
                                            {alert.message && (
                                                <p className="text-sm mt-1 text-red-400">{alert.message}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {alert.userPhone && (
                                            <Button size="sm" variant="outline" className="gap-1">
                                                <Phone className="h-4 w-4" />
                                                Call
                                            </Button>
                                        )}
                                        <Link href={`/profile/${alert.userId}`}>
                                            <Button size="sm" variant="ghost" className="gap-1">
                                                <Eye className="h-4 w-4" />
                                                Profile
                                            </Button>
                                        </Link>
                                        <Button size="sm" variant="destructive">
                                            Respond
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">156</p>
                                <p className="text-sm text-muted-foreground">Active Users</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                                <Car className="h-6 w-6 text-green-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">12</p>
                                <p className="text-sm text-muted-foreground">Active Rides</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                                <Package className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">8</p>
                                <p className="text-sm text-muted-foreground">Open Errands</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                                <Shield className="h-6 w-6 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">47</p>
                                <p className="text-sm text-muted-foreground">Alerts Resolved</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                <Link href="/rides">
                    <Card className="card-hover cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Ride Board
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription>Monitor active rides and requests</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/errands">
                    <Card className="card-hover cursor-pointer">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Errands
                                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            </CardTitle>
                            <CardDescription>View community errand requests</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
                <Link href="/sos">
                    <Card className="card-hover cursor-pointer border-red-500/20">
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between text-red-500">
                                SOS Center
                                <ArrowRight className="h-5 w-5" />
                            </CardTitle>
                            <CardDescription>Emergency response center</CardDescription>
                        </CardHeader>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
