import Database from "@tauri-apps/plugin-sql";

type ConfigResult = { value: string };

/**
 * Utility function to get a boolean config value from the database
 * @param key - The config key to fetch
 * @param defaultValue - Default value if key doesn't exist (defaults to false)
 * @returns Promise<boolean>
 */
export async function getBooleanConfig(
    key: string,
    defaultValue: boolean = false
): Promise<boolean> {
    try {
        const db = await Database.load("sqlite:appconfig.db");
        const result = (await db.select(
            "SELECT value FROM config WHERE key = ?",
            [key]
        )) as ConfigResult[];

        if (result.length > 0 && result[0].value) {
            return result[0].value === "true";
        }

        return defaultValue;
    } catch (error) {
        console.error(`Error fetching config for key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Utility function to get a string config value from the database
 * @param key - The config key to fetch
 * @param defaultValue - Default value if key doesn't exist
 * @returns Promise<string | null>
 */
export async function getStringConfig(
    key: string,
    defaultValue: string | null = null
): Promise<string | null> {
    try {
        const db = await Database.load("sqlite:appconfig.db");
        const result = (await db.select(
            "SELECT value FROM config WHERE key = ?",
            [key]
        )) as ConfigResult[];

        if (result.length > 0 && result[0].value) {
            return result[0].value;
        }

        return defaultValue;
    } catch (error) {
        console.error(`Error fetching config for key "${key}":`, error);
        return defaultValue;
    }
}

/**
 * Utility function to get a JSON config value from the database
 * @param key - The config key to fetch
 * @returns Promise<T | null>
 */
export async function getJsonConfig<T>(key: string): Promise<T | null> {
    try {
        const db = await Database.load("sqlite:appconfig.db");
        const result = (await db.select(
            "SELECT value FROM config WHERE key = ?",
            [key]
        )) as ConfigResult[];

        if (result.length > 0 && result[0].value) {
            return JSON.parse(result[0].value) as T;
        }

        return null;
    } catch (error) {
        console.error(`Error fetching JSON config for key "${key}":`, error);
        return null;
    }
}
