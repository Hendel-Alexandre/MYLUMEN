import { ReactNode } from 'react'
import { useSubscription } from '@/hooks/useSubscription'
import { Button } from '@/components/ui/button'
import { Lock, Crown } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

interface FeatureLockProps {
  children: ReactNode
  feature?: string
  showUpgradeToast?: boolean
}

export function FeatureLock({ children, feature, showUpgradeToast = true }: FeatureLockProps) {
  const { hasAccess, needsUpgrade, isTrialing, daysRemaining, loading } = useSubscription()
  const router = useRouter()

  if (loading) {
    return <>{children}</>
  }

  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (showUpgradeToast) {
      if (isTrialing) {
        toast.info(`Trial Period`, {
          description: `You have ${daysRemaining} days remaining in your trial. Upgrade to Pro for continued access.`,
          action: {
            label: 'Upgrade',
            onClick: () => router.push('/billing')
          }
        })
      } else {
        toast.error('Subscription Required', {
          description: 'Your trial has expired. Upgrade to continue using this feature.',
          action: {
            label: 'Upgrade Now',
            onClick: () => router.push('/billing')
          }
        })
      }
    }
  }

  if (!hasAccess) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="relative inline-block" onClick={handleUpgradeClick}>
              <div className="opacity-50 pointer-events-none">
                {children}
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Upgrade required - {feature || 'This feature'} is locked</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return <>{children}</>
}

interface LockedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
  feature?: string
}

export function LockedButton({ children, feature, className, variant, size, ...props }: LockedButtonProps) {
  const { hasAccess, needsUpgrade } = useSubscription()
  const router = useRouter()

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess) {
      e.preventDefault()
      e.stopPropagation()
      
      toast.error('Upgrade Required', {
        description: 'Your trial has expired. Upgrade to continue.',
        action: {
          label: 'Upgrade Now',
          onClick: () => router.push('/billing')
        }
      })
      return
    }

    props.onClick?.(e)
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            {...props}
            variant={variant}
            size={size}
            className={`${className} ${!hasAccess ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={props.disabled}
            onClick={handleClick}
          >
            {!hasAccess && <Lock className="h-4 w-4 mr-2" />}
            {children}
          </Button>
        </TooltipTrigger>
        {!hasAccess && (
          <TooltipContent>
            <p>Upgrade required - {feature || 'this feature'} is locked</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export function TrialBanner() {
  const { isTrialing, daysRemaining, hasAccess } = useSubscription()
  const router = useRouter()

  if (!isTrialing || !hasAccess) return null

  return (
    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Crown className="h-5 w-5 text-purple-500" />
        <div>
          <p className="font-medium text-sm">
            Trial Period - {daysRemaining} days remaining
          </p>
          <p className="text-xs text-muted-foreground">
            Upgrade to Pro for unlimited access to all features
          </p>
        </div>
      </div>
      <Button 
        onClick={() => router.push('/billing')}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="sm"
      >
        <Crown className="h-4 w-4 mr-2" />
        Upgrade Now
      </Button>
    </div>
  )
}
