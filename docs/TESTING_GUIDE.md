# NYX OS Tauri - Testing Guide

This guide outlines how to test the native Tauri version of NYX OS to ensure all features work correctly.

## Pre-Testing Setup

### 1. Environment Verification
Before testing, ensure your environment meets requirements:

```bash
# Check system info
npm run tauri info

# Expected output should show:
# ✔ webkit2gtk-4.0 (Linux) or equivalent
# ✔ rustc version 1.75+
# ✔ Cargo latest
# ✔ Node.js 16+
```

### 2. Development Build Test
```bash
# First, ensure the web version works
npm run dev
# ✅ Should open http://localhost:5173 with NYX OS

# Then test the native version
npm run tauri:dev
# ✅ Should open NYX OS in a native window
```

## Testing Checklist

### 🏗️ Core Application
- [ ] **App Launch**: NYX OS opens in native window
- [ ] **Window Properties**: Starts maximized, no decorations, transparent
- [ ] **Boot Animation**: Plays correctly in native environment
- [ ] **Theme System**: Dark/light modes work properly
- [ ] **User Selection**: Login screen functions normally

### 🪟 Window Management
- [ ] **Minimize**: Window minimizes to taskbar/dock
- [ ] **Maximize/Restore**: Window toggles between states
- [ ] **Fullscreen**: F11 or button toggles fullscreen
- [ ] **Always on Top**: Pin feature works
- [ ] **Dragging**: Window can be moved (if decorations enabled)
- [ ] **Resizing**: Window resizes correctly
- [ ] **Close to Tray**: Closing hides to system tray instead of quitting

### 🔧 System Tray
- [ ] **Tray Icon**: Appears in system tray
- [ ] **Left Click**: Shows/focuses main window
- [ ] **Right Click**: Shows context menu
- [ ] **Menu Items**: Show, Hide, Quit options work
- [ ] **Background Operation**: App continues running when window closed

### 📁 File System Integration
- [ ] **File Manager**: Native file manager opens and browses directories
- [ ] **Real Paths**: Shows actual user directories (Documents, Downloads, etc.)
- [ ] **File Operations**: Can navigate folders, view file info
- [ ] **Permissions**: Access to allowed directories only
- [ ] **Search**: File search functionality works

### 🖥️ System Information
- [ ] **Hardware Info**: CPU, RAM, disk info displays correctly
- [ ] **Platform Detection**: Shows correct OS (Windows/macOS/Linux)
- [ ] **Performance Metrics**: Real-time system monitoring
- [ ] **Native vs Web Badge**: Shows "Native" instead of "Web"

### 🔔 Notifications
- [ ] **Permission Request**: Asks for notification permission
- [ ] **Native Notifications**: System notifications appear
- [ ] **Notification Center**: Integrates with OS notification system
- [ ] **Welcome Notification**: Shows on first native launch

### 🚀 App Launching
- [ ] **External Apps**: Can launch system applications
- [ ] **File Associations**: Opens files with default applications
- [ ] **Shell Integration**: Terminal/command execution works
- [ ] **Security**: Only allowed commands can be executed

### 🔌 Native Features
- [ ] **Keyboard Shortcuts**: Global shortcuts work
- [ ] **Multi-Monitor**: Handles multiple displays correctly
- [ ] **DPI Scaling**: Renders correctly on high-DPI displays
- [ ] **System Theme**: Respects OS dark/light mode preference

### 📱 Cross-Platform Compatibility
- [ ] **Windows**: All features work on Windows 10/11
- [ ] **macOS**: All features work on recent macOS versions
- [ ] **Linux**: All features work on major Linux distributions

## Performance Testing

### 📊 Benchmarks
Test these metrics compared to the web version:

```bash
# Memory usage (should be significantly lower than Electron)
# Startup time (should be faster)
# CPU usage (should be lower)
# File operations (should be much faster)
# Window operations (should be smoother)
```

Expected improvements:
- **Memory**: 70-80% less than Electron equivalent
- **Startup**: 2-3x faster than web version
- **File Operations**: Near-instant vs web limitations
- **Responsiveness**: No web lag, native feel

