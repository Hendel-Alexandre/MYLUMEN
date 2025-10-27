import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Client {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  taxId: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  country: string | null;
  taxRate: string | null;
  autoCalculateTax: boolean | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const fetchClients = async (): Promise<Client[]> => {
  const token = localStorage.getItem('bearer_token');
  const response = await fetch('/api/lumenr/clients', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  
  if (!response.ok) throw new Error('Failed to fetch clients');
  
  const result = await response.json();
  const data = result.success ? result.data : result;
  
  if (!Array.isArray(data)) {
    throw new Error('Invalid response format');
  }
  
  return data;
};

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newClient: Partial<Client>) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/clients', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create client');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Client> }) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/clients?id=${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update client');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clientId: number) => {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch(`/api/lumenr/clients?id=${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete client');
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    }
  });
}
