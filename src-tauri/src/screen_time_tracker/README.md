# Screen Time Tracker Module - Technical Documentation

## Overview
Backend-only Rust module that tracks application runtime by recording timestamps every 60 seconds to a SQLite database. Runs as an async background task using Tokio intervals.

## Architecture

### Technology Stack
- **Database**: SQLite via `sqlx` crate (direct connection, not through tauri-plugin-sql)
- **Async Runtime**: Tokio (via `tauri::async_runtime::spawn`)
- **Time Handling**: `chrono` crate for local timezone-aware timestamps
- **Interval Management**: `tokio::time::interval` for 60-second ticks

### Why Direct sqlx Instead of tauri-plugin-sql?
- `tauri-plugin-sql` is designed for frontend-to-backend IPC communication
- This module runs entirely in the backend with no frontend involvement
- Direct sqlx usage eliminates IPC overhead and is more efficient
- sqlx is the same library that powers tauri-plugin-sql internally

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS time_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT NOT NULL,                -- Format: 'YYYY-MM-DD'
    first_timestamp INTEGER NOT NULL,  -- Unix timestamp in milliseconds (local time)
    second_timestamp INTEGER NOT NULL  -- Updated every 60 seconds
);
```

### Database Location
Stored in platform-specific app data directory:
- **Windows**: `%APPDATA%\Blink-Eye\UserScreenTime.db` (e.g., `C:\Users\[User]\AppData\Roaming\Blink-Eye\UserScreenTime.db`)
- **macOS**: `~/Library/Application Support/Blink-Eye/UserScreenTime.db`
- **Linux**: `~/.local/share/Blink-Eye/UserScreenTime.db`

Connection string format: `sqlite://[full_path_to_db]`

## Implementation Details

### Struct Definition
```rust
pub struct ScreenTimeTracker {
    db_pool: Arc<Pool<Sqlite>>,  // Thread-safe connection pool
}
```

### Initialization Flow
1. `ScreenTimeTracker::new(db_path: &str)` called with SQLite connection string
2. `SqlitePool::connect()` establishes connection
3. `CREATE TABLE IF NOT EXISTS` ensures schema exists
4. Returns `Self` with `Arc<Pool<Sqlite>>` for thread-safe access

### Background Task Lifecycle
```rust
pub fn start_tracking(self) {
    spawn(async move {
        // 1. Initialize first record for current date
        // 2. Create 60-second interval timer
        // 3. Loop forever:
        //    - Wait for interval tick
        //    - Check if date changed (midnight rollover)
        //    - If date changed: insert new record
        //    - If same date: update second_timestamp
    });
}
```

### Core Methods

#### `get_current_date() -> String`
- Uses `chrono::Local::now().format("%Y-%m-%d")`
- Returns date in ISO 8601 format (e.g., "2026-02-22")
- Used for date change detection

#### `get_current_local_timestamp() -> i64`
- Uses `chrono::Local::now().timestamp_millis()`
- Returns Unix timestamp in milliseconds adjusted for local timezone
- Example: `1771775461712` (milliseconds since 1970-01-01 00:00:00 UTC, adjusted for local time)

#### `initialize_new_date(&self, date: &str)`
- Inserts new row with both `first_timestamp` and `second_timestamp` set to current time
- Called on app startup and when date changes (midnight)
- SQL: `INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)`

#### `update_last_time_data(&self, date: &str)`
- Queries latest record for given date: `SELECT id, first_timestamp, second_timestamp FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1`
- Updates `second_timestamp` if conditions met
- Handles edge cases (see below)

### Edge Case Handling

#### Manual Time Change Detection
```rust
if first_timestamp > second_timestamp {
    // System time was manually changed backwards
    // Insert new record instead of updating
    self.initialize_new_date(date).await?;
}
```

#### Valid Update Conditions
```rust
if timestamp >= second_timestamp && timestamp >= first_timestamp {
    // Normal case: time is moving forward
    // Update second_timestamp
}
```

#### No Record Found
```rust
if result.is_none() {
    // First run for this date
    self.initialize_new_date(date).await?;
}
```

## Integration in lib.rs

