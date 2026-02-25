# Quick Reference - Static Export

## What Changed

### next.config.mjs
```js
output: 'export',           // Enable static export
images: {
  unoptimized: true,        // Required for static export
}
```

## Build & Deploy

```bash
# Build static site
bun run build

# Output directory
out/

# Test locally (choose one)
bun run start      # Uses npx serve
bun run serve      # Same as above
npx serve out      # Direct command
```

**Note:** `next start` doesn't work with static export. Use `serve` instead.

## What Works ✅

- All pages with `generateStaticParams()`
- 38 locales (i18n with next-intl)
- Dynamic routes: `/[locale]/posts/[slug]`, `/[locale]/changelog/release/[tag_name]`
- Client-side routing and navigation
- Static assets and images (unoptimized)
- 1527 static pages generated

## What Doesn't Work ❌

- `/api/activatelicense` - Needs serverless deployment
- `/api/validatelicense` - Needs serverless deployment
- `/api/basicUserData` - Needs serverless deployment
- `/api/hello` - Needs serverless deployment

## API Routes Solution

Deploy API routes separately as serverless functions on:
- Vercel Functions
- Netlify Functions
- AWS Lambda
- Cloudflare Workers

## Deploy To

- **Vercel**: `vercel --prod`
- **Netlify**: `netlify deploy --prod --dir=out`
- **GitHub Pages**: Use GitHub Actions (see DEPLOYMENT_GUIDE.md)
- **Cloudflare Pages**: `npx wrangler pages deploy out`
- **Any static host**: Upload `out/` directory

## Files Generated

- 1527 HTML pages (38 locales × multiple routes)
- Static assets in `out/_next/`
- Locale-specific directories: `out/en/`, `out/zh/`, etc.
- `robots.txt`, `sitemap.xml`, `404.html`

## Next Steps

1. ✅ Build completed successfully
2. Test locally: `npx serve out`
3. Choose deployment platform
4. Handle API routes separately
5. Deploy!

## Revert to SSR

If needed, remove from `next.config.mjs`:
```js
output: 'export',
images: { unoptimized: true }
```
