"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Errand } from "@/types";
import { trackActivity } from "@/lib/activityTracker";
import ErrandCard from "@/components/errands/ErrandCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ShoppingBag, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";

// Helper to create a mock Timestamp for demo data
const createMockTimestamp = (date: Date): Timestamp => {
    return Timestamp.fromDate(date);
};

// Hardcoded sample errands for demo
const SAMPLE_ERRANDS: Errand[] = [
    {
        id: "demo-errand-1",
        requesterId: "demo-user-1",
        requesterName: "Aisha Khan",
        title: "Coffee from Canteen",
        description: "Please get me a cold coffee from the main canteen. I'm stuck in a lab session and can't leave!",
        location: "Physics Lab, Amity Block B",
        reward: "₹50 + keep the change",
        status: "OPEN",
        createdAt: createMockTimestamp(new Date(Date.now() - 600000)), // 10 mins ago
    },
    {
        id: "demo-errand-2",
        requesterId: "demo-user-2",
        requesterName: "Rohan Mehta",
        title: "Print Notes",
        description: "Need someone to print 20 pages of notes from the printing shop near the gate. File will be shared on WhatsApp.",
        location: "Boys Hostel H1",
        reward: "₹30",
        status: "OPEN",
        createdAt: createMockTimestamp(new Date(Date.now() - 1800000)), // 30 mins ago
    },
    {
        id: "demo-errand-3",
        requesterId: "demo-user-3",
        requesterName: "Kavya Nair",
        title: "Medicine from Pharmacy",
        description: "Urgent! Need Crocin tablets from the pharmacy near City Center. Will share Google Pay payment.",
        location: "Girls Hostel G1",
        reward: "₹100",
        status: "OPEN",
        createdAt: createMockTimestamp(new Date(Date.now() - 3600000)), // 1 hour ago
    },
    {
        id: "demo-errand-4",
        requesterId: "demo-user-4",
        requesterName: "Dev Sharma",
        title: "Library Book Return",
        description: "Can someone return 2 books to the library? I have a project deadline and can't make it before closing.",
        location: "Computer Science Block",
        reward: "₹40 + chocolate",
        status: "IN_PROGRESS",
        helperId: "demo-helper-1",
        createdAt: createMockTimestamp(new Date(Date.now() - 7200000)), // 2 hours ago
    },
    {
        id: "demo-errand-5",
        requesterId: "demo-user-5",
        requesterName: "Tanya Gupta",
        title: "Lunch from Mess",
        description: "Feeling under the weather. Can someone bring me lunch from the mess? Room 203.",
        location: "Girls Hostel G2, Room 203",
        reward: "₹60",
        status: "OPEN",
        createdAt: createMockTimestamp(new Date(Date.now() - 900000)), // 15 mins ago
    },
];

export default function ErrandsPage() {
    const { user } = useAuth();
    const [errands, setErrands] = useState<Errand[]>(SAMPLE_ERRANDS); // Start with sample data
    const [loading, setLoading] = useState(false); // No loading since we have sample data

    useEffect(() => {
        // Simplified query without orderBy to avoid composite index
        const q = query(
            collection(db, "errands")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Errand[];

            // Sort client-side by createdAt desc
            data.sort((a, b) => {
                const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });

            // If we have real data, use it; otherwise keep sample data
            if (data.length > 0) {
                setErrands(data);
            }
            setLoading(false);
        }, (error) => {
            console.error("Error fetching errands:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleAccept = async (errandId: string) => {
        if (!user) return alert("Please login to accept errands");

        // For demo data, update locally
        if (errandId.startsWith("demo-")) {
            setErrands(prev => prev.map(e =>
                e.id === errandId ? { ...e, helperId: user.uid, status: "IN_PROGRESS" } : e
            ));
            return;
        }

        try {
            await updateDoc(doc(db, "errands", errandId), {
                helperId: user.uid,
                status: 'IN_PROGRESS'
            });
        } catch (error) {
            console.error("Error accepting errand", error);
        }
    };

    const handleComplete = async (errandId: string) => {
        if (!user) return;

        // For demo data, update locally
        if (errandId.startsWith("demo-")) {
            setErrands(prev => prev.map(e =>
                e.id === errandId ? { ...e, status: "COMPLETED" } : e
            ));
            // Track activity for demo
            await trackActivity(user.uid, 'errand_helped');
            return;
        }

        try {
            await updateDoc(doc(db, "errands", errandId), {
                status: 'COMPLETED'
            });
            // Track errand completion for badges
            await trackActivity(user.uid, 'errand_helped');
        } catch (error) {
            console.error("Error completing errand", error);
        }
    }

    const openErrands = errands.filter(e => e.status === "OPEN").length;
    const inProgressErrands = errands.filter(e => e.status === "IN_PROGRESS").length;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Errand Requests</h1>
                    <p className="text-muted-foreground">Earn rewards by helping others, or post your own requests.</p>
                </div>
                <Link href="/errands/create">
                    <Button className="gap-2 bg-green-600 hover:bg-green-700">
                        <Plus size={16} /> Request Errand
                    </Button>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/20">
                            <ShoppingBag className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{openErrands}</p>
                            <p className="text-sm text-muted-foreground">Open Requests</p>
                        </div>
                    </div>
                </div>
                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-orange-500/20">
                            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{inProgressErrands}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-[200px] w-full rounded-xl" />
                    ))
                ) : (
                    errands.map(errand => (
                        <ErrandCard
                            key={errand.id}
                            errand={errand}
                            onAccept={handleAccept}
                            onComplete={handleComplete}
                        />
                    ))
                )}
                {!loading && errands.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-bold">No open errands</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Be the first to request help!
                        </p>
                        <Link href="/errands/create" className="mt-4">
                            <Button className="bg-green-600 hover:bg-green-700">Request Errand</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
