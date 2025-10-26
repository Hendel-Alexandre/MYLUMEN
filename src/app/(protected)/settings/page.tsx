'use client';

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Globe, LogOut, Crown, Building2, Upload as UploadIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  })

  const [businessProfile, setBusinessProfile] = useState({
    business_name: '',
    logo_url: '',
    currency: 'USD',
    tax_region: '',
    default_payment_instructions: '',
    invoice_footer: ''
  })

  const [loadingBusiness, setLoadingBusiness] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [theme, setTheme] = useState('system')
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    weeklyReport: true
  })

  const [isLoading, setIsLoading] = useState(false)

  // Load business profile from API on mount
  useEffect(() => {
    const loadBusinessProfile = async () => {
      try {
        const token = localStorage.getItem('bearer_token')
        if (!token) return

        const response = await fetch('/api/lumenr/business-profiles', {
          headers: { 'Authorization': `Bearer ${token}` }
        })

        if (response.ok) {
          const result = await response.json()
          // API returns { success: true, data: [...] }
          const profiles = result.data || result
          if (profiles && profiles.length > 0) {
            const profile = profiles[0]
            setBusinessProfile({
              business_name: profile.businessName || '',
              logo_url: profile.logoUrl || '',
              currency: profile.currency || 'USD',
              tax_region: profile.taxRegion || '',
              default_payment_instructions: profile.paymentInstructions || '',
              invoice_footer: profile.invoiceFooter || ''
            })
          }
        }
      } catch (error) {
        console.error('Failed to load business profile:', error)
      }
    }

    loadBusinessProfile()
  }, [])

  const handleBusinessProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingBusiness(true)
    try {
      const token = localStorage.getItem('bearer_token')
      if (!token) {
        throw new Error('Authentication required')
      }

      const response = await fetch('/api/lumenr/business-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessName: businessProfile.business_name,
          logoUrl: businessProfile.logo_url,
          currency: businessProfile.currency,
          taxRegion: businessProfile.tax_region,
          paymentInstructions: businessProfile.default_payment_instructions,
          invoiceFooter: businessProfile.invoice_footer
        })
      })

      const result = await response.json()

      if (!response.ok) {
        // Extract error message from API response
        const errorMessage = result.error || 'Failed to update business profile'
        throw new Error(errorMessage)
      }

      // Keep localStorage in sync for backward compatibility
      localStorage.setItem('business_name', businessProfile.business_name)
      
      toast.success('Business profile updated successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to update business profile')
    } finally {
      setLoadingBusiness(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo file size must be less than 2MB')
      return
    }

    if (!['image/jpeg', 'image/png', 'image/svg+xml'].includes(file.type)) {
      toast.error('Only JPEG, PNG, and SVG files are supported')
      return
    }

    setUploadingLogo(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setBusinessProfile({ ...businessProfile, logo_url: base64 })
        localStorage.setItem('business_logo_url', base64)
        
        toast.success('Logo uploaded successfully')
      }
      reader.onerror = () => {
        throw new Error('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('bearer_token')
      toast.success('Signed out successfully')
      router.push('/login')
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign out')
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm sm:text-base">Manage your account and preferences</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        {/* Business Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Business Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBusinessProfileUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Business Name</Label>
                  <Input
                    id="business_name"
                    value={businessProfile.business_name}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, business_name: e.target.value })}
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    {businessProfile.logo_url && (
                      <img 
                        src={businessProfile.logo_url} 
                        alt="Company Logo" 
                        className="h-16 w-16 object-contain border rounded"
                      />
                    )}
                    <div className="flex-1">
                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => logoInputRef.current?.click()}
                        disabled={uploadingLogo}
                        className="w-full sm:w-auto"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      value={businessProfile.currency} 
                      onValueChange={(value) => setBusinessProfile({ ...businessProfile, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax_region">Tax Region</Label>
                    <Input
                      id="tax_region"
                      value={businessProfile.tax_region}
                      onChange={(e) => setBusinessProfile({ ...businessProfile, tax_region: e.target.value })}
                      placeholder="e.g., California, Ontario"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment_instructions">Default Payment Instructions</Label>
                  <Input
                    id="payment_instructions"
                    value={businessProfile.default_payment_instructions}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, default_payment_instructions: e.target.value })}
                    placeholder="e.g., Payment due within 30 days"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice_footer">Invoice Footer</Label>
                  <Input
                    id="invoice_footer"
                    value={businessProfile.invoice_footer}
                    onChange={(e) => setBusinessProfile({ ...businessProfile, invoice_footer: e.target.value })}
                    placeholder="e.g., Thank you for your business!"
                  />
                </div>

                <Button type="submit" disabled={loadingBusiness} className="w-full sm:w-auto">
                  {loadingBusiness ? 'Updating...' : 'Update Business Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Appearance Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Choose your preferred theme
                  </p>
                </div>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger className="w-full sm:w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive push notifications in browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, push: checked })}
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <Label>Weekly Reports</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Receive weekly activity reports
                  </p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Account Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Sign Out</Label>
                  <p className="text-sm text-muted-foreground">
                    Sign out of your account on this device
                  </p>
                </div>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}