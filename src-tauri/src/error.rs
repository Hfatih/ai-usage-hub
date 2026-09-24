use serde::ser::{Serialize, Serializer};
use thiserror::Error;

#[derive(Debug, Error)]
pub enum HubError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("I/O error: {0}")]
    Io(#[from] std::io::Error),
    #[error("configuration error: {0}")]
    Configuration(String),
    #[error("application '{0}' was not found")]
    AppNotFound(String),
    #[error("application '{0}' has no valid executable configured")]
    NotLaunchable(String),
    #[error("operation failed: {0}")]
    Operation(String),
}

impl Serialize for HubError {
    fn serialize<S>(&self, serializer: S) -> std::result::Result<S::Ok, S::Error>
    where
        S: Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub type Result<T> = std::result::Result<T, HubError>;
