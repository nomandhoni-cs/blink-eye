export const fetchStarCount = async () => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye"
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
        error: error.message,
      },
    };
  }
};
