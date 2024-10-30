// use tauri_plugin_autostart::MacosLauncher;

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
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, check_minimized_argument])
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
