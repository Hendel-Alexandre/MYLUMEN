'use client';

import dynamic from 'next/dynamic'
import { SidebarProvider } from '@/components/ui/sidebar'
import { AppSidebar } from './AppSidebar'
import { TopBar } from './TopBar'
import { useNoteNotifications } from '@/hooks/useNoteNotifications'
import { OnboardingProvider } from '@/components/Onboarding/OnboardingProvider'
import { OnboardingRedirect } from '@/components/Dashboard/OnboardingRedirect'

const NoteNotificationPopup = dynamic(() => import('@/components/notifications/NoteNotificationPopup'), {
  ssr: false
})

const LumenAssistant = dynamic(() => import('@/components/AI/LumenAssistant').then(mod => ({ default: mod.LumenAssistant })), {
  ssr: false
})

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { notification, isPopupOpen, closePopup, onNotificationHandled } = useNoteNotifications()

  return (
    <OnboardingProvider>
      <OnboardingRedirect>
        <SidebarProvider>
          <div className="min-h-screen flex w-full bg-gradient-subtle">
            <AppSidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <TopBar />
              <main className="flex-1 overflow-auto bg-gradient-subtle">
                <div className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 max-w-full sm:max-w-7xl">
                  {children}
                </div>
              </main>
            </div>
            <LumenAssistant />
        
          <NoteNotificationPopup
            notification={notification}
            open={isPopupOpen}
            onClose={closePopup}
            onHandled={onNotificationHandled}
          />
        </div>
      </SidebarProvider>
      </OnboardingRedirect>
    </OnboardingProvider>
  )
}