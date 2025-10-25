'use client';

import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Plus, FileText, Users, Receipt, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { LumenAssistant } from '@/components/AI/LumenAssistant'
import { InteractiveBanners } from '@/components/Dashboard/InteractiveBanners'
import { AnalyticsDashboard } from '@/components/Dashboard/AnalyticsDashboard'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 400, damping: 25 }
  }
}

export default function DashboardPage() {
  const { t } = useTranslation()
  const { userProfile } = useAuth()
  const router = useRouter()

  const displayName = userProfile?.first_name || 'User'

  return (
    <div className="min-h-screen">
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                Welcome back, {displayName}!
              </h1>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button 
                onClick={() => router.push('/invoices')} 
                className="button-premium gap-2 h-10"
                size="sm"
              >
                <Plus className="h-4 w-4" />
                New Invoice
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Interactive Analytics Banners - Temporarily disabled due to database setup */}
        {/* <motion.div variants={itemVariants}>
          <InteractiveBanners />
        </motion.div> */}

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <Card className="glass-effect">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/clients')}>
                  <Users className="h-5 w-5" />
                  <span className="text-xs">Clients</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/quotes')}>
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Quotes</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/invoices')}>
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Invoices</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/contracts')}>
                  <FileText className="h-5 w-5" />
                  <span className="text-xs">Contracts</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/receipts')}>
                  <Receipt className="h-5 w-5" />
                  <span className="text-xs">Receipts</span>
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2" onClick={() => router.push('/insights')}>
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-xs">Insights</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Analytics Dashboard with Insights */}
        <motion.div variants={itemVariants}>
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Dashboard</h2>
            <p className="text-muted-foreground mb-6">
              Welcome to your business management dashboard. Use the quick actions above or the sidebar to navigate to different sections.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 bg-purple-50 dark:bg-purple-900/20">
                <h3 className="font-semibold mb-2">Getting Started</h3>
                <p className="text-sm text-muted-foreground">Add your first client or create an invoice to get started</p>
              </Card>
              <Card className="p-4 bg-blue-50 dark:bg-blue-900/20">
                <h3 className="font-semibold mb-2">All Features Ready</h3>
                <p className="text-sm text-muted-foreground">Access Clients, Invoices, Quotes, Receipts and more from the sidebar</p>
              </Card>
              <Card className="p-4 bg-green-50 dark:bg-green-900/20">
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Click the AI assistant icon to get help with anything</p>
              </Card>
            </div>
          </Card>
        </motion.div>
      </motion.div>
      
      {/* Lumen AI Assistant */}
      <LumenAssistant />
    </div>
  )
}