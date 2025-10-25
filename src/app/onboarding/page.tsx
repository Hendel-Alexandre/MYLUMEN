'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleGetStarted = async () => {
    // If user is not logged in, redirect to signup
    if (!user) {
      router.push('/signup');
      return;
    }

    // Mark onboarding as complete
    setIsCompleting(true);
    
    try {
      // Try to update or insert the onboarding status
      await supabase
        .from('user_mode_settings' as any)
        .upsert({
          user_id: user.id,
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
    
    // Navigate to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-2xl w-full p-8 md:p-12 text-center space-y-6">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome to <span className="text-purple-600 dark:text-purple-400">LumenR</span>!
        </h1>
        
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          Your all-in-one AI-powered business management platform. 
          Manage clients, create invoices, track payments, and grow your business smarter.
        </p>

        <div className="space-y-3 text-left max-w-md mx-auto pt-4">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Smart CRM & Client Management</h3>
              <p className="text-sm text-muted-foreground">Track clients, projects, and communications</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Invoicing & Payments</h3>
              <p className="text-sm text-muted-foreground">Create professional invoices and track payments</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">Get smart recommendations and analytics</p>
            </div>
          </div>
        </div>

        <div className="pt-6">
          <Button 
            size="lg" 
            onClick={handleGetStarted}
            disabled={isCompleting}
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white px-8"
          >
            {isCompleting ? 'Setting up...' : 'Get Started'} <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
}
