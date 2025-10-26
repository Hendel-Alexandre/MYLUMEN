'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Search, Receipt, MoreHorizontal, Edit, Trash2, Upload, DollarSign, Calendar, Scan } from 'lucide-react'
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
import OCRReceiptUpload from '@/components/Receipts/OCRReceiptUpload'

interface ReceiptItem {
  id: number
  userId: string
  vendor: string
  category: string
  amount: number
  currency: string
  date: string
  description: string | null
  imageUrl: string | null
  createdAt: string
  updatedAt: string
}

const CATEGORIES = ['Office Supplies', 'Travel', 'Meals', 'Software', 'Marketing', 'Utilities', 'Other']

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<ReceiptItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isOCRDialogOpen, setIsOCRDialogOpen] = useState(false)
  const [newReceipt, setNewReceipt] = useState({
    vendor: '',
    category: 'Office Supplies',
    amount: '',
    currency: 'USD',
    date: new Date().toISOString().split('T')[0],
    description: ''
  })

  const fetchReceipts = async () => {
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch('/api/lumenr/receipts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch receipts')
      }
      
      const result = await response.json()
      const data = result.success ? result.data : result
      setReceipts(Array.isArray(data) ? data : [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch receipts')
      setReceipts([])
    } finally {
      setLoading(false)
    }
  }

  const createReceipt = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const token = localStorage.getItem('bearer_token')
      const amount = parseFloat(newReceipt.amount)

      const response = await fetch('/api/lumenr/receipts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor: newReceipt.vendor,
          category: newReceipt.category,
          amount,
          currency: newReceipt.currency,
          date: newReceipt.date,
          description: newReceipt.description || null
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create receipt')
      }

      toast.success('Receipt created successfully')

      setNewReceipt({
        vendor: '',
        category: 'Office Supplies',
        amount: '',
        currency: 'USD',
        date: new Date().toISOString().split('T')[0],
        description: ''
      })
      setIsDialogOpen(false)
      fetchReceipts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const deleteReceipt = async (receiptId: number) => {
    try {
      const token = localStorage.getItem('bearer_token')
      const response = await fetch(`/api/lumenr/receipts?id=${receiptId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to delete receipt')
      }

      toast.success('Receipt deleted successfully')
      fetchReceipts()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    fetchReceipts()
  }, [])

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Office Supplies': 'bg-blue-500',
      'Travel': 'bg-purple-500',
      'Meals': 'bg-orange-500',
      'Software': 'bg-cyan-500',
      'Marketing': 'bg-pink-500',
      'Utilities': 'bg-green-500',
      'Other': 'bg-gray-500'
    }
    return colors[category] || 'bg-gray-500'
  }

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === 'all' || receipt.category === categoryFilter

    return matchesSearch && matchesCategory
  })

  const totalExpenses = filteredReceipts.reduce((sum, r) => sum + r.amount, 0)

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
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Receipts</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Manage your receipts and expenses</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setIsOCRDialogOpen(true)}
            variant="outline"
            className="flex-1 sm:flex-initial"
          >
            <Scan className="h-4 w-4 mr-2" />
            Scan Receipt
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 flex-1 sm:flex-initial">
                <Plus className="h-4 w-4 mr-2" />
                New Receipt
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Receipt</DialogTitle>
            </DialogHeader>
            <form onSubmit={createReceipt} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor">Vendor *</Label>
                  <Input
                    id="vendor"
                    value={newReceipt.vendor}
                    onChange={(e) => setNewReceipt({ ...newReceipt, vendor: e.target.value })}
                    required
                    placeholder="e.g., Amazon, Starbucks"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={newReceipt.category} onValueChange={(value) => setNewReceipt({ ...newReceipt, category: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newReceipt.amount}
                    onChange={(e) => setNewReceipt({ ...newReceipt, amount: e.target.value })}
                    required
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={newReceipt.currency}
                    onChange={(e) => setNewReceipt({ ...newReceipt, currency: e.target.value })}
                    placeholder="USD"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newReceipt.date}
                    onChange={(e) => setNewReceipt({ ...newReceipt, date: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newReceipt.description}
                  onChange={(e) => setNewReceipt({ ...newReceipt, description: e.target.value })}
                  rows={3}
                  placeholder="Additional details about the expense..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Receipt</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search receipts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs value={categoryFilter} onValueChange={setCategoryFilter} className="w-full sm:w-auto">
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            {CATEGORIES.map(cat => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-4 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total Expenses</p>
            <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.map((receipt) => (
          <motion.div
            key={receipt.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="h-full"
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <Receipt className="h-5 w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-lg font-semibold truncate">
                    {receipt.vendor}
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
                          Delete Receipt
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the receipt
                            from "{receipt.vendor}".
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteReceipt(receipt.id)}>
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
                  <Badge className={`${getCategoryColor(receipt.category)} text-white`}>
                    {receipt.category}
                  </Badge>
                  <span className="text-lg font-bold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {receipt.amount.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(receipt.date).toLocaleDateString()}
                </div>

                {receipt.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 pt-2 border-t">
                    {receipt.description}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredReceipts.length === 0 && (
        <div className="text-center py-12">
          <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No receipts found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? 'No receipts match your search.' : 'Create your first receipt to get started.'}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Receipt
            </Button>
          )}
        </div>
      )}

      <OCRReceiptUpload
        isOpen={isOCRDialogOpen}
        onClose={() => setIsOCRDialogOpen(false)}
        onSuccess={fetchReceipts}
        categories={CATEGORIES}
      />
    </div>
  )
}