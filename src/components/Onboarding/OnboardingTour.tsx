import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

interface OnboardingStep {
  id: string
  title: string
  description: string
  target: string // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right'
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to LumenR! 🎉',
    description: 'Your all-in-one business management platform. Let\'s take a quick tour of the key features.',
    target: '',
    position: 'bottom'
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your business overview: revenue, pending invoices, clients, and expenses at a glance.',
    target: 'a[href="/dashboard"]',
    position: 'right'
  },
  {
    id: 'clients',
    title: 'Clients',
    description: 'Manage your client list and track their information.',
    target: 'a[href="/clients"]',
    position: 'right'
  },
  {
    id: 'bookings',
    title: 'Bookings',
    description: 'Schedule and manage appointments with your clients.',
    target: 'a[href="/bookings"]',
    position: 'right'
  },
  {
    id: 'quotes',
    title: 'Quotes',
    description: 'Create and send professional quotes to clients.',
    target: 'a[href="/quotes"]',
    position: 'right'
  },
  {
    id: 'invoices',
    title: 'Invoices',
    description: 'Generate invoices and track payments.',
    target: 'a[href="/invoices"]',
    position: 'right'
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Customize your business profile and preferences.',
    target: 'a[href="/settings"]',
    position: 'left'
  }
]

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('lumenr-onboarding-completed')
    if (hasSeenOnboarding) {
      setIsVisible(false)
      return
    }
  }, [])

  useEffect(() => {
    const step = onboardingSteps[currentStep]
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement
      setTargetElement(element)
      
      if (element) {
        const rect = element.getBoundingClientRect()
        setTargetRect(rect)
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    } else {
      setTargetElement(null)
      setTargetRect(null)
    }
  }, [currentStep])

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleComplete = () => {
    localStorage.setItem('lumenr-onboarding-completed', 'true')
    setIsVisible(false)
    setTargetElement(null)
    setTargetRect(null)
    onComplete()
  }

  const handleSkip = () => {
    localStorage.setItem('lumenr-onboarding-completed', 'true')
    setIsVisible(false)
    setTargetElement(null)
    setTargetRect(null)
    onSkip()
  }

  if (!isVisible) return null

  const step = onboardingSteps[currentStep]
  
  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }
    }

    const gap = 20
    let position: React.CSSProperties = { position: 'fixed' as const }

    switch (step.position) {
      case 'right':
        position = {
          ...position,
          top: `${targetRect.top + targetRect.height / 2}px`,
          left: `${targetRect.right + gap}px`,
          transform: 'translateY(-50%)'
        }
        break
      case 'left':
        position = {
          ...position,
          top: `${targetRect.top + targetRect.height / 2}px`,
          right: `${window.innerWidth - targetRect.left + gap}px`,
          transform: 'translateY(-50%)'
        }
        break
      case 'top':
        position = {
          ...position,
          bottom: `${window.innerHeight - targetRect.top + gap}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)'
        }
        break
      case 'bottom':
      default:
        position = {
          ...position,
          top: `${targetRect.bottom + gap}px`,
          left: `${targetRect.left + targetRect.width / 2}px`,
          transform: 'translateX(-50%)'
        }
        break
    }

    return position
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Highlight ring around target element */}
          {targetElement && targetRect && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed z-[9998] pointer-events-none"
              style={{
                top: `${targetRect.top - 4}px`,
                left: `${targetRect.left - 4}px`,
                width: `${targetRect.width + 8}px`,
                height: `${targetRect.height + 8}px`,
                border: '3px solid hsl(var(--primary))',
                borderRadius: '8px',
                boxShadow: '0 0 0 4px hsl(var(--primary) / 0.2), 0 0 20px hsl(var(--primary) / 0.4)',
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            key={currentStep}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            style={getTooltipPosition()}
            className="fixed z-[9999] w-full max-w-sm px-4"
          >
            <Card className="border-2 shadow-2xl">
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground mb-2">
                      Step {currentStep + 1} of {onboardingSteps.length}
                    </div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="ml-2 -mr-2 -mt-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-6">
                  {step.description}
                </p>

                {/* Progress dots */}
                <div className="flex justify-center gap-1.5 mb-6">
                  {onboardingSteps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all ${
                        index === currentStep
                          ? 'bg-primary w-8'
                          : index < currentStep
                          ? 'bg-primary/60 w-1.5'
                          : 'bg-muted w-1.5'
                      }`}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    onClick={handleSkip}
                    size="sm"
                  >
                    Skip Tour
                  </Button>

                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="gap-2"
                  >
                    {currentStep === onboardingSteps.length - 1 ? (
                      'Get Started'
                    ) : (
                      <>
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}