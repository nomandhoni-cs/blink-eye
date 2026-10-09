# Linux reminder windows

Native Wayland reminders use Tauri's GTK3 windows and WebKit content. Each
selected GDK monitor receives an explicitly targeted fullscreen window. All
monitors requires both the saved `isMultiMonitorEnabled` setting and existing
premium access (including an active trial). Otherwise one primary monitor is
covered; if GDK has no primary, the first enumerated monitor is used.
Every selected output shows the synchronized timer, reminder message and guarded
Skip (or preview dismissal). Only the primary owns todos and audio; Rust grants
one audio claim per session even when a surviving output becomes primary.

A refused early audio claim can be retried on a later status update in the final
second. An accepted claim is consumed once, including if its resource cannot be
loaded or playback fails; status updates do not duplicate the sound.

Timer and message sizes are capped at the original large-display sizes and
shrink with the logical viewport. Numeric sizing also accounts for digit count,
leaving padding inside the circle. Resizing does not restart the backend timer.

The focused, mapped reminder requests a GDK keyboard seat grab. On Wayland this
requests compositor-managed shortcut inhibition. The compositor decides whether
to honor it. Its escape binding, explicitly uninhibited shortcuts and process
termination remain available. Blink Eye does not lock your desktop or modify
compositor configuration. It makes one attempt per focus change, not periodic
attempts after denial or revocation.

The actual GDK display backend selects this path. `GDK_BACKEND` is respected.
X11/XWayland retain standard fullscreen presentation without this Wayland
inhibition claim. Logs report backend, output count and grab result without
reminder text, keyboard input, license values or monitor serials.

## Launch backend and multi-monitor coverage

A Wayland desktop session does not imply that Blink Eye uses native Wayland.
When the launcher leaves `GDK_BACKEND` unset,
GTK3 probes its supported backends; the tested Linux GTK3 build prefers Wayland
and falls back to X11 when it cannot open the Wayland display. GTK owns explicit
backend names, ordered lists and wildcard semantics. Do not infer availability
from `XDG_SESSION_TYPE` or override the caller's choice.

To request native Wayland explicitly for diagnosis:

```sh
GDK_BACKEND=wayland /path/to/Blink-Eye
```

Check for `backend=wayland-gtk3` in the reminder log, then preview a break and
confirm that each selected physical display shows its own fullscreen overlay.
`outputs=2` alone proves that two windows were created, not that they occupy
different displays. A package launcher may override the environment; check its
actual behavior rather than assuming that the command above applies to it.

On a two-output Niri/XWayland setup, a launcher defaulting to `GDK_BACKEND=x11`
created two fullscreen reminder windows on the same focused output. Both
monitors were enumerated, multi-monitor mode was enabled, and the trial was
active. Running the identical binary and copied settings with
`GDK_BACKEND=wayland` covered the two distinct outputs. Native preview and
scheduled-break expiry were also verified in a separately named local Wayland
installation with an independent profile.

That XWayland window manager did not advertise `_NET_WM_FULLSCREEN_MONITORS`.
An explicit GTK fullscreen-monitor request still stacked both X11 windows and
was not retained as a fix. Use native Wayland for this configuration; do not
interpret the standard X11 fallback as guaranteed multi-output coverage.
This observation does not establish behavior on other X11 window managers.

## Preserving an existing monitor preference

Your saved monitor selection is retained when upgrading from the earlier UI
storage path. Before reminders start, Blink Eye reads the old AppConfig
`appconfig.db` without modifying it and imports only a valid
`isMultiMonitorEnabled` boolean into the canonical AppData configuration.
If both stores contain different values on this first upgrade, the old UI
selection wins. License, trial and todo data are not imported.

The choice and a one-time completion marker are committed together. After that,
new dashboard choices remain authoritative, including after restarting.
Missing or identical legacy storage preserves the canonical choice. An invalid
or unreadable legacy value preserves the canonical setting and leaves the
import incomplete; saving a valid monitor choice in the dashboard completes it.
Neither database is deleted or replaced. Downgrade clients ignore the marker;
edits made through the old UI after downgrading are not automatically reimported.

## Lifetime, previews and recovery

Rust owns the monotonic deadline, even if a reminder renderer stops responding or
the screen-on scheduling tick is paused. Ordinary close and Escape do not end an
actual break. Skip must pass strict-mode and snooze-limit checks in Rust.
The compositor's emergency escape and terminating the process remain effective.

Settings and theme previews use the same presenter. Preview is visibly labeled,
always dismissible and does not change break statistics or the next-break
interval. A real break takes precedence; a preview requested during a real break
is rejected visibly. Theme requests are checked against existing premium policy.

Native monitor signals preserve the deadline across scale, rotation and output
changes. Losing the primary output promotes a surviving selected output.
All-monitor mode covers newly connected outputs for the remaining duration.
Losing all outputs or failing to create complete coverage aborts the session
without completion credit. Cleanup releases the keyboard seat and destroys owned
windows before any statistics write, including when the database fails.
On Linux, an abnormal WebKit process termination aborts without credit; a frozen
renderer cannot extend the backend deadline.

Save monitor selection through the dashboard. The setting is stored in
`appconfig.db` using Rust commands and refreshes the scheduler immediately.
Changes apply to the next session; they do not extend an active break.

## Verification and distribution

GTK objects and signal ownership remain on the application's main thread.
Windows/macOS and non-Wayland Linux keep the existing native presentation path.
Native Windows/macOS and alternate-compositor checks require those hosts.
Compositor approval is not portable proof of another compositor's shortcut policy.

GTK3 and WebKitGTK were already required by the Tauri application. The direct
Rust declarations below do not add a new system-library dependency. Distribution
still requires checking the actual AppImage/deb/rpm runtime on its target host;
a local executable check is not a package-format compatibility guarantee.

The locally inspected AppImage's generated GTK launcher sets `GDK_BACKEND=x11`.
That artifact therefore uses the X11 path even in a Wayland desktop session;
it is not evidence of native Wayland support in the AppImage. Check the actual
package launcher and backend log before relying on shortcut inhibition.

## Dependency provenance

Linux directly declares `gtk = 0.18.2` and `gdk = 0.18.2`, the exact versions
already resolved transitively by Tauri in the base lockfile. Both are published
by the gtk-rs project on crates.io under MIT, with upstream repository
<https://github.com/gtk-rs/gtk3-rs>. Their MIT notices remain part of the dependency
source distribution. Existing GTK3 and WebKitGTK system-library obligations
remain unchanged; no GTK4, layer-shell, raw Wayland binding or helper executable
is added. Cargo owns lockfile generation.

Public API contracts used:
- <https://docs.rs/gtk/0.18.2/gtk/prelude/trait.GtkWindowExt.html>
- <https://docs.rs/gdk/0.18.2/gdk/prelude/trait.SeatExt.html>
- <https://webkitgtk.org/reference/webkit2gtk/stable/signal.WebView.web-process-terminated.html>

Implementation is independently authored from Blink Eye code and sanitized
public-interface facts. No competitor source, assets or structure were used.
