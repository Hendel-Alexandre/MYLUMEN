import { useQuery } from '@tanstack/react-query';

interface BusinessMetrics {
  totalRevenue: number;
  totalInvoices: number;
  totalClients: number;
  totalExpenses: number;
  pendingInvoices: number;
  overdueInvoices: number;
  revenueChange: number;
  invoiceChange: number;
  clientChange: number;
  expenseChange: number;
}

interface WeeklyData {
  day: string;
  revenue: number;
  expenses: number;
}

interface WeeklyExpense {
  day: string;
  amount: number;
}

interface QuoteStatus {
  status: string;
  count: number;
}

interface Activity {
  type: string;
  id: number;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

interface Insight {
  type: string;
  title: string;
  description: string;
  action: string;
}

interface AnalyticsData {
  metrics: BusinessMetrics;
  weeklyData: WeeklyData[];
  weeklyExpenses: WeeklyExpense[];
  quoteStatusData: QuoteStatus[];
  activity: Activity[];
  insights: Insight[];
}

const fetchAnalytics = async (): Promise<AnalyticsData> => {
  const token = localStorage.getItem('bearer_token');
  const response = await fetch('/api/lumenr/analytics', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) throw new Error('Failed to load analytics');
  
  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Failed to load analytics');
  }
  
  return result.data;
};

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
