'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { generateReceiptTemplate, parseReceiptExcel, ReceiptImportRow } from '@/lib/utils/receipt-excel-import'
import { Upload, Download, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { toast } from 'sonner'

interface ReceiptExcelImportProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImportSuccess: () => void
}

export function ReceiptExcelImport({ open, onOpenChange, onImportSuccess }: ReceiptExcelImportProps) {
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<any>(null)

  const handleDownloadTemplate = () => {
    generateReceiptTemplate()
    toast.success('Template downloaded successfully')
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        toast.error('Please upload an Excel file (.xlsx or .xls)')
        return
      }
      setImportFile(file)
      setImportResult(null)
    }
  }

  const handleImport = async () => {
    if (!importFile) {
      toast.error('Please select a file to import')
      return
    }

    setImporting(true)
    setImportResult(null)

    try {
      const result = await parseReceiptExcel(importFile)

      if (!result.success) {
        const errorList = result.errors?.map(err => {
          const match = err.match(/^Row (\d+): (.+)$/);
          if (match) {
            return { row: parseInt(match[1]), error: match[2] };
          }
          return { row: 0, error: err };
        }) || []
        
        setImportResult({
          success: false,
          successful: 0,
          failed: result.errors?.length || 0,
          errors: errorList,
          total: result.rowCount || 0
        })
        toast.error(`Found ${result.errors?.length || 0} validation errors in the Excel file`)
        return
      }

      const token = localStorage.getItem('bearer_token')
      const response = await fetch('/api/lumenr/receipts/bulk-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ receipts: result.data })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to import receipts')
      }

      const data = await response.json()
      
      setImportResult({
        success: true,
        successful: data.data.successful || 0,
        failed: data.data.failed || 0,
        errors: data.data.errors || [],
        total: data.data.totalProcessed || 0
      })

      if (data.data.successful > 0) {
        toast.success(`Successfully imported ${data.data.successful} receipts`)
        onImportSuccess()
        
        if (data.data.failed === 0) {
          setTimeout(() => {
            handleClose()
          }, 1500)
        }
      }

      if (data.data.failed > 0) {
        toast.error(`Failed to import ${data.data.failed} receipts`)
      }

    } catch (error: any) {
      console.error('Import error:', error)
      setImportResult({
        success: false,
        successful: 0,
        failed: 0,
        errors: [{ row: 0, error: error.message || 'An unexpected error occurred' }],
        total: 0
      })
      toast.error(error.message || 'Failed to import receipts')
    } finally {
      setImporting(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    setImportFile(null)
    setImportResult(null)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Import Receipts from Excel</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <FileSpreadsheet className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-blue-900 mb-1">Step 1: Download Template</h4>
                <p className="text-xs text-blue-700 mb-3">
                  Download the Excel template with sample data and proper column headers.
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                  className="border-blue-300 hover:bg-blue-100"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Upload className="h-5 w-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium text-green-900 mb-1">Step 2: Upload Your File</h4>
                <p className="text-xs text-green-700 mb-3">
                  Upload your completed Excel file with receipt data.
                </p>
                <div className="space-y-3">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"
                    disabled={importing}
                  />
                  {importFile && (
                    <p className="text-xs text-gray-600">
                      Selected: <span className="font-medium">{importFile.name}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {importResult && (
            <div className="space-y-2">
              {importResult.successful > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Successfully imported <strong>{importResult.successful}</strong> out of {importResult.total} receipts!
                  </AlertDescription>
                </Alert>
              )}
              
              {importResult.failed > 0 && importResult.errors && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <p className="font-medium mb-2">Failed to import {importResult.failed} receipts:</p>
                    <ul className="text-xs space-y-1 max-h-40 overflow-y-auto">
                      {importResult.errors.map((error: any, index: number) => (
                        <li key={index}>Row {error.row}: {error.error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {!importResult.success && importResult.errors && !importResult.total && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <ul className="text-xs space-y-1">
                      {importResult.errors.map((error: any, index: number) => (
                        <li key={index}>{error.error || error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={importing}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!importFile || importing}
            >
              {importing ? 'Importing...' : 'Import Receipts'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
