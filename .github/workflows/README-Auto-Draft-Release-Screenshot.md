# Auto Draft Release with Screenshots (macOS Only) - Technical Documentation

## Overview
Streamlined GitHub Actions workflow that builds Blink Eye for macOS only (ARM64 and Intel), increases screen resolution for better screenshot visibility, captures screenshots during installation and testing, and creates draft releases.

## Key Differences from Main Release Workflow

### This Workflow (Screenshot Testing)
- **Platforms**: macOS only (ARM64 + Intel)
- **Purpose**: Visual testing and screenshot capture
- **Resolution**: Automatically increased to 1920x1080 or highest available
- **Screenshots**: 11 screenshots per architecture
- **Trigger**: Pull requests to `develop` branch

### Main Release Workflow
- **Platforms**: macOS, Ubuntu, Windows
- **Purpose**: Production releases
- **Resolution**: Default
- **Screenshots**: None
- **Trigger**: Pull requests to `master` branch

## Trigger Conditions

```yaml
on:
  pull_request:
    branches: [develop]
    paths-ignore:
      - 'website/**'
      - '**.md'
      - 'docs/**'
  workflow_dispatch:
```

## Build Matrix (macOS Only)

| Platform | Architecture | Target | Runner |
|----------|-------------|--------|---------|
| macos-latest | arm64 | aarch64-apple-darwin | GitHub-hosted macOS |
| macos-latest | x86_64 | x86_64-apple-darwin | GitHub-hosted macOS |

## Workflow Steps

### 1. Standard Build Setup
- Checkout repository
- Setup Node.js LTS
- Install Bun (latest)
- Cache Bun dependencies
- Cache Rust dependencies
- Install Rust with both macOS targets
- Install frontend dependencies
- Build with Tauri Action

### 2. Resolution Management (New Feature)

#### Step 2.1: Get Current Screen Resolution
```bash
system_profiler SPDisplaysDataType | grep Resolution
```
- Displays current resolution before changes
- Uses macOS system profiler utility

