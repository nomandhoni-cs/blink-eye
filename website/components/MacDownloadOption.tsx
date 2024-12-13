"use client";
import Image from "next/image";
import { useState } from "react";
import { MacIcon } from "@/utils/mac-win-linicon";
import DownloadButton from "./ui/download-button";
import DownloadDropdown from "./DownloadDropdown";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface MacDownloadOptionProps {
  mainLink: string | null;
  dropdownLinks: { href: string; label: string }[];
}

export const MacDownloadOption = ({
  mainLink,
  dropdownLinks,
}: MacDownloadOptionProps) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleDownload = (link: string) => {
    // Trigger download
    if (!link) return;

    const downloadLink = document.createElement("a");
    downloadLink.href = link;
    downloadLink.download = "";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);

    // Open popover
    setIsPopoverOpen(true);
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
        {mainLink && (
          <PopoverTrigger asChild>
            <DownloadButton
              href={mainLink}
              label="Download for MacOS"
              icon={<MacIcon />}
              onClick={() => handleDownload(mainLink)}
            />
          </PopoverTrigger>
        )}
        <DownloadDropdown
          links={dropdownLinks.map((link) => ({
            ...link,
            onClick: () => handleDownload(link.href),
          }))}
        />
        <PopoverContent className="w-96 p-6 bg-white shadow-lg rounded-lg">
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-800">
              How to Install on MacOS
            </h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">1.</span>
                <p>Open the downloaded .dmg file</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">2.</span>
                <p>Drag the application to the Applications folder</p>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-700">3.</span>
                <p>
                  If prompted, allow installation from unidentified developers
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Image
                src="/api/placeholder/350/200"
                alt="MacOS Installation Guide"
                width={350}
                height={200}
                className="rounded-lg border"
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Note: First-time users might need to adjust security settings in
              System Preferences
            </p>
          </div>
        </PopoverContent>
      </div>
    </Popover>
  );
};
