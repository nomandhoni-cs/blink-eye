import React, { useContext } from "react";
import "../view/App.css";
import { SystemTrayContext } from "../context";

export default function Home() {
  const { notifications } = useContext(SystemTrayContext);

  return (
    <div className="App">
      <header className="App-header">
        <p>Tauri Tray App</p>
        <p>
          <button
            type="button"
            onClick={() =>
              notifications.send({
                title: "Notification From Tauri",
                body: "This is a notification from Tauri!",
              })
            }
          >
            notify me about something!
          </button>
        </p>
      </header>
    </div>
  );
}
