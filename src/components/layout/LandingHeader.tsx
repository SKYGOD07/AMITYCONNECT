"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function LandingHeader() {
    const { user, loading } = useAuth();

    return (
        <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50"
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/landing" className="font-bold text-xl flex items-center gap-2 text-primary">
                    <img src="/assets/logo.png" alt="CampusFlow" className="h-8 w-auto" />
                    <span>AmityConnect</span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    <Link href="/landing#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Features
                    </Link>
                    <Link href="/landing#how-it-works" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        How It Works
                    </Link>
                    <Link href="/landing#get-started" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                        Get Started
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    {loading ? (
                        <div className="h-8 w-20 bg-muted animate-pulse rounded-md" />
                    ) : user ? (
                        <Link href="/">
                            <Button size="sm" className="rounded-full px-6">Dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">Login</Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm" className="rounded-full px-6">Sign Up</Button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    );
}
