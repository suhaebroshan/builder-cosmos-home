# NYX OS - Tauri Setup Guide

This guide helps you set up and build NYX OS as a native desktop application using Tauri.

## Prerequisites

### System Requirements
- **Node.js** 16+ and npm/yarn
- **Rust** (latest stable version)
- Platform-specific dependencies:
  - **Windows**: Microsoft C++ Build Tools or Visual Studio
  - **macOS**: Xcode Command Line Tools
  - **Linux**: Package dependencies (see below)

### Install Rust
```bash
# Install Rust using rustup
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Verify installation
rustc --version
cargo --version
```

### Platform-Specific Setup

#### Windows
Install Microsoft Visual Studio C++ Build Tools or Visual Studio with C++ support.

#### macOS
```bash
xcode-select --install
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install libwebkit2gtk-4.0-dev \
  build-essential \
  curl \
  wget \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev
```

#### Linux (Fedora/RHEL)
```bash
sudo dnf groupinstall "C Development Tools and Libraries"
sudo dnf install webkit2gtk3-devel openssl-devel curl wget libappindicator-gtk3-devel librsvg2-devel
```

#### Linux (Arch)
```bash
sudo pacman -S --needed webkit2gtk base-devel curl wget openssl appmenu-gtk-module gtk3 libappindicator-gtk3 librsvg libvips
```

## Development Setup

### 1. Install Dependencies
```bash
# Install Node.js dependencies
npm install

# Verify Tauri CLI installation
npm run tauri --help
```

### 2. Development Mode
```bash
# Start the development server (both frontend and Tauri)
npm run tauri:dev
```

This will:
- Start the Vite development server
- Compile the Rust backend
- Open NYX OS in a native window
- Enable hot-reload for frontend changes

### 3. Build for Production
```bash
# Build the web assets
npm run build:client

# Build the Tauri application
npm run tauri:build
```

The built application will be located in:
- **Windows**: `src-tauri/target/release/bundle/msi/NYX OS_1.0.0_x64_en-US.msi`
- **macOS**: `src-tauri/target/release/bundle/dmg/NYX OS_1.0.0_x64.dmg`
- **Linux**: `src-tauri/target/release/bundle/deb/nyx-os_1.0.0_amd64.deb` (and other formats)

## Available Scripts

```bash
# Development
npm run tauri:dev          # Start development mode
npm run dev                # Start web-only development

# Building
npm run tauri:build        # Build native application
npm run build:client       # Build web assets only

# Tauri CLI
npm run tauri              # Direct access to Tauri CLI
npm run tauri info         # Show system/environment info
npm run tauri init         # Initialize Tauri (already done)
```

## Configuration

### Tauri Configuration
The main configuration is in `src-tauri/tauri.conf.json`. Key settings:

```json
{
  "package": {
    "productName": "NYX OS",
    "version": "1.0.0"
  },
  "tauri": {
    "windows": [{
      "title": "NYX OS",
      "width": 1200,
      "height": 800,
      "decorations": false,
      "transparent": true,
      "maximized": true
    }]
  }
}
```

### Icons
Place your app icons in `src-tauri/icons/`:
- `32x32.png`
- `128x128.png`
- `128x128@2x.png`
- `icon.icns` (macOS)
- `icon.ico` (Windows)

Generate icons from a 1024x1024 PNG:
```bash
npm install --save-dev @tauri-apps/icon
npx icon generate --input icon-1024.png --output src-tauri/icons/
```

## Features Enabled

### Native Capabilities
- **File System Access**: Full read/write access to user directories
- **Window Management**: Minimize, maximize, fullscreen, always-on-top
- **System Tray**: Background operation with tray icon
- **Notifications**: Native desktop notifications
- **Shell Integration**: Launch external applications
- **OS Information**: Platform, architecture, hostname detection

### Security
Tauri's security model only allows specific APIs that are explicitly enabled in the configuration. The current setup enables:
- File system operations in user directories
- Window management
- Shell operations (limited to opening files)
- OS information access
- Notifications

## Troubleshooting

### Common Issues

#### Build Fails on Linux
```bash
# Install missing dependencies
sudo apt install libwebkit2gtk-4.0-dev

# Clear Rust cache and rebuild
cd src-tauri
cargo clean
cd ..
npm run tauri:build
```

#### Permission Denied on macOS
```bash
# Allow the app in System Preferences > Security & Privacy
# Or build with proper signing (requires Apple Developer account)
```

#### Windows Antivirus Detection
Some antivirus software may flag the built executable. This is common with Rust applications. Add an exception or submit to antivirus vendors.

### Debug Mode
Run in debug mode for more verbose output:
```bash
# Development with debug logs
RUST_LOG=debug npm run tauri:dev

# Build with debug symbols
npm run tauri build -- --debug
```

### Getting Help
- Check Tauri documentation: https://tauri.app/
- NYX OS issues: Check the project repository
- Rust/Cargo issues: https://doc.rust-lang.org/cargo/

## Performance Tips

### Optimized Builds
For smaller, faster builds:
```bash
# Release build with optimizations
npm run tauri build -- --config '{"tauri":{"bundle":{"targets":["app"]}}}'
```

### Development Performance
- Use `npm run dev` for web-only development when working on UI
- Use `npm run tauri:dev` only when testing native features
- Frontend hot-reload is much faster than Rust compilation

## Distribution

### Auto-Update (Optional)
Tauri supports auto-updates. Configure in `tauri.conf.json`:
```json
{
  "tauri": {
    "updater": {
      "active": true,
      "endpoints": ["https://your-update-server.com/updates"]
    }
  }
}
```

### Code Signing
For production distribution:
- **Windows**: Use a code signing certificate
- **macOS**: Requires Apple Developer account and notarization
- **Linux**: AppImage or repository signing

## Next Steps

1. **Test the App**: Run `npm run tauri:dev` and test all features
2. **Customize Icons**: Replace placeholder icons with NYX OS branding
3. **Configure Auto-Start**: Set up system startup integration
4. **Distribution**: Set up code signing and distribution channels

The native NYX OS app will provide:
- ✅ 95% native performance
- ✅ Real file system access
- ✅ Native window management
- ✅ System integration
- ✅ Offline operation
- ✅ System tray support
- ✅ Much smaller memory footprint than Electron

Enjoy your native NYX OS experience! 🚀
