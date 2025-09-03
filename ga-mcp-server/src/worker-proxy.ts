/**
 * Lightweight Cloudflare Worker Proxy for GA Analytics API
 * Forwards requests to Node.js backend while leveraging Cloudflare's edge network
 */

export interface Env {
  API_BACKEND_URL: string; // The URL of your Node.js server
  API_KEY?: string; // Optional API key for authentication
  CACHE_TTL?: string; // Cache TTL in seconds
}

// CORS headers for dashboard access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Configure with your domain in production
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    
    // Get backend URL from environment or use default
    const backendUrl = env.API_BACKEND_URL || 'http://localhost:3000';
    const cacheTTL = parseInt(env.CACHE_TTL || '300'); // Default 5 minutes

    // Health check endpoint
    if (url.pathname === '/health') {
      try {
        const backendHealth = await fetch(`${backendUrl}/health`);
        const data = await backendHealth.json();
        return new Response(JSON.stringify({
          ...data,
          proxy: 'cloudflare-worker',
          backend: backendUrl
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      } catch (error) {
        return new Response(JSON.stringify({
          status: 'unhealthy',
          error: 'Backend unreachable',
          proxy: 'cloudflare-worker'
        }), {
          status: 503,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // API endpoints - forward to backend
    if (url.pathname.startsWith('/api/')) {
      // Create cache key for GET requests
      const cacheKey = request.method === 'GET' 
        ? new Request(request.url, request)
        : null;

      // Check cache for GET requests
      if (cacheKey) {
        const cache = caches.default;
        const cachedResponse = await cache.match(cacheKey);
        
        if (cachedResponse) {
          // Return cached response with cache headers
          const response = new Response(cachedResponse.body, cachedResponse);
          response.headers.set('X-Cache-Status', 'HIT');
          response.headers.set('Access-Control-Allow-Origin', '*');
          return response;
        }
      }

      try {
        // Forward request to backend
        const backendUrl = new URL(url.pathname + url.search, env.API_BACKEND_URL || 'http://localhost:3000');
        
        const backendRequest = new Request(backendUrl.toString(), {
          method: request.method,
          headers: {
            'Content-Type': 'application/json',
            ...(env.API_KEY && { 'X-API-Key': env.API_KEY })
          },
          body: request.body
        });

        const backendResponse = await fetch(backendRequest);
        const data = await backendResponse.json();

        // Create response
        const response = new Response(JSON.stringify(data), {
          status: backendResponse.status,
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Cache-Status': 'MISS'
          },
        });

        // Cache successful GET responses
        if (cacheKey && backendResponse.ok && request.method === 'GET') {
          // Clone response for caching
          const responseToCache = new Response(JSON.stringify(data), {
            status: backendResponse.status,
            headers: {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Cache-Control': `public, max-age=${cacheTTL}`,
            },
          });

          // Use waitUntil to cache asynchronously
          ctx.waitUntil(caches.default.put(cacheKey, responseToCache));
        }

        return response;

      } catch (error) {
        console.error('Proxy error:', error);
        return new Response(JSON.stringify({
          error: 'Failed to reach backend',
          message: error instanceof Error ? error.message : String(error)
        }), {
          status: 502,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // Return 404 for unknown endpoints
    return new Response(JSON.stringify({ 
      error: 'Not found',
      message: 'This endpoint does not exist. Available endpoints: /health, /api/*'
    }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  },
};