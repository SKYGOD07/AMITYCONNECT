"use client";

import { UserProfile } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Car, Package, AlertTriangle, Flame, Trophy, Medal,
    Star, Zap, Heart, Shield, Award, Crown, Target, Sparkles
} from "lucide-react";

interface ProfileBadgesProps {
    profile: UserProfile;
}

// Badge definitions
const BADGES = {
    // Ride Badges
    firstRide: {
        id: "first_ride",
        name: "Road Starter",
        description: "Shared your first ride",
        icon: Car,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        requirement: (p: UserProfile) => (p.ridesShared || 0) >= 1
    },
    rideExplorer: {
        id: "ride_explorer",
        name: "Ride Explorer",
        description: "Shared 5 rides",
        icon: Car,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        requirement: (p: UserProfile) => (p.ridesShared || 0) >= 5
    },
    roadMaster: {
        id: "road_master",
        name: "Road Master",
        description: "Shared 20 rides",
        icon: Crown,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        requirement: (p: UserProfile) => (p.ridesShared || 0) >= 20
    },

    // Errand Badges
    helpingHand: {
        id: "helping_hand",
        name: "Helping Hand",
        description: "Completed your first errand",
        icon: Package,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        requirement: (p: UserProfile) => (p.errandsCompleted || 0) >= 1
    },
    errandRunner: {
        id: "errand_runner",
        name: "Errand Runner",
        description: "Completed 5 errands",
        icon: Package,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        requirement: (p: UserProfile) => (p.errandsCompleted || 0) >= 5
    },
    errandHero: {
        id: "errand_hero",
        name: "Errand Hero",
        description: "Completed 15 errands",
        icon: Trophy,
        color: "text-amber-500",
        bgColor: "bg-amber-500/10",
        requirement: (p: UserProfile) => (p.errandsCompleted || 0) >= 15
    },

    // Emergency Response Badges
    firstResponder: {
        id: "first_responder",
        name: "First Responder",
        description: "Responded to an emergency",
        icon: AlertTriangle,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        requirement: (p: UserProfile) => (p.emergencyResponses || 0) >= 1
    },
    guardian: {
        id: "guardian",
        name: "Campus Guardian",
        description: "Responded to 5 emergencies",
        icon: Shield,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        requirement: (p: UserProfile) => (p.emergencyResponses || 0) >= 5
    },
    lifeSaver: {
        id: "life_saver",
        name: "Life Saver",
        description: "Responded to 10 emergencies",
        icon: Heart,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        requirement: (p: UserProfile) => (p.emergencyResponses || 0) >= 10
    },

    // Streak Badges
    weekStreak: {
        id: "week_streak",
        name: "Week Warrior",
        description: "7-day activity streak",
        icon: Flame,
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        requirement: (p: UserProfile) => (p.longestStreak || 0) >= 7
    },
    monthStreak: {
        id: "month_streak",
        name: "Monthly Master",
        description: "30-day activity streak",
        icon: Zap,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        requirement: (p: UserProfile) => (p.longestStreak || 0) >= 30
    },

    // Community Badges
    popular: {
        id: "popular",
        name: "Popular",
        description: "Gained 10 followers",
        icon: Star,
        color: "text-pink-500",
        bgColor: "bg-pink-500/10",
        requirement: (p: UserProfile) => (p.followersCount || 0) >= 10
    },
    influencer: {
        id: "influencer",
        name: "Campus Influencer",
        description: "Gained 50 followers",
        icon: Sparkles,
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        requirement: (p: UserProfile) => (p.followersCount || 0) >= 50
    },

    // All-rounder
    allRounder: {
        id: "all_rounder",
        name: "All-Rounder",
        description: "Active in rides, errands, and emergencies",
        icon: Award,
        color: "text-emerald-500",
        bgColor: "bg-emerald-500/10",
        requirement: (p: UserProfile) =>
            (p.ridesShared || 0) >= 3 &&
            (p.errandsCompleted || 0) >= 3 &&
            (p.emergencyResponses || 0) >= 1
    },
};

