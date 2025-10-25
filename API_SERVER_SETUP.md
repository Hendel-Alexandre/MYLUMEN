# 🚀 API Server Setup - Vite + Hono Backend

## Problem Fixed

Your project is a **Vite + React app**, but you had Next.js-style API routes in `src/app/api/**`. Vite doesn't natively support API routes like Next.js does, which caused the server to return HTML instead of JSON, leading to errors like:

- `"Unexpected end of JSON input"`
- `"Server returned invalid JSON response"`
- `"Unexpected token '<' is not valid JSON"`

## Solution

We've added a **Hono API server** that runs alongside your Vite dev server and properly handles all your API routes.

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│  React Frontend │─────▶│   Vite Proxy     │─────▶│  Hono API Server│
│  localhost:3000 │      │  /api/* → :3001  │      │  localhost:3001 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                                              │
                                                              ▼
                                                    ┌─────────────────┐
                                                    │  API Routes in  │
                                                    │ src/app/api/**  │
                                                    └─────────────────┘
```

## How to Run

### Development Mode

```bash
# Start both servers (Vite + API)
bun run dev
```

This runs:
- **API Server**: `http://localhost:3001` (handles `/api/*` routes)
- **Vite Dev Server**: `http://localhost:3000` (serves React app, proxies API calls)

### Individual Servers

```bash
# Run API server only
bun run dev:api

# Run Vite only
bun run dev:vite
```

## Configuration

### Environment Variables (.env)

```env
# API Server Port
API_PORT=3001

# Database
TURSO_CONNECTION_URL=your_connection_url
TURSO_AUTH_TOKEN=your_auth_token
```

### Vite Proxy (vite.config.ts)

All `/api/*` requests from the frontend are automatically proxied to `http://localhost:3001`:

```ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3001',
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## API Routes

Your existing API routes in `src/app/api/**` work exactly as before:

- ✅ `GET`, `POST`, `PUT`, `DELETE`, `PATCH` methods
- ✅ Dynamic routes like `/api/clients/[id]`
- ✅ Query parameters via `request.nextUrl.searchParams`
- ✅ Request body parsing
- ✅ Authentication via headers

### Example Route

```ts
// src/app/api/lumenr/clients/route.ts
import { NextRequest } from 'next/server';
import { jsonOk, jsonError } from '@/lib/api-utils';
import { getAuthUser } from '@/lib/auth-api';

export async function GET(request: NextRequest) {
  try {
    const { userId, error } = await getAuthUser(request);
    if (error) return jsonError('Unauthorized', 401);
    
    const data = await db.select().from(clients).where(eq(clients.userId, userId));
    return jsonOk(data);
  } catch (error) {
    return jsonError('Internal server error', 500);
  }
}
```

## API Response Format

All API routes use standardized JSON responses:

### Success Response
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Error Response
```json
{
  "error": "Client not found"
}
```

## Frontend API Calls

Use `safeFetch` from `@/lib/api-utils` for all API calls:

```ts
import { safeFetch } from '@/lib/api-utils';

// GET request
const clients = await safeFetch('/api/lumenr/clients', {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});

// POST request
const newClient = await safeFetch('/api/lumenr/clients', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ name: 'John Doe', email: 'john@example.com' }),
});
```

## Testing

### Health Check

```bash
curl http://localhost:3001/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": 1234567890
}
```

### Test API Route

```bash
curl http://localhost:3001/api/lumenr/clients \
  -H "Authorization: Bearer your-token"
```

## Troubleshooting

### API routes return 404
- Ensure the API server is running: `bun run dev:api`
- Check that routes exist in `src/app/api/**`
- Verify the route path matches your request URL

### CORS errors
- The server is configured with CORS for `localhost:3000` and `localhost:5173`
- Check `server.ts` if you need to add more origins

### JSON parsing errors
- Verify `Content-Type: application/json` header is set
- Use `safeFetch` instead of raw `fetch`
- Check server logs for actual error messages

### Port conflicts
- Change `API_PORT` in `.env` if port 3001 is in use
- Update `vite.config.ts` proxy target to match

## Files Modified/Created

### New Files
- ✅ `server.ts` - Hono API server
- ✅ `.env.example` - Environment variable template
- ✅ `API_SERVER_SETUP.md` - This documentation

### Modified Files
- ✅ `package.json` - Updated dev scripts
- ✅ `vite.config.ts` - Added API proxy
- ✅ `.env` - Added API_PORT
- ✅ `src/lib/api-utils.ts` - Enhanced with NextResponse.json

## Next Steps

1. **Restart your dev server**: `bun run dev`
2. **Test your pages**: Visit Clients, Quotes, Invoices, etc.
3. **Create/edit records**: Should save instantly with no JSON errors!

## Summary

✅ **API routes now return valid JSON** (not HTML)  
✅ **Vite proxies `/api/*` to API server** (seamless integration)  
✅ **All existing routes work unchanged** (no code refactoring needed)  
✅ **Fast, reliable saving** (no more JSON parsing errors)  

Your LumenR app is now fully stabilized! 🎉
