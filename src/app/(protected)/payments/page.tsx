'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, DollarSign, MoreHorizontal, Edit, Trash2, Eye, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface Payment {
  id: number
  invoiceId: number
  userId: string
  method: string
  amount: number
  currency: string
  transactionRef: string | null
  processedAt: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface Invoice {
  id: number
  total: number
  status: string
}

const PAYMENT_METHODS = ['card', 'interac', 'bank', 'cash', 'other']

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [methodFilter, setMethodFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newPayment, setNewPayment] = useState({
    invoiceId: '',
    method: 'card',
    amount: '',
    currency: 'USD',
    transactionRef: '',
    processedAt: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/payments', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }
      
      const data = await response.json()
      setPayments(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch payments')
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const data = await response.json()
        setInvoices(Array.isArray(data) ? data : [])
      }
    } catch (error: any) {
      console.error('Error fetching invoices:', error)
      setInvoices([])
    }
  }

  const createPayment = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/payments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invoiceId: parseInt(newPayment.invoiceId),
          method: newPayment.method,
          amount: parseFloat(newPayment.amount),
          currency: newPayment.currency,
          transactionRef: newPayment.transactionRef || null,
          processedAt: new Date(newPayment.processedAt).toISOString(),
          notes: newPayment.notes || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to record payment')
      }

      toast.success('Payment recorded successfully')

      setNewPayment({
        invoiceId: '',
        method: 'card',
        amount: '',
        currency: 'USD',
        transactionRef: '',
        processedAt: new Date().toISOString().split('T')[0],
        notes: ''
      })
      setIsDialogOpen(false)
      fetchPayments()
      fetchInvoices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchPayments()
    fetchInvoices()
  }, [])

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'card': return 'bg-blue-500'
      case 'interac': return 'bg-purple-500'
      case 'bank': return 'bg-green-500'
      case 'cash': return 'bg-yellow-500'
      case 'other': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transactionRef?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toString().includes(searchTerm) ||
      payment.invoiceId.toString().includes(searchTerm)
    
    const matchesMethod = methodFilter === 'all' || payment.method === methodFilter

    return matchesSearch && matchesMethod
  })

  const totalRevenue = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track and record payment transactions</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record New Payment</DialogTitle>
            </DialogHeader>
            <form onSubmit={createPayment} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice *</Label>
                <Select value={newPayment.invoiceId} onValueChange={(value) => {
                  const invoice = invoices.find(inv => inv.id === parseInt(value))
                  setNewPayment({ 
                    ...newPayment, 
                    invoiceId: value,
                    amount: invoice?.total.toString() || ''
                  })
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled').map(invoice => (
                      <SelectItem key={invoice.id} value={invoice.id.toString()}>
                        Invoice #{invoice.id} - ${invoice.total.toFixed(2)} ({invoice.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method *</Label>
                  <Select value={newPayment.method} onValueChange={(value) => setNewPayment({ ...newPayment, method: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_METHODS.map(method => (
                        <SelectItem key={method} value={method}>
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="processedAt">Payment Date *</Label>
                  <Input
                    id="processedAt"
                    type="date"
                    value={newPayment.processedAt}
                    onChange={(e) => setNewPayment({ ...newPayment, processedAt: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={newPayment.currency}
                    onChange={(e) => setNewPayment({ ...newPayment, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionRef">Transaction Reference</Label>
                <Input
                  id="transactionRef"
                  value={newPayment.transactionRef}
                  onChange={(e) => setNewPayment({ ...newPayment, transactionRef: e.target.value })}
                  placeholder="e.g., TXN-123456"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  rows={3}
                  placeholder="Add payment details..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Record Payment</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={methodFilter} onValueChange={setMethodFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {PAYMENT_METHODS.map(method => (
              <TabsTrigger key={method} value={method}>
                {method.charAt(0).toUpperCase() + method.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Revenue {methodFilter !== 'all' && `(${methodFilter})`}</p>
            <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPayments.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <CreditCard className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg font-semibold truncate">
                    Payment #{payment.id}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getMethodColor(payment.method)} text-white`}>
                    {payment.method}
                  </Badge>
                  <span className="text-lg font-bold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {payment.amount.toFixed(2)}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Invoice: </span>
                  <span className="font-medium">#{payment.invoiceId}</span>
                </div>

                {payment.transactionRef && (
                  <div className="text-sm text-muted-foreground font-mono truncate">
                    Ref: {payment.transactionRef}
                  </div>
                )}

                <div className="flex justify-between items-center pt-4">
                  <div className="text-xs text-muted-foreground">
                    {new Date(payment.processedAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No payments found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No payments match your search.' : 'Record your first payment to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Record Payment
            </Button>
          )}
        </div>
      )}
    </div>
  )
}