# Auto Draft Release Workflow - Technical Documentation

## Overview
GitHub Actions workflow that builds Blink Eye for multiple platforms (macOS ARM64, macOS Intel, Ubuntu, Windows), creates draft releases, and captures screenshots of the macOS app installation and launch process.

## Trigger Conditions

### Automatic Triggers
```yaml
on:
  pull_request:
    branches: [master]
    paths-ignore:
      - 'website/**'
      - '**.md'
      - 'docs/**'
```
- Runs on pull requests to `master` branch
- Ignores changes to website, markdown files, and docs

### Manual Trigger
```yaml
  workflow_dispatch:
```
- Can be manually triggered from GitHub Actions UI

## Build Matrix

### Platforms
| Platform | Architecture | Target | Purpose |
|----------|-------------|--------|---------|
| macos-latest | arm64 | aarch64-apple-darwin | Apple Silicon (M1+) |
| macos-latest | x86_64 | x86_64-apple-darwin | Intel Macs |
| ubuntu-22.04 | - | - | Linux x64 |
| windows-latest | - | - | Windows x64 |

## Workflow Steps

### 1. Environment Setup
```yaml
- Setup Node (LTS)
- Install Bun (latest)
- Cache Bun dependencies
- Cache Rust dependencies
- Install Rust stable with platform-specific targets
```

### 2. Platform-Specific Dependencies

#### Ubuntu
```bash
libwebkit2gtk-4.1-dev
libappindicator3-dev
librsvg2-dev
libgtk-4-dev
patchelf
openssl
libssl-dev
build-essential
```

#### macOS
- Rust targets: `aarch64-apple-darwin,x86_64-apple-darwin`

### 3. Build Process
Uses `tauri-apps/tauri-action@v0.5.16` with:
- **Environment Variables**:
  - `GITHUB_TOKEN` - For release creation
  - `VITE_HANDSHAKE_PASSWORD` - App-specific secret
  - `TAURI_SIGNING_PRIVATE_KEY` - Code signing
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - Key password
  - `NODE_OPTIONS: --openssl-legacy-provider` - Web Crypto API compatibility

- **Release Configuration**:
  - Tag: `v__VERSION__` (auto-replaced with app version)
  - Draft: `true` (creates draft release)
  - Updater JSON: `true` (includes update manifest)
  - Prefer NSIS: `true` (Windows installer preference)

### 4. macOS Post-Build Testing (New Feature)

#### Step 4.1: Log Device Architecture
```bash
uname -m  # Detects arm64 or x86_64
```
- Identifies runner architecture
- Logs Apple Silicon vs Intel detection

#### Step 4.2: Find and Install Built App
```bash
# Determine target directory based on architecture
if [[ "${{ matrix.architecture }}" == "arm64" ]]; then
  TARGET_DIR="src-tauri/target/aarch64-apple-darwin/release/bundle/macos"
else
  TARGET_DIR="src-tauri/target/x86_64-apple-darwin/release/bundle/macos"
fi

# Find .app bundle
APP_PATH=$(find "$TARGET_DIR" -name "*.app" -type d | head -n 1)

# Copy to /Applications
sudo cp -R "$APP_PATH" /Applications/

# Screenshot after installation
screencapture -x /tmp/screenshot_install.png
```

**Key Points**:
- Automatically finds built `.app` bundle
- Installs to `/Applications` (system-wide)
- No Homebrew required (direct installation)
- Takes screenshot after installation

#### Step 4.3: Verify Installation
```bash
if [ -d "/Applications/Blink Eye.app" ]; then
  echo "Blink Eye installed successfully."
  ls -la "/Applications/Blink Eye.app"
fi
screencapture -x /tmp/screenshot_verify_install.png
```
- Confirms app exists in Applications folder
- Lists app contents
- Captures verification screenshot

#### Step 4.4: Test App Architecture
```bash
ARCH=$(file "/Applications/Blink Eye.app/Contents/MacOS/Blink-Eye" | awk '{print $NF}')
echo "Detected architecture: $ARCH"

if [ "$ARCH" != "${{ matrix.architecture }}" ]; then
  echo "Architecture test failed!"
else
  echo "Architecture test passed!"
fi
```
- Uses `file` command to detect binary architecture
- Compares with expected architecture from matrix
- Validates correct build for target platform

