import { useContext } from "react";
import "../view/App.css";
import { SystemTrayContext } from "../context";
import { Button } from "@/components/ui/button";
import { WebviewWindow } from "@tauri-apps/api/webviewWindow";

export default function Home() {
  const { notifications } = useContext(SystemTrayContext);

  return (
    <div className="App">
      <header className="App-header">
        <p className="text-3xl">Blink Eye</p>
        <p>
          <Button
            onClick={() =>
              notifications.send({
                title: "Blink Eye",
                body: "The started in the background and It can be found in the Tray.",
                icon: "icons/icon.ico",
              })
            }
          >
            notify me about something!
          </Button>
          <Button
            onClick={() => {
              const webview = new WebviewWindow("ReminderWindow", {
                url: "/dashboard",
                title: "Take A Break Reminder - Blink Eye",
              });
              webview.once("tauri://created", () => {
                console.log("Webview created");
              });
              webview.once("tauri://error", (e) => {
                console.error("Error creating webview:", e);
              });
            }}
          >
            Open Dashboard
          </Button>
        </p>
      </header>
    </div>
  );
}
