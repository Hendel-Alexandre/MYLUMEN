import { useState } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { 
  Home, CheckSquare, Calendar, BarChart3, Settings,
  Plus, X
} from 'lucide-react'
import { useRouter, usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'

interface NavItem {
  id: string
  label: string
  icon: any
  path: string
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks' },
  { id: 'calendar', label: 'Calendar', icon: Calendar, path: '/calendar' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/analytics' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' }
]

const QUICK_ACTIONS = [
  { id: 'task', label: 'New Task', icon: CheckSquare, color: 'from-blue-500 to-blue-600' },
  { id: 'project', label: 'New Project', icon: Calendar, color: 'from-purple-500 to-purple-600' },
  { id: 'note', label: 'Quick Note', icon: Plus, color: 'from-green-500 to-green-600' }
]

export function MobileBottomNav() {
  const router = useRouter()
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)
  const y = useMotionValue(0)
  const opacity = useTransform(y, [-100, 0], [0, 1])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleQuickAction = (actionId: string) => {
    console.log('Quick action:', actionId)
    setShowQuickActions(false)
    // In production, this would open the appropriate modal/form
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // Pull up to show quick actions
    if (info.offset.y < -50) {
      setShowQuickActions(true)
    }
    // Swipe left/right for navigation
    else if (Math.abs(info.offset.x) > 100) {
      const currentIndex = NAV_ITEMS.findIndex(item => item.path === pathname)
      if (info.offset.x > 0 && currentIndex > 0) {
        // Swipe right - go to previous
        router.push(NAV_ITEMS[currentIndex - 1].path)
      } else if (info.offset.x < 0 && currentIndex < NAV_ITEMS.length - 1) {
        // Swipe left - go to next
        router.push(NAV_ITEMS[currentIndex + 1].path)
      }
    }
  }

  return (
    <>
      {/* Quick Actions Overlay */}
      {showQuickActions && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowQuickActions(false)}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-20 left-0 right-0 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-background/95 backdrop-blur-xl rounded-3xl shadow-2xl border p-6 space-y-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Quick Actions</h3>
                <Button
                  onClick={() => setShowQuickActions(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {QUICK_ACTIONS.map((action, index) => {
                const Icon = action.icon
                return (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleQuickAction(action.id)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-muted hover:bg-muted/80 transition-colors"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-medium">{action.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Bottom Navigation Bar */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ y, opacity }}
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      >
        {/* Drag Indicator */}
        <div className="flex justify-center py-2 bg-background/95 backdrop-blur-xl border-t">
          <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Navigation Items */}
        <div className="bg-background/95 backdrop-blur-xl border-t safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-2 relative">
            {NAV_ITEMS.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.path || 
                             (pathname.startsWith(item.path) && item.path !== '/')
              
              // Add space for FAB in the middle
              if (index === 2) {
                return (
                  <div key="spacer" className="w-14" />
                )
              }

              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors min-w-[60px] ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  whileTap={{ scale: 0.9 }}
                >
                  <Icon className={`h-5 w-5 ${isActive ? 'fill-primary' : ''}`} />
                  <span className="text-xs font-medium">{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </motion.button>
              )
            })}

            {/* Floating Action Button (Center) */}
            <motion.button
              onClick={() => setShowQuickActions(!showQuickActions)}
              className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full shadow-lg flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{
                rotate: showQuickActions ? 45 : 0
              }}
            >
              <Plus className="h-6 w-6" />
              {!showQuickActions && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary"
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Swipe Indicator (First Time User) */}
      <style>{`
        .safe-area-inset-bottom {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </>
  )
}