#### Step 4.5: Launch App 5 Times
```bash
for i in {1..5}; do
  open "/Applications/Blink Eye.app"
  sleep 10  # Wait for UI to render
  screencapture -x "/tmp/screenshot_launch_$i.png"
done
```
- Launches app 5 times with 10-second intervals
- Allows UI to fully render before screenshot
- Captures 5 screenshots showing app behavior
- Tests app stability across multiple launches

#### Step 4.6: Cleanup - Uninstall
```bash
sudo rm -rf "/Applications/Blink Eye.app"
screencapture -x /tmp/screenshot_uninstall.png
```
- Removes app from Applications folder
- Captures post-uninstall screenshot
- Cleans up test environment

#### Step 4.7: Verify Uninstallation
```bash
if [ ! -d "/Applications/Blink Eye.app" ]; then
  echo "Blink Eye uninstalled successfully."
fi
```
- Confirms app was removed
- Final verification screenshot

### 5. Artifact Upload

#### macOS Screenshots
```yaml
- name: Upload macOS Screenshots
  uses: actions/upload-artifact@v4
  with:
    name: BlinkEyeScreenshots-${{ matrix.architecture }}
    path: /tmp/screenshot_*.png
    retention-days: 7
```
- Uploads all screenshots from macOS builds
- Separate artifacts for arm64 and x86_64
- Retained for 7 days

**Screenshot Files**:
- `screenshot_install.png` - After copying to Applications
- `screenshot_verify_install.png` - Installation verification
- `screenshot_architecture.png` - Architecture test
- `screenshot_launch_1.png` through `screenshot_launch_5.png` - App launches
- `screenshot_uninstall.png` - During uninstallation
- `screenshot_verify_uninstall.png` - Uninstall verification

#### Release Artifacts
```yaml
- name: Upload release artifacts
  uses: actions/upload-artifact@v4
  with:
    name: release-${{ matrix.platform }}-${{ matrix.architecture || 'default' }}
    path: src-tauri/target/release/bundle/**
```
- Uploads built binaries and installers
- Platform and architecture-specific naming
- Includes all bundle formats (DMG, app, tar.gz, etc.)

## Key Differences from Homebrew Approach

### Your Original Workflow (Homebrew)
```bash
brew tap nomandhoni-cs/blinkeye
brew install --cask blinkeye
```
- Requires Homebrew setup
- Downloads from tap repository
- Tests published version

### New Workflow (Direct Installation)
```bash
# Find built app
APP_PATH=$(find "$TARGET_DIR" -name "*.app" -type d)
# Install directly
sudo cp -R "$APP_PATH" /Applications/
```
- No Homebrew required
- Tests freshly built app from CI
- Direct installation from build artifacts
- Faster and more reliable

## Error Handling

All macOS testing steps use:
```yaml
continue-on-error: true
```

**Rationale**:
- Screenshot failures don't block release
- Installation issues don't fail entire workflow
- Allows workflow to complete even if testing fails
- Artifacts still uploaded for debugging

## Caching Strategy

### Bun Dependencies
```yaml
path: ~/.bun/install/cache
key: ${{ runner.os }}-bun-${{ hashFiles('**/bun.lockb') }}
```
- Caches Bun packages
- Invalidates on `bun.lockb` changes
- Speeds up frontend dependency installation

### Rust Dependencies
```yaml
path: |
  ~/.cargo/registry/index/
  ~/.cargo/registry/cache/
  ~/.cargo/git/
  src-tauri/target/
key: ${{ runner.os }}-cargo-${{ hashFiles('**/Cargo.lock') }}
```
- Caches Cargo registry and compiled artifacts
- Invalidates on `Cargo.lock` changes
- Significantly reduces build time

## Security Considerations

### Secrets Required
1. `GITHUB_TOKEN` - Automatically provided by GitHub
2. `VITE_HANDSHAKE_PASSWORD` - Custom app secret
3. `TAURI_SIGNING_PRIVATE_KEY` - Code signing key
4. `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` - Key password

