# API Routes Migration Guide

Your application has 4 API routes that need to be deployed separately since they require server-side processing:

## Current API Routes

### 1. `/api/activatelicense` (POST)
- **Purpose**: Activate license keys via Lemon Squeezy API
- **Dependencies**: 
  - `LEMON_SQUEEZY_API_KEY`
  - `HANDSHAKE_PASSWORD`
- **External API**: `https://api.lemonsqueezy.com/v1/licenses/activate`

### 2. `/api/validatelicense` (POST)
- **Purpose**: Validate license keys via Lemon Squeezy API
- **Dependencies**: 
  - `LEMON_SQUEEZY_API_KEY`
  - `HANDSHAKE_PASSWORD`
- **External API**: `https://api.lemonsqueezy.com/v1/licenses/validate`

### 3. `/api/basicUserData` (POST)
- **Purpose**: Store user information in Neon database
- **Dependencies**: 
  - `DATABASE_URL` (Neon PostgreSQL)
  - `HANDSHAKE_PASSWORD`
- **Database**: PostgreSQL via `@neondatabase/serverless`

### 4. `/api/hello` (POST)
- **Purpose**: Test endpoint
- **Dependencies**: None (can be removed if not needed)

## Migration Options

### Option 1: Vercel Serverless Functions (Recommended)

**Pros:**
- Zero configuration needed
- Same codebase
- Automatic deployment
- Built-in environment variables

**Steps:**
1. Create a separate Vercel project for API routes
2. Move `app/api/` to a new Next.js project
3. Deploy to Vercel
4. Update client code to use new API URL

**Project Structure:**
```
blink-eye-api/
├── app/
│   └── api/
│       ├── activatelicense/
│       ├── validatelicense/
│       └── basicUserData/
├── next.config.js
└── package.json
```

**next.config.js:**
```js
module.exports = {
  // No output: 'export' here
}
```

**Deploy:**
```bash
vercel --prod
```

**Update client code:**
```typescript
// Before
const response = await fetch('/api/activatelicense', { ... })

// After
const response = await fetch('https://api.yourdomain.com/api/activatelicense', { ... })
```

### Option 2: Netlify Functions

**Steps:**

1. Create `netlify/functions/` directory
2. Convert API routes to Netlify Functions format

**Example: `netlify/functions/activatelicense.ts`**
```typescript
import { Handler } from '@netlify/functions';

const HANDSHAKE_PASSWORD = process.env.HANDSHAKE_PASSWORD;

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { license_key, instance_name, handshake_password } = JSON.parse(event.body || '{}');

    if (!handshake_password || handshake_password !== HANDSHAKE_PASSWORD) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized' }),
      };
    }

    const response = await fetch(
      'https://api.lemonsqueezy.com/v1/licenses/activate',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        },
        body: JSON.stringify({ license_key, instance_name }),
      }
    );

    const data = await response.json();
    return {
      statusCode: response.status,
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to activate license' }),
    };
  }
};
```

**Deploy:**
```bash
netlify deploy --prod
```

**Update client code:**
```typescript
const response = await fetch('/.netlify/functions/activatelicense', { ... })
```

### Option 3: Cloudflare Workers

**Steps:**

1. Create `workers/` directory
2. Convert to Cloudflare Workers format

**Example: `workers/activatelicense.ts`**
```typescript
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }

    try {
      const { license_key, instance_name, handshake_password } = await request.json();

      if (!handshake_password || handshake_password !== env.HANDSHAKE_PASSWORD) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const response = await fetch(
        'https://api.lemonsqueezy.com/v1/licenses/activate',
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
          },
          body: JSON.stringify({ license_key, instance_name }),
        }
      );

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Failed to activate license' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
};
```

**Deploy:**
```bash
npx wrangler deploy
```

### Option 4: AWS Lambda + API Gateway

**Steps:**

1. Create Lambda functions for each endpoint
2. Set up API Gateway
3. Deploy using AWS SAM or Serverless Framework

**Using Serverless Framework:**

**serverless.yml:**
```yaml
service: blink-eye-api

provider:
  name: aws
  runtime: nodejs18.x
  environment:
    LEMON_SQUEEZY_API_KEY: ${env:LEMON_SQUEEZY_API_KEY}
    HANDSHAKE_PASSWORD: ${env:HANDSHAKE_PASSWORD}
    DATABASE_URL: ${env:DATABASE_URL}

functions:
  activateLicense:
    handler: functions/activatelicense.handler
    events:
      - http:
          path: api/activatelicense
          method: post
          cors: true
  
  validateLicense:
    handler: functions/validatelicense.handler
    events:
      - http:
          path: api/validatelicense
          method: post
          cors: true
```

**Deploy:**
```bash
serverless deploy
```

## Recommended Approach

For your use case, I recommend **Option 1 (Vercel Serverless Functions)** because:

1. ✅ Minimal code changes
2. ✅ Same Next.js structure
3. ✅ Easy deployment
4. ✅ Built-in CORS handling
5. ✅ Automatic HTTPS
6. ✅ Environment variables management
7. ✅ Works with Neon database

## Implementation Steps

### Step 1: Create API Project

```bash
# Create new directory
mkdir blink-eye-api
cd blink-eye-api

# Initialize Next.js project
bun create next-app@latest . --typescript --app --no-src-dir

# Copy API routes
cp -r ../website/app/api ./app/

# Install dependencies
bun add @neondatabase/serverless
```

### Step 2: Configure Environment Variables

Create `.env.local`:
```env
LEMON_SQUEEZY_API_KEY=your_key_here
HANDSHAKE_PASSWORD=your_password_here
DATABASE_URL=your_neon_db_url_here
```

### Step 3: Deploy to Vercel

```bash
vercel --prod
```

### Step 4: Update Client Code

Create `lib/api-client.ts` in your main project:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.yourdomain.com';

export async function activateLicense(data: {
  license_key: string;
  instance_name: string;
  handshake_password: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/activatelicense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function validateLicense(data: {
  license_key: string;
  handshake_password: string;
  instance_id?: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/validatelicense`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function submitUserData(data: {
  userID: string;
  userDevice: string;
  userLocale: string;
  installedTime: string;
  appVersion: string;
  handshakePassword: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/basicUserData`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}
```

### Step 5: Set Environment Variable

In your static site deployment, set:
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.vercel.app
```

## Testing

Test each endpoint:

```bash
# Activate License
curl -X POST https://your-api-domain.vercel.app/api/activatelicense \
  -H "Content-Type: application/json" \
  -d '{"license_key":"test","instance_name":"test","handshake_password":"your_password"}'

# Validate License
curl -X POST https://your-api-domain.vercel.app/api/validatelicense \
  -H "Content-Type: application/json" \
  -d '{"license_key":"test","handshake_password":"your_password"}'
```

## CORS Configuration

If you encounter CORS issues, add to your API routes:

```typescript
export async function POST(req: Request) {
  const response = NextResponse.json(data);
  response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'https://yourdomain.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
```

## Cost Considerations

- **Vercel**: 100GB bandwidth + 100 hours compute free/month
- **Netlify**: 100GB bandwidth + 125k function invocations free/month
- **Cloudflare Workers**: 100k requests/day free
- **AWS Lambda**: 1M requests + 400k GB-seconds free/month

All options have generous free tiers suitable for most applications.
