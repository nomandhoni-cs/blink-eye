import { NextResponse } from "next/server";
const HANDSHAKE_PASSWORD = process.env.HANDSHAKE_PASSWORD;
type LicenseActivateRequestBody = {
  license_key: string;
  instance_name: string;
  handshake_password: string;
};

export const dynamic = "force-dynamic";
export async function POST(req: Request) {
  try {
    // Parse the JSON body from the incoming request
    const reqData = await req.json();
    const { license_key, instance_name, handshake_password } =
      reqData as LicenseActivateRequestBody;

    if (handshake_password !== HANDSHAKE_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid handshake password" },
        { status: 401 }
      );
    }
    // Check for missing parameters
    if (!license_key || !instance_name) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    // Make the API request to Lemon Squeezy
    const response = await fetch(
      "https://api.lemonsqueezy.com/v1/licenses/activate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({ license_key, instance_name }),
      }
    );

    // If the response is not okay, throw an error
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error activating license:", error);
    return NextResponse.json(
      { error: "Failed to activate license" },
      { status: 500 }
    );
  }
}