export default function ProfileBadges({ profile }: ProfileBadgesProps) {
    const earnedBadges = Object.values(BADGES).filter(badge => badge.requirement(profile));
    const lockedBadges = Object.values(BADGES).filter(badge => !badge.requirement(profile));

    // Calculate stats
    const totalActivities =
        (profile.ridesShared || 0) +
        (profile.ridessTaken || 0) +
        (profile.errandsCompleted || 0) +
        (profile.errandsRequested || 0) +
        (profile.emergencyResponses || 0);

    return (
        <div className="space-y-6">
            {/* Streak & Stats Card */}
            <Card className="border-2 border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-orange-500">
                        <Flame className="h-5 w-5" />
                        Activity Streak
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="text-center p-3 rounded-xl bg-background/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Flame className="h-5 w-5 text-orange-500" />
                                <span className="text-2xl font-bold text-orange-500">
                                    {profile.currentStreak || 0}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Current Streak</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Trophy className="h-5 w-5 text-amber-500" />
                                <span className="text-2xl font-bold text-amber-500">
                                    {profile.longestStreak || 0}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Best Streak</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Target className="h-5 w-5 text-blue-500" />
                                <span className="text-2xl font-bold text-blue-500">
                                    {profile.totalActiveDays || 0}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Active Days</p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-background/50">
                            <div className="flex items-center justify-center gap-1 mb-1">
                                <Zap className="h-5 w-5 text-purple-500" />
                                <span className="text-2xl font-bold text-purple-500">
                                    {totalActivities}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">Total Actions</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Activity Stats</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-500/10">
                            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                                <Car className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profile.ridesShared || 0}</p>
                                <p className="text-xs text-muted-foreground">Rides Shared</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-cyan-500/10">
                            <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                                <Car className="h-5 w-5 text-cyan-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profile.ridessTaken || 0}</p>
                                <p className="text-xs text-muted-foreground">Rides Taken</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/10">
                            <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                                <Package className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profile.errandsCompleted || 0}</p>
                                <p className="text-xs text-muted-foreground">Errands Helped</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-orange-500/10">
                            <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                                <Package className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profile.errandsRequested || 0}</p>
                                <p className="text-xs text-muted-foreground">Requests Made</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10">
                            <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold">{profile.emergencyResponses || 0}</p>
                                <p className="text-xs text-muted-foreground">SOS Responses</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Earned Badges */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-amber-500" />
                        Earned Badges
                        <span className="text-sm font-normal text-muted-foreground">
                            ({earnedBadges.length}/{Object.keys(BADGES).length})
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {earnedBadges.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <Medal className="h-12 w-12 mx-auto mb-3 opacity-30" />
                            <p>No badges earned yet</p>
                            <p className="text-sm mt-1">Start sharing rides, helping with errands, and responding to emergencies!</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {earnedBadges.map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className={`p-4 rounded-xl ${badge.bgColor} border border-${badge.color.replace('text-', '')}/20 text-center group hover:scale-105 transition-transform`}
                                        title={badge.description}
                                    >
                                        <div className={`w-12 h-12 mx-auto rounded-full ${badge.bgColor} flex items-center justify-center mb-2`}>
                                            <Icon className={`h-6 w-6 ${badge.color}`} />
                                        </div>
                                        <p className="font-semibold text-sm">{badge.name}</p>
                                        <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Locked Badges (Preview) */}
            {lockedBadges.length > 0 && (
                <Card className="opacity-75">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg text-muted-foreground">
                            Badges to Unlock ({lockedBadges.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                            {lockedBadges.slice(0, 6).map((badge) => {
                                const Icon = badge.icon;
                                return (
                                    <div
                                        key={badge.id}
                                        className="p-3 rounded-xl bg-muted/50 text-center opacity-50"
                                        title={`${badge.name}: ${badge.description}`}
                                    >
                                        <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-1">
                                            <Icon className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <p className="text-xs text-muted-foreground truncate">{badge.name}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
