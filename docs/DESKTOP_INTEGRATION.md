# NYX OS - Desktop Integration Guide

This guide covers how to set up advanced desktop integration features for NYX OS, making it behave like a true operating system replacement.

## System Tray Integration

### Current Implementation
The Tauri app already includes basic system tray functionality:

```rust
// In src-tauri/src/main.rs
let tray_menu = SystemTrayMenu::new()
    .add_item(show)
    .add_item(hide)
    .add_native_item(SystemTrayMenuItem::Separator)
    .add_item(quit);

let system_tray = SystemTray::new().with_menu(tray_menu);
```

### Features
- **Always Available**: NYX OS icon in system tray
- **Quick Access**: Left-click to show/hide main window
- **Context Menu**: Right-click for Show, Hide, Quit options
- **Background Operation**: App runs in background when window closed

## Auto-Startup Configuration

### Windows
To make NYX OS start with Windows, you can:

#### Method 1: Registry Entry (Programmatic)
```rust
// Add to src-tauri/src/main.rs for Windows auto-startup
#[cfg(target_os = "windows")]
use winreg::{enums::*, RegKey};

#[tauri::command]
async fn enable_auto_startup() -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let hkcu = RegKey::predef(HKEY_CURRENT_USER);
        let run_key = hkcu.open_subkey_with_flags("SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run", KEY_SET_VALUE)
            .map_err(|e| format!("Failed to open registry key: {}", e))?;
        
        let exe_path = std::env::current_exe()
            .map_err(|e| format!("Failed to get exe path: {}", e))?;
        
        run_key.set_value("NYX OS", &exe_path.to_string_lossy().to_string())
            .map_err(|e| format!("Failed to set registry value: {}", e))?;
    }
    Ok(())
}
```

#### Method 2: User Setup (Manual)
1. Press `Win + R`, type `shell:startup`
2. Copy NYX OS shortcut to this folder
3. NYX OS will start with Windows

### macOS
#### Method 1: LaunchAgent (Programmatic)
```rust
// Add to src-tauri/src/main.rs for macOS auto-startup
#[cfg(target_os = "macos")]
#[tauri::command]
async fn enable_auto_startup() -> Result<(), String> {
    let home_dir = std::env::var("HOME").map_err(|_| "Failed to get HOME directory")?;
    let launch_agents_dir = format!("{}/Library/LaunchAgents", home_dir);
    let plist_path = format!("{}/com.nyx.os.plist", launch_agents_dir);
    
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    
    let plist_content = format!(r#"<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.nyx.os</string>
    <key>ProgramArguments</key>
    <array>
        <string>{}</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
</dict>
</plist>"#, exe_path.to_string_lossy());
    
    std::fs::write(&plist_path, plist_content)
        .map_err(|e| format!("Failed to write plist: {}", e))?;
    
    // Load the launch agent
    std::process::Command::new("launchctl")
        .args(&["load", &plist_path])
        .output()
        .map_err(|e| format!("Failed to load launch agent: {}", e))?;
    
    Ok(())
}
```

#### Method 2: User Setup (Manual)
1. Open **System Preferences** > **Users & Groups**
2. Select your user > **Login Items**
3. Click **+** and add NYX OS application

### Linux
#### Method 1: Desktop Entry (Programmatic)
```rust
// Add to src-tauri/src/main.rs for Linux auto-startup
#[cfg(target_os = "linux")]
#[tauri::command]
async fn enable_auto_startup() -> Result<(), String> {
    let home_dir = std::env::var("HOME").map_err(|_| "Failed to get HOME directory")?;
    let autostart_dir = format!("{}/.config/autostart", home_dir);
    
    // Create autostart directory if it doesn't exist
    std::fs::create_dir_all(&autostart_dir)
        .map_err(|e| format!("Failed to create autostart directory: {}", e))?;
    
    let desktop_file_path = format!("{}/nyx-os.desktop", autostart_dir);
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    
    let desktop_content = format!(r#"[Desktop Entry]
Type=Application
Name=NYX OS
Comment=NYX Operating System Interface
Exec={}
Icon=nyx-os
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
"#, exe_path.to_string_lossy());
    
    std::fs::write(&desktop_file_path, desktop_content)
        .map_err(|e| format!("Failed to write desktop file: {}", e))?;
    
    Ok(())
}
```

