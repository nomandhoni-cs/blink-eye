import React, { useContext } from "react";
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
                title: "Notification From Tauri",
                body: "This is a notification from Tauri!",
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
