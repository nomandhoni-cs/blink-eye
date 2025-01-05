import { ReleaseData } from "./github-fetch-types";

export const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest"
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};

// This function will be called at build time
export const getStaticProps = async () => {
  try {
    const releaseData = await fetchReleaseData();
    return {
      props: {
        releaseData,
      },
    };
  } catch (error) {
    return {
      props: {
        releaseData: null,
        error: error.message,
      },
    };
  }
};
