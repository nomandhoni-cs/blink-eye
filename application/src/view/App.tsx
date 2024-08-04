import "../view/App.css";
import Home from "./Home";
import { SystemTrayContext } from "../context";
import { useTauri } from "../hooks/setup";
import { type MenuItemOptions } from "@tauri-apps/api/menu";

const menuItems = [
  {
    id: "menuID",
    text: "item",
    action: async () => {
      console.log(`menu "item" clicked`);
    },
  },
] as MenuItemOptions[];

function App() {
  const tauriAPIs = useTauri(menuItems);

  return (
    <SystemTrayContext.Provider value={tauriAPIs}>
      <Home />
    </SystemTrayContext.Provider>
  );
}

export default App;
