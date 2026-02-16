export const fetchStarCount = async () => {
  const headers: HeadersInit = {
    Accept: "application/vnd.github+json",
  };

  if (process.env.BLINK_EYE_WEBSITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`;
  }

  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye",
    {
      headers,
      next: { revalidate: 3600 }, // Cache for 1 hour
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch star count");
  }
  const json = await res.json();

  return parseInt(json["stargazers_count"]).toLocaleString();
};

// This function will be called at build time
export const getStaticProps = async () => {
  try {
    const starCount = await fetchStarCount();
    return {
      props: {
        starCount,
      },
    };
  } catch (error) {
    return {
      props: {
        starCount: null,
        error: error instanceof Error ? error.message : String(error),
      },
    };
  }
};
