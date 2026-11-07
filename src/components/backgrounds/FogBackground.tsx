import React from "react";

/** Colorful aurora fog banks bloom and drift behind the break controls. */
const FogBackground: React.FC = () => (
  <div className="fog-scene" aria-hidden="true">
    <div className="fog-starfield" />
    <div className="fog-moon" />
    <div className="fog-cloud fog-cloud-violet" />
    <div className="fog-cloud fog-cloud-cyan" />
    <div className="fog-cloud fog-cloud-pink" />
    <div className="fog-cloud fog-cloud-gold" />
    <div className="fog-curtain fog-curtain-one" />
    <div className="fog-curtain fog-curtain-two" />
    <div className="fog-depth" />
    <style>{`
      .fog-scene{position:fixed;inset:0;overflow:hidden;background:linear-gradient(180deg,#100c2b 0%,#20184b 45%,#101935 100%);isolation:isolate}
      .fog-starfield{position:absolute;inset:0;background-image:radial-gradient(circle,#fff 1px,transparent 1.8px),radial-gradient(circle,#8deaff 1px,transparent 1.6px);background-size:83px 83px,137px 137px;background-position:12px 9px,61px 42px;opacity:.42;mask-image:linear-gradient(to bottom,#000,transparent 84%)}
      .fog-moon{position:absolute;top:12%;right:19%;width:clamp(82px,12vw,170px);aspect-ratio:1;border-radius:50%;background:radial-gradient(circle at 34% 31%,#fff9dc,#ffa6e2 45%,rgba(255,113,224,.12) 72%);box-shadow:0 0 42px 8px rgba(255,89,209,.32),0 0 100px 32px rgba(106,114,255,.24);opacity:.88;animation:fog-moon-glow 6s ease-in-out infinite alternate}
      .fog-cloud{position:absolute;width:72vw;height:46vh;border-radius:50%;filter:blur(52px);mix-blend-mode:screen;opacity:.67;will-change:transform}
      .fog-cloud-violet{left:-25%;top:34%;background:radial-gradient(ellipse,#914eff 0%,rgba(116,44,255,.62) 35%,transparent 72%);animation:fog-drift-a 21s ease-in-out infinite alternate}
      .fog-cloud-cyan{right:-28%;top:27%;background:radial-gradient(ellipse,#22ecff 0%,rgba(25,150,255,.62) 35%,transparent 73%);animation:fog-drift-b 25s ease-in-out infinite alternate}
      .fog-cloud-pink{left:12%;bottom:-27%;background:radial-gradient(ellipse,#ff53a5 0%,rgba(238,64,160,.56) 34%,transparent 72%);animation:fog-drift-c 24s ease-in-out infinite alternate}
      .fog-cloud-gold{right:6%;bottom:-32%;width:53vw;background:radial-gradient(ellipse,#ffc84b 0%,rgba(255,104,77,.48) 36%,transparent 74%);animation:fog-drift-b 29s ease-in-out infinite alternate-reverse}
      .fog-curtain{position:absolute;top:22%;width:38vw;height:70vh;filter:blur(45px);opacity:.36;transform-origin:top center;background:linear-gradient(180deg,rgba(65,241,255,.55),rgba(171,79,255,.12) 55%,transparent);clip-path:polygon(35% 0,75% 0,100% 100%,0 100%);animation:fog-curtain-sway 11s ease-in-out infinite alternate}
      .fog-curtain-one{left:20%;transform:rotate(13deg)}.fog-curtain-two{right:18%;background:linear-gradient(180deg,rgba(255,97,217,.52),rgba(97,101,255,.18) 58%,transparent);transform:rotate(-14deg);animation-delay:-5s}
      .fog-depth{position:absolute;inset:0;background:radial-gradient(ellipse at 50% 46%,rgba(9,10,38,.02),rgba(7,9,30,.17) 53%,rgba(5,8,24,.54) 100%);pointer-events:none}
      @keyframes fog-drift-a{to{transform:translate(17vw,-8vh) scale(1.16)}}@keyframes fog-drift-b{to{transform:translate(-15vw,7vh) scale(.91)}}@keyframes fog-drift-c{to{transform:translate(9vw,-15vh) scale(1.2)}}@keyframes fog-curtain-sway{to{transform:rotate(5deg) scaleX(1.22);opacity:.58}}@keyframes fog-moon-glow{to{filter:brightness(1.22);box-shadow:0 0 58px 16px rgba(255,89,209,.42),0 0 125px 45px rgba(106,114,255,.32)}}
      @media(prefers-reduced-motion:reduce){.fog-scene *{animation:none!important}}
    `}</style>
  </div>
);

export default FogBackground;