```rust
mod screen_time_tracker;
use screen_time_tracker::ScreenTimeTracker;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // ... other plugins ...
        .setup(|app| {
            // Clone app handle for async task
            let app_handle = app.handle().clone();
            
            // Spawn async initialization task
            tauri::async_runtime::spawn(async move {
                // Get platform-specific app data directory
                let app_data_dir = app_handle
                    .path()
                    .app_data_dir()
                    .expect("Failed to get app data directory");
                
                // Ensure directory exists
                std::fs::create_dir_all(&app_data_dir)
                    .expect("Failed to create app data directory");
                
                // Construct database path
                let db_path = app_data_dir.join("UserScreenTime.db");
                let db_url = format!("sqlite://{}", db_path.display());
                
                // Initialize and start tracker
                match ScreenTimeTracker::new(&db_url).await {
                    Ok(tracker) => {
                        println!("[ScreenTimeTracker] Initialized successfully");
                        tracker.start_tracking();  // Consumes self, runs forever
                    }
                    Err(e) => {
                        eprintln!("[ScreenTimeTracker] Failed to initialize: {}", e);
                    }
                }
            });
            
            Ok(())
        })
        // ... rest of setup ...
}
```

## Dependencies in Cargo.toml

```toml
[dependencies]
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite"] }
tokio = { version = "1", features = ["time"] }
chrono = "0.4"
```

### Dependency Justification
- **sqlx**: Direct SQLite access with async support
  - `runtime-tokio`: Uses Tokio as async runtime (matches Tauri)
  - `sqlite`: Enables SQLite driver
- **tokio**: Provides `time::interval` for 60-second ticks
  - `time` feature: Enables time utilities
- **chrono**: Timezone-aware date/time operations
  - Local timezone support for accurate timestamps

## Timing Behavior

### Interval Precision
```rust
let mut interval = interval(Duration::from_secs(60));
```
- First tick happens immediately after creation
- Subsequent ticks every 60 seconds
- Uses Tokio's `interval` which compensates for drift

### Execution Timeline
```
T+0s:    App starts
T+0s:    ScreenTimeTracker::new() called
T+0s:    initialize_new_date() inserts first record
T+0s:    start_tracking() spawns background task
T+0s:    First interval.tick() completes immediately
T+0s:    First update_last_time_data() call
T+60s:   Second interval.tick()
T+60s:   Second update_last_time_data() call
T+120s:  Third interval.tick()
...continues every 60 seconds
```

## Log Output Analysis

### Successful Initialization
```
[DB] Database loaded and table ensured.
[ScreenTimeTracker] Initialized successfully
[initializeNewDate] Inserted new row for date 2026-02-22 with timestamp 1771775461712
```
- Database connection established
- Table created/verified
- Initial record inserted

### Regular Updates
```
[updateLastTimeData] Updated record id 3176 with timestamp 1771775521785
[updateLastTimeData] Updated record id 3176 with timestamp 1771775581788
```
- Same record ID being updated (3176)
- Timestamps incrementing by ~60000ms (60 seconds)
- Indicates normal operation

### Date Change (Midnight Rollover)
```
[Interval] Date changed from 2026-02-22 to 2026-02-23
[initializeNewDate] Inserted new row for date 2026-02-23 with timestamp 1771861861712
```
- New record created for new date
- New record ID will be assigned

## Calculating Screen Time

### Total Time for a Date
```sql
SELECT 
    date,
    SUM(second_timestamp - first_timestamp) as total_milliseconds,
    SUM(second_timestamp - first_timestamp) / 1000.0 as total_seconds,
    SUM(second_timestamp - first_timestamp) / 1000.0 / 60.0 as total_minutes,
    SUM(second_timestamp - first_timestamp) / 1000.0 / 60.0 / 60.0 as total_hours
FROM time_data 
WHERE date = '2026-02-22'
GROUP BY date;
```

### All Records for a Date
```sql
SELECT 
    id,
    date,
    first_timestamp,
    second_timestamp,
    (second_timestamp - first_timestamp) / 1000.0 / 60.0 as duration_minutes
FROM time_data 
WHERE date = '2026-02-22'
ORDER BY id;
```

### Date Range Query
```sql
SELECT 
    date,
    COUNT(*) as session_count,
    SUM(second_timestamp - first_timestamp) / 1000.0 / 60.0 / 60.0 as total_hours
FROM time_data 
WHERE date BETWEEN '2026-02-01' AND '2026-02-28'
GROUP BY date
ORDER BY date;
```

## Error Handling

