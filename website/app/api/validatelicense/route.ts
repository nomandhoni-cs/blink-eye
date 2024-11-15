import { NextResponse } from "next/server";

export const dynamic = "force-dynamic"; // To make sure the route is handled dynamically

type LicenseValidateRequestBody = {
  license_key: string;
  instance_id?: string;
};

export async function POST(req: Request) {
  try {
    const reqData = await req.json();
    const { license_key, instance_id } = reqData as LicenseValidateRequestBody;

    // Validate the license key
    if (!license_key) {
      return NextResponse.json(
        { error: "Missing license key" },
        { status: 400 }
      );
    }

    const body: LicenseValidateRequestBody = { license_key };
    if (instance_id) {
      body.instance_id = instance_id;
    }

    // Call Lemon Squeezy API to validate the license
    const response = await fetch(
      "https://api.lemonsqueezy.com/v1/licenses/validate",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify(body),
      }
    );

    // If the response is not okay, return the error
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Return the valid license data
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error validating license:", error);
    return NextResponse.json(
      { error: "Failed to validate license" },
      { status: 500 }
    );
  }
}
