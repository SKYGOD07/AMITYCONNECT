"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { doc, getDoc, collection, query, where, getDocs, addDoc, deleteDoc, serverTimestamp, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    User, Mail, Phone, GraduationCap, Building, Calendar,
    Car, Package, Shield, CheckCircle, UserPlus, UserMinus,
    MessageCircle, ArrowLeft, Loader2, Send, X, Edit2, Save,
    AlertTriangle, Lock, Eye, EyeOff, Users, Github, Linkedin,
    Instagram, Globe, ExternalLink, Code2
} from "lucide-react";
import Link from "next/link";
import { UserProfile } from "@/types";
import { format } from "date-fns";
import ProfileBadges from "@/components/profile/ProfileBadges";
import { toast } from "sonner";

// Social link icons and labels
const SOCIAL_PLATFORMS = [
    { key: 'github', label: 'GitHub', icon: Github, placeholder: 'https://github.com/username', color: 'hover:text-gray-900 dark:hover:text-white' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/in/username', color: 'hover:text-blue-600' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/username', color: 'hover:text-pink-500' },
    { key: 'twitter', label: 'Twitter/X', icon: Globe, placeholder: 'https://twitter.com/username', color: 'hover:text-sky-500' },
    { key: 'leetcode', label: 'LeetCode', icon: Code2, placeholder: 'https://leetcode.com/username', color: 'hover:text-amber-500' },
    { key: 'portfolio', label: 'Portfolio', icon: Globe, placeholder: 'https://yoursite.com', color: 'hover:text-purple-500' },
] as const;

