"use client";

import { useAuth } from "@/context/AuthContext";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function UnverifiedFacultyBanner() {
    const { user } = useAuth();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(true); // Default to true to prevent flash
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkVerification = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                // Fetch latest user data from Firestore to check 'verified' status/role
                const userDoc = await getDoc(doc(db, "users", user.uid));
                if (userDoc.exists()) {
                    const data = userDoc.data();
                    if (data.role === 'faculty' && data.verified === false) {
                        setIsVerified(false);
                    } else {
                        setIsVerified(true);
                    }
                }
            } catch (error) {
                console.error("Error checking verification:", error);
            } finally {
                setLoading(false);
            }
        };

        checkVerification();
    }, [user]);

    if (!user || loading || isVerified) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-card border-2 border-amber-200 shadow-xl rounded-xl p-6 text-center space-y-4">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
                    <Lock className="h-8 w-8 text-amber-600" />
                </div>

                <h2 className="text-2xl font-bold">Verification Pending</h2>

                <div className="space-y-2 text-muted-foreground">
                    <p>
                        Your faculty account is currently under review.
                    </p>
                    <p className="text-sm bg-amber-50 p-3 rounded-lg border border-amber-100 text-amber-800">
                        <AlertTriangle className="h-4 w-4 inline mr-2 text-amber-600" />
                        Because you didn't use an official <strong>@iitgoa.ac.in</strong> email,
                        an administrator must manually approve your request.
                    </p>
                </div>

                <div className="pt-4 flex flex-col gap-2">
                    <Button
                        onClick={() => window.location.reload()}
                        variant="default"
                    >
                        Check Status Again
                    </Button>
                    <Button
                        onClick={() => router.push('/')}
                        variant="outline"
                    >
                        Return to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}
