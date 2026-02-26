"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation"; // 1. Import useParams
import { X, Clock, Sparkles, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { getDiscount, DiscountResponse } from "@/utils/fetchDiscount";

// --- Helpers & Theme Logic (Same as before) ---
const getMonthTheme = () => {
    const month = new Date().getMonth();
    const themes = [
        { primary: "#3B82F6", secondary: "#2563EB", glow: "rgba(59, 130, 246, 0.4)" },
        { primary: "#EC4899", secondary: "#DB2777", glow: "rgba(236, 72, 153, 0.4)" },
        { primary: "#10B981", secondary: "#059669", glow: "rgba(16, 185, 129, 0.4)" },
        { primary: "#F59E0B", secondary: "#D97706", glow: "rgba(245, 158, 11, 0.4)" },
        { primary: "#8B5CF6", secondary: "#7C3AED", glow: "rgba(139, 92, 246, 0.4)" },
        { primary: "#06B6D4", secondary: "#0891B2", glow: "rgba(6, 182, 212, 0.4)" },
        { primary: "#DC2626", secondary: "#B91C1C", glow: "rgba(220, 38, 38, 0.4)" },
        { primary: "#6D28D9", secondary: "#5B21B6", glow: "rgba(109, 40, 217, 0.4)" },
        { primary: "#EA580C", secondary: "#C2410C", glow: "rgba(234, 88, 12, 0.4)" },
        { primary: "#14B8A6", secondary: "#0D9488", glow: "rgba(20, 184, 166, 0.4)" },
        { primary: "#FE4C55", secondary: "#E11D48", glow: "rgba(254, 76, 85, 0.4)" },
        { primary: "#059669", secondary: "#047857", glow: "rgba(5, 150, 105, 0.4)" },
    ];
    return themes[month];
};

const extractEmoji = (title: string) => {
    const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u;
    const match = title.match(emojiRegex);
    return match ? match[0] : "🎉";
};

// --- Component ---

export function AnnouncementBar() {
    // 2. Get the current locale (e.g., 'en', 'fr')
    const params = useParams();
    const locale = (params?.locale as string) || "en";

    const [discount, setDiscount] = useState<DiscountResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const theme = getMonthTheme();

    // --- Fetch & Timer Logic (Same as before) ---
    useEffect(() => {
        const fetchDiscount = async () => {
            try {
                const data = await getDiscount();
                if (data && data.isActive) {
                    const closedKey = `announcement_closed_${data.couponCode}`;
                    const isClosed = localStorage.getItem(closedKey);
                    if (!isClosed) setDiscount(data);
                    else setIsVisible(false);
                }
            } catch (error) {
                console.error("Failed to fetch discount", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDiscount();
    }, []);

    const calculateTimeLeft = useCallback(() => {
        if (!discount?.endDate) return;
        const end = new Date(discount.endDate).getTime();
        const now = new Date().getTime();
        const difference = end - now;

        if (difference > 0) {
            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            });
        } else {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        }
    }, [discount]);

    useEffect(() => {
        if (!discount) return;
        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, [discount, calculateTimeLeft]);

    const handleClose = () => {
        setIsVisible(false);
        if (discount?.couponCode) {
            localStorage.setItem(`announcement_closed_${discount.couponCode}`, "true");
        }
    };

    const handleCopyCode = () => {
        if (discount?.couponCode) navigator.clipboard.writeText(discount.couponCode);
    };

    // --- Render States ---

    if (isLoading) {
        return (
            <div className="fixed bottom-0 left-0 right-0 z-50 p-2">
                <div className="container mx-auto">
                    <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md rounded-lg border border-gray-200 dark:border-gray-800 shadow-lg p-3">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <Skeleton className="h-6 w-6 rounded-full" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                            <div className="hidden md:flex items-center gap-2">
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-8 w-24 rounded-full" />
                                <Skeleton className="h-6 w-6 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!discount || !isVisible) return null;

    const emoji = extractEmoji(discount.title);
    const cleanTitle = discount.title.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up p-2 sm:p-0">
            <div
                className="relative bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t sm:border shadow-lg sm:rounded-none"
                style={{ borderTopColor: theme.primary, borderTopWidth: '2px' }}
            >
                <div
                    className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
                    style={{ backgroundImage: `linear-gradient(to right, ${theme.primary} 1px, transparent 1px), linear-gradient(to bottom, ${theme.primary} 1px, transparent 1px)`, backgroundSize: "24px 24px" }}
                />

                <div className="relative container mx-auto px-3 py-2 sm:px-4 sm:py-2.5 md:py-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">

                        {/* Mobile Layout */}
                        <div className="flex flex-col sm:hidden w-full gap-2">
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-gray-900 dark:text-white font-semibold text-xs"> {emoji} {cleanTitle}</span>
                                <span className="font-bold text-sm" style={{ color: theme.primary }}>{discount.percentage}% OFF</span>
                                <code className="px-1.5 py-0.5 rounded text-xs font-bold cursor-pointer" style={{ backgroundColor: `${theme.primary}15`, border: `1px solid ${theme.primary}30`, color: theme.primary }} onClick={handleCopyCode}>{discount.couponCode}</code>
                            </div>

                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                    <Clock className="h-3 w-3" />
                                    <span>{timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* 3. Updated Link with locale */}
                                    <Link href={`/${locale}/pricing`} className="px-3 py-1 text-white rounded-full text-xs font-semibold" style={{ backgroundColor: theme.primary }}>
                                        Claim
                                    </Link>
                                    <button onClick={handleClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full">
                                        <X className="h-3.5 w-3.5 text-gray-500" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden sm:flex sm:flex-row sm:items-center sm:justify-between sm:w-full sm:gap-4">

                            <div className="flex items-center gap-3 flex-1">
                                <div className="hidden lg:flex items-center justify-center">
                                    <Sparkles className="h-5 w-5 animate-pulse" style={{ color: theme.primary }} />
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-gray-900 dark:text-white font-semibold text-sm"> {emoji} {cleanTitle}</span>
                                    <span className="font-bold text-base animate-pulse" style={{ color: theme.primary }}>{discount.percentage}% OFF</span>
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">with code</span>
                                    <code className="px-2 py-0.5 rounded font-bold text-sm cursor-pointer transition-transform hover:scale-105" style={{ backgroundColor: `${theme.primary}15`, border: `1px solid ${theme.primary}30`, color: theme.primary }} onClick={handleCopyCode} title="Click to copy">{discount.couponCode}</code>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-gray-500" />
                                <div className="flex items-center gap-1">
                                    {Object.entries(timeLeft).map(([unit, value]) => (
                                        <div key={unit} className="flex items-center">
                                            <div className="flex flex-col items-center">
                                                <span className="font-bold text-sm min-w-[2ch] text-center" style={{ color: theme.primary }}>{value.toString().padStart(2, "0")}</span>
                                                <span className="text-[9px] text-gray-500 uppercase -mt-0.5">{unit.slice(0, 3)}</span>
                                            </div>
                                            {unit !== "seconds" && <span className="text-gray-400 mx-1 text-xs">:</span>}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {/* 4. Updated Link with locale */}
                                <Link
                                    href={`/${locale}/pricing`}
                                    className="group flex items-center gap-1 px-4 py-1.5 text-white rounded-full font-semibold text-sm transition-all hover:shadow-lg"
                                    style={{ backgroundColor: theme.primary }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = theme.secondary;
                                        e.currentTarget.style.boxShadow = `0 8px 25px -5px ${theme.glow}`;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = theme.primary;
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <span>Claim Offer</span>
                                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button onClick={handleClose} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-full transition-colors">
                                    <X className="h-4 w-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}