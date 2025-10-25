'use client';

import { 
  BarChart3, 
  CheckSquare, 
  Clock, 
  FileText, 
  FolderOpen, 
  Home, 
  Settings, 
  Users,
  Activity,
  MessageCircle,
  Calendar,
  UserCircle,
  FileSignature,
  Receipt,
  CreditCard,
  TrendingUp,
  Sparkles,
  CalendarCheck
} from 'lucide-react'
import datatrackLogo from '@/assets/datatrack-logo.png'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { useUserRole } from '@/hooks/useUserRole'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import Image from 'next/image'

// LumenR Unified Navigation
const lumenrNavigation = [
  {
    label: 'overview',
    items: [
      { title: 'dashboard', url: '/dashboard', icon: Home, tourId: 'dashboard' },
    ]
  },
  {
    label: 'AI Assistant',
    items: [
      { title: 'Lumen AI', url: '/lumen', icon: Sparkles },
    ]
  },
  {
    label: 'Financial',
    items: [
      { title: 'Clients', url: '/clients', icon: UserCircle, tourId: 'clients' },
      { title: 'Quotes', url: '/quotes', icon: FileSignature, tourId: 'quotes' },
      { title: 'Invoices', url: '/invoices', icon: FileText, tourId: 'invoices' },
      { title: 'Contracts', url: '/contracts', icon: FileSignature },
      { title: 'Receipts', url: '/receipts', icon: Receipt },
      { title: 'Payments', url: '/payments', icon: CreditCard },
    ]
  },
  {
    label: 'Schedule',
    items: [
      { title: 'Bookings', url: '/bookings', icon: CalendarCheck, tourId: 'bookings' },
      { title: 'Calendar', url: '/calendar', icon: Calendar },
    ]
  },
  {
    label: 'insights',
    items: [
      { title: 'Financial Insights', url: '/insights', icon: TrendingUp },
    ]
  },
  {
    label: 'system',
    items: [
      { title: 'settings', url: '/settings', icon: Settings, tourId: 'settings' },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar()
  const pathname = usePathname()
  const { t } = useTranslation()
  
  const isActive = (path: string) => pathname === path
  const isCollapsed = state === "collapsed"
  
  const getNavClasses = (path: string) =>
    isActive(path)
      ? "bg-primary text-primary-foreground font-semibold shadow-sm" 
      : "sidebar-item text-muted-foreground hover:text-foreground"

  return (
    <Sidebar
      className="border-r border-border/50 glass-effect"
      collapsible="icon"
    >
      <SidebarContent>
        {/* Logo Section */}
        <div className="p-6 border-b border-border/50">
          <Image 
            src={datatrackLogo} 
            alt="LumenR" 
            className={`transition-all duration-300 mx-auto dark:invert ${
              isCollapsed ? 'h-20 w-auto' : 'h-32 w-auto'
            }`}
            width={150}
            height={isCollapsed ? 80 : 128}
          />
        </div>
        
        {/* Navigation Groups */}
        <div className="flex-1 py-4">
          {lumenrNavigation.map((group) => (
            <SidebarGroup key={group.label} className="mb-4">
              {!isCollapsed && (
                <SidebarGroupLabel className="px-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t(group.label)}
                </SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1 px-3">
                  {group.items.map((item: any) => {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild className="h-11 rounded-lg">
                          <Link 
                            href={item.url}
                            data-tour={item.tourId}
                            className={`flex items-center gap-4 px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${getNavClasses(item.url)}`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            {!isCollapsed && (
                              <span className="truncate">
                                {t(item.title)}
                              </span>
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}