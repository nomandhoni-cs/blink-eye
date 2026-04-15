use chrono::Local;
use sqlx::{Pool, Sqlite, SqlitePool};
use std::sync::Arc;
use tauri::async_runtime::spawn;
use tokio::time::{interval, Duration};

pub struct ScreenTimeTracker {
    db_pool: Arc<Pool<Sqlite>>,
}

impl ScreenTimeTracker {
    /// Initialize the screen time tracker with a database connection
    /// Uses sqlx directly for backend-only database access
    pub async fn new(db_path: &str) -> Result<Self, Box<dyn std::error::Error>> {
        let db_pool = SqlitePool::connect(db_path).await?;

        // Create table if not exists
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS time_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                first_timestamp INTEGER NOT NULL,
                second_timestamp INTEGER NOT NULL
            )
            "#,
        )
        .execute(&db_pool)
        .await?;

        println!("[DB] Database loaded and table ensured.");

        Ok(Self {
            db_pool: Arc::new(db_pool),
        })
    }

    /// Get current date in 'YYYY-MM-DD' format
    fn get_current_date() -> String {
        Local::now().format("%Y-%m-%d").to_string()
    }

    /// Get current timestamp adjusted for local time (in milliseconds)
    fn get_current_local_timestamp() -> i64 {
        Local::now().timestamp_millis()
    }

    /// Insert a new record for the given date
    async fn initialize_new_date(&self, date: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Self::get_current_local_timestamp();

        sqlx::query(
            "INSERT INTO time_data (date, first_timestamp, second_timestamp) VALUES (?, ?, ?)",
        )
        .bind(date)
        .bind(timestamp)
        .bind(timestamp)
        .execute(self.db_pool.as_ref())
        .await?;

        println!(
            "[initializeNewDate] Inserted new row for date {} with timestamp {}",
            date, timestamp
        );

        Ok(())
    }

    /// Update the last record's `second_timestamp` for the given date
    async fn update_last_time_data(&self, date: &str) -> Result<(), Box<dyn std::error::Error>> {
        let timestamp = Self::get_current_local_timestamp();

        // Get the latest record for the day
        let result = sqlx::query_as::<_, (i64, i64, i64)>(
            "SELECT id, first_timestamp, second_timestamp FROM time_data WHERE date = ? ORDER BY id DESC LIMIT 1",
        )
        .bind(date)
        .fetch_optional(self.db_pool.as_ref())
        .await?;

        if let Some((id, first_timestamp, second_timestamp)) = result {
            // Valid update condition: new timestamp is greater than both timestamps
            if timestamp >= second_timestamp && timestamp >= first_timestamp {
                sqlx::query("UPDATE time_data SET second_timestamp = ? WHERE id = ?")
                    .bind(timestamp)
                    .bind(id)
                    .execute(self.db_pool.as_ref())
                    .await?;

                println!(
                    "[updateLastTimeData] Updated record id {} with timestamp {}",
                    id, timestamp
                );
            } else if first_timestamp > second_timestamp {
                // Manual time change detected
                println!("[updateLastTimeData] Manual time change detected. Inserting new row.");
                self.initialize_new_date(date).await?;
            }
        } else {
            // No record found for date
            println!("[updateLastTimeData] No record found for date. Inserting new row.");
            self.initialize_new_date(date).await?;
        }

        Ok(())
    }

    /// Start the background tracking task
    pub fn start_tracking(self) {
        spawn(async move {
            // Initialize time data for current date
            let current_date = Self::get_current_date();
            if let Err(e) = self.initialize_new_date(&current_date).await {
                eprintln!("[ScreenTimeTracker] Error initializing date: {}", e);
            }

            let mut last_date = current_date;
            let mut interval = interval(Duration::from_secs(60)); // Update every minute

            loop {
                interval.tick().await;

                let current_date = Self::get_current_date();

                // If the date has changed, initialize new date data
                if current_date != last_date {
                    println!(
                        "[Interval] Date changed from {} to {}",
                        last_date, current_date
                    );
                    if let Err(e) = self.initialize_new_date(&current_date).await {
                        eprintln!("[ScreenTimeTracker] Error initializing new date: {}", e);
                    }
                    last_date = current_date.clone();
                    continue;
                }

                // Update the latest record for the current date
                if let Err(e) = self.update_last_time_data(&current_date).await {
                    eprintln!("[ScreenTimeTracker] Error updating time data: {}", e);
                }
            }
        });
    }
}
