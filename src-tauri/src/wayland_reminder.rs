//! Main-thread GTK3 presentation. Only plain session IDs cross the async boundary.
use std::{cell::RefCell, sync::Arc};

use gdk::prelude::*;
use gtk::{glib, prelude::*};
use tauri::{AppHandle, Manager, WebviewUrl, WebviewWindow, WebviewWindowBuilder};

use crate::reminder_scheduler::{
    install_window_guards, reminder_label, reminder_url, FinishReason, ReminderKind,
    ReminderScheduler, ReminderWindowConfig,
};

thread_local! {
    static PRESENTATION: RefCell<Option<Presentation>> = const { RefCell::new(None) };
}

struct OutputWindow {
    monitor: gdk::Monitor,
    window: WebviewWindow,
    native: gtk::ApplicationWindow,
    window_signals: Vec<glib::SignalHandlerId>,
    monitor_signals: Vec<glib::SignalHandlerId>,
    session_id: u64,
}

impl Drop for OutputWindow {
    fn drop(&mut self) {
        for signal in self.window_signals.drain(..) {
            self.native.disconnect(signal);
        }
        for signal in self.monitor_signals.drain(..) {
            self.monitor.disconnect(signal);
        }
        let scheduler = self.window.app_handle().state::<Arc<ReminderScheduler>>();
        if let Err(error) = scheduler.remove_window(self.session_id, self.window.label()) {
            eprintln!("[Reminder] Output detach failed: {error}");
        }
        if self
            .window
            .app_handle()
            .get_webview_window(self.window.label())
            .is_some()
        {
            if let Err(error) = self.window.destroy() {
                eprintln!("[Reminder] Output destruction failed: {error}");
            }
        }
    }
}

struct Presentation {
    app: AppHandle,
    display: gdk::Display,
    screen: gdk::Screen,
    config: ReminderWindowConfig,
    all_outputs: bool,
    windows: Vec<OutputWindow>,
    controls: Option<gdk::Monitor>,
    next_window: usize,
    display_signals: Vec<glib::SignalHandlerId>,
    screen_signal: Option<glib::SignalHandlerId>,
    seat: Option<gdk::Seat>,
    focused: Option<String>,
}

impl Drop for Presentation {
    fn drop(&mut self) {
        self.release_keyboard();
        for signal in self.display_signals.drain(..) {
            self.display.disconnect(signal);
        }
        if let Some(signal) = self.screen_signal.take() {
            self.screen.disconnect(signal);
        }
        // OutputWindow's Drop disconnects callbacks before destroying the surface.
    }
}

/// Actual backend detection, not an inference from WAYLAND_DISPLAY/GDK_BACKEND.
pub(crate) fn is_wayland() -> bool {
    gdk::Display::default().is_some_and(|display| display.type_().name() == "GdkWaylandDisplay")
}

pub(crate) fn open(
    app: &AppHandle,
    config: &ReminderWindowConfig,
    all_outputs: bool,
) -> Result<(), String> {
    let display = gdk::Display::default().ok_or("No GDK display.")?;
    let screen = gdk::Screen::default().ok_or("No GDK screen.")?;
    let mut presentation = Presentation {
        app: app.clone(),
        display,
        screen,
        config: config.clone(),
        all_outputs,
        windows: Vec::new(),
        controls: None,
        next_window: 0,
        display_signals: Vec::new(),
        screen_signal: None,
        seat: None,
        focused: None,
    };
    presentation.reconcile()?;
    let id = config.session_id;
    let handle = app.clone();
    presentation
        .display_signals
        .push(presentation.display.connect_monitor_added(move |_, _| {
            queue_reconcile(&handle, id);
        }));
    let handle = app.clone();
    presentation
        .display_signals
        .push(presentation.display.connect_monitor_removed(move |_, _| {
            queue_reconcile(&handle, id);
        }));
    let handle = app.clone();
    presentation.screen_signal = Some(presentation.screen.connect_monitors_changed(move |_| {
        queue_reconcile(&handle, id);
    }));
    eprintln!(
        "[Reminder] backend=wayland-gtk3 outputs={}",
        presentation.windows.len()
    );
    let previous = PRESENTATION.with(|slot| slot.replace(Some(presentation)));
    drop(previous);
    queue_focus(id);
    Ok(())
}

/// Generation-scoped teardown cannot remove a replacement session.
pub(crate) fn close(id: u64) {
    let presentation = PRESENTATION.with(|slot| {
        let mut slot = slot.borrow_mut();
        if slot
            .as_ref()
            .is_some_and(|current| current.config.session_id == id)
        {
            slot.take()
        } else {
            None
        }
    });
    drop(presentation);
}

pub(crate) fn shutdown() {
    let presentation = PRESENTATION.with(|slot| slot.borrow_mut().take());
    drop(presentation);
}

