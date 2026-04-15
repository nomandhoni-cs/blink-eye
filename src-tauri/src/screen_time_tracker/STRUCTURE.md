# Screen Time Tracker - Module Structure Documentation

## Directory Layout

```
src-tauri/src/screen_time_tracker/
├── mod.rs          # Module implementation (ScreenTimeTracker struct + methods)
├── README.md       # Technical documentation (architecture, API, usage)
└── STRUCTURE.md    # This file (module organization reference)
```

## File Purposes

### mod.rs
**Type**: Rust module file  
**Lines**: ~150  
**Purpose**: Contains the complete implementation of the ScreenTimeTracker module

**Contents**:
- `pub struct ScreenTimeTracker` - Main struct with `Arc<Pool<Sqlite>>` field
- `impl ScreenTimeTracker` - All methods (public and private)
- Dependencies: `chrono`, `sqlx`, `tokio`, `tauri::async_runtime`

**Public API**:
```rust
pub async fn new(db_path: &str) -> Result<Self, Box<dyn std::error::Error>>
pub fn start_tracking(self)
```

**Private Methods**:
```rust
fn get_current_date() -> String
fn get_current_local_timestamp() -> i64
async fn initialize_new_date(&self, date: &str) -> Result<(), Box<dyn std::error::Error>>
async fn update_last_time_data(&self, date: &str) -> Result<(), Box<dyn std::error::Error>>
```

### README.md
**Type**: Markdown documentation  
**Lines**: ~500+  
**Purpose**: Complete technical reference for understanding and maintaining the module

**Sections**:
1. Overview & Architecture
2. Database Schema & Location
3. Implementation Details (struct, methods, flow)
4. Edge Case Handling
5. Integration Guide (how to use in lib.rs)
6. Dependencies & Justification
7. Timing Behavior & Execution Timeline
8. Log Output Analysis
9. SQL Query Examples (calculating screen time)
10. Error Handling Strategy
11. Thread Safety Considerations
12. Performance Characteristics
13. Testing & Troubleshooting
14. Comparison with TypeScript Version
15. References & Related Files

**Target Audience**: 
- Future you (6 months from now)
- AI assistants (for context understanding)
- Other developers working on the codebase

### STRUCTURE.md
**Type**: Markdown documentation  
**Lines**: ~100  
**Purpose**: Quick reference for module organization and file relationships

**Sections**:
1. Directory Layout (visual tree)
2. File Purposes (this section)
3. Module Import Chain
4. Database File Location
5. Rust Module System Explanation
6. Quick Navigation Guide

## Module Import Chain

```
src-tauri/src/lib.rs
    ↓ (declares module)
mod screen_time_tracker;
    ↓ (imports struct)
use screen_time_tracker::ScreenTimeTracker;
    ↓ (Rust looks for)
src-tauri/src/screen_time_tracker/mod.rs
    ↓ (exports)
pub struct ScreenTimeTracker { ... }
```

### How Rust Resolves Modules

1. `mod screen_time_tracker;` in `lib.rs` tells Rust to look for:
   - `src/screen_time_tracker.rs` (single file), OR
   - `src/screen_time_tracker/mod.rs` (directory module)

2. We use directory module approach because:
   - Allows multiple files in same module (scalable)
   - Keeps documentation with code
   - Standard pattern for complex modules

3. `mod.rs` is special:
   - Acts as the module's entry point
   - Equivalent to `__init__.py` in Python or `index.js` in Node.js
   - Can declare sub-modules with `mod submodule;`

## Database File Location

### Platform-Specific Paths

**Windows**:
```
C:\Users\[Username]\AppData\Roaming\Blink-Eye\UserScreenTime.db
```
- Obtained via: `app_handle.path().app_data_dir()`
- Environment variable: `%APPDATA%\Blink-Eye\`

**macOS**:
```
/Users/[Username]/Library/Application Support/Blink-Eye/UserScreenTime.db
```
- Obtained via: `app_handle.path().app_data_dir()`
- Shell expansion: `~/Library/Application Support/Blink-Eye/`

**Linux**:
```
/home/[username]/.local/share/Blink-Eye/UserScreenTime.db
```
- Obtained via: `app_handle.path().app_data_dir()`
- Shell expansion: `~/.local/share/Blink-Eye/`

### Connection String Format
```rust
let db_path = app_data_dir.join("UserScreenTime.db");
let db_url = format!("sqlite://{}", db_path.display());
// Result: "sqlite://C:\Users\...\UserScreenTime.db"
```

## Rust Module System Explanation

### Why `mod.rs` Instead of `screen_time_tracker.rs`?

**Option 1: Single File** (old approach)
```
src/
├── lib.rs
└── screen_time_tracker.rs
```
- Simple for small modules
- No place for documentation
- Hard to extend with multiple files

**Option 2: Directory Module** (current approach)
```
src/
├── lib.rs
└── screen_time_tracker/
    ├── mod.rs
    ├── README.md
    └── STRUCTURE.md
