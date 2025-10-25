// Environment configuration helper
export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'file:./local.db',
  DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN || '',
  
  // Supabase
  SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  
  // API
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
  
  // Feature Flags
  ENABLE_AI_FEATURES: process.env.NEXT_PUBLIC_ENABLE_AI_FEATURES === 'true',
  ENABLE_PAYMENTS: process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true',
  ENABLE_CALENDAR_SYNC: process.env.NEXT_PUBLIC_ENABLE_CALENDAR_SYNC === 'true',
  
  // External Services
  STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  
  // Sentry
  SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  
  // Helpers
  isDevelopment: () => ENV.NODE_ENV === 'development',
  isStaging: () => ENV.NODE_ENV === 'staging',
  isProduction: () => ENV.NODE_ENV === 'production',
  isTest: () => ENV.NODE_ENV === 'test',
};

// Validate required environment variables
export function validateEnv() {
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0 && ENV.isProduction()) {
    console.warn(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return true;
}