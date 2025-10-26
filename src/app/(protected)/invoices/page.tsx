'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, MoreHorizontal, Edit, Trash2, Eye, Download, Send, CheckCircle, Lock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import LineItemsEditor from '@/components/LineItems/LineItemsEditor'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'

interface Client {
  id: number
  name: string
  email: string
  company: string | null
  taxRate: string | null
  autoCalculateTax: boolean
}

interface LineItem {
  id: string
  type: 'product' | 'service'
  itemId: number | null
  name: string
  description: string
  quantity: number
  price: number
  total: number
}

interface Invoice {
  id: number
  clientId: number
  userId: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  status: string
  dueDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ['unpaid', 'partially_paid', 'paid', 'cancelled', 'overdue']

export default function InvoicesPage() {
  const { hasAccess, needsUpgrade, isTrialing, daysRemaining, loading: subscriptionLoading } = useSubscription()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  
  // Proper access check: must have active subscription AND not need upgrade AND not during loading
  const canCreateInvoice = !subscriptionLoading && !needsUpgrade && (hasAccess || (isTrialing && daysRemaining > 0))
  
  const [newInvoice, setNewInvoice] = useState({
    clientId: '',
    dueDate: '',
    status: 'unpaid',
    notes: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [editLineItems, setEditLineItems] = useState<LineItem[]>([])

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/invoices', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoices')
      }
      
      const result = await response.json()
      const data = result.data || result
      setInvoices(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/clients', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (response.ok) {
        const result = await response.json()
        const data = result.data || result
        setClients(Array.isArray(data) ? data : [])
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const calculateTotals = (items: LineItem[], clientId?: string) => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    
    let taxRate = 0
    if (clientId) {
      const client = clients.find(c => c.id.toString() === clientId)
      if (client && client.autoCalculateTax && client.taxRate) {
        taxRate = parseFloat(client.taxRate) / 100
      }
    }
    
    const tax = subtotal * taxRate
    const total = subtotal + tax
    
    return { subtotal, tax, total }
  }

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    try {
      const token = localStorage.getItem('bearer_token')
      const { subtotal, tax, total } = calculateTotals(lineItems, newInvoice.clientId)

      const response = await fetch('/api/lumenr/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: parseInt(newInvoice.clientId),
          items: lineItems,
          subtotal,
          tax,
          total,
          status: newInvoice.status,
          dueDate: newInvoice.dueDate || null,
          notes: newInvoice.notes || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to create invoice'
        throw new Error(errorMessage)
      }

      toast.success('Invoice created successfully')

      setNewInvoice({
        clientId: '',
        dueDate: '',
        status: 'unpaid',
        notes: ''
      })
      setLineItems([])
      setIsDialogOpen(false)
      fetchInvoices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const updateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingInvoice) return

    if (editLineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    try {
      const token = localStorage.getItem('bearer_token')
      const { subtotal, tax, total } = calculateTotals(editLineItems, editingInvoice.clientId.toString())

      const response = await fetch(`/api/lumenr/invoices?id=${editingInvoice.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingInvoice,
          items: editLineItems,
          subtotal,
          tax,
          total
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to update invoice'
        throw new Error(errorMessage)
      }

      toast.success('Invoice updated successfully')

      setIsEditDialogOpen(false)
      setEditingInvoice(null)
      setEditLineItems([])
      fetchInvoices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteInvoice = async (invoiceId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/invoices?id=${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to delete invoice')
      }

      toast.success('Invoice deleted successfully')
      fetchInvoices()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setEditLineItems(invoice.items || [])
    setIsEditDialogOpen(true)
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid': return 'bg-yellow-500'
      case 'partially_paid': return 'bg-blue-500'
      case 'paid': return 'bg-green-500'
      case 'overdue': return 'bg-red-500'
      case 'cancelled': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = getClientName(invoice.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalRevenue = filteredInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + (inv.total || 0), 0)

  const totals = calculateTotals(lineItems, newInvoice.clientId)
  const editTotals = editingInvoice ? calculateTotals(editLineItems, editingInvoice.clientId.toString()) : { subtotal: 0, tax: 0, total: 0 }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage your invoices</p>
          {isTrialing && daysRemaining > 0 && (
            <p className="text-xs text-amber-600 mt-1">Trial: {daysRemaining} days remaining</p>
          )}
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          if (!canCreateInvoice && open) {
            toast.error('Subscription Required', {
              description: needsUpgrade 
                ? 'Your trial has expired. Please upgrade to create invoices.'
                : 'Please wait while we verify your subscription...'
            })
            return
          }
          setIsDialogOpen(open)
        }}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <DialogTrigger asChild>
                    <Button 
                      className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto"
                      disabled={!canCreateInvoice}
                    >
                      {needsUpgrade ? <Lock className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                      New Invoice
                    </Button>
                  </DialogTrigger>
                </div>
              </TooltipTrigger>
              {needsUpgrade && (
                <TooltipContent>
                  <p>Trial expired. <Link href="/billing" className="underline">Upgrade now</Link> to create invoices.</p>
                </TooltipContent>
              )}
              {subscriptionLoading && (
                <TooltipContent>
                  <p>Verifying subscription...</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Invoice</DialogTitle>
            </DialogHeader>
            <form onSubmit={createInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={newInvoice.clientId} onValueChange={(value) => setNewInvoice({ ...newInvoice, clientId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name} {client.company && `(${client.company})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={newInvoice.status} onValueChange={(value) => setNewInvoice({ ...newInvoice, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <LineItemsEditor
                items={lineItems}
                onChange={setLineItems}
                currency="USD"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">${totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${totals.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newInvoice.notes}
                  onChange={(e) => setNewInvoice({ ...newInvoice, notes: e.target.value })}
                  rows={3}
                  placeholder="Payment terms, additional information..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Invoice</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredInvoices.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredInvoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partially_paid').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="partially_paid">Partial</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {filteredInvoices.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No invoices found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first invoice
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{getClientName(invoice.clientId)}</h3>
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span>{invoice.items?.length || 0} items</span>
                      {invoice.dueDate && <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">${(invoice.total || 0).toFixed(2)}</div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete this invoice. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteInvoice(invoice.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          {editingInvoice && (
            <form onSubmit={updateInvoice} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={getClientName(editingInvoice.clientId)} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editDueDate">Due Date</Label>
                  <Input
                    id="editDueDate"
                    type="date"
                    value={editingInvoice.dueDate || ''}
                    onChange={(e) => setEditingInvoice({ ...editingInvoice, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editStatus">Status *</Label>
                <Select 
                  value={editingInvoice.status} 
                  onValueChange={(value) => setEditingInvoice({ ...editingInvoice, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map(status => (
                      <SelectItem key={status} value={status}>
                        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <LineItemsEditor
                items={editLineItems}
                onChange={setEditLineItems}
                currency="USD"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Invoice Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-semibold">${editTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span className="font-semibold">${editTotals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>${editTotals.total.toFixed(2)}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="editNotes">Notes</Label>
                <Textarea
                  id="editNotes"
                  value={editingInvoice.notes || ''}
                  onChange={(e) => setEditingInvoice({ ...editingInvoice, notes: e.target.value })}
                  rows={3}
                  placeholder="Payment terms, additional information..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Invoice</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
