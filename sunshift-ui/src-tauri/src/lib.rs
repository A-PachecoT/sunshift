mod dbus;
mod tray;

use dbus::GammaRelayState;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
async fn get_temperature() -> Result<u16, String> {
    dbus::async_client::get_temperature()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_temperature(temperature: u16) -> Result<(), String> {
    dbus::async_client::set_temperature(temperature)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_brightness() -> Result<f64, String> {
    dbus::async_client::get_brightness()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_brightness(brightness: f64) -> Result<(), String> {
    dbus::async_client::set_brightness(brightness)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_gamma_state() -> Result<GammaRelayState, String> {
    dbus::async_client::get_state()
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn set_gamma_state(state: GammaRelayState) -> Result<(), String> {
    dbus::async_client::set_state(state)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_tray_icon(app: tauri::AppHandle, temperature: u16) -> Result<(), String> {
    tray::update_tray_icon(&app, temperature)
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Create system tray
            tray::create_tray(&app.handle())?;
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_temperature,
            set_temperature,
            get_brightness,
            set_brightness,
            get_gamma_state,
            set_gamma_state,
            update_tray_icon
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
