import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface LineItem {
  id: string;
  type: 'product' | 'service';
  itemId: number | null;
  name: string;
  description: string;
  quantity: number;
  price: number;
  total: number;
}

interface Invoice {
  id: number;
  clientId: number;
  userId: string;
  items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: string;
  dueDate: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

const fetchInvoices = async (): Promise<Invoice[]> => {
  const token = localStorage.getItem('bearer_token');
  if (!token) throw new Error('Authentication required');
  
  const response = await fetch('/api/lumenr/invoices', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch invoices');
  
  const result = await response.json();
  const data = result.data || result;
  
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format');
  }
  
  return data;
};

export function useInvoices() {
  return useQuery({
    queryKey: ['invoices'],
    queryFn: fetchInvoices,
    staleTime: 3 * 60 * 1000,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newInvoice: Partial<Invoice>) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newInvoice)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create invoice');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Invoice> }) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/invoices?id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update invoice');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (invoiceId: number) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/invoices?id=${invoiceId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete invoice');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      toast.success('Invoice deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}