```
- Scalable (can add more .rs files)
- Documentation lives with code
- Clear module boundaries
- Standard Rust pattern

### Adding More Files to Module

If we wanted to split the module:

```rust
// screen_time_tracker/mod.rs
mod database;  // Looks for screen_time_tracker/database.rs
mod tracker;   // Looks for screen_time_tracker/tracker.rs

pub use tracker::ScreenTimeTracker;  // Re-export for public API
```

```
screen_time_tracker/
├── mod.rs          # Module entry point, re-exports
├── database.rs     # Database operations
├── tracker.rs      # Tracking logic
├── README.md
└── STRUCTURE.md
```

## Quick Navigation Guide

### "I want to understand how this works"
→ Read `README.md` (complete technical documentation)

### "I want to modify the tracking logic"
→ Edit `mod.rs`, specifically:
- `start_tracking()` - Main loop
- `update_last_time_data()` - Update logic
- `initialize_new_date()` - Record creation

### "I want to change the database schema"
→ Edit `mod.rs`, specifically:
- `new()` method - `CREATE TABLE` statement
- Update struct fields if needed
- Update query strings in methods

### "I want to see how it's integrated"
→ Look at `src-tauri/src/lib.rs`:
- Search for `mod screen_time_tracker;`
- Search for `ScreenTimeTracker::new`
- Search for `start_tracking()`

### "I want to query the database"
→ See `README.md` section "Calculating Screen Time"
- SQL query examples
- Database inspection commands

### "I want to understand the file organization"
→ You're reading it! (STRUCTURE.md)

## Module Visibility

### Public API (accessible from lib.rs)
```rust
pub struct ScreenTimeTracker { ... }
pub async fn new(...) -> Result<Self, ...>
pub fn start_tracking(self)
```

### Private API (internal to module)
```rust
fn get_current_date() -> String
fn get_current_local_timestamp() -> i64
async fn initialize_new_date(...)
async fn update_last_time_data(...)
```

### Why This Separation?
- Public API is stable, won't change often
- Private methods can be refactored freely
- Clear contract for module users
- Encapsulation of implementation details

## Dependencies Graph

```
screen_time_tracker/mod.rs
    ├── chrono (date/time)
    │   └── Local::now()
    ├── sqlx (database)
    │   ├── SqlitePool
    │   └── query/query_as
    ├── tokio (async)
    │   └── time::interval
    └── tauri (runtime)
        └── async_runtime::spawn
```

## Testing Strategy

### Unit Tests (not implemented yet)
Would go in `mod.rs`:
```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_get_current_date() {
        let date = ScreenTimeTracker::get_current_date();
        assert_eq!(date.len(), 10);  // YYYY-MM-DD
    }
}
```

### Integration Tests (not implemented yet)
Would go in `src-tauri/tests/screen_time_tracker_test.rs`:
```rust
#[tokio::test]
async fn test_tracker_initialization() {
    let tracker = ScreenTimeTracker::new("sqlite::memory:").await;
    assert!(tracker.is_ok());
}
```

## Version History

### v1.0 (Current)
- Initial implementation
- Single `mod.rs` file
- Documentation in README.md
- Folder-based structure

### Future Versions (Potential)
- v1.1: Add session tracking
- v1.2: Add idle time detection
- v2.0: Split into multiple files (database.rs, tracker.rs)

## Related Documentation

### In This Module
- `README.md` - Complete technical reference
- `STRUCTURE.md` - This file (organization guide)

### In Parent Directory
- `../lib.rs` - Integration point (lines ~60-85)
- `../../Cargo.toml` - Dependencies (sqlx, tokio, chrono)

### External
- [Rust Module System](https://doc.rust-lang.org/book/ch07-00-managing-growing-projects-with-packages-crates-and-modules.html)
- [sqlx Documentation](https://docs.rs/sqlx/)
- [Tauri Plugin Development](https://tauri.app/v1/guides/building/plugins/)

## Maintenance Checklist

When modifying this module:

- [ ] Update `mod.rs` with code changes
- [ ] Update `README.md` if API or behavior changes
- [ ] Update `STRUCTURE.md` if file organization changes
- [ ] Test with `cargo check` and `cargo build`
- [ ] Verify logs show expected output
- [ ] Query database to verify data correctness
- [ ] Update version history in this file

## AI Assistant Context

When asking AI for help with this module, provide:

1. **This file** (STRUCTURE.md) - For understanding organization
2. **README.md** - For technical details
3. **mod.rs** - For actual implementation
4. **Relevant logs** - For debugging issues

Example prompt:
```
I'm working on the screen_time_tracker module in my Tauri app.
Here's the structure: [paste STRUCTURE.md]
Here's the implementation: [paste mod.rs]
Here's the issue: [describe problem]
```

This gives AI complete context to understand and help effectively.
