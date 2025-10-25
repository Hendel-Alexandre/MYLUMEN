'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, MoreHorizontal, Edit, Trash2, CheckCircle, Send } from 'lucide-react'
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

interface Client {
  id: number
  name: string
  email: string
  company: string | null
}

interface Quote {
  id: number
  clientId: number
  userId: string
  quoteNumber: string
  issueDate: string
  validUntil: string
  status: string
  subtotal: number
  tax: number
  total: number
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
  const [newQuote, setNewQuote] = useState({
    clientId: '',
    quoteNumber: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    status: 'draft',
    subtotal: '',
    tax: '',
    notes: ''
  })

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
      
      const data = await response.json()
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
        const data = await response.json()
        setClients(Array.isArray(data) ? data : [])
      }
    } catch (error: any) {
      console.error('Error fetching clients:', error)
      setClients([])
    }
  }

  const createQuote = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const subtotal = parseFloat(newQuote.subtotal)
      const tax = parseFloat(newQuote.tax || '0')
      const total = subtotal + tax

      const response = await fetch('/api/lumenr/quotes', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: parseInt(newQuote.clientId),
          quoteNumber: newQuote.quoteNumber,
          issueDate: newQuote.issueDate,
          validUntil: newQuote.validUntil,
          status: newQuote.status,
          subtotal,
          tax,
          total,
          notes: newQuote.notes || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create quote')
      }

      toast.success('Quote created successfully')

      setNewQuote({
        clientId: '',
        quoteNumber: '',
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: '',
        status: 'draft',
        subtotal: '',
        tax: '',
        notes: ''
      })
      setIsDialogOpen(false)
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

  const convertToInvoice = async (quoteId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/quotes/${quoteId}/convert-to-invoice`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to convert quote to invoice')
      }

      toast.success('Quote converted to invoice successfully')
      fetchQuotes()
    } catch (error: any) {
      toast.error(error.message)
    }
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
    const matchesSearch = 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(quote.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalValue = filteredQuotes
    .filter(q => q.status === 'accepted')
    .reduce((sum, q) => sum + q.total, 0)

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
          <p className="text-muted-foreground text-sm sm:text-base">Create and send quotes to clients</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Quote
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  <Label htmlFor="quoteNumber">Quote Number *</Label>
                  <Input
                    id="quoteNumber"
                    value={newQuote.quoteNumber}
                    onChange={(e) => setNewQuote({ ...newQuote, quoteNumber: e.target.value })}
                    required
                    placeholder="QUO-001"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={newQuote.issueDate}
                    onChange={(e) => setNewQuote({ ...newQuote, issueDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="date"
                    value={newQuote.validUntil}
                    onChange={(e) => setNewQuote({ ...newQuote, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal *</Label>
                  <Input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newQuote.subtotal}
                    onChange={(e) => setNewQuote({ ...newQuote, subtotal: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tax">Tax</Label>
                  <Input
                    id="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newQuote.tax}
                    onChange={(e) => setNewQuote({ ...newQuote, tax: e.target.value })}
                    placeholder="0.00"
                  />
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
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newQuote.notes}
                  onChange={(e) => setNewQuote({ ...newQuote, notes: e.target.value })}
                  rows={3}
                  placeholder="Terms, conditions, additional information..."
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search quotes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            {STATUS_OPTIONS.map(status => (
              <TabsTrigger key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Value (Accepted)</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredQuotes.length} quote{filteredQuotes.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuotes.map((quote) => (
          <motion.div
            key={quote.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg font-semibold truncate">
                    {quote.quoteNumber}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {quote.status === 'accepted' && (
                      <DropdownMenuItem onClick={() => convertToInvoice(quote.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Convert to Invoice
                      </DropdownMenuItem>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Quote
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quote
                            "{quote.quoteNumber}".
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
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={`${getStatusColor(quote.status)} text-white`}>
                    {quote.status}
                  </Badge>
                  <span className="text-lg font-bold">${quote.total.toFixed(2)}</span>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">{getClientName(quote.clientId)}</span>
                </div>

                <div className="text-sm text-muted-foreground">
                  <div>Issued: {new Date(quote.issueDate).toLocaleDateString()}</div>
                  <div>Valid Until: {new Date(quote.validUntil).toLocaleDateString()}</div>
                </div>

                {quote.notes && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                    {quote.notes}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredQuotes.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No quotes found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No quotes match your search.' : 'Create your first quote to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Quote
            </Button>
          )}
        </div>
      )}
    </div>
  )
}