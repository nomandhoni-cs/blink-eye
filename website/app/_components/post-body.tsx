type Props = {
  content: string;
};

export function PostBody({ content }: Props) {
  return (
    <div
      className="prose prose-lg dark:prose-invert max-w-none
        prose-headings:font-heading prose-headings:tracking-tight
        prose-h2:border-b prose-h2:border-border prose-h2:pb-2 prose-h2:mt-10 prose-h2:mb-4
        prose-h3:mt-8 prose-h3:mb-3
        prose-p:leading-7 prose-p:text-foreground/90
        prose-a:text-primary prose-a:underline-offset-4 prose-a:decoration-1 hover:prose-a:decoration-2
        prose-strong:text-foreground prose-strong:font-semibold
        prose-blockquote:border-l-primary prose-blockquote:bg-muted prose-blockquote:rounded-r-lg prose-blockquote:py-1
        prose-code:bg-muted prose-code:border prose-code:border-border prose-code:rounded-md prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:font-normal prose-code:before:content-none prose-code:after:content-none
        prose-pre:rounded-xl prose-pre:border prose-pre:border-border
        prose-img:rounded-xl prose-img:shadow-lg
        prose-hr:border-border
        prose-li:marker:text-primary/70
        prose-th:text-left prose-thead:border-border prose-tr:border-border
        prose-table:text-sm"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
