// src/components/TrialRemaining.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { fetch } from "@tauri-apps/plugin-http";
import {
  RiTimeFill,
  RiTicket2Fill,
  RiSparkling2Fill,
  RiExternalLinkFill,
  RiAlarmWarningFill,
  RiShieldFill,
} from "react-icons/ri";

interface DiscountData {
  isActive: boolean;
  title: string;
  startDate: string;
  endDate: string;
  couponCode: string;
  percentage: number;
  description: string;
}

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(endDate: string | null) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!endDate) return;

    const calculate = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft("Expired");
        return;
      }
      const d = Math.floor(diff / 864e5);
      const h = Math.floor((diff % 864e5) / 36e5);
      const m = Math.floor((diff % 36e5) / 6e4);
      const s = Math.floor((diff % 6e4) / 1e3);
      setTimeLeft(d > 0 ? `${d}d ${h}h ${m}m ${s}s` : `${h}h ${m}m ${s}s`);
    };

    calculate();
    const id = setInterval(calculate, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  return timeLeft;
}

// ── Main Component ────────────────────────────────────────────────────────────
const TrialRemaining: React.FC = () => {
  const { isTrialOn, remainingDays } = useOnlineStatus();
  const [discount, setDiscount] = useState<DiscountData | null>(null);
  const [discountLoading, setDiscountLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const countdown = useCountdown(discount?.endDate ?? null);

  const isExpired =
    !isTrialOn || (remainingDays !== null && remainingDays <= 0);
  const isUrgent =
    remainingDays !== null && remainingDays <= 3 && remainingDays > 0;

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch("https://api.blinkeye.app/discount", {
          method: "GET",
        });
        const data: DiscountData = await res.json();
        if (data.isActive) setDiscount(data);
      } catch (err) {
        console.error("Failed to fetch discount:", err);
      } finally {
        setDiscountLoading(false);
      }
    };
    fetchDiscount();
  }, []);

  const handleCopy = () => {
    if (!discount) return;
    navigator.clipboard.writeText(discount.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Loading state ──
  if (remainingDays === null) {
    return (
      <div className="w-full rounded-2xl border border-foreground/10 bg-foreground/5 px-5 py-4 mb-4">
        <div className="flex items-center space-x-2 text-foreground/40">
          <div className="w-4 h-4 rounded-full border-2 border-foreground/20 border-t-primary animate-spin" />
          <p className="text-sm">
            Trial info loading… probably lost in a wormhole 🌌 Hang tight!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-4 space-y-2">
      {/* ── Trial Status Card ── */}
      <div
        className={[
          "w-full rounded-2xl border p-4 space-y-3 relative overflow-hidden transition-all",
          isExpired
            ? "bg-destructive/5 border-destructive/20"
            : isUrgent
              ? "bg-primary/5 border-primary/30"
              : "bg-foreground/[0.03] border-foreground/10",
        ].join(" ")}
      >
        {/* subtle glow blob */}
        <div
          className={[
            "absolute -top-8 -right-8 w-32 h-32 rounded-full blur-3xl pointer-events-none",
            isExpired ? "bg-destructive/10" : "bg-primary/10",
          ].join(" ")}
        />

        <div className="relative flex items-start justify-between gap-3">
          {/* Left: icon + text */}
          <div className="flex items-start space-x-3">
            <div
              className={[
                "p-2 rounded-xl border shrink-0 mt-0.5",
                isExpired
                  ? "bg-destructive/10 border-destructive/20"
                  : isUrgent
                    ? "bg-primary/10 border-primary/20"
                    : "bg-foreground/5 border-foreground/10",
              ].join(" ")}
            >
              {isExpired ? (
                <RiAlarmWarningFill className="w-5 h-5 text-destructive" />
              ) : (
                <RiShieldFill
                  className={[
                    "w-5 h-5",
                    isUrgent ? "text-primary" : "text-foreground/50",
                  ].join(" ")}
                />
              )}
            </div>

            <div>
              <p
                className={[
                  "text-sm font-bold font-heading leading-snug",
                  isExpired ? "text-destructive" : "text-foreground",
                ].join(" ")}
              >
                {isExpired
                  ? "Your trial has expired"
                  : isUrgent
                    ? `⚡ Only ${remainingDays} day${remainingDays > 1 ? "s" : ""} left!`
                    : `${remainingDays} day${remainingDays !== 1 ? "s" : ""} remaining in your trial`}
              </p>
              <p className="text-xs text-foreground/50 mt-0.5 leading-relaxed">
                {isExpired
                  ? "Purchase a license to keep using all features and support the developer."
                  : "Unlock all features forever with a one-time license purchase."}
              </p>
            </div>
          </div>

          {/* Right: CTA button */}
          <Button
            size="sm"
            asChild
            className="shrink-0 text-xs font-semibold"
            variant={isExpired ? "destructive" : "default"}
          >
            <Link to="https://blinkeye.app/en/pricing" target="_blank">
              <RiExternalLinkFill className="w-3 h-3 mr-1.5" />
              Get License
            </Link>
          </Button>
        </div>

        {/* ── Urgency progress bar (only when trial active) ── */}
        {!isExpired && remainingDays !== null && (
          <div className="relative space-y-1">
            <div className="w-full h-1.5 rounded-full bg-foreground/10 overflow-hidden">
              <div
                className={[
                  "h-full rounded-full transition-all",
                  isUrgent ? "bg-primary" : "bg-foreground/30",
                ].join(" ")}
                style={{
                  width: `${Math.min((remainingDays / 14) * 100, 100)}%`,
                }}
              />
            </div>
            <p className="text-[10px] text-foreground/35 text-right">
              of 14-day trial
            </p>
          </div>
        )}
      </div>

      {/* ── Discount Banner (only when active sale) ── */}
      {discountLoading ? (
        <div className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
      ) : discount ? (
        <div className="relative w-full overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
          {/* glow */}
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative flex items-center justify-between gap-3 px-4 py-3 flex-wrap">
            {/* Left */}
            <div className="flex items-center space-x-2 min-w-0">
              <RiSparkling2Fill className="w-4 h-4 text-primary shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-primary font-heading truncate">
                    {discount.title}
                  </span>
                  <span className="bg-primary text-primary-foreground text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0">
                    {discount.percentage}% OFF
                  </span>
                </div>
                {/* Countdown */}
                <div className="flex items-center space-x-1 mt-0.5">
                  <RiTimeFill className="w-3 h-3 text-foreground/40 shrink-0" />
                  <span className="text-[10px] text-foreground/40">
                    Ends in{" "}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-primary/80">
                    {countdown}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: copy coupon */}
            <button
              onClick={handleCopy}
              className="flex items-center space-x-1.5 bg-background/70 border border-dashed border-primary/40 rounded-lg px-2.5 py-1.5 hover:border-primary hover:bg-primary/5 transition-all group shrink-0"
            >
              <RiTicket2Fill className="w-3 h-3 text-primary" />
              <span className="font-mono text-xs font-bold tracking-wider">
                {discount.couponCode}
              </span>
              <span className="text-[10px] text-foreground/40 group-hover:text-primary transition-colors">
                {copied ? "✓ Copied!" : "copy"}
              </span>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TrialRemaining;
