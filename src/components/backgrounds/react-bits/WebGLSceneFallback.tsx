import type { CSSProperties } from "react";

type WebGLSceneFallbackProps = {
  scene: "darkVeil" | "dither" | "dotGrid";
  isDark: boolean;
};

const sceneStyles: Record<WebGLSceneFallbackProps["scene"], (isDark: boolean) => CSSProperties> = {
  darkVeil: (isDark) => ({
    background: isDark
      ? "radial-gradient(ellipse at 28% 34%, rgba(119, 64, 255, .64), transparent 48%), radial-gradient(ellipse at 74% 68%, rgba(38, 164, 255, .34), transparent 45%), linear-gradient(135deg, #080918, #11102a 54%, #080918)"
      : "radial-gradient(ellipse at 28% 34%, rgba(78, 105, 239, .38), transparent 48%), radial-gradient(ellipse at 74% 68%, rgba(49, 180, 220, .24), transparent 45%), linear-gradient(135deg, #eef2ff, #ffffff 54%, #e9edff)",
  }),
  dither: (isDark) => ({
    backgroundColor: isDark ? "#080a1b" : "#f5f6ff",
    backgroundImage: isDark
      ? "radial-gradient(circle, rgba(78, 203, 255, .72) 1px, transparent 1.5px), linear-gradient(135deg, #080a1b, #17113b 55%, #08182a)"
      : "radial-gradient(circle, rgba(78, 98, 205, .62) 1px, transparent 1.5px), linear-gradient(135deg, #eef2ff, #ffffff 55%, #e7f2ff)",
    backgroundSize: "7px 7px, cover",
    backgroundPosition: "center, center",
  }),
  dotGrid: (isDark) => ({
    backgroundColor: isDark ? "#080a1b" : "#f5f6ff",
    backgroundImage: `radial-gradient(circle, ${isDark ? "rgba(119, 101, 157, .82)" : "rgba(83, 63, 157, .48)"} 2px, transparent 2.5px)`,
    backgroundSize: "24px 24px",
    backgroundPosition: "center",
  }),
};

/** Visible only when the platform cannot initialize the scene's WebGL renderer. */
export function WebGLSceneFallback({ scene, isDark }: WebGLSceneFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[1]"
      style={sceneStyles[scene](isDark)}
    />
  );
}
