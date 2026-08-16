use chrono::Local;
use ring::{aead, pbkdf2, rand::SecureRandom};
use serde::{Deserialize, Serialize};
use sqlx::{Pool, Sqlite};
use std::{num::NonZeroU32, str::FromStr};
use tauri::{AppHandle, Manager};

// PBKDF2 parameters — must match the WebCrypto parameters used by the frontend
// so that data encrypted in JS can be decrypted in Rust and vice versa.
const PBKDF2_ITERATIONS: u32 = 100_000;
const PBKDF2_SALT: &[u8] = b"unique_salt";
const KEY_LENGTH: usize = 256 / 8; // 32 bytes for AES-256

// AES-GCM nonce length (must be 12 bytes for WebCrypto compatibility)
const NONCE_LENGTH: usize = 12;

// Password length for the generated nanoid-like secret
const PASSWORD_LENGTH: usize = 21;

/// Returns up to `max_chars` characters of a string for log output.
/// Slicing by byte index would panic on multi-byte UTF-8 boundaries.
fn log_preview(value: &str, max_chars: usize) -> &str {
    match value.char_indices().nth(max_chars) {
        Some((index, _)) => &value[..index],
        None => value,
    }
}

// =============================================================================
// Encrypted payload format
// =============================================================================

/// The JSON shape stored in the `data` column of `user_data`.
/// This matches the WebCrypto `{ iv, data }` format used by the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EncryptedPayload {
    /// AES-GCM initialization vector (12 random bytes)
    pub iv: Vec<u8>,
    /// Ciphertext + 16-byte authentication tag (appended by AES-GCM)
    pub data: Vec<u8>,
}

// =============================================================================
// Core crypto functions
// =============================================================================

/// Derive an AES-256-GCM key from a password using PBKDF2.
///
/// Uses the same parameters as the frontend WebCrypto implementation:
/// - PBKDF2-HMAC-SHA256
/// - 100,000 iterations
/// - Salt: `"unique_salt"`
/// - Key length: 256 bits
fn derive_key(password: &str) -> Option<aead::LessSafeKey> {
    let iterations = NonZeroU32::new(PBKDF2_ITERATIONS)?;
    let mut key_bytes = [0_u8; KEY_LENGTH];

    pbkdf2::derive(
        pbkdf2::PBKDF2_HMAC_SHA256,
        iterations,
        PBKDF2_SALT,
        password.as_bytes(),
        &mut key_bytes,
    );

    let unbound_key = aead::UnboundKey::new(&aead::AES_256_GCM, &key_bytes).ok()?;
    Some(aead::LessSafeKey::new(unbound_key))
}

/// Encrypt plaintext using AES-256-GCM with a password-derived key.
///
/// Returns a JSON-serialized `EncryptedPayload` containing the random IV
/// and ciphertext. The IV is prepended to make decryption possible.
///
/// This is the Rust equivalent of `encryptData()` in `cryptoUtils.ts`.
pub fn encrypt_data(plain_text: &str, password: &str) -> Option<String> {
    let key = derive_key(password)?;

    // Generate a random 12-byte IV (nonce)
    let rng = ring::rand::SystemRandom::new();
    let mut iv = [0_u8; NONCE_LENGTH];
    rng.fill(&mut iv).ok()?;

    let nonce = aead::Nonce::try_assume_unique_for_key(&iv).ok()?;

    let mut in_out = plain_text.as_bytes().to_vec();
    let key_ref = &key;

    // AES-GCM appends a 16-byte auth tag to the ciphertext
    key_ref
        .seal_in_place_append_tag(nonce, aead::Aad::empty(), &mut in_out)
        .ok()?;

    let payload = EncryptedPayload {
        iv: iv.to_vec(),
        data: in_out,
    };

    serde_json::to_string(&payload).ok()
}

