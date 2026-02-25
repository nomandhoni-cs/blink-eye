import { ReleaseData } from "./github-fetch-types";

export const fetchReleaseData = async (): Promise<ReleaseData | null> => {
  try {
    const res = await fetch(
      "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
      {
        headers: {
          'Accept': 'application/vnd.github+json',
          // Add GitHub token if available to avoid rate limiting
          ...(process.env.BLINK_EYE_WEBSITE_TOKEN && {
            'Authorization': `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`
          })
        }
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}: ${res.statusText}`);
      return null;
    }

    return res.json();
  } catch (error) {
    console.warn("Failed to fetch release data:", error);
    return null;
  }
};

// This function will be called at build time
export const getStaticProps = async () => {
  const releaseData = await fetchReleaseData();
  return {
    props: {
      releaseData,
    },
  };
};
