#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
  tauri::Builder::default()
    .plugin(tauri_plugin_notification::init())
    .plugin(tauri_plugin_global_shortcut::Builder::new().build())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
