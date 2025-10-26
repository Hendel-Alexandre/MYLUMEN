'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, ArrowLeft, MapPin, Building2, Settings, CheckCircle, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' },
  { value: 'INR', label: 'Indian Rupee (INR)' }
];

const COUNTRIES = [
  'United States', 'Canada', 'United Kingdom', 'Australia', 'Germany', 
  'France', 'Spain', 'Italy', 'Netherlands', 'Belgium', 'Switzerland',
  'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Ireland',
  'Portugal', 'Greece', 'Poland', 'Czech Republic', 'Japan', 'China',
  'India', 'Brazil', 'Mexico', 'Argentina', 'South Africa', 'Other'
];

interface OnboardingData {
  country: string;
  province: string;
  city: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  taxId: string;
  currency: string;
  taxRegion: string;
  paymentInstructions: string;
  invoiceFooter: string;
}

export function OnboardingWizard() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingData>({
    country: '',
    province: '',
    city: '',
    businessName: localStorage.getItem('pending_business_name') || '',
    businessAddress: '',
    businessPhone: '',
    taxId: '',
    currency: 'USD',
    taxRegion: '',
    paymentInstructions: '',
    invoiceFooter: 'Thank you for your business!'
  });

  // Load saved progress from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem('lumenr-onboarding-progress');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading onboarding progress:', error);
      }
    }
  }, []);

  // Save progress to localStorage whenever formData changes
  useEffect(() => {
    localStorage.setItem('lumenr-onboarding-progress', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const progress = (currentStep / 3) * 100;

  const handleNext = () => {
    if (currentStep === 1 && (!formData.country || !formData.city)) {
      toast.error('Please fill in all location fields');
      return;
    }
    if (currentStep === 2 && !formData.businessName) {
      toast.error('Business name is required');
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = async () => {
    if (!user) {
      toast.error('You must be logged in to complete onboarding');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create/update business profile
      const { error: profileError } = await supabase
        .from('business_profiles' as any)
        .upsert({
          user_id: user.id,
          business_name: formData.businessName,
          address: formData.businessAddress,
          phone: formData.businessPhone,
          tax_id: formData.taxId,
          currency: formData.currency,
          tax_region: formData.taxRegion,
          default_payment_instructions: formData.paymentInstructions,
          invoice_footer: formData.invoiceFooter,
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Error saving business profile:', profileError);
      }

      // Mark onboarding as complete
      localStorage.setItem('lumenr-onboarding-completed', 'true');
      localStorage.removeItem('lumenr-onboarding-progress');
      localStorage.removeItem('pending_business_name');

      try {
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

      toast.success('Welcome to LumenR!', {
        description: 'Your business profile has been set up successfully.'
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to save your information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: 'Location',
      icon: MapPin,
      description: 'Where is your business located?'
    },
    {
      id: 2,
      title: 'Business Info',
      icon: Building2,
      description: 'Tell us about your business'
    },
    {
      id: 3,
      title: 'Preferences',
      icon: Settings,
      description: 'Configure your settings'
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <Card className="max-w-3xl w-full shadow-2xl">
        <CardHeader className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-center">Welcome to LumenR!</h1>
            <p className="text-muted-foreground text-center">Let's set up your business profile in 3 easy steps</p>
          </div>
          
          <div className="space-y-3">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-sm">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.id}
                    className={`flex items-center gap-2 ${
                      currentStep >= step.id ? 'text-purple-600 dark:text-purple-400' : 'text-muted-foreground'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                    <span className="hidden sm:inline">{step.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    Business Location
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    This helps us calculate correct taxes and comply with local regulations.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => updateField('country', value)}>
                      <SelectTrigger id="country">
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {COUNTRIES.map(country => (
                          <SelectItem key={country} value={country}>{country}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="province">State / Province</Label>
                      <Input
                        id="province"
                        placeholder="e.g., California"
                        value={formData.province}
                        onChange={(e) => updateField('province', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g., San Francisco"
                        value={formData.city}
                        onChange={(e) => updateField('city', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    Business Information
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    This information will appear on your invoices and quotes.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      placeholder="Acme Inc."
                      value={formData.businessName}
                      onChange={(e) => updateField('businessName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="businessAddress">Business Address</Label>
                    <Textarea
                      id="businessAddress"
                      placeholder="123 Main St, Suite 100"
                      value={formData.businessAddress}
                      onChange={(e) => updateField('businessAddress', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="businessPhone">Phone Number</Label>
                      <Input
                        id="businessPhone"
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        value={formData.businessPhone}
                        onChange={(e) => updateField('businessPhone', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID / EIN</Label>
                      <Input
                        id="taxId"
                        placeholder="12-3456789"
                        value={formData.taxId}
                        onChange={(e) => updateField('taxId', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Business Preferences
                  </h2>
                  <p className="text-sm text-muted-foreground mb-6">
                    Customize how you manage invoicing and payments.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="currency">Default Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => updateField('currency', value)}>
                        <SelectTrigger id="currency">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CURRENCIES.map(curr => (
                            <SelectItem key={curr.value} value={curr.value}>{curr.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxRegion">Tax Region</Label>
                      <Input
                        id="taxRegion"
                        placeholder="e.g., US-CA for California"
                        value={formData.taxRegion}
                        onChange={(e) => updateField('taxRegion', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentInstructions">Default Payment Instructions</Label>
                    <Textarea
                      id="paymentInstructions"
                      placeholder="Payment due within 30 days. Please pay via bank transfer to..."
                      value={formData.paymentInstructions}
                      onChange={(e) => updateField('paymentInstructions', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoiceFooter">Invoice Footer</Label>
                    <Textarea
                      id="invoiceFooter"
                      placeholder="Thank you for your business!"
                      value={formData.invoiceFooter}
                      onChange={(e) => updateField('invoiceFooter', e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>

            {currentStep < 3 ? (
              <Button onClick={handleNext} className="gap-2 bg-purple-600 hover:bg-purple-700">
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={handleComplete} 
                disabled={isSubmitting}
                className="gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? 'Setting up...' : 'Complete Setup'}
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => {
                localStorage.setItem('lumenr-onboarding-completed', 'true');
                localStorage.removeItem('lumenr-onboarding-progress');
                router.push('/dashboard');
              }}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              disabled={isSubmitting}
            >
              Skip for now
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
