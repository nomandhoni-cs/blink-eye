import { useEffect, useState } from "react";
import DownloadDropdown from "./DownloadDropdown";
import { fetchReleaseData } from "@/lib/fetch-github-release";
import { getDownloadLinks } from "@/lib/getReleaseData";
import { LinuxIcon, MacIcon, WindowsIcon } from "@/lib/mac-win-linicon";
import DownloadButton from "./download-button";
import VersionTolatDownloads from "./version-total-downloads";


type DownloadLinks = {
  windowsSetup: string | null;
  windowsMSI: string | null;
  macIntel: string | null;
  macSilicon: string | null;
  linuxAppImage: string | null;
  linuxDeb: string | null;
  linuxTar: string | null;
  linuxRPM: string | null;
};

export function DownloadApp  () {
  const [downloadLinks, setDownloadLinks] = useState<DownloadLinks | null>(null);
  const [tagName, setTagName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const releaseData = await fetchReleaseData();
        setTagName(releaseData.tag_name);
        setDownloadLinks(getDownloadLinks(releaseData.assets));
      } catch (err) {
        console.error("Failed to fetch release data:", err);
        setError("Failed to fetch release data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!downloadLinks || !tagName) {
    return <div className="loading-message">Loading...</div>;
  }

  return (
    <div className="relative max-w-6xl h-full py-8 rounded-xl">
      <div className="relative z-10 flex flex-col justify-center items-center space-y-4">
        <h2 className="mt-2 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Download Free & Start Now
        </h2>
        <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full px-4">
          {/* Platform Row */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {/* Windows Button */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.windowsSetup && (
                <DownloadButton
                  href={downloadLinks.windowsSetup}
                  label="Download for Windows"
                  icon={<WindowsIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.windowsSetup!,
                    label: "Download (EXE)",
                  },
                  {
                    href: downloadLinks.windowsMSI!,
                    label: "Download (MSI)",
                  },
                ]}
              />
            </div>
            {/* MacOS Download Options */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.macSilicon && (
                <DownloadButton
                  href={downloadLinks.macSilicon}
                  label="Download for MacOS"
                  icon={<MacIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.macSilicon!,
                    label: "Download (Apple Silicon)",
                  },
                  {
                    href: downloadLinks.macIntel!,
                    label: "Download (Intel Chip)",
                  },
                ]}
              />
            </div>
            {/* Linux Download Options */}
            <div className="flex items-center bg-[#FE4C55] h-16 py-4 pr-2 rounded-full">
              {downloadLinks.linuxDeb && (
                <DownloadButton
                  href={downloadLinks.linuxDeb}
                  label="Download for Linux"
                  icon={<LinuxIcon />}
                />
              )}
              <DownloadDropdown
                links={[
                  {
                    href: downloadLinks.linuxAppImage!,
                    label: "Download (AppImage)",
                  },
                  { href: downloadLinks.linuxDeb!, label: "Download (Debian)" },
                  { href: downloadLinks.linuxTar!, label: "Download (Tar.gz)" },
                  { href: downloadLinks.linuxRPM!, label: "Download (RPM)" },
                ]}
              />
            </div>
          </div>
        </div>
        <span className="text-sm px-8">
          Supports macOS Intel/M Chip (ARM) | Windows 10, 11 (MSI, EXE) | Linux
          (Debian, AppImage, RPM, TAR)
        </span>
        <a href="/changelog" className="text-base font-semibold">
          Release Notes
        </a>
        <VersionTolatDownloads tag_name={tagName} /> 
      </div>
    </div>
  );
};
