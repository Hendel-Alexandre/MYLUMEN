import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SmartOnboardingTour } from './SmartOnboardingTour'

interface OnboardingContextType {
  showOnboarding: boolean
  startOnboarding: () => void
  completeOnboarding: () => void
  skipOnboarding: () => void
}

interface OnboardingProviderProps {
  children: ReactNode
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export const OnboardingProvider: React.FC<OnboardingProviderProps> = ({ children }) => {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('lumenr-onboarding-completed')
    if (!hasCompletedOnboarding) {
      const timer = setTimeout(() => {
        setShowOnboarding(true)
      }, 500)
      return () => clearTimeout(timer)
    }
    setIsChecking(false)
  }, [])

  const startOnboarding = () => {
    setShowOnboarding(true)
  }

  const completeOnboarding = () => {
    localStorage.setItem('lumenr-onboarding-completed', 'true')
    setShowOnboarding(false)
  }

  const skipOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem('lumenr-onboarding-completed', 'true')
  }

  return (
    <OnboardingContext.Provider value={{
      showOnboarding,
      startOnboarding,
      completeOnboarding,
      skipOnboarding
    }}>
      {children}
      {showOnboarding && (
        <SmartOnboardingTour
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  )
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider')
  }
  return context
}