use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct IntercomUser {
    pub id: String,
    pub name: Option<String>,
    pub email: Option<String>,
    pub app: Option<IntercomApp>,
    pub avatar: Option<Avatar>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct IntercomApp {
    pub id_code: String,
    pub name: String,
    pub created_at: i64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Avatar {
    pub image_url: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub token_type: String,
    pub expires_in: Option<i64>,
    pub scope: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OAuthConfig {
    pub client_id: String,
    pub client_secret: String,
    pub redirect_port: u16,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthResult {
    pub access_token: String,
    pub user: IntercomUser,
}

// src-tauri/src/oauth/server.rs
use std::sync::Arc;
use tokio::sync::{oneshot, Mutex};
use warp::Filter;
use crate::oauth::error::OAuthError;

pub struct CallbackServer {
    port: u16,
    sender: Arc<Mutex<Option<oneshot::Sender<Result<String, OAuthError>>>>>,
    expected_state: Arc<Mutex<Option<String>>>,
}

impl CallbackServer {
    pub fn new(port: u16) -> Self {
        Self {
            port,
            sender: Arc::new(Mutex::new(None)),
            expected_state: Arc::new(Mutex::new(None)),
        }
    }

    pub async fn start_and_wait_for_callback(&self, expected_state: String) -> Result<String, OAuthError> {
        let (tx, rx) = oneshot::channel();
        
        // Store the sender and expected state
        *self.sender.lock().await = Some(tx);
        *self.expected_state.lock().await = Some(expected_state);

        // Clone for move into closure
        let sender = self.sender.clone();
        let expected_state = self.expected_state.clone();

        let callback = warp::path("callback")
            .and(warp::query::<std::collections::HashMap<String, String>>())
            .and_then(move |params: std::collections::HashMap<String, String>| {
                let sender = sender.clone();
                let expected_state = expected_state.clone();
                
                async move {
                    let mut sender_guard = sender.lock().await;
                    let expected_state_guard = expected_state.lock().await;
                    
                    if let Some(tx) = sender_guard.take() {
                        let result = Self::handle_callback(params, expected_state_guard.as_ref()).await;
                        let _ = tx.send(result);
                    }
                    
                    Ok::<_, warp::Rejection>(Self::create_response())
                }
            });

        // Start server
        let server = warp::serve(callback)
            .run(([127, 0, 0, 1], self.port));

        tokio::spawn(server);

        // Wait for callback
        rx.await.map_err(|_| OAuthError::Server("Callback receiver dropped".to_string()))?
    }

    async fn handle_callback(
        params: std::collections::HashMap<String, String>,
        expected_state: Option<&String>,
    ) -> Result<String, OAuthError> {
        // Check for error parameters
        if let Some(error) = params.get("error") {
            let description = params.get("error_description")
                .map(|s| s.clone())
                .unwrap_or_else(|| "Unknown error".to_string());
            return Err(OAuthError::AuthorizationFailed {
                error: error.clone(),
                description,
            });
        }

        // Get code
        let code = params.get("code")
            .ok_or_else(|| OAuthError::AuthorizationFailed {
                error: "missing_code".to_string(),
                description: "Authorization code not provided".to_string(),
            })?;

        // Verify state
        if let Some(state) = params.get("state") {
            if let Some(expected) = expected_state {
                if state != expected {
                    return Err(OAuthError::InvalidState);
                }
            }
        }

        Ok(code.clone())
    }

    fn create_response() -> warp::reply::Html<&'static str> {
        warp::reply::html(r#"
            <!DOCTYPE html>
            <html>
            <head>
                <title>Authorization Successful</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; margin-top: 50px; }
                    .success { color: #28a745; }
                </style>
            </head>
            <body>
                <h2 class="success">✅ Authorization Successful!</h2>
                <p>You can close this window and return to the application.</p>
                <script>
                    setTimeout(() => window.close(), 2000);
                </script>
            </body>
            </html>
        "#)
    }
}