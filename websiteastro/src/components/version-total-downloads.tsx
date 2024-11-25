
import { useEffect, useState } from "react";
import type { ReleaseData } from "@/types/github-fetch-types";
import { Separator } from "./ui/separator";
import { Clock, DownloadIcon } from "lucide-react";

const fetchDownloadAmounts = async (): Promise<ReleaseData[]> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases"
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};

const VersionTotalDownloads = ({ tag_name }: { tag_name: string }) => {
  const [totalDownloadCount, setTotalDownloadCount] = useState<number | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const releases = await fetchDownloadAmounts();
        const totalCount = releases.reduce((accumulator, release) => {
          return (
            accumulator +
            release.assets.reduce((assetAccumulator, asset) => {
              return assetAccumulator + asset.download_count;
            }, 0)
          );
        }, 0);
        setTotalDownloadCount(totalCount);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch total downloads.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading total downloads...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }
  return (
    <div className="mx-auto max-w-2xl">
      <div className="sm:mb-5 sm:flex sm:justify-center">
        <div className="flex items-center sm:space-x-5 relative rounded-full px-3 py-1 text-sm leading-6 ring-1 ring-gray-700 hover:ring-gray-900/20 dark:ring-gray-100 dark:hover:ring-gray-300">
          <span className="hidden sm:inline text-center sm:text-left">
            <Clock className="inline w-4 h-4" /> Latest Version: {tag_name}
          </span>
          <span className="sm:hidden">
            <Clock className="inline w-4 h-4" /> {tag_name}
          </span>
          <Separator
            className="mx-2 sm:mx-5 my-2 sm:my-0"
            orientation="vertical"
          />
          <span className="hidden sm:inline text-center sm:text-right">
            <DownloadIcon className="inline w-4 h-4" /> Total Downloaded:{" "}
            {totalDownloadCount} times
          </span>
          <span className="sm:hidden">
            <DownloadIcon className="inline w-4 h-4" /> {totalDownloadCount}{" "}
            times
          </span>
        </div>
      </div>
    </div>
  );
};
export default VersionTotalDownloads;

