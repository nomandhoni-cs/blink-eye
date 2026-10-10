import { useState, useEffect, useRef } from "react";
import { Card } from "./ui/card";
import { Label } from "./ui/label";
import Database from "@tauri-apps/plugin-sql";
import { usePremiumFeatures } from "../contexts/PremiumFeaturesContext";
import toast from "react-hot-toast";
import { PiMonitorFill } from "react-icons/pi";
import { IoSparkles } from "react-icons/io5";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { getEffectiveMonitorMode } from "../lib/premium-entitlement";

interface ConfigRow {
    value: string;
}

// Multiple monitors icon component using PiMonitorFill
function MultiMonitorIcon({ className }: { className?: string }) {
    return (
        <div className={`relative ${className}`}>
            {/* Back monitor (smaller, faded) */}
            <PiMonitorFill
                className="absolute top-0 left-1/2 -translate-x-1/2 opacity-30"
                size={28}
            />
            {/* Left monitor */}
            <PiMonitorFill
                className="absolute top-2 left-0"
                size={32}
            />
            {/* Right monitor */}
            <PiMonitorFill
                className="absolute top-2 right-0"
                size={32}
            />
        </div>
    );
}

const MultiMonitorToggle = () => {
    const {
        canAccessPremiumFeatures,
        trialInfo,
        trialError,
        licenseError,
        isLoading: entitlementLoading,
        isRefreshing,
        refreshPremiumFeatures,
    } = usePremiumFeatures();
    const [isMultiMonitorEnabled, setIsMultiMonitorEnabled] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const saving = useRef(false);
    const isPending = entitlementLoading || isRefreshing;
    const isBusy = isLoading || isPending || isSaving;
    const effectiveMode = getEffectiveMonitorMode(isMultiMonitorEnabled, canAccessPremiumFeatures);
    const isModeKnown = !isPending && (canAccessPremiumFeatures ||
        (!trialError && !licenseError && !!trialInfo?.install_date && !trialInfo.clock_manipulated));
    const primarySelected = isModeKnown && effectiveMode === "primary";
    const allSelected = !isPending && effectiveMode === "all";
    const allAvailable = !isPending && canAccessPremiumFeatures;
    const statusReason = entitlementLoading || isRefreshing
        ? "Checking trial and license status. Monitor choices are temporarily unavailable."
        : isSaving
            ? "Saving monitor preference..."
            : canAccessPremiumFeatures
                ? "Premium access is available for multi-monitor breaks."
                : trialError || licenseError
                    ? "Unable to confirm premium access. Retry the status check or check your license. Free breaks use the primary monitor."
                    : trialInfo?.clock_manipulated
                        ? "Trial unavailable because the system date is before installation. Check your system date, then retry."
                        : !trialInfo?.install_date
                            ? "Trial information is unavailable. Retry the status check or activate a license."
                            : "Your trial has expired and no active paid license was found. Free breaks use the primary monitor.";

    useEffect(() => {
        const initializeMultiMonitor = async () => {
            try {
                const db = await Database.load("sqlite:appconfig.db");

                // Retrieve the 'isMultiMonitorEnabled' value from the config table
                const result: ConfigRow[] = await db.select(
                    "SELECT value FROM config WHERE key = 'isMultiMonitorEnabled';"
                );

                if (result.length > 0) {
                    setIsMultiMonitorEnabled(result[0].value === "true");
                } else {
                    // Default to false (Primary Monitor only)
                    setIsMultiMonitorEnabled(false);
                }
            } catch (error) {
                console.error("Failed to initialize multi-monitor setting:", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeMultiMonitor();
    }, []);

    const handleSelectionChange = async (enableMultiMonitor: boolean) => {
        if (saving.current || isBusy || (enableMultiMonitor && !allAvailable)) return;
        saving.current = true;
        setIsSaving(true);

        try {
            const db = await Database.load("sqlite:appconfig.db");
            if (enableMultiMonitor) {
                const snapshot = await refreshPremiumFeatures();
                if (!snapshot.canAccessPremiumFeatures) {
                    toast.error("Premium access could not be confirmed. No monitor preference was changed.", {
                        duration: 3000,
                        position: "bottom-right",
                    });
                    return;
                }
            }

            // Update the database
            await db.execute(
                `
        INSERT INTO config (key, value) VALUES ('isMultiMonitorEnabled', ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value;
      `,
                [enableMultiMonitor ? "true" : "false"]
            );

            setIsMultiMonitorEnabled(enableMultiMonitor);

            toast.success(
                enableMultiMonitor
                    ? "Backgrounds on all displays; controls on primary."
                    : "Break reminders on primary display only.",
                {
                    duration: 2000,
                    position: "bottom-right",
                }
            );
        } catch (error) {
            console.error("Failed to update multi-monitor setting:", error);
            toast.error("Failed to save setting. Please try again.", {
                duration: 2000,
                position: "bottom-right",
            });
        } finally {
            saving.current = false;
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="rounded-lg border border-muted p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-20 bg-muted rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-lg border border-muted p-6 space-y-4">
            <div>
                <Label className="text-base font-semibold">Monitor display mode</Label>
                <p className="text-sm text-muted-foreground mt-1">
                    Choose whether the break background fills one screen or every screen
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Primary Monitor Option */}
                <Card
                    className={`relative transition-all duration-200 ${primarySelected
                        ? "border-primary border-2 bg-primary/5"
                        : "border-muted hover:border-primary/50"
                        }`}
                >
                    <button
                        type="button"
                        disabled={isBusy}
                        aria-pressed={primarySelected}
                        aria-describedby="monitor-entitlement-status"
                        onClick={() => void handleSelectionChange(false)}
                        className="block w-full cursor-pointer text-inherit rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed"
                    >
                    <div className="p-6 flex flex-col items-center text-center space-y-3">
                        <div
                            className={`p-4 rounded-full ${primarySelected
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                                }`}
                        >
                            <PiMonitorFill size={40} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg">Primary monitor</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Background and controls on your main display only
                            </p>
                        </div>
                        {primarySelected && (
                            <div className="absolute top-3 right-3">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    </button>
                </Card>

                {/* Multi-Monitor Option */}
                <Card
                    className={`relative overflow-hidden transition-all duration-200 ${!allAvailable
                        ? "border-muted bg-muted/20"
                        : allSelected
                        ? "border-primary border-2 bg-primary/5"
                        : "border-amber-500/25 dark:border-amber-400/20 bg-amber-500/5 dark:bg-amber-400/5 hover:border-amber-500/50 dark:hover:border-amber-400/35"
                        }`}
                >
                    <button
                        type="button"
                        disabled={isBusy || !allAvailable}
                        aria-pressed={allSelected}
                        aria-describedby="monitor-entitlement-status"
                        onClick={() => void handleSelectionChange(true)}
                        className="block w-full cursor-pointer text-inherit rounded-[inherit] outline-none focus-visible:ring-3 focus-visible:ring-ring/30 disabled:cursor-not-allowed"
                    >
                    {allAvailable && <>
                    {/* Animated gradient sweep */}
                    <motion.div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent 0%, rgba(245,158,11,0.15) 35%, rgba(225,29,72,0.2) 50%, rgba(245,158,11,0.15) 65%, transparent 100%)",
                            backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                    />

                    {/* White shimmer - always visible */}
                    <motion.div
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            background:
                                "linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)",
                            backgroundSize: "200% 100%",
                        }}
                        animate={{ backgroundPosition: ["200% 0", "-200% 0"] }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 0.6,
                        }}
                    />
                    </>}

                    <div className="relative z-10 p-6 flex flex-col items-center text-center space-y-3">
                        <div
                            className={`p-4 rounded-full ${!allAvailable
                                ? "bg-muted text-muted-foreground"
                                : allSelected
                                ? "bg-primary/10 text-primary"
                                : "bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400"
                                }`}
                        >
                            <MultiMonitorIcon className="w-16 h-10" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-lg flex items-center justify-center gap-2">
                                Multi-Monitor
                                {allAvailable && <IoSparkles
                                    className="text-amber-500 dark:text-amber-400 drop-shadow-[0_0_4px_rgba(245,158,11,0.5)]"
                                    size={18}
                                />}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1">
                                Background on every display; timer and skip on primary only
                            </p>
                            {!canAccessPremiumFeatures && (
                                <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 dark:border-amber-400/20">
                                    <IoSparkles
                                        className="text-amber-600 dark:text-amber-400"
                                        size={12}
                                    />
                                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 tracking-wide">
                                        PREMIUM
                                    </span>
                                </div>
                            )}
                        </div>
                        {allSelected && (
                            <div className="absolute top-3 right-3">
                                <div className="bg-primary text-primary-foreground rounded-full p-1">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>
                    </button>
                </Card>
            </div>
            <div className="space-y-2">
                <p id="monitor-entitlement-status" role="status" className="text-sm text-muted-foreground">
                    {statusReason}
                    {isModeKnown && !canAccessPremiumFeatures && isMultiMonitorEnabled &&
                        " Your all-monitor preference is retained and can apply again when premium access returns. Select Primary to save a primary-only preference."}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button type="button" size="sm" variant="secondary" disabled={isBusy} onClick={() => void refreshPremiumFeatures()}>
                        {isPending ? "Checking..." : "Retry status"}
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                        <Link to="/activatelicense">Check or activate license</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default MultiMonitorToggle;
