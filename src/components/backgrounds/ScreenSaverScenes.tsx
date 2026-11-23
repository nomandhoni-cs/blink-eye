import React from "react";
import { WebGLSceneFallback } from "./react-bits/WebGLSceneFallback";
import { useReminderDarkMode } from "./react-bits/useReminderDarkMode";

/**
 * The react-bits WebGL scenes, which were previously only reachable from the
 * per-theme reminder windows. Screen savers can now pick any of them, so the
 * scene rendering lives here and `ScreenSaverWindow` just names a style.
 *
 * Props mirror the values each scene uses in its reminder entry, so a theme
 * looks identical whether it plays as a break reminder or as a screen saver.
 * Each scene is lazy-loaded — they are WebGL canvases and would otherwise all
 * ship in the main bundle.
 */

const AcidSquares = React.lazy(() => import("./react-bits/AcidSquares"));
const Antigravity = React.lazy(() => import("./react-bits/Antigravity"));
const Balatro = React.lazy(() => import("./react-bits/Balatro"));
const Ballpit = React.lazy(() => import("./react-bits/Ballpit"));
const CRTWarp = React.lazy(() => import("./react-bits/CRTWarp"));
const DarkVeil = React.lazy(() => import("./react-bits/DarkVeil"));
const Dither = React.lazy(() => import("./react-bits/Dither"));
const DotGrid = React.lazy(() => import("./react-bits/DotGrid"));
const FaultyTerminal = React.lazy(() => import("./react-bits/FaultyTerminal"));
const Ferrofluid = React.lazy(() => import("./react-bits/Ferrofluid"));
const FloatingLines = React.lazy(() => import("./react-bits/FloatingLines"));
const Galaxy = React.lazy(() => import("./react-bits/Galaxy"));
const Iridescence = React.lazy(() => import("./react-bits/Iridescence"));

const FULLSCREEN: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  width: "100vw",
  height: "100vh",
};

