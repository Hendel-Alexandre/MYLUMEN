'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Database, Cloud, Zap, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SupabaseStorageExample } from '@/components/examples/SupabaseStorageExample';
import { SupabaseRealtimeExample } from '@/components/examples/SupabaseRealtimeExample';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SupabaseFeaturesPage() {
  const [tableExists, setTableExists] = useState<boolean | null>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [sqlToRun, setSqlToRun] = useState('');

  useEffect(() => {
    checkTableStatus();
  }, []);

  const checkTableStatus = async () => {
    try {
      const res = await fetch('/api/supabase/setup');
      const data = await res.json();
      setTableExists(data.exists);
      if (!data.exists && data.sql) {
        setSqlToRun(data.sql);
      }
    } catch (error) {
      console.error('Failed to check table status:', error);
      setTableExists(false);
    }
  };

  const handleSetup = async () => {
    setSetupLoading(true);
    try {
      const res = await fetch('/api/supabase/setup', { method: 'POST' });
      const data = await res.json();
      
      if (data.success) {
        toast.success('Setup complete! Table is ready.');
        setTableExists(true);
        setSqlToRun('');
      } else {
        toast.error('Setup failed. Please run SQL manually.');
        if (data.sql) {
          setSqlToRun(data.sql);
        }
      }
    } catch (error) {
      toast.error('Setup failed. Please check console for details.');
      console.error('Setup error:', error);
    } finally {
      setSetupLoading(false);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(sqlToRun);
    toast.success('SQL copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Supabase Features</h1>
              <p className="text-muted-foreground">
                Explore Storage, Realtime, and Database capabilities
              </p>
            </div>
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Setup Warning */}
        {tableExists === false && (
          <Card className="mb-8 border-orange-500/50 bg-orange-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                <AlertCircle className="h-5 w-5" />
                Setup Required
              </CardTitle>
              <CardDescription>
                The "clients" table doesn't exist in your Supabase database yet.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Button 
                  onClick={handleSetup}
                  disabled={setupLoading}
                  className="mb-4"
                >
                  {setupLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Run Automatic Setup'
                  )}
                </Button>
              </div>

              {sqlToRun && (
                <div>
                  <p className="text-sm font-medium mb-2">
                    Or run this SQL manually in your{' '}
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/project/default/sql/new`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Supabase SQL Editor
                    </a>:
                  </p>
                  <div className="relative">
                    <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
                      {sqlToRun}
                    </pre>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copySqlToClipboard}
                      className="absolute top-2 right-2"
                    >
                      Copy SQL
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Status Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Database className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="font-semibold">PostgreSQL</p>
                  <Badge variant={tableExists ? "default" : "secondary"} className="mt-1">
                    {tableExists === null ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Checking...
                      </>
                    ) : tableExists ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ready
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Setup Needed
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Full PostgreSQL database with direct connection
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Cloud className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="font-semibold">Storage</p>
                  <Badge variant="default" className="mt-1">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Upload and manage files securely
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Zap className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="font-semibold">Realtime</p>
                  <Badge variant={tableExists ? "default" : "secondary"} className="mt-1">
                    {tableExists ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Enabled
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Waiting
                      </>
                    )}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Live database change subscriptions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          <SupabaseStorageExample />
          <SupabaseRealtimeExample table="clients" />
        </div>

        {/* Documentation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security & Best Practices
            </CardTitle>
            <CardDescription>
              Important information about your Supabase integration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">🗄️ Two Databases</h4>
              <p className="text-sm text-muted-foreground">
                Your app uses <strong>Turso</strong> for main application data (clients, invoices, etc.) 
                and <strong>Supabase</strong> for Storage and Realtime features. They are separate databases.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔐 Row Level Security (RLS)</h4>
              <p className="text-sm text-muted-foreground">
                Enable RLS policies in Supabase Dashboard → Authentication → Policies
                to secure your data at the row level.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📦 Storage Buckets</h4>
              <p className="text-sm text-muted-foreground">
                Create storage buckets in Supabase Dashboard → Storage. Make buckets
                public or configure access policies as needed. The examples use a "documents" bucket.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">⚡ Realtime Subscriptions</h4>
              <p className="text-sm text-muted-foreground">
                Subscribe to database changes using the Realtime API. Monitor INSERTs,
                UPDATEs, and DELETEs in real-time. The example listens to the "clients" table.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">🔑 API Keys</h4>
              <p className="text-sm text-muted-foreground">
                Your anon key is safe for client-side use. Service role key should only
                be used server-side for admin operations.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">📚 Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Visit your{' '}
                <a
                  href={process.env.NEXT_PUBLIC_SUPABASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Supabase Dashboard
                </a>
                {' '}to manage your database, storage buckets, and settings.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}