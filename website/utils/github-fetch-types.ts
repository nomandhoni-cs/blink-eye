export interface Asset {
  name: string;
  published_at: string;
  browser_download_url: string;
  download_count: number;
}

export interface ReleaseData {
  tag_name: string;
  assets: Asset[];
}

// Add a new type for our unified response
export interface GithubStats {
  latestRelease: ReleaseData | null;
  tagName: string;
  totalDownloads: number;
}