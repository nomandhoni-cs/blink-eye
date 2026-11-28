const RELEASES_URL = "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases";
const RELEASE_URL = "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/tags";

export interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
  browser_download_url: string;
}

export interface Release {
  id: number;
  name: string;
  tag_name: string;
  published_at: string;
  body: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  assets: ReleaseAsset[];
  tarball_url: string;
  zipball_url: string;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (process.env.BLINK_EYE_WEBSITE_TOKEN) {
    headers.Authorization = `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`;
  }
  return headers;
}

/** Shared, build-time cached GitHub release data for the English changelog. */
export async function getReleases(): Promise<Release[]> {
  const response = await fetch(RELEASES_URL, {
    headers: getHeaders(),
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch releases: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export async function getRelease(tag: string): Promise<Release> {
  const response = await fetch(`${RELEASE_URL}/${encodeURIComponent(tag)}`, {
    headers: getHeaders(),
    cache: "force-cache",
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch release ${tag}: ${response.status} ${response.statusText}`);
  }
  return response.json();
}
