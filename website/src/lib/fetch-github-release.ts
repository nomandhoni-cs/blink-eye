import type { ReleaseData } from "@/types/github-fetch-types";


export const fetchReleaseData = async (): Promise<ReleaseData> => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/latest",
  );
  console.log(res);
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  return res.json();
};
