import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

// Ensure the DATABASE_URL is set in your .env file
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}
const sql = neon(process.env.DATABASE_URL);

const HANDSHAKE_PASSWORD = process.env.HANDSHAKE_PASSWORD;

// Updated type to include the new appVersion field
type UserInfoSubmitted = {
  userID: string;
  userDevice: string;
  userLocale: string;
  installedTime: string;
  appVersion: string; // Added appVersion
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (body.handshakePassword !== HANDSHAKE_PASSWORD) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userID, userDevice, userLocale, installedTime, appVersion } =
      body as UserInfoSubmitted;

    if (
      !userID ||
      !userDevice ||
      !userLocale ||
      !installedTime ||
      !appVersion
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS user_info (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        user_device VARCHAR(255) NOT NULL,
        user_locale VARCHAR(50) NOT NULL,
        installed_time TIMESTAMP NOT NULL,
        app_version VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Insert or update user info
    await sql`
      INSERT INTO user_info (user_id, user_device, user_locale, installed_time, app_version)
      VALUES (${userID}, ${userDevice}, ${userLocale}, ${installedTime}, ${appVersion})
      ON CONFLICT (user_id) 
      DO UPDATE SET 
        user_device = EXCLUDED.user_device,
        user_locale = EXCLUDED.user_locale,
        installed_time = EXCLUDED.installed_time,
        app_version = EXCLUDED.app_version,
        updated_at = CURRENT_TIMESTAMP
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user info:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