#### Step 2.2: Install displayplacer
```bash
brew tap jakehilborn/jakehilborn
brew install displayplacer
```
- Installs [displayplacer](https://github.com/jakehilborn/displayplacer) - XRandR equivalent for macOS
- Command-line utility for display configuration
- Allows programmatic resolution changes

#### Step 2.3: Get Display Configuration
```bash
displayplacer list
```
- Lists all available displays and their configurations
- Shows available resolutions, scaling options, and display IDs
- Example output:
  ```
  Persistent screen id: 1
  Resolution: 1920x1080
  Scaling: off
  Origin: (0,0)
  Degree: 0
  ```

#### Step 2.4: Set Higher Resolution
```bash
displayplacer "id:1 res:1920x1080 scaling:off" || \
displayplacer "id:1 res:1680x1050 scaling:off" || \
displayplacer "id:1 res:1440x900 scaling:off" || \
echo "Could not set higher resolution, using default"
```

**Resolution Priority**:
1. **1920x1080** (Full HD) - Preferred
2. **1680x1050** (WSXGA+) - Fallback 1
3. **1440x900** (WXGA+) - Fallback 2
4. **Default** - If all fail

**Why This Matters**:
- GitHub Actions macOS runners default to low resolution (~1024x768)
- Low resolution makes UI elements appear tiny in screenshots
- Higher resolution provides clearer, more readable screenshots
- Better for documentation and bug reports

**Verification**:
```bash
system_profiler SPDisplaysDataType | grep Resolution
```
- Confirms new resolution was applied

### 3. Screenshot Capture Points

#### 11 Screenshots Per Architecture:

1. **screenshot_desktop_before.png**
   - Desktop before any installation
   - Shows clean macOS environment

2. **screenshot_install.png**
   - Immediately after copying app to /Applications
   - Shows installation completion

3. **screenshot_verify_install.png**
   - After verifying app exists
   - Confirms successful installation

4. **screenshot_architecture.png**
   - During architecture validation
   - Shows binary inspection results

5-9. **screenshot_launch_1.png through screenshot_launch_5.png**
   - Five separate app launches
   - 15-second delay between each (increased from 10s for higher resolution)
   - App is closed between launches
   - Tests app stability and UI rendering

10. **screenshot_desktop_after.png**
    - Desktop after all testing
    - Shows final state

11. **screenshot_uninstall.png**
    - During app removal
    - Shows cleanup process

12. **screenshot_verify_uninstall.png**
    - After uninstallation verification
    - Confirms app was removed

### 4. App Launch Testing (Enhanced)

```bash
for i in {1..5}; do
  echo "Launch attempt $i..."
  open "/Applications/Blink Eye.app"
  sleep 15  # Increased from 10s for higher resolution
  screencapture -x "/tmp/screenshot_launch_$i.png"
  
  # Close app before next launch
  osascript -e 'quit app "Blink Eye"'
  killall "Blink-Eye"  # Fallback if osascript fails
  sleep 2
done
```

**Key Improvements**:
- **15-second delay** (vs 10s) - More time for UI rendering at higher resolution
- **App closure between launches** - Tests fresh startup each time
- **Dual close methods**:
  - `osascript` - Graceful quit via AppleScript
  - `killall` - Force kill if graceful quit fails

### 5. Cleanup Process

```bash
# Close app if still running
osascript -e 'quit app "Blink Eye"'
killall "Blink-Eye"
sleep 2

# Remove app
sudo rm -rf "/Applications/Blink Eye.app"
```

**Ensures**:
- App is fully closed before removal
- No orphaned processes
- Clean uninstallation

## Technical Details

### displayplacer Command Syntax

```bash
displayplacer "id:<screenId> res:<width>x<height> hz:<num> color_depth:<num> scaling:<on/off> origin:(<x>,<y>) degree:<0/90/180/270>"
```

**Parameters**:
- `id` - Display identifier (usually 1 for main display)
- `res` - Resolution in WIDTHxHEIGHT format
- `hz` - Refresh rate (optional)
- `color_depth` - Bits per pixel (optional)
- `scaling` - HiDPI scaling on/off
- `origin` - Display position for multi-monitor setups
- `degree` - Rotation (0, 90, 180, 270)

**Example**:
```bash
displayplacer "id:1 res:1920x1080 scaling:off origin:(0,0) degree:0"
```

### Why Scaling is Disabled

```bash
scaling:off
```

**Reasoning**:
- `scaling:on` enables HiDPI/Retina mode
- HiDPI doubles pixel density (1920x1080 appears as 960x540)
- We want actual 1920x1080 pixels for maximum screenshot clarity
- Disabling scaling gives true resolution

### macOS System Commands Used

#### system_profiler
```bash
system_profiler SPDisplaysDataType
```
- Built-in macOS utility
- Provides detailed hardware information
- `SPDisplaysDataType` - Display/graphics info
- No installation required

#### screencapture
```bash
screencapture -x /tmp/screenshot.png
```
- Built-in macOS screenshot utility
- `-x` flag: Capture without sound
- Saves to specified path
- PNG format by default

#### osascript
```bash
osascript -e 'quit app "Blink Eye"'
```
- Executes AppleScript commands
- `-e` flag: Execute inline script
- `quit app` - Graceful application quit
- Preferred over `killall` for clean shutdown

#### killall
```bash
killall "Blink-Eye"
```
- Force terminates process by name
- Fallback if osascript fails
- Immediate termination (not graceful)

## Artifact Outputs

### Screenshot Artifacts
```yaml
name: BlinkEyeScreenshots-arm64
name: BlinkEyeScreenshots-x86_64
path: /tmp/screenshot_*.png
retention-days: 7
```

**Contents** (12 files per architecture):
1. screenshot_desktop_before.png
2. screenshot_install.png
3. screenshot_verify_install.png
4. screenshot_architecture.png
5. screenshot_launch_1.png
6. screenshot_launch_2.png
7. screenshot_launch_3.png
8. screenshot_launch_4.png
9. screenshot_launch_5.png
10. screenshot_desktop_after.png
11. screenshot_uninstall.png
12. screenshot_verify_uninstall.png

### Build Artifacts
```yaml
name: release-macos-arm64
name: release-macos-x86_64
path: src-tauri/target/release/bundle/**
```

**Contents**:
- `Blink Eye.app` - Application bundle
- `Blink Eye_[version]_aarch64.dmg` or `_x64.dmg` - Disk image
- `Blink Eye.app.tar.gz` - Compressed app (for updater)
- `Blink Eye.app.tar.gz.sig` - Updater signature

## Performance Metrics

### Typical Execution Times

| Step | Duration | Notes |
|------|----------|-------|
| Build | 8-12 min | With cache |
| Install displayplacer | 30-60s | Homebrew install |
| Set resolution | 2-5s | Display configuration |
| App installation | 5-10s | Copy to /Applications |
| Each app launch | 15s | Wait for UI render |
| Total testing | ~90s | 5 launches + screenshots |
| Cleanup | 5s | Uninstall |
| **Total** | **10-15 min** | Per architecture |

### Screenshot File Sizes

| Screenshot Type | Typical Size | Resolution |
|----------------|--------------|------------|
| Desktop | 200-500 KB | 1920x1080 |
| App window | 300-800 KB | Varies |
| Total per arch | ~5-8 MB | 12 screenshots |

## Troubleshooting

### Resolution Change Fails

**Symptoms**:
```
Could not set higher resolution, using default
```

**Causes**:
- Display doesn't support requested resolution
- displayplacer not installed correctly
- Virtual display limitations

**Solutions**:
1. Check available resolutions: `displayplacer list`
2. Try lower resolution fallbacks (already implemented)
3. Workflow continues with default resolution

### Screenshots Are Blank

**Symptoms**:
- Screenshot files exist but are black/empty

**Causes**:
- App not fully launched before screenshot
- Display not ready after resolution change

**Solutions**:
- Increase sleep duration (currently 15s)
- Add delay after resolution change
- Check app launch logs

### App Won't Close

**Symptoms**:
```
killall: No matching processes were found
```

**Causes**:
- App already closed
- Process name mismatch

**Solutions**:
- Both osascript and killall are attempted
- Workflow continues regardless (continue-on-error: true)

### displayplacer Installation Fails

**Symptoms**:
```
Error: No available formula with the name "displayplacer"
```

**Causes**:
- Homebrew tap not added
- Network issues

**Solutions**:
- Tap is added before install: `brew tap jakehilborn/jakehilborn`
- Workflow continues with default resolution if fails

## Comparison: Before vs After Resolution Change

### Before (Default Resolution)
```
Resolution: 1024x768 or 1280x1024
Screenshot size: ~200 KB
UI elements: Small, hard to read
Text: Blurry in screenshots
```

### After (Higher Resolution)
```
Resolution: 1920x1080
Screenshot size: ~500 KB
UI elements: Clear, readable
Text: Sharp and crisp
```

## Usage

### Manual Trigger
1. Go to Actions tab
2. Select "Blink Eye Auto Draft Release with Screenshots (macOS Only)"
3. Click "Run workflow"
4. Select branch (usually `develop`)
5. Click "Run workflow"

### Automatic Trigger
- Create pull request to `develop` branch
- Workflow runs automatically
- Excludes changes to website, docs, markdown files

### Viewing Screenshots
1. Go to workflow run page
2. Scroll to "Artifacts" section
3. Download:
   - `BlinkEyeScreenshots-arm64` (Apple Silicon screenshots)
   - `BlinkEyeScreenshots-x86_64` (Intel screenshots)
4. Extract ZIP files
5. View PNG files in order

### Analyzing Results

**Check for**:
- App launches successfully (screenshot_launch_*.png)
- UI renders correctly at higher resolution
- No visual glitches or artifacts
- Consistent appearance across launches
- Architecture matches expected (screenshot_architecture.png)

## Security Considerations

### Secrets Required
Same as main release workflow:
- `GITHUB_TOKEN` - Auto-provided
- `VITE_HANDSHAKE_PASSWORD`
- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

### Permissions
```yaml
permissions:
  contents: write
```
- Required for draft release creation
- Allows artifact uploads

### sudo Usage
```bash
sudo cp -R "$APP_PATH" /Applications/
sudo rm -rf "/Applications/Blink Eye.app"
```
- Required for /Applications folder access
- GitHub Actions runners allow sudo without password
- Limited to specific commands

## Future Enhancements

### Potential Improvements
1. **Video Recording**
   ```bash
   # Record 30-second video of app usage
   screencapture -v /tmp/app_demo.mov
   ```

2. **UI Automation Testing**
   ```bash
   # Use AppleScript to interact with app
   osascript -e 'tell application "Blink Eye" to activate'
   osascript -e 'tell application "System Events" to keystroke "n" using command down'
   ```

3. **Multiple Resolution Tests**
   ```bash
   for res in "1920x1080" "1680x1050" "1440x900"; do
     displayplacer "id:1 res:$res scaling:off"
     # Launch and screenshot
   done
   ```

4. **Performance Metrics**
   ```bash
   # Measure app launch time
   time open "/Applications/Blink Eye.app"
   ```

5. **Memory Usage Tracking**
   ```bash
   # Monitor memory during app runtime
   ps aux | grep "Blink-Eye"
   ```

## Related Files
- `.github/workflows/Auto Draft Release.yml` - Main release workflow (all platforms)
- `.github/workflows/Release.yml` - Production release workflow
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies

## References
- [displayplacer GitHub](https://github.com/jakehilborn/displayplacer)
- [macOS screencapture Manual](https://ss64.com/osx/screencapture.html)
- [system_profiler Documentation](https://ss64.com/osx/system_profiler.html)
- [Tauri Action v0.5.16](https://github.com/tauri-apps/tauri-action)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
