'use client';

import { useEffect } from 'react';
import i18n from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // i18n is already initialized in lib/i18n.ts
    // Just verify it's ready
    if (!i18n.isInitialized) {
      console.warn('[i18n] Not initialized yet');
    }
  }, []);

  // Always render children immediately - don't block
  return <>{children}</>;
}