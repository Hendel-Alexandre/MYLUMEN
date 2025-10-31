'use client';

import dynamic from 'next/dynamic'
import { Plus, FileText, Users, Receipt, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { BannersSkeleton } from '@/components/Dashboard/BannersSkeleton'
import { AnalyticsSkeleton } from '@/components/Dashboard/AnalyticsSkeleton'

const InteractiveBanners = dynamic(
  () => import('@/components/Dashboard/InteractiveBanners').then(mod => ({ default: mod.InteractiveBanners })),
  {
    loading: () => <BannersSkeleton />,
    ssr: false
  }
)

const AnalyticsDashboard = dynamic(
  () => import('@/components/Dashboard/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  {
    loading: () => <AnalyticsSkeleton />,
    ssr: false
  }
)

export default function DashboardPage() {
  const { userProfile } = useAuth()
  const router = useRouter()

  const displayName = userProfile?.first_name || 'User'

  return (
    <div className="min-h-screen">
      <div className="space-y-6">
        {/* Header */}
        <div>
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
        </div>

        {/* Interactive Analytics Banners */}
        <div>
          <InteractiveBanners />
        </div>

        {/* Quick Actions */}
        <div>
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
        </div>

        {/* Analytics Dashboard with Insights */}
        <div>
          <AnalyticsDashboard />
        </div>
      </div>
    </div>
  )
}