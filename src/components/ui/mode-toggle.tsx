"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ModeToggle() {
    const { theme, setTheme, resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isDark = resolvedTheme === "dark";

    const toggleTheme = () => {
        setTheme(isDark ? "light" : "dark");
    };

    if (!mounted) {
        return (
            <div className="w-14 h-7 rounded-full bg-muted animate-pulse" />
        );
    }

    return (
        <button
            onClick={toggleTheme}
            className="relative w-14 h-7 rounded-full bg-muted p-1 transition-colors duration-300 hover:bg-muted/80 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Toggle theme"
        >
            {/* Track background */}
            <div className={`absolute inset-0 rounded-full transition-colors duration-300 ${isDark ? 'bg-slate-700' : 'bg-blue-100'}`} />

            {/* Sliding thumb with icon */}
            <div
                className={`relative w-5 h-5 rounded-full shadow-md transition-all duration-300 flex items-center justify-center ${isDark
                        ? 'translate-x-7 bg-slate-900'
                        : 'translate-x-0 bg-white'
                    }`}
            >
                {isDark ? (
                    <Moon className="h-3 w-3 text-yellow-400" />
                ) : (
                    <Sun className="h-3 w-3 text-orange-500" />
                )}
            </div>
        </button>
    );
}