/// Decrypt an AES-256-GCM encrypted payload using a password-derived key.
///
/// Expects the input to be a JSON-serialized `EncryptedPayload` (the format
/// produced by both the frontend `encryptData()` and the Rust `encrypt_data()`).
///
/// This is the Rust equivalent of `decryptData()` in `cryptoUtils.ts`.
pub fn decrypt_data(encrypted_text: &str, password: &str) -> Option<String> {
    let payload: EncryptedPayload = match serde_json::from_str(encrypted_text) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("[Crypto] Failed to parse encrypted payload: {e}");
            eprintln!("[Crypto] Input (first 100 chars): {}", log_preview(encrypted_text, 100));
            return None;
        }
    };

    let key = match derive_key(password) {
        Some(k) => k,
        None => {
            eprintln!("[Crypto] Failed to derive key from password");
            return None;
        }
    };

    let nonce = match aead::Nonce::try_assume_unique_for_key(&payload.iv) {
        Ok(n) => n,
        Err(e) => {
            eprintln!("[Crypto] Invalid nonce (iv length: {}): {e}", payload.iv.len());
            return None;
        }
    };

    let mut in_out = payload.data;

    let plaintext = match key.open_in_place(nonce, aead::Aad::empty(), &mut in_out) {
        Ok(p) => p,
        Err(e) => {
            eprintln!("[Crypto] Decryption failed (wrong password or corrupted data): {e}");
            return None;
        }
    };

    String::from_utf8(plaintext.to_vec()).ok()
}

/// Generate a cryptographically random nanoid-like password.
///
/// Produces a 21-character string using the URL-safe alphabet
/// `[A-Za-z0-9_-]`, identical in format to `nanoid()` from the frontend.
fn generate_password() -> Option<String> {
    let rng = ring::rand::SystemRandom::new();
    let mut bytes = [0_u8; PASSWORD_LENGTH];
    rng.fill(&mut bytes).ok()?;

    const ALPHABET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";

    let password: String = bytes
        .iter()
        .map(|&b| ALPHABET[b as usize % ALPHABET.len()] as char)
        .collect();

    Some(password)
}

// =============================================================================
// Database operations
// =============================================================================

/// Open (or create) a SQLite connection to `basicapplicationdata.db`.
///
/// This is the same database used by the frontend for storing install data
/// and by `reminder_scheduler.rs` for trial checks.
async fn open_user_db(app_handle: &AppHandle) -> Result<Pool<Sqlite>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let db_path = app_data_dir.join("basicapplicationdata.db");
    let url = format!("sqlite://{}", db_path.display());

    sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(
            sqlx::sqlite::SqliteConnectOptions::from_str(&url)
                .map_err(|e| e.to_string())?
                .create_if_missing(true),
        )
        .await
        .map_err(|e| e.to_string())
}

/// Ensure the `user_data` table exists and has an entry with `id = 1`.
///
/// On first launch this:
/// 1. Creates the `user_data` table if it doesn't exist
/// 2. Generates a random 21-character password
/// 3. Encrypts today's date (`YYYY-MM-DD`) with that password
/// 4. Stores `{ id: 1, unique_nano_id: password, data: encrypted_json }`
///
/// On subsequent launches this is a no-op (the entry already exists).
///
/// This replaces `EncryptionComponent.tsx` — the frontend no longer needs
/// to do any encryption or database setup.
#[tauri::command]
pub async fn ensure_install_data(app_handle: AppHandle) -> Result<(), String> {
    let pool = open_user_db(&app_handle).await?;

    // Create table if it doesn't exist
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS user_data (
            id INTEGER PRIMARY KEY,
            unique_nano_id TEXT,
            data TEXT
        )",
    )
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    // Check if entry already exists
    let existing: Option<(i64,)> = sqlx::query_as("SELECT id FROM user_data WHERE id = 1")
        .fetch_optional(&pool)
        .await
        .map_err(|e| e.to_string())?;

    if existing.is_some() {
        return Ok(()); // Already initialized
    }

    // Generate password and encrypt today's install date
    let password =
        generate_password().ok_or_else(|| "Failed to generate random password".to_string())?;

    let today = Local::now().format("%Y-%m-%d").to_string();
    let encrypted = encrypt_data(&today, &password)
        .ok_or_else(|| "Failed to encrypt install date".to_string())?;

    sqlx::query("INSERT INTO user_data (id, unique_nano_id, data) VALUES (1, ?, ?)")
        .bind(&password)
        .bind(&encrypted)
        .execute(&pool)
        .await
        .map_err(|e| e.to_string())?;

    println!("[Crypto] Install data initialized for {}", today);
    Ok(())
}

