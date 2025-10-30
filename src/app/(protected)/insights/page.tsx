'use client';

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, FileText, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { toast } from 'sonner'

interface Invoice {
  id: number
  total: number
  status: string
  created_at: string
}

interface Receipt {
  id: number
  amount: number
  category: string
  date: string
}

interface Payment {
  id: number
  amount: number
  processed_at: string
}

interface Client {
  id: number
}

export default function InsightsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const headers = { Authorization: `Bearer ${token}` }

      const [invoicesRes, receiptsRes, paymentsRes, clientsRes] = await Promise.all([
        fetch('/api/lumenr/invoices', { headers }),
        fetch('/api/lumenr/receipts', { headers }),
        fetch('/api/lumenr/payments', { headers }),
        fetch('/api/lumenr/clients', { headers })
      ])

      if (!invoicesRes.ok || !receiptsRes.ok || !paymentsRes.ok || !clientsRes.ok) {
        throw new Error('Failed to fetch insights data')
      }

      const [invoicesResult, receiptsResult, paymentsResult, clientsResult] = await Promise.all([
        invoicesRes.json(),
        receiptsRes.json(),
        paymentsRes.json(),
        clientsRes.json()
      ])

      const invoicesData = invoicesResult.success ? invoicesResult.data : invoicesResult
      const receiptsData = receiptsResult.success ? receiptsResult.data : receiptsResult
      const paymentsData = paymentsResult.success ? paymentsResult.data : paymentsResult
      const clientsData = clientsResult.success ? clientsResult.data : clientsResult

      setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
      setReceipts(Array.isArray(receiptsData) ? receiptsData : [])
      setPayments(Array.isArray(paymentsData) ? paymentsData : [])
      setClients(Array.isArray(clientsData) ? clientsData : [])
    } catch (error) {
      console.error('Error loading insights data:', error)
      toast.error('Failed to load insights data')
      setInvoices([])
      setReceipts([])
      setPayments([])
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  // Calculate metrics
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const revenueThisMonth = payments
    .filter(p => {
      const date = new Date(p.processed_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, p) => {
      const amount = typeof p.amount === 'number' && !isNaN(p.amount) ? p.amount : 0
      return sum + amount
    }, 0)

  const pendingInvoices = invoices.filter(i => i.status === 'pending' || i.status === 'sent')
  const pendingAmount = pendingInvoices.reduce((sum, i) => {
    const total = typeof i.total === 'number' && !isNaN(i.total) ? i.total : 0
    return sum + total
  }, 0)

  const totalExpenses = receipts.reduce((sum, r) => {
    const amount = typeof r.amount === 'number' && !isNaN(r.amount) ? r.amount : 0
    return sum + amount
  }, 0)
  const expensesThisMonth = receipts
    .filter(r => {
      const date = new Date(r.date)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    })
    .reduce((sum, r) => {
      const amount = typeof r.amount === 'number' && !isNaN(r.amount) ? r.amount : 0
      return sum + amount
    }, 0)

  const profitMargin = revenueThisMonth - expensesThisMonth

  // Chart data - Monthly revenue
  const monthlyRevenue = Array.from({ length: 12 }, (_, i) => {
    const month = new Date(currentYear, i, 1).toLocaleString('default', { month: 'short' })
    const revenue = payments
      .filter(p => {
        const date = new Date(p.processed_at)
        return date.getMonth() === i && date.getFullYear() === currentYear
      })
      .reduce((sum, p) => {
        const amount = typeof p.amount === 'number' && !isNaN(p.amount) ? p.amount : 0
        return sum + amount
      }, 0)
    return { month, revenue }
  })

  // Expenses by category
  const expensesByCategory = receipts.reduce((acc: any, r) => {
    const category = r.category || 'Other'
    const amount = typeof r.amount === 'number' && !isNaN(r.amount) ? r.amount : 0
    acc[category] = (acc[category] || 0) + amount
    return acc
  }, {})

  const expensesChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name,
    value
  }))

  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1']

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Financial Insights</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${revenueThisMonth.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => {
                const date = new Date(p.processed_at)
                return date.getMonth() === currentMonth
              }).length} payments received
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${pendingAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {pendingInvoices.length} invoices pending
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              Active clients
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
            {profitMargin >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ${Math.abs(profitMargin).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Revenue - Expenses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Revenue Chart */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Revenue ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="glass-effect">
        <CardHeader>
          <CardTitle>Detailed Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue (All Time)</p>
              <p className="text-2xl font-bold">
                ${payments.reduce((sum, p) => {
                  const amount = typeof p.amount === 'number' && !isNaN(p.amount) ? p.amount : 0
                  return sum + amount
                }, 0).toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Average Invoice Value</p>
              <p className="text-2xl font-bold">
                ${invoices.length > 0 ? (invoices.reduce((sum, i) => {
                  const total = typeof i.total === 'number' && !isNaN(i.total) ? i.total : 0
                  return sum + total
                }, 0) / invoices.length).toFixed(2) : '0.00'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Paid Invoices</p>
              <p className="text-2xl font-bold">
                {invoices.filter(i => i.status === 'paid').length}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Receipts</p>
              <p className="text-2xl font-bold">{receipts.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Success Rate</p>
              <p className="text-2xl font-bold">
                {invoices.length > 0 
                  ? ((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100).toFixed(1)
                  : '0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}