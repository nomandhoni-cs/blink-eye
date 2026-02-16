"use client";

import { useState, useEffect } from "react";
import { X, Clock, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";

// Monthly offers configuration - COMMENT OUT any month to disable it
const MONTHLY_OFFERS = {
    January: {
        title: "New Year Sale:",
        discount: 25,
        code: "NEW25",
        emoji: "🎆",
        theme: {
            primary: "#3B82F6", // Blue
            secondary: "#2563EB",
        }
    },
    February: {
        title: "Valentine's Special:",
        discount: 30,
        code: "LOVE30",
        emoji: "💝",
        theme: {
            primary: "#EC4899", // Pink
            secondary: "#DB2777",
        }
    },
    March: {
        title: "Spring Savings:",
        discount: 20,
        code: "SPRING20",
        emoji: "🌸",
        theme: {
            primary: "#10B981", // Green
            secondary: "#059669",
        }
    },
    April: {
        title: "Easter Deals:",
        discount: 35,
        code: "EGG35",
        emoji: "🐰",
        theme: {
            primary: "#F59E0B", // Yellow/Orange
            secondary: "#D97706",
        }
    },
    May: {
        title: "May Madness:",
        discount: 40,
        code: "MAY40",
        emoji: "🌺",
        theme: {
            primary: "#8B5CF6", // Purple
            secondary: "#7C3AED",
        }
    },
    June: {
        title: "Summer Kickoff:",
        discount: 30,
        code: "SUMMER30",
        emoji: "☀️",
        theme: {
            primary: "#06B6D4", // Cyan
            secondary: "#0891B2",
        }
    },
    July: {
        title: "July Freedom:",
        discount: 45,
        code: "FREE45",
        emoji: "🎆",
        theme: {
            primary: "#DC2626", // Red
            secondary: "#B91C1C",
        }
    },
    August: {
        title: "Back to School:",
        discount: 25,
        code: "SCHOOL25",
        emoji: "📚",
        theme: {
            primary: "#7C3AED", // Purple
            secondary: "#6D28D9",
        }
    },
    September: {
        title: "Fall Preview:",
        discount: 30,
        code: "FALL30",
        emoji: "🍂",
        theme: {
            primary: "#EA580C", // Orange
            secondary: "#C2410C",
        }
    },
    October: {
        title: "Halloween Sale:",
        discount: 50,
        code: "SPOOK50",
        emoji: "🎃",
        theme: {
            primary: "#FE4C55", // Halloween Orange/Red
            secondary: "#E11D48",
        }
    },
    November: {
        title: "Black Friday:",
        discount: 60,
        code: "BLACK60",
        emoji: "🛍️",
        theme: {
            primary: "#FE4C55", // Keep red for Black Friday
            secondary: "#DC2626",
        }
    },
    December: {
        title: "Holiday Sale:",
        discount: 40,
        code: "XMAS40",
        emoji: "🎄",
        theme: {
            primary: "#059669", // Christmas Green
            secondary: "#047857",
        }
    },
};

// Helper function to get the last day of a month
const getLastDayOfMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
};

// Helper function to check if it's a leap year
const isLeapYear = (year: number) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
};

// Get timezone offset for US (handles DST automatically)
const getTimezoneOffset = () => {
    const now = new Date();
    const jan = new Date(now.getFullYear(), 0, 1);
    const jul = new Date(now.getFullYear(), 6, 1);
    const stdOffset = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
    const currentOffset = now.getTimezoneOffset();

    // Return appropriate timezone based on current DST status
    if (currentOffset === stdOffset) {
        // Standard time (EST)
        return "-05:00";
    } else {
        // Daylight time (EDT)
        return "-04:00";
    }
};

