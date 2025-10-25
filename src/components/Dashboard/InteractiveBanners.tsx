'use client';

import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { DollarSign, FileText, Receipt, Calendar, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  revenue: {
    current: number;
    last: number;
    change: number;
  };
  invoices: {
    current: number;
    last: number;
    change: number;
    pending: number;
  };
  expenses: {
    current: number;
    last: number;
    change: number;
  };
  bookings: {
    current: number;
    last: number;
    change: number;
  };
  clients: {
    total: number;
  };
}

const DEFAULT_ANALYTICS: AnalyticsData = {
  revenue: { current: 0, last: 0, change: 0 },
  invoices: { current: 0, last: 0, change: 0, pending: 0 },
  expenses: { current: 0, last: 0, change: 0 },
  bookings: { current: 0, last: 0, change: 0 },
  clients: { total: 0 }
};

export function InteractiveBanners() {
  const router = useRouter();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('bearer_token');
        const response = await fetch('/api/core/analytics', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          console.error('Analytics API returned error:', response.status);
          return DEFAULT_ANALYTICS;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error('Analytics API did not return JSON');
          return DEFAULT_ANALYTICS;
        }
        
        const result = await response.json();
        
        // Ensure all nested properties exist with defaults
        return {
          revenue: result?.revenue || DEFAULT_ANALYTICS.revenue,
          invoices: result?.invoices || DEFAULT_ANALYTICS.invoices,
          expenses: result?.expenses || DEFAULT_ANALYTICS.expenses,
          bookings: result?.bookings || DEFAULT_ANALYTICS.bookings,
          clients: result?.clients || DEFAULT_ANALYTICS.clients
        };
      } catch (err) {
        console.error('Analytics fetch error:', err);
        return DEFAULT_ANALYTICS;
      }
    },
    retry: false,
    refetchInterval: false,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="glass-effect">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted animate-pulse rounded mb-2" />
              <div className="h-3 w-40 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const analyticsData: AnalyticsData = {
    revenue: data?.revenue || DEFAULT_ANALYTICS.revenue,
    invoices: data?.invoices || DEFAULT_ANALYTICS.invoices,
    expenses: data?.expenses || DEFAULT_ANALYTICS.expenses,
    bookings: data?.bookings || DEFAULT_ANALYTICS.bookings,
    clients: data?.clients || DEFAULT_ANALYTICS.clients
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const formatChange = (change: number) => {
    const safeChange = change || 0;
    const isPositive = safeChange > 0;
    const Icon = isPositive ? TrendingUp : TrendingDown;
    const color = isPositive ? 'text-green-500' : 'text-red-500';
    
    return (
      <div className={`flex items-center gap-1 ${color}`}>
        <Icon className="h-3 w-3" />
        <span className="text-xs font-medium">
          {Math.abs(safeChange).toFixed(1)}%
        </span>
      </div>
    );
  };

  const bannerData = [
    {
      id: 'revenue',
      title: 'Monthly Revenue',
      value: formatCurrency(analyticsData.revenue.current),
      change: analyticsData.revenue.change,
      icon: DollarSign,
      iconColor: 'text-green-500',
      subtitle: `${formatChange(analyticsData.revenue.change)} vs last month`,
      detailTitle: 'Revenue Details',
      details: [
        { label: 'Current Month', value: formatCurrency(analyticsData.revenue.current) },
        { label: 'Last Month', value: formatCurrency(analyticsData.revenue.last) },
        { label: 'Change', value: `${(analyticsData.revenue.change || 0).toFixed(1)}%` },
      ],
      route: '/insights'
    },
    {
      id: 'invoices',
      title: 'Monthly Invoices',
      value: (analyticsData.invoices.current || 0).toString(),
      change: analyticsData.invoices.change,
      icon: FileText,
      iconColor: 'text-orange-500',
      subtitle: `${analyticsData.invoices.pending || 0} pending • ${formatChange(analyticsData.invoices.change)}`,
      detailTitle: 'Invoice Breakdown',
      details: [
        { label: 'This Month', value: analyticsData.invoices.current || 0 },
        { label: 'Last Month', value: analyticsData.invoices.last || 0 },
        { label: 'Pending', value: analyticsData.invoices.pending || 0 },
        { label: 'Change', value: `${(analyticsData.invoices.change || 0).toFixed(1)}%` },
      ],
      route: '/invoices'
    },
    {
      id: 'expenses',
      title: 'Monthly Expenses',
      value: formatCurrency(analyticsData.expenses.current),
      change: analyticsData.expenses.change,
      icon: Receipt,
      iconColor: 'text-red-500',
      subtitle: `${formatChange(analyticsData.expenses.change)} vs last month`,
      detailTitle: 'Expense Details',
      details: [
        { label: 'Current Month', value: formatCurrency(analyticsData.expenses.current) },
        { label: 'Last Month', value: formatCurrency(analyticsData.expenses.last) },
        { label: 'Change', value: `${(analyticsData.expenses.change || 0).toFixed(1)}%` },
      ],
      route: '/receipts'
    },
    {
      id: 'bookings',
      title: 'Monthly Bookings',
      value: (analyticsData.bookings.current || 0).toString(),
      change: analyticsData.bookings.change,
      icon: Calendar,
      iconColor: 'text-blue-500',
      subtitle: `${formatChange(analyticsData.bookings.change)} vs last month`,
      detailTitle: 'Booking Details',
      details: [
        { label: 'This Month', value: analyticsData.bookings.current || 0 },
        { label: 'Last Month', value: analyticsData.bookings.last || 0 },
        { label: 'Total Clients', value: analyticsData.clients.total || 0 },
        { label: 'Change', value: `${(analyticsData.bookings.change || 0).toFixed(1)}%` },
      ],
      route: '/calendar'
    },
  ];

  const selectedBanner = bannerData.find(b => b.id === selectedMetric);

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {bannerData.map((banner, index) => (
          <motion.div
            key={banner.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              className="glass-effect hover:shadow-lg transition-all duration-300 cursor-pointer group"
              onClick={() => setSelectedMetric(banner.id)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{banner.title}</CardTitle>
                <banner.icon className={`h-4 w-4 ${banner.iconColor} group-hover:scale-110 transition-transform`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{banner.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {banner.subtitle}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selectedMetric} onOpenChange={() => setSelectedMetric(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedBanner && <selectedBanner.icon className={`h-5 w-5 ${selectedBanner.iconColor}`} />}
              {selectedBanner?.detailTitle}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBanner?.details.map((detail, idx) => (
              <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0">
                <span className="text-sm font-medium text-muted-foreground">{detail.label}</span>
                <span className="text-sm font-bold">{detail.value}</span>
              </div>
            ))}
            <button
              onClick={() => {
                setSelectedMetric(null);
                router.push(selectedBanner?.route || '/');
              }}
              className="w-full mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
            >
              View Full Details →
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}