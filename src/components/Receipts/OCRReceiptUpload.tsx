'use client';

import { useState, useRef } from 'react';
import { Upload, FileImage, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { processReceiptImage, ExtractedReceiptData } from '@/lib/utils/ocr-processor';

interface OCRReceiptUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: string[];
}

export default function OCRReceiptUpload({ isOpen, onClose, onSuccess, categories }: OCRReceiptUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [editableData, setEditableData] = useState({
    vendor: '',
    amount: '',
    date: '',
    category: 'Other',
    currency: 'USD',
    notes: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    
    setIsProcessing(true);
    setOcrProgress(0);
    try {
      const extracted = await processReceiptImage(file, (progress) => {
        setOcrProgress(Math.round(progress * 100));
      });
      setExtractedData(extracted);
      
      setEditableData({
        vendor: extracted.vendor,
        amount: extracted.amount?.toString() || '',
        date: extracted.date || new Date().toISOString().split('T')[0],
        category: extracted.category,
        currency: 'USD',
        notes: ''
      });

      toast.success('Receipt processed successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to process receipt');
      console.error('OCR Error:', error);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editableData.vendor || !editableData.amount || !editableData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const token = localStorage.getItem('bearer_token');
      const amount = parseFloat(editableData.amount);

      if (isNaN(amount) || amount <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }

      const response = await fetch('/api/lumenr/receipts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          vendor: editableData.vendor,
          category: editableData.category,
          amount,
          currency: editableData.currency,
          date: editableData.date,
          notes: editableData.notes || null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create receipt');
      }

      toast.success('Receipt saved successfully!');
      resetForm();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save receipt');
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setOcrProgress(0);
    setEditableData({
      vendor: '',
      amount: '',
      date: '',
      category: 'Other',
      currency: 'USD',
      notes: ''
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Scan Receipt with OCR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!selectedFile ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors"
            >
              <FileImage className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">Drop receipt image here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP (max 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                {previewUrl && (
                  <div className="w-48 h-48 flex-shrink-0 rounded-lg overflow-hidden border border-border">
                    <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-cover" />
                  </div>
                )}

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <FileImage className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm font-medium truncate">{selectedFile.name}</span>
                  </div>
                  
                  {isProcessing && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing with OCR... {ocrProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${ocrProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {extractedData && !isProcessing && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm">Data extracted successfully!</span>
                    </div>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetForm();
                    }}
                  >
                    Choose Different Image
                  </Button>
                </div>
              </div>

              {extractedData && !isProcessing && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-muted/50 p-4 rounded-lg border border-border">
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Review and edit the extracted data:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="vendor">Vendor *</Label>
                      <Input
                        id="vendor"
                        value={editableData.vendor}
                        onChange={(e) => setEditableData(prev => ({ ...prev, vendor: e.target.value }))}
                        placeholder="Enter vendor name"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={editableData.date}
                        onChange={(e) => setEditableData(prev => ({ ...prev, date: e.target.value }))}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={editableData.amount}
                        onChange={(e) => setEditableData(prev => ({ ...prev, amount: e.target.value }))}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="currency">Currency *</Label>
                      <Select
                        value={editableData.currency}
                        onValueChange={(value) => setEditableData(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="CAD">CAD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="AUD">AUD ($)</SelectItem>
                          <SelectItem value="NZD">NZD ($)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={editableData.category}
                        onValueChange={(value) => setEditableData(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={editableData.notes}
                      onChange={(e) => setEditableData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Add any additional notes..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      Save Receipt
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
