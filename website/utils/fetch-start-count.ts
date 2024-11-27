export const fetchStarCount = async () => {
  const res = await fetch(
    "https://api.github.com/repos/nomandhoni-cs/blink-eye",
    {
      next: { revalidate: 3600 },
    }
  );
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }
  const json = await res.json();

  return parseInt(json["stargazers_count"]).toLocaleString();
};
