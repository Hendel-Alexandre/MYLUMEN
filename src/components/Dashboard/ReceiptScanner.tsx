import { useState } from 'react'
import { Upload, Scan, CheckCircle, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { apiPost } from '@/lib/api'

interface ScannedData {
  vendor: string
  total: number
  date: string
  currency: string
  category: string
  confidence: number
}

export const ReceiptScanner = () => {
  const [file, setFile] = useState<File | null>(null)
  const [scanning, setScanning] = useState(false)
  const [scannedData, setScannedData] = useState<ScannedData | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setScannedData(null)
    }
  }

  const handleScan = async () => {
    if (!file) {
      toast({
        title: 'No File Selected',
        description: 'Please select a receipt image to scan',
        variant: 'destructive'
      })
      return
    }

    setScanning(true)

    try {
      // Simulate OCR processing with delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Mock OCR response - integrate with real OCR service later
      const mockData: ScannedData = {
        vendor: 'Office Supplies Co.',
        total: 247.50,
        date: new Date().toISOString().split('T')[0],
        currency: 'USD',
        category: 'Office Supplies',
        confidence: 92
      }

      setScannedData(mockData)

      toast({
        title: 'Scan Complete',
        description: 'Receipt data extracted successfully'
      })
    } catch (error) {
      toast({
        title: 'Scan Failed',
        description: 'Failed to scan receipt. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setScanning(false)
    }
  }

  const handleSave = async () => {
    if (!scannedData) return

    const { ok } = await apiPost('/api/core/receipts', scannedData)

    if (ok) {
      toast({
        title: 'Receipt Saved',
        description: 'Receipt has been added to your records'
      })

      // Reset form
      setFile(null)
      setScannedData(null)
    } else {
      toast({
        title: 'Save Failed',
        description: 'Failed to save receipt. Please try again.',
        variant: 'destructive'
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scan className="h-5 w-5" />
          AI Receipt Scanner
        </CardTitle>
        <CardDescription>
          Upload a receipt image and we'll automatically extract the data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="receipt-file">Receipt Image</Label>
          <Input
            id="receipt-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          {file && (
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {!scannedData && (
          <Button
            onClick={handleScan}
            disabled={!file || scanning}
            className="w-full"
          >
            {scanning ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4 mr-2" />
                Scan Receipt
              </>
            )}
          </Button>
        )}

        {scannedData && (
          <div className="space-y-4 p-4 bg-accent/50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Scanned Data</h4>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                {scannedData.confidence}% confidence
              </Badge>
            </div>

            <div className="space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Vendor</Label>
                <p className="font-medium">{scannedData.vendor}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Total</Label>
                  <p className="font-medium">
                    {scannedData.currency} ${scannedData.total.toFixed(2)}
                  </p>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(scannedData.date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Category</Label>
                <p className="font-medium">{scannedData.category}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Save Receipt
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setScannedData(null)
                  setFile(null)
                }}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              You can edit the extracted data before saving
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p className="font-medium">Supported formats:</p>
          <ul className="space-y-0.5 pl-4">
            <li>• JPG, PNG, PDF</li>
            <li>• Clear, well-lit images work best</li>
            <li>• Ensure text is readable</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}