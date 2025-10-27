import { NextRequest } from 'next/server';
import { getAuthUser } from '@/lib/auth-api';

export async function authenticateRequest(request: NextRequest): Promise<string | null> {
  const { userId, error } = await getAuthUser(request);
  
  if (error || !userId) {
    return null;
  }
  
  return userId;
}