### Permissions
```yaml
permissions:
  contents: write
```
- Required for creating releases
- Allows uploading release assets

## Output Artifacts

### For Each Platform
- **macOS arm64**:
  - `Blink Eye_[version]_aarch64.dmg`
  - `Blink Eye.app` (in tar.gz)
  - `Blink Eye.app.tar.gz.sig` (updater signature)
  - Screenshots (9 images)

- **macOS x86_64**:
  - `Blink Eye_[version]_x64.dmg`
  - `Blink Eye.app` (in tar.gz)
  - `Blink Eye.app.tar.gz.sig` (updater signature)
  - Screenshots (9 images)

- **Ubuntu**:
  - `.deb` package
  - `.AppImage`
  - Updater files

- **Windows**:
  - `.msi` installer
  - `.exe` (NSIS)
  - Updater files

## Troubleshooting

### Screenshots Not Captured
- Check if `screencapture` command is available (macOS only)
- Verify `/tmp` directory is writable
- Check workflow logs for error messages

### App Not Found After Build
- Verify build completed successfully
- Check target directory path matches architecture
- Look for build errors in Tauri action logs

### Architecture Mismatch
- Ensure Rust targets are correctly installed
- Verify `--target` flag matches matrix architecture
- Check `file` command output in logs

### Installation Fails
- Check sudo permissions in runner
- Verify app bundle structure is valid
- Look for codesigning issues

## Usage

### Manual Trigger
1. Go to Actions tab in GitHub
2. Select "Blink Eye Auto Draft Release"
3. Click "Run workflow"
4. Select branch (usually `develop` or `master`)
5. Click "Run workflow"

### Viewing Results
1. Wait for workflow to complete
2. Go to workflow run page
3. Download artifacts:
   - `BlinkEyeScreenshots-arm64` - ARM64 screenshots
   - `BlinkEyeScreenshots-x86_64` - Intel screenshots
   - `release-macos-latest-arm64` - ARM64 build
   - `release-macos-latest-x86_64` - Intel build
   - `release-ubuntu-22.04-default` - Linux build
   - `release-windows-latest-default` - Windows build

### Viewing Screenshots
1. Download screenshot artifact
2. Extract ZIP file
3. View PNG files in order:
   - `screenshot_install.png`
   - `screenshot_verify_install.png`
   - `screenshot_architecture.png`
   - `screenshot_launch_1.png` through `screenshot_launch_5.png`
   - `screenshot_uninstall.png`
   - `screenshot_verify_uninstall.png`

## Performance Metrics

### Typical Build Times (with cache)
- macOS arm64: ~8-12 minutes
- macOS x86_64: ~8-12 minutes
- Ubuntu: ~6-10 minutes
- Windows: ~10-15 minutes

### Screenshot Overhead
- Installation: ~5 seconds
- Each launch: ~10 seconds
- Total testing: ~60-70 seconds per macOS build

## Future Enhancements

### Potential Improvements
1. Add video recording instead of screenshots
2. Implement UI automation tests
3. Add performance benchmarks
4. Test app functionality (not just launch)
5. Add Linux screenshot support (using `scrot` or `import`)
6. Add Windows screenshot support (using PowerShell)

### Suggested Additions
```yaml
- name: Record App Launch Video (macOS)
  run: |
    # Start screen recording
    screencapture -v /tmp/app_launch.mov &
    RECORDING_PID=$!
    
    # Launch app
    open "/Applications/Blink Eye.app"
    sleep 30
    
    # Stop recording
    kill $RECORDING_PID
```

## Related Files
- `.github/workflows/Release.yml` - Production release workflow
- `.github/workflows/screenshoteveniffailed.yml` - Original screenshot workflow
- `src-tauri/tauri.conf.json` - Tauri configuration
- `src-tauri/Cargo.toml` - Rust dependencies

## References
- [Tauri v2 GitHub Actions Guide](https://v2.tauri.app/distribute/pipelines/github)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [macOS screencapture Command](https://ss64.com/osx/screencapture.html)
- [Tauri Action Repository](https://github.com/tauri-apps/tauri-action)
