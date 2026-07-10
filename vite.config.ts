import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

const host = process.env.TAURI_DEV_HOST;

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
  //
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        alert: "alert.html",
        // Per-background entries (each ships only its own background JS).
        // Add a new style: 1) drop one HTML/TSX pair  2) append to registry.ts
        // 3) add an "input" row here.
        "reminder-default": "reminder-default.html",
        "reminder-aurora": "reminder-aurora.html",
        "reminder-freesprit": "reminder-freesprit.html",
        "reminder-beamoflife": "reminder-beamoflife.html",
        "reminder-particles": "reminder-particles.html",
        "reminder-starry": "reminder-starry.html",
        "reminder-meteor": "reminder-meteor.html",
        "reminder-gradient": "reminder-gradient.html",
        "reminder-canvas": "reminder-canvas.html",
      },
    },
  },
  // 1. prevent vite from obscuring rust errors
  clearScreen: false,
  // 2. tauri expects a fixed port, fail if that port is not available
  server: {
    port: 1420,
    strictPort: true,
    host: host || false,
    hmr: host
      ? {
          protocol: "ws",
          host,
          port: 1421,
        }
      : undefined,
    watch: {
      // 3. tell vite to ignore watching `src-tauri`
      ignored: ["**/src-tauri/**"],
    },
  },
}));
