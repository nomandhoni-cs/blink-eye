import { lazy, Suspense, useEffect, useState } from "react";

const ReminderOverlay = lazy(() => import("./ReminderOverlay"));

export function parseReminderWindowConfig(): {
  isPremium: boolean;
  minimal: boolean;
} {
  try {
    const params = new URLSearchParams(window.location.search);
    const minimal = params.get("minimal") === "true";
    const raw = params.get("config");
    const parsed = raw ? JSON.parse(raw) : {};
    return { isPremium: parsed.isPremium === true, minimal };
  } catch {
    return { isPremium: false, minimal: false };
  }
}

/**
 * Mounts the break overlay only after the background has painted.
 * The overlay chunk is lazy-loaded so it never blocks the entry bundle.
 */
export function DeferredReminderOverlay({
  isPremium,
}: {
  isPremium: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => setMounted(true));
    });
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, []);

  if (!mounted) return null;

  return (
    <Suspense fallback={null}>
      <ReminderOverlay isPremium={isPremium} />
    </Suspense>
  );
}