#### Method 2: User Setup (Manual)
1. Copy NYX OS to `/usr/local/bin/` or create a symlink
2. Create `~/.config/autostart/nyx-os.desktop` with content above
3. Or use your desktop environment's startup applications manager

## Advanced Desktop Integration

### File Associations
Make NYX OS handle specific file types:

#### Windows
```rust
// Register file associations in Windows registry
#[cfg(target_os = "windows")]
async fn register_file_associations() -> Result<(), String> {
    let hkcr = RegKey::predef(HKEY_CLASSES_ROOT);
    
    // Register .nyx files
    let nyx_key = hkcr.create_subkey(".nyx")
        .map_err(|e| format!("Failed to create .nyx key: {}", e))?;
    nyx_key.0.set_value("", &"NyxOSFile")
        .map_err(|e| format!("Failed to set default value: {}", e))?;
    
    // Register NYX OS as handler
    let handler_key = hkcr.create_subkey("NyxOSFile\\shell\\open\\command")
        .map_err(|e| format!("Failed to create handler key: {}", e))?;
    
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    
    handler_key.0.set_value("", &format!("\"{}\" \"%1\"", exe_path.to_string_lossy()))
        .map_err(|e| format!("Failed to set command: {}", e))?;
    
    Ok(())
}
```

### URL Protocol Handling
Make `nyx://` URLs open NYX OS:

```rust
// Register URL protocol
#[cfg(target_os = "windows")]
async fn register_url_protocol() -> Result<(), String> {
    let hkcr = RegKey::predef(HKEY_CLASSES_ROOT);
    
    let protocol_key = hkcr.create_subkey("nyx")
        .map_err(|e| format!("Failed to create protocol key: {}", e))?;
    
    protocol_key.0.set_value("", &"URL:NYX OS Protocol")
        .map_err(|e| format!("Failed to set description: {}", e))?;
    protocol_key.0.set_value("URL Protocol", &"")
        .map_err(|e| format!("Failed to set URL Protocol: {}", e))?;
    
    let command_key = hkcr.create_subkey("nyx\\shell\\open\\command")
        .map_err(|e| format!("Failed to create command key: {}", e))?;
    
    let exe_path = std::env::current_exe()
        .map_err(|e| format!("Failed to get exe path: {}", e))?;
    
    command_key.0.set_value("", &format!("\"{}\" \"%1\"", exe_path.to_string_lossy()))
        .map_err(|e| format!("Failed to set command: {}", e))?;
    
    Ok(())
}
```

### Global Keyboard Shortcuts
```rust
// Global hotkeys (requires additional crate: global-hotkey)
use global_hotkey::{GlobalHotKeyManager, hotkey::{HotKey, Modifiers, Code}};

#[tauri::command]
async fn register_global_shortcuts(app_handle: tauri::AppHandle) -> Result<(), String> {
    let manager = GlobalHotKeyManager::new()
        .map_err(|e| format!("Failed to create hotkey manager: {}", e))?;
    
    // Win/Cmd + Space to show NYX OS
    let hotkey = HotKey::new(Some(Modifiers::SUPER), Code::Space);
    
    manager.register(hotkey)
        .map_err(|e| format!("Failed to register hotkey: {}", e))?;
    
    // Store manager in app state for cleanup
    app_handle.manage(manager);
    
    Ok(())
}
```

## Installation Scripts

### Windows Installer (Advanced)
Create `scripts/windows-install.nsi` for NSIS installer:

```nsis
; NYX OS Installer Script
!include "MUI2.nsh"

Name "NYX OS"
OutFile "NYX-OS-Installer.exe"
InstallDir "$PROGRAMFILES64\NYX OS"

; Pages
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "LICENSE"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

; Installation
Section "NYX OS" SecMain
    SetOutPath "$INSTDIR"
    File "nyx-os.exe"
    File "*.dll"
    
    ; Create shortcuts
    CreateDirectory "$SMPROGRAMS\NYX OS"
    CreateShortcut "$SMPROGRAMS\NYX OS\NYX OS.lnk" "$INSTDIR\nyx-os.exe"
    CreateShortcut "$DESKTOP\NYX OS.lnk" "$INSTDIR\nyx-os.exe"
    
    ; Register file associations
    WriteRegStr HKCR ".nyx" "" "NyxOSFile"
    WriteRegStr HKCR "NyxOSFile\shell\open\command" "" '"$INSTDIR\nyx-os.exe" "%1"'
    
    ; Add to startup (optional)
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "NYX OS" "$INSTDIR\nyx-os.exe --minimize"
    
    ; Uninstaller
    WriteUninstaller "$INSTDIR\Uninstall.exe"
SectionEnd
```

