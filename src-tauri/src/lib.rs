// use tauri_plugin_autostart::MacosLauncher;
use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn check_minimized_argument() -> String {
    // Check if the command-line argument --minimized was passed
    if std::env::args().any(|arg| arg == "--minimized") {
        "minimized".to_string()
    } else {
        "fullScreen".to_string()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                app.handle()
                    .plugin(tauri_plugin_autostart::init(
                        tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                        Some(vec!["--minimized"]),
                    ))
                    .expect("Failed to initialize autostart plugin");
            }
            #[cfg(desktop)]
            let _ = app.handle().plugin(tauri_plugin_updater::Builder::new().build());
            // Send Notification
             use tauri_plugin_notification::NotificationExt;
            app.notification()
                .builder()
                .icon("icons/icon.png")
                .large_icon("icons/icon.png")
                .title("Blink Eye")
                .body("Blink Eye has started running in the background and can be found on the system tray.")
                .show()
                .unwrap();
            // Create Tray Icon with menu
            let dashboard_i = MenuItem::with_id(app, "dashboard", "Dashboard", true, None::<&str>)?;
            let relaunch_i = MenuItem::with_id(app, "relaunch", "Relaunch", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&dashboard_i, &relaunch_i, &quit_i])?;
            let _tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        println!("left click pressed and released");
                        // in this example, let's show and focus the main window when the tray is clicked
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.set_skip_taskbar(false);
                            let _ = window.set_focus();
                            // print the window title
                            println!("window title: {}", window.title().unwrap());
                        }
                    }
                    _ => {
                        println!("unhandled event {event:?}");
                    }
                })
                .menu(&menu)
                .menu_on_left_click(false)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        println!("quit menu item was clicked");
                        app.exit(0);
                    }
                    "relaunch" => {
                        println!("quit menu item was clicked");
                        app.restart();
                    }
                    "dashboard" => {
                        // in this example, let's show and focus the main window when the tray is clicked
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.set_skip_taskbar(false);
                            let _ = window.set_focus();
                        }
                    }
                    _ => {
                        println!("menu item {:?} not handled", event.id);
                    }
                })
                .build(app)?;
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, check_minimized_argument])
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
