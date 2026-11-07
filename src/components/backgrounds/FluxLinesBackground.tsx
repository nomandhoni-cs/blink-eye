import React from "react";

/** Bright, iridescent ribbons sweep through a deep chromatic field. */
const FluxLinesBackground: React.FC = () => (
  <div className="flux-scene" aria-hidden="true">
    <div className="flux-orb flux-orb-a" />
    <div className="flux-orb flux-orb-b" />
    <div className="flux-orb flux-orb-c" />
    <svg className="flux-ribbon-field" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="flux-rainbow" x1="0" y1="0" x2="1" y2=".3">
          <stop stopColor="#ff3dce" />
          <stop offset=".22" stopColor="#8558ff" />
          <stop offset=".48" stopColor="#32ddff" />
          <stop offset=".72" stopColor="#55ffd0" />
          <stop offset="1" stopColor="#ffe168" />
        </linearGradient>
        <filter id="flux-glow"><feGaussianBlur stdDeviation="8" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      {Array.from({ length: 17 }, (_, index) => {
        const y = 245 + index * 27;
        return <path className="flux-ribbon" key={index} style={{ animationDelay: `${-index * 0.43}s`, opacity: 0.24 + (index % 5) * 0.1 }} d={`M-120 ${y + 260} C 110 ${y - 250}, 380 ${y + 300}, 690 ${y + 5} S 1120 ${y - 230}, 1570 ${y + 80}`} />;
      })}
    </svg>
    <div className="flux-center-shade" />
    <style>{`
      .flux-scene{position:fixed;inset:0;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,#161b44 0%,#0b1029 58%,#070b1b 100%);isolation:isolate}
      .flux-orb{position:absolute;width:55vw;height:55vw;border-radius:50%;filter:blur(95px);mix-blend-mode:screen;opacity:.53;animation:flux-orb-drift 17s ease-in-out infinite alternate}
      .flux-orb-a{left:-18%;top:13%;background:radial-gradient(circle at 45% 45%,#ff29c4 0%,rgba(203,29,228,.7) 25%,transparent 69%)}
      .flux-orb-b{right:-14%;top:-16%;background:radial-gradient(circle at 40% 50%,#22caff 0%,rgba(39,112,255,.68) 29%,transparent 69%);animation-delay:-8s}
      .flux-orb-c{left:30%;bottom:-50%;background:radial-gradient(circle at 50% 50%,#ffb331 0%,rgba(255,66,131,.65) 30%,transparent 69%);animation-delay:-4s}
      .flux-ribbon-field{position:absolute;inset:-5%;width:110%;height:110%;filter:url(#flux-glow);mix-blend-mode:screen}
      .flux-ribbon{fill:none;stroke:url(#flux-rainbow);stroke-width:2.2;stroke-dasharray:12 24;animation:flux-flow 13s linear infinite;filter:drop-shadow(0 0 8px rgba(67,231,255,.7))}
      .flux-ribbon:nth-child(3n){stroke-width:3.4;animation-duration:19s}.flux-ribbon:nth-child(even){animation-direction:reverse}
      .flux-center-shade{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(9,13,34,.25) 0%,transparent 55%,rgba(4,7,20,.3) 100%);pointer-events:none}
      @keyframes flux-flow{to{stroke-dashoffset:-660}}@keyframes flux-orb-drift{to{transform:translate(11vw,-7vh) scale(1.18) rotate(16deg)}}
      @media(prefers-reduced-motion:reduce){.flux-scene *{animation:none!important}}
    `}</style>
  </div>
);

export default FluxLinesBackground;
