import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon, TrayIconEvent } from "@tauri-apps/api/tray";
import {
  LogicalPosition,
  LogicalSize,
  getCurrent,
} from "@tauri-apps/api/window";

export const setupTray = async ({ tooltip }: { tooltip?: string }) => {
  const action = async (event: TrayIconEvent) => {
    const { clickType } = event;
    const window = getCurrent();

    // The mini-pop-up window should automatically
    //  hide once you stop giving it focus
    await getCurrent().onFocusChanged(({ payload: focused }) => {
      if (!focused) window.hide();
    });

    if (clickType === "Right") {
      await window.hide();
    } else {
      console.log(event);
      await window.show();
      const size = new LogicalSize(300, 400);
      await window.setSize(size);
      const iconOffset = 30;
      const position = new LogicalPosition(
        event.position.x - size.width,
        event.position.y - size.height - iconOffset
      );
      const positioned = await window.setPosition(position);
      await window.setFocus();
    }
  };
  const tray = await TrayIcon.new({ id: "js_tray_icon", action });
  if (tooltip) tray.setTooltip(tooltip);
  await tray.setIcon("icons/icon.png");
  const menu = await Menu.new();
  await tray.setMenu(menu);
  return menu;
};
