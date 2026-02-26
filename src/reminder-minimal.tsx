import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { getCurrentWebviewWindow } from "@tauri-apps/api/webviewWindow";
import "./App.css";

// Import backgrounds
import { AuroraBackground } from "./components/backgrounds/Aurora";
import { BeamOfLife } from "./components/backgrounds/BeamOfLife";
import { FreeSpirit } from "./components/backgrounds/FreeSpirit";
import ShootingMeteor from "./components/backgrounds/ShootingMeteor";
import CanvasShapes from "./components/backgrounds/ParticleAnimation";
import ParticleBackground from "./components/backgrounds/ParticleBackground";
import PlainGradientAnimation from "./components/backgrounds/PlainGradientAnimation";
import DefaultBackground from "./components/backgrounds/DefaultBackground";
import StarryBackground from "./components/backgrounds/StarryBackground";
import { ThemeProvider } from "./components/ThemeProvider";

const MinimalReminder: React.FC = () => {
    // Read background style from URL parameter - single source of truth
    const params = new URLSearchParams(window.location.search);
    const backgroundStyle = params.get('style') || 'default';

    console.log('[MinimalReminder] URL:', window.location.href);
    console.log('[MinimalReminder] Search params:', window.location.search);
    console.log('[MinimalReminder] Received style from URL:', backgroundStyle);

    useEffect(() => {
        // Only listen for close signal
        const unlistenClose = listen("close-all-reminders", () => {
            console.log('[MinimalReminder] Received close-all-reminders event');
            getCurrentWebviewWindow().close();
        });

        return () => {
            unlistenClose.then((fn) => fn());
        };
    }, []);

    const renderBackground = () => {
        console.log('[MinimalReminder] Rendering background for style:', backgroundStyle);

        switch (backgroundStyle) {
            case "default":
                return <DefaultBackground />;
            case "aurora":
                return <AuroraBackground />;
            case "beamoflife":
                return <BeamOfLife />;
            case "freesprit":
                return <FreeSpirit />;
            case "canvasShapes":
                return <CanvasShapes shape="circle" speed={8} numberOfItems={60} />;
            case "particleBackground":
                return <ParticleBackground />;
            case "plainGradientAnimation":
                return <PlainGradientAnimation />;
            case "starryBackground":
                return <StarryBackground />;
            case "shootingmeteor":
                return <ShootingMeteor number={40} />;
            default:
                return <AuroraBackground />;
        }
    };

    return (
        <div className="relative h-screen w-screen overflow-hidden">
            {renderBackground()}
        </div>
    );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
            <MinimalReminder />
        </ThemeProvider>
    </React.StrictMode>
);
