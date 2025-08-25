// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem};

// System information commands
#[tauri::command]
async fn get_system_info() -> Result<serde_json::Value, String> {
    let cpu_count = std::thread::available_parallelism()
        .map(|n| n.get())
        .unwrap_or(1);
    
    let system_info = serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "cpu_count": cpu_count,
        "hostname": gethostname::gethostname().to_string_lossy(),
    });
    
    Ok(system_info)
}

// Window management commands
#[tauri::command]
async fn set_window_always_on_top(window: tauri::Window, always_on_top: bool) -> Result<(), String> {
    window.set_always_on_top(always_on_top).map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_window_fullscreen(window: tauri::Window, fullscreen: bool) -> Result<(), String> {
    window.set_fullscreen(fullscreen).map_err(|e| e.to_string())
}

#[tauri::command]
async fn minimize_window(window: tauri::Window) -> Result<(), String> {
    window.minimize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn maximize_window(window: tauri::Window) -> Result<(), String> {
    window.maximize().map_err(|e| e.to_string())
}

#[tauri::command]
async fn hide_window(window: tauri::Window) -> Result<(), String> {
    window.hide().map_err(|e| e.to_string())
}

#[tauri::command]
async fn show_window(window: tauri::Window) -> Result<(), String> {
    window.show().map_err(|e| e.to_string())
}

// App launching commands
#[tauri::command]
async fn launch_external_app(app_path: String) -> Result<(), String> {
    std::process::Command::new(&app_path)
        .spawn()
        .map_err(|e| format!("Failed to launch app: {}", e))?;
    Ok(())
}

// File system commands
#[tauri::command]
async fn get_desktop_apps() -> Result<Vec<serde_json::Value>, String> {
    // This is a placeholder - you'd implement actual app discovery based on OS
    let apps = vec![
        serde_json::json!({
            "name": "File Manager",
            "path": if cfg!(windows) { "explorer.exe" } else { "nautilus" },
            "icon": "folder"
        }),
        serde_json::json!({
            "name": "Terminal", 
            "path": if cfg!(windows) { "cmd.exe" } else { "gnome-terminal" },
            "icon": "terminal"
        }),
        serde_json::json!({
            "name": "Web Browser",
            "path": if cfg!(windows) { "msedge.exe" } else { "firefox" },
            "icon": "globe"
        })
    ];
    
    Ok(apps)
}

// Performance monitoring
#[tauri::command]
async fn get_performance_info() -> Result<serde_json::Value, String> {
    // Basic performance info - you could expand this with system metrics
    let perf_info = serde_json::json!({
        "memory_usage": "Unknown", // You'd implement actual memory monitoring
        "cpu_usage": "Unknown",    // You'd implement actual CPU monitoring
        "timestamp": chrono::Utc::now().timestamp()
    });
    
    Ok(perf_info)
}

fn main() {
    // Create system tray
    let quit = CustomMenuItem::new("quit".to_string(), "Quit NYX OS");
    let show = CustomMenuItem::new("show".to_string(), "Show NYX OS");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide NYX OS");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick {
                position: _,
                size: _,
                ..
            } => {
                // Show main window on left click
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                    window.set_focus().unwrap();
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                _ => {}
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            get_system_info,
            set_window_always_on_top,
            set_window_fullscreen,
            minimize_window,
            maximize_window,
            hide_window,
            show_window,
            launch_external_app,
            get_desktop_apps,
            get_performance_info
        ])
        .setup(|app| {
            let main_window = app.get_window("main").unwrap();

            // Set up window properties
            main_window.set_title("NYX OS").unwrap();

            // Start in fullscreen mode for that OS experience
            main_window.set_fullscreen(true).unwrap();

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
