/**
 * Standardized JSON response utilities for API routes
 * Ensures consistent response format across all endpoints
 */

export function jsonOk(data: any, status = 200) {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export function jsonError(error: string, status = 500) {
  return new Response(JSON.stringify({ success: false, error }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

/**
 * Safe frontend fetch wrapper with JSON validation
 * Prevents "Unexpected end of JSON input" errors
 */
export async function safeFetch(url: string, options?: RequestInit) {
  const res = await fetch(url, options);
  const ct = res.headers.get('content-type') || '';

  if (!ct.includes('application/json')) {
    const body = await res.text();
    throw new Error(`Expected JSON, got ${ct}: ${body.slice(0, 180)}…`);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
  
  // Return data from wrapper if success is true, otherwise return json as-is
  return json?.success ? json.data : json;
}

export function createAuthHeaders(token?: string) {
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return headers;
}