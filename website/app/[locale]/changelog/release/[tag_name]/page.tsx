import React from "react";
import { remark } from "remark";
import html from "remark-html";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getTranslations, getLocale } from "next-intl/server";
import { Metadata } from "next";

// Dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const { tag_name } = params;
  const releaseInfo = await getData(tag_name);
  const t = await getTranslations("ReleaseInfo");
  return {
    title: t("metaTitle", { tag: releaseInfo.tag_name }),
    description: releaseInfo.body,
  };
}

// Create a DOMPurify instance for SSR
const createDOMPurify = () => {
  if (typeof window === "undefined") {
    const { window } = new JSDOM("");
    return DOMPurify(window as unknown as Window);
  }
  return DOMPurify;
};

// Function to sanitize and render markdown
const renderMarkdown = async (markdownText: string) => {
  // Convert Markdown to HTML using remark
  const processedContent = await remark().use(html).process(markdownText);
  const htmlContent = processedContent.toString();

  // Create a DOMPurify instance
  const purify = createDOMPurify();

  // Sanitize the HTML to avoid any malicious scripts using DOMPurify
  return purify.sanitize(htmlContent);
};

async function getData(tag_name: string) {
  const res = await fetch(
    `https://api.github.com/repos/nomandhoni-cs/blink-eye/releases/tags/${tag_name}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.BLINK_EYE_WEBSITE_TOKEN}`,
      },
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }

  return res.json();
}

const ReleaseInfoPage = async ({ params }) => {
  const { tag_name } = params;
  const locale = await getLocale();
  const t = await getTranslations("ReleaseInfo");
  const releaseData = await getData(tag_name);

  // Render the sanitized and markdown-converted body
  const releaseBody = await renderMarkdown(releaseData.body);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        {t("title", { tag: tag_name })}
      </h1>
      <Button asChild variant="secondary">
        <Link
          href={`/${locale}/changelog`}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">{t("goBack")}</span>
        </Link>
      </Button>
      <div className="shadow-2xl rounded-lg p-6 space-y-4">
        <h2 className="text-2xl font-semibold">{releaseData.name}</h2>
        <p className="text-sm">
          {t("tag")}: {releaseData.tag_name}
        </p>
        <p className="text-sm">
          {t("published")}:{" "}
          {new Date(releaseData.published_at).toLocaleDateString(locale, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        <div className="flex items-center space-x-4">
          <img
            src={releaseData.author.avatar_url}
            alt={releaseData.author.login}
            className="w-12 h-12 rounded-full"
          />
          <a
            href={releaseData.author.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {releaseData.author.login} ({t("author")})
          </a>
        </div>
        <div
          className="mt-4 space-y-4 prose max-w-none"
          dangerouslySetInnerHTML={{ __html: releaseBody }}
        />
        {releaseData.assets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold">{t("assets")}</h3>
            <ul className="list-disc pl-5 mt-2">
              {releaseData.assets.map((asset) => (
                <li key={asset.id}>
                  <a
                    href={asset.browser_download_url}
                    className="text-blue-600 hover:text-blue-800"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {asset.name} ({(asset.size / 1024).toFixed(2)} KB)
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="mt-4">
          <a
            href={`https://github.com/nomandhoni-cs/blink-eye/compare/v1.6.0...${releaseData.tag_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            {t("fullChangelog")}
          </a>
        </div>
        <div className="mt-4 space-y-2">
          <p className="font-medium">{t("downloadOptions")}:</p>
          <div className="space-x-4">
            <a
              href={releaseData.tarball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {t("downloadTarball")}
            </a>
            <a
              href={releaseData.zipball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              {t("downloadZipball")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseInfoPage;
