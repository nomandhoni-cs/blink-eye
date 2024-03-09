import { DownloadIcon } from "lucide-react";
import { CONFIG } from "@/configs/site";
import { Button } from "./ui/button";
import Link from "next/link";
import { Badge } from "./ui/badge";
import VersionTolatDownloads from "./version-total-downloads";
import { ReleaseData } from "@/utils/github-fetch-types";

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
    <div className="flex flex-col justify-center items-center space-y-4 space-x-0">
      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-5 rounded-md">
        <Button asChild>
          <Link href={downloadLink} className="flex items-center space-x-2">
            <DownloadIcon name="download" className="w-5 h-5" />
            <span className="text-sm">Download for Windows</span>
          </Link>
        </Button>
        <Button disabled>
          <div className="flex items-center space-x-2">
            <DownloadIcon name="download" className="w-5 h-5" />
            <span className="text-sm">Mac (Soon)</span>
          </div>
        </Button>
        <Button disabled>
          <div className="flex items-center space-x-2">
            <DownloadIcon name="download" className="w-5 h-5" />
            <span className="text-sm">Linux (Soon)</span>
          </div>
        </Button>
      </div>
      <VersionTolatDownloads tag_name={tag_name} />
    </div>
  );
};

export default DownloadApp;
