"use client";

import { useState, useEffect } from "react";

export type Platform = "mac" | "windows" | "linux" | "unknown";

export function usePlatform(): Platform {
  const [platform, setPlatform] = useState<Platform>("unknown");

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const plat = navigator.platform?.toLowerCase() || "";

    if (plat.includes("mac") || ua.includes("mac")) {
      setPlatform("mac");
    } else if (plat.includes("win") || ua.includes("win")) {
      setPlatform("windows");
    } else if (plat.includes("linux") || ua.includes("linux")) {
      setPlatform("linux");
    } else {
      setPlatform("unknown");
    }
  }, []);

  return platform;
}
