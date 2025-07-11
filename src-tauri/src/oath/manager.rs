use std::collections::HashMap;
use base64::Engine;
use rand::RngCore;
use reqwest::Client;
use serde_json::json;
use crate::oauth::{
    error::OAuthError,
    models::{IntercomUser, TokenResponse, OAuthConfig, AuthResult},
    server::CallbackServer,
};

pub struct TauriOAuthManager {
    config: OAuthConfig,
    client: Client,
}

impl TauriOAuthManager {
    pub fn new(config: OAuthConfig) -> Self {
        let client = Client::new();
        
        Self {
            config,
            client,
        }
    }

    pub async fn start_oauth_flow(&self) -> Result<AuthResult, OAuthError> {
        log::info!("Starting OAuth flow");
        
        let state = self.generate_random_state();
        let auth_url = self.build_authorization_url(&state);
        
        // Open browser
        self.open_browser(&auth_url)?;
        
        // Start callback server and wait for code
        let callback_server = CallbackServer::new(self.config.redirect_port);
        let auth_code = callback_server.start_and_wait_for_callback(state).await?;
        
        // Exchange code for token
        let access_token = self.exchange_code_for_token(&auth_code).await?;
        
        // Get user info
        let user = self.get_user_info(&access_token).await?;
        
        log::info!("OAuth flow completed successfully");
        
        Ok(AuthResult {
            access_token,
            user,
        })
    }

    pub async fn get_user_info(&self, access_token: &str) -> Result<IntercomUser, OAuthError> {
        log::debug!("Getting user info");
        
        let response = self.client
            .get("https://api.intercom.io/me")
            .header("accept", "application/json")
            .header("authorization", format!("Bearer {}", access_token))
            .send()
            .await?;

        if response.status().is_success() {
            let user = response.json::<IntercomUser>().await?;
            Ok(user)
        } else {
            let error_text = response.text().await.unwrap_or_default();
            Err(OAuthError::Network(format!("Failed to get user info: {}", error_text)))
        }
    }

    fn generate_random_state(&self) -> String {
        let mut bytes = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut bytes);
        base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(bytes)
    }

    fn build_authorization_url(&self, state: &str) -> String {
        format!(
            "https://app.intercom.com/oauth?client_id={}&state={}",
            self.config.client_id,
            state
        )
    }

    fn open_browser(&self, url: &str) -> Result<(), OAuthError> {
        match open::that(url) {
            Ok(_) => {
                log::info!("Opened browser for OAuth authorization");
                Ok(())
            }
            Err(e) => {
                log::warn!("Failed to open browser: {}", e);
                log::info!("Please open this URL in your browser: {}", url);
                Ok(())
            }
        }
    }

    async fn exchange_code_for_token(&self, code: &str) -> Result<String, OAuthError> {
        let mut form_data = HashMap::new();
        form_data.insert("code", code);
        form_data.insert("client_id", &self.config.client_id);
        form_data.insert("client_secret", &self.config.client_secret);

        let response = self.client
            .post("https://api.intercom.io/auth/eagle/token")
            .form(&form_data)
            .send()
            .await?;

        if response.status().is_success() {
            let token_response = response.json::<TokenResponse>().await?;
            Ok(token_response.access_token)
        } else {
            let error_text = response.text().await.unwrap_or_default();
            Err(OAuthError::TokenExchange(format!("Failed to exchange code for token: {}", error_text)))
        }
    }
}