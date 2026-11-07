import React from "react";

/** A saturated, slowly folding color field with glossy spectrum highlights. */
const MeshGradientBackground: React.FC = () => (
  <div className="mesh-scene" aria-hidden="true">
    <div className="mesh-blob mesh-blob-a" />
    <div className="mesh-blob mesh-blob-b" />
    <div className="mesh-blob mesh-blob-c" />
    <div className="mesh-blob mesh-blob-d" />
    <div className="mesh-spectrum" />
    <div className="mesh-glint" />
    <div className="mesh-vignette" />
    <style>{`
      .mesh-scene{position:fixed;inset:0;overflow:hidden;background:#080d26;isolation:isolate}
      .mesh-blob{position:absolute;width:68vw;height:68vw;border-radius:50%;filter:blur(68px);mix-blend-mode:screen;opacity:.88;will-change:transform}
      .mesh-blob-a{background:radial-gradient(circle at 36% 36%,#ff438f 0%,#ed2475 20%,#9f32ed 44%,transparent 70%);top:-42%;left:-20%;animation:mesh-roll-a 20s ease-in-out infinite alternate}
      .mesh-blob-b{background:radial-gradient(circle at 42% 40%,#13e5ff 0%,#2582ff 28%,#5534ec 54%,transparent 72%);right:-27%;top:-21%;animation:mesh-roll-b 24s ease-in-out infinite alternate}
      .mesh-blob-c{background:radial-gradient(circle at 48% 42%,#fff044 0%,#ff8b32 22%,#ff3869 48%,transparent 72%);bottom:-58%;left:18%;animation:mesh-roll-c 26s ease-in-out infinite alternate}
      .mesh-blob-d{background:radial-gradient(circle at 42% 45%,#31ffc3 0%,#08b9d8 27%,#365aff 55%,transparent 73%);right:18%;bottom:-57%;width:58vw;height:58vw;animation:mesh-roll-d 23s ease-in-out infinite alternate}
      .mesh-spectrum{position:absolute;inset:-50%;background:conic-gradient(from 90deg at 50% 50%,rgba(255,47,167,.4),rgba(45,227,255,.28),rgba(255,239,76,.32),rgba(157,67,255,.38),rgba(255,47,167,.4));mix-blend-mode:color-dodge;opacity:.44;filter:blur(48px);animation:mesh-spectrum-spin 40s linear infinite}
      .mesh-glint{position:absolute;inset:0;background:linear-gradient(122deg,transparent 20%,rgba(255,255,255,.09) 44%,transparent 47%),radial-gradient(ellipse at center,transparent 20%,rgba(4,8,29,.28) 100%);mix-blend-mode:screen}
      .mesh-vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(7,10,30,.06) 0%,rgba(7,10,30,.15) 55%,rgba(4,7,20,.55) 100%)}
      @keyframes mesh-roll-a{to{transform:translate(27vw,18vh) scale(1.18) rotate(17deg)}}@keyframes mesh-roll-b{to{transform:translate(-21vw,24vh) scale(.9) rotate(-15deg)}}@keyframes mesh-roll-c{to{transform:translate(15vw,-24vh) scale(1.13)}}@keyframes mesh-roll-d{to{transform:translate(-16vw,-20vh) scale(1.1) rotate(12deg)}}@keyframes mesh-spectrum-spin{to{transform:rotate(360deg) scale(1.12)}}
      @media(prefers-reduced-motion:reduce){.mesh-scene *{animation:none!important}}
    `}</style>
  </div>
);

export default MeshGradientBackground;
