// src/components/screens/done-screen.tsx
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  RiTimerFill,
  RiAlarmFill,
  RiMessage2Fill,
  RiCheckboxCircleFill,
  RiComputerFill,
  RiSparkling2Fill,
  RiRocketFill,
  RiExternalLinkFill,
  RiTicket2Fill,
  RiTimeFill,
  RiHeartFill,
} from "react-icons/ri";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { enable, disable, isEnabled } from "@tauri-apps/plugin-autostart";
import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import { PRICING_URL } from "../../lib/links";

interface DoneScreenProps {
  breakInterval: number;
  breakDuration: number;
  reminderText: string;
}

interface DiscountData {
  isActive: boolean;
  title: string;
  startDate: string;
  endDate: string;
  couponCode: string;
  percentage: number;
  description: string;
}

export default function DoneScreen({
  breakInterval,
  breakDuration,
  reminderText,
}: DoneScreenProps) {
  const { t } = useTranslation();
  const [autoStart, setAutoStart] = useState(true);
  const [discount, setDiscount] = useState<DiscountData | null>(null);
  const [discountLoading, setDiscountLoading] = useState(true);

  const features = [
    {
      icon: <RiCheckboxCircleFill className="w-4 h-4 text-primary" />,
      title: t("onboarding.featureTodoTitle"),
      text: t("onboarding.featureTodoText"),
    },
    {
      icon: <RiComputerFill className="w-4 h-4 text-primary" />,
      title: t("onboarding.featureScreenTimeTitle"),
      text: t("onboarding.featureScreenTimeText"),
    },
    {
      icon: <RiSparkling2Fill className="w-4 h-4 text-primary" />,
      title: t("onboarding.featurePremiumTitle"),
      text: t("onboarding.featurePremiumText"),
    },
  ];

  // Default-on autostart: enable unless already enabled, user can opt out.
  useEffect(() => {
    const initAutoStart = async () => {
      try {
        const alreadyEnabled = await isEnabled();
        if (!alreadyEnabled) {
          await enable();
        }
        await invoke("update_reminder_setting", {
          key: "isRunOnStartUpEnabledByDefault",
          value: "true",
        });
        setAutoStart(true);
      } catch (error) {
        console.error("Failed to initialize autostart:", error);
        setAutoStart(false);
      }
    };
    initAutoStart();
  }, []);

  useEffect(() => {
    const fetchDiscount = async () => {
      try {
        const res = await fetch("https://api.blinkeye.app/discount", {
          method: "GET",
        });
        const data: DiscountData = await res.json();
        if (data.isActive) setDiscount(data);
      } catch (err) {
        console.error("Failed to fetch discount info:", err);
      } finally {
        setDiscountLoading(false);
      }
    };
    fetchDiscount();
  }, []);

  const handleAutoStartChange = async (checked: boolean) => {
    setAutoStart(checked);
    try {
      if (checked) {
        await enable();
      } else {
        await disable();
      }
    } catch (error) {
      console.error("Failed to update autostart:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full px-6 py-2">
      <div className="w-full max-w-2xl space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold font-heading">
            {t("onboarding.allSetTitle")}
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("onboarding.allSetSubtitle")}
          </p>
        </div>

        {/* Settings summary */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Badge variant="secondary" className="gap-1.5">
            <RiTimerFill className="w-3 h-3" />
            {t("onboarding.everyMinutes", { minutes: breakInterval })}
          </Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge variant="secondary" className="gap-1.5">
            <RiAlarmFill className="w-3 h-3" />
            {t("onboarding.secondsBreak", { seconds: breakDuration })}
          </Badge>
          <span className="text-muted-foreground text-xs">→</span>
          <Badge variant="outline" className="gap-1.5 max-w-[200px]">
            <RiMessage2Fill className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {reminderText || t("common.noMessageSet")}
            </span>
          </Badge>
        </div>

        {/* Feature intro */}
        <div className="grid grid-cols-3 gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3 space-y-1.5"
            >
              <div className="flex items-center space-x-1.5">
                {feature.icon}
                <span className="text-xs font-bold font-heading">
                  {feature.title}
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {feature.text}
              </p>
            </div>
          ))}
        </div>

        {/* Autostart opt-in */}
        <div className="flex items-center justify-between rounded-xl border p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <RiRocketFill className="w-4 h-4 text-primary" />
            </div>
            <div className="space-y-0.5">
              <Label
                htmlFor="onboarding-autostart"
                className="text-sm font-bold font-heading leading-none"
              >
                {t("onboarding.launchOnStartup")}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t("onboarding.launchOnStartupDesc")}
              </p>
            </div>
          </div>
          <Switch
            id="onboarding-autostart"
            checked={autoStart}
            onCheckedChange={handleAutoStartChange}
          />
        </div>

        {/* License upsell */}
        <div className="space-y-2">
          {discountLoading ? (
            <div className="h-16 rounded-xl bg-foreground/5 animate-pulse" />
          ) : discount ? (
            <DiscountBanner discount={discount} />
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-foreground/10 bg-foreground/[0.03] p-3">
              <div className="flex items-center space-x-2">
                <RiHeartFill className="w-4 h-4 text-primary" />
                <p className="text-xs text-foreground/70">
                  {t("onboarding.licenseUpsell")}
                </p>
              </div>
              <a
                href={PRICING_URL}
                target="_blank"
                rel="noreferrer"
              >
                <Button variant="outline" size="sm" className="shrink-0">
                  <RiExternalLinkFill className="w-3.5 h-3.5 mr-1.5" />
                  {t("common.getLicense")}
                </Button>
              </a>
            </div>
          )}
          <p className="text-[11px] text-center text-foreground/40">
            {t("onboarding.alreadyHaveLicense")}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function CountdownTimer({ endDate }: { endDate: string }) {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(endDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft(t("common.expired"));
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
  }, [endDate, t]);

  return <span className="font-mono font-bold tabular-nums">{timeLeft}</span>;
}

function DiscountBanner({ discount }: { discount: DiscountData }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(discount.couponCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-primary/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1.5">
            <RiSparkling2Fill className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold text-primary font-heading uppercase tracking-wide">
              {t("common.limitedOffer")}
            </span>
          </div>
          <div className="bg-primary text-primary-foreground text-xs font-black px-2 py-0.5 rounded-full font-heading">
            {discount.percentage}
            {t("common.offPercent")}
          </div>
        </div>

        <p className="text-sm font-bold text-foreground font-heading leading-tight">
          {discount.title}
        </p>

        <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 bg-background/80 border border-dashed border-primary/50 rounded-lg px-2.5 py-1.5 hover:border-primary hover:bg-primary/5 transition-all group"
          >
            <RiTicket2Fill className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-xs font-bold tracking-wider text-foreground">
              {discount.couponCode}
            </span>
            <span className="text-[10px] text-foreground/50 group-hover:text-primary transition-colors">
              {copied ? t("common.copiedCheck") : t("common.tapToCopy")}
            </span>
          </button>

          <div className="flex items-center space-x-1 text-foreground/60">
            <RiTimeFill className="w-3 h-3 text-primary shrink-0" />
            <span className="text-[10px]">{t("common.endsIn")} </span>
            <span className="text-[10px] text-primary">
              <CountdownTimer endDate={discount.endDate} />
            </span>
          </div>

          <a
            href={PRICING_URL}
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" className="shrink-0">
              <RiExternalLinkFill className="w-3.5 h-3.5 mr-1.5" />
              {t("common.getLicense")}
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