export default function ProfilePage() {
    const params = useParams();
    const userId = params.userId as string;
    const router = useRouter();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [currentUserProfile, setCurrentUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [message, setMessage] = useState("");
    const [sendingMessage, setSendingMessage] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedBio, setEditedBio] = useState("");
    const [editedDepartment, setEditedDepartment] = useState("");
    const [editedYear, setEditedYear] = useState("");
    const [editedEmergencyPhone, setEditedEmergencyPhone] = useState("");
    const [editedSocialLinks, setEditedSocialLinks] = useState<Record<string, string>>({});

    const isOwnProfile = currentUser?.uid === userId;
    const isFacultyViewing = currentUserProfile?.role === 'faculty' || currentUserProfile?.role === 'admin';

    // Fetch current user profile
    useEffect(() => {
        if (currentUser) {
            const fetchCurrentUserProfile = async () => {
                try {
                    const docRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(docRef);
                    if (docSnap.exists()) {
                        setCurrentUserProfile(docSnap.data() as UserProfile);
                    }
                } catch (error) {
                    console.error("Error fetching current user profile:", error);
                }
            };
            fetchCurrentUserProfile();
        }
    }, [currentUser]);

    // Fetch user profile
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, "users", userId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data() as UserProfile;
                    setProfile(data);
                    setEditedBio(data.bio || "");
                    setEditedDepartment(data.department || "");
                    setEditedYear(data.year || "");
                    setEditedEmergencyPhone(data.emergencyPhone || "");
                    setEditedSocialLinks(data.socialLinks || {});
                } else {
                    setProfile(null);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchProfile();
        }
    }, [userId]);

    // Check if current user is following this profile
    useEffect(() => {
        const checkFollowing = async () => {
            if (!currentUser || !userId || isOwnProfile) return;

            try {
                const followQuery = query(
                    collection(db, "follows"),
                    where("followerId", "==", currentUser.uid),
                    where("followingId", "==", userId)
                );
                const snapshot = await getDocs(followQuery);
                setIsFollowing(!snapshot.empty);
            } catch (error) {
                console.error("Error checking follow status:", error);
            }
        };

        checkFollowing();
    }, [currentUser, userId, isOwnProfile]);

    const handleFollow = async () => {
        if (!currentUser || !userId) return;
        setFollowLoading(true);

        try {
            if (isFollowing) {
                const followQuery = query(
                    collection(db, "follows"),
                    where("followerId", "==", currentUser.uid),
                    where("followingId", "==", userId)
                );
                const snapshot = await getDocs(followQuery);
                snapshot.forEach(async (doc) => {
                    await deleteDoc(doc.ref);
                });

                await updateDoc(doc(db, "users", userId), {
                    followersCount: increment(-1)
                });
                await updateDoc(doc(db, "users", currentUser.uid), {
                    followingCount: increment(-1)
                });

                setIsFollowing(false);
                if (profile) {
                    setProfile({
                        ...profile,
                        followersCount: (profile.followersCount || 1) - 1
                    });
                }
            } else {
                await addDoc(collection(db, "follows"), {
                    followerId: currentUser.uid,
                    followingId: userId,
                    createdAt: serverTimestamp()
                });

                await updateDoc(doc(db, "users", userId), {
                    followersCount: increment(1)
                });
                await updateDoc(doc(db, "users", currentUser.uid), {
                    followingCount: increment(1)
                });

                setIsFollowing(true);
                if (profile) {
                    setProfile({
                        ...profile,
                        followersCount: (profile.followersCount || 0) + 1
                    });
                }
            }
        } catch (error) {
            console.error("Error following/unfollowing:", error);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (!currentUser || !userId || !message.trim()) return;
        setSendingMessage(true);

        try {
            await addDoc(collection(db, "messages"), {
                senderId: currentUser.uid,
                senderName: currentUser.displayName,
                receiverId: userId,
                receiverName: profile?.displayName,
                content: message.trim(),
                read: false,
                createdAt: serverTimestamp()
            });

            setMessage("");
            setShowMessageModal(false);
            toast.success("Message sent successfully!");
        } catch (error) {
            console.error("Error sending message:", error);
            toast.error("Failed to send message");
        } finally {
            setSendingMessage(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUser || !isOwnProfile) return;

        try {
            // Filter out empty social links
            const cleanedSocialLinks = Object.fromEntries(
                Object.entries(editedSocialLinks).filter(([_, v]) => v && v.trim())
            );

            await updateDoc(doc(db, "users", currentUser.uid), {
                bio: editedBio,
                department: editedDepartment,
                year: editedYear,
                emergencyPhone: editedEmergencyPhone,
                socialLinks: cleanedSocialLinks
            });

            setProfile(prev => prev ? {
                ...prev,
                bio: editedBio,
                department: editedDepartment,
                year: editedYear,
                emergencyPhone: editedEmergencyPhone,
                socialLinks: cleanedSocialLinks
            } : null);
            setIsEditing(false);
        } catch (error) {
            console.error("Error saving profile:", error);
        }
    };

    const updateSocialLink = (key: string, value: string) => {
        setEditedSocialLinks(prev => ({ ...prev, [key]: value }));
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="text-center py-20">
                <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
                <p className="text-muted-foreground mb-6">This profile doesn&apos;t exist or has been removed.</p>
                <Button onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                </Button>
            </div>
        );
    }

    const getRoleBadge = () => {
        switch (profile.role) {
            case 'admin':
                return (
                    <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/30">
                        <Shield className="h-3 w-3 mr-1" />
                        Administrator
                    </Badge>
                );
            case 'faculty':
                return (
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">
                        <Building className="h-3 w-3 mr-1" />
                        Faculty
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/30">
                        <GraduationCap className="h-3 w-3 mr-1" />
                        Student
                    </Badge>
                );
        }
    };

    const hasSocialLinks = profile.socialLinks && Object.values(profile.socialLinks).some(v => v && v.trim());

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Button */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
                <Link href="/people">
                    <Button variant="outline" size="sm" className="gap-2">
                        <Users className="h-4 w-4" />
                        Browse People
                    </Button>
                </Link>
            </div>

            {/* Profile Header */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <Avatar className="h-32 w-32 border-4 border-primary/20">
                                <AvatarImage src={profile.photoURL} />
                                <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                                    {profile.displayName?.charAt(0) || "?"}
                                </AvatarFallback>
                            </Avatar>
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                                        {profile.verified && (
                                            <CheckCircle className="h-5 w-5 text-blue-500" />
                                        )}
                                        {(() => {
                                            const lastActive = profile.lastActive;
                                            if (!lastActive) return null;

                                            // Safe conversion helper since Timestamp object structure can vary
                                            const getDate = (ts: any) => {
                                                if (ts instanceof Date) return ts;
                                                if (typeof ts === 'string') return new Date(ts);
                                                if (ts && typeof ts.toDate === 'function') return ts.toDate();
                                                return new Date(); // Fallback
                                            };

                                            const lastActiveDate = getDate(lastActive);
                                            const now = new Date();
                                            const diff = now.getTime() - lastActiveDate.getTime();
                                            const isOnline = diff < 5 * 60 * 1000; // 5 minutes

                                            if (isOnline) {
                                                return (
                                                    <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-600 gap-1.5">
                                                        <span className="relative flex h-2 w-2">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                                        </span>
                                                        Online
                                                    </Badge>
                                                );
                                            } else {
                                                // Format logic: "Active 2h ago" or just don't show anything?
                                                // Let's show "Last seen" if within 24h
                                                const diffHours = diff / (1000 * 60 * 60);
                                                if (diffHours < 24) {
                                                    return (
                                                        <Badge variant="secondary" className="text-muted-foreground font-normal">
                                                            Active {diffHours < 1 ? 'recently' : `${Math.floor(diffHours)}h ago`}
                                                        </Badge>
                                                    );
                                                }
                                                return null;
                                            }
                                        })()}
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        {getRoleBadge()}
                                        {profile.department && (
                                            <Badge variant="outline">{profile.department}</Badge>
                                        )}
                                        {profile.year && (
                                            <Badge variant="outline">{profile.year}</Badge>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {!isOwnProfile && currentUser && (
                                    <div className="flex gap-2">
                                        <Button
                                            variant={isFollowing ? "outline" : "default"}
                                            onClick={handleFollow}
                                            disabled={followLoading}
                                            className="gap-2"
                                        >
                                            {followLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : isFollowing ? (
                                                <><UserMinus className="h-4 w-4" /> Unfollow</>
                                            ) : (
                                                <><UserPlus className="h-4 w-4" /> Follow</>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => setShowMessageModal(true)}
                                            className="gap-2"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Message
                                        </Button>
                                    </div>
                                )}

                                {isOwnProfile && (
                                    <Button
                                        variant="outline"
                                        onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                                        className="gap-2"
                                    >
                                        {isEditing ? (
                                            <><Save className="h-4 w-4" /> Save</>
                                        ) : (
                                            <><Edit2 className="h-4 w-4" /> Edit Profile</>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Bio */}
                            {isEditing ? (
                                <Textarea
                                    placeholder="Write something about yourself..."
                                    value={editedBio}
                                    onChange={(e) => setEditedBio(e.target.value)}
                                    className="resize-none"
                                    rows={3}
                                />
                            ) : (
                                <p className="text-muted-foreground">
                                    {profile.bio || "No bio yet."}
                                </p>
                            )}

                            {/* Edit Fields */}
                            {isEditing && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Department"
                                        value={editedDepartment}
                                        onChange={(e) => setEditedDepartment(e.target.value)}
                                    />
                                    <Input
                                        placeholder="Year (e.g., 2nd Year BTech)"
                                        value={editedYear}
                                        onChange={(e) => setEditedYear(e.target.value)}
                                    />
                                </div>
                            )}

                            {/* Social Links Display (when not editing) */}
                            {!isEditing && hasSocialLinks && (
                                <div className="flex gap-3 pt-2">
                                    {SOCIAL_PLATFORMS.map(({ key, icon: Icon, color }) => {
                                        const url = profile.socialLinks?.[key as keyof typeof profile.socialLinks];
                                        if (!url) return null;
                                        return (
                                            <a
                                                key={key}
                                                href={url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-2 rounded-lg bg-muted transition-colors ${color}`}
                                                title={key.charAt(0).toUpperCase() + key.slice(1)}
                                            >
                                                <Icon className="h-5 w-5" />
                                            </a>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Stats */}
                            <div className="flex gap-6 pt-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{profile.followersCount || 0}</p>
                                    <p className="text-sm text-muted-foreground">Followers</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{profile.followingCount || 0}</p>
                                    <p className="text-sm text-muted-foreground">Following</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{profile.ridesShared || 0}</p>
                                    <p className="text-sm text-muted-foreground">Rides</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold">{profile.errandsCompleted || 0}</p>
                                    <p className="text-sm text-muted-foreground">Errands</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Social Links Edit Section */}
            {isEditing && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Social Links
                        </CardTitle>
                        <CardDescription>
                            Add your social profiles to connect with others
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-4">
                            {SOCIAL_PLATFORMS.map(({ key, label, icon: Icon, placeholder }) => (
                                <div key={key} className="space-y-1">
                                    <label className="text-sm font-medium flex items-center gap-2">
                                        <Icon className="h-4 w-4" />
                                        {label}
                                    </label>
                                    <Input
                                        placeholder={placeholder}
                                        value={editedSocialLinks[key] || ""}
                                        onChange={(e) => updateSocialLink(key, e.target.value)}
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Contact Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        <span>{profile.email}</span>
                    </div>
                    {profile.phone && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{profile.phone}</span>
                        </div>
                    )}
                    {profile.createdAt && (
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {typeof profile.createdAt === 'object' && 'toDate' in profile.createdAt
                                ? format(profile.createdAt.toDate(), "MMMM yyyy")
                                : "Recently"
                            }</span>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Emergency Contact - Only visible to faculty or on own profile */}
            {profile.role === 'student' && (isOwnProfile || isFacultyViewing) && (
                <Card className="border-red-500/30">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2 text-red-500">
                            <AlertTriangle className="h-5 w-5" />
                            Emergency Contact
                        </CardTitle>
                        <CardDescription>
                            {isOwnProfile ? (
                                "Add an emergency contact number. This will only be visible to faculty/admin in case of emergencies."
                            ) : (
                                <span className="flex items-center gap-1">
                                    <Shield className="h-3 w-3" />
                                    Visible to faculty only for emergency situations
                                </span>
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isEditing && isOwnProfile ? (
                            <div className="space-y-3">
                                <div className="flex items-start gap-2 text-xs text-amber-600 bg-amber-500/10 p-3 rounded-lg">
                                    <Lock className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">Privacy Notice</p>
                                        <p>This number will only be visible to verified faculty and administrators for emergency situations.</p>
                                    </div>
                                </div>
                                <Input
                                    placeholder="Emergency phone number (e.g., parent/guardian)"
                                    value={editedEmergencyPhone}
                                    onChange={(e) => setEditedEmergencyPhone(e.target.value)}
                                    type="tel"
                                />
                            </div>
                        ) : profile.emergencyPhone ? (
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 text-red-500" />
                                <span className="font-medium">{profile.emergencyPhone}</span>
                                {isFacultyViewing && !isOwnProfile && (
                                    <Badge variant="outline" className="text-xs">
                                        <Eye className="h-3 w-3 mr-1" />
                                        Faculty Access
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <EyeOff className="h-4 w-4" />
                                <span>No emergency contact added</span>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Badges & Activity Stats */}
            <ProfileBadges profile={profile} />

            {/* Message Modal */}
            {showMessageModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Send Message</CardTitle>
                                <Button variant="ghost" size="icon" onClick={() => setShowMessageModal(false)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <CardDescription>
                                Send a message to {profile.displayName}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Textarea
                                placeholder="Type your message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                            />
                            <Button
                                className="w-full gap-2"
                                onClick={handleSendMessage}
                                disabled={!message.trim() || sendingMessage}
                            >
                                {sendingMessage ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                Send Message
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
