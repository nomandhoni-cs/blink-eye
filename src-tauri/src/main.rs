// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    // Workaround for WebKitGTK graphics failures on Linux (blank or frozen
    // window, "Error 71 (Protocol error) dispatching to Wayland display"),
    // most common on NVIDIA GPUs with Wayland compositors such as niri.
    // See tauri-apps/tauri#9394 and Tauri's "Linux Graphics Issues" docs.
    // Must run before any webview is created; a user-set value is respected.
    #[cfg(target_os = "linux")]
    if std::env::var_os("WEBKIT_DISABLE_DMABUF_RENDERER").is_none() {
        std::env::set_var("WEBKIT_DISABLE_DMABUF_RENDERER", "1");
    }

    blink_eye_lib::run()
}