### macOS App Bundle
Ensure proper app bundle structure:
```
NYX OS.app/
├── Contents/
│   ├── Info.plist
│   ├── MacOS/
│   │   └── nyx-os
│   └── Resources/
│       └── icon.icns
```

### Linux .desktop File
Create system-wide desktop entry:
```ini
[Desktop Entry]
Version=1.0
Type=Application
Name=NYX OS
Comment=NYX Operating System Interface
Icon=nyx-os
Exec=nyx-os
Terminal=false
Categories=System;Utility;
Keywords=os;desktop;interface;ai;
StartupNotify=true
MimeType=application/x-nyx;
```

## User Configuration

### Settings Integration
Create a settings panel for desktop integration:

```typescript
// In client/components/apps/DesktopIntegration.tsx
export const DesktopIntegration = () => {
  const [autoStartup, setAutoStartup] = useState(false)
  const [systemTray, setSystemTray] = useState(true)
  const [fileAssociations, setFileAssociations] = useState(false)
  
  const handleAutoStartupToggle = async () => {
    try {
      if (autoStartup) {
        await invoke('disable_auto_startup')
      } else {
        await invoke('enable_auto_startup')
      }
      setAutoStartup(!autoStartup)
    } catch (error) {
      console.error('Failed to toggle auto-startup:', error)
    }
  }
  
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Desktop Integration</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">Start with System</h3>
            <p className="text-sm text-gray-500">Launch NYX OS when your computer starts</p>
          </div>
          <button
            onClick={handleAutoStartupToggle}
            className={`toggle ${autoStartup ? 'enabled' : ''}`}
          >
            {autoStartup ? 'Enabled' : 'Disabled'}
          </button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">System Tray</h3>
            <p className="text-sm text-gray-500">Show NYX OS icon in system tray</p>
          </div>
          <button className="toggle enabled">Always On</button>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium">File Associations</h3>
            <p className="text-sm text-gray-500">Open .nyx files with NYX OS</p>
          </div>
          <button
            onClick={() => invoke('register_file_associations')}
            className="btn btn-primary"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  )
}
```

## Security Considerations

### Permission Management
- **Windows**: Requires administrator privileges for registry changes
- **macOS**: May require accessibility permissions for global shortcuts
- **Linux**: Requires write access to user directories

### User Consent
Always ask for user permission before:
- Adding to startup programs
- Registering file associations
- Installing global shortcuts
- Creating system-wide entries

### Sandboxing
Tauri's security model ensures:
- Limited file system access
- Restricted network permissions
- No access to sensitive system APIs without explicit permission

## Troubleshooting

### Common Issues
1. **Auto-startup not working**
   - Check permissions
   - Verify registry/plist/desktop file creation
   - Test with manual shortcuts first

2. **System tray not appearing**
   - Ensure system tray is enabled in OS
   - Check icon file exists and is valid
   - Verify Tauri system tray permissions

3. **File associations not working**
   - Run as administrator (Windows)
   - Check MIME type registration (Linux)
   - Verify Info.plist configuration (macOS)

### Debug Commands
```bash
# Check if auto-startup is registered
# Windows:
reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "NYX OS"

# macOS:
launchctl list | grep com.nyx.os

# Linux:
ls ~/.config/autostart/nyx-os.desktop
```

## Deployment Checklist

Before releasing with desktop integration:

- [ ] Test auto-startup on all platforms
- [ ] Verify system tray functionality
- [ ] Check file associations work correctly
- [ ] Test global shortcuts (if implemented)
- [ ] Verify uninstaller removes all entries
- [ ] Test with different user permission levels
- [ ] Validate security permissions are minimal
- [ ] Document all integration features for users

With these desktop integration features, NYX OS will truly feel like a native operating system that integrates seamlessly with the user's desktop environment! 🚀
