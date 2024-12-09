import { HeroPost } from "@/app/_components/hero-post";
import { MoreStories } from "@/app/_components/more-stories";
import { getAllPosts } from "@/lib/api";

export default function Blogs() {
  const allPosts = getAllPosts();

  const heroPost = allPosts[0];

  const morePosts = allPosts.slice(1);

  return (
    <section className="px-4 py-16 mx-auto max-w-7xl">
      <h2 className="mt-2 text-balance text-5xl font-heading tracking-wide sm:text-6xl text-center mb-4">
        Blogs
      </h2>
      <HeroPost
        title={heroPost.title}
        coverImage={heroPost.coverImage}
        date={heroPost.date}
        author={heroPost.author}
        slug={heroPost.slug}
        excerpt={heroPost.excerpt}
      />
      {morePosts.length > 0 && <MoreStories posts={morePosts} />}
    </section>
  );
}
