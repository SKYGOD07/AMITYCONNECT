"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home, Car, Package, Users, AlertTriangle, MessageCircle, User } from "lucide-react";

const ROUTES: Record<string, { label: string; icon: React.ReactNode }> = {
    "/": { label: "Home", icon: <Home className="h-4 w-4" /> },
    "/rides": { label: "Ride Board", icon: <Car className="h-4 w-4" /> },
    "/errands": { label: "Errands", icon: <Package className="h-4 w-4" /> },
    "/people": { label: "People", icon: <Users className="h-4 w-4" /> },
    "/sos": { label: "SOS", icon: <AlertTriangle className="h-4 w-4" /> },
    "/messages": { label: "Messages", icon: <MessageCircle className="h-4 w-4" /> },
    "/faculty": { label: "Faculty", icon: <User className="h-4 w-4" /> },
};

export default function MobileNav() {
    const pathname = usePathname();

    // Hide on landing/auth pages
    if (pathname === "/landing" || pathname === "/login" || pathname === "/signup") {
        return null;
    }

    // Build breadcrumb segments
    const segments = pathname.split("/").filter(Boolean);
    const breadcrumbs: { href: string; label: string }[] = [{ href: "/", label: "Home" }];

    let currentPath = "";
    for (const segment of segments) {
        currentPath += `/${segment}`;
        const route = ROUTES[currentPath];
        if (route) {
            breadcrumbs.push({ href: currentPath, label: route.label });
        } else {
            // Dynamic segments like /profile/[userId]
            const label = segment.charAt(0).toUpperCase() + segment.slice(1);
            breadcrumbs.push({ href: currentPath, label: label.length > 12 ? label.substring(0, 12) + "..." : label });
        }
    }

    // Quick nav links for mobile
    const quickLinks = [
        { href: "/rides", label: "Rides", icon: <Car className="h-4 w-4" /> },
        { href: "/errands", label: "Errands", icon: <Package className="h-4 w-4" /> },
        { href: "/people", label: "People", icon: <Users className="h-4 w-4" /> },
        { href: "/sos", label: "SOS", icon: <AlertTriangle className="h-4 w-4 text-red-500" /> },
    ];

    return (
        <div className="lg:hidden border-b bg-muted/30">
            {/* Breadcrumbs */}
            <div className="container mx-auto px-4 py-2 flex items-center gap-1 text-sm overflow-x-auto scrollbar-hide">
                {breadcrumbs.map((crumb, index) => (
                    <span key={crumb.href} className="flex items-center gap-1 whitespace-nowrap">
                        {index > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />}
                        {index === breadcrumbs.length - 1 ? (
                            <span className="font-medium text-foreground">{crumb.label}</span>
                        ) : (
                            <Link href={crumb.href} className="text-muted-foreground hover:text-primary transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </span>
                ))}
            </div>

            {/* Quick Nav Links */}
            <div className="container mx-auto px-4 pb-2 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                {quickLinks.map((link) => (
                    <Link
                        key={link.href}
                        href={link.href}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${pathname === link.href || pathname.startsWith(link.href + "/")
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted hover:bg-muted/80 text-foreground"
                            }`}
                    >
                        {link.icon}
                        {link.label}
                    </Link>
                ))}
            </div>
        </div>
    );
}
