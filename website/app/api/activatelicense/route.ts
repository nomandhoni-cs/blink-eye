// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

type LicenseActivateRequestBody = {
  license_key: string;
  instance_name: string;
};

type LicenseActivateResponse = {
  [key: string]: any; // You may want to define this more specifically based on the response structure from the API
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LicenseActivateResponse>
) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { license_key, instance_name } =
      req.body as LicenseActivateRequestBody;

    if (!license_key || !instance_name) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

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

    const data = await response.json();

    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Error activating license:", error);
    return res.status(500).json({ error: "Failed to activate license" });
  }
}