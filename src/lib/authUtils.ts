import Database from "@tauri-apps/plugin-sql";
import { fetch } from "@tauri-apps/plugin-http";

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

const DB_NAME = "sqlite:basicapplicationdata.db";

/**
 * Saves access and refresh tokens to the database.
 */
export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    const db = await Database.load(DB_NAME);

    // Ensure the table exists
    await db.execute(`
    CREATE TABLE IF NOT EXISTS auth_tokens (
      id INTEGER PRIMARY KEY,
      access_token TEXT,
      refresh_token TEXT
    );
  `);

    const existingTokens = (await db.select(
        "SELECT id FROM auth_tokens WHERE id = 1"
    )) as any[];

    if (existingTokens.length > 0) {
        await db.execute(
            "UPDATE auth_tokens SET access_token = $1, refresh_token = $2 WHERE id = 1",
            [accessToken, refreshToken]
        );
    } else {
        await db.execute(
            "INSERT INTO auth_tokens (id, access_token, refresh_token) VALUES (1, $1, $2)",
            [accessToken, refreshToken]
        );
    }
}

/**
 * Retrieves access and refresh tokens from the database.
 */
export async function getTokens(): Promise<AuthTokens | null> {
    try {
        const db = await Database.load(DB_NAME);
        const result = (await db.select(
            "SELECT access_token, refresh_token FROM auth_tokens WHERE id = 1"
        )) as any[];

        if (result.length > 0) {
            return {
                accessToken: result[0].access_token,
                refreshToken: result[0].refresh_token,
            };
        }
    } catch (error) {
        console.error("Error retrieving tokens:", error);
    }
    return null;
}

/**
 * Clears stored tokens from the database.
 */
export async function clearTokens(): Promise<void> {
    try {
        const db = await Database.load(DB_NAME);
        await db.execute("DELETE FROM auth_tokens WHERE id = 1");
    } catch (error) {
        console.error("Error clearing tokens:", error);
    }
}

/**
 * Refreshes the access token using the stored refresh token.
 * returns the new access token if successful, or null if failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
    try {
        const tokens = await getTokens();
        if (!tokens || !tokens.refreshToken) {
            console.warn("No refresh token found.");
            return null;
        }

        const response = await fetch("https://api.blinkeye.app/refresh-token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                refreshToken: tokens.refreshToken,
            }),
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                // If the API returns a new refresh token, store it as well (rotation)
                // Otherwise, keep the old one (if the API only returns access token) - though specs say both.
                // Based on UserInfo specs, it returns both. Let's assume refresh also returns both or at least access.
                const newRefreshToken = data.refreshToken || tokens.refreshToken;

                await saveTokens(data.accessToken, newRefreshToken);
                return data.accessToken;
            }
        } else {
            console.error("Failed to refresh token:", response.status, response.statusText);
        }
    } catch (error) {
        console.error("Error refreshing access token:", error);
    }
    return null;
}
