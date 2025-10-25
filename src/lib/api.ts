/**
 * Safe API fetch utility for Vite apps
 * Handles JSON parsing errors gracefully and provides consistent error handling
 */

export interface ApiResponse<T = any> {
  data: T | null;
  error: string | null;
  ok: boolean;
}

/**
 * Safe fetch wrapper that prevents JSON parsing errors
 * Returns a consistent response format with proper error handling
 */
export async function safeFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, options);

    // Check if response is OK
    if (!response.ok) {
      console.debug(`[API] ${url} returned ${response.status}`);
      return {
        data: null,
        error: `Request failed with status ${response.status}`,
        ok: false,
      };
    }

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.debug(`[API] ${url} returned non-JSON response: ${contentType}`);
      return {
        data: null,
        error: 'API endpoint not available (returned non-JSON response)',
        ok: false,
      };
    }

    // Safe JSON parsing
    const text = await response.text();
    if (!text || text.trim() === '') {
      console.debug(`[API] ${url} returned empty response`);
      return {
        data: null,
        error: 'Empty response from server',
        ok: false,
      };
    }

    const data = JSON.parse(text);
    return {
      data,
      error: null,
      ok: true,
    };
  } catch (error) {
    console.debug(`[API] ${url} error:`, error);
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error',
      ok: false,
    };
  }
}

/**
 * GET request helper
 */
export async function apiGet<T = any>(url: string): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * POST request helper
 */
export async function apiPost<T = any>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T = any>(
  url: string,
  data: any
): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T = any>(url: string): Promise<ApiResponse<T>> {
  return safeFetch<T>(url, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

/**
 * Check if API is available
 * Returns false if API endpoints are not working (common in Vite apps)
 */
export async function isApiAvailable(): Promise<boolean> {
  const { ok } = await safeFetch('/api/health', {
    method: 'GET',
  });
  return ok;
}
