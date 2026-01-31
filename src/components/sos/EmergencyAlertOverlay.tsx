"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    AlertTriangle, Phone, MapPin, X, Navigation, Clock,
    Shield, CheckCircle, Volume2, VolumeX
} from "lucide-react";
import { EmergencyAlert, UserProfile } from "@/types";
import { format } from "date-fns";
import { trackActivity } from "@/lib/activityTracker";
import { toast } from "sonner";

export default function EmergencyAlertOverlay() {
    const { user } = useAuth();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [activeAlerts, setActiveAlerts] = useState<EmergencyAlert[]>([]);
    const [currentAlert, setCurrentAlert] = useState<EmergencyAlert | null>(null);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [responding, setResponding] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Check if user is faculty/admin
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            try {
                const docSnap = await getDoc(doc(db, "users", user.uid));
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data() as UserProfile);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, [user]);

    // Listen for active SOS alerts (faculty/admin only)
    useEffect(() => {
        if (!userProfile || (userProfile.role !== 'faculty' && userProfile.role !== 'admin')) {
            return;
        }

        const alertsQuery = query(
            collection(db, "emergency_alerts")
        );

        const unsubscribe = onSnapshot(alertsQuery, (snapshot) => {
            const alerts: EmergencyAlert[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                if (data.active) {
                    alerts.push({ id: doc.id, ...data } as EmergencyAlert);
                }
            });

            // Sort by most recent first
            alerts.sort((a, b) => {
                const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                return bTime - aTime;
            });

            setActiveAlerts(alerts);

            // Set the most recent non-dismissed alert as current
            const newAlert = alerts.find(a => !dismissed.has(a.id));
            if (newAlert && (!currentAlert || newAlert.id !== currentAlert.id)) {
                setCurrentAlert(newAlert);
                // Play alert sound
                if (soundEnabled && audioRef.current) {
                    audioRef.current.play().catch(() => { });
                }
            }
        }, (error) => {
            console.error("Error listening to alerts:", error);
        });

        return () => unsubscribe();
    }, [userProfile, dismissed, soundEnabled]);

    const handleDismiss = (alertId: string) => {
        setDismissed(prev => new Set([...prev, alertId]));
        if (currentAlert?.id === alertId) {
            const nextAlert = activeAlerts.find(a => a.id !== alertId && !dismissed.has(a.id));
            setCurrentAlert(nextAlert || null);
        }
    };

    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    };

    const handleRespond = async () => {
        if (!currentAlert || !user) return;
        setResponding(true);

        if (!currentAlert.location) {
            // If no location data in alert, just standard verify
            try {
                await updateDoc(doc(db, "emergency_alerts", currentAlert.id), {
                    respondedBy: arrayUnion(user.uid)
                });
                setActiveAlerts(prev => prev.filter(a => a.id !== currentAlert.id));
                setCurrentAlert(null);
            } catch (error) {
                console.error("Error responding:", error);
            } finally {
                setResponding(false);
            }
            return;
        }

        // Verify Location
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            setResponding(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            const alertLat = currentAlert.location.latitude;
            const alertLon = currentAlert.location.longitude;

            const distance = calculateDistance(userLat, userLon, alertLat, alertLon);

            // Threshold: 500 meters
            if (distance <= 500) {
                try {
                    // Mark as resolved/inactive since help arrived
                    await updateDoc(doc(db, "emergency_alerts", currentAlert.id), {
                        active: false,
                        respondedBy: arrayUnion(user.uid),
                        resolvedAt: new Date()
                    });

                    // Track emergency response for badges
                    await trackActivity(user.uid, 'emergency_response');

                    // Prompt to report false alarm
                    setTimeout(async () => {
                        toast("Alert Resolved", {
                            description: "Was this a FALSE SOS (Prank/Accidental)?",
                            action: {
                                label: "Report False Alarm",
                                onClick: async () => {
                                    try {
                                        await updateDoc(doc(db, "emergency_alerts", currentAlert.id), {
                                            isFalseAlarm: true,
                                            reportedBy: user.uid,
                                            reports: 100 // Immediate flag
                                        });
                                        toast.success("Complaint raised against the user.");
                                    } catch (err) {
                                        console.error(err);
                                        toast.error("Failed to report.");
                                    }
                                }
                            },
                            cancel: {
                                label: "Genuine Alert",
                                onClick: () => { }
                            },
                            duration: 8000
                        });
                    }, 500);

                    // Force refresh/remove locally
                    setActiveAlerts(prev => prev.filter(a => a.id !== currentAlert.id));
                    setCurrentAlert(null);
                    toast.success("Verified! You are within 500m. Alert resolved.");
                } catch (error) {
                    console.error("Error resolving alert:", error);
                    toast.error("Failed to resolve alert.");
                }
            } else {
                toast.warning(`You are ${Math.round(distance)} meters away.`, {
                    description: "Please reach within 500m of the location to resolve the alert."
                });
            }
            setResponding(false);
        }, (error) => {
            console.error("Error getting location:", error);
            toast.error("Unable to verify your location. Please enable location services.");
            setResponding(false);
        });
    };

    const openMaps = () => {
        if (!currentAlert?.location) return;
        const { latitude, longitude } = currentAlert.location;
        window.open(`https://www.google.com/maps?q=${latitude},${longitude}`, '_blank');
    };

    // Don't show for non-faculty or if no current alert
    if (!userProfile || (userProfile.role !== 'faculty' && userProfile.role !== 'admin')) {
        return null;
    }

    if (!currentAlert) {
        return null;
    }

    return (
        <>
            {/* Alert Sound */}
            <audio ref={audioRef} src="/sounds/alert.mp3" preload="auto" />

            {/* Full Screen Overlay */}
            <div className="fixed inset-0 z-[100] pointer-events-none">
                {/* Flashing Border */}
                <div className="absolute inset-0 border-[6px] border-red-500 animate-pulse pointer-events-none" />

                {/* Top Alert Banner - Hovering */}
                <div className="absolute top-0 left-0 right-0 pointer-events-auto">
                    <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-600 text-white animate-pulse">
                        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3">
                            <AlertTriangle className="h-5 w-5 animate-bounce" />
                            <span className="font-bold text-lg tracking-wide">
                                🚨 EMERGENCY SOS ALERT - IMMEDIATE ACTION REQUIRED 🚨
                            </span>
                            <AlertTriangle className="h-5 w-5 animate-bounce" />
                        </div>
                    </div>
                </div>

                {/* Alert Card - Bottom Right */}
                <div className="absolute bottom-6 right-6 w-[400px] pointer-events-auto animate-bounce-slow">
                    <div className="bg-background border-4 border-red-500 rounded-2xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-500 text-white p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center animate-pulse">
                                        <AlertTriangle className="h-7 w-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold">Emergency SOS</h3>
                                        <p className="text-sm text-white/80">Student needs help!</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-white hover:bg-white/20 h-8 w-8"
                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                    >
                                        {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-white hover:bg-white/20 h-8 w-8"
                                        onClick={() => handleDismiss(currentAlert.id)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-4 space-y-4">
                            {/* Student Info */}
                            <div className="flex items-center gap-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                                <Avatar className="h-14 w-14 border-2 border-red-500">
                                    <AvatarImage src={currentAlert.userPhoto} />
                                    <AvatarFallback className="bg-red-500/20 text-red-500 text-xl">
                                        {currentAlert.userName?.charAt(0) || "?"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{currentAlert.userName || "Unknown Student"}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        <span>
                                            {(currentAlert.createdAt as any)?.toDate
                                                ? format((currentAlert.createdAt as any).toDate(), "h:mm a")
                                                : "Just now"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Location */}
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                                <MapPin className="h-5 w-5 text-red-500" />
                                <div className="flex-1">
                                    <p className="font-medium">{currentAlert.locationName || "Location shared"}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {currentAlert.location?.latitude?.toFixed(4)}, {currentAlert.location?.longitude?.toFixed(4)}
                                    </p>
                                </div>
                                <Button size="sm" variant="outline" onClick={openMaps} className="gap-1">
                                    <Navigation className="h-3 w-3" />
                                    Map
                                </Button>
                            </div>

                            {/* Emergency Contact */}
                            {currentAlert.userPhone && (
                                <a href={`tel:${currentAlert.userPhone}`} className="block">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition-colors">
                                        <Phone className="h-5 w-5 text-green-500" />
                                        <div className="flex-1">
                                            <p className="font-medium text-green-600">Call Student</p>
                                            <p className="text-sm text-muted-foreground">{currentAlert.userPhone}</p>
                                        </div>
                                    </div>
                                </a>
                            )}

                            {/* Message if any */}
                            {currentAlert.message && (
                                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                    <p className="text-sm italic">"{currentAlert.message}"</p>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={() => handleDismiss(currentAlert.id)}
                                    className="h-12"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    onClick={handleRespond}
                                    disabled={responding}
                                    className="h-12 bg-red-500 hover:bg-red-600 text-white gap-2 font-bold animate-pulse"
                                >
                                    {responding ? (
                                        <Shield className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <CheckCircle className="h-5 w-5" />
                                    )}
                                    RESPOND NOW
                                </Button>
                            </div>

                            {/* Alert Count */}
                            {activeAlerts.length > 1 && (
                                <p className="text-center text-sm text-muted-foreground pt-2">
                                    +{activeAlerts.length - 1} more active alert{activeAlerts.length > 2 ? 's' : ''}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CSS for custom animation */}
            <style jsx global>{`
                @keyframes bounce-slow {
                    0%, 100% {
                        transform: translateY(0);
                    }
                    50% {
                        transform: translateY(-10px);
                    }
                }
                .animate-bounce-slow {
                    animation: bounce-slow 2s ease-in-out infinite;
                }
            `}</style>
        </>
    );
}