/// Retrieve and decrypt the install date from the database.
///
/// Reads the encrypted date from `user_data`, decrypts it using the stored
/// password (`unique_nano_id`), and returns the plaintext date string
/// (e.g., `"2026-07-07"`).
///
/// This replaces `useDecryptedDate.ts` — the frontend no longer needs
/// to do any decryption.
///
/// Returns `None` if the data doesn't exist or decryption fails.
#[tauri::command]
pub async fn get_install_date(app_handle: AppHandle) -> Result<Option<String>, String> {
    let pool = open_user_db(&app_handle).await?;

    let row: Option<(String, String)> =
        sqlx::query_as("SELECT unique_nano_id, data FROM user_data WHERE id = 1")
            .fetch_optional(&pool)
            .await
            .map_err(|e| e.to_string())?;

    let Some((password, encrypted_data)) = row else {
        return Ok(None);
    };

    let date = decrypt_data(&encrypted_data, &password);
    Ok(date)
}

// =============================================================================
// License info
// =============================================================================

/// Info about the user's license, decrypted from `blink_eye_license.db`.
#[derive(Debug, Clone, Serialize)]
pub struct LicenseInfo {
    /// Full decrypted license key
    pub license_key: Option<String>,
    /// Decrypted status string (e.g., "active", "inactive", "expired")
    pub status: Option<String>,
    /// Whether the status is "active"
    pub is_paid: bool,
    /// Last validated date (YYYY-MM-DD)
    pub last_validated: Option<String>,
}

/// Open (or create) a SQLite connection to `blink_eye_license.db`.
async fn open_license_db(app_handle: &AppHandle) -> Result<Pool<Sqlite>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let db_path = app_data_dir.join("blink_eye_license.db");
    let url = format!("sqlite://{}", db_path.display());

    sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(
            sqlx::sqlite::SqliteConnectOptions::from_str(&url)
                .map_err(|e| e.to_string())?
                .create_if_missing(true),
        )
        .await
        .map_err(|e| e.to_string())
}

/// Ensure the `licenses` table exists.
async fn ensure_license_table(pool: &Pool<Sqlite>) -> Result<(), String> {
    sqlx::query(
        "CREATE TABLE IF NOT EXISTS licenses (
            id INTEGER PRIMARY KEY,
            license_key TEXT UNIQUE,
            status TEXT,
            activation_limit TEXT,
            activation_usage TEXT,
            created_at TEXT,
            expires_at TEXT,
            test_mode TEXT,
            instance_name TEXT,
            store_id TEXT,
            order_id TEXT,
            order_item_id TEXT,
            variant_name TEXT,
            product_name TEXT,
            customer_name TEXT,
            customer_email TEXT,
            last_validated TEXT
        )",
    )
    .execute(pool)
    .await
    .map_err(|e| e.to_string())?;
    Ok(())
}

