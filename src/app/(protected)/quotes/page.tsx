'use client';

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, MoreHorizontal, Edit, Trash2, CheckCircle, Send, ArrowRight, Download } from 'lucide-react'
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
import LineItemsEditor from '@/components/LineItems/LineItemsEditor'
import { downloadPDF } from '@/lib/pdf-utils'
import React from 'react'

const QuotePDF = dynamic(
  () => import('@/components/PDF/QuotePDF').then(mod => ({ default: mod.QuotePDF })),
  { ssr: false }
)

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

interface Quote {
  id: number
  clientId: number
  userId: string
  items: LineItem[]
  subtotal: number
  tax: number
  total: number
  status: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_OPTIONS = ['draft', 'sent', 'accepted', 'declined', 'expired']

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null)
  
  const [newQuote, setNewQuote] = useState({
    clientId: '',
    status: 'draft',
    notes: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])
  const [editLineItems, setEditLineItems] = useState<LineItem[]>([])

  const fetchQuotes = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/quotes', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch quotes')
      }
      
      const result = await response.json()
      const data = result.data || result
      setQuotes(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch quotes')
      setQuotes([])
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

  const createQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    if (lineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    try {
      const token = localStorage.getItem('bearer_token')
      const { subtotal, tax, total } = calculateTotals(lineItems, newQuote.clientId)

      const response = await fetch('/api/lumenr/quotes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: parseInt(newQuote.clientId),
          items: lineItems,
          subtotal,
          tax,
          total,
          status: newQuote.status,
          notes: newQuote.notes || null
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to create quote'
        throw new Error(errorMessage)
      }

      toast.success('Quote created successfully')

      setNewQuote({
        clientId: '',
        status: 'draft',
        notes: ''
      })
      setLineItems([])
      setIsDialogOpen(false)
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const updateQuote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingQuote) return

    if (editLineItems.length === 0) {
      toast.error('Please add at least one line item')
      return
    }

    try {
      const token = localStorage.getItem('bearer_token')
      const { subtotal, tax, total } = calculateTotals(editLineItems, editingQuote.clientId.toString())

      const response = await fetch(`/api/lumenr/quotes?id=${editingQuote.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...editingQuote,
          items: editLineItems,
          subtotal,
          tax,
          total
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to update quote'
        throw new Error(errorMessage)
      }

      toast.success('Quote updated successfully')

      setIsEditDialogOpen(false)
      setEditingQuote(null)
      setEditLineItems([])
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteQuote = async (quoteId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/quotes?id=${quoteId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to delete quote')
      }

      toast.success('Quote deleted successfully')
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const downloadQuotePDF = async (quote: Quote) => {
    try {
      const client = clients.find(c => c.id === quote.clientId)
      if (!client) {
        toast.error('Client information not found')
        return
      }

      const businessProfile = {
        businessName: localStorage.getItem('business_name') || 'Your Business',
        businessAddress: '',
        businessPhone: '',
        businessEmail: '',
        logoUrl: ''
      }

      const pdfData = {
        quoteNumber: `Q-${quote.id}`,
        date: new Date(quote.createdAt).toLocaleDateString(),
        status: quote.status,
        clientName: client.name,
        clientEmail: client.email,
        clientCompany: client.company || '',
        clientAddress: '',
        items: quote.items.map(item => ({
          description: item.name,
          quantity: item.quantity,
          price: item.price,
          total: item.total
        })),
        subtotal: quote.subtotal,
        tax: quote.tax,
        total: quote.total,
        notes: quote.notes || '',
        ...businessProfile
      }

      await downloadPDF(
        <QuotePDF data={pdfData} />,
        `Quote-${quote.id}-${client.name.replace(/\s+/g, '-')}.pdf`
      )

      toast.success('Quote PDF downloaded successfully')
    } catch (error: any) {
      console.error('Error downloading quote PDF:', error)
      toast.error('Failed to download quote PDF')
    }
  }

  const convertToInvoice = async (quote: Quote) => {
    try {
      const token = localStorage.getItem('bearer_token')
      
      const response = await fetch('/api/lumenr/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          quoteId: quote.id,
          clientId: quote.clientId,
          items: quote.items,
          subtotal: quote.subtotal,
          tax: quote.tax,
          total: quote.total,
          status: 'unpaid',
          notes: quote.notes
        })
      })

      const result = await response.json()

      if (!response.ok) {
        const errorMessage = result.error || 'Failed to convert quote to invoice'
        throw new Error(errorMessage)
      }

      toast.success('Quote converted to invoice successfully')
      
      await fetch(`/api/lumenr/quotes?id=${quote.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...quote, status: 'accepted' })
      })
      
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditQuote = (quote: Quote) => {
    setEditingQuote(quote)
    setEditLineItems(quote.items || [])
    setIsEditDialogOpen(true)
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }

  useEffect(() => {
    fetchQuotes()
    fetchClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'sent': return 'bg-blue-500'
      case 'accepted': return 'bg-green-500'
      case 'declined': return 'bg-red-500'
      case 'expired': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const filteredQuotes = quotes.filter(quote => {
    const matchesSearch = getClientName(quote.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totals = calculateTotals(lineItems, newQuote.clientId)
  const editTotals = editingQuote ? calculateTotals(editLineItems, editingQuote.clientId.toString()) : { subtotal: 0, tax: 0, total: 0 }

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Create and manage your quotes</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Quote</DialogTitle>
            </DialogHeader>
            <form onSubmit={createQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={newQuote.clientId} onValueChange={(value) => setNewQuote({ ...newQuote, clientId: value })}>
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
                  <Label htmlFor="status">Status *</Label>
                  <Select value={newQuote.status} onValueChange={(value) => setNewQuote({ ...newQuote, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <LineItemsEditor
                items={lineItems}
                onChange={setLineItems}
                currency="USD"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
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
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional terms, conditions..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Quote</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredQuotes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredQuotes.filter(q => q.status === 'accepted').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredQuotes.filter(q => q.status === 'draft' || q.status === 'sent').length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
            <TabsTrigger value="accepted">Accepted</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="expired">Expired</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="space-y-3">
        {filteredQuotes.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first quote
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredQuotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{getClientName(quote.clientId)}</h3>
                      <Badge className={getStatusColor(quote.status)}>
                        {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                      <span>{quote.items?.length || 0} items</span>
                      <span>Created: {new Date(quote.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold">${(quote.total || 0).toFixed(2)}</div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditQuote(quote)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => downloadQuotePDF(quote)}>
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </DropdownMenuItem>
                        {quote.status === 'accepted' && (
                          <DropdownMenuItem onClick={() => convertToInvoice(quote)}>
                            <ArrowRight className="h-4 w-4 mr-2" />
                            Convert to Invoice
                          </DropdownMenuItem>
                        )}
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
                                This will permanently delete this quote. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => deleteQuote(quote.id)}>
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
            <DialogTitle>Edit Quote</DialogTitle>
          </DialogHeader>
          {editingQuote && (
            <form onSubmit={updateQuote} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input value={getClientName(editingQuote.clientId)} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editStatus">Status *</Label>
                  <Select 
                    value={editingQuote.status} 
                    onValueChange={(value) => setEditingQuote({ ...editingQuote, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map(status => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <LineItemsEditor
                items={editLineItems}
                onChange={setEditLineItems}
                currency="USD"
              />

              <Card>
                <CardHeader>
                  <CardTitle>Quote Summary</CardTitle>
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
                  value={editingQuote.notes || ''}
                  onChange={(e) => setEditingQuote({ ...editingQuote, notes: e.target.value })}
                  rows={3}
                  placeholder="Additional terms, conditions..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Quote</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
