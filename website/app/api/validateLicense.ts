// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type LicenseValidateRequestBody = {
  license_key: string;
  instance_id?: string;
};

type LicenseValidateResponse = {
  [key: string]: any; // You may want to define this more specifically based on the response structure from the API
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LicenseValidateResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { license_key, instance_id } = req.body as LicenseValidateRequestBody;

    if (!license_key) {
      return res.status(400).json({ error: "Missing license key" });
    }

    const body: LicenseValidateRequestBody = { license_key };
    if (instance_id) {
      body.instance_id = instance_id;
    }

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

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error validating license:", error);
    return res.status(500).json({ error: "Failed to validate license" });
  }
}