/// Retrieve and decrypt license info from the database.
///
/// Reads from `blink_eye_license.db`, decrypts the license key and status
/// using the password stored in `basicapplicationdata.db`.
#[tauri::command]
pub async fn get_license_info(app_handle: AppHandle) -> Result<LicenseInfo, String> {
    let pool = open_license_db(&app_handle).await?;
    ensure_license_table(&pool).await?;

    let row: Option<(String, String, String)> = sqlx::query_as(
        "SELECT license_key, status, last_validated FROM licenses LIMIT 1",
    )
    .fetch_optional(&pool)
    .await
    .map_err(|e| e.to_string())?;

    let Some((encrypted_key, encrypted_status, encrypted_validated)) = row else {
        println!("[Crypto] No license row found in licenses table");
        return Ok(LicenseInfo {
            license_key: None,
            status: None,
            is_paid: false,
            last_validated: None,
        });
    };

    println!("[Crypto] Raw license_key (first 80 chars): {}", log_preview(&encrypted_key, 80));
    println!("[Crypto] Raw status (first 80 chars): {}", log_preview(&encrypted_status, 80));

    // Get the decryption password from basicapplicationdata.db
    let user_pool = open_user_db(&app_handle).await?;
    let password_row: Option<(String,)> =
        sqlx::query_as("SELECT unique_nano_id FROM user_data WHERE id = 1")
            .fetch_optional(&user_pool)
            .await
            .map_err(|e| e.to_string())?;

    let Some((password,)) = password_row else {
        println!("[Crypto] No password found in user_data");
        return Ok(LicenseInfo {
            license_key: None,
            status: None,
            is_paid: false,
            last_validated: None,
        });
    };

    println!("[Crypto] Password (first 8 chars): {}", log_preview(&password, 8));

    let key = decrypt_data(&encrypted_key, &password);
    let status = decrypt_data(&encrypted_status, &password);
    let last_validated = decrypt_data(&encrypted_validated, &password);

    let is_paid = status.as_deref() == Some("active");

    Ok(LicenseInfo {
        license_key: key,
        status,
        is_paid,
        last_validated,
    })
}

/// Store full license data (from API response) — encrypts all fields.
#[tauri::command]
pub async fn store_license_data(app_handle: AppHandle, data: serde_json::Value) -> Result<(), String> {
    let pool = open_license_db(&app_handle).await?;
    ensure_license_table(&pool).await?;

    // Get the encryption password from basicapplicationdata.db
    let user_pool = open_user_db(&app_handle).await?;
    let password_row: Option<(String,)> =
        sqlx::query_as("SELECT unique_nano_id FROM user_data WHERE id = 1")
            .fetch_optional(&user_pool)
            .await
            .map_err(|e| e.to_string())?;

    let Some((password,)) = password_row else {
        return Err("No encryption password found in user_data".into());
    };

    let license = data.get("license_key").cloned().unwrap_or_default();
    let meta = data.get("meta").cloned().unwrap_or_default();
    let instance = data.get("instance").cloned().unwrap_or_default();

    let today = Local::now().format("%Y-%m-%d").to_string();

    let enc = |val: &serde_json::Value| -> Option<String> {
        let s = if val.is_string() {
            val.as_str().unwrap_or("").to_string()
        } else if val.is_null() {
            String::new()
        } else {
            val.to_string()
        };
        encrypt_data(&s, &password)
    };

    let fields: Vec<Option<String>> = vec![
        enc(&license.get("key").cloned().unwrap_or_default()),
        enc(&license.get("status").cloned().unwrap_or_default()),
        enc(&license.get("activation_limit").cloned().unwrap_or_default()),
        enc(&license.get("activation_usage").cloned().unwrap_or_default()),
        enc(&license.get("created_at").cloned().unwrap_or_default()),
        enc(&license.get("expires_at").cloned().unwrap_or_default()),
        enc(&license.get("test_mode").cloned().unwrap_or_default()),
        enc(&instance.get("name").cloned().unwrap_or_default()),
        enc(&meta.get("store_id").cloned().unwrap_or_default()),
        enc(&meta.get("order_id").cloned().unwrap_or_default()),
        enc(&meta.get("order_item_id").cloned().unwrap_or_default()),
        enc(&meta.get("variant_name").cloned().unwrap_or_default()),
        enc(&meta.get("product_name").cloned().unwrap_or_default()),
        enc(&meta.get("customer_name").cloned().unwrap_or_default()),
        enc(&meta.get("customer_email").cloned().unwrap_or_default()),
        enc(&serde_json::Value::String(today)),
    ];

    // Build bind placeholders dynamically
    let placeholders: Vec<&str> = fields.iter().map(|_| "?").collect();
    let sql = format!(
        "INSERT OR REPLACE INTO licenses (
            id, license_key, status, activation_limit, activation_usage,
            created_at, expires_at, test_mode, instance_name, store_id,
            order_id, order_item_id, variant_name, product_name,
            customer_name, customer_email, last_validated
        ) VALUES (1, {})",
        placeholders.join(", ")
    );

    let mut query = sqlx::query(&sql);
    for field in &fields {
        query = query.bind(field.as_deref().unwrap_or(""));
    }
    query.execute(&pool).await.map_err(|e| e.to_string())?;

    println!("[Crypto] License data stored successfully");
    Ok(())
}

