"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, GraduationCap, UserCog, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { UserRole } from "@/types";

// Faculty email domains that are auto-verified
const FACULTY_EMAIL_PATTERNS = [
    /@iitgoa\.ac\.in$/i,
    /@faculty\.iitgoa\.ac\.in$/i,
    /@admin\.iitgoa\.ac\.in$/i,
];

// Check if email qualifies for faculty role
function isFacultyEmail(email: string): boolean {
    return FACULTY_EMAIL_PATTERNS.some(pattern => pattern.test(email));
}

export default function SignupPage() {
    const searchParams = useSearchParams();
    const roleParam = searchParams.get("role") as UserRole | null;

    const [role, setRole] = useState<UserRole>(roleParam || "student");
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [warning, setWarning] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (roleParam) {
            setRole(roleParam);
        }
    }, [roleParam]);

    // Validate email when role or email changes
    useEffect(() => {
        if (role === 'faculty' && email && !isFacultyEmail(email)) {
            setWarning("Faculty accounts require an official @iitgoa.ac.in email. You may need admin verification.");
        } else {
            setWarning("");
        }
    }, [role, email]);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // Determine verified status
        const isVerifiedFaculty = role === 'faculty' && isFacultyEmail(email);

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await updateProfile(user, {
                displayName: fullName,
            });

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: fullName,
                photoURL: user.photoURL || "",
                role: role,
                verified: isVerifiedFaculty, // Auto-verify faculty with official email
                followersCount: 0,
                followingCount: 0,
                ridesShared: 0,
                errandsCompleted: 0,
                createdAt: serverTimestamp(),
            });

            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to sign up");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError("");
        try {
            const provider = new GoogleAuthProvider();
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if Google email qualifies for faculty
            const isVerifiedFaculty = role === 'faculty' && user.email && isFacultyEmail(user.email);

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                email: user.email,
                displayName: user.displayName || "",
                photoURL: user.photoURL || "",
                role: role,
                verified: isVerifiedFaculty,
                followersCount: 0,
                followingCount: 0,
                ridesShared: 0,
                errandsCompleted: 0,
                createdAt: serverTimestamp(),
            }, { merge: true });

            router.push("/");
        } catch (err: any) {
            setError(err.message || "Google sign-up failed");
        } finally {
            setLoading(false);
        }
    };

    const roleConfig = {
        student: {
            icon: GraduationCap,
            title: "Student Account",
            description: "Join as a student to share rides, request errands, and stay connected",
            color: "blue"
        },
        faculty: {
            icon: UserCog,
            title: "Faculty/Admin Account",
            description: "Join as faculty to manage and oversee community activities",
            color: "purple"
        },
        admin: {
            icon: Shield,
            title: "Admin Account",
            description: "Full administrative access to manage the platform",
            color: "purple"
        }
    };

    const currentRole = roleConfig[role] || roleConfig.student;
    const RoleIcon = currentRole.icon;

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
            <Card className="w-full max-w-md border-2">
                <CardHeader className="text-center">
                    {/* Role indicator */}
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-${currentRole.color}-500/10 flex items-center justify-center`}>
                        <RoleIcon className={`h-8 w-8 text-${currentRole.color}-500`} />
                    </div>
                    <CardTitle className="text-2xl">{currentRole.title}</CardTitle>
                    <CardDescription>
                        {currentRole.description}
                    </CardDescription>

                    {/* Role switcher */}
                    <div className="flex justify-center gap-2 mt-4">
                        <Button
                            variant={role === "student" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRole("student")}
                            className="gap-1"
                        >
                            <GraduationCap size={14} />
                            Student
                        </Button>
                        <Button
                            variant={role === "faculty" ? "default" : "outline"}
                            size="sm"
                            onClick={() => setRole("faculty")}
                            className="gap-1"
                        >
                            <UserCog size={14} />
                            Faculty
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Faculty verification notice */}
                    {role === 'faculty' && (
                        <div className="flex items-start gap-2 text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg">
                            <Shield className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <div>
                                <p className="font-medium">Faculty Verification</p>
                                <p className="text-xs mt-1">
                                    Use your @iitgoa.ac.in email for auto-verification.
                                    Other emails require admin approval.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Google Sign-up Button */}
                    <Button
                        variant="outline"
                        className="w-full gap-3 h-12 text-base"
                        onClick={handleGoogleSignup}
                        disabled={loading}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                            <path
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                fill="#EA4335"
                            />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-card px-2 text-muted-foreground">
                                Or continue with email
                            </span>
                        </div>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder="Your Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={role === "faculty" ? "faculty@iitgoa.ac.in" : "student@iitgoa.ac.in"}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>

                        {warning && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-500/10 p-3 rounded-lg">
                                <AlertTriangle size={16} />
                                <span>{warning}</span>
                            </div>
                        )}

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-500/10 p-3 rounded-lg">
                                <AlertCircle size={16} />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating Account..." : `Sign Up as ${role === "faculty" ? "Faculty" : "Student"}`}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col gap-4">
                    <p className="text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Login
                        </Link>
                    </p>
                    <Link href="/landing" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Back to landing page
                    </Link>
                </CardFooter>
            </Card>
        </div>
    );
}
