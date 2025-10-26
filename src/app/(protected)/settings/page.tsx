'use client';

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Bell, Shield, Palette, Globe, LogOut, Crown, Building2, Upload as UploadIcon, Plug, Calendar, Mail, CheckCircle, XCircle } from 'lucide-react'
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
  const avatarInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    avatar_url: ''
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
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [theme, setTheme] = useState('system')
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    desktop: false,
    weeklyReport: true
  })

  const [isLoading, setIsLoading] = useState(false)
  const [integrations, setIntegrations] = useState({
    googleCalendar: { connected: false, name: 'Google Calendar' },
    outlookCalendar: { connected: false, name: 'Outlook Calendar' },
    email: { connected: false, name: 'Email (Resend)' }
  })

  // Load profile data and business profile from localStorage/API on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        // Load profile avatar from localStorage
        const avatarUrl = localStorage.getItem('user_avatar_url')
        if (avatarUrl) {
          setProfileData(prev => ({ ...prev, avatar_url: avatarUrl }))
        }

        // Load business profile from API
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
        console.error('Failed to load profiles:', error)
      }
    }

    loadProfiles()
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Profile picture file size must be less than 2MB')
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast.error('Only JPEG and PNG files are supported')
      return
    }

    setUploadingAvatar(true)
    try {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        setProfileData({ ...profileData, avatar_url: base64 })
        localStorage.setItem('user_avatar_url', base64)
        
        // Dispatch custom event for same-window update
        window.dispatchEvent(new CustomEvent('avatarUpdated', { detail: { avatarUrl: base64 } }))
        
        toast.success('Profile picture uploaded successfully')
      }
      reader.onerror = () => {
        throw new Error('Failed to read file')
      }
      reader.readAsDataURL(file)
    } catch (error: any) {
      toast.error(error.message || 'Failed to upload profile picture')
    } finally {
      setUploadingAvatar(false)
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
        {/* Personal Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {profileData.avatar_url ? (
                        <AvatarImage src={profileData.avatar_url} alt="Profile" />
                      ) : (
                        <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xl font-semibold">
                          {profileData.first_name?.[0]}{profileData.last_name?.[0]}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1">
                      <input
                        ref={avatarInputRef}
                        type="file"
                        accept="image/jpeg,image/png"
                        className="hidden"
                        onChange={handleAvatarUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => avatarInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="w-full sm:w-auto"
                      >
                        <UploadIcon className="h-4 w-4 mr-2" />
                        {uploadingAvatar ? 'Uploading...' : 'Upload Photo'}
                      </Button>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPEG or PNG, max 2MB
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Business Profile Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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

        {/* Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg sm:text-xl">
                <Plug className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Integrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect external services to enhance your LumenR experience
              </p>

              <Separator />

              {/* Google Calendar Integration */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Calendar className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <Label className="text-base">Google Calendar</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Sync your appointments with Google Calendar
                    </p>
                    {integrations.googleCalendar.connected && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant={integrations.googleCalendar.connected ? "outline" : "default"}
                  onClick={() => {
                    if (integrations.googleCalendar.connected) {
                      setIntegrations({...integrations, googleCalendar: { ...integrations.googleCalendar, connected: false }});
                      toast.success('Google Calendar disconnected');
                    } else {
                      toast.info('Google Calendar integration setup coming soon');
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  {integrations.googleCalendar.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>

              <Separator />

              {/* Outlook Calendar Integration */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <Label className="text-base">Outlook Calendar</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Two-way sync with Microsoft Outlook Calendar
                    </p>
                    {integrations.outlookCalendar.connected && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant={integrations.outlookCalendar.connected ? "outline" : "default"}
                  onClick={() => {
                    if (integrations.outlookCalendar.connected) {
                      setIntegrations({...integrations, outlookCalendar: { ...integrations.outlookCalendar, connected: false }});
                      toast.success('Outlook Calendar disconnected');
                    } else {
                      toast.info('Outlook Calendar integration coming soon');
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  {integrations.outlookCalendar.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>

              <Separator />

              {/* Email Integration */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Mail className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <Label className="text-base">Email (Resend)</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Send quotes and invoices via email
                    </p>
                    {integrations.email.connected && (
                      <div className="flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600 dark:text-green-400">Connected</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button 
                  variant={integrations.email.connected ? "outline" : "default"}
                  onClick={() => {
                    if (integrations.email.connected) {
                      setIntegrations({...integrations, email: { ...integrations.email, connected: false }});
                      toast.success('Email integration disconnected');
                    } else {
                      toast.info('Email integration coming soon - API key needed');
                    }
                  }}
                  className="w-full sm:w-auto"
                >
                  {integrations.email.connected ? 'Disconnect' : 'Connect'}
                </Button>
              </div>
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