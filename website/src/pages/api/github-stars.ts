export async function get({ params }) {
  try {
    const response = await fetch(
      "https://api.github.com/repos/nomandhoni-cs/blink-eye"
    );
    if (!response.ok) {
      return new Response(JSON.stringify({ error: "Failed to fetch stars" }), {
        status: 500,
      });
    }
    const json = await response.json();
    const stars = parseInt(json["stargazers_count"]).toLocaleString();
    return new Response(JSON.stringify({ stars }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
    });
  }
}
