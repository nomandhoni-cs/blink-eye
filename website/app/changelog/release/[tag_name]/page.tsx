import React from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
// Dynamic metadata
export async function generateMetadata(props) {
  const { tag_name } = props.params;
  const releaseInfo = await getData(tag_name);
  return {
    title: `Blink Eye ${releaseInfo.tag_name} Release info`,
    description: `${releaseInfo.body}`,
    
  };
}
// Create a DOMPurify instance for SSR
const createDOMPurify = () => {
  if (typeof window === "undefined") {
    const { window } = new JSDOM("");
    return DOMPurify(window as unknown as Window); // Cast as Window for DOMPurify
  }
  return DOMPurify; // Use client-side DOMPurify
};

// Function to sanitize and render markdown
const renderMarkdown = (markdownText: string) => {
  // Convert Markdown to HTML using `marked`
  const html = marked(markdownText);

  // Create a DOMPurify instance
  const purify = createDOMPurify();

  // Sanitize the HTML to avoid any malicious scripts using DOMPurify
  const sanitizedHTML = purify.sanitize(html);

  // Optionally, use JSDOM to parse and manipulate HTML (if needed)
  const { window } = new JSDOM(sanitizedHTML);
  const document = window.document;

  // Return the sanitized HTML
  return document.body.innerHTML;
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

  console.log(res.status, res.statusText);
  if (!res.ok) {
    throw new Error("Failed to fetch release data");
  }

  const data = await res.json();
  return data;
}

const ReleaseInfoPage = async  (props) => {
  const { tag_name } = props.params;
  const releaseData = await getData(tag_name);

  // Render the sanitized and markdown-converted body
  const releaseBody = renderMarkdown(releaseData.body);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-center mb-6">
        {tag_name} Release Information
      </h1>
      <Button asChild variant={"secondary"}>
        <Link href={`/changelog`} className="flex items-center space-x-2">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Go Back</span>
        </Link>
      </Button>
      {/* Release Info Container */}
      <div className="shadow-2xl rounded-lg p-6 space-y-4">
        {/* Release Name */}
        <h2 className="text-2xl font-semibold ">{releaseData.name}</h2>

        {/* Release Tag */}
        <p className=" text-sm">Tag: {releaseData.tag_name}</p>

        {/* Published Date */}
        <p className=" text-sm">
          Published: {new Date(releaseData.published_at).toLocaleDateString()}
        </p>

        {/* Author Information */}
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
            {releaseData.author.login} (Author)
          </a>
        </div>

        {/* Body / Description */}
        <div
          className="mt-4 space-y-4"
          dangerouslySetInnerHTML={{ __html: releaseBody }}
        />

        {/* Assets */}
        {releaseData.assets.length > 0 && (
          <div className="mt-6">
            <h3 className="text-xl font-semibold ">Assets</h3>
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

        {/* Link to Full Changelog */}
        <div className="mt-4">
          <a
            href={`https://github.com/nomandhoni-cs/blink-eye/compare/v1.6.0...${releaseData.tag_name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800"
          >
            Full Changelog
          </a>
        </div>

        {/* Additional URLs */}
        <div className="mt-4 space-y-2">
          <p className="font-medium">Download options:</p>
          <div className="space-x-4">
            <a
              href={releaseData.tarball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Download Tarball
            </a>
            <a
              href={releaseData.zipball_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              Download Zipball
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReleaseInfoPage;
