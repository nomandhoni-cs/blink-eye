# Static Site Deployment Guide

Your Next.js application is now configured for static export. The build process generates static HTML, CSS, and JavaScript files in the `out/` directory.

## Building for Production

```bash
bun run build
```

This creates the `out/` directory with all static files ready for deployment.

## Deployment Options

### 1. Vercel (Recommended for Next.js)

**Option A: Automatic Deployment**
1. Push your code to GitHub/GitLab/Bitbucket
2. Import your repository in Vercel
3. Vercel will automatically detect Next.js and deploy

**Option B: Vercel CLI**
```bash
npm i -g vercel
vercel --prod
```

### 2. Netlify

**Option A: Drag and Drop**
1. Run `bun run build`
2. Go to https://app.netlify.com/drop
3. Drag the `out/` folder to deploy

**Option B: Netlify CLI**
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=out
```

**Option C: Git Integration**
1. Connect your repository to Netlify
2. Set build command: `bun run build`
3. Set publish directory: `out`

### 3. GitHub Pages

**Using GitHub Actions:**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Build
        run: bun run build
        
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./out
```

### 4. Cloudflare Pages

**Option A: Dashboard**
1. Go to Cloudflare Pages dashboard
2. Connect your Git repository
3. Set build command: `bun run build`
4. Set build output directory: `out`

**Option B: Wrangler CLI**
```bash
npx wrangler pages deploy out
```

### 5. AWS S3 + CloudFront

```bash
# Install AWS CLI
# Configure AWS credentials

# Create S3 bucket
aws s3 mb s3://your-bucket-name

# Upload files
aws s3 sync out/ s3://your-bucket-name --delete

# Enable static website hosting
aws s3 website s3://your-bucket-name --index-document en.html --error-document 404.html

# Optional: Set up CloudFront for CDN
```

### 6. Azure Static Web Apps

**Using Azure CLI:**
```bash
# Install Azure CLI and login
az login

# Create static web app
az staticwebapp create \
  --name your-app-name \
  --resource-group your-resource-group \
  --source out \
  --location "East US 2"
```

### 7. Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init hosting

# Configure firebase.json:
# {
#   "hosting": {
#     "public": "out",
#     "ignore": ["firebase.json", "**/.*", "**/node_modules/**"]
#   }
# }

# Deploy
firebase deploy --only hosting
```

### 8. Custom Server (nginx)

**nginx configuration:**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/out;
    
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
    
    # Handle locale routes
    location ~ ^/([a-z]{2}|[a-z]{2}-[A-Z]{2})/ {
        try_files $uri $uri.html $uri/ =404;
    }
    
    error_page 404 /404.html;
    location = /404.html {
        internal;
    }
    
    # Cache static assets
    location /_next/static {
        add_header Cache-Control "public, max-age=31536000, immutable";
    }
}
```

**Deploy steps:**
```bash
# Build locally
bun run build

# Copy to server
scp -r out/* user@server:/var/www/out/

# Or use rsync
rsync -avz --delete out/ user@server:/var/www/out/
```

### 9. Docker + nginx

**Dockerfile:**

```dockerfile
FROM nginx:alpine

# Copy static files
COPY out /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Build and run:**
```bash
docker build -t your-app .
docker run -p 80:80 your-app
```

## Environment Variables

For client-side environment variables, prefix them with `NEXT_PUBLIC_`:

```env
NEXT_PUBLIC_API_URL=https://api.example.com
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

Set these in your deployment platform's environment variable settings.

## Testing Locally

After building, test the static site locally:

```bash
# Using npx serve
npx serve out

# Using Python
python -m http.server 8000 --directory out

# Using PHP
php -S localhost:8000 -t out
```

## Important Notes

1. **API Routes**: Remember that API routes won't work with static export. Deploy them separately as serverless functions.

2. **Redirects**: Configure redirects in your hosting platform, not in Next.js config.

3. **Headers**: Set custom headers in your hosting platform configuration.

4. **Trailing Slashes**: If you need trailing slashes, add to `next.config.mjs`:
   ```js
   trailingSlash: true
   ```

5. **Base Path**: If deploying to a subdirectory, add to `next.config.mjs`:
   ```js
   basePath: '/subdirectory'
   ```

## Troubleshooting

**404 errors on refresh:**
- Configure your hosting to serve the appropriate HTML file for each route
- Most platforms have SPA/static site settings to handle this

**Images not loading:**
- Ensure images are in the `public/` directory
- Check that image paths are correct (relative to public)

**Locale routes not working:**
- Verify your hosting platform supports directory-based routing
- Check nginx/server configuration for locale path handling
