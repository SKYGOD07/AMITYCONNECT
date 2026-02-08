"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Ride } from "@/types";
import RideCard from "@/components/rides/RideCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Plus, Car, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Hardcoded sample rides for demo
const SAMPLE_RIDES: Ride[] = [
    {
        id: "demo-ride-1",
        hostId: "demo-user-1",
        hostName: "Rahul Sharma",
        type: "OFFER",
        origin: "Amity Gwalior Campus",
        destination: "Gwalior Bus Stand",
        departureTime: Timestamp.fromDate(new Date(Date.now() + 3600000)), // 1 hour from now
        seatsAvailable: 3,
        status: "OPEN",
        createdAt: Timestamp.fromDate(new Date()),
    },
    {
        id: "demo-ride-2",
        hostId: "demo-user-2",
        hostName: "Priya Patel",
        type: "REQUEST",
        origin: "Gwalior Junction",
        destination: "Amity Gwalior Campus",
        departureTime: Timestamp.fromDate(new Date(Date.now() + 7200000)), // 2 hours from now
        seatsAvailable: 1,
        status: "OPEN",
        createdAt: Timestamp.fromDate(new Date()),
    },
    {
        id: "demo-ride-3",
        hostId: "demo-user-3",
        hostName: "Amit Kumar",
        type: "OFFER",
        origin: "Amity Gwalior Campus",
        destination: "Gwalior Airport",
        departureTime: Timestamp.fromDate(new Date(Date.now() + 14400000)), // 4 hours from now
        seatsAvailable: 2,
        status: "OPEN",
        createdAt: Timestamp.fromDate(new Date()),
    },
    {
        id: "demo-ride-4",
        hostId: "demo-user-4",
        hostName: "Sneha Desai",
        type: "OFFER",
        origin: "City Center Gwalior",
        destination: "Amity Gwalior Campus",
        departureTime: Timestamp.fromDate(new Date(Date.now() + 18000000)), // 5 hours from now
        seatsAvailable: 4,
        status: "OPEN",
        createdAt: Timestamp.fromDate(new Date()),
    },
    {
        id: "demo-ride-5",
        hostId: "demo-user-5",
        hostName: "Vikram Singh",
        type: "REQUEST",
        origin: "Amity Gwalior Campus",
        destination: "Gwalior Fort",
        departureTime: Timestamp.fromDate(new Date(Date.now() + 21600000)), // 6 hours from now
        seatsAvailable: 2,
        status: "OPEN",
        createdAt: Timestamp.fromDate(new Date()),
    },
];

export default function RideBoardPage() {
    const [rides, setRides] = useState<Ride[]>(SAMPLE_RIDES); // Start with sample data
    const [loading, setLoading] = useState(false); // No loading since we have sample data
    const [filter, setFilter] = useState<'ALL' | 'OFFER' | 'REQUEST'>('ALL');

    useEffect(() => {
        // Simplified query - filter and sort client-side to avoid index
        const ridesRef = collection(db, "rides");
        const q = query(ridesRef);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const ridesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Ride[];

            // Filter OPEN and sort by departureTime client-side
            const openRides = ridesData
                .filter(ride => ride.status === "OPEN")
                .sort((a, b) => {
                    const aTime = typeof a.departureTime === 'string'
                        ? new Date(a.departureTime).getTime()
                        : (a.departureTime as any)?.toDate?.()?.getTime() || 0;
                    const bTime = typeof b.departureTime === 'string'
                        ? new Date(b.departureTime).getTime()
                        : (b.departureTime as any)?.toDate?.()?.getTime() || 0;
                    return aTime - bTime;
                });

            // If we have real data, use it; otherwise keep sample data
            if (openRides.length > 0) {
                setRides(openRides);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching rides:", error);
            // Keep sample data on error
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const filteredRides = rides.filter(ride =>
        filter === 'ALL' ? true : ride.type === filter
    );

    const offerCount = rides.filter(r => r.type === 'OFFER').length;
    const requestCount = rides.filter(r => r.type === 'REQUEST').length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Ride Board</h1>
                    <p className="text-muted-foreground">Find a ride or offer one to your peers.</p>
                </div>
                <Link href="/rides/create">
                    <Button className="gap-2">
                        <Plus size={16} /> Post a Ride
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/20">
                            <Car className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{offerCount}</p>
                            <p className="text-sm text-muted-foreground">Rides Offered</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                            <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{requestCount}</p>
                            <p className="text-sm text-muted-foreground">Rides Requested</p>
                        </div>
                    </div>
                </div>
            </div>

            <Tabs defaultValue="ALL" onValueChange={(val) => setFilter(val as any)}>
                <TabsList>
                    <TabsTrigger value="ALL">All Rides</TabsTrigger>
                    <TabsTrigger value="OFFER">Offering</TabsTrigger>
                    <TabsTrigger value="REQUEST">Requesting</TabsTrigger>
                </TabsList>

                <TabsContent value="ALL" className="mt-6">
                    <RideGrid rides={filteredRides} loading={loading} />
                </TabsContent>
                <TabsContent value="OFFER" className="mt-6">
                    <RideGrid rides={filteredRides} loading={loading} />
                </TabsContent>
                <TabsContent value="REQUEST" className="mt-6">
                    <RideGrid rides={filteredRides} loading={loading} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function RideGrid({ rides, loading }: { rides: Ride[], loading: boolean }) {
    if (loading) {
        return (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-3">
                        <Skeleton className="h-[150px] w-full rounded-xl" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (rides.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Car className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-bold">No rides available</h3>
                <p className="text-muted-foreground mt-2 max-w-md">
                    Be the first to post a ride or request one!
                </p>
                <Link href="/rides/create" className="mt-4">
                    <Button>Post a Ride</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rides.map(ride => (
                <RideCard key={ride.id} ride={ride} />
            ))}
        </div>
    );
}
