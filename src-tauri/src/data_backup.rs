use chrono::Utc;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};
use zip::write::SimpleFileOptions;
use zip::{ZipArchive, ZipWriter};

/// Blink Eye backup format version.
const BACKUP_FORMAT_VERSION: u32 = 1;

/// User-facing data only. License, install identity, and legacy JSON stores stay on this device.
const BACKUP_FILES: &[&str] = &[
    "appconfig.db",
    "UserScreenTime.db",
    "UserLocalTodoList.db",
];

const REQUIRED_IMPORT_FILES: &[&str] = &["appconfig.db"];

#[derive(Debug, Serialize, Deserialize)]
struct BackupManifest {
    version: u32,
    app_version: String,
    exported_at: String,
    files: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ExportUserDataResult {
    pub path: String,
    pub file_count: usize,
}

#[derive(Debug, Serialize)]
pub struct ImportUserDataResult {
    pub file_count: usize,
    pub backup_dir: String,
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_data_dir()
        .map_err(|error| error.to_string())
}

fn is_allowed_backup_file(name: &str) -> bool {
    BACKUP_FILES.contains(&name)
}

fn normalize_zip_entry_name(name: &str) -> Option<String> {
    let path = Path::new(name);
    let file_name = path.file_name()?.to_str()?;
    if is_allowed_backup_file(file_name) {
        Some(file_name.to_string())
    } else {
        None
    }
}

/// Creates a zip archive of settings, screen time, and todos from the app data directory.
///
/// Does not include license data, install identity, or legacy JSON stores.
///
/// # Parameters
/// - `destination_path` — Absolute path for the `.zip` file to create.
///
/// # Returns
/// Export path and number of files written, or an error string.
#[tauri::command]
pub fn export_user_data(
    app: AppHandle,
    destination_path: String,
) -> Result<ExportUserDataResult, String> {
    let data_dir = app_data_dir(&app)?;
    fs::create_dir_all(&data_dir).map_err(|error| error.to_string())?;

    let dest = PathBuf::from(&destination_path);
    if dest.extension().and_then(|ext| ext.to_str()) != Some("zip") {
        return Err("Export file must have a .zip extension.".to_string());
    }

    let file = File::create(&dest).map_err(|error| error.to_string())?;
    let mut zip = ZipWriter::new(file);
    let options = SimpleFileOptions::default()
        .compression_method(zip::CompressionMethod::Deflated);

    let mut exported_files: Vec<String> = Vec::new();

    for name in BACKUP_FILES {
        let source = data_dir.join(name);
        if !source.is_file() {
            continue;
        }

        let bytes = fs::read(&source).map_err(|error| {
            format!("Failed to read {name} for export: {error}")
        })?;

        zip.start_file(*name, options)
            .map_err(|error| format!("Failed to add {name} to archive: {error}"))?;
        zip.write_all(&bytes)
            .map_err(|error| format!("Failed to write {name} to archive: {error}"))?;

        exported_files.push((*name).to_string());
    }

    if exported_files.is_empty() {
        return Err("No user data files found to export.".to_string());
    }

    let manifest = BackupManifest {
        version: BACKUP_FORMAT_VERSION,
        app_version: env!("CARGO_PKG_VERSION").to_string(),
        exported_at: Utc::now().to_rfc3339(),
        files: exported_files.clone(),
    };

    let manifest_json =
        serde_json::to_string_pretty(&manifest).map_err(|error| error.to_string())?;

    zip.start_file("manifest.json", options)
        .map_err(|error| format!("Failed to add manifest to archive: {error}"))?;
    zip.write_all(manifest_json.as_bytes())
        .map_err(|error| format!("Failed to write manifest: {error}"))?;

    zip.finish().map_err(|error| error.to_string())?;

    Ok(ExportUserDataResult {
        path: dest.to_string_lossy().to_string(),
        file_count: exported_files.len(),
    })
}

/// Restores settings, screen time, and todos from a backup zip.
///
/// License and install identity on this device are not replaced.
///
/// # Parameters
/// - `source_path` — Absolute path to a `.zip` file from `export_user_data`.
///
/// # Returns
/// Number of restored files and the pre-import backup directory path.
#[tauri::command]
pub fn import_user_data(
    app: AppHandle,
    source_path: String,
) -> Result<ImportUserDataResult, String> {
    let data_dir = app_data_dir(&app)?;
    fs::create_dir_all(&data_dir).map_err(|error| error.to_string())?;

    let source = PathBuf::from(&source_path);
    if !source.is_file() {
        return Err("Backup file not found.".to_string());
    }

    let file = File::open(&source).map_err(|error| error.to_string())?;
    let mut archive = ZipArchive::new(file).map_err(|error| {
        format!("Invalid backup archive: {error}")
    })?;

    let manifest: BackupManifest = {
        let mut manifest_file = archive
            .by_name("manifest.json")
            .map_err(|_| "Backup is missing manifest.json.".to_string())?;
        let mut manifest_raw = String::new();
        manifest_file
            .read_to_string(&mut manifest_raw)
            .map_err(|error| format!("Failed to read manifest: {error}"))?;
        serde_json::from_str(&manifest_raw)
            .map_err(|error| format!("Invalid manifest.json: {error}"))?
    };

    if manifest.version != BACKUP_FORMAT_VERSION {
        return Err(format!(
            "Unsupported backup version {}. Expected version {}.",
            manifest.version, BACKUP_FORMAT_VERSION
        ));
    }

    for required in REQUIRED_IMPORT_FILES {
        if !manifest.files.iter().any(|file| file == required) {
            return Err(format!("Backup is missing required file: {required}"));
        }
    }

    let timestamp = Utc::now().format("%Y%m%d-%H%M%S");
    let pre_import_dir = data_dir.join(format!(".backup-before-import-{timestamp}"));
    fs::create_dir_all(&pre_import_dir).map_err(|error| error.to_string())?;

    for name in BACKUP_FILES {
        let current = data_dir.join(name);
        if current.is_file() {
            let backup_target = pre_import_dir.join(name);
            fs::copy(&current, &backup_target).map_err(|error| {
                format!("Failed to back up current {name}: {error}")
            })?;
        }
    }

    let mut restored_count = 0usize;

    for i in 0..archive.len() {
        let mut entry = archive
            .by_index(i)
            .map_err(|error| format!("Failed to read archive entry: {error}"))?;

        let entry_name = entry.name().to_string();
        if entry_name == "manifest.json" {
            continue;
        }

        let Some(file_name) = normalize_zip_entry_name(&entry_name) else {
            continue;
        };

        if !manifest.files.iter().any(|f| f == &file_name) {
            return Err(format!(
                "Archive contains unexpected file not listed in manifest: {file_name}"
            ));
        }

        let mut bytes = Vec::new();
        entry
            .read_to_end(&mut bytes)
            .map_err(|error| format!("Failed to read {file_name} from archive: {error}"))?;

        let destination = data_dir.join(&file_name);
        fs::write(&destination, bytes).map_err(|error| {
            format!("Failed to write restored {file_name}: {error}")
        })?;

        restored_count += 1;
    }

    if restored_count == 0 {
        return Err("Backup archive contains no data files.".to_string());
    }

    Ok(ImportUserDataResult {
        file_count: restored_count,
        backup_dir: pre_import_dir.to_string_lossy().to_string(),
    })
}
