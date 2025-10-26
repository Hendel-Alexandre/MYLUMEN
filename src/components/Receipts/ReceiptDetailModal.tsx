'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Receipt, Calendar, DollarSign, User, FileText, Image as ImageIcon, Download, Upload, Loader2 } from 'lucide-react';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { uploadReceiptImage } from '@/lib/receipt-storage';
import { useAuth } from '@/contexts/AuthContext';

interface ReceiptDetailModalProps {
  receipt: {
    id: number;
    vendor: string;
    category: string;
    amount: number;
    currency: string;
    date: string;
    notes: string | null;
    type: 'expense' | 'client';
    clientId: number | null;
    imageUrl: string | null;
    createdAt: string;
    updatedAt: string;
  };
  clientName?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export default function ReceiptDetailModal({ receipt, clientName, isOpen, onClose, onUpdate }: ReceiptDetailModalProps) {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Office Supplies': 'bg-blue-500',
      'Travel': 'bg-purple-500',
      'Meals': 'bg-orange-500',
      'Software': 'bg-cyan-500',
      'Marketing': 'bg-pink-500',
      'Utilities': 'bg-green-500',
      'Other': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = async () => {
    if (!receipt.imageUrl) return;

    try {
      const response = await fetch(receipt.imageUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch image');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `receipt-${receipt.vendor}-${receipt.date}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Receipt image downloaded');
    } catch (error) {
      toast.error('Failed to download image');
      console.error('Download error:', error);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image must be less than 10MB');
      return;
    }

    // Validate authentication
    const token = localStorage.getItem('bearer_token');
    if (!token) {
      toast.error('Authentication required. Please log in again.');
      return;
    }
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    // All validations passed, start upload
    setIsUploading(true);
    const toastId = toast.loading('Uploading receipt image...');

    try {
      const userId = user.id;

      const uploadResult = await uploadReceiptImage({
        file: file,
        userId: userId,
        fileName: file.name
      });

      if (!uploadResult.success) {
        toast.dismiss(toastId);
        toast.error(uploadResult.error || 'Failed to upload image');
        return;
      }

      const imageUrl = uploadResult.publicUrl || null;

      const response = await fetch(`/api/lumenr/receipts?id=${receipt.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          imageUrl: imageUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update receipt');
      }

      toast.dismiss(toastId);
      toast.success('Receipt image updated successfully!');
      setImageError(false);
      setImageLoading(true);
      
      if (onUpdate) {
        onUpdate();
      }
      
      onClose();

    } catch (error: any) {
      toast.dismiss(toastId);
      toast.error(error.message || 'Failed to update receipt image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Receipt className="w-6 h-6 text-primary" />
            Receipt Details
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {receipt.imageUrl && !imageError ? (
            <div className="space-y-3">
              <div className="relative rounded-lg overflow-hidden border border-border bg-muted">
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                )}
                <img
                  src={receipt.imageUrl}
                  alt={`Receipt from ${receipt.vendor}`}
                  className="w-full max-h-[400px] object-contain"
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageError(true);
                    setImageLoading(false);
                  }}
                />
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={handleDownload} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <Button 
                  onClick={() => fileInputRef.current?.click()} 
                  variant="outline" 
                  size="sm"
                  className="flex-1"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Update Image
                    </>
                  )}
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-lg border border-dashed border-border p-12 text-center bg-muted/50">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">
                  {imageError ? 'Image could not be loaded' : 'No image attached'}
                </p>
              </div>
              <Button 
                onClick={() => fileInputRef.current?.click()} 
                variant="outline" 
                size="sm"
                className="w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Attach Image
                  </>
                )}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Vendor</label>
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-muted-foreground" />
                  <span className="text-lg font-semibold">{receipt.vendor}</span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Amount</label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span className="text-2xl font-bold">
                    {Number(receipt.amount || 0).toFixed(2)} {receipt.currency}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Date</label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-base">{formatDate(receipt.date)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Category</label>
                <Badge className={`${getCategoryColor(receipt.category)} text-white`}>
                  {receipt.category}
                </Badge>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Type</label>
                <Badge variant="outline">
                  {receipt.type === 'expense' ? 'My Expense' : 'Client Receipt'}
                </Badge>
              </div>

              {receipt.type === 'client' && clientName && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-1 block">Client</label>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-base font-medium">{clientName}</span>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">Currency</label>
                <span className="text-base">{receipt.currency}</span>
              </div>
            </div>
          </div>

          {receipt.notes && (
            <div className="pt-4 border-t">
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </label>
              <p className="text-base text-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                {receipt.notes}
              </p>
            </div>
          )}

          <div className="pt-4 border-t text-xs text-muted-foreground space-y-1">
            <p>Created: {formatDate(receipt.createdAt)}</p>
            <p>Last updated: {formatDate(receipt.updatedAt)}</p>
            <p>Receipt ID: #{receipt.id}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
