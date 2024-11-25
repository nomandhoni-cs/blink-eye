import type { APIRoute } from "astro";
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      message: "Hello, World!",
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse the JSON body from the incoming request
    const reqData = await request.json();
    const { license_key, instance_name } = reqData as {
      license_key: string;
      instance_name: string;
    };

    // Check for missing parameters
    if (!license_key || !instance_name) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
          Authorization: `Bearer ${import.meta.env.LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({ license_key, instance_name }),
      }
    );

    // If the response is not okay, throw an error
    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify(errorData), {
        status: response.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Return the response from Lemon Squeezy
    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error activating license:", error);
    return new Response(
      JSON.stringify({ error: "Failed to activate license" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};