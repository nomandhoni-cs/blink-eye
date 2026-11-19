//! Small IPC commands that do not belong to a feature module.

/// Simple greeting command for testing Tauri IPC.
///
/// # Parameters
/// - `name` — Name to greet
///
/// # Returns
/// Greeting string.
#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Checks whether the app was launched with the `--minimized` argument.
///
/// The frontend uses this to decide whether to show the main window or start
/// minimized to the tray.
///
/// # Returns
/// `"minimized"` or `"fullScreen"`.
#[tauri::command]
pub fn check_minimized_argument() -> String {
    if std::env::args().any(|arg| arg == "--minimized") {
        "minimized".to_string()
    } else {
        "fullScreen".to_string()
    }
}
