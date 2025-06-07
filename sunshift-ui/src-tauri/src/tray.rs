use image::{ImageBuffer, Rgba};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{TrayIcon, TrayIconBuilder, TrayIconEvent},
    Manager, Runtime, Emitter,
};

/// Generate a dynamic tray icon based on the current temperature
pub fn generate_icon(temperature: u16) -> Vec<u8> {
    let size = 32;
    let mut img = ImageBuffer::<Rgba<u8>, Vec<u8>>::new(size, size);
    
    // Determine color based on temperature
    let (r, g, b) = match temperature {
        0..=3000 => (255, 100, 50),      // Very warm/red
        3001..=3500 => (255, 140, 70),   // Warm orange
        3501..=4000 => (255, 180, 90),   // Orange
        4001..=4500 => (255, 210, 120),  // Light orange
        4501..=5000 => (255, 230, 150),  // Yellow-orange
        5001..=5500 => (255, 250, 180),  // Light yellow
        5501..=6000 => (240, 240, 200),  // Neutral
        6001..=6500 => (200, 220, 255),  // Light blue
        _ => (150, 200, 255),            // Blue
    };
    
    // Draw a circular icon
    let center = size as f32 / 2.0;
    let radius = (size as f32 / 2.0) - 2.0;
    
    for (x, y, pixel) in img.enumerate_pixels_mut() {
        let dx = x as f32 - center;
        let dy = y as f32 - center;
        let distance = (dx * dx + dy * dy).sqrt();
        
        if distance <= radius {
            // Add gradient effect
            let intensity = 1.0 - (distance / radius) * 0.3;
            *pixel = Rgba([
                (r as f32 * intensity) as u8,
                (g as f32 * intensity) as u8,
                (b as f32 * intensity) as u8,
                255,
            ]);
        } else {
            *pixel = Rgba([0, 0, 0, 0]); // Transparent background
        }
    }
    
    // Convert to PNG bytes
    let mut png_data = Vec::new();
    img.write_to(&mut std::io::Cursor::new(&mut png_data), image::ImageFormat::Png)
        .expect("Failed to write PNG");
    
    png_data
}

/// Create the system tray with menu
pub fn create_tray<R: Runtime>(app: &tauri::AppHandle<R>) -> Result<TrayIcon<R>, Box<dyn std::error::Error>> {
    let menu = Menu::new(app)?;
    
    // Add menu items
    let day_preset = MenuItem::with_id(app, "preset_day", "Day (6500K)", true, None::<&str>)?;
    let evening_preset = MenuItem::with_id(app, "preset_evening", "Evening (4500K)", true, None::<&str>)?;
    let night_preset = MenuItem::with_id(app, "preset_night", "Night (3000K)", true, None::<&str>)?;
    let separator = PredefinedMenuItem::separator(app)?;
    let show_window = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    
    menu.append(&day_preset)?;
    menu.append(&evening_preset)?;
    menu.append(&night_preset)?;
    menu.append(&separator)?;
    menu.append(&show_window)?;
    menu.append(&quit)?;
    
    // Create initial icon (default temperature)
    let icon_data = generate_icon(6500);
    let icon = tauri::image::Image::from_bytes(&icon_data)?;
    
    let tray = TrayIconBuilder::with_id("main")
        .icon(icon)
        .menu(&menu)
        .tooltip("Sunshift - Click to open quick controls")
        .on_menu_event(move |app, event| {
            match event.id.as_ref() {
                "preset_day" => {
                    app.emit("apply_preset", "day").unwrap();
                }
                "preset_evening" => {
                    app.emit("apply_preset", "evening").unwrap();
                }
                "preset_night" => {
                    app.emit("apply_preset", "night").unwrap();
                }
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .on_tray_icon_event(move |tray, event| {
            match event {
                TrayIconEvent::Click { button, .. } => {
                    if button == tauri::tray::MouseButton::Left {
                        // Emit event to show quick control popup
                        if let Some(window) = tray.app_handle().get_webview_window("main") {
                            window.emit("toggle_quick_control", ()).unwrap();
                        }
                    }
                }
                _ => {}
            }
        })
        .build(app)?;
    
    Ok(tray)
}

/// Update the tray icon based on current temperature
pub fn update_tray_icon<R: Runtime>(app: &tauri::AppHandle<R>, temperature: u16) -> Result<(), Box<dyn std::error::Error>> {
    let icon_data = generate_icon(temperature);
    let icon = tauri::image::Image::from_bytes(&icon_data)?;
    
    if let Some(tray) = app.tray_by_id("main") {
        tray.set_icon(Some(icon))?;
        tray.set_tooltip(Some(&format!("Sunshift - {}K", temperature)))?;
    }
    
    Ok(())
} 