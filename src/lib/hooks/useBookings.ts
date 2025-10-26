import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface Booking {
  id: number;
  clientId: number;
  userId: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  clientEmail?: string;
}

interface UseBookingsOptions {
  startDate?: string;
  endDate?: string;
  status?: string;
  clientId?: number;
}

export function useBookings(options: UseBookingsOptions = {}) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.startDate) params.append('startDate', options.startDate);
      if (options.endDate) params.append('endDate', options.endDate);
      if (options.status) params.append('status', options.status);
      if (options.clientId) params.append('clientId', options.clientId.toString());

      const response = await fetch(`/api/lumenr/bookings?${params.toString()}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch bookings');
      }

      const data = await response.json();
      setBookings(data.data || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch bookings';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [options.startDate, options.endDate, options.status, options.clientId, toast]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (data: Omit<Booking, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'clientName' | 'clientEmail'>) => {
    try {
      const response = await fetch('/api/lumenr/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create booking');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Booking created successfully',
      });

      await fetchBookings();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create booking';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const updateBooking = async (id: number, data: Partial<Omit<Booking, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'clientName' | 'clientEmail'>>) => {
    try {
      const response = await fetch(`/api/lumenr/bookings?id=${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update booking');
      }

      const result = await response.json();
      
      toast({
        title: 'Success',
        description: 'Booking updated successfully',
      });

      await fetchBookings();
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update booking';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteBooking = async (id: number) => {
    try {
      const response = await fetch(`/api/lumenr/bookings?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete booking');
      }

      toast({
        title: 'Success',
        description: 'Booking deleted successfully',
      });

      await fetchBookings();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete booking';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    bookings,
    isLoading,
    error,
    refetch: fetchBookings,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
