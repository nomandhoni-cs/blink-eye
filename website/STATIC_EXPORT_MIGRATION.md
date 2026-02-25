# Static Export Migration Guide

## Changes Made

Your Next.js application has been configured for static export. Here's what was changed:

### 1. next.config.mjs
- Added `output: 'export'` to enable static site generation
- Changed `images.unoptimized: true` (required for static export since Next.js Image Optimization requires a server)
- Removed `remotePatterns` configuration (not needed with unoptimized images)

### 2. package.json
- Added `"export": "next build"` script for clarity
- Changed `"start"` script to `"npx serve out"` (since `next start` doesn't work with static export)
- Added `"serve"` script as an alias

## What Works with Static Export

✅ All your pages with `generateStaticParams()` will be pre-rendered
✅ Internationalization (i18n) with next-intl
✅ Dynamic routes: `/[locale]/posts/[slug]` and `/[locale]/changelog/release/[tag_name]`
✅ Client-side data fetching
✅ Static assets and images (unoptimized)

## What Doesn't Work (API Routes)

❌ The following API routes require a server and won't work with static export:
- `/api/activatelicense` - License activation
- `/api/validatelicense` - License validation  
- `/api/basicUserData` - User data collection

## Solutions for API Routes

You have several options:

### Option 1: Deploy API Routes Separately
Deploy your API routes as serverless functions on platforms like:
- **Vercel** (recommended for Next.js)
- **Netlify Functions**
- **AWS Lambda**
- **Cloudflare Workers**

Then update your client code to call these external endpoints.

### Option 2: Use a Backend Service
Move the API logic to a separate backend service:
- Express.js server
- Fastify
- Any Node.js backend framework

### Option 3: Hybrid Approach (Recommended)
- Deploy the static site to any CDN/static host
- Deploy API routes separately as serverless functions
- Update environment variables to point to the serverless API endpoints

### Option 4: Client-Side Only
If the API routes are not critical, you could:
- Remove them entirely
- Implement client-side alternatives where possible
- Use third-party services directly from the client

## Building and Deploying

### Build the static site:
```bash
bun run build
```

This will generate static files in the `out/` directory.

### Deploy the static site:
You can deploy the `out/` folder to any static hosting service:
- **Vercel** (with static export)
- **Netlify**
- **GitHub Pages**
- **Cloudflare Pages**
- **AWS S3 + CloudFront**
- **Azure Static Web Apps**
- Any web server (nginx, Apache, etc.)

### Test locally:
```bash
# After building, use one of these:
bun run start      # Now uses serve instead of next start
bun run serve      # Same as above
npx serve out      # Direct command

# Or using Python
python -m http.server 8000 --directory out

# Or using PHP
php -S localhost:8000 -t out
```

**Note:** `next start` doesn't work with `output: 'export'`. The package.json has been updated to use `serve` instead.

## Important Notes

1. **Images**: Images are now unoptimized. For production, consider using a CDN or image optimization service like Cloudinary, Imgix, or Cloudflare Images.

2. **Environment Variables**: Make sure to set up environment variables in your deployment platform for any client-side code that needs them (prefix with `NEXT_PUBLIC_`).

3. **API Routes**: You'll need to handle the API routes separately. The current implementation won't work with static export.

4. **Dynamic Data**: Any data that needs to be fetched at build time should use `generateStaticParams()` (which you already have).

5. **Client-Side Routing**: All routing will work client-side after the initial page load.

## Next Steps

1. Decide how to handle the API routes (see options above)
2. Test the build: `bun run build`
3. Test locally: `npx serve out`
4. Deploy to your chosen static hosting platform
5. Update any client code that calls the API routes to use the new endpoints

## Reverting Changes

If you need to revert to server-side rendering:

1. Remove `output: 'export'` from `next.config.mjs`
2. Change `images.unoptimized: false` or remove it
3. Add back the `remotePatterns` configuration if needed
