// import { ReleaseData } from "../types/github-fetch-types";

import type { ReleaseData } from "@/types/github-fetch-types";

export // Utility function to filter assets by type
const getDownloadLinks = (assets: ReleaseData["assets"]) => {
  return {
    windowsSetup:
      assets.find(
        (asset) =>
          asset.name.endsWith(".exe") && asset.name.includes("x64-setup")
      )?.browser_download_url || null,
    windowsMSI:
      assets.find(
        (asset) =>
          asset.name.endsWith(".msi") && asset.name.includes("x64_en-US")
      )?.browser_download_url || null,
    macIntel:
      assets.find(
        (asset) => asset.name.endsWith(".dmg") && asset.name.includes("x64")
      )?.browser_download_url || null,
    macSilicon:
      assets.find(
        (asset) => asset.name.endsWith(".dmg") && asset.name.includes("aarch64")
      )?.browser_download_url || null,
    linuxDeb:
      assets.find(
        (asset) => asset.name.endsWith(".deb") && asset.name.includes("amd64")
      )?.browser_download_url || null,
    linuxAppImage:
      assets.find(
        (asset) =>
          asset.name.endsWith(".AppImage") && asset.name.includes("amd64")
      )?.browser_download_url || null,
    linuxTar:
      assets.find(
        (asset) => asset.name.endsWith(".tar.gz") && asset.name.includes("x64")
      )?.browser_download_url || null,
    linuxRPM:
      assets.find(
        (asset) => asset.name.endsWith(".rpm") && asset.name.includes("x86_64")
      )?.browser_download_url || null,
  };
};