import React from "react";

/** A vivid spectrum of animated light columns and lens-glow accents. */
const LightBeamsBackground: React.FC = () => (
  <div className="light-beams-scene" aria-hidden="true">
    <div className="beam-nebula beam-nebula-left" />
    <div className="beam-nebula beam-nebula-right" />
    <div className="beam-source" />
    <div className="beam-ray-field">
      {Array.from({ length: 17 }, (_, i) => (
        <i
          key={i}
          style={{
            left: `${31 + i * 2.4}%`,
            opacity: 0.38 + (i % 4) * 0.11,
            filter: `hue-rotate(${i * 31}deg)`,
            animationDuration: `${6 + (i % 7) * 1.1}s`,
            animationDelay: `${-i * 0.72}s`,
          }}
        />
      ))}
    </div>
    <div className="beam-spectrum-floor" />
    <div className="beam-shade" />
    <style>{`
      .light-beams-scene{position:fixed;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% -10%,#302166 0%,#111b42 48%,#080d22 100%);isolation:isolate}
      .beam-nebula{position:absolute;width:53vw;height:53vw;border-radius:50%;filter:blur(82px);mix-blend-mode:screen;opacity:.62;animation:beam-nebula-float 18s ease-in-out infinite alternate}
      .beam-nebula-left{left:-22%;top:-19%;background:radial-gradient(circle,#ff2ba6 0%,rgba(139,50,255,.62) 40%,transparent 72%)}
      .beam-nebula-right{right:-20%;top:-24%;background:radial-gradient(circle,#19dcff 0%,rgba(66,81,255,.65) 40%,transparent 72%);animation-delay:-8s}
      .beam-source{position:absolute;top:-42%;left:34%;width:34vw;height:57vh;border-radius:50%;background:radial-gradient(ellipse,#fff5c2 0%,rgba(255,178,76,.8) 12%,rgba(255,73,192,.38) 35%,transparent 74%);filter:blur(24px);animation:beam-source-pulse 5s ease-in-out infinite alternate}
      .beam-ray-field{position:absolute;inset:0;overflow:hidden;filter:blur(10px);mix-blend-mode:screen}
      .beam-ray-field i{position:absolute;top:-42%;height:150%;width:clamp(25px,5.3vw,86px);transform:rotate(22deg);transform-origin:top center;border-radius:0 0 50% 50%;background:linear-gradient(180deg,rgba(255,255,255,.95) 0%,rgba(255,206,86,.62) 12%,rgba(255,68,194,.34) 37%,rgba(84,95,255,.17) 66%,transparent 100%);animation-name:beam-sway;animation-timing-function:ease-in-out;animation-iteration-count:infinite;animation-direction:alternate;will-change:transform}
      .beam-ray-field i:nth-child(3n){width:clamp(18px,3.2vw,48px);filter:hue-rotate(80deg) brightness(1.5)}
      .beam-spectrum-floor{position:absolute;left:-20%;right:-20%;bottom:-35%;height:70%;background:conic-gradient(from 250deg at 50% 0%,transparent 0deg,rgba(255,54,168,.3) 33deg,rgba(85,74,255,.4) 78deg,rgba(27,220,255,.25) 120deg,transparent 170deg);filter:blur(50px);animation:beam-floor 19s ease-in-out infinite alternate}
      .beam-shade{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 30%,rgba(6,9,28,.02) 0%,rgba(5,8,24,.2) 55%,rgba(4,7,20,.58) 100%);pointer-events:none}
      @keyframes beam-sway{to{transform:rotate(31deg) scaleX(.65);opacity:.55}}@keyframes beam-source-pulse{to{transform:translate(8vw,8vh) scale(1.18);filter:blur(31px) brightness(1.2)}}@keyframes beam-floor{to{transform:rotate(-12deg) scale(1.16)}}@keyframes beam-nebula-float{to{transform:translate(11vw,9vh) scale(1.14)}}
      @media(prefers-reduced-motion:reduce){.light-beams-scene *{animation:none!important}}
    `}</style>
  </div>
);

export default LightBeamsBackground;
