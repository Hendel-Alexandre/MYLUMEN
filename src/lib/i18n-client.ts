'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Only initialize i18n on the client side
if (typeof window !== 'undefined' && !i18n.isInitialized) {
  const resources = {
    en: {
      translation: {
        // Basic translations
        dashboard: "Dashboard",
        login: "Login",
        logout: "Logout",
        signup: "Sign Up",
      }
    }
  };

  i18n
    .use(initReactI18next)
    .init({
      resources,
      lng: "en",
      interpolation: {
        escapeValue: false
      }
    });
}

export default i18n;
