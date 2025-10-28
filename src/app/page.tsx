'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  Zap, 
  Shield, 
  BarChart,
  Brain,
  Globe,
  FileText,
  Target,
  ChevronDown,
  X,
  Receipt,
  PenTool,
  TrendingUp,
  Sparkles,
  DollarSign,
  Menu
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function IndexPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 light">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center flex-shrink-0">
            <Image src="/lumenr-logo.png" alt="LumenR" width={48} height={48} priority unoptimized />
          </div>
          
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </a>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/login" className="hidden md:inline-block">
              <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">Login</Button>
            </Link>
            <Link href="/signup" className="hidden md:inline-block">
              <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <a
                href="#features"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Features
              </a>
              <a
                href="#solutions"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Solutions
              </a>
              <a
                href="#pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
              >
                Pricing
              </a>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button variant="ghost" size="sm" className="w-full text-gray-600 hover:text-gray-900">Login</Button>
                </Link>
                <Link href="/signup" onClick={() => setMobileMenuOpen(false)} className="block">
                  <Button size="sm" className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl shadow-lg">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 md:pb-24 bg-gradient-to-b from-blue-50 via-purple-50/30 to-white">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge className="mb-4 bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200">
              <Sparkles className="h-3 w-3 mr-1" />
              Now with AI-Powered Insights
            </Badge>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-purple-900 to-blue-900 bg-clip-text text-transparent">
              Run Your Business Smarter
              <span className="block mt-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text">with LumenR</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              All-in-one AI platform to manage clients, projects, invoices, and operations — powered by automation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base px-10 py-6 rounded-xl shadow-xl hover:shadow-2xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white transition-all transform hover:scale-105">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500 flex items-center justify-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                7-day free trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancel anytime
              </span>
            </p>
          </div>

          {/* Dashboard Preview - Optimized with placeholder */}
          <div className="mt-20 relative max-w-5xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-20"></div>
            <Card className="relative bg-white border-gray-200 backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl p-4">
              <div className="w-full aspect-video bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-purple-600/10 to-blue-600/10"></div>
                <div className="relative z-10 text-center space-y-4">
                  <div className="inline-block p-4 bg-white/90 rounded-2xl shadow-lg">
                    <BarChart className="h-16 w-16 text-purple-600" />
                  </div>
                  <p className="text-gray-700 font-semibold text-lg">Interactive Dashboard Preview</p>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">Real-time analytics, AI insights, and automated workflows</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex justify-center mt-16">
            <ChevronDown className="h-8 w-8 text-gray-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                200+
              </div>
              <div className="text-sm text-gray-600 font-medium">Businesses Optimized</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                5K+
              </div>
              <div className="text-sm text-gray-600 font-medium">Documents Processed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                99.9%
              </div>
              <div className="text-sm text-gray-600 font-medium">Uptime</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center">
                <Globe className="h-12 w-12 text-blue-600" />
              </div>
              <div className="text-sm text-gray-600 font-medium">Global Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 bg-white">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4 border-orange-200 text-orange-700">The Problem</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Business Management is Still Too Manual
          </h2>
          <p className="text-xl text-gray-600">
            Even with modern tools, teams waste time switching between systems and chasing data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:scale-105">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <X className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Too Many Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              Scattered apps create confusion and data silos that slow you down.
            </p>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:scale-105">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <BarChart className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">No Clear Insights</h3>
            <p className="text-gray-600 leading-relaxed">
              Hard to see real financial performance and make data-driven decisions.
            </p>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 border-gray-200 bg-white hover:scale-105">
            <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <Clock className="h-7 w-7 text-white" />
            </div>
            <h3 className="font-bold text-xl text-gray-900">Slow Workflows</h3>
            <p className="text-gray-600 leading-relaxed">
              Manual quoting, invoicing, and tracking kill efficiency and growth.
            </p>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solutions" className="bg-gradient-to-br from-gray-50 via-blue-50/50 to-purple-50/50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">The LumenR Solution</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
              One Platform. Total Control.
            </h2>
            <p className="text-lg text-gray-600">
              Unify your operations, automate your admin, and grow faster with intelligent automation
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Smart CRM</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Manage clients, quotes, invoices, and payments in one unified platform.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">AI Insights</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Forecast revenue, detect risks, and get intelligent action suggestions.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Receipt className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Receipts & OCR</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Upload, scan, and organize expenses automatically with AI-powered OCR.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Calendar Sync</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Connect Google or Outlook to streamline scheduling and booking.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <PenTool className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">E-Sign Contracts</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Send and sign documents instantly and securely with built-in e-signatures.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-all">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 text-gray-900">Tax & Reports</h3>
                <p className="text-sm text-gray-600 leading-relaxed">Generate tax summaries, analytics, and comprehensive financial dashboards.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24 bg-white">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-blue-200 text-blue-700">Powerful Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Everything You Need to Run Smarter
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Built for modern businesses who demand efficiency, insights, and growth
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            { 
              icon: Target, 
              title: 'Project & Client Management', 
              description: 'Track every client and deal from quote to payment. LumenR keeps your team aligned and clients informed every step of the way with real-time updates.',
              gradient: 'from-blue-500 to-cyan-500'
            },
            { 
              icon: Brain, 
              title: 'AI-Powered Insights', 
              description: 'Get actionable data that drives business growth. Lumen AI analyzes patterns, identifies opportunities, and suggests optimizations automatically.',
              gradient: 'from-purple-500 to-pink-500'
            },
            { 
              icon: TrendingUp, 
              title: 'Custom Dashboards', 
              description: 'View performance metrics in real time. Build beautiful reports, track KPIs, and export data in any format you need for stakeholders.',
              gradient: 'from-green-500 to-emerald-500'
            },
            { 
              icon: Shield, 
              title: 'Secure Cloud Storage', 
              description: 'Encrypted and compliant by default. Enterprise-grade security with full data encryption, automatic backups, and advanced access controls.',
              gradient: 'from-orange-500 to-red-500'
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="p-8 space-y-4 hover:shadow-xl transition-all duration-300 bg-white border-gray-200 group hover:scale-105"
            >
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-2xl text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24 bg-gradient-to-br from-gray-50 via-purple-50/30 to-blue-50/30">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4 border-purple-200 text-purple-700">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-gray-900">
            Simple, Transparent Plans
          </h2>
          <p className="text-lg text-gray-600">
            Choose the plan that fits your business needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="p-8 space-y-6 border-gray-200 bg-white hover:shadow-xl transition-all">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Starter</h3>
              <p className="text-gray-600">Freelancers & Solos</p>
            </div>
            <div>
              <span className="text-5xl font-bold text-gray-900">$0</span>
              <span className="text-gray-600">/mo</span>
            </div>
            <ul className="space-y-3">
              {['3 clients', 'Invoices', 'OCR Receipts', 'Basic reports', 'Email support'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl border-gray-300 text-gray-900 hover:bg-gray-50">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 space-y-6 border-2 border-purple-500 relative shadow-2xl scale-105 bg-white">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">Most Popular</Badge>
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Pro</h3>
              <p className="text-gray-600">Small Teams</p>
            </div>
            <div>
              <span className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">$20</span>
              <span className="text-gray-600">/user/mo</span>
            </div>
            <ul className="space-y-3">
              {['Unlimited clients', 'AI Insights', 'Reports', 'E-Sign', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button className="w-full rounded-xl shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Business+ Plan */}
          <Card className="p-8 space-y-6 border-gray-200 bg-white hover:shadow-xl transition-all">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">Business+</h3>
              <p className="text-gray-600">Agencies & Firms</p>
            </div>
            <div>
              <span className="text-5xl font-bold text-gray-900">Custom</span>
            </div>
            <ul className="space-y-3">
              {['E-Sign', 'Integrations', 'Advanced Security', 'Dedicated support', 'SLA guarantee'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl border-gray-300 text-gray-900 hover:bg-gray-50">Contact Sales</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 md:py-32 bg-white">
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl opacity-100"></div>
          <div className="relative p-12 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Level Up Your Business?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
              Join hundreds of professionals using LumenR to automate their workflows and grow smarter
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-lg px-10 py-6 rounded-xl bg-white text-purple-600 hover:bg-gray-100 shadow-2xl transition-all transform hover:scale-105">
                Start Your Free Trial <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-purple-100 mt-6 flex items-center justify-center gap-6 flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                No credit card required
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                7-day trial
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Cancel anytime
              </span>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Docs</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-gray-900">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
            © 2025 LumenR — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
