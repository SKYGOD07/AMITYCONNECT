import { doc, updateDoc, increment, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Activity types that can be tracked
export type ActivityType =
    | 'ride_shared'    // Posted a ride offer
    | 'ride_taken'     // Joined someone's ride
    | 'errand_posted'  // Posted an errand request
    | 'errand_helped'  // Helped with someone's errand
    | 'emergency_response'; // Responded to an SOS

// Map activity types to their corresponding profile fields
const ACTIVITY_FIELD_MAP: Record<ActivityType, string> = {
    'ride_shared': 'ridesShared',
    'ride_taken': 'ridessTaken',
    'errand_posted': 'errandsRequested',
    'errand_helped': 'errandsCompleted',
    'emergency_response': 'emergencyResponses'
};

/**
 * Track a user activity and update their stats
 * Also updates streak information
 */
export async function trackActivity(userId: string, activityType: ActivityType): Promise<void> {
    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            console.error("User not found for tracking:", userId);
            return;
        }

        const userData = userDoc.data();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const lastActiveDate = userData.lastActiveDate || '';

        // Calculate streak updates
        const streakUpdates = calculateStreakUpdate(today, lastActiveDate, userData.currentStreak || 0, userData.longestStreak || 0);

        // Build the update object
        const updates: Record<string, any> = {
            [ACTIVITY_FIELD_MAP[activityType]]: increment(1),
            lastActiveDate: today,
            ...streakUpdates
        };

        await updateDoc(userRef, updates);
        console.log(`Tracked ${activityType} for user ${userId}`);
    } catch (error) {
        console.error("Error tracking activity:", error);
    }
}

/**
 * Calculate streak updates based on the last active date
 */
function calculateStreakUpdate(
    today: string,
    lastActiveDate: string,
    currentStreak: number,
    longestStreak: number
): Record<string, any> {
    const updates: Record<string, any> = {};

    if (!lastActiveDate) {
        // First activity ever
        updates.currentStreak = 1;
        updates.longestStreak = 1;
        updates.totalActiveDays = increment(1);
        return updates;
    }

    const todayDate = new Date(today);
    const lastDate = new Date(lastActiveDate);
    const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Same day - no streak change needed, but don't increment days
        return updates;
    } else if (diffDays === 1) {
        // Consecutive day - extend streak
        const newStreak = currentStreak + 1;
        updates.currentStreak = newStreak;
        updates.totalActiveDays = increment(1);

        if (newStreak > longestStreak) {
            updates.longestStreak = newStreak;
        }
    } else {
        // Gap in activity - reset streak
        updates.currentStreak = 1;
        updates.totalActiveDays = increment(1);
    }

    return updates;
}

/**
 * Batch track multiple activities at once
 */
export async function trackMultipleActivities(
    userId: string,
    activities: ActivityType[]
): Promise<void> {
    for (const activity of activities) {
        await trackActivity(userId, activity);
    }
}

/**
 * Get achievement progress for a user
 */
export function getAchievementProgress(profile: any): {
    totalBadges: number;
    earnedBadges: number;
    nextBadge: string | null;
    nextBadgeProgress: number;
} {
    const stats = {
        ridesShared: profile.ridesShared || 0,
        ridessTaken: profile.ridessTaken || 0,
        errandsCompleted: profile.errandsCompleted || 0,
        errandsRequested: profile.errandsRequested || 0,
        emergencyResponses: profile.emergencyResponses || 0,
        longestStreak: profile.longestStreak || 0,
        followersCount: profile.followersCount || 0
    };

    // Calculate earned badges
    let earned = 0;
    const total = 14; // Total number of badges

    // Ride badges
    if (stats.ridesShared >= 1) earned++;
    if (stats.ridesShared >= 5) earned++;
    if (stats.ridesShared >= 20) earned++;

    // Errand badges
    if (stats.errandsCompleted >= 1) earned++;
    if (stats.errandsCompleted >= 5) earned++;
    if (stats.errandsCompleted >= 15) earned++;

    // Emergency badges
    if (stats.emergencyResponses >= 1) earned++;
    if (stats.emergencyResponses >= 5) earned++;
    if (stats.emergencyResponses >= 10) earned++;

    // Streak badges
    if (stats.longestStreak >= 7) earned++;
    if (stats.longestStreak >= 30) earned++;

    // Community badges
    if (stats.followersCount >= 10) earned++;
    if (stats.followersCount >= 50) earned++;

    // All-rounder
    if (stats.ridesShared >= 3 && stats.errandsCompleted >= 3 && stats.emergencyResponses >= 1) earned++;

    // Find next closest badge
    let nextBadge: string | null = null;
    let nextProgress = 0;

    if (stats.ridesShared < 1) {
        nextBadge = "Road Starter (1 ride)";
        nextProgress = 0;
    } else if (stats.errandsCompleted < 1) {
        nextBadge = "Helping Hand (1 errand)";
        nextProgress = 0;
    } else if (stats.ridesShared < 5) {
        nextBadge = "Ride Explorer (5 rides)";
        nextProgress = (stats.ridesShared / 5) * 100;
    }

    return {
        totalBadges: total,
        earnedBadges: earned,
        nextBadge,
        nextBadgeProgress: Math.round(nextProgress)
    };
}
