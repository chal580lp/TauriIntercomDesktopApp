use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Error, Debug, Serialize, Deserialize)]
pub enum OAuthError {
    #[error("Network error: {0}")]
    Network(String),
    #[error("Invalid state parameter - possible CSRF attack")]
    InvalidState,
    #[error("Authorization failed: {error} - {description}")]
    AuthorizationFailed { error: String, description: String },
    #[error("Token exchange failed: {0}")]
    TokenExchange(String),
    #[error("Server error: {0}")]
    Server(String),
    #[error("Serialization error: {0}")]
    Serialization(String),
}

impl From<reqwest::Error> for OAuthError {
    fn from(err: reqwest::Error) -> Self {
        OAuthError::Network(err.to_string())
    }
}

impl From<serde_json::Error> for OAuthError {
    fn from(err: serde_json::Error) -> Self {
        OAuthError::Serialization(err.to_string())
    }
}
