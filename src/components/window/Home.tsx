// import { useContext } from "react";
// import { SystemTrayContext } from "../../context";
import { Button } from "../ui/button";
import { sendNotification } from "@tauri-apps/plugin-notification";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";

const appWindow = getCurrentWindow();

export default function Home() {
  // const { notifications } = useContext(SystemTrayContext);
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");
  const [startupState, setStartupState] = useState("fullScreen");

  useEffect(() => {
    // Check if the app was launched with --minimized
    async function checkStartupState() {
      try {
        const result = await invoke<string>("check_minimized_argument");
        setStartupState(result); // Set the startup state to "minimized" or "full"
        console.log(`App startup state: ${result}`);
        if (result === "minimized") {
          appWindow.minimize(); // Minimize the window
        }
      } catch (error) {
        console.error("Error checking startup state:", error);
      }
    }
    checkStartupState();
  }, []);

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="App">
      <div className="container">
        <h1>Welcome to Tauri!</h1>
        {/* Display the startup state */}
        <p>App startup state: {startupState}</p>

        {/* Buttons for autostart */}
        <button
          onClick={async () => {
            await enable();
            console.log(`Autostart enabled: ${await isEnabled()}`);
          }}
        >
          Enable Autostart
        </button>
        <button
          onClick={async () => {
            await disable();
            console.log(`Autostart disabled: ${await isEnabled()}`);
          }}
        >
          Disable Autostart
        </button>

        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            greet();
          }}
        >
          <input
            id="greet-input"
            onChange={(e) => setName(e.currentTarget.value)}
            placeholder="Enter a name..."
          />
          <button type="submit">Greet</button>
        </form>

        <p>{greetMsg}</p>
      </div>
      <header className="App-header">
        <p>Tauri Tray App</p>
        <p>
          <Button
            type="button"
            onClick={() =>
              sendNotification({ title: "Tauri", body: "Tauri is awesome!" })
            }
          >
            notify me about something!
          </Button>
        </p>
      </header>
    </div>
  );
}
