import { currentMonitor } from "@tauri-apps/api/window";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { Button } from "./ui/button";

const BeforeAlert = () => {
  return (
    <Button
      onClick={async () => {
        const monitor = await currentMonitor();
        const windowWidth = 320;
        const windowHeight = 80;

        // // Calculate position for bottom center
        // const x = monitor
        //   ? Math.round((monitor.size.width - windowWidth) / 2) +
        //     monitor.position.x
        //   : 0;
        // const y = monitor
        //   ? monitor.size.height - windowHeight - 20 + monitor.position.y // 20px from bottom
        //   : 0;
        const x = monitor
          ? Math.round((monitor.size.width - windowWidth) / 2) +
            monitor.position.x
          : 0;
        const y = monitor
          ? monitor.position.y + 80 // 20px from top
          : 0;
        const webview = new WebviewWindow("before_alert", {
          url: `/alert.html`,
          title: "Test Window - Blink Eye",
          transparent: true,
          shadow: false,
          alwaysOnTop: true,
          skipTaskbar: true,
          focus: false,
          height: windowHeight,
          width: windowWidth,
          decorations: false,
          resizable: false,
          x,
          y,
        });
        webview.once("tauri://created", () => {
          console.log("Test window created");
        });
        webview.once("tauri://error", (e) => {
          console.error("Error creating test window:", e);
        });
      }}
    >
      Test Window
    </Button>
  );
};

export default BeforeAlert;
