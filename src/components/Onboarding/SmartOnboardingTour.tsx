import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, ArrowLeft, X, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string
  position: 'top' | 'bottom' | 'left' | 'right'
  icon: React.ReactNode
  action?: string
}

interface SmartOnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LumenR!',
    description: 'Let\'s take a quick tour to get you started with managing your business, clients, and finances effectively.',
    target: '',
    position: 'bottom',
    icon: <Sparkles className="h-5 w-5" />
  },
  {
    id: 'dashboard',
    title: 'Your Dashboard Overview',
    description: 'View key metrics like revenue, pending invoices, client count, and recent activities at a glance.',
    target: 'a[href="/dashboard"]',
    position: 'bottom',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    id: 'clients',
    title: 'Manage Your Clients',
    description: 'Keep track of all your clients and their information in one centralized location.',
    target: 'a[href="/clients"]',
    position: 'right',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    id: 'invoices',
    title: 'Create Invoices',
    description: 'Generate professional invoices and track payments from your clients.',
    target: 'a[href="/invoices"]',
    position: 'right',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    id: 'bookings',
    title: 'Schedule Bookings',
    description: 'Manage appointments and bookings with your clients.',
    target: 'a[href="/bookings"]',
    position: 'right',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    id: 'quotes',
    title: 'Create Quotes',
    description: 'Generate professional quotes for your clients before invoicing.',
    target: 'a[href="/quotes"]',
    position: 'right',
    icon: <CheckCircle className="h-5 w-5" />
  },
  {
    id: 'settings',
    title: 'Customize Settings',
    description: 'Configure your business profile, preferences, and account settings.',
    target: 'a[href="/settings"]',
    position: 'left',
    icon: <CheckCircle className="h-5 w-5" />
  }
]

export function SmartOnboardingTour({ onComplete, onSkip }: SmartOnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [targetPosition, setTargetPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('lumenr-onboarding-completed')
    if (hasCompletedOnboarding) {
      return
    }

    const timer = setTimeout(() => {
      setIsVisible(true)
      updateTargetPosition()
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isVisible) {
      updateTargetPosition()
    }
  }, [currentStep, isVisible])

  const updateTargetPosition = () => {
    const step = onboardingSteps[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height
        })
      }
    }
  }

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    localStorage.setItem('lumenr-onboarding-completed', 'true')
    setIsVisible(false)
    setTimeout(() => onComplete(), 300)
  }

  const handleSkip = () => {
    localStorage.setItem('lumenr-onboarding-completed', 'true')
    setIsVisible(false)
    setTimeout(() => onSkip(), 300)
  }

  if (!isVisible) return null

  const currentStepData = onboardingSteps[currentStep]
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          {/* Dark overlay without blur */}
          <motion.div 
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
          
          {/* Highlight spotlight for target element */}
          {currentStepData.target && targetPosition.width > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute border-4 border-primary rounded-lg shadow-2xl"
              style={{
                top: targetPosition.top - 8,
                left: targetPosition.left - 8,
                width: targetPosition.width + 16,
                height: targetPosition.height + 16,
                boxShadow: `0 0 0 9999px rgba(0, 0, 0, 0.7), 0 0 40px hsl(var(--primary)), inset 0 0 20px hsl(var(--primary) / 0.3)`,
                pointerEvents: 'none'
              }}
            />
          )}

          {/* Tour Card */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute pointer-events-auto"
            style={{
              top: currentStep === 0 
                ? '50%' 
                : currentStepData.position === 'bottom' 
                  ? targetPosition.top + targetPosition.height + 20
                  : currentStepData.position === 'top'
                    ? targetPosition.top - 280
                    : currentStepData.position === 'left'
                      ? targetPosition.top
                      : targetPosition.top,
              left: currentStep === 0 
                ? '50%' 
                : currentStepData.position === 'left'
                  ? Math.max(20, targetPosition.left - 340)
                  : currentStepData.position === 'right'
                    ? Math.min(window.innerWidth - 340, targetPosition.left + targetPosition.width + 20)
                    : targetPosition.left,
              transform: currentStep === 0 ? 'translate(-50%, -50%)' : 'none',
              maxWidth: '340px',
              width: '100%'
            }}
          >
            <Card className="bg-card border-primary/30 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      {currentStepData.icon}
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <motion.div
                    className="bg-primary h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {currentStepData.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentStepData.description}
                  </p>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                    className="h-9"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSkip}
                      className="h-9 text-muted-foreground"
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleNext}
                      className="h-9 bg-primary hover:bg-primary/90"
                    >
                      {currentStep === onboardingSteps.length - 1 ? 'Finish' : 'Next'}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}