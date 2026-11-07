import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { ThemeProvider } from "./components/ThemeProvider";
import Iridescence from "./components/backgrounds/react-bits/Iridescence";
import {
  DeferredReminderOverlay,
  parseReminderWindowConfig,
} from "./components/reminder/DeferredReminderOverlay";

const ReminderIridescence: React.FC = () => {
  const { isPremium, minimal } = parseReminderWindowConfig();
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative h-screen w-screen overflow-hidden bg-[#100e29]">
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,#654fff_0%,#10102b_75%)]" />
        <Iridescence
          color="#c8eaff"
          hueShift={12}
          saturation={1.35}
          brightness={1.65}
          contrast={1.08}
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
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
        />
        {!minimal && <DeferredReminderOverlay isPremium={isPremium} />}
      </div>
    </ThemeProvider>
  );
};

export default ReminderIridescence;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ReminderIridescence />
  </React.StrictMode>,
);
