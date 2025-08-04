# Digital Garden Setup Instructions

## Prerequisites

1. Node.js 18+ installed
2. A GitHub account
3. A GitHub Personal Access Token

## GitHub Token Setup

1. Go to [GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)](https://github.com/settings/tokens/new)

2. Create a new token with the following scopes:
   - `public_repo` - Access public repositories (minimum required)
   - `repo` - Full control of private repositories (if you want to include private repos)
   - `read:org` - Read org and team membership (if you want to include organization repos)

3. Copy the generated token

4. Update your `.env.local` file:
   ```
   GITHUB_TOKEN=your_token_here
   GITHUB_OWNER=your_github_username
   ```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Test your GitHub connection:
   ```bash
   npx tsx scripts/test-github-client.ts
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env.local` file with:

```env
# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=your_github_username

# Site Configuration
SITE_URL=https://yourdomain.com

# Security
REVALIDATE_SECRET=your-secret-key
```

## Testing

- Test public API access: `npx tsx scripts/test-github-public.ts`
- Test authenticated access: `npx tsx scripts/test-github-client.ts`