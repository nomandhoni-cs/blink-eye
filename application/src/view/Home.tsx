import { useContext } from "react";
import "../view/App.css";
import { SystemTrayContext } from "../context";
import { Button } from "@/components/ui/button";

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
        </p>
      </header>
    </div>
  );
}
