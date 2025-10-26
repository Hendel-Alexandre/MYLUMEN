'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Receipt, Calendar, DollarSign, User, FileText, Image as ImageIcon, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

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
}

export default function ReceiptDetailModal({ receipt, clientName, isOpen, onClose }: ReceiptDetailModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

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
          {receipt.imageUrl && !imageError && (
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
          )}

          {receipt.imageUrl && imageError && (
            <div className="rounded-lg border border-dashed border-border p-12 text-center bg-muted/50">
              <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Image could not be loaded</p>
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
