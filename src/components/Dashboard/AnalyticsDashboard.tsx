'use client';

import { useState, useEffect } from 'react'
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
import { toast } from 'sonner'

interface BusinessMetrics {
  monthlyRevenue: number
  activeClients: number
  invoicesPaid: number
  totalInvoices: number
  totalQuotes: number
  acceptedQuotes: number
  totalExpenses: number
  unpaidRevenue: number
}

interface WeeklyData {
  day: string
  revenue: number
  invoices: number
  clients: number
}

interface WeeklyExpense {
  day: string
  amount: number
}

interface QuoteStatus {
  status: string
  count: number
}

interface Activity {
  type: string
  id: number
  title: string
  description: string
  timestamp: string
  status: string
}

interface Insight {
  type: string
  title: string
  description: string
  action: string
}

interface AnalyticsData {
  metrics: BusinessMetrics
  weeklyData: WeeklyData[]
  weeklyExpenses: WeeklyExpense[]
  quoteStatusData: QuoteStatus[]
  activity: Activity[]
  insights: Insight[]
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/analytics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        toast.error('Failed to load analytics')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return TrendingUp
      case 'warning':
        return AlertCircle
      case 'success':
        return Award
      default:
        return Users
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'invoice':
        return FileText
      case 'client':
        return Users
      case 'quote':
        return FileText
      default:
        return Activity
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  const { metrics, weeklyData, weeklyExpenses, quoteStatusData, activity, insights } = data
  const paidPercentage = metrics.totalInvoices > 0 
    ? Math.round((metrics.invoicesPaid / metrics.totalInvoices) * 100) 
    : 0

  const QUOTE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-3xl" />
          <CardContent className="p-4 sm:p-6 relative">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              ${metrics.monthlyRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Monthly Revenue</div>
            {metrics.unpaidRevenue > 0 && (
              <div className="text-xs text-orange-500 mt-2">
                ${metrics.unpaidRevenue.toFixed(2)} pending
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{metrics.activeClients}</div>
            <div className="text-xs text-muted-foreground">Active Clients</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">{paidPercentage}%</div>
            <div className="text-xs text-muted-foreground">Invoices Paid</div>
            <Progress value={paidPercentage} className="h-1.5 mt-3" />
            <div className="text-xs text-muted-foreground mt-2">
              {metrics.invoicesPaid} of {metrics.totalInvoices} paid
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500" />
            </div>
            <div className="text-xl sm:text-2xl font-bold mb-1">
              ${metrics.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-muted-foreground">Total Expenses</div>
            {metrics.totalQuotes > 0 && (
              <div className="text-xs text-blue-500 mt-2">
                {metrics.totalQuotes} quotes · {metrics.acceptedQuotes} accepted
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
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
                <Bar dataKey="revenue" fill="#10b981" name="Revenue ($)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="invoices" fill="#8b5cf6" name="Invoices" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Client Growth */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Client Growth
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={weeklyData}>
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
      </div>

      {/* Additional Charts - Expenses and Quotes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Weekly Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Receipt className="h-4 w-4 sm:h-5 sm:w-5" />
              Weekly Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {weeklyExpenses && weeklyExpenses.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyExpenses}>
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
                    formatter={(value: number) => `$${value.toFixed(2)}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="amount" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    name="Expenses ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                No expense data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quote Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
              Quote Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {quoteStatusData && quoteStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <RechartsPie>
                  <Pie
                    data={quoteStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ payload, percent }: any) => 
                      `${payload.status}: ${payload.count} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {quoteStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={QUOTE_COLORS[index % QUOTE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </RechartsPie>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
                No quote data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights and Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-500" />
              AI Insights
            </CardTitle>
            <CardDescription>Smart recommendations for your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {insights.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No insights available yet. Add more data to see recommendations.
                </p>
              ) : (
                insights.map((insight, index) => {
                  const Icon = getInsightIcon(insight.type)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-3 rounded-lg border ${getInsightStyle(insight.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">{insight.title}</p>
                          <p className="text-xs text-muted-foreground">{insight.description}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates across your business</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {activity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No recent activity. Start by adding clients or creating invoices.
                </p>
              ) : (
                activity.map((item, index) => {
                  const Icon = getActivityIcon(item.type)
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-3 w-3 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTimestamp(item.timestamp)}
                        </p>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
