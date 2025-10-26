'use client';

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Calendar, Filter, FolderOpen, Receipt as ReceiptIcon, FileSignature, DollarSign } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface Document {
  id: number
  type: 'quote' | 'invoice' | 'receipt' | 'contract'
  title: string
  clientName?: string
  amount?: number
  date: string
  pdfUrl?: string
  status?: string
}

interface TaxSummary {
  month: string
  totalRevenue: number
  totalExpenses: number
  totalTax: number
  documentCount: number
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [taxSummaries, setTaxSummaries] = useState<TaxSummary[]>([])
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString())
  const [selectedMonth, setSelectedMonth] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
    calculateTaxSummaries()
  }, [documents, selectedYear, selectedMonth, selectedType])

  const loadDocuments = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) return

      // Load all document types in parallel
      const [quotesRes, invoicesRes, receiptsRes, contractsRes] = await Promise.all([
        fetch('/api/lumenr/quotes', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/lumenr/invoices', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/lumenr/receipts', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/lumenr/contracts', { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      const [quotesData, invoicesData, receiptsData, contractsData] = await Promise.all([
        quotesRes.ok ? quotesRes.json() : { data: [] },
        invoicesRes.ok ? invoicesRes.json() : { data: [] },
        receiptsRes.ok ? receiptsRes.json() : { data: [] },
        contractsRes.ok ? contractsRes.json() : { data: [] }
      ])

      // Transform and combine all documents
      const allDocs: Document[] = [
        ...(quotesData.data || []).filter((q: any) => q.pdfUrl).map((q: any) => ({
          id: q.id,
          type: 'quote' as const,
          title: `Quote #${q.id}`,
          clientName: q.client?.name,
          amount: parseFloat(q.total || 0),
          date: q.createdAt,
          pdfUrl: q.pdfUrl,
          status: q.status
        })),
        ...(invoicesData.data || []).filter((i: any) => i.pdfUrl).map((i: any) => ({
          id: i.id,
          type: 'invoice' as const,
          title: `Invoice #${i.id}`,
          clientName: i.client?.name,
          amount: parseFloat(i.total || 0),
          date: i.createdAt,
          pdfUrl: i.pdfUrl,
          status: i.status
        })),
        ...(receiptsData.data || []).filter((r: any) => r.imageUrl).map((r: any) => ({
          id: r.id,
          type: 'receipt' as const,
          title: `Receipt - ${r.vendor}`,
          amount: parseFloat(r.amount || 0),
          date: r.date,
          pdfUrl: r.imageUrl,
          status: 'processed'
        })),
        ...(contractsData.data || []).filter((c: any) => c.pdfUrl).map((c: any) => ({
          id: c.id,
          type: 'contract' as const,
          title: c.title,
          clientName: c.client?.name,
          amount: parseFloat(c.value || 0),
          date: c.createdAt,
          pdfUrl: c.pdfUrl,
          status: c.status
        }))
      ]

      // Sort by date descending
      allDocs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      
      setDocuments(allDocs)
    } catch (error) {
      console.error('Failed to load documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const filterDocuments = () => {
    let filtered = documents

    // Filter by year
    filtered = filtered.filter(doc => {
      const docYear = new Date(doc.date).getFullYear().toString()
      return docYear === selectedYear
    })

    // Filter by month
    if (selectedMonth !== 'all') {
      filtered = filtered.filter(doc => {
        const docMonth = new Date(doc.date).getMonth()
        return docMonth === parseInt(selectedMonth)
      })
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType)
    }

    setFilteredDocuments(filtered)
  }

  const calculateTaxSummaries = () => {
    const summaries: Map<string, TaxSummary> = new Map()

    documents.filter(doc => new Date(doc.date).getFullYear().toString() === selectedYear).forEach(doc => {
      const date = new Date(doc.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

      if (!summaries.has(monthKey)) {
        summaries.set(monthKey, {
          month: monthName,
          totalRevenue: 0,
          totalExpenses: 0,
          totalTax: 0,
          documentCount: 0
        })
      }

      const summary = summaries.get(monthKey)!
      summary.documentCount++

      if (doc.type === 'invoice' && doc.amount) {
        summary.totalRevenue += doc.amount
        // Estimate tax at 13% (can be made configurable)
        summary.totalTax += doc.amount * 0.13
      } else if (doc.type === 'receipt' && doc.amount) {
        summary.totalExpenses += doc.amount
      }
    })

    const sortedSummaries = Array.from(summaries.values()).sort((a, b) => {
      return b.month.localeCompare(a.month)
    })

    setTaxSummaries(sortedSummaries)
  }

  const handleDownload = async (doc: Document) => {
    if (!doc.pdfUrl) {
      toast.error('Document URL not available')
      return
    }

    try {
      // Open in new tab for now - can be enhanced with actual download
      window.open(doc.pdfUrl, '_blank')
      toast.success('Document opened in new tab')
    } catch (error) {
      toast.error('Failed to open document')
    }
  }

  const handleExportAll = () => {
    toast.info('Export functionality coming soon!')
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'quote': return FileSignature
      case 'invoice': return FileText
      case 'receipt': return ReceiptIcon
      case 'contract': return FileText
      default: return FileText
    }
  }

  const years = Array.from(new Set(documents.map(d => new Date(d.date).getFullYear().toString())))
  const currentYearDocs = years.includes(new Date().getFullYear().toString()) ? years : [new Date().getFullYear().toString(), ...years]

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
            <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8" />
            Tax & Documents
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">
            Centralized document management and tax summaries
          </p>
        </div>
        <Button onClick={handleExportAll} className="gap-2">
          <Download className="h-4 w-4" />
          Export All
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Year</label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentYearDocs.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Month</label>
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {new Date(2025, i).toLocaleDateString('en-US', { month: 'long' })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="quote">Quotes</SelectItem>
                    <SelectItem value="invoice">Invoices</SelectItem>
                    <SelectItem value="receipt">Receipts</SelectItem>
                    <SelectItem value="contract">Contracts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tax Summaries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Tax Summary for {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {taxSummaries.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No data for this period</p>
            ) : (
              <div className="space-y-4">
                {taxSummaries.map((summary, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
                    <div>
                      <p className="font-medium">{summary.month}</p>
                      <p className="text-sm text-muted-foreground">{summary.documentCount} documents</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Revenue</p>
                      <p className="font-semibold text-green-600 dark:text-green-400">
                        ${summary.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Expenses</p>
                      <p className="font-semibold text-red-600 dark:text-red-400">
                        ${summary.totalExpenses.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Est. Tax</p>
                      <p className="font-semibold">
                        ${summary.totalTax.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Documents List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents ({filteredDocuments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Loading documents...</p>
            ) : filteredDocuments.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No documents found for the selected filters
              </p>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => {
                  const Icon = getDocumentIcon(doc.type)
                  return (
                    <div
                      key={`${doc.type}-${doc.id}`}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{doc.title}</p>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span>{new Date(doc.date).toLocaleDateString()}</span>
                            {doc.clientName && <span>• {doc.clientName}</span>}
                            {doc.amount && <span>• ${doc.amount.toFixed(2)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                          {doc.type}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(doc)}
                          className="gap-2"
                        >
                          <Download className="h-4 w-4" />
                          View
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
