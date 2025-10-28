import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { I18nProvider } from '@/components/providers/I18nProvider';
import HoverReceiver from '@/visual-edits/VisualEditsMessenger';
import { SafeBoundary } from '@/components/SafeBoundary';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LumenR - Professional Business Management',
  description: 'Comprehensive business management platform for modern teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <SafeBoundary>
          <I18nProvider>
            <ReactQueryProvider>
              <AuthProvider>
                <TooltipProvider>
                  <ThemeProvider>
                    {children}
                    <Toaster />
                    <Sonner />
                    <HoverReceiver />
                  </ThemeProvider>
                </TooltipProvider>
              </AuthProvider>
            </ReactQueryProvider>
          </I18nProvider>
        </SafeBoundary>
      </body>
    </html>
  );
}