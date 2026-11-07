import type { CSSProperties } from "react";

type WebGLSceneFallbackProps = {
  scene: "darkVeil" | "dither" | "dotGrid" | "faultyTerminal" | "ferrofluid" | "floatingLines" | "galaxy" | "ballpit" | "acidSquares" | "antigravity" | "balatro" | "crtWarp" | "iridescence";
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
  faultyTerminal: (isDark) => ({
    backgroundColor: isDark ? "#06100a" : "#eff8f2",
    backgroundImage: isDark
      ? "repeating-linear-gradient(0deg, transparent 0 5px, rgba(98, 255, 155, .08) 6px), radial-gradient(ellipse at 50% 45%, rgba(32, 191, 105, .28), transparent 60%)"
      : "repeating-linear-gradient(0deg, transparent 0 5px, rgba(8, 119, 74, .07) 6px), radial-gradient(ellipse at 50% 45%, rgba(49, 176, 115, .2), transparent 60%)",
  }),
  ferrofluid: (isDark) => ({
    background: isDark
      ? "radial-gradient(ellipse at 42% 64%, rgba(255, 65, 172, .78), transparent 25%), radial-gradient(ellipse at 63% 48%, rgba(47, 198, 255, .66), transparent 32%), radial-gradient(ellipse at 35% 40%, rgba(128, 73, 255, .6), transparent 40%), #080a16"
      : "radial-gradient(ellipse at 42% 64%, rgba(198, 37, 131, .45), transparent 25%), radial-gradient(ellipse at 63% 48%, rgba(39, 123, 187, .34), transparent 32%), radial-gradient(ellipse at 35% 40%, rgba(112, 69, 197, .3), transparent 40%), #f6f6ff",
  }),
  floatingLines: (isDark) => ({
    background: isDark
      ? "radial-gradient(ellipse at 50% 110%, rgba(54, 223, 255, .38), transparent 56%), radial-gradient(ellipse at 46% 94%, transparent 40%, rgba(118, 85, 255, .38) 41%, transparent 42%), radial-gradient(ellipse at 55% 105%, transparent 48%, rgba(255, 61, 183, .34) 49%, transparent 50%), #080a1b"
      : "radial-gradient(ellipse at 50% 110%, rgba(22, 141, 183, .24), transparent 56%), radial-gradient(ellipse at 46% 94%, transparent 40%, rgba(98, 73, 214, .27) 41%, transparent 42%), radial-gradient(ellipse at 55% 105%, transparent 48%, rgba(197, 35, 145, .23) 49%, transparent 50%), #f6f7ff",
  }),
  galaxy: (isDark) => ({
    backgroundColor: isDark ? "#050818" : "#f0f3ff",
    backgroundImage: isDark
      ? "radial-gradient(1px 1px at 13% 22%, #c696ff 99%, transparent), radial-gradient(1px 1px at 78% 16%, #82efff 99%, transparent), radial-gradient(1.5px 1.5px at 55% 67%, #fff0a0 99%, transparent), radial-gradient(1px 1px at 34% 82%, #82efff 99%, transparent), radial-gradient(ellipse at 50% 48%, rgba(80, 59, 150, .35), transparent 62%)"
      : "radial-gradient(1px 1px at 13% 22%, #7140c5 99%, transparent), radial-gradient(1px 1px at 78% 16%, #2268b8 99%, transparent), radial-gradient(1.5px 1.5px at 55% 67%, #cd7a38 99%, transparent), radial-gradient(1px 1px at 34% 82%, #2268b8 99%, transparent), radial-gradient(ellipse at 50% 48%, rgba(139, 127, 207, .2), transparent 62%)",
  }),
  ballpit: (isDark) => ({
    backgroundColor: isDark ? "#080a1b" : "#f5f6ff",
    backgroundImage: isDark
      ? "radial-gradient(circle at 22% 38%, #ff3d9a 0 5%, transparent 5.5%), radial-gradient(circle at 48% 62%, #39dfff 0 7%, transparent 7.5%), radial-gradient(circle at 72% 35%, #ffd24a 0 6%, transparent 6.5%), radial-gradient(circle at 81% 73%, #8d72ff 0 8%, transparent 8.5%), radial-gradient(circle at 32% 80%, #8d72ff 0 4%, transparent 4.5%)"
      : "radial-gradient(circle at 22% 38%, #c9287b 0 5%, transparent 5.5%), radial-gradient(circle at 48% 62%, #188bbd 0 7%, transparent 7.5%), radial-gradient(circle at 72% 35%, #e59b25 0 6%, transparent 6.5%), radial-gradient(circle at 81% 73%, #654bcc 0 8%, transparent 8.5%), radial-gradient(circle at 32% 80%, #654bcc 0 4%, transparent 4.5%)",
  }),
  acidSquares: (isDark) => ({
    backgroundColor: isDark ? "#080a1b" : "#f5f6ff",
    backgroundImage: isDark
      ? "repeating-linear-gradient(45deg, transparent 0 22px, rgba(255, 79, 184, .6) 23px 24px, transparent 25px 46px), repeating-linear-gradient(-45deg, transparent 0 22px, rgba(59, 107, 255, .55) 23px 24px, transparent 25px 46px), radial-gradient(ellipse at center, #26153d, #080a1b 78%)"
      : "repeating-linear-gradient(45deg, transparent 0 22px, rgba(212, 45, 155, .42) 23px 24px, transparent 25px 46px), repeating-linear-gradient(-45deg, transparent 0 22px, rgba(51, 89, 200, .38) 23px 24px, transparent 25px 46px), radial-gradient(ellipse at center, #ffffff, #eef0ff 78%)",
  }),
  antigravity: (isDark) => ({
    backgroundColor: isDark ? "#080a1b" : "#f5f6ff",
    backgroundImage: isDark
      ? "radial-gradient(ellipse at 50% 50%, rgba(255, 92, 82, .45), transparent 38%), radial-gradient(ellipse at 53% 49%, rgba(255, 173, 66, .34), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(255, 111, 174, .24), transparent 65%)"
      : "radial-gradient(ellipse at 50% 50%, rgba(201, 60, 54, .28), transparent 38%), radial-gradient(ellipse at 53% 49%, rgba(226, 123, 36, .22), transparent 50%), radial-gradient(ellipse at 50% 50%, rgba(193, 74, 110, .18), transparent 65%)",
  }),
  balatro: (isDark) => ({
    backgroundColor: isDark ? "#100d24" : "#f3f4ff",
    backgroundImage: isDark
      ? "conic-gradient(from 30deg at 50% 50%, #ff3c8c, #130e2a, #17c9ff, #251043, #ff3c8c)"
      : "conic-gradient(from 30deg at 50% 50%, #d72670, #f3f4ff, #326ad8, #e7dfff, #d72670)",
  }),
  crtWarp: (isDark) => ({
    backgroundColor: isDark ? "#06120f" : "#eef4ff",
    backgroundImage: isDark
      ? "repeating-linear-gradient(0deg, transparent 0 3px, rgba(127, 255, 210, .11) 4px), radial-gradient(ellipse at 50% 50%, rgba(28, 133, 99, .4), transparent 70%)"
      : "repeating-linear-gradient(0deg, transparent 0 3px, rgba(36, 95, 199, .08) 4px), radial-gradient(ellipse at 50% 50%, rgba(77, 129, 220, .3), transparent 70%)",
  }),
  iridescence: (isDark) => ({
    backgroundColor: isDark ? "#0d1027" : "#f4f5ff",
    backgroundImage: isDark
      ? "radial-gradient(ellipse at 27% 55%, rgba(102, 90, 255, .58), transparent 45%), radial-gradient(ellipse at 72% 45%, rgba(255, 107, 193, .44), transparent 48%), radial-gradient(ellipse at 50% 84%, rgba(50, 213, 232, .28), transparent 44%)"
      : "radial-gradient(ellipse at 27% 55%, rgba(94, 139, 255, .36), transparent 45%), radial-gradient(ellipse at 72% 45%, rgba(232, 130, 172, .31), transparent 48%), radial-gradient(ellipse at 50% 84%, rgba(103, 193, 200, .24), transparent 44%)",
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
