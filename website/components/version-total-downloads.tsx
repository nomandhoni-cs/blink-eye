import { ReleaseData } from "@/utils/github-fetch-types";
import { Separator } from "./ui/separator";
import { Clock, DownloadIcon } from "lucide-react";
const fetchDownloadAmounts = async (): Promise<ReleaseData[]> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases",
    { next: { revalidate: 3600 } }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};
const VersionTolatDownloads = async ({ tag_name }) => {
  const releases = await fetchDownloadAmounts();
  const totalDownloadCount = releases.reduce((accumulator, release) => {
    return (
      accumulator +
      release.assets.reduce((assetAccumulator, asset) => {
        return assetAccumulator + asset.download_count;
      }, 0)
    );
  }, 0);
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 hover:bg-white dark:hover:bg-white/5 transition-colors duration-300 shadow-sm">
        <Clock className="w-4 h-4 text-[#FE4C55]" />
        <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
           Latest Version: <span className="text-gray-900 dark:text-white font-semibold">{tag_name}</span>
        </span>
      </div>
      
      <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 hover:bg-white dark:hover:bg-white/5 transition-colors duration-300 shadow-sm">
        <DownloadIcon className="w-4 h-4 text-[#FE4C55]" />
        <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
          Total Downloaded: <span className="text-gray-900 dark:text-white font-semibold">{totalDownloadCount} times</span>
        </span>
      </div>
    </div>
  );
};

export default VersionTolatDownloads;
