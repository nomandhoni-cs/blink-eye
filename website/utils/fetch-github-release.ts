import { ReleaseData, GithubStats } from "./github-fetch-types";

export const fetchGithubStats = async (): Promise<GithubStats> => {
  try {
    // Note: We fetch ALL releases here, not just /latest, so we can calculate total downloads
    const res = await fetch(
      "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
      {
        headers: {
          Accept: "application/vnd.github+json",
          ...(process.env.BLINK_EYE_WEBSITE_TOKEN && {
            Authorization: `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`,
          }),
        },
        // App Router statically caches this at build time automatically
        next: { revalidate: false }, 
      }
    );

    if (!res.ok) {
      console.warn(`GitHub API returned ${res.status}`);
      return { latestRelease: null, tagName: "v1.0.0", totalDownloads: 0 };
    }

    const releases: ReleaseData[] = await res.json();

    if (!releases || releases.length === 0) {
      return { latestRelease: null, tagName: "v1.0.0", totalDownloads: 0 };
    }

    // 1. Get Latest Release (GitHub API returns them sorted by newest first)
    const latestRelease = releases[0];
    const tagName = latestRelease.tag_name;

    // 2. Calculate Total Downloads across all releases and assets
    const totalDownloads = releases.reduce((acc, release) => {
      return (
        acc +
        release.assets.reduce((assetAcc, asset) => assetAcc + asset.download_count, 0)
      );
    }, 0);

    return {
      latestRelease,
      tagName,
      totalDownloads,
    };
  } catch (error) {
    console.error("Failed to fetch GitHub data:", error);
    return { latestRelease: null, tagName: "v1.0.0", totalDownloads: 0 };
  }
};