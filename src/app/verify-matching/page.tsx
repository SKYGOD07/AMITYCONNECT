'use client';

import { useState } from 'react';
import { Timestamp, addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { findMatchingRides } from '@/lib/matching';

export default function VerifyMatchingPage() {
    const [logs, setLogs] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const addLog = (msg: string) => setLogs(prev => [...prev, msg]);

    const runTest = async () => {
        setLoading(true);
        setLogs([]);
        try {
            addLog("Starting Match Test...");

            // 1. Create a baseline time
            const now = new Date();
            const futureTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h from now
            const targetDestination = "Test Destination " + Math.random().toString(36).substring(7);

            addLog(`Target Destination: ${targetDestination}`);
            addLog(`Target Time: ${futureTime.toISOString()}`);

            // 2. Seed Data
            addLog("Seeding 'Good' Ride (Matches)...");
            const goodRideRef = await addDoc(collection(db, "rides"), {
                hostId: "test-host",
                type: "OFFER",
                origin: "Campus Center",
                destination: targetDestination,
                departureTime: Timestamp.fromDate(futureTime), // Exact match time
                seatsAvailable: 3,
                status: "OPEN",
                createdAt: Timestamp.now()
            });
            addLog(`Created Good Ride: ${goodRideRef.id}`);

            addLog("Seeding 'Bad' Ride (Wrong Destination)...");
            await addDoc(collection(db, "rides"), {
                hostId: "test-host",
                type: "OFFER",
                origin: "Campus Center",
                destination: "Wrong Place",
                departureTime: Timestamp.fromDate(futureTime),
                seatsAvailable: 3,
                status: "OPEN",
                createdAt: Timestamp.now()
            });

            addLog("Seeding 'Bad' Ride (Time too far - 2 hours later)...");
            const lateTime = new Date(futureTime.getTime() + 2 * 60 * 60 * 1000);
            await addDoc(collection(db, "rides"), {
                hostId: "test-host",
                type: "OFFER",
                origin: "Campus Center",
                destination: targetDestination,
                departureTime: Timestamp.fromDate(lateTime),
                seatsAvailable: 3,
                status: "OPEN",
                createdAt: Timestamp.now()
            });

            // 3. Run Matching
            addLog("Running findMatchingRides...");
            const matches = await findMatchingRides({
                destination: targetDestination,
                departureTime: Timestamp.fromDate(futureTime)
            });

            addLog(`Found ${matches.length} matches.`);

            const foundGoodRide = matches.find(r => r.id === goodRideRef.id);
            if (foundGoodRide) {
                addLog("SUCCESS: Found the correct ride!");
            } else {
                addLog("FAILURE: Did not find the correct ride.");
            }

            if (matches.length === 1 && foundGoodRide) {
                addLog("PERFECT: Only found the correct ride.");
            } else if (matches.length > 1) {
                addLog("WARNING: Found more rides than expected.");
            }

        } catch (error: any) {
            addLog(`ERROR: ${error.message}`);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Smart Matching Verification</h1>
            <button
                onClick={runTest}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? "Running..." : "Run Matching Test"}
            </button>

            <div className="mt-6 bg-gray-100 p-4 rounded h-96 overflow-auto font-mono text-sm">
                {logs.map((log, i) => (
                    <div key={i} className="mb-1 border-b border-gray-200 pb-1">
                        {log}
                    </div>
                ))}
            </div>
        </div>
    );
}
