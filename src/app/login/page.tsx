'use client';

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Chrome } from 'lucide-react'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'

const loginSchema = z.object({
  email: z.string()
    .trim()
    .email('Invalid email address')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters')
})

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { t } = useTranslation()
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const validationResult = loginSchema.safeParse({ email, password })

    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0]
      toast.error('Invalid Input', {
        description: firstError.message
      })
      setIsLoading(false)
      return
    }

    try {
      const validated = validationResult.data
      const { error } = await signIn(validated.email, validated.password)
      
      if (error) {
        console.error('[Login] Sign in error:', error)
        toast.error('Login Failed', {
          description: 'Invalid email or password. Please check your credentials and try again.'
        })
      } else {
        toast.success('Success', {
          description: 'Successfully signed in!'
        })
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('[Login] Exception:', error)
      toast.error('Error', {
        description: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Purple Gradient */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 via-purple-500 to-pink-500 relative overflow-hidden items-center justify-center p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-purple-500/90 to-pink-500/90" />
        <div className="relative z-10 text-white max-w-md space-y-8">
          <div>
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm mb-6">
              <Chrome className="h-6 w-6" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Welcome Back</h1>
            <p className="text-white/90 text-lg">Sign in to continue to your account</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white text-purple-600 font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">Enter your credentials</p>
                <p className="text-sm text-white/80">Use your registered email</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold">
                2
              </div>
              <div>
                <p className="font-semibold text-white/70">Access your dashboard</p>
                <p className="text-sm text-white/60">View all your data</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 text-white font-bold">
                3
              </div>
              <div>
                <p className="font-semibold text-white/70">Start tracking</p>
                <p className="text-sm text-white/60">Boost your productivity</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Right Side - Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex-1 flex items-center justify-center p-8 bg-gradient-dark"
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Sign In</h2>
            <p className="text-muted-foreground">Enter your credentials to access your account</p>
          </div>

          {/* Social Login Button */}
          <Button variant="outline" className="w-full h-11 border-border/50 hover:bg-secondary/50">
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/50" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="eg. john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 bg-secondary/50 border-border/50 rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 bg-secondary/50 border-border/50 rounded-xl pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link 
                href="/forgot-password" 
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-primary hover:opacity-90 rounded-xl font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="text-primary hover:text-primary/80 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </span>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}