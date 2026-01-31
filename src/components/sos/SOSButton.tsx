"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addDoc, collection, serverTimestamp, GeoPoint, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { toast } from "sonner";

export default function SOSButton() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SENDING' | 'SENT' | 'ERROR'>('IDLE');
    const [errorMessage, setErrorMessage] = useState("");
    const [activeAlertId, setActiveAlertId] = useState<string | null>(null);

    const handleSOS = () => {
        if (!user) {
            toast.error("You must be logged in to send an SOS.");
            return;
        }

        setLoading(true);
        setStatus('SENDING');

        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            setStatus('ERROR');
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;

                    const docRef = await addDoc(collection(db, "emergency_alerts"), {
                        userId: user.uid,
                        userName: user.displayName || "Anonymous",
                        userPhoto: user.photoURL,
                        location: new GeoPoint(latitude, longitude),
                        active: true,
                        createdAt: serverTimestamp(),
                        reports: 0 // Initialize report count
                    });

                    setActiveAlertId(docRef.id);
                    setStatus('SENT');
                } catch (error: any) {
                    console.error("Error sending SOS:", error);
                    setErrorMessage(error.message || "Failed to send alert.");
                    setStatus('ERROR');
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                setErrorMessage("Unable to retrieve your location.");
                setStatus('ERROR');
                setLoading(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleResolve = async () => {
        if (!activeAlertId) return;
        setLoading(true);
        try {
            await updateDoc(doc(db, "emergency_alerts", activeAlertId), {
                active: false,
                resolvedBy: 'SELF',
                resolvedAt: serverTimestamp()
            });
            setStatus('IDLE');
            setActiveAlertId(null);
            toast.success("Alert resolved. Stay safe!");
        } catch (error) {
            console.error("Error resolving alert:", error);
            toast.error("Failed to resolve alert.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur border-t md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto md:p-6 md:bg-red-50 md:border-red-100 md:rounded-xl md:border flex flex-col items-center gap-4 transition-all">
            <div className="text-center space-y-2 hidden md:block">
                <h2 className="text-2xl font-bold text-red-700">Emergency Assistance</h2>
                <p className="text-red-600/80 text-sm">
                    Pressing this button will share your live location with the community.
                </p>
            </div>

            {status === 'SENT' ? (
                <div className="w-full flex flex-col items-center gap-4">
                    <div className="bg-green-100 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">✓</span>
                        <div className="text-left">
                            <p className="font-bold">SOS Active</p>
                            <p className="text-sm">Help is on the way.</p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="lg"
                        className="w-full md:w-48 bg-white border-2 border-green-500 text-green-700 hover:bg-green-50"
                        onClick={handleResolve}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Shield className="h-5 w-5 mr-2" />}
                        I am Safe Now
                    </Button>
                </div>
            ) : (
                <Button
                    variant="destructive"
                    size="lg"
                    className="w-full h-16 md:w-48 md:h-48 rounded-2xl md:rounded-full shadow-lg border-2 md:border-4 border-red-200 text-2xl font-bold transition-all hover:scale-105 active:scale-95 bg-red-600 hover:bg-red-700"
                    onClick={handleSOS}
                    disabled={loading}
                >
                    <div className="flex md:flex-col items-center gap-2 flex-row justify-center">
                        {loading ? (
                            <>
                                <Loader2 className="h-6 w-6 md:h-10 md:w-10 animate-spin" />
                                <span className="text-lg">Locating...</span>
                            </>
                        ) : (
                            <>
                                <AlertTriangle className="h-6 w-6 md:h-12 md:w-12" />
                                <span>SOS</span>
                            </>
                        )}
                    </div>
                </Button>
            )}

            {status === 'ERROR' && (
                <p className="text-red-600 font-medium text-center bg-white px-4 py-2 rounded-lg border border-red-200 shadow-sm text-sm md:text-base">
                    ⚠️ {errorMessage}
                </p>
            )}
        </div>
    );
}
