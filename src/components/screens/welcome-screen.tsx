// src/components/screens/welcome-screen.tsx
import {
  RiTimerFill,
  RiShieldFill,
  RiCheckboxCircleFill,
  RiComputerFill,
  RiMailAddFill,
  RiErrorWarningFill,
} from "react-icons/ri";
import { useTranslation } from "react-i18next";
import AnimatedEyeBlinkLogo from "../AnimatedEyeBlinkLogo";
import { Input } from "../ui/input";

interface WelcomeScreenProps {
  email: string;
  setEmail: (email: string) => void;
  emailError: string | null;
  /** Soft warning for an unusual-but-plausible address; never blocks. */
  emailWarning?: string | null;
  /** True once the user has explicitly kept an address we warned about. */
  emailWarningAcknowledged?: boolean;
  onAcknowledgeWarning?: () => void;
}

export default function WelcomeScreen({
  email,
  setEmail,
  emailError,
  emailWarning = null,
  emailWarningAcknowledged = false,
  onAcknowledgeWarning,
}: WelcomeScreenProps) {
  const { t } = useTranslation();
  const showWarning =
    emailError === null && emailWarning !== null && !emailWarningAcknowledged;

  const features = [
    {
      icon: <RiTimerFill className="w-5 h-5 text-primary" />,
      label: t("onboarding.smartBreaks"),
    },
    {
      icon: <RiComputerFill className="w-5 h-5 text-primary" />,
      label: t("onboarding.screenTime"),
    },
    {
      icon: <RiCheckboxCircleFill className="w-5 h-5 text-primary" />,
      label: `${t("onboarding.todoList")} · ${t("onboarding.todoSetupFree")}`,
    },
    {
      icon: <RiShieldFill className="w-5 h-5 text-primary" />,
      label: t("onboarding.openSource"),
    },
  ];

  return (
    <div className="flex flex-col items-center justify-between h-full text-center py-4">
      {/* Top Section */}
      <div className="flex flex-col items-center space-y-3">
        <h1 className="text-3xl font-heading font-bold leading-tight">
          {t("onboarding.welcomeTitle")}{" "}
          <span className="text-primary">{t("common.appName")}</span>
        </h1>
        <p className="text-sm text-foreground/50 font-heading">
          {t("onboarding.welcomeSubtitle")}
        </p>
      </div>

      {/* Logo */}
      <div className="my-2">
        <AnimatedEyeBlinkLogo />
      </div>

      {/* Feature Pills */}
      <div className="flex items-center justify-center flex-wrap gap-2 px-4">
        {features.map((f, i) => (
          <div
            key={i}
            className="flex items-center space-x-1.5 bg-foreground/5 border border-foreground/10 rounded-full px-3 py-1.5"
          >
            {f.icon}
            <span className="text-xs font-medium text-foreground/70 font-heading">
              {f.label}
            </span>
          </div>
        ))}
      </div>

      {/* Email Section - Pinned to bottom */}
      <div className="w-full max-w-sm space-y-2 mt-4">
        <div className="flex items-center justify-center space-x-1.5 text-xs text-foreground/50">
          <RiMailAddFill className="w-3.5 h-3.5 text-primary" />
          <span>{t("onboarding.emailNote")}</span>
        </div>
        <Input
          type="email"
          placeholder={t("onboarding.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={emailError !== null}
          aria-describedby={
            emailError
              ? "onboarding-email-error"
              : showWarning
                ? "onboarding-email-warning"
                : undefined
          }
          className={`text-center w-full ${
            emailError ? "border-destructive focus-visible:ring-destructive/40" : ""
          }`}
        />

        {emailError ? (
          <p
            id="onboarding-email-error"
            className="text-xs font-medium text-destructive"
            role="alert"
          >
            {emailError}
          </p>
        ) : showWarning ? (
          <div
            id="onboarding-email-warning"
            role="status"
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-left dark:border-amber-400/25 dark:bg-amber-400/10"
          >
            <div className="flex items-start gap-2">
              <RiErrorWarningFill className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-300">
                  {emailWarning}
                </p>
                <button
                  type="button"
                  onClick={onAcknowledgeWarning}
                  className="text-xs font-semibold text-amber-700 underline underline-offset-2 hover:text-amber-900 dark:text-amber-300 dark:hover:text-amber-200"
                >
                  {t("onboarding.emailCorrect")}
                </button>
              </div>
            </div>
          </div>
        ) : emailWarningAcknowledged ? (
          <p className="text-xs text-foreground/40">
            {t("onboarding.emailSaved")}
          </p>
        ) : (
          <p className="text-xs text-foreground/40">
            {t("onboarding.emailHint")}
          </p>
        )}
      </div>
    </div>
  );
}