### Database Connection Errors
```rust
match ScreenTimeTracker::new(&db_url).await {
    Ok(tracker) => { /* success */ },
    Err(e) => {
        eprintln!("[ScreenTimeTracker] Failed to initialize: {}", e);
        // App continues running, tracker just won't work
    }
}
```

### Runtime Errors
```rust
if let Err(e) = self.initialize_new_date(&current_date).await {
    eprintln!("[ScreenTimeTracker] Error initializing date: {}", e);
    // Loop continues, will retry next interval
}
```

All errors are logged but don't crash the app. The background task continues running.

## Thread Safety

### Arc<Pool<Sqlite>>
- `Arc` provides thread-safe reference counting
- `Pool<Sqlite>` is already thread-safe (internal connection pooling)
- Multiple async tasks can safely share the pool

### Async Task Isolation
- Background task runs in separate Tokio task
- No shared mutable state with main thread
- Communication only through database

## Performance Characteristics

### Memory Usage
- Single connection pool (minimal overhead)
- No data cached in memory
- All state persisted to disk

### CPU Usage
- Wakes up every 60 seconds
- Single database query per wake
- Negligible CPU impact

### Disk I/O
- One write operation per minute
- SQLite handles journaling and durability
- Minimal disk impact

## Testing Considerations

### Manual Testing
1. Start app, check initial log messages
2. Wait 2-3 minutes, verify updates in logs
3. Query database to verify records
4. Restart app, verify new record created
5. Change system time backwards, verify new record created

### Database Inspection
```bash
# Open database
sqlite3 "C:\Users\[User]\AppData\Roaming\Blink-Eye\UserScreenTime.db"

# View schema
.schema time_data

# View recent records
SELECT * FROM time_data ORDER BY id DESC LIMIT 10;

# Check today's records
SELECT * FROM time_data WHERE date = date('now', 'localtime');
```

## Troubleshooting

### No Records Being Created
- Check log for "[DB] Database loaded and table ensured."
- Verify app data directory exists and is writable
- Check for error messages in logs

### Timestamps Not Updating
- Verify "[updateLastTimeData]" messages in logs every 60 seconds
- Check if multiple records exist for same date (manual time change)
- Query database directly to verify

### Multiple Records for Same Date
- Normal if app was restarted multiple times
- Normal if system time was changed manually
- Each record represents a separate session

## Future Enhancement Possibilities

### Potential Improvements
1. Add session tracking (detect app restarts)
2. Track idle time (when app is minimized/inactive)
3. Add data retention policy (auto-delete old records)
4. Expose Tauri commands for frontend queries
5. Add metrics (average daily usage, trends)

### Migration Path
If schema changes needed:
1. Add version column to track schema version
2. Implement migration logic in `new()` method
3. Use `ALTER TABLE` for backwards-compatible changes
4. Create new table + copy data for breaking changes

## Comparison with TypeScript Version

### TypeScript (Frontend)
```typescript
// Uses @tauri-apps/plugin-sql
const db = await Database.load('sqlite:UserScreenTime.db');
await db.execute('INSERT INTO ...');
```
- Runs in React component
- Uses useEffect + setInterval
- IPC calls for each database operation
- Frontend-to-backend communication overhead

### Rust (Backend)
```rust
// Uses sqlx directly
let db_pool = SqlitePool::connect(db_path).await?;
sqlx::query("INSERT INTO ...").execute(&db_pool).await?;
```
- Runs in Tauri backend
- Uses Tokio spawn + interval
- Direct database access
- No IPC overhead

### Performance Comparison
- Rust: ~0.1ms per database operation (direct)
- TypeScript: ~1-5ms per operation (IPC + serialization)
- For 60-second intervals, difference is negligible
- Rust approach is more architecturally sound for backend-only tasks

## References

### Documentation Links
- [sqlx Documentation](https://docs.rs/sqlx/latest/sqlx/)
- [Tokio Interval](https://docs.rs/tokio/latest/tokio/time/fn.interval.html)
- [Chrono Documentation](https://docs.rs/chrono/latest/chrono/)
- [Tauri Async Runtime](https://docs.rs/tauri/latest/tauri/async_runtime/index.html)

### Related Files
- `src-tauri/src/lib.rs` - Integration point
- `src-tauri/Cargo.toml` - Dependencies
- `src/components/ScreenTimeTracker.tsx` - Original TypeScript version (can be removed)
