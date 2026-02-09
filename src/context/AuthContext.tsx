"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Online Status Heartbeat
    useEffect(() => {
        if (!user) return;

        const updateStatus = async () => {
            try {
                const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore");
                const { db } = await import("@/lib/firebase");

                await updateDoc(doc(db, "users", user.uid), {
                    lastActive: serverTimestamp()
                });
            } catch (error) {
                console.error("Error updating online status:", error);
            }
        };

        // Update immediately on mount/login
        updateStatus();

        // Update every 5 minutes
        const interval = setInterval(updateStatus, 5 * 60 * 1000);

        // Update on window focus
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateStatus();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
