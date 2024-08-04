import { register } from "@tauri-apps/plugin-global-shortcut";
import { getCurrentWindow } from "@tauri-apps/api/window";

export const setupGlobalShortcuts = async () => {
  // command shortcuts are a combination
  //   of modifiers and one key code
  // list of modifiers:
  //   - https://docs.rs/global-hotkey/0.2.1/global_hotkey/hotkey/struct.Modifiers.html
  //   - based on this spec: https://w3c.github.io/uievents-key/#keys-modifier
  // list of key codes: https://docs.rs/global-hotkey/0.2.1/global_hotkey/hotkey/enum.Code.html

  const window = getCurrentWindow();

  await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
    if (!focused) window.hide();
  });

  await register("Ctrl+Alt+Space", async () => {
    console.log("Shortcut triggered");
    const window = getCurrentWindow();
    // uses the default window size and centers
    await window.center();
    await window.show();
    await window.setFocus();
  });
};
