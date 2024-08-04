import { Menu } from "@tauri-apps/api/menu";
import { TrayIcon, TrayIconEvent } from "@tauri-apps/api/tray";
import {
  LogicalPosition,
  LogicalSize,
  getCurrentWindow,
} from "@tauri-apps/api/window";

export const setupTray = async ({ tooltip }: { tooltip?: string }) => {
  const action = async (event: TrayIconEvent) => {
    const { click } = event;
    const window = getCurrentWindow();

    // The mini-pop-up window should automatically
    //  hide once you stop giving it focus
    await getCurrentWindow().onFocusChanged(({ payload: focused }) => {
      if (!focused) window.hide();
    });

    if (click.button === "Right") {
      await window.hide();
    } else if (click.button === "Left") {
      console.log(click);
      await window.show();
      const size = new LogicalSize(400, 600);
      await window.setSize(size);
      const iconOffset = 40;
      const position = new LogicalPosition(
        click.position.x - size.width,
        click.position.y - size.height - iconOffset
      );
      console.log(position);
      await window.setPosition(position);
      await window.setFocus();
    }
  };
  const tray = await TrayIcon.new({ id: "main", action });
  if (tooltip) tray.setTooltip(tooltip);
  await tray.setIcon("icons/icon.ico");
  const menu = await Menu.new();
  await tray.setMenu(menu);
  return menu;
};
