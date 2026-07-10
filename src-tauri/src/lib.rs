// use tauri_plugin_autostart::MacosLauncher;
use std::sync::Arc;
use tauri::Manager;
use tauri::{
    menu::{Menu, MenuItem},
    tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent},
};
use tokio::sync::mpsc;

mod crypto;
mod data_backup;
mod reminder_scheduler;
mod screen_time_tracker;
mod snooze_tracker;
use crypto::{
    ensure_install_data, get_config_bool, get_config_string, get_install_date,
    get_license_info, get_reminder_settings, get_trial_info,
    store_license_data, update_license_fields, update_reminder_setting,
};
use data_backup::{export_user_data, import_user_data};
use snooze_tracker::{get_break_stats, get_weekly_break_report};
use reminder_scheduler::{ReminderScheduler, TrayUpdate};
use screen_time_tracker::ScreenTimeTracker;

/// Simple greeting command for testing Tauri IPC.
///
/// # Parameters
/// - `name` — Name to greet
///
/// # Returns
/// Greeting string.
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

/// Check if the app was launched with `--minimized` argument.
///
/// Used by the frontend to decide whether to show the main window
/// or start minimized to tray.
///
/// # Returns
/// `"minimized"` or `"fullScreen"`.
#[tauri::command]
fn check_minimized_argument() -> String {
    if std::env::args().any(|arg| arg == "--minimized") {
        "minimized".to_string()
    } else {
        "fullScreen".to_string()
    }
}

/// Build the tray menu with the timer display.
fn build_tray_menu(
    app: &tauri::AppHandle,
    timer_text: &str,
) -> Result<Menu<tauri::Wry>, tauri::Error> {
    let timer_i = MenuItem::with_id(app, "timer", timer_text, false, None::<&str>)?;
    let separator = MenuItem::with_id(app, "separator", "─────────────", false, None::<&str>)?;
    let dashboard_i = MenuItem::with_id(app, "dashboard", "Dashboard", true, None::<&str>)?;
    let relaunch_i = MenuItem::with_id(app, "relaunch", "Relaunch", true, None::<&str>)?;
    let quit_i = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    Menu::with_items(app, &[&timer_i, &separator, &dashboard_i, &relaunch_i, &quit_i])
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
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
            {
              let _ = app.handle().plugin(tauri_plugin_global_shortcut::Builder::new().build());
            }
            #[cfg(desktop)]
            let _ = app.handle().plugin(tauri_plugin_updater::Builder::new().build());

            // Initialize Screen Time Tracker
            let app_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                let app_data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("Failed to get app data directory");

                std::fs::create_dir_all(&app_data_dir)
                    .expect("Failed to create app data directory");

                let db_path = app_data_dir.join("UserScreenTime.db");
                let db_url = format!("sqlite://{}", db_path.display());

                match ScreenTimeTracker::new(&db_url).await {
                    Ok(tracker) => {
                        println!("[ScreenTimeTracker] Initialized successfully");
                        tracker.start_tracking();
                    }
                    Err(e) => {
                        eprintln!("[ScreenTimeTracker] Failed to initialize: {}", e);
                    }
                }
            });

            // Initialize Reminder Scheduler
            let app_data_dir = app
                .path()
                .app_data_dir()
                .expect("Failed to get app data directory");
            std::fs::create_dir_all(&app_data_dir).expect("Failed to create app data directory");

            // Ensure install data exists (first-time setup: encrypts install date)
            {
                let handle = app.handle().clone();
                tauri::async_runtime::spawn(async move {
                    if let Err(e) = crypto::ensure_install_data(handle).await {
                        eprintln!("[Setup] Failed to ensure install data: {e}");
                    }
                });
            }

            // Create timer channel and scheduler
            let (tray_tx, mut tray_rx) = mpsc::channel::<TrayUpdate>(32);
            let reminder_scheduler = ReminderScheduler::new(app_data_dir, tray_tx);
            app.manage(reminder_scheduler.clone());
            reminder_scheduler.start(app.handle().clone());

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
            let initial_menu = build_tray_menu(app.handle(), "Next break in -- sec")?;
            let tray = TrayIconBuilder::new()
                .icon(app.default_window_icon().unwrap().clone())
                .on_tray_icon_event(|tray, event| match event {
                    TrayIconEvent::Click {
                        button: MouseButton::Left,
                        button_state: MouseButtonState::Up,
                        ..
                    } => {
                        // Show menu on left click so user can see the timer
                        tray.app_handle().tray_by_id("main").map(|t| {
                            let _ = t.app_handle().get_webview_window("main").map(|w| {
                                let _ = w.unminimize();
                                let _ = w.set_skip_taskbar(false);
                                let _ = w.set_focus();
                            });
                        });
                    }
                    _ => {}
                })
                .menu(&initial_menu)
                .show_menu_on_left_click(true)
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "quit" => {
                        app.exit(0);
                    }
                    "relaunch" => {
                        app.restart();
                    }
                    "dashboard" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.unminimize();
                            let _ = window.set_skip_taskbar(false);
                            let _ = window.set_focus();
                        }
                    }
                    _ => {}
                })
                .build(app)?;

            // Spawn tray menu update loop
            let app_handle = app.handle().clone();
            let tray = Arc::new(tokio::sync::Mutex::new(tray));
            tauri::async_runtime::spawn(async move {
                let mut last_displayed_secs: u64 = u64::MAX;
                let mut last_is_on_break: bool = false;

                while let Some(update) = tray_rx.recv().await {
                    // Only rebuild the menu when the displayed time changes meaningfully
                    let display_secs = (update.remaining_secs / 30) * 30; // round to nearest 30s
                    let state_changed = update.is_on_break != last_is_on_break;
                    let time_changed = display_secs != last_displayed_secs;

                    if !state_changed && !time_changed {
                        continue;
                    }

                    last_displayed_secs = display_secs;
                    last_is_on_break = update.is_on_break;

                    let timer_text = if update.is_on_break {
                        "Break in progress...".to_string()
                    } else if update.remaining_secs == 0 {
                        "Preparing break...".to_string()
                    } else {
                        let mins = update.remaining_secs / 60;
                        let secs = update.remaining_secs % 60;
                        match (mins, secs) {
                            (0, s) => format!("Next break in {s} sec"),
                            (m, 0) => format!("Next break in {m} min"),
                            (m, s) => format!("Next break in {m} min {s} sec"),
                        }
                    };

                    if let Ok(new_menu) = build_tray_menu(&app_handle, &timer_text) {
                        let tray = tray.lock().await;
                        let _ = tray.set_menu(Some(new_menu));
                    }
                }
            });

            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            check_minimized_argument,
            reminder_scheduler::skip_reminder,
            reminder_scheduler::refresh_reminder_scheduler_settings,
            reminder_scheduler::show_reminder_now,
            reminder_scheduler::get_next_reminder_info,
            ensure_install_data,
            get_install_date,
            get_license_info,
            get_config_bool,
            get_config_string,
            get_reminder_settings,
            get_trial_info,
            store_license_data,
            update_license_fields,
            update_reminder_setting,
            export_user_data,
            import_user_data,
            get_break_stats,
            get_weekly_break_report,
        ])
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
