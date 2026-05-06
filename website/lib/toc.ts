import GithubSlugger from "github-slugger";

export type TocEntry = {
  id: string;
  text: string;
  level: number;
};

/**
 * Extracts heading entries from raw markdown text.
 * Uses github-slugger to produce the same IDs as rehype-slug,
 * so TOC links match the rendered heading anchors.
 */
export function extractToc(markdown: string): TocEntry[] {
  const slugger = new GithubSlugger();
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const entries: TocEntry[] = [];

  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length; // 2 = h2, 3 = h3, 4 = h4
    const rawText = match[2]
      .replace(/\*\*(.*?)\*\*/g, "$1") // strip bold
      .replace(/\*(.*?)\*/g, "$1") // strip italic
      .replace(/`(.*?)`/g, "$1") // strip inline code
      .replace(/\[(.*?)\]\(.*?\)/g, "$1") // strip links
      .trim();

    entries.push({
      id: slugger.slug(rawText),
      text: rawText,
      level,
    });
  }

  return entries;
}
