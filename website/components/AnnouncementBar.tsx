"use client";

import { useState, useEffect } from "react";
import { X, Clock, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

export function AnnouncementBar() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    useEffect(() => {
        // Check if user has previously closed the announcement
        const isClosed = localStorage.getItem("announcementClosed");
        if (isClosed === "true") {
            setIsVisible(false);
        }

        // Calculate time until October 31, 2024, GMT+6
        const calculateTimeLeft = () => {
            const endDate = new Date("2025-10-31T23:59:59+06:00");
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("announcementClosed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black border-t border-gray-700 dark:border-gray-800 shadow-2xl">
                {/* Grid Background Pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `
              linear-gradient(to right, rgba(254, 76, 85, 0.3) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(254, 76, 85, 0.3) 1px, transparent 1px)
            `,
                        backgroundSize: "20px 20px",
                        WebkitMaskImage:
                            "radial-gradient(ellipse 100% 100% at 50% 100%, #000 40%, transparent 100%)",
                        maskImage:
                            "radial-gradient(ellipse 100% 100% at 50% 100%, #000 40%, transparent 100%)",
                    }}
                />

                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#FE4C55]/10 to-transparent pointer-events-none" />

                <div className="relative container mx-auto px-4 py-3 md:py-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-6">
                        {/* Left Section - Sale Info */}
                        <div className="flex flex-col sm:flex-row items-center gap-3 md:gap-4 flex-1">
                            {/* Sparkle Icon */}
                            <div className="hidden sm:flex items-center justify-center">
                                <div className="relative">
                                    <Sparkles className="h-6 w-6 text-[#FE4C55] animate-pulse" />
                                    <div className="absolute inset-0 bg-[#FE4C55]/20 blur-xl" />
                                </div>
                            </div>

                            {/* Main Message */}
                            <div className="text-center sm:text-left">
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                                    <span className="text-white font-heading font-bold text-sm md:text-base">
                                        🎃 October Sale:
                                    </span>
                                    <span className="text-[#FE4C55] font-heading font-bold text-lg md:text-xl">
                                        30% OFF
                                    </span>
                                    <span className="text-gray-300 text-sm md:text-base">
                                        with code
                                    </span>
                                    <code className="px-2 py-1 bg-[#FE4C55]/20 border border-[#FE4C55]/50 rounded text-[#FE4C55] font-mono font-bold text-sm md:text-base">
                                        OCTO30
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Center Section - Countdown Timer */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="flex items-center gap-1 md:gap-2">
                                {Object.entries(timeLeft).map(([unit, value]) => (
                                    <div key={unit} className="flex items-center">
                                        <div className="flex flex-col items-center">
                                            <span className="text-white font-heading font-bold text-base md:text-lg min-w-[2ch] text-center">
                                                {value.toString().padStart(2, "0")}
                                            </span>
                                            <span className="text-gray-500 text-[10px] md:text-xs uppercase">
                                                {unit.slice(0, 3)}
                                            </span>
                                        </div>
                                        {unit !== "seconds" && (
                                            <span className="text-gray-600 mx-1 font-bold">:</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Section - CTA Button & Close */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <Link
                                href="/pricing"
                                className="group flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-[#FE4C55] hover:bg-[#FE4C55]/90 text-black rounded-full font-heading font-semibold text-sm md:text-base transition-all hover:shadow-lg hover:shadow-[#FE4C55]/25"
                            >
                                <span>Claim Offer</span>
                                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Link>

                            <button
                                onClick={handleClose}
                                className="p-1.5 md:p-2 hover:bg-gray-700/50 rounded-full transition-colors group"
                                aria-label="Close announcement"
                            >
                                <X className="h-4 w-4 md:h-5 md:w-5 text-gray-400 group-hover:text-white transition-colors" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}