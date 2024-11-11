import * as React from "react";
import { DownloadIcon } from "lucide-react";
import { CONFIG } from "@/configs/site";
import { Button } from "./ui/button";
import Link from "next/link";
import VersionTolatDownloads from "./version-total-downloads";
import { ReleaseData } from "@/utils/github-fetch-types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
    {
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};

const DownloadApp = async () => {
  let downloadLinks: { [key: string]: string | null } = {
    windowsSetup: null,
    windowsMSI: null,
    macIntel: null,
    macSilicon: null,
    linuxAppImage: null,
    linuxDeb: null,
    linuxTar: null,
    linuxRPM: null,
  };
  let tag_name: string | null = null;

  try {
    const releaseData = await fetchReleaseData();
    tag_name = releaseData.tag_name;

    const { assets } = releaseData;
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        if (asset.name.endsWith(".exe") && asset.name.includes("x64-setup")) {
          downloadLinks.windowsSetup = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".msi") &&
          asset.name.includes("x64_en-US")
        ) {
          downloadLinks.windowsMSI = asset.browser_download_url;
        } else if (asset.name.endsWith(".dmg") && asset.name.includes("x64")) {
          downloadLinks.macIntel = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".dmg") &&
          asset.name.includes("aarch64")
        ) {
          downloadLinks.macSilicon = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".AppImage") &&
          asset.name.includes("amd64")
        ) {
          downloadLinks.linuxAppImage = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".deb") &&
          asset.name.includes("amd64")
        ) {
          downloadLinks.linuxDeb = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".tar.gz") &&
          asset.name.includes("x64")
        ) {
          downloadLinks.linuxTar = asset.browser_download_url;
        } else if (
          asset.name.endsWith(".rpm") &&
          asset.name.includes("x86_64")
        ) {
          downloadLinks.linuxRPM = asset.browser_download_url;
        }
      }
    }
  } catch (error) {
    console.error("Error fetching release data:", error);
  }

  return (
    <div className="relative bg-[#e24149]  max-w-6xl h-full py-8 rounded-xl">
      <svg
        id="visual"
        viewBox="0 0 1000 200"
        width="1000"
        height="200"
        className="absolute inset-0 w-full h-full z-0 rounded-xl"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        version="1.1"
      >
        <path
          d="M0 27L91 27L91 43L182 43L182 71L273 71L273 45L364 45L364 51L455 51L455 43L545 43L545 59L636 59L636 59L727 59L727 67L818 67L818 47L909 47L909 73L1000 73L1000 57L1000 0L1000 0L909 0L909 0L818 0L818 0L727 0L727 0L636 0L636 0L545 0L545 0L455 0L455 0L364 0L364 0L273 0L273 0L182 0L182 0L91 0L91 0L0 0Z"
          fill="#fe4c55"
        ></path>
        <path
          d="M0 97L91 97L91 117L182 117L182 113L273 113L273 135L364 135L364 99L455 99L455 109L545 109L545 101L636 101L636 103L727 103L727 115L818 115L818 121L909 121L909 107L1000 107L1000 111L1000 55L1000 71L909 71L909 45L818 45L818 65L727 65L727 57L636 57L636 57L545 57L545 41L455 41L455 49L364 49L364 43L273 43L273 69L182 69L182 41L91 41L91 25L0 25Z"
          fill="#ec3f5a"
        ></path>
        <path
          d="M0 137L91 137L91 147L182 147L182 149L273 149L273 157L364 157L364 153L455 153L455 157L545 157L545 149L636 149L636 143L727 143L727 155L818 155L818 149L909 149L909 135L1000 135L1000 141L1000 109L1000 105L909 105L909 119L818 119L818 113L727 113L727 101L636 101L636 99L545 99L545 107L455 107L455 97L364 97L364 133L273 133L273 111L182 111L182 115L91 115L91 95L0 95Z"
          fill="#d9335d"
        ></path>
        <path
          d="M0 169L91 169L91 179L182 179L182 177L273 177L273 187L364 187L364 177L455 177L455 181L545 181L545 183L636 183L636 163L727 163L727 167L818 167L818 161L909 161L909 161L1000 161L1000 175L1000 139L1000 133L909 133L909 147L818 147L818 153L727 153L727 141L636 141L636 147L545 147L545 155L455 155L455 151L364 151L364 155L273 155L273 147L182 147L182 145L91 145L91 135L0 135Z"
          fill="#c52a5f"
        ></path>
        <path
          d="M0 201L91 201L91 201L182 201L182 201L273 201L273 201L364 201L364 201L455 201L455 201L545 201L545 201L636 201L636 201L727 201L727 201L818 201L818 201L909 201L909 201L1000 201L1000 201L1000 173L1000 159L909 159L909 159L818 159L818 165L727 165L727 161L636 161L636 181L545 181L545 179L455 179L455 175L364 175L364 185L273 185L273 175L182 175L182 177L91 177L91 167L0 167Z"
          fill="#b0235f"
        ></path>
      </svg>

      <div className="relative z-10 flex flex-col justify-center items-center space-y-4">
        <h3 className="text-4xl font-bold py-4 text-white">Download Now</h3>
        <div className="flex flex-col items-center space-y-4 md:space-y-6 w-full px-4">
          {/* Platform Row */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 md:gap-8">
            {/* Windows Button */}
            <div className="flex flex-col items-center w-full sm:w-[300px] space-y-2">
              <div className="flex justify-center items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="28"
                  height="28"
                  viewBox="0 0 50 50"
                >
                  <path d="M 5 4 C 4.448 4 4 4.447 4 5 L 4 24 L 24 24 L 24 4 L 5 4 z M 26 4 L 26 24 L 46 24 L 46 5 C 46 4.447 45.552 4 45 4 L 26 4 z M 4 26 L 4 45 C 4 45.553 4.448 46 5 46 L 24 46 L 24 26 L 4 26 z M 26 26 L 26 46 L 45 46 C 45.552 46 46 45.553 46 45 L 46 26 L 26 26 z"></path>
                </svg>
                <div>Windows</div>
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Download for Windows" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Download for Windows</SelectLabel>
                    {downloadLinks.windowsSetup && (
                      <SelectItem value={downloadLinks.windowsSetup}>
                        <Link
                          href={downloadLinks.windowsSetup}
                          className="flex items-center space-x-2"
                        >
                          <DownloadIcon className="w-5 h-5" />
                          <span className="text-sm">Download (EXE)</span>
                        </Link>
                      </SelectItem>
                    )}
                    {downloadLinks.windowsMSI && (
                      <SelectItem value={downloadLinks.windowsMSI}>
                        <Link
                          href={downloadLinks.windowsMSI}
                          className="flex items-center space-x-2"
                        >
                          <DownloadIcon className="w-5 h-5" />
                          <span className="text-sm">Download (MSI)</span>
                        </Link>
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Mac Button */}
            <div className="flex flex-col items-center w-full sm:w-[300px] space-y-2">
              <div className="flex justify-center items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="28"
                  height="28"
                  viewBox="0 0 50 50"
                >
                  <path d="M 44.527344 34.75 C 43.449219 37.144531 42.929688 38.214844 41.542969 40.328125 C 39.601563 43.28125 36.863281 46.96875 33.480469 46.992188 C 30.46875 47.019531 29.691406 45.027344 25.601563 45.0625 C 21.515625 45.082031 20.664063 47.03125 17.648438 47 C 14.261719 46.96875 11.671875 43.648438 9.730469 40.699219 C 4.300781 32.429688 3.726563 22.734375 7.082031 17.578125 C 9.457031 13.921875 13.210938 11.773438 16.738281 11.773438 C 20.332031 11.773438 22.589844 13.746094 25.558594 13.746094 C 28.441406 13.746094 30.195313 11.769531 34.351563 11.769531 C 37.492188 11.769531 40.8125 13.480469 43.1875 16.433594 C 35.421875 20.691406 36.683594 31.78125 44.527344 34.75 Z M 31.195313 8.46875 C 32.707031 6.527344 33.855469 3.789063 33.4375 1 C 30.972656 1.167969 28.089844 2.742188 26.40625 4.78125 C 24.878906 6.640625 23.613281 9.398438 24.105469 12.066406 C 26.796875 12.152344 29.582031 10.546875 31.195313 8.46875 Z"></path>
                </svg>
                <span className="text-2xl font-semibold">MacOS</span>
              </div>
              <Select>
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Download for Mac" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Download for Mac</SelectLabel>
                    {downloadLinks.macSilicon && (
                      <SelectItem value={downloadLinks.macSilicon}>
                        <Link
                          href={downloadLinks.macSilicon}
                          className="flex items-center space-x-2"
                        >
                          <DownloadIcon className="w-5 h-5" />
                          <span className="text-sm">
                            Download (Apple Silicon)
                          </span>
                        </Link>
                      </SelectItem>
                    )}
                    {downloadLinks.macIntel && (
                      <SelectItem value={downloadLinks.macIntel}>
                        <Link
                          href={downloadLinks.macIntel}
                          className="flex items-center space-x-2"
                        >
                          <DownloadIcon className="w-5 h-5" />
                          <span className="text-sm">Download (Intel Chip)</span>
                        </Link>
                      </SelectItem>
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            {/* Linux Button */}
            <div className="flex flex-col items-center w-full sm:w-[300px] space-y-2">
              <div className="flex justify-center items-center space-x-2">
                <svg
                  role="img"
                  x="0px"
                  y="0px"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Linux</title>
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489a.424.424 0 00-.11.135c-.26.268-.45.6-.663.839-.199.199-.485.267-.797.4-.313.136-.658.269-.864.68-.09.189-.136.394-.132.602 0 .199.027.4.055.536.058.399.116.728.04.97-.249.68-.28 1.145-.106 1.484.174.334.535.47.94.601.81.2 1.91.135 2.774.6.926.466 1.866.67 2.616.47.526-.116.97-.464 1.208-.946.587-.003 1.23-.269 2.26-.334.699-.058 1.574.267 2.577.2.025.134.063.198.114.333l.003.003c.391.778 1.113 1.132 1.884 1.071.771-.06 1.592-.536 2.257-1.306.631-.765 1.683-1.084 2.378-1.503.348-.199.629-.469.649-.853.023-.4-.2-.811-.714-1.376v-.097l-.003-.003c-.17-.2-.25-.535-.338-.926-.085-.401-.182-.786-.492-1.046h-.003c-.059-.054-.123-.067-.188-.135a.357.357 0 00-.19-.064c.431-1.278.264-2.55-.173-3.694-.533-1.41-1.465-2.638-2.175-3.483-.796-1.005-1.576-1.957-1.56-3.368.026-2.152.236-6.133-3.544-6.139zm.529 3.405h.013c.213 0 .396.062.584.198.19.135.33.332.438.533.105.259.158.459.166.724 0-.02.006-.04.006-.06v.105a.086.086 0 01-.004-.021l-.004-.024a1.807 1.807 0 01-.15.706.953.953 0 01-.213.335.71.71 0 00-.088-.042c-.104-.045-.198-.064-.284-.133a1.312 1.312 0 00-.22-.066c.05-.06.146-.133.183-.198.053-.128.082-.264.088-.402v-.02a1.21 1.21 0 00-.061-.4c-.045-.134-.101-.2-.183-.333-.084-.066-.167-.132-.267-.132h-.016c-.093 0-.176.03-.262.132a.8.8 0 00-.205.334 1.18 1.18 0 00-.09.4v.019c.002.089.008.179.02.267-.193-.067-.438-.135-.607-.202a1.635 1.635 0 01-.018-.2v-.02a1.772 1.772 0 01.15-.768c.082-.22.232-.406.43-.533a.985.985 0 01.594-.2zm-2.962.059h.036c.142 0 .27.048.399.135.146.129.264.288.344.465.09.199.14.4.153.667v.004c.007.134.006.2-.002.266v.08c-.03.007-.056.018-.083.024-.152.055-.274.135-.393.2.012-.09.013-.18.003-.267v-.015c-.012-.133-.04-.2-.082-.333a.613.613 0 00-.166-.267.248.248 0 00-.183-.064h-.021c-.071.006-.13.04-.186.132a.552.552 0 00-.12.27.944.944 0 00-.023.33v.015c.012.135.037.2.08.334.046.134.098.2.166.268.01.009.02.018.034.024-.07.057-.117.07-.176.136a.304.304 0 01-.131.068 2.62 2.62 0 01-.275-.402 1.772 1.772 0 01-.155-.667 1.759 1.759 0 01.08-.668 1.43 1.43 0 01.283-.535c.128-.133.26-.2.418-.2zm1.37 1.706c.332 0 .733.065 1.216.399.293.2.523.269 1.052.468h.003c.255.136.405.266.478.399v-.131a.571.571 0 01.016.47c-.123.31-.516.643-1.063.842v.002c-.268.135-.501.333-.775.465-.276.135-.588.292-1.012.267a1.139 1.139 0 01-.448-.067 3.566 3.566 0 01-.322-.198c-.195-.135-.363-.332-.612-.465v-.005h-.005c-.4-.246-.616-.512-.686-.71-.07-.268-.005-.47.193-.6.224-.135.38-.271.483-.336.104-.074.143-.102.176-.131h.002v-.003c.169-.202.436-.47.839-.601.139-.036.294-.065.466-.065zm2.8 2.142c.358 1.417 1.196 3.475 1.735 4.473.286.534.855 1.659 1.102 3.024.156-.005.33.018.513.064.646-1.671-.546-3.467-1.089-3.966-.22-.2-.232-.335-.123-.335.59.534 1.365 1.572 1.646 2.757.13.535.16 1.104.021 1.67.067.028.135.06.205.067 1.032.534 1.413.938 1.23 1.537v-.043c-.06-.003-.12 0-.18 0h-.016c.151-.467-.182-.825-1.065-1.224-.915-.4-1.646-.336-1.77.465-.008.043-.013.066-.018.135-.068.023-.139.053-.209.064-.43.268-.662.669-.793 1.187-.13.533-.17 1.156-.205 1.869v.003c-.02.334-.17.838-.319 1.35-1.5 1.072-3.58 1.538-5.348.334a2.645 2.645 0 00-.402-.533 1.45 1.45 0 00-.275-.333c.182 0 .338-.03.465-.067a.615.615 0 00.314-.334c.108-.267 0-.697-.345-1.163-.345-.467-.931-.995-1.788-1.521-.63-.4-.986-.87-1.15-1.396-.165-.534-.143-1.085-.015-1.645.245-1.07.873-2.11 1.274-2.763.107-.065.037.135-.408.974-.396.751-1.14 2.497-.122 3.854a8.123 8.123 0 01.647-2.876c.564-1.278 1.743-3.504 1.836-5.268.048.036.217.135.289.202.218.133.38.333.59.465.21.201.477.335.876.335.039.003.075.006.11.006.412 0 .73-.134.997-.268.29-.134.52-.334.74-.4h.005c.467-.135.835-.402 1.044-.7zm2.185 8.958c.037.6.343 1.245.882 1.377.588.134 1.434-.333 1.791-.765l.211-.01c.315-.007.577.01.847.268l.003.003c.208.199.305.53.391.876.085.4.154.78.409 1.066.486.527.645.906.636 1.14l.003-.007v.018l-.003-.012c-.015.262-.185.396-.498.595-.63.401-1.746.712-2.457 1.57-.618.737-1.37 1.14-2.036 1.191-.664.053-1.237-.2-1.574-.898l-.005-.003c-.21-.4-.12-1.025.056-1.69.176-.668.428-1.344.463-1.897.037-.714.076-1.335.195-1.814.12-.465.308-.797.641-.984l.045-.022zm-10.814.049h.01c.053 0 .105.005.157.014.376.055.706.333 1.023.752l.91 1.664.003.003c.243.533.754 1.064 1.189 1.637.434.598.77 1.131.729 1.57v.006c-.057.744-.48 1.148-1.125 1.294-.645.135-1.52.002-2.395-.464-.968-.536-2.118-.469-2.857-.602-.369-.066-.61-.2-.723-.4-.11-.2-.113-.602.123-1.23v-.004l.002-.003c.117-.334.03-.752-.027-1.118-.055-.401-.083-.71.043-.94.16-.334.396-.4.69-.533.294-.135.64-.202.915-.47h.002v-.002c.256-.268.445-.601.668-.838.19-.201.38-.336.663-.336zm7.159-9.074c-.435.201-.945.535-1.488.535-.542 0-.97-.267-1.28-.466-.154-.134-.28-.268-.373-.335-.164-.134-.144-.333-.074-.333.109.016.129.134.199.2.096.066.215.2.36.333.292.2.68.467 1.167.467.485 0 1.053-.267 1.398-.466.195-.135.445-.334.648-.467.156-.136.149-.267.279-.267.128.016.034.134-.147.332a8.097 8.097 0 01-.69.468zm-1.082-1.583V5.64c-.006-.02.013-.042.029-.05.074-.043.18-.027.26.004.063 0 .16.067.15.135-.006.049-.085.066-.135.066-.055 0-.092-.043-.141-.068-.052-.018-.146-.008-.163-.065zm-.551 0c-.02.058-.113.049-.166.066-.047.025-.086.068-.14.068-.05 0-.13-.02-.136-.068-.01-.066.088-.133.15-.133.08-.031.184-.047.259-.005.019.009.036.03.03.05v.02h.003z" />
                </svg>
                <span className="text-2xl font-semibold">Linux</span>
              </div>
                <Select>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="Download for Linux" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Download for Linux</SelectLabel>
                      {downloadLinks.linuxAppImage && (
                        <SelectItem value={downloadLinks.linuxAppImage}>
                          <Link
                            href={downloadLinks.linuxAppImage}
                            className="flex items-center space-x-2"
                          >
                            <DownloadIcon className="w-5 h-5" />
                            <span className="text-sm">Download (AppImage)</span>
                          </Link>
                        </SelectItem>
                      )}
                      {downloadLinks.linuxDeb && (
                        <SelectItem value={downloadLinks.linuxDeb}>
                          <Link
                            href={downloadLinks.linuxDeb}
                            className="flex items-center space-x-2"
                          >
                            <DownloadIcon className="w-5 h-5" />
                            <span className="text-sm">Download (Debian)</span>
                          </Link>
                        </SelectItem>
                      )}
                      {downloadLinks.linuxTar && (
                        <SelectItem value={downloadLinks.linuxTar}>
                          <Link
                            href={downloadLinks.linuxTar}
                            className="flex items-center space-x-2"
                          >
                            <DownloadIcon className="w-5 h-5" />
                            <span className="text-sm">Download (x64 TAR)</span>
                          </Link>
                        </SelectItem>
                      )}
                      {downloadLinks.linuxRPM && (
                        <SelectItem value={downloadLinks.linuxRPM}>
                          <Link
                            href={downloadLinks.linuxRPM}
                            className="flex items-center space-x-2"
                          >
                            <DownloadIcon className="w-5 h-5" />
                            <span className="text-sm">Download (RPM)</span>
                          </Link>
                        </SelectItem>
                      )}
                    </SelectGroup>
                  </SelectContent>
                </Select>
            </div>
          </div>
        </div>
        <VersionTolatDownloads tag_name={tag_name} />
      </div>
    </div>
  );
};

export default DownloadApp;
