'use client';

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, TrendingDown, Clock, CheckCircle2, Target,
  Calendar, Users, Zap, AlertCircle, Award, ArrowRight,
  BarChart3, PieChart, Activity, Brain, Sparkles, DollarSign,
  FileText, Receipt, TrendingDown as TrendingDownIcon, Briefcase
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  LineChart, Line, BarChart, Bar, PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts'

interface BusinessMetrics {
  monthlyRevenue: number
  activeClients: number
  invoicesPaid: number
  activeProjects: number
}

const WEEKLY_DATA = [
  { day: 'Mon', revenue: 2400, invoices: 5, clients: 3 },
  { day: 'Tue', revenue: 1800, invoices: 3, clients: 2 },
  { day: 'Wed', revenue: 3200, invoices: 7, clients: 4 },
  { day: 'Thu', revenue: 2100, invoices: 4, clients: 2 },
  { day: 'Fri', revenue: 2800, invoices: 6, clients: 5 },
  { day: 'Sat', revenue: 1200, invoices: 2, clients: 1 },
  { day: 'Sun', revenue: 800, invoices: 1, clients: 1 }
]

const CLIENT_SEGMENTS = [
  { name: 'Enterprise', revenue: 45000, clients: 3, color: 'from-blue-500 to-blue-600' },
  { name: 'Small Business', revenue: 28000, clients: 12, color: 'from-purple-500 to-purple-600' },
  { name: 'Freelancers', revenue: 15000, clients: 8, color: 'from-green-500 to-green-600' },
  { name: 'Agencies', revenue: 32000, clients: 5, color: 'from-orange-500 to-orange-600' }
]

const INSIGHTS = [
  {
    type: 'positive',
    icon: TrendingUp,
    title: 'Revenue Growth',
    description: 'Monthly revenue increased by 28% compared to last month',
    action: 'View breakdown'
  },
  {
    type: 'warning',
    icon: AlertCircle,
    title: 'Overdue Invoices',
    description: '3 invoices totaling $4,200 are past due. Send payment reminders.',
    action: 'Review invoices'
  },
  {
    type: 'info',
    icon: Users,
    title: 'Client Retention',
    description: '5 clients ready for contract renewal this month. Reach out proactively.',
    action: 'View clients'
  },
  {
    type: 'success',
    icon: Award,
    title: 'Milestone Reached',
    description: 'You\'ve processed $100K in revenue this quarter! 🎉',
    action: 'Celebrate'
  }
]

const REVENUE_BREAKDOWN = [
  { category: 'Consulting', amount: 35000, color: '#3b82f6' },
  { category: 'Design Services', amount: 28000, color: '#8b5cf6' },
  { category: 'Development', amount: 42000, color: '#10b981' },
  { category: 'Support & Maintenance', amount: 15000, color: '#f59e0b' }
]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [metrics] = useState<BusinessMetrics>({
    monthlyRevenue: 21500,
    activeClients: 28,
    invoicesPaid: 87,
    activeProjects: 12
  })

  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'positive':
        return 'border-green-500/20 bg-green-500/5'
      case 'warning':
        return 'border-orange-500/20 bg-orange-500/5'
      case 'success':
        return 'border-blue-500/20 bg-blue-500/5'
      default:
        return 'border-muted bg-muted/5'
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Analytics & Insights</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Track your business performance and optimize operations</p>
        </div>
        
        <Tabs value={timeRange} onValueChange={(v) => setTimeRange(v as any)} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 w-full sm:w-auto">
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
            <TabsTrigger value="year">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
              <div className="flex items-center gap-1 text-xs text-green-500">
                {getTrendIcon(28)}
                <span>+28%</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">${(metrics.monthlyRevenue / 1000).toFixed(1)}K</div>
            <div className="text-xs text-muted-foreground">Monthly Revenue</div>
            <div className="text-xs text-muted-foreground mt-2">
              Target: $25K
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
              <div className="flex items-center gap-1 text-xs text-green-500">
                {getTrendIcon(15)}
                <span>+15%</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{metrics.activeClients}</div>
            <div className="text-xs text-muted-foreground">Active Clients</div>
            <div className="text-xs text-muted-foreground mt-2">
              3 new this month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
              <div className="flex items-center gap-1 text-xs text-green-500">
                {getTrendIcon(12)}
                <span>+12%</span>
              </div>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{metrics.invoicesPaid}%</div>
            <div className="text-xs text-muted-foreground">Invoices Paid</div>
            <Progress value={metrics.invoicesPaid} className="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Briefcase className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{metrics.activeProjects}</div>
            <div className="text-xs text-muted-foreground">Active Projects</div>
            <div className="text-xs text-muted-foreground mt-2">
              8 in progress
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card className="border-2 border-primary/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl" />
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            AI-Powered Insights
            <Badge variant="secondary" className="ml-2 text-xs">
              <Sparkles className="h-3 w-3 mr-1" />
              New
            </Badge>
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Personalized recommendations based on your business patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {INSIGHTS.map((insight, index) => {
              const Icon = insight.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 sm:p-4 rounded-xl border-2 ${getInsightStyle(insight.type)}`}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs sm:text-sm mb-1">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2 sm:mb-3">
                        {insight.description}
                      </p>
                      <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                        {insight.action}
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Weekly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={WEEKLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[8, 8, 0, 0]} />
                <Bar dataKey="invoices" fill="#3b82f6" name="Invoices Sent" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Client Acquisition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={WEEKLY_DATA}>
                <defs>
                  <linearGradient id="colorClients" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" fontSize={11} />
                <YAxis fontSize={11} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="clients" 
                  stroke="#8b5cf6" 
                  fillOpacity={1} 
                  fill="url(#colorClients)"
                  name="New Clients"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
              Revenue by Service
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {REVENUE_BREAKDOWN.map((item, index) => {
                const total = REVENUE_BREAKDOWN.reduce((acc, curr) => acc + curr.amount, 0)
                const percentage = (item.amount / total) * 100
                
                return (
                  <div key={item.category}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-xs sm:text-sm font-medium">{item.category}</span>
                      </div>
                      <span className="text-xs sm:text-sm font-bold">${(item.amount / 1000).toFixed(1)}K</span>
                    </div>
                    <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Segments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Target className="h-4 w-4 sm:h-5 sm:w-5" />
            Client Segments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {CLIENT_SEGMENTS.map((segment, index) => (
              <motion.div
                key={segment.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 sm:p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-start justify-between mb-2 sm:mb-3">
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base">{segment.name}</h4>
                    <p className="text-xs text-muted-foreground">{segment.clients} clients</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg bg-gradient-to-r ${segment.color} text-white text-xs font-bold`}>
                    ${(segment.revenue / 1000).toFixed(0)}K
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  Avg: ${(segment.revenue / segment.clients / 1000).toFixed(1)}K per client
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}