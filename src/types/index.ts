import { Timestamp, GeoPoint } from "firebase/firestore";

export type UserRole = 'student' | 'faculty' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role: UserRole;
    verified?: boolean;          // Faculty verification status
    bio?: string;
    department?: string;
    year?: string;               // For students (e.g., "2nd Year BTech")
    phone?: string;
    emergencyPhone?: string;     // Emergency contact (visible to faculty only)
    socialLinks?: {
        github?: string;
        linkedin?: string;
        instagram?: string;
        twitter?: string;
        leetcode?: string;
        portfolio?: string;
    };
    followersCount?: number;
    followingCount?: number;

    // Activity Stats for Badges
    ridesShared?: number;        // Rides offered
    ridessTaken?: number;        // Rides joined
    errandsCompleted?: number;   // Errands helped with
    errandsRequested?: number;   // Errands posted
    emergencyResponses?: number; // Times responded to SOS

    // Streak Tracking
    currentStreak?: number;      // Current active streak days
    longestStreak?: number;      // Best streak ever
    lastActiveDate?: string;     // Last activity date (YYYY-MM-DD)
    totalActiveDays?: number;    // Total days active

    createdAt?: Timestamp | string;
    lastActive?: Timestamp | string; // For online status
}

export interface Follow {
    id?: string;
    followerId: string;
    followingId: string;
    createdAt: Timestamp;
}

export interface Message {
    id?: string;
    senderId: string;
    senderName?: string;
    receiverId: string;
    receiverName?: string;
    content: string;
    read: boolean;
    createdAt: Timestamp;
}

export interface Conversation {
    id: string;
    participants: string[];
    lastMessage?: string;
    lastMessageAt?: Timestamp;
    unreadCount?: { [userId: string]: number };
}

export interface Ride {
    id: string;
    hostId: string;
    hostName?: string;
    hostPhoto?: string;
    userName?: string;
    type: 'OFFER' | 'REQUEST';
    origin: string | { name: string; latitude?: number; longitude?: number };
    destination: string | { name: string; latitude?: number; longitude?: number };
    originGeo?: GeoPoint;
    destinationGeo?: GeoPoint;
    departureTime: Timestamp | string;
    seatsAvailable?: number;
    availableSeats?: number;
    status: 'OPEN' | 'FILLED' | 'CANCELLED';
    createdAt: Timestamp | string;
}

export interface Errand {
    id: string;
    requesterId: string;
    requesterName?: string;
    requesterPhoto?: string;
    helperId?: string;
    helperName?: string;
    title: string;
    description: string;
    location: string;
    reward?: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED';
    createdAt: Timestamp | string;
}

export interface EmergencyAlert {
    id: string;
    userId: string;
    userName?: string;
    userPhoto?: string;
    userPhone?: string;
    location: GeoPoint;
    locationName?: string;
    message?: string;
    active: boolean;
    respondedBy?: string[];
    reports?: number;
    resolvedAt?: any;
    resolvedBy?: string;
    createdAt: Timestamp;
}
