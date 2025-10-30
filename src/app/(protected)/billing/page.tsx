'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, DollarSign, 
  CheckCircle2, Clock, XCircle 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Invoice {
  id: number;
  clientId: number;
  total: string;
  status: string;
  dueDate: string | null;
  createdAt: string;
}

interface Payment {
  id: number;
  invoiceId: number;
  method: string;
  amount: string;
  currency: string;
  processedAt: string;
}

interface BillingStats {
  totalRevenue: number;
  pendingPayments: number;
  paidInvoices: number;
  overdueInvoices: number;
}

export default function BillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<BillingStats>({
    totalRevenue: 0,
    pendingPayments: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState<number | null>(null);

  const fetchBillingData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('bearer_token');

      const [invoicesRes, paymentsRes] = await Promise.all([
        fetch('/api/lumenr/invoices', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/lumenr/payments', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      let invoicesList: Invoice[] = [];
      let paymentsList: Payment[] = [];

      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json();
        invoicesList = Array.isArray(invoicesData) ? invoicesData : invoicesData.data || [];
        setInvoices(invoicesList);
      } else {
        console.error('Failed to fetch invoices:', invoicesRes.status);
        setError('Could not load invoices. Please try again.');
      }

      if (paymentsRes.ok) {
        const paymentsData = await paymentsRes.json();
        paymentsList = Array.isArray(paymentsData) ? paymentsData : paymentsData.data || [];
        setPayments(paymentsList);
      } else {
        console.error('Failed to fetch payments:', paymentsRes.status);
        setError(prev => prev ? 'Could not load billing data. Please try again.' : 'Could not load payments. Please try again.');
      }

      if (!invoicesRes.ok || !paymentsRes.ok) {
        toast.error('Some billing data could not be loaded');
      }

      const totalRevenue = paymentsList.reduce((sum: number, p: Payment) => 
        sum + parseFloat(p.amount), 0);
      const paidInvoices = invoicesList.filter((inv: Invoice) => inv.status === 'paid').length;
      const pendingPayments = invoicesList
        .filter((inv: Invoice) => inv.status === 'unpaid')
        .reduce((sum: number, inv: Invoice) => sum + parseFloat(inv.total), 0);
      
      const now = new Date();
      const overdueInvoices = invoicesList.filter((inv: Invoice) => 
        inv.status === 'unpaid' && inv.dueDate && new Date(inv.dueDate) < now
      ).length;

      setStats({
        totalRevenue,
        pendingPayments,
        paidInvoices,
        overdueInvoices,
      });
    } catch (error: any) {
      console.error('Error fetching billing data:', error);
      setError(error.message || 'Failed to load billing data');
      toast.error(error.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const handlePayInvoice = async (invoiceId: number) => {
    setProcessingPayment(invoiceId);
    try {
      const token = localStorage.getItem('bearer_token');
      const response = await fetch('/api/lumenr/payments/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ invoiceId })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const { url } = await response.json();
      
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error: any) {
      toast.error(error.message);
      setProcessingPayment(null);
    }
  };

  useEffect(() => {
    fetchBillingData();

    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment');
    
    if (paymentStatus === 'success') {
      toast.success('Payment successful! Invoice has been marked as paid.');
      window.history.replaceState({}, '', '/billing');
    } else if (paymentStatus === 'cancelled') {
      toast.error('Payment was cancelled.');
      window.history.replaceState({}, '', '/billing');
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Paid</Badge>;
      case 'unpaid':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Unpaid</Badge>;
      case 'overdue':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Billing & Payments</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Track revenue and manage payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(stats.totalRevenue || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">All-time earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${Number(stats.pendingPayments || 0).toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Awaiting payment</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.paidInvoices}</div>
              <p className="text-xs text-muted-foreground">Successfully paid</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.overdueInvoices}</div>
              <p className="text-xs text-muted-foreground">Past due date</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchBillingData}>
            Retry
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {invoices.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No invoices yet</p>
              ) : (
                invoices.slice(0, 5).map((invoice) => {
                  const isOverdue = invoice.status === 'unpaid' && 
                    invoice.dueDate && 
                    new Date(invoice.dueDate) < new Date();
                  
                  return (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">Invoice #{invoice.id}</p>
                          {getStatusBadge(isOverdue ? 'overdue' : invoice.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">${Number(invoice.total || 0).toFixed(2)}</p>
                        {invoice.status === 'unpaid' && (
                          <Button 
                            size="sm" 
                            className="mt-1"
                            onClick={() => handlePayInvoice(invoice.id)}
                            disabled={processingPayment === invoice.id}
                          >
                            {processingPayment === invoice.id ? 'Processing...' : 'Pay Now'}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {payments.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No payments yet</p>
              ) : (
                payments.slice(0, 5).map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div>
                        <p className="font-medium">Invoice #{payment.invoiceId}</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {payment.method} • {new Date(payment.processedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        +${Number(payment.amount || 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">{payment.currency}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-900">
            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100">Stripe Integration Active</h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  Accept credit card payments securely with Stripe. All transactions are encrypted and PCI compliant.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Payment Methods</p>
              <p className="font-medium">Credit Card (Visa, Mastercard, Amex)</p>
            </div>
            <div>
              <p className="text-muted-foreground">Processing Time</p>
              <p className="font-medium">Instant</p>
            </div>
            <div>
              <p className="text-muted-foreground">Transaction Fee</p>
              <p className="font-medium">2.9% + $0.30 per transaction</p>
            </div>
            <div>
              <p className="text-muted-foreground">Payout Schedule</p>
              <p className="font-medium">2 business days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
