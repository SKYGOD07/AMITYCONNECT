"use client";

import { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot, where, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { EmergencyAlert } from "@/types";
import SOSButton from "@/components/sos/SOSButton";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Clock, Shield, Phone, MapPin, Radio, Users } from "lucide-react";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

const MapView = dynamic(() => import('@/components/map/MapView'), { ssr: false });

// Helper to parse dates
function parseDate(date: any): Date | null {
    if (!date) return null;
    if (typeof date === 'string') return new Date(date);
    if (typeof date.toDate === 'function') return date.toDate();
    if (date instanceof Date) return date;
    return null;
}

export default function EmergencyPage() {
    const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);
    const [viewMode, setViewMode] = useState<'emergency' | 'info'>('emergency');

    useEffect(() => {
        // Simplified query - filter and sort client-side to avoid index
        const q = query(
            collection(db, "emergency_alerts")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as EmergencyAlert[];

            // Filter active and sort client-side
            const activeAlerts = data
                .filter(alert => alert.active)
                .sort((a, b) => {
                    const aTime = (a.createdAt as any)?.toDate?.()?.getTime() || 0;
                    const bTime = (b.createdAt as any)?.toDate?.()?.getTime() || 0;
                    return bTime - aTime;
                });
            setAlerts(activeAlerts);
        }, (error) => {
            console.error("Error fetching alerts:", error);
        });

        return () => unsubscribe();
    }, []);

    const markers = alerts.map(alert => ({
        id: alert.id,
        position: [alert.location.latitude, alert.location.longitude] as [number, number],
        title: `SOS: ${alert.userName || 'Unknown User'}`,
        description: `Active since ${parseDate(alert.createdAt) ? format(parseDate(alert.createdAt)!, 'h:mm a') : 'Just now'}`
    }));

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-red-600 via-red-500 to-orange-500 p-8 text-white">
                <div className="absolute inset-0 bg-[url('/assets/emergency-pattern.svg')] opacity-10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/20 rounded-full blur-2xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-sm font-medium mb-4">
                            <Radio className="h-4 w-4 animate-pulse" />
                            Emergency Services Active
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-2">Emergency SOS</h1>
                        <p className="text-white/80 max-w-md">
                            One tap to share your live location with campus security and nearby helpers.
                        </p>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold">{alerts.length}</div>
                            <div className="text-sm text-white/70">Active Alerts</div>
                        </div>
                        <div className="w-px h-12 bg-white/30" />
                        <div className="text-center">
                            <div className="text-3xl font-bold">24/7</div>
                            <div className="text-sm text-white/70">Support</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center justify-center gap-4 p-4 rounded-2xl bg-muted/50">
                <span className={`text-sm font-medium transition-colors ${viewMode === 'emergency' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    🆘 Emergency Mode
                </span>
                <Switch
                    checked={viewMode === 'info'}
                    onCheckedChange={(checked) => setViewMode(checked ? 'info' : 'emergency')}
                />
                <span className={`text-sm font-medium transition-colors ${viewMode === 'info' ? 'text-foreground' : 'text-muted-foreground'}`}>
                    📋 Safety Info
                </span>
            </div>

            {/* Sliding Content */}
            <div className="relative overflow-hidden">
                <div
                    className="flex transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(${viewMode === 'info' ? '-100%' : '0%'})` }}
                >
                    {/* Emergency Mode Content */}
                    <div className="w-full flex-shrink-0 grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-1 space-y-6">
                            <SOSButton />

                            <Card className="border-2 border-red-200 dark:border-red-900/50">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <AlertTriangle className="text-red-500" />
                                        Live Alerts
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {alerts.length === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                                                <Shield className="h-8 w-8 text-green-500" />
                                            </div>
                                            <p className="font-medium text-green-600">All Clear</p>
                                            <p className="text-sm text-muted-foreground mt-1">No active emergencies</p>
                                        </div>
                                    ) : (
                                        alerts.map(alert => (
                                            <div key={alert.id} className="relative flex items-start gap-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-200 dark:border-red-900/50 animate-pulse-glow group">
                                                <div className="bg-red-500 p-2 rounded-full shadow-sm text-white">
                                                    <AlertTriangle size={16} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold">{alert.userName}</p>
                                                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mt-1">
                                                        <Clock size={12} />
                                                        <span>{parseDate(alert.createdAt) ? format(parseDate(alert.createdAt)!, 'PP p') : 'Just now'}</span>
                                                    </div>
                                                </div>

                                            </div>
                                        ))
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        <div className="lg:col-span-2 h-[500px] lg:h-auto border-2 rounded-2xl overflow-hidden shadow-lg relative">
                            <div className="absolute top-4 right-4 z-[400] bg-background/90 backdrop-blur px-4 py-2 rounded-full shadow-sm text-sm font-medium flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${alerts.length > 0 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
                                {alerts.length} Active
                            </div>
                            <MapView
                                zoom={14}
                                markers={markers}
                                center={
                                    alerts.length > 0
                                        ? [alerts[0].location.latitude, alerts[0].location.longitude]
                                        : [26.2307, 78.1969] // Amity University Madhya Pradesh Gwalior
                                }
                            />
                        </div>
                    </div>

                    {/* Safety Info Content */}
                    <div className="w-full flex-shrink-0 grid md:grid-cols-2 lg:grid-cols-3 gap-6 pl-8">
                        <Card className="card-hover border-2">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-2">
                                    <Phone className="h-6 w-6 text-blue-600" />
                                </div>
                                <CardTitle>Emergency Contacts</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <span className="font-medium">Campus Security</span>
                                    <span className="text-blue-600 font-bold">+91 XXX-XXXX</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <span className="font-medium">Medical Center</span>
                                    <span className="text-blue-600 font-bold">+91 XXX-XXXX</span>
                                </div>
                                <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
                                    <span className="font-medium">Police (Local)</span>
                                    <span className="text-blue-600 font-bold">100</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-hover border-2">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-2">
                                    <MapPin className="h-6 w-6 text-green-600" />
                                </div>
                                <CardTitle>Safe Zones</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                                    <p className="font-medium text-green-700 dark:text-green-400">Main Gate Security</p>
                                    <p className="text-sm text-muted-foreground">24/7 staffed</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                                    <p className="font-medium text-green-700 dark:text-green-400">Academic Block Lobby</p>
                                    <p className="text-sm text-muted-foreground">CCTV monitored</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900/50">
                                    <p className="font-medium text-green-700 dark:text-green-400">Hostel Common Rooms</p>
                                    <p className="text-sm text-muted-foreground">Warden on call</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="card-hover border-2">
                            <CardHeader>
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-2">
                                    <Users className="h-6 w-6 text-purple-600" />
                                </div>
                                <CardTitle>Community Helpers</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 font-bold">12</div>
                                    <div>
                                        <p className="font-medium">Active Volunteers</p>
                                        <p className="text-xs text-muted-foreground">Ready to help nearby</p>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    Verified student volunteers are notified when you trigger an SOS alert.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
