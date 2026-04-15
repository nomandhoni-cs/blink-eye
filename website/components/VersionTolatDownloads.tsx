import { Clock, DownloadIcon } from "lucide-react";

interface Props {
  tagName: string;
  totalDownloads: number;
}

const VersionTolatDownloads = ({ tagName, totalDownloads }: Props) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 hover:bg-white dark:hover:bg-white/5 transition-colors duration-300 shadow-sm">
        <Clock className="w-4 h-4 text-[#FE4C55]" />
        <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
          Latest Version:{" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            {tagName}
          </span>
        </span>
      </div>

      <div className="inline-flex items-center space-x-2 bg-gray-50 dark:bg-[#111111] border border-gray-200 dark:border-white/10 rounded-full px-4 py-2 hover:bg-white dark:hover:bg-white/5 transition-colors duration-300 shadow-sm">
        <DownloadIcon className="w-4 h-4 text-[#FE4C55]" />
        <span className="text-sm font-medium text-gray-600 dark:text-zinc-300">
          Total Downloaded:{" "}
          <span className="text-gray-900 dark:text-white font-semibold">
            {totalDownloads} times
          </span>
        </span>
      </div>
    </div>
  );
};

export default VersionTolatDownloads;