fn select_outputs<T: Clone + Eq>(outputs: &[T], primary: Option<&T>, all: bool) -> Vec<T> {
    let mut selected = outputs.to_vec();
    if let Some(index) =
        primary.and_then(|primary| selected.iter().position(|output| output == primary))
    {
        selected.swap(0, index);
    }
    if !all {
        selected.truncate(1);
    }
    selected
}

impl Presentation {
    fn reconcile(&mut self) -> Result<(), String> {
        let outputs: Vec<_> = (0..self.display.n_monitors())
            .filter_map(|index| self.display.monitor(index))
            .collect();
        let selected = select_outputs(
            &outputs,
            self.display.primary_monitor().as_ref(),
            self.all_outputs,
        );
        if selected.is_empty() {
            return Err("All reminder outputs disconnected.".into());
        }
        // Preserve the control output while it survives. An added output must not steal focus.
        let controls = self
            .controls
            .as_ref()
            .filter(|monitor| selected.contains(monitor))
            .cloned()
            .unwrap_or_else(|| selected[0].clone());
        let promote = self.controls.as_ref() != Some(&controls);
        let removed = self
            .windows
            .iter()
            .filter(|entry| !selected.contains(&entry.monitor))
            .map(|entry| entry.window.label());
        if clear_removed_focus(&mut self.focused, removed) {
            self.release_keyboard();
        }
        self.windows
            .retain(|entry| selected.contains(&entry.monitor));
        for monitor in &selected {
            let index = outputs
                .iter()
                .position(|output| output == monitor)
                .and_then(|index| i32::try_from(index).ok())
                .ok_or("Output disappeared.")?;
            if let Some(entry) = self.windows.iter().find(|entry| &entry.monitor == monitor) {
                entry.native.fullscreen_on_monitor(&self.screen, index);
            } else {
                let entry = self.create_window(monitor, index, monitor == &controls)?;
                self.windows.push(entry);
            }
        }
        if promote {
            if let Some(entry) = self.windows.iter().find(|entry| entry.monitor == controls) {
                self.app
                    .state::<Arc<ReminderScheduler>>()
                    .promote_controls(self.config.session_id, entry.window.label())?;
                entry.native.present();
            }
        }
        self.controls = Some(controls);
        Ok(())
    }

    fn create_window(
        &mut self,
        monitor: &gdk::Monitor,
        index: i32,
        controls: bool,
    ) -> Result<OutputWindow, String> {
        let id = self.config.session_id;
        let label = reminder_label(&self.config, self.next_window);
        self.next_window += 1;
        let url = reminder_url(&self.config, &self.config.background_style)?;
        let scheduler = self.app.state::<Arc<ReminderScheduler>>();
        let window = WebviewWindowBuilder::new(&self.app, &label, WebviewUrl::App(url.into()))
            .title(if self.config.kind == ReminderKind::Preview {
                "Preview - Blink Eye"
            } else {
                "Take A Break Reminder - Blink Eye"
            })
            .decorations(false)
            .skip_taskbar(true)
            .visible(false)
            .focused(false)
            .build()
            .map_err(|error| error.to_string())?;
        if let Err(error) = install_window_guards(&window, id, self.config.kind)
            .and_then(|()| scheduler.register_window(id, &label, controls))
        {
            if let Err(cleanup) = window.destroy() {
                eprintln!("[Reminder] Registration rollback: {cleanup}");
            }
            return Err(error);
        }
        let native = match window.gtk_window() {
            Ok(native) => native,
            Err(error) => {
                if let Err(cleanup) = window.destroy() {
                    eprintln!("[Reminder] Native handle rollback: {cleanup}");
                }
                return Err(error.to_string());
            }
        };
        let mut entry = OutputWindow {
            monitor: monitor.clone(),
            window,
            native,
            window_signals: Vec::new(),
            monitor_signals: Vec::new(),
            session_id: id,
        };
        entry.native.set_focus_on_map(controls);
        entry.native.fullscreen_on_monitor(&self.screen, index);
        entry
            .window_signals
            .push(entry.native.connect_map(move |_| queue_focus(id)));
        entry.window_signals.push(
            entry
                .native
                .connect_is_active_notify(move |_| queue_focus(id)),
        );
        entry
            .window_signals
            .push(entry.native.connect_grab_broken_event(move |_, _| {
                // Remember this focus epoch: revocation does not authorize another grab.
                PRESENTATION.with(|slot| {
                    if let Some(current) = slot
                        .borrow_mut()
                        .as_mut()
                        .filter(|p| p.config.session_id == id)
                    {
                        current.seat = None;
                    }
                });
                glib::Propagation::Proceed
            }));
        if self.config.kind == ReminderKind::Preview {
            let app = self.app.clone();
            entry
                .window_signals
                .push(entry.native.connect_key_press_event(move |_, event| {
                    if event.keyval() == gdk::keys::constants::Escape {
                        finish_from_native(&app, id, FinishReason::DismissPreview);
                        return glib::Propagation::Stop;
                    }
                    glib::Propagation::Proceed
                }));
        }
        for property in ["geometry", "scale-factor"] {
            let app = self.app.clone();
            entry
                .monitor_signals
                .push(
                    entry
                        .monitor
                        .connect_notify_local(Some(property), move |_, _| {
                            queue_reconcile(&app, id);
                        }),
                );
        }
        entry.window.show().map_err(|error| error.to_string())?;
        Ok(entry)
    }

