import React from "react";

/** A responsive neon tile field that sparkles in traveling color waves. */
const DotGridBackground: React.FC = () => (
  <div className="dot-grid-scene" aria-hidden="true">
    <div className="dot-grid-bloom dot-grid-bloom-a" />
    <div className="dot-grid-bloom dot-grid-bloom-b" />
    <div className="dot-grid-tiles">
      {Array.from({ length: 240 }, (_, index) => (
        <i
          className="dot-grid-tile"
          key={index}
          style={{
            "--tile-hue": `${(index * 47 + Math.floor(index / 20) * 11) % 360}`,
            animationDelay: `${-((index * 7) % 48) / 10}s`,
          } as React.CSSProperties}
        />
      ))}
    </div>
    <div className="dot-grid-shade" />
    <style>{`
      .dot-grid-scene{position:fixed;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 45%,#17244a,#0a1024 74%);isolation:isolate}
      .dot-grid-bloom{position:absolute;width:56vw;height:56vw;border-radius:50%;filter:blur(76px);mix-blend-mode:screen;opacity:.58;animation:grid-bloom 14s ease-in-out infinite alternate}
      .dot-grid-bloom-a{left:-22%;top:-36%;background:radial-gradient(circle,#ff35b9 0%,rgba(124,53,255,.6) 42%,transparent 70%)}
      .dot-grid-bloom-b{right:-20%;bottom:-45%;background:radial-gradient(circle,#15dbff 0%,rgba(47,103,255,.64) 42%,transparent 70%);animation-delay:-7s}
      .dot-grid-tiles{position:absolute;inset:-2%;display:grid;grid-template-columns:repeat(20,minmax(18px,1fr));grid-template-rows:repeat(12,minmax(18px,1fr));gap:clamp(6px,1.25vw,19px);padding:clamp(14px,3vw,42px);transform:perspective(900px) rotateX(9deg) scale(1.08)}
      .dot-grid-tile{position:relative;display:block;align-self:center;justify-self:center;width:clamp(4px,.72vw,10px);aspect-ratio:1;border-radius:50%;background:hsl(var(--tile-hue) 100% 67%);opacity:.34;box-shadow:0 0 7px hsl(var(--tile-hue) 100% 60% / .65);animation:tile-pulse 4.8s ease-in-out infinite alternate;will-change:transform,opacity}
      .dot-grid-tile:nth-child(7n){width:clamp(6px,1vw,14px);filter:brightness(1.4)}
      .dot-grid-tile:nth-child(11n){animation-duration:6.1s}
      .dot-grid-shade{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(5,8,25,.08) 5%,rgba(5,8,25,.16) 48%,rgba(4,7,19,.62) 100%);pointer-events:none}
      @keyframes tile-pulse{0%{transform:scale(.65);opacity:.18;filter:saturate(.7)}55%{transform:scale(1.55);opacity:.96;filter:saturate(1.5) brightness(1.35)}100%{transform:scale(.85);opacity:.35}}
      @keyframes grid-bloom{to{transform:translate(18vw,13vh) scale(1.22)}}
      @media(max-width:520px){.dot-grid-tiles{grid-template-columns:repeat(14,minmax(12px,1fr));grid-template-rows:repeat(12,minmax(12px,1fr));gap:9px}.dot-grid-tile:nth-child(n+169){display:none}}
      @media(prefers-reduced-motion:reduce){.dot-grid-scene *{animation:none!important}}
    `}</style>
  </div>
);

export default DotGridBackground;
