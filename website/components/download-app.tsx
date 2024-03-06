import { ChromeIcon, DownloadIcon } from "lucide-react";
import { CONFIG } from "@/configs/site";
import { Button } from "./ui/button";
import Link from "next/link";
interface Asset {
  name: string;
  published_at: string;
  browser_download_url: string;
}

interface ReleaseData {
  tag_name: string;
  assets: Asset[];
}

const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};

const DownloadApp = async () => {
  let downloadLink: string | null = null;
  let tag_name: string | null = null;

  try {
    const releaseData = await fetchReleaseData();
    tag_name = releaseData.tag_name;

    const { assets } = releaseData;
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        if (asset.name.endsWith(".exe") && asset.name.includes("Windows_64")) {
          downloadLink = asset.browser_download_url;
          break;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching release data:", error);
  }

  if (!downloadLink) {
    downloadLink = `${CONFIG.repository}/releases`;
  }

  return (
    <div className="flex items-center justify-center space-x-2 ">
      <div className="flex items-center justify-center h-10 w-40 bg-muted border border-muted rounded-md">
        <Button asChild>
          <Link href={downloadLink} className="flex items-center space-x-2">
            <DownloadIcon name="download" className="w-5 h-5" />
            <span className="text-sm">Download App {tag_name}</span>
          </Link>
        </Button>
      </div>
      <div className="flex items-center">
        <div className="h-4 w-4 border-y-8 border-l-0 border-r-8 border-solid border-muted border-y-transparent"></div>
        <div className="flex h-10 items-center rounded-md border border-muted bg-muted px-4 font-medium">
          {" "}
          Available on Windows
        </div>
      </div>
    </div>
  );
};

export default DownloadApp;