export function ScreenSaverScene({ style }: { style: string }) {
  const isDark = useReminderDarkMode();
  const [rendererError, setRendererError] = React.useState<string | null>(null);
  const handleRendererError = React.useCallback(
    (reason: string) => setRendererError(reason),
    [],
  );

  // Backdrop behind the canvas. Scenes that paint their own background pass it
  // as a prop instead and use the shared dark/light fallback here.
  const backdrop =
    style === "iridescence"
      ? isDark
        ? "#0d1027"
        : "#f4f5ff"
      : style === "balatro"
        ? isDark
          ? "#100d24"
          : "#f3f4ff"
        : isDark
          ? "#080a1b"
          : "#f5f6ff";

  let scene: React.ReactNode = null;

  switch (style) {
    case "acidSquares":
      scene = (
        <AcidSquares
          color={isDark ? "#120f17" : "#f5f3ff"}
          accentColor={isDark ? "#ff4fb8" : "#d42d9b"}
          secondaryColor={isDark ? "#3b6bff" : "#3359c8"}
          tileSize={1.05}
          gap={0.12}
          roundness={0.28}
          softness={0.5}
          bulge={0.34}
          rotation={35}
          gloss={0.72}
          waves={1.1}
          speed={0.55}
          pulse={1}
          brightness={1.15}
          lighting="split"
          tilt={0.7}
          mouseInteraction
          mouseStrength={0.72}
          pulseOnClick
          detail="high"
          lightMode={!isDark}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "antigravity":
      scene = (
        <Antigravity
          count={1150}
          colors={
            isDark
              ? ["#ff5c52", "#ffad42", "#ffd166", "#ff6fae"]
              : ["#c93c36", "#e27b24", "#c14a6e", "#a85b16"]
          }
          colorMode="conic"
          colorSpeed={0.07}
          autoAnimate
          particleSize={0.85}
          particleShape="capsule"
          ringRadius={7.2}
          magnetRadius={9}
          waveSpeed={0.45}
          waveAmplitude={1.05}
          interactive
          clickBurst
          lightMode={!isDark}
          ambient={isDark ? 0.28 : 0.68}
          maxDevicePixelRatio={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "balatro":
      scene = (
        <Balatro
          color1={isDark ? "#ff3c8c" : "#d72670"}
          color2={isDark ? "#17c9ff" : "#326ad8"}
          color3={isDark ? "#130e2a" : "#f3f4ff"}
          contrast={isDark ? 3.3 : 2.35}
          lighting={0.72}
          swirl={0.38}
          speed={0.52}
          rotationSpeed={0.045}
          scale={1.08}
          detail={6}
          pixelSize={1.4}
          crt={0.08}
          mouseInteraction
          mouseStrength={0.65}
          clickSwirl
          maxDevicePixelRatio={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "ballpit":
      scene = (
        <Ballpit
          count={150}
          colors={
            isDark
              ? [0xff3d9a, 0x39dfff, 0xffd24a, 0x8d72ff]
              : [0xc9287b, 0x188bbd, 0xe59b25, 0x654bcc]
          }
          material="gloss"
          minSize={0.55}
          maxSize={1.05}
          gravity={0.32}
          friction={0.994}
          wallBounce={0.94}
          bounce={0.88}
          depth={2.4}
          drift={0.48}
          followCursor
          grab
          clickEffect="burst"
          lightColor={isDark ? "#fff0cb" : "#ffffff"}
          lightIntensity={1.25}
          exposure={isDark ? 1.05 : 0.92}
          shadows={0.5}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "crtWarp":
      scene = (
        <CRTWarp
          color={isDark ? "#7fffd2" : "#245fc7"}
          backgroundColor={isDark ? "#06120f" : "#eef4ff"}
          speed={0.44}
          variation={0.35}
          waveAmplitude={0.22}
          waveFrequency={0.9}
          levels={4}
          columns={40}
          persistence={0.65}
          curvature={0.16}
          corners={0.24}
          scanlineStrength={0.42}
          scanlineFrequency={1.1}
          mask="aperture"
          maskStrength={0.22}
          bloom={0.24}
          rgbShift={0.3}
          noise={0.18}
          flicker={0.08}
          interference={0.15}
          vignette={0.35}
          brightness={isDark ? 0.92 : 1.08}
          mouseReact
          changeOnClick
          lightMode={!isDark}
          fps={50}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "darkVeil":
      scene = (
        <DarkVeil
          color={isDark ? "#8a42ff" : "#4d78ef"}
          speed={0.42}
          scale={1.15}
          rotation={-12}
          flow={1.1}
          warp={0.18}
          variation={0.3}
          brightness={isDark ? 1.05 : 1.25}
          sheen={0.48}
          glow={0.72}
          grain={0.035}
          quality={0.55}
          dpr={1}
          mouseInteraction
          mouseStrength={0.65}
          lightMode={!isDark}
          fade={0.12}
          onRendererError={handleRendererError}
          style={{ ...FULLSCREEN, background: isDark ? "#080918" : "#eef2ff" }}
        />
      );
      break;
    case "dither":
      scene = (
        <Dither
          waveSpeed={0.055}
          waveFrequency={3.2}
          waveAmplitude={0.38}
          waveColor={isDark ? [0.22, 0.78, 1] : [0.2, 0.25, 0.72]}
          backgroundColor={
            isDark ? [0.018, 0.024, 0.075] : [0.94, 0.95, 1]
          }
          colorNum={5}
          pixelSize={2}
          enableMouseInteraction
          mouseRadius={1.15}
          ditherMode="bayer"
          scale={1.05}
          contrast={isDark ? 1.14 : 0.92}
          brightness={isDark ? 0.3 : 0.22}
          mouseEffect="ripple"
          mouseStrength={0.7}
          trail={0.45}
          clickRipple
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "dotGrid":
      scene = (
        <DotGrid
          dotSize={5}
          gap={19}
          baseColor={isDark ? "#51436f" : "#c4c4de"}
          activeColor={isDark ? "#66efff" : "#613ac7"}
          proximity={145}
          strength={1.05}
          bounce={0.72}
          tension={0.42}
          returnDuration={0.8}
          shockRadius={310}
          shockStrength={4.5}
          swell={0.84}
          stretch={0.6}
          glow={0.85}
          shape="circle"
          mouseInteraction
          clickShock
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "faultyTerminal":
      scene = (
        <FaultyTerminal
          scale={1.05}
          gridMul={[2, 1]}
          digitSize={1.15}
          timeScale={0.72}
          scanlineIntensity={0.34}
          glitchAmount={0.18}
          flickerAmount={0.12}
          noiseAmp={0.9}
          chromaticAberration={0.0015}
          dither={0.22}
          curvature={0.12}
          tint={isDark ? "#62ff9b" : "#08774a"}
          mouseReact
          mouseStrength={0.52}
          pageLoadAnimation
          brightness={isDark ? 0.72 : 1.16}
          glyphs="characters"
          glow={0.42}
          persistence={0.32}
          scramble={0.14}
          mouseGlow={0.4}
          vignette={0.32}
          clickEffect="glitch"
          lightMode={!isDark}
          dpr={1}
          onRendererError={handleRendererError}
          style={{ ...FULLSCREEN, background: isDark ? "#06100a" : "#eff8f2" }}
        />
      );
      break;
    case "ferrofluid":
      scene = (
        <Ferrofluid
          colors={
            isDark
              ? ["#ff4bb7", "#45caff", "#8e57ff"]
              : ["#b82583", "#277bbb", "#7045c5"]
          }
          speed={0.48}
          scale={1.5}
          spikeHeight={0.82}
          sharpness={2.6}
          turbulence={1.05}
          fluidity={0.58}
          tilt={48}
          magnetism={1.1}
          flowDirection="down"
          brightness={isDark ? 1.08 : 0.9}
          mouseInteraction
          mouseStrength={0.7}
          mouseRadius={0.25}
          clickPulse
          intro
          lightMode={!isDark}
          transparent={false}
          color={isDark ? "#080a16" : "#f6f6ff"}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "floatingLines":
      scene = (
        <FloatingLines
          linesGradient={
            isDark
              ? ["#ff3db7", "#7655ff", "#36dfff"]
              : ["#c52391", "#6249d6", "#168db7"]
          }
          lineCount={[8, 10, 12]}
          lineDistance={[6, 5, 4]}
          animationSpeed={0.78}
          amplitude={1.15}
          lineWidth={1.25}
          glow={1.2}
          brightness={isDark ? 1.15 : 0.92}
          depthOfField={0.62}
          edgeFade={0.16}
          interactive
          bendRadius={5.3}
          bendStrength={-0.48}
          parallax
          clickSwirl
          intro
          lightMode={!isDark}
          backgroundColor={isDark ? "#080a1b" : "#f6f7ff"}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "galaxy":
      scene = (
        <Galaxy
          focal={[0.5, 0.5]}
          rotation={[1, 0]}
          starSpeed={0.52}
          density={1.08}
          hueShift={isDark ? 185 : 225}
          speed={0.8}
          mouseInteraction
          glowIntensity={0.38}
          saturation={isDark ? 0.65 : 0.85}
          mouseRepulsion
          repulsionStrength={2.4}
          twinkleIntensity={0.45}
          rotationSpeed={0.12}
          transparent={false}
          lightMode={!isDark}
          starColors={
            isDark
              ? ["#82efff", "#c696ff", "#fff0a0"]
              : ["#2268b8", "#7140c5", "#cd7a38"]
          }
          starSize={1.15}
          flareIntensity={0.85}
          layers={4}
          clickWarp
          intro
          backgroundColor={isDark ? "#050818" : "#f0f3ff"}
          dpr={1}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    case "iridescence":
      scene = (
        <Iridescence
          color={isDark ? [0.74, 0.68, 1] : [1, 0.94, 0.79]}
          hueShift={isDark ? 28 : -18}
          saturation={1.28}
          brightness={isDark ? 1.45 : 1.42}
          contrast={isDark ? 1.2 : 0.82}
          speed={0.72}
          scale={1.08}
          detail={9}
          warp={1.25}
          mouseReact
          amplitude={0.08}
          stir={0.58}
          sheen={0.55}
          clickSwirl
          grain={0.025}
          resolution={0.8}
          onRendererError={handleRendererError}
          style={FULLSCREEN}
        />
      );
      break;
    default:
      scene = null;
  }

  return (
    <div
      className="relative h-screen w-screen overflow-hidden"
      style={{ background: backdrop }}
    >
      {scene}
      {rendererError && (
        <WebGLSceneFallback
          scene={style as React.ComponentProps<typeof WebGLSceneFallback>["scene"]}
          isDark={isDark}
        />
      )}
    </div>
  );
}
