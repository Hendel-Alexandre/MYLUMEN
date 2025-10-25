'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, FileText, MoreHorizontal, Edit, Trash2, CheckCircle, Send, FileSignature } from 'lucide-react'
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

interface Contract {
  id: number
  clientId: number
  userId: string
  title: string
  type: string
  startDate: string
  endDate: string | null
  status: string
  value: number | null
  signedByClient: boolean
  signedByUser: boolean
  content: string | null
  createdAt: string
  updatedAt: string
}

const CONTRACT_TYPES = ['Service Agreement', 'NDA', 'Employment', 'Freelance', 'Partnership', 'Other']
const STATUS_OPTIONS = ['draft', 'sent', 'signed', 'expired', 'terminated']

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newContract, setNewContract] = useState({
    clientId: '',
    title: '',
    type: 'Service Agreement',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    status: 'draft',
    value: '',
    content: ''
  })

  const fetchContracts = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/contracts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch contracts')
      }
      
      const data = await response.json()
      setContracts(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch contracts')
      setContracts([])
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

  const createContract = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const value = newContract.value ? parseFloat(newContract.value) : null

      const response = await fetch('/api/lumenr/contracts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          clientId: parseInt(newContract.clientId),
          title: newContract.title,
          type: newContract.type,
          startDate: newContract.startDate,
          endDate: newContract.endDate || null,
          status: newContract.status,
          value,
          signedByClient: false,
          signedByUser: false,
          content: newContract.content || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create contract')
      }

      toast.success('Contract created successfully')

      setNewContract({
        clientId: '',
        title: '',
        type: 'Service Agreement',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        status: 'draft',
        value: '',
        content: ''
      })
      setIsDialogOpen(false)
      fetchContracts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteContract = async (contractId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/contracts?id=${contractId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to delete contract')
      }

      toast.success('Contract deleted successfully')
      fetchContracts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const getClientName = (clientId: number) => {
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Unknown Client'
  }

  useEffect(() => {
    fetchContracts()
    fetchClients()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500'
      case 'sent': return 'bg-blue-500'
      case 'signed': return 'bg-green-500'
      case 'expired': return 'bg-orange-500'
      case 'terminated': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Service Agreement': 'text-blue-500',
      'NDA': 'text-purple-500',
      'Employment': 'text-green-500',
      'Freelance': 'text-orange-500',
      'Partnership': 'text-cyan-500',
      'Other': 'text-gray-500'
    }
    return colors[type] || 'text-gray-500'
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getClientName(contract.clientId).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalValue = filteredContracts
    .filter(c => c.value !== null)
    .reduce((sum, c) => sum + (c.value || 0), 0)

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Contracts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your contracts and agreements</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90 w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              New Contract
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Contract</DialogTitle>
            </DialogHeader>
            <form onSubmit={createContract} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  value={newContract.title}
                  onChange={(e) => setNewContract({ ...newContract, title: e.target.value })}
                  required
                  placeholder="e.g., Web Development Services Contract"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client *</Label>
                  <Select value={newContract.clientId} onValueChange={(value) => setNewContract({ ...newContract, clientId: value })}>
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
                  <Label htmlFor="type">Contract Type *</Label>
                  <Select value={newContract.type} onValueChange={(value) => setNewContract({ ...newContract, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map(type => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newContract.startDate}
                    onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newContract.endDate}
                    onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Contract Value (Optional)</Label>
                  <Input
                    id="value"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newContract.value}
                    onChange={(e) => setNewContract({ ...newContract, value: e.target.value })}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status *</Label>
                  <Select value={newContract.status} onValueChange={(value) => setNewContract({ ...newContract, status: value })}>
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
                <Label htmlFor="content">Contract Content</Label>
                <Textarea
                  id="content"
                  value={newContract.content}
                  onChange={(e) => setNewContract({ ...newContract, content: e.target.value })}
                  rows={6}
                  placeholder="Enter contract terms and conditions..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Contract</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contracts..."
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

      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Contract Value</p>
            <p className="text-2xl font-bold">${totalValue.toFixed(2)}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredContracts.length} contract{filteredContracts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredContracts.map((contract) => (
          <motion.div
            key={contract.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <FileSignature className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg font-semibold truncate">
                    {contract.title}
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Contract
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the contract
                            "{contract.title}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteContract(contract.id)}>
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
                  <Badge className={`${getStatusColor(contract.status)} text-white`}>
                    {contract.status}
                  </Badge>
                  <span className={`text-sm font-medium ${getTypeColor(contract.type)}`}>
                    {contract.type}
                  </span>
                </div>

                <div className="text-sm">
                  <span className="text-muted-foreground">Client: </span>
                  <span className="font-medium">{getClientName(contract.clientId)}</span>
                </div>

                {contract.value !== null && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Value: </span>
                    <span className="font-bold">${contract.value.toFixed(2)}</span>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <div>Start: {new Date(contract.startDate).toLocaleDateString()}</div>
                  {contract.endDate && (
                    <div>End: {new Date(contract.endDate).toLocaleDateString()}</div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t">
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-1 ${contract.signedByUser ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-muted-foreground">You</span>
                  </div>
                  <div className="flex items-center text-xs">
                    <CheckCircle className={`h-3 w-3 mr-1 ${contract.signedByClient ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="text-muted-foreground">Client</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredContracts.length === 0 && (
        <div className="text-center py-12">
          <FileSignature className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No contracts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No contracts match your search.' : 'Create your first contract to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Contract
            </Button>
          )}
        </div>
      )}
    </div>
  )
}