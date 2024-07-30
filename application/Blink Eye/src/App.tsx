import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./index.css";
import { Button } from "./components/ui/button";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    setGreetMsg(await invoke("greet", { name }));
  }

  return (
    <div className="container">
      <h1 className="text-6xl">Blink Eye</h1>
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
        <Button type="submit">Hello</Button>
        <br />
      </form>

      <p className="text-black">{greetMsg}</p>
    </div>
  );
}

export default App;
