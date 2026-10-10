# Trial status and monitor availability

Blink Eye uses its local trial and license results to show premium availability.
An active paid license provides premium access even after the trial expires or
if the trial read fails. An active trial still provides access if the license
read fails. JavaScript does not calculate trial eligibility.

## Status and recovery

Checking status, a confirmed expired trial, missing trial information, a failed
read, and a system date before installation are separate states. A read failure
is not proof of expiry or license rejection. Use **Retry** to check local status
again; for a clock anomaly, check the system date first.

Open **Check or activate license** to reach the existing license page. It shows
checking only while its local read is pending, then active, inactive, expired,
no license, or a retryable read error. Activation and validation retain their
existing network and grace-period behavior. Successful license writes refresh
the shared local entitlement state.

## Saved preference versus effective monitor mode

Multi-Monitor requires confirmed premium access. When expiry is confirmed,
Primary is the effective mode and the Multi-Monitor choice is disabled without
a selected checkmark or shimmer. Status checking temporarily disables the choices
without presenting a pending result as a confirmed selection. The activation
link remains available independently.

Expiry does not erase a saved all-monitor preference. It can apply again when
premium access returns. Explicitly selecting Primary saves a primary-only
preference, which remains primary when access returns.

Enabling Multi-Monitor checks fresh local entitlement before saving. Pending
checks and saves prevent conflicting selections. Unresolved status errors or
missing trial information do not present a confirmed monitor selection. A rejected entitlement check or
failed save does not report success or change the saved preference. Free
single-monitor breaks remain available.

## Preview limitation

The existing Preview break action opens one window, even with Multi-Monitor
selected. It does not test scheduled all-display breaks or prove that a physical
display is present. This feedback change does not alter preview windows,
scheduled-break presentation, storage, or premium policy.
