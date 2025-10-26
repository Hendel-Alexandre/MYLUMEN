'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Users, MoreHorizontal, Edit, Trash2, Mail, Phone, Building2, FileText, Receipt, FileSignature, Globe } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ClientTimeline } from '@/components/Dashboard/ClientTimeline'
import { Switch } from '@/components/ui/switch'
import { calculateTaxRate, getTaxDescription } from '@/lib/utils/tax-calculator'

interface Client {
  id: number
  name: string
  email: string
  phone: string | null
  company: string | null
  taxId: string | null
  address: string | null
  city: string | null
  province: string | null
  country: string | null
  taxRate: string | null
  autoCalculateTax: boolean | null
  userId: string
  createdAt: string
  updatedAt: string
}

interface Quote {
  id: number
  status: string
  total: number
  createdAt: string
}

interface Invoice {
  id: number
  status: string
  total: number
  createdAt: string
}

interface Contract {
  id: number
  title: string
  signedByClient: boolean
  createdAt: string
}

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Japan', 'China',
  'India', 'Brazil', 'Mexico', 'Argentina', 'South Africa', 'Other'
]

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [viewingClient, setViewingClient] = useState<Client | null>(null)
  const [clientQuotes, setClientQuotes] = useState<Quote[]>([])
  const [clientInvoices, setClientInvoices] = useState<Invoice[]>([])
  const [clientContracts, setClientContracts] = useState<Contract[]>([])
  const [newClient, setNewClient] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    taxId: '',
    address: '',
    city: '',
    province: '',
    country: '',
    taxRate: '',
    autoCalculateTax: false
  })

  useEffect(() => {
    if (newClient.autoCalculateTax) {
      const calculatedRate = calculateTaxRate(newClient.country, newClient.province);
      setNewClient(prev => ({ 
        ...prev, 
        taxRate: calculatedRate !== null ? calculatedRate.toString() : ''
      }));
    }
  }, [newClient.country, newClient.province, newClient.autoCalculateTax]);

  useEffect(() => {
    if (editingClient && editingClient.autoCalculateTax) {
      const calculatedRate = calculateTaxRate(editingClient.country, editingClient.province);
      setEditingClient(prev => prev ? { 
        ...prev, 
        taxRate: calculatedRate !== null ? calculatedRate.toString() : ''
      } : null);
    }
  }, [editingClient?.country, editingClient?.province, editingClient?.autoCalculateTax]);

  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/clients', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients')
      }
      
      const result = await response.json()
      console.log('[Clients Page] API Response:', result)
      // API returns { success: true, data: [...] }
      const data = result.success ? result.data : result
      console.log('[Clients Page] Extracted data:', data)
      console.log('[Clients Page] Is array?', Array.isArray(data), 'Length:', data?.length)
      setClients(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch clients')
      // Set to empty array on error to prevent filter issues
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  const fetchClientDetails = async (clientId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const headers = { 'Authorization': `Bearer ${token}` }
      
      const [quotesRes, invoicesRes, contractsRes] = await Promise.all([
        fetch('/api/lumenr/quotes', { headers }),
        fetch('/api/lumenr/invoices', { headers }),
        fetch('/api/lumenr/contracts', { headers })
      ])

      if (quotesRes.ok) {
        const quotesResult = await quotesRes.json()
        const allQuotes = quotesResult.success ? quotesResult.data : quotesResult
        setClientQuotes(Array.isArray(allQuotes) ? allQuotes.filter((q: any) => q.clientId === clientId) : [])
      }

      if (invoicesRes.ok) {
        const invoicesResult = await invoicesRes.json()
        const allInvoices = invoicesResult.success ? invoicesResult.data : invoicesResult
        setClientInvoices(Array.isArray(allInvoices) ? allInvoices.filter((i: any) => i.clientId === clientId) : [])
      }

      if (contractsRes.ok) {
        const contractsResult = await contractsRes.json()
        const allContracts = contractsResult.success ? contractsResult.data : contractsResult
        setClientContracts(Array.isArray(allContracts) ? allContracts.filter((c: any) => c.clientId === clientId) : [])
      }
    } catch (error: any) {
      console.error('Error fetching client details:', error)
    }
  }

  const createClient = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      })

      if (!response.ok) {
        throw new Error('Failed to create client')
      }

      toast.success('Client created successfully')

      setNewClient({
        name: '',
        email: '',
        phone: '',
        company: '',
        taxId: '',
        address: '',
        city: '',
        province: '',
        country: '',
        taxRate: '',
        autoCalculateTax: false
      })
      setIsDialogOpen(false)
      fetchClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const updateClient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingClient) return

    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/clients?id=${editingClient.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingClient)
      })

      if (!response.ok) {
        throw new Error('Failed to update client')
      }

      toast.success('Client updated successfully')

      setIsEditDialogOpen(false)
      setEditingClient(null)
      fetchClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteClient = async (clientId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/clients?id=${clientId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to delete client')
      }

      toast.success('Client deleted successfully')
      fetchClients()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleEditClient = (client: Client) => {
    setEditingClient(client)
    setIsEditDialogOpen(true)
  }

  const handleViewClient = (client: Client) => {
    setViewingClient(client)
    fetchClientDetails(client.id)
    setIsDetailDialogOpen(true)
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Clients</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your client relationships</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={createClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newClient.phone}
                    onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                    placeholder="+1-555-234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={newClient.company}
                    onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={newClient.taxId}
                  onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                  placeholder="12-3456789"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newClient.city}
                    onChange={(e) => setNewClient({ ...newClient, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province/State</Label>
                  <Input
                    id="province"
                    value={newClient.province}
                    onChange={(e) => setNewClient({ ...newClient, province: e.target.value })}
                    placeholder="NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={newClient.country} onValueChange={(value) => setNewClient({ ...newClient, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={newClient.address}
                  onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                  rows={2}
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoCalculateTax">Auto-Calculate Tax</Label>
                    <p className="text-sm text-muted-foreground">Automatically calculate tax rate based on location</p>
                  </div>
                  <Switch
                    id="autoCalculateTax"
                    checked={newClient.autoCalculateTax}
                    onCheckedChange={(checked) => setNewClient({ ...newClient, autoCalculateTax: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={newClient.taxRate}
                    onChange={(e) => setNewClient({ ...newClient, taxRate: e.target.value })}
                    placeholder="13.00"
                    disabled={newClient.autoCalculateTax}
                  />
                  {newClient.autoCalculateTax && newClient.country && (
                    <p className="text-xs text-muted-foreground">
                      {getTaxDescription(newClient.country, newClient.province) || 'No tax rate found for this location'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Edit className="h-4 w-4 mr-2" />
              Edit Client
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Client</DialogTitle>
            </DialogHeader>
            <form onSubmit={updateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={editingClient?.name || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })}
                    required
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editingClient?.email || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })}
                    required
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={editingClient?.phone || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })}
                    placeholder="+1-555-234-5678"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input
                    id="company"
                    value={editingClient?.company || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID</Label>
                <Input
                  id="taxId"
                  value={editingClient?.taxId || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, taxId: e.target.value })}
                  placeholder="12-3456789"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={editingClient?.city || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, city: e.target.value })}
                    placeholder="New York"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="province">Province/State</Label>
                  <Input
                    id="province"
                    value={editingClient?.province || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, province: e.target.value })}
                    placeholder="NY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={editingClient?.country || ''} onValueChange={(value) => setEditingClient({ ...editingClient, country: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={editingClient?.address || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, address: e.target.value })}
                  rows={2}
                  placeholder="123 Main Street, Apt 4B"
                />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="editAutoCalculateTax">Auto-Calculate Tax</Label>
                    <p className="text-sm text-muted-foreground">Automatically calculate tax rate based on location</p>
                  </div>
                  <Switch
                    id="editAutoCalculateTax"
                    checked={editingClient?.autoCalculateTax || false}
                    onCheckedChange={(checked) => setEditingClient({ ...editingClient, autoCalculateTax: checked })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="editTaxRate">Tax Rate (%)</Label>
                  <Input
                    id="editTaxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={editingClient?.taxRate || ''}
                    onChange={(e) => setEditingClient({ ...editingClient, taxRate: e.target.value })}
                    placeholder="13.00"
                    disabled={editingClient?.autoCalculateTax || false}
                  />
                  {editingClient?.autoCalculateTax && editingClient?.country && (
                    <p className="text-xs text-muted-foreground">
                      {getTaxDescription(editingClient.country, editingClient.province) || 'No tax rate found for this location'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Client</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Users className="h-4 w-4 mr-2" />
              View Details
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{viewingClient?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 mr-3 text-primary" />
                      <span className="text-muted-foreground">{viewingClient?.email}</span>
                    </div>
                    {viewingClient?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-5 w-5 mr-3 text-primary" />
                        <span className="text-muted-foreground">{viewingClient?.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Company Information</h3>
                  {viewingClient?.company && (
                    <div className="flex items-center">
                      <Building2 className="h-5 w-5 mr-3 text-primary" />
                      <span className="text-muted-foreground">{viewingClient?.company}</span>
                    </div>
                  )}
                  {viewingClient?.country && (
                    <div className="flex items-center">
                      <Globe className="h-5 w-5 mr-3 text-primary" />
                      <span className="text-muted-foreground">{viewingClient?.country}</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Client Timeline</h3>
                <ClientTimeline client={viewingClient} />
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Quotes</h3>
                <div className="space-y-3">
                  {clientQuotes.map((quote) => (
                    <div key={quote.id} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{quote.status}</h4>
                          <p className="text-sm text-muted-foreground">Total: ${quote.total.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(quote.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Invoices</h3>
                <div className="space-y-3">
                  {clientInvoices.map((invoice) => (
                    <div key={invoice.id} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{invoice.status}</h4>
                          <p className="text-sm text-muted-foreground">Total: ${invoice.total.toFixed(2)}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(invoice.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4">Contracts</h3>
                <div className="space-y-3">
                  {clientContracts.map((contract) => (
                    <div key={contract.id} className="border rounded-lg p-4 bg-muted/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{contract.title}</h4>
                          <p className="text-sm text-muted-foreground">{contract.signedByClient ? 'Signed' : 'Pending'}</p>
                        </div>
                        <p className="text-sm text-muted-foreground">{new Date(contract.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredClients.map((client) => (
          <motion.div
            key={client.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            className="h-full"
          >
            <Card 
              className="h-full hover:shadow-md transition-all duration-200 cursor-pointer focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2" 
              role="button"
              tabIndex={0}
              onClick={() => handleViewClient(client)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleViewClient(client);
                }
              }}
              aria-label={`View details for ${client.name}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3 px-4">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Users className="h-4 w-4 text-primary flex-shrink-0" />
                  <CardTitle className="text-base font-semibold truncate">
                    {client.name}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm" className="flex-shrink-0 h-7 w-7 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewClient(client)}>
                      <Users className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditClient(client)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Client
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Client
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the client
                            "{client.name}" and all associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClient(client.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-1.5 px-4 pb-3">
                {client.company && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Building2 className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{client.company}</span>
                  </div>
                )}

                <div className="flex items-center text-xs text-muted-foreground">
                  <Mail className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>

                {client.phone && (
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Phone className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-1">
                  Added {new Date(client.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No clients found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No clients match your search.' : 'Create your first client to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Client
            </Button>
          )}
        </div>
      )}
    </div>
  )
}