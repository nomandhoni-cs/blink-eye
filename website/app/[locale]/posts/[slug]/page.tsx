import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/api";
import markdownToHtml from "@/lib/markdownToHtml";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import { PostBody } from "@/app/_components/post-body";
import { PostHeader } from "@/app/_components/post-header";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SEO } from "@/configs/seo";
import { routing } from "@/i18n/routing";
import readingTime from "reading-time";
import { extractToc } from "@/lib/toc";
import { TableOfContents } from "@/app/_components/table-of-contents";

export default async function Post(props: Params) {
  const params = await props.params;
  const { locale, slug } = params;
  setRequestLocale(locale);
  const post = getPostBySlug(slug);

  if (!post) {
    return notFound();
  }

  const content = await markdownToHtml(post.content || "");
  const stats = readingTime(post.content || "");
  const toc = extractToc(post.content || "");

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.ogImage.url,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      image: post.author.picture,
    },
  };

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        <Header />
        
        {/* Layout with sticky sidebar on desktop */}
        <div className="flex flex-col xl:flex-row xl:justify-center gap-16 pt-8 pb-24">
          <article className="w-full max-w-3xl min-w-0">
            <PostHeader
              title={post.title}
              coverImage={post.coverImage}
              date={post.date}
              author={post.author}
              readingTime={stats.text}
            />
            
            {/* Mobile TOC: shown before the body */}
            <div className="xl:hidden">
              <TableOfContents entries={toc} mobile={true} />
            </div>

            <PostBody content={content} />
          </article>

          {/* Desktop TOC: sticky sidebar */}
          <aside className="hidden xl:block w-64 shrink-0">
            <TableOfContents entries={toc} />
          </aside>
        </div>
      </Container>
    </main>
  );
}

type Params = {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
};

export async function generateMetadata(props: Params): Promise<Metadata> {
  const params = await props.params;
  const post = getPostBySlug(params.slug);

  if (!post) {
    return notFound();
  }

  const t = await getTranslations({
    locale: params.locale,
    namespace: "Metadata",
  });
  const title = `${post.title} | ${t("appName")}`;

  return {
    title,
    description: post.excerpt,
    keywords: post.keywords,
    openGraph: {
      title,
      images: [post.ogImage.url],
      siteName: t("appName"),
      url: SEO.url,
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPosts();

  return posts.flatMap((post) =>
    routing.locales.map((locale) => ({
      locale,
      slug: post.slug,
    }))
  );
}

export const dynamic = "force-static";
export const dynamicParams = false;
