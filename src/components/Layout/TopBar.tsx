'use client';

import { Moon, Sun, Globe, ChevronDown, LogOut, Circle, Settings } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { useUserRole } from '@/hooks/useUserRole'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { RoleBadge } from '@/components/ui/role-badge'
import { NotificationsCenter } from '@/components/Dashboard/NotificationsCenter'
import { useState, useEffect } from 'react'
import Image from 'next/image'

export function TopBar() {
  const { t, i18n } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const { user, userProfile, signOut, updateUserStatus } = useAuth()
  const { roles } = useUserRole()
  const [businessName, setBusinessName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  
  useEffect(() => {
    // Load business name and avatar from localStorage
    const loadUserProfile = () => {
      // Check for pending business name from signup
      const pendingBusinessName = localStorage.getItem('pending_business_name')
      if (pendingBusinessName) {
        setBusinessName(pendingBusinessName)
        // Clear it after displaying
        localStorage.removeItem('pending_business_name')
      }
      
      // Check for saved business name
      const savedBusinessName = localStorage.getItem('business_name')
      if (savedBusinessName) {
        setBusinessName(savedBusinessName)
      }

      // Load avatar URL
      const savedAvatarUrl = localStorage.getItem('user_avatar_url')
      if (savedAvatarUrl) {
        setAvatarUrl(savedAvatarUrl)
      }
    }
    
    if (user) {
      loadUserProfile()
    }

    // Listen for avatar updates from Settings
    const handleAvatarUpdate = (e: StorageEvent) => {
      if (e.key === 'user_avatar_url' && e.newValue) {
        setAvatarUrl(e.newValue)
      }
    }

    // Listen for custom event for same-window updates
    const handleCustomAvatarUpdate = (e: CustomEvent) => {
      if (e.detail?.avatarUrl) {
        setAvatarUrl(e.detail.avatarUrl)
      }
    }

    window.addEventListener('storage', handleAvatarUpdate as any)
    window.addEventListener('avatarUpdated', handleCustomAvatarUpdate as any)

    return () => {
      window.removeEventListener('storage', handleAvatarUpdate as any)
      window.removeEventListener('avatarUpdated', handleCustomAvatarUpdate as any)
    }
  }, [user])

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('language', lng)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-status-available'
      case 'Away':
        return 'bg-status-away'
      case 'Busy':
        return 'bg-status-busy'
      default:
        return 'bg-muted'
    }
  }

  const handleStatusChange = async (status: 'Available' | 'Away' | 'Busy') => {
    try {
      await updateUserStatus(status)
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const words = name.split(' ')
    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const displayName = businessName || `${userProfile?.first_name || ''} ${userProfile?.last_name || ''}`.trim()

  return (
    <motion.header 
      className="h-14 sm:h-16 border-b border-border/50 glass-effect sticky top-0 z-50"
      initial={{ y: -64 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-full items-center justify-between px-3 sm:px-4 lg:px-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <SidebarTrigger className="h-8 w-8 hover:bg-accent/50 rounded-lg transition-colors" />
          <div className="hidden sm:block h-8 w-px bg-border/50" />
          <div className="hidden xl:flex items-center gap-3">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LumenR
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 lg:gap-3">
          {/* Role Badges */}
          {roles.length > 0 && (
            <div className="hidden md:flex gap-2">
              {roles.map(role => (
                <RoleBadge key={role} role={role} />
              ))}
            </div>
          )}

          {/* Notifications Center */}
          <NotificationsCenter />

          {/* Language Toggle - Hidden on very small screens */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1 sm:gap-2 px-2 sm:px-3 py-2 h-8 sm:h-9 rounded-lg hover:bg-accent/50 hidden sm:flex">
                <Globe className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">{i18n.language.toUpperCase()}</span>
                <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => changeLanguage('en')} className="cursor-pointer">
                English
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeLanguage('fr')} className="cursor-pointer">
                Français
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2 h-8 w-8 sm:h-9 sm:w-9 rounded-lg hover:bg-accent/50"
            >
              <AnimatePresence mode="wait">
                {theme === 'light' ? (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="sun"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="h-3 w-3 sm:h-4 sm:w-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {/* User Profile */}
          {user && userProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 sm:gap-3 h-8 sm:h-10 px-2 sm:px-3 rounded-lg hover:bg-accent/50">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs sm:text-sm font-semibold">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:flex flex-col text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {displayName}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(userProfile.status)}`} />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {user.email}
                      </span>
                    </div>
                    <ChevronDown className="h-2 w-2 sm:h-3 sm:w-3 text-muted-foreground hidden sm:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {avatarUrl ? (
                          <AvatarImage src={avatarUrl} alt={displayName} />
                        ) : null}
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground font-semibold">
                          {getInitials(displayName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t('status')}
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleStatusChange('Available')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-available text-status-available" />
                  <span className="text-sm">{t('available')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Away')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-away text-status-away" />
                  <span className="text-sm">{t('away')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange('Busy')} className="cursor-pointer">
                  <Circle className="mr-3 h-3 w-3 fill-status-busy text-status-busy" />
                  <span className="text-sm">{t('busy')}</span>
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-3 h-4 w-4" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-destructive">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span className="text-sm">{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  )
}