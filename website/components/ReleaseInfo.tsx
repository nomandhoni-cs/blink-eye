
import { Link } from "@/i18n/routing";
import VersionTolatDownloads from "./VersionTolatDownloads";

interface ReleaseInfoProps {
    tagName: string;
    totalDownloads: number;
}

const ReleaseInfo = ({ tagName, totalDownloads }: ReleaseInfoProps) => {
    return (
        <div className="relative pt-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-px flex-1 bg-linear-to-r from-transparent via-gray-300 dark:via-zinc-700 to-gray-300 dark:to-zinc-700"></div>
                <Link
                    href="/changelog"
                    className="shrink-0 text-gray-800 dark:text-zinc-200 font-semibold hover:text-[#FE4C55] dark:hover:text-[#FE4C55] transition-colors duration-300"
                >
                    Release Notes
                </Link>
                <div className="h-px flex-1 bg-linear-to-l from-transparent via-gray-300 dark:via-zinc-700 to-gray-300 dark:to-zinc-700"></div>
            </div>

            <div className="flex justify-center gap-4">
                <VersionTolatDownloads tagName={tagName} totalDownloads={totalDownloads} />
            </div>
        </div>
    );
};

export default ReleaseInfo;