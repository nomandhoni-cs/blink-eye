import Avatar from "./avatar";
import CoverImage from "./cover-image";
import DateFormatter from "./date-formatter";
import { PostTitle } from "@/app/_components/post-title";
import { type Author } from "@/interfaces/author";

type Props = {
  title: string;
  coverImage: string;
  date: string;
  author: Author;
  readingTime: string;
};

export function PostHeader({
  title,
  coverImage,
  date,
  author,
  readingTime,
}: Props) {
  return (
    <>
      <PostTitle>{title}</PostTitle>

      {/* Author, Date & Reading Time */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 pb-8 border-b border-border">
        <Avatar name={author.name} picture={author.picture} />
        <span className="text-muted-foreground/50 hidden sm:inline">·</span>
        <time dateTime={date} className="text-sm text-muted-foreground">
          <DateFormatter dateString={date} />
        </time>
        <span className="text-muted-foreground/50 hidden sm:inline">·</span>
        <span className="text-sm text-muted-foreground">{readingTime}</span>
      </div>

      {/* Cover image — same width as content */}
      <div className="mb-12">
        <CoverImage title={title} src={coverImage} />
      </div>
    </>
  );
}
