# GitHub Token Setup for Builds

## Why You Need This

During the build process, your site fetches the latest release data from GitHub. Without authentication, GitHub's API has strict rate limits (60 requests per hour), which can cause builds to fail.

## Solution

Add a GitHub token to your environment variables to increase the rate limit to 5,000 requests per hour.

## Steps

### 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Or visit: https://github.com/settings/tokens

2. Click "Generate new token" → "Generate new token (classic)"

3. Give it a name like "Blink Eye Website Build"

4. Select scopes:
   - ✅ `public_repo` (or just `repo` if you want full access)
   
5. Click "Generate token"

6. **Copy the token immediately** (you won't be able to see it again!)

### 2. Add to Local Environment

Add to your `.env.local` file:

```env
GITHUB_TOKEN=ghp_your_token_here
```

### 3. Add to Cloudflare Pages

1. Go to your Cloudflare Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add a new variable:
   - **Variable name**: `GITHUB_TOKEN`
   - **Value**: Your GitHub token
   - **Environment**: Production and Preview
4. Click **Save**

### 4. Add to Other Platforms

#### Vercel
```bash
vercel env add GITHUB_TOKEN
```

Or in the Vercel dashboard:
- Project Settings → Environment Variables → Add

#### Netlify
```bash
netlify env:set GITHUB_TOKEN your_token_here
```

Or in the Netlify dashboard:
- Site Settings → Environment variables → Add variable

#### GitHub Actions
Add to your repository secrets:
- Repository Settings → Secrets and variables → Actions → New repository secret
- Name: `GITHUB_TOKEN`
- Value: Your token

## Fallback Behavior

If the GitHub API fails (rate limit, network issues, etc.), the site will:
- ✅ Still build successfully
- ✅ Show the download section without version info
- ⚠️ Log a warning in the console

This ensures your builds never fail due to GitHub API issues.

## Security Notes

- ✅ Never commit tokens to git
- ✅ Use environment variables only
- ✅ `.env.local` is already in `.gitignore`
- ✅ Tokens are encrypted in deployment platforms
- ⚠️ Use tokens with minimal required permissions

## Testing

After adding the token, test your build:

```bash
bun run build
```

You should see no errors related to GitHub API fetching.

## Troubleshooting

### Build still fails with GitHub API errors

1. Check the token is correctly set in environment variables
2. Verify the token has `public_repo` scope
3. Check the token hasn't expired
4. Try regenerating the token

### Rate limit still hit

- Make sure the token is being used (check build logs)
- Verify the token format starts with `ghp_` or `github_pat_`
- Check you're not hitting the authenticated rate limit (5,000/hour)

## Alternative: Remove GitHub API Dependency

If you don't want to use a GitHub token, you can:

1. Hardcode the latest version in your code
2. Use a different data source
3. Fetch release data client-side instead of at build time

The current implementation already handles failures gracefully, so this is optional.