    fn release_keyboard(&mut self) {
        if let Some(seat) = self.seat.take() {
            seat.ungrab();
            eprintln!("[Reminder] keyboard=released");
        }
    }

    fn update_focus(&mut self) {
        let focused = self
            .windows
            .iter()
            .find(|entry| entry.native.is_mapped() && entry.native.is_active())
            .map(|entry| entry.window.label().to_string());
        if focused == self.focused {
            return;
        }
        self.release_keyboard();
        self.focused = focused;
        let Some(entry) = self
            .windows
            .iter()
            .find(|entry| Some(entry.window.label()) == self.focused.as_deref())
        else {
            return;
        };
        let Some(surface) = entry.native.window() else {
            return;
        };
        let Some(seat) = self.display.default_seat() else {
            eprintln!("[Reminder] keyboard=unavailable (no seat)");
            return;
        };
        let status = seat.grab(
            &surface,
            gdk::SeatCapabilities::KEYBOARD,
            true,
            None,
            None,
            None,
        );
        eprintln!("[Reminder] keyboard-grab={status:?}");
        if status == gdk::GrabStatus::Success {
            self.seat = Some(seat);
        }
    }
}

fn clear_removed_focus<'a>(
    focused: &mut Option<String>,
    mut removed: impl Iterator<Item = &'a str>,
) -> bool {
    if focused
        .as_deref()
        .is_some_and(|label| removed.any(|removed| removed == label))
    {
        *focused = None;
        true
    } else {
        false
    }
}

fn queue_focus(id: u64) {
    glib::idle_add_local_once(move || {
        // Work outside the RefCell borrow: GTK can synchronously emit a signal.
        let current = PRESENTATION.with(|slot| slot.borrow_mut().take());
        if let Some(mut current) = current {
            if current.config.session_id == id {
                current.update_focus();
            }
            PRESENTATION.with(|slot| *slot.borrow_mut() = Some(current));
        }
    });
}

fn queue_reconcile(app: &AppHandle, id: u64) {
    let app = app.clone();
    glib::idle_add_local_once(move || {
        let current = PRESENTATION.with(|slot| slot.borrow_mut().take());
        if let Some(mut current) = current {
            if current.config.session_id == id {
                if let Err(error) = current.reconcile() {
                    eprintln!("[Reminder] Output reconciliation aborted: {error}");
                    app.state::<Arc<ReminderScheduler>>()
                        .invalidate_presentation(id);
                    drop(current);
                    finish_from_native(&app, id, FinishReason::Abort);
                    return;
                }
            }
            PRESENTATION.with(|slot| *slot.borrow_mut() = Some(current));
            queue_focus(id);
        }
    });
}

fn finish_from_native(app: &AppHandle, id: u64, reason: FinishReason) {
    let scheduler = app.state::<Arc<ReminderScheduler>>().inner().clone();
    let app = app.clone();
    tauri::async_runtime::spawn(async move {
        if let Err(error) = scheduler.finish_session(&app, id, None, reason).await {
            eprintln!("[Reminder] Native terminal event: {error}");
        }
    });
}

#[cfg(test)]
mod tests {
    use super::select_outputs;

    #[test]
    fn primary_selection_uses_identity_not_geometry() {
        assert_eq!(select_outputs(&[11, 22], Some(&22), false), vec![22]);
    }

    #[test]
    fn all_outputs_put_primary_controls_first() {
        assert_eq!(
            select_outputs(&[11, 22, 33], Some(&22), true),
            vec![22, 11, 33]
        );
    }

    #[test]
    fn missing_primary_uses_first_enumerated_output() {
        assert_eq!(select_outputs(&[11, 22], Some(&99), false), vec![11]);
    }

    #[test]
    fn no_outputs_never_invents_a_surface() {
        assert!(select_outputs::<u32>(&[], None, true).is_empty());
    }

    #[test]
    fn revoked_primary_keeps_its_focus_epoch_when_secondary_is_removed() {
        // Revocation leaves the focus label in place, but releases the seat.
        let mut focused = Some("primary".to_string());
        assert!(!super::clear_removed_focus(
            &mut focused,
            ["secondary"].into_iter()
        ));
        assert_eq!(focused.as_deref(), Some("primary"));
    }

    #[test]
    fn removing_focused_output_allows_a_new_focus_epoch() {
        let mut focused = Some("secondary".to_string());
        assert!(super::clear_removed_focus(
            &mut focused,
            ["secondary"].into_iter()
        ));
        assert_eq!(focused, None);
    }
}
