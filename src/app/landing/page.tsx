"use client";

import { useRef, type ComponentPropsWithoutRef } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Car, Package, AlertTriangle, ArrowRight, Sparkles,
    Users, MapPin, Shield, ChevronDown,
    GraduationCap, UserCog
} from "lucide-react";

// Animation variants - using object type to avoid strict Framer Motion typing
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
} as const;

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.2 }
    }
} as const;

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
} as const;

// Section component with scroll animation
interface AnimatedSectionProps extends ComponentPropsWithoutRef<"section"> {
    children: React.ReactNode;
}

function AnimatedSection({ children, className = "", id, ...rest }: AnimatedSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <section ref={ref} id={id} className={className} {...rest}>
            <motion.div
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                variants={staggerContainer}
            >
                {children}
            </motion.div>
        </section>
    );
}

import LandingHeader from "@/components/layout/LandingHeader";

// ... (existing imports)

export default function LandingPage() {
    const { scrollYProgress } = useScroll();
    const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

    return (
        <div className="min-h-screen bg-background overflow-x-hidden">
            {/* Reuse the Landing Header */}
            <LandingHeader />

            {/* Floating background elements */}

            {/* Floating background elements */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"
                    style={{ y: backgroundY }}
                />
                <motion.div
                    className="absolute top-40 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
                    style={{ y: backgroundY }}
                />
                <motion.div
                    className="absolute bottom-20 left-1/3 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
                    style={{ y: backgroundY }}
                />
            </div>

            {/* Hero Section */}
            <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8"
                    >
                        Amity Gwalior Campus Community Platform
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-6"
                    >
                        <span className="gradient-text">Connect.</span>{" "}
                        <span className="gradient-text">Commute.</span>{" "}
                        "AmityConnect is a unified app integrating Smart Ride-Sharing, a Peer-to-Peer Marketplace, and Real-Time SOS. It replaces chaotic group chats with a structured platform for safer, cheaper, and connected campus life."
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap justify-center gap-4"
                    >
                        <Link href="#get-started">
                            <Button size="lg" className="gap-2 text-lg px-8 py-6">
                                Get Started <ArrowRight size={20} />
                            </Button>
                        </Link>
                        <Link href="#features">
                            <Button size="lg" variant="outline" className="gap-2 text-lg px-8 py-6">
                                Learn More
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    className="absolute bottom-10 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="flex flex-col items-center gap-2 text-muted-foreground"
                    >
                        <span className="text-sm">Scroll to explore</span>
                        <ChevronDown className="h-6 w-6" />
                    </motion.div>
                </motion.div>
            </section>

            {/* Features Section */}
            <AnimatedSection className="py-32 px-4" id="features">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Everything you need on campus
                        </h2>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Three powerful features designed for the Amity Gwalior community
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Car,
                                title: "Ride Board",
                                description: "Share rides to Panjim, Airport, or anywhere. Save money and reduce carbon footprint together.",
                                gradient: "from-blue-500 to-cyan-500",
                                iconBg: "bg-blue-500/10",
                                iconColor: "text-blue-500"
                            },
                            {
                                icon: Package,
                                title: "Errand Requests",
                                description: "Need coffee from the canteen? Medicine from town? Post requests and earn rewards helping others.",
                                gradient: "from-green-500 to-emerald-500",
                                iconBg: "bg-green-500/10",
                                iconColor: "text-green-500"
                            },
                            {
                                icon: AlertTriangle,
                                title: "Emergency SOS",
                                description: "One tap to share your live location with campus security and nearby community members.",
                                gradient: "from-red-500 to-orange-500",
                                iconBg: "bg-red-500/10",
                                iconColor: "text-red-500"
                            }
                        ].map((feature, i) => (
                            <motion.div key={i} variants={fadeInUp}>
                                <Card className="h-full card-hover border-2 overflow-hidden group">
                                    <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                                    <CardContent className="p-8">
                                        <div className={`w-16 h-16 rounded-2xl ${feature.iconBg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                            <feature.icon className={`h-8 w-8 ${feature.iconColor}`} />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                        <p className="text-muted-foreground">{feature.description}</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* How It Works Section */}
            <AnimatedSection className="py-32 px-4 bg-muted/30" id="how-it-works">
                <div className="max-w-6xl mx-auto">
                    <motion.div variants={fadeInUp} className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            How AmityConnect Works
                        </h2>
                        <p className="text-xl text-muted-foreground">
                            Get started in three simple steps
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-purple-500 via-blue-500 to-green-500" />

                        {[
                            {
                                step: "01",
                                title: "Sign Up",
                                description: "Create your account as a Student or Faculty member with your Amity University email.",
                                icon: Users
                            },
                            {
                                step: "02",
                                title: "Connect",
                                description: "Browse rides, post errands, or check emergency contacts. Everything in one place.",
                                icon: MapPin
                            },
                            {
                                step: "03",
                                title: "Stay Safe",
                                description: "Use the community network. Help others and get help when you need it.",
                                icon: Shield
                            }
                        ].map((item, i) => (
                            <motion.div key={i} variants={scaleIn} className="relative">
                                <div className="text-center">
                                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-2xl shadow-lg relative z-10">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                                    <p className="text-muted-foreground">{item.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </AnimatedSection>

            {/* Stats Section */}
            <AnimatedSection className="py-32 px-4" id="stats">
                <div className="max-w-4xl mx-auto">
                    <motion.div variants={fadeInUp} className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { value: "500+", label: "Students" },
                            { value: "1000+", label: "Rides Shared" },
                            { value: "24/7", label: "SOS Support" },
                            { value: "100%", label: "Free Forever" }
                        ].map((stat, i) => (
                            <motion.div key={i} variants={scaleIn}>
                                <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">{stat.value}</div>
                                <div className="text-muted-foreground">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </AnimatedSection>

            {/* Role Selection / CTA Section */}
            <AnimatedSection className="py-32 px-4 bg-gradient-to-b from-background to-muted/50" id="get-started">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div variants={fadeInUp}>
                        <h2 className="text-4xl md:text-5xl font-bold mb-4">
                            Ready to join AmityConnect?
                        </h2>
                        <p className="text-xl text-muted-foreground mb-12">
                            Select your role to get started
                        </p>
                    </motion.div>

                    <motion.div variants={staggerContainer} className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                        <motion.div variants={scaleIn}>
                            <Link href="/signup?role=student">
                                <Card className="card-hover border-2 border-blue-500/20 hover:border-blue-500/50 cursor-pointer group">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <GraduationCap className="h-10 w-10 text-blue-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">I'm a Student</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Share rides, request errands, stay connected
                                        </p>
                                        <Button className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
                                            Continue as Student <ArrowRight size={16} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>

                        <motion.div variants={scaleIn}>
                            <Link href="/signup?role=faculty">
                                <Card className="card-hover border-2 border-purple-500/20 hover:border-purple-500/50 cursor-pointer group">
                                    <CardContent className="p-8 text-center">
                                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <UserCog className="h-10 w-10 text-purple-500" />
                                        </div>
                                        <h3 className="text-2xl font-bold mb-2">I'm Faculty/Admin</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Manage rides, oversee community safety
                                        </p>
                                        <Button className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                                            Continue as Faculty <ArrowRight size={16} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Link>
                        </motion.div>
                    </motion.div>

                    <motion.p variants={fadeInUp} className="mt-8 text-muted-foreground">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-medium">
                            Sign in here
                        </Link>
                    </motion.p>
                </div>
            </AnimatedSection>

            {/* Footer */}
            <footer className="py-12 px-4 border-t">
                <div className="max-w-6xl mx-auto text-center text-muted-foreground">
                    <p>© 2026 AmityConnect. Built for Amity University Madhya Pradesh with ❤️</p>
                </div>
            </footer>
        </div>
    );
}
