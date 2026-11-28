## Technologies Used in this website

- Radix
- Tailwind 
- Lucide icons
- Dark mode ready
- Storybook
- Biome
- Husky + lint-staged
- [shadcn/ui](https://ui.shadcn.com/) components

### Class Merging

The `cn` util handles conditional classes and class merging.

### Input

```ts
cn("px-2 bg-neutral-100 py-2 bg-neutral-200");
// Outputs `p-2 bg-neutral-200`
```

## Blog posts and release notes

Blog posts live in `_posts/*.md` and use YAML front matter for their metadata. Add a Markdown file there, then run the website build; the post is statically generated at `/en/posts/<filename>` and appears in the blog listings. Blog articles and GitHub release notes are English-only, so they are published once under `/en` rather than duplicated under every translated locale. Localized homepages link to the canonical English content. The sitemap follows the same rule.

Each post automatically gets a product promotion card at the end. Customize it in that post's front matter, or set `promotion: false` to omit it:

```yaml
promotion:
  title: "Take healthier breaks from your screen"
  description: "Blink Eye reminds you to take regular breaks on Windows, macOS, and Linux."
  buttonText: "Download Blink Eye"
  buttonHref: "/en/download"
```

Omit `promotion` to use the default Blink Eye download card. Release metadata and release-specific pages share the build-cached GitHub fetch helpers in `lib/releases.ts`; the static export updates them on the next build.

## License

Licensed under the [MIT license](https://github.com/shadcn/ui/blob/main/LICENSE.md).
