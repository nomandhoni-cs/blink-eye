import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { enable, isEnabled, disable } from "@tauri-apps/plugin-autostart";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";

const appWindow = getCurrentWindow();

function App() {
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
  );
}

export default App;