### 🔄 Stress Testing
- [ ] **Multiple Windows**: Open many app windows simultaneously
- [ ] **Memory Leaks**: Run for extended periods (hours)
- [ ] **File Operations**: Handle large directories, many files
- [ ] **Rapid Operations**: Fast clicking, keyboard shortcuts
- [ ] **System Integration**: Multiple external app launches

## Regression Testing

### 🔍 Feature Parity
Ensure all web features still work in native:

- [ ] **All Apps**: Calculator, Camera, File Manager, etc.
- [ ] **AI Features**: Sam AI, voice recognition, text-to-speech
- [ ] **Animations**: All animations smooth and performant
- [ ] **Mobile UI**: Tablet/phone modes work (for testing)
- [ ] **Settings**: All settings persist and apply correctly

### 🐛 Known Issues
Watch for these potential issues:

- [ ] **File Path Separators**: Windows vs Unix path handling
- [ ] **Permission Dialogs**: File access permissions
- [ ] **Security Warnings**: Antivirus false positives
- [ ] **Font Rendering**: Cross-platform font differences
- [ ] **Audio/Video**: Media playback in native context

## Production Build Testing

### 📦 Build Process
```bash
# Test production build
npm run tauri:build

# Verify outputs exist:
# Windows: src-tauri/target/release/bundle/msi/
# macOS: src-tauri/target/release/bundle/dmg/
# Linux: src-tauri/target/release/bundle/deb/
```

### 🏢 Installation Testing
- [ ] **Windows**: Install .msi file, test uninstall
- [ ] **macOS**: Mount .dmg, install to Applications
- [ ] **Linux**: Install .deb/.rpm, test package manager integration
- [ ] **File Associations**: App registers correctly with OS
- [ ] **Desktop Integration**: Shortcuts, start menu entries
- [ ] **Auto-Start**: Optional startup integration works

### 🔐 Security Testing
- [ ] **Code Signing**: Binaries are properly signed (production)
- [ ] **Permissions**: Only required permissions requested
- [ ] **Sandbox**: Tauri security sandbox works correctly
- [ ] **Network**: Only allowed network requests succeed
- [ ] **File Access**: Restricted to configured directories

## User Acceptance Testing

### 👥 Real User Scenarios
Test with actual users:

1. **First Launch Experience**
   - [ ] Installation is smooth
   - [ ] First boot tutorial works
   - [ ] User can complete setup

2. **Daily Usage**
   - [ ] App feels native and responsive
   - [ ] Common tasks are faster than web version
   - [ ] No crashes or freezes during normal use

3. **Power User Features**
   - [ ] Advanced features accessible and working
   - [ ] Keyboard shortcuts feel natural
   - [ ] System integration enhances workflow

## Automated Testing

### 🤖 Test Scripts
```bash
# Run automated test suite (when available)
npm run test:tauri

# Integration tests for native features
npm run test:integration

# E2E tests in native environment
npm run test:e2e:native
```

## Reporting Issues

### 🐞 Bug Report Template
When issues are found:

```markdown
## Environment
- OS: [Windows 11/macOS 13/Ubuntu 22.04]
- NYX OS Version: [1.0.0]
- Tauri Version: [1.5.0]

## Steps to Reproduce
1. 
2. 
3. 

## Expected Behavior
[What should happen]

## Actual Behavior
[What actually happened]

## Screenshots/Logs
[Include relevant logs from console]
```

## Success Criteria

The Tauri conversion is successful when:

✅ **Performance**: 50%+ better than web version  
✅ **Functionality**: 100% feature parity with web version  
✅ **Stability**: No crashes during 1-hour stress test  
✅ **Integration**: Native OS features work correctly  
✅ **User Experience**: Feels like a native application  

## Next Steps After Testing

1. **Fix Critical Issues**: Address any blocking bugs
2. **Performance Optimization**: Fine-tune based on benchmarks  
3. **Documentation**: Update user guides for native features
4. **Distribution**: Set up release pipeline and auto-updates
5. **User Feedback**: Gather feedback from beta testers

---

**Note**: Since this is a cloud development environment without Rust installed, actual testing must be done on a local development machine with proper prerequisites installed. Follow the [TAURI_SETUP.md](./TAURI_SETUP.md) guide for local environment setup.
