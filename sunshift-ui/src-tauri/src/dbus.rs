use zbus::{blocking::Connection, Result};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GammaRelayState {
    pub temperature: u16,
    pub brightness: f64,
}

pub struct DBusClient {
    connection: Connection,
}

impl DBusClient {
    pub fn new() -> Result<Self> {
        let connection = Connection::session()?;
        Ok(Self { connection })
    }

    pub fn get_temperature(&self) -> Result<u16> {
        let reply = self.connection
            .call_method(
                Some("rs.wl-gammarelay"),
                "/",
                Some("org.freedesktop.DBus.Properties"),
                "Get",
                &("rs.wl.gammarelay", "Temperature"),
            )?;
        
        // Deserialize the variant directly
        let temperature: zbus::zvariant::OwnedValue = reply.body().deserialize()?;
        let temp_value: u16 = temperature.try_into()
            .map_err(|_| zbus::Error::Failure("Failed to parse temperature".into()))?;
        Ok(temp_value)
    }

    pub fn set_temperature(&self, temperature: u16) -> Result<()> {
        let value = zbus::zvariant::Value::new(temperature);
        self.connection
            .call_method(
                Some("rs.wl-gammarelay"),
                "/",
                Some("org.freedesktop.DBus.Properties"),
                "Set",
                &("rs.wl.gammarelay", "Temperature", value),
            )?;
        Ok(())
    }

    pub fn get_brightness(&self) -> Result<f64> {
        let reply = self.connection
            .call_method(
                Some("rs.wl-gammarelay"),
                "/",
                Some("org.freedesktop.DBus.Properties"),
                "Get",
                &("rs.wl.gammarelay", "Brightness"),
            )?;
        
        // Deserialize the variant directly
        let brightness: zbus::zvariant::OwnedValue = reply.body().deserialize()?;
        let brightness_value: f64 = brightness.try_into()
            .map_err(|_| zbus::Error::Failure("Failed to parse brightness".into()))?;
        Ok(brightness_value)
    }

    pub fn set_brightness(&self, brightness: f64) -> Result<()> {
        let value = zbus::zvariant::Value::new(brightness);
        self.connection
            .call_method(
                Some("rs.wl-gammarelay"),
                "/",
                Some("org.freedesktop.DBus.Properties"),
                "Set",
                &("rs.wl.gammarelay", "Brightness", value),
            )?;
        Ok(())
    }

    pub fn get_state(&self) -> Result<GammaRelayState> {
        let temperature = self.get_temperature()?;
        let brightness = self.get_brightness()?;
        Ok(GammaRelayState {
            temperature,
            brightness,
        })
    }

    pub fn set_state(&self, state: &GammaRelayState) -> Result<()> {
        self.set_temperature(state.temperature)?;
        self.set_brightness(state.brightness)?;
        Ok(())
    }
}

// Async wrapper for Tauri commands
pub mod async_client {
    use super::*;
    use tokio::task;

    pub async fn get_temperature() -> Result<u16> {
        task::spawn_blocking(|| {
            let client = DBusClient::new()?;
            client.get_temperature()
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }

    pub async fn set_temperature(temperature: u16) -> Result<()> {
        task::spawn_blocking(move || {
            let client = DBusClient::new()?;
            client.set_temperature(temperature)
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }

    pub async fn get_brightness() -> Result<f64> {
        task::spawn_blocking(|| {
            let client = DBusClient::new()?;
            client.get_brightness()
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }

    pub async fn set_brightness(brightness: f64) -> Result<()> {
        task::spawn_blocking(move || {
            let client = DBusClient::new()?;
            client.set_brightness(brightness)
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }

    pub async fn get_state() -> Result<GammaRelayState> {
        task::spawn_blocking(|| {
            let client = DBusClient::new()?;
            client.get_state()
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }

    pub async fn set_state(state: GammaRelayState) -> Result<()> {
        task::spawn_blocking(move || {
            let client = DBusClient::new()?;
            client.set_state(&state)
        })
        .await
        .map_err(|e| zbus::Error::Failure(e.to_string()))?
    }
} 