// Get current month's offer with dynamic dates
const getCurrentMonthOffer = () => {
    const now = new Date();
    const currentMonth = now.toLocaleString('default', { month: 'long' });
    const currentYear = now.getFullYear();

    const offer = MONTHLY_OFFERS[currentMonth as keyof typeof MONTHLY_OFFERS];

    if (!offer) return null;

    // Get the last day of the current month
    const lastDay = getLastDayOfMonth(currentYear, now.getMonth());

    // Build the end date string dynamically
    const endDate = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}-${lastDay}T23:59:59${getTimezoneOffset()}`;

    return {
        ...offer,
        month: currentMonth,
        year: currentYear,
        endDate,
    };
};

const MONTHLY_OFFER = getCurrentMonthOffer();

// Generate a unique key for this offer
const OFFER_KEY = MONTHLY_OFFER ? `offer_${MONTHLY_OFFER.month}_${MONTHLY_OFFER.year}` : null;

export function AnnouncementBar() {
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        // If no offer for current month, don't show anything
        if (!MONTHLY_OFFER) {
            setIsVisible(false);
            return;
        }

        // Check if this is a new offer (different from last seen)
        const lastSeenOffer = localStorage.getItem("lastSeenOffer");
        const isClosed = localStorage.getItem("announcementClosed");

        // If offer changed or expired, reset localStorage
        if (lastSeenOffer !== OFFER_KEY || isExpired) {
            localStorage.removeItem("announcementClosed");
            localStorage.removeItem("lastSeenOffer");
            setIsVisible(true);
        } else if (isClosed === "true") {
            setIsVisible(false);
        }

        // Calculate time until offer expires
        const calculateTimeLeft = () => {
            const endDate = new Date(MONTHLY_OFFER.endDate);
            const now = new Date();
            const difference = endDate.getTime() - now.getTime();

            if (difference > 0) {
                const days = Math.floor(difference / (1000 * 60 * 60 * 24));
                const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((difference / 1000 / 60) % 60);
                const seconds = Math.floor((difference / 1000) % 60);

                setTimeLeft({ days, hours, minutes, seconds });
                setIsExpired(false);
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                setIsExpired(true);
                // Clear localStorage when offer expires
                localStorage.removeItem("announcementClosed");
                localStorage.removeItem("lastSeenOffer");
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [isExpired]);

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem("announcementClosed", "true");
        if (OFFER_KEY) {
            localStorage.setItem("lastSeenOffer", OFFER_KEY);
        }
    };

    const handleCopyCode = () => {
        if (MONTHLY_OFFER?.code) {
            navigator.clipboard.writeText(MONTHLY_OFFER.code);
            // Optional: Add a toast notification
        }
    };

    // Don't show if no offer, expired, or user closed it
    if (!MONTHLY_OFFER || !isVisible || isExpired) return null;

    const { primary, secondary } = MONTHLY_OFFER.theme;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
            <div
                className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t shadow-lg"
                style={{
                    borderTopColor: primary,
                    borderTopWidth: '2px',
                }}
            >
                {/* Subtle Grid Pattern */}
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, ${primary} 1px, transparent 1px),
                            linear-gradient(to bottom, ${primary} 1px, transparent 1px)
                        `,
                        backgroundSize: "20px 20px",
                    }}
                />

                {/* Gradient Glow Effect */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `linear-gradient(to top, ${primary}08, transparent 40%)`,
                    }}
                />

                <div className="relative container mx-auto px-3 py-2 sm:px-4 sm:py-2.5 md:py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
                        {/* Mobile Layout - Stacked */}
                        <div className="flex flex-col sm:hidden w-full gap-2">
                            {/* Top Row - Main Message */}
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-900 dark:text-white font-heading font-semibold text-xs">
                                    {MONTHLY_OFFER.emoji} {MONTHLY_OFFER.title}
                                </span>
                                <span
                                    className="font-heading font-bold text-sm"
                                    style={{ color: primary }}
                                >
                                    {MONTHLY_OFFER.discount}% OFF
                                </span>
                                <code
                                    className="px-1.5 py-0.5 rounded text-xs font-heading font-bold cursor-pointer"
                                    style={{
                                        backgroundColor: `${primary}15`,
                                        border: `1px solid ${primary}30`,
                                        color: primary,
                                    }}
                                    onClick={handleCopyCode}
                                >
                                    {MONTHLY_OFFER.code}
                                </code>
                            </div>

                            {/* Bottom Row - Timer and Actions */}
                            <div className="flex items-center justify-between w-full">
                                {/* Timer */}
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3 text-gray-500 dark:text-gray-400" />
                                    <div className="flex items-center gap-1 text-xs">
                                        {Object.entries(timeLeft).slice(0, 3).map(([unit, value], index) => (
                                            <div key={unit} className="flex items-center">
                                                <span
                                                    className="font-heading font-bold text-gray-900 dark:text-white"
                                                    style={{ color: primary }}
                                                >
                                                    {value.toString().padStart(2, "0")}
                                                    <span className="text-gray-500 dark:text-gray-400 text-[10px] ml-0.5">
                                                        {unit[0]}
                                                    </span>
                                                </span>
                                                {index < 2 && (
                                                    <span className="text-gray-400 dark:text-gray-600 mx-0.5">:</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        href="/pricing"
                                        className="flex items-center gap-1 px-3 py-1 text-white rounded-full text-xs font-heading font-semibold transition-all hover:scale-105"
                                        style={{
                                            backgroundColor: primary,
                                        }}
                                    >
                                        <span>Claim</span>
                                        <ChevronRight className="h-3 w-3" />
                                    </Link>
                                    <button
                                        onClick={handleClose}
                                        className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    >
                                        <X className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop/Tablet Layout - Horizontal */}
                        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:w-full sm:gap-4">
                            {/* Left Section - Sale Info */}
                            <div className="flex items-center gap-3 flex-1">
                                {/* Sparkle Icon - Hidden on smaller screens */}
                                <div className="hidden lg:flex items-center justify-center">
                                    <div className="relative">
                                        <Sparkles
                                            className="h-5 w-5 animate-pulse"
                                            style={{ color: primary }}
                                        />
                                    </div>
                                </div>

                                {/* Main Message */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-gray-900 dark:text-white font-heading font-semibold text-sm">
                                        {MONTHLY_OFFER.emoji} {MONTHLY_OFFER.title}
                                    </span>
                                    <span
                                        className="font-heading font-bold text-base animate-pulse"
                                        style={{ color: primary }}
                                    >
                                        {MONTHLY_OFFER.discount}% OFF
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        with code
                                    </span>
                                    <code
                                        className="px-2 py-0.5 rounded font-heading font-bold text-sm cursor-pointer transition-transform hover:scale-105"
                                        style={{
                                            backgroundColor: `${primary}15`,
                                            border: `1px solid ${primary}30`,
                                            color: primary,
                                        }}
                                        onClick={handleCopyCode}
                                        title="Click to copy"
                                    >
                                        {MONTHLY_OFFER.code}
                                    </code>
                                </div>
                            </div>

                            {/* Center Section - Countdown Timer */}
                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                                <div className="flex items-center gap-1">
                                    {Object.entries(timeLeft).map(([unit, value]) => (
                                        <div key={unit} className="flex items-center">
                                            <div className="flex flex-col items-center">
                                                <span
                                                    className="font-heading font-bold text-sm min-w-[2ch] text-center"
                                                    style={{ color: primary }}
                                                >
                                                    {value.toString().padStart(2, "0")}
                                                </span>
                                                <span className="text-[9px] text-gray-500 dark:text-gray-400 uppercase -mt-0.5">
                                                    {unit.slice(0, 3)}
                                                </span>
                                            </div>
                                            {unit !== "seconds" && (
                                                <span className="text-gray-400 dark:text-gray-600 mx-1 text-xs">:</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right Section - CTA Button & Close */}
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/pricing"
                                    className="group flex items-center gap-1 px-3 py-1.5 text-white rounded-full font-heading font-semibold text-sm transition-all hover:shadow-lg"
                                    style={{
                                        backgroundColor: primary,
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = secondary;
                                        e.currentTarget.style.boxShadow = `0 8px 20px -5px ${primary}40`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = primary;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>Claim Offer</span>
                                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                                </Link>

                                <button
                                    onClick={handleClose}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors"
                                    aria-label="Close announcement"
                                >
                                    <X className="h-4 w-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}