/// Update specific license fields (encrypts values before writing).
///
/// Only keys that are actual columns of the `licenses` table are accepted;
/// anything else is rejected so the column name can never be injected into
/// the SQL statement.
#[tauri::command]
pub async fn update_license_fields(
    app_handle: AppHandle,
    fields: serde_json::Value,
) -> Result<(), String> {
    const ALLOWED_COLUMNS: &[&str] = &[
        "license_key",
        "status",
        "activation_limit",
        "activation_usage",
        "created_at",
        "expires_at",
        "test_mode",
        "instance_name",
        "store_id",
        "order_id",
        "order_item_id",
        "variant_name",
        "product_name",
        "customer_name",
        "customer_email",
        "last_validated",
    ];

    let pool = open_license_db(&app_handle).await?;
    ensure_license_table(&pool).await?;

    let user_pool = open_user_db(&app_handle).await?;
    let password_row: Option<(String,)> =
        sqlx::query_as("SELECT unique_nano_id FROM user_data WHERE id = 1")
            .fetch_optional(&user_pool)
            .await
            .map_err(|e| e.to_string())?;

    let Some((password,)) = password_row else {
        return Err("No encryption password found in user_data".into());
    };

    if let Some(obj) = fields.as_object() {
        for (key, value) in obj {
            if !ALLOWED_COLUMNS.contains(&key.as_str()) {
                return Err(format!("Unknown license field: {key}"));
            }

            let plain = if value.is_string() {
                value.as_str().unwrap_or("").to_string()
            } else {
                value.to_string()
            };
            let encrypted = encrypt_data(&plain, &password)
                .ok_or_else(|| format!("Failed to encrypt field '{key}'"))?;

            let sql = format!("UPDATE licenses SET {key} = $1 WHERE id = 1");
            sqlx::query(&sql)
                .bind(&encrypted)
                .execute(&pool)
                .await
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

// =============================================================================
// Config values
// =============================================================================

/// Open (or create) a SQLite connection to `appconfig.db`.
async fn open_app_config_db(app_handle: &AppHandle) -> Result<Pool<Sqlite>, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data dir: {e}"))?;

    let db_path = app_data_dir.join("appconfig.db");
    let url = format!("sqlite://{}", db_path.display());

    sqlx::sqlite::SqlitePoolOptions::new()
        .max_connections(2)
        .connect_with(
            sqlx::sqlite::SqliteConnectOptions::from_str(&url)
                .map_err(|e| e.to_string())?
                .create_if_missing(true),
        )
        .await
        .map_err(|e| e.to_string())
}

/// Read a boolean config value from the `config` table.
///
/// Returns `default_value` if the key doesn't exist.
#[tauri::command]
pub async fn get_config_bool(
    app_handle: AppHandle,
    key: String,
    default_value: bool,
) -> Result<bool, String> {
    let pool = open_app_config_db(&app_handle).await?;

    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(&key)
        .fetch_optional(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(row
        .map(|(value,)| value == "true")
        .unwrap_or(default_value))
}

/// Read a string config value from the `config` table.
///
/// Returns `None` if the key doesn't exist.
#[tauri::command]
pub async fn get_config_string(
    app_handle: AppHandle,
    key: String,
) -> Result<Option<String>, String> {
    let pool = open_app_config_db(&app_handle).await?;

    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(&key)
        .fetch_optional(&pool)
        .await
        .map_err(|e| e.to_string())?;

    Ok(row.map(|(value,)| value))
}

// =============================================================================
// Reminder settings
// =============================================================================

/// Reminder settings read from appconfig.db and theme JSON.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ReminderSettingsInfo {
    pub interval_mins: Option<u64>,
    pub duration_secs: Option<u64>,
    pub reminder_text: Option<String>,
    pub background_style: Option<String>,
}

/// Retrieve reminder settings. Interval, duration, text, and background style
/// all come from `appconfig.db`.
#[tauri::command]
pub async fn get_reminder_settings(app_handle: AppHandle) -> Result<ReminderSettingsInfo, String> {
    let pool = open_app_config_db(&app_handle).await?;

    let interval = read_config_string_pool(&pool, "blinkEyeReminderInterval")
        .await
        .and_then(|v| v.parse().ok());

    let duration = read_config_string_pool(&pool, "blinkEyeReminderDuration")
        .await
        .and_then(|v| v.parse().ok());

    let text = read_config_string_pool(&pool, "blinkEyeReminderScreenText").await;

    let style = read_config_string_pool(&pool, "reminderBackgroundStyle").await;

    Ok(ReminderSettingsInfo {
        interval_mins: interval,
        duration_secs: duration,
        reminder_text: text,
        background_style: style,
    })
}

/// Update a single reminder setting in `appconfig.db`.
#[tauri::command]
pub async fn update_reminder_setting(
    app_handle: AppHandle,
    key: String,
    value: String,
) -> Result<(), String> {
    let pool = open_app_config_db(&app_handle).await?;

    // Upsert: update if exists, insert otherwise
    sqlx::query(
        "INSERT INTO config (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    )
    .bind(&key)
    .bind(&value)
    .execute(&pool)
    .await
    .map_err(|e| e.to_string())?;

    Ok(())
}

/// Read a config value from the pool (helper for get_reminder_settings).
async fn read_config_string_pool(pool: &Pool<Sqlite>, key: &str) -> Option<String> {
    let row: Option<(String,)> = sqlx::query_as("SELECT value FROM config WHERE key = ?")
        .bind(key)
        .fetch_optional(pool)
        .await
        .ok()?;
    row.map(|(v,)| v)
}

// =============================================================================
// Trial status
// =============================================================================

/// Trial status computed from the install date.
#[derive(Debug, Clone, Serialize)]
pub struct TrialInfo {
    /// The decrypted install date (YYYY-MM-DD)
    pub install_date: Option<String>,
    /// Days remaining in the 7-day trial (0 if expired or no data)
    pub days_remaining: i64,
    /// Whether the trial is currently active
    pub is_active: bool,
    /// Whether clock manipulation was detected (current < install)
    pub clock_manipulated: bool,
}

/// Compute trial status from the stored install date.
#[tauri::command]
pub async fn get_trial_info(app_handle: AppHandle) -> Result<TrialInfo, String> {
    let date = get_install_date(app_handle).await?;

    let Some(ref date_str) = date else {
        return Ok(TrialInfo {
            install_date: None,
            days_remaining: 0,
            is_active: false,
            clock_manipulated: false,
        });
    };

    let installed = chrono::NaiveDate::parse_from_str(date_str, "%Y-%m-%d")
        .map_err(|e| format!("Invalid install date format: {e}"))?;

    let today = Local::now().date_naive();
    let clock_manipulated = today < installed;
    let diff_days = (today - installed).num_days();
    let days_remaining = (7 - diff_days).max(0);

    Ok(TrialInfo {
        install_date: Some(date_str.clone()),
        days_remaining,
        is_active: !clock_manipulated && days_remaining > 0,
        clock_manipulated,
    })
}
