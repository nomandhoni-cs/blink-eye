#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri_plugin_autostart::MacosLauncher;
fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_autostart::init(
      MacosLauncher::LaunchAgent,
      Some(vec!["--flag1", "--flag2"]), /* arbitrary number of args to pass to your app */
    ))
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
