mod oauth;

use oauth::{
    manager::TauriOAuthManager,
    models::{OAuthConfig, AuthResult},
    error::OAuthError,
};
use tauri::State;
use std::sync::Mutex;

// Global state for the OAuth manager
struct OAuthState {
    manager: Mutex<Option<TauriOAuthManager>>,
}

#[tauri::command]
async fn initialize_oauth(
    client_id: String,
    client_secret: String,
    redirect_port: Option<u16>,
    state: State<'_, OAuthState>,
) -> Result<(), String> {
    let config = OAuthConfig {
        client_id,
        client_secret,
        redirect_port: redirect_port.unwrap_or(8080),
    };

    let manager = TauriOAuthManager::new(config);
    *state.manager.lock().unwrap() = Some(manager);
    
    Ok(())
}

#[tauri::command]
async fn start_oauth_flow(state: State<'_, OAuthState>) -> Result<AuthResult, String> {
    let manager = state.manager.lock().unwrap();
    
    if let Some(manager) = manager.as_ref() {
        manager.start_oauth_flow().await
            .map_err(|e| e.to_string())
    } else {
        Err("OAuth manager not initialized".to_string())
    }
}

#[tauri::command]
async fn get_user_info(
    access_token: String,
    state: State<'_, OAuthState>,
) -> Result<oauth::models::IntercomUser, String> {
    let manager = state.manager.lock().unwrap();
    
    if let Some(manager) = manager.as_ref() {
        manager.get_user_info(&access_token).await
            .map_err(|e| e.to_string())
    } else {
        Err("OAuth manager not initialized".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(OAuthState {
            manager: Mutex::new(None),
        })
        .invoke_handler(tauri::generate_handler![
            initialize_oauth,
            start_oauth_flow,
            get_user_info
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}