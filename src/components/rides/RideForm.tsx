"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp, GeoPoint, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

export default function RideForm() {
    const { user } = useAuth();
    const router = useRouter();

    const [type, setType] = useState<'OFFER' | 'REQUEST'>('OFFER');
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [seats, setSeats] = useState(3);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    // GeoPoints
    const [originGeo, setOriginGeo] = useState<[number, number] | null>(null);
    const [destGeo, setDestGeo] = useState<[number, number] | null>(null);

    const [selectingMode, setSelectingMode] = useState<'NONE' | 'ORIGIN' | 'DESTINATION'>('NONE');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleMapClick = (lat: number, lng: number) => {
        if (selectingMode === 'ORIGIN') {
            setOriginGeo([lat, lng]);
            setOrigin(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            setSelectingMode('NONE');
        } else if (selectingMode === 'DESTINATION') {
            setDestGeo([lat, lng]);
            setDestination(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            setSelectingMode('NONE');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setLoading(true);
        setError("");

        try {
            if (!originGeo || !destGeo) {
                throw new Error("Please select both Origin and Destination on the map.");
            }

            const departureDateTime = new Date(`${date}T${time}`);

            await addDoc(collection(db, "rides"), {
                hostId: user.uid,
                hostName: user.displayName || "Anonymous",
                hostPhoto: user.photoURL || "",
                type,
                origin,
                destination,
                originGeo: new GeoPoint(originGeo[0], originGeo[1]),
                destinationGeo: new GeoPoint(destGeo[0], destGeo[1]),
                departureTime: Timestamp.fromDate(departureDateTime),
                seatsAvailable: type === 'OFFER' ? Number(seats) : null,
                status: 'OPEN',
                createdAt: serverTimestamp(),
            });

            router.push("/rides");
        } catch (err: any) {
            setError(err.message || "Failed to create ride");
        } finally {
            setLoading(false);
        }
    };

    const markers = [
        ...(originGeo ? [{ id: 'origin', position: originGeo, title: 'Origin' }] : []),
        ...(destGeo ? [{ id: 'destination', position: destGeo, title: 'Destination' }] : [])
    ];

    return (
        <div className="grid md:grid-cols-2 gap-6">
            <Card>
                <CardContent className="pt-6 space-y-4">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>I want to</Label>
                            <Select value={type} onValueChange={(v: any) => setType(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OFFER">Offer a Ride</SelectItem>
                                    <SelectItem value="REQUEST">Request a Ride</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Origin</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={origin}
                                    onChange={e => setOrigin(e.target.value)}
                                    placeholder="Start location..."
                                    required
                                />
                                <Button
                                    type="button"
                                    variant={selectingMode === 'ORIGIN' ? "destructive" : "outline"}
                                    onClick={() => setSelectingMode(selectingMode === 'ORIGIN' ? 'NONE' : 'ORIGIN')}
                                >
                                    <MapPin size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Destination</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={destination}
                                    onChange={e => setDestination(e.target.value)}
                                    placeholder="End location..."
                                    required
                                />
                                <Button
                                    type="button"
                                    variant={selectingMode === 'DESTINATION' ? "destructive" : "outline"}
                                    onClick={() => setSelectingMode(selectingMode === 'DESTINATION' ? 'NONE' : 'DESTINATION')}
                                >
                                    <MapPin size={18} />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Date</Label>
                                <Input
                                    type="date"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Time</Label>
                                <Input
                                    type="time"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {type === 'OFFER' && (
                            <div className="space-y-2">
                                <Label>Available Seats</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    max={6}
                                    value={seats}
                                    onChange={e => setSeats(Number(e.target.value))}
                                    required
                                />
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="pt-4 pb-20 md:pb-0">
                            <Button
                                type="submit"
                                className="fixed bottom-0 left-0 right-0 w-full rounded-none h-16 text-lg z-50 md:static md:w-full md:h-10 md:rounded-md md:text-sm md:z-auto shadow-top md:shadow-none"
                                disabled={loading}
                            >
                                {loading ? "Posting..." : "Post Ride"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="space-y-2">
                <Label>Select Location on Map</Label>
                <div className={`border-2 rounded-lg overflow-hidden ${selectingMode !== 'NONE' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}>
                    <MapView
                        onLocationSelect={handleMapClick}
                        markers={markers as any}
                    />
                </div>
                {selectingMode !== 'NONE' && (
                    <p className="text-sm text-blue-600 animate-pulse">
                        Tap on the map to set {selectingMode.toLowerCase()}
                    </p>
                )}
            </div>
        </div>
    );
}
