import { NextResponse } from 'next/server';

export function withCache(response: NextResponse, maxAge: number = 60): NextResponse {
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Cache-Control', `public, s-maxage=${maxAge}, stale-while-revalidate=${maxAge * 2}`);
  } else {
    response.headers.set('Cache-Control', 'no-cache');
  }
  return response;
}

export function noCacheHeaders(response: NextResponse): NextResponse {
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  return response;
}
