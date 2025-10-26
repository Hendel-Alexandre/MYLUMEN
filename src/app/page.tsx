'use client';

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
  MessageCircle,
  Database
} from "lucide-react";
import Link from "next/link";

export default function IndexPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/lumenr-logo.png" alt="LumenR" className="w-8 h-8" />
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LumenR
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link href="/chat" className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              Try Lumen AI
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Get Started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-16 md:pb-24">
        <div className="container mx-auto px-4 pt-20 pb-16 md:pt-32 md:pb-24 relative z-10">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <Badge variant="secondary" className="mb-4 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
              <Zap className="h-3 w-3 mr-1" />
              Now with AI-Powered Insights
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Run Your Business Smarter
              <span className="text-purple-600 dark:text-purple-400 block mt-2">with LumenR</span>
            </h1>
            
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              All-in-one AI platform to manage clients, projects, invoices, and operations — powered by automation
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button size="lg" className="gap-2 text-base px-8 rounded-xl shadow-lg hover:shadow-xl bg-purple-600 hover:bg-purple-700 text-white transition-all">
                  Start Free Trial <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/chat">
                <Button size="lg" variant="outline" className="gap-2 text-base px-8 rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <MessageCircle className="h-5 w-5" />
                  Chat with Lumen AI
                </Button>
              </Link>
            </div>

            <p className="text-sm text-muted-foreground">
              7-day free trial • No credit card required • Cancel anytime
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-20 relative max-w-4xl mx-auto">
            <Card className="bg-card border-border backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl p-3">
              <div className="w-full h-[400px] bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground">Dashboard Preview</p>
              </div>
            </Card>
          </div>

          {/* Scroll Down Indicator */}
          <div className="flex justify-center mt-12">
            <ChevronDown className="h-8 w-8 text-muted-foreground animate-bounce" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border/40 bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400">
                200+
              </div>
              <div className="text-sm text-muted-foreground font-medium">Businesses Optimized</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400">
                5K+
              </div>
              <div className="text-sm text-muted-foreground font-medium">Documents Processed</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-purple-600 dark:text-purple-400">
                99.9%
              </div>
              <div className="text-sm text-muted-foreground font-medium">Uptime</div>
            </div>
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400">
                <Globe className="h-10 w-10 mr-2" />
              </div>
              <div className="text-sm text-muted-foreground font-medium">Global Coverage</div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <Badge variant="outline" className="mb-4">The Problem</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Business Management is Still Too Manual
          </h2>
          <p className="text-xl text-muted-foreground">
            Even with modern tools, teams waste time switching between systems and chasing data
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="p-8 space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <X className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="font-bold text-xl">Too Many Tools</h3>
            <p className="text-muted-foreground leading-relaxed">
              Scattered apps create confusion and data silos.
            </p>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-purple-500/10 flex items-center justify-center">
              <BarChart className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="font-bold text-xl">No Clear Insights</h3>
            <p className="text-muted-foreground leading-relaxed">
              Hard to see real financial performance in real time.
            </p>
          </Card>
          <Card className="p-8 space-y-4 hover:shadow-lg transition-all duration-300">
            <div className="h-14 w-14 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Clock className="h-7 w-7 text-blue-500" />
            </div>
            <h3 className="font-bold text-xl">Slow Workflows</h3>
            <p className="text-muted-foreground leading-relaxed">
              Manual quoting, invoicing, and tracking kill efficiency.
            </p>
          </Card>
        </div>
      </section>

      {/* Solution Section */}
      <section id="solutions" className="bg-muted/30 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <Badge variant="outline" className="mb-4">The LumenR Solution</Badge>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              One Platform. Total Control.
            </h2>
            <p className="text-lg text-muted-foreground">
              Unify your operations, automate your admin, and grow faster
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Smart CRM</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Manage clients, quotes, invoices, and payments in one place.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Brain className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">AI Insights</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Forecast revenue, detect risks, and suggest next actions.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Receipts & OCR</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Upload, scan, and organize expenses automatically.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Calendar Sync</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Connect Google or Outlook to streamline scheduling.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                <PenTool className="h-6 w-6 text-cyan-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">E-Sign Contracts</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Send and sign documents instantly and securely.</p>
              </div>
            </Card>
            <Card className="p-6 space-y-4 hover:shadow-lg transition-all duration-300">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">Tax & Reports</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Generate tax summaries, analytics, and financial dashboards.</p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Highlight */}
      <section id="features" className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">Powerful Features</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything You Need to Run Smarter
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {[
            { 
              icon: Target, 
              title: 'Project & Client Management', 
              description: 'Track every client and deal from quote to payment. LumenR keeps your team aligned and clients informed every step of the way.'
            },
            { 
              icon: Brain, 
              title: 'AI-Powered Insights', 
              description: 'Get actionable data that drives business growth. Lumen AI analyzes patterns, identifies opportunities, and suggests optimizations.'
            },
            { 
              icon: BarChart, 
              title: 'Custom Dashboards', 
              description: 'View performance metrics in real time. Build beautiful reports, track KPIs, and export data in any format you need.'
            },
            { 
              icon: Shield, 
              title: 'Secure Cloud Storage', 
              description: 'Encrypted and compliant by default. Enterprise-grade security with full data encryption and calendar & booking tools.'
            }
          ].map((feature, index) => (
            <Card 
              key={index}
              className="p-8 space-y-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 flex items-center justify-center">
                <feature.icon className="h-8 w-8" />
              </div>
              <h3 className="font-bold text-2xl">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <Badge variant="outline" className="mb-4">Pricing</Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent Plans
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Starter Plan */}
          <Card className="p-8 space-y-6 border-border">
            <div>
              <h3 className="text-2xl font-bold mb-2">Starter</h3>
              <p className="text-muted-foreground">Freelancers & Solos</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$0</span>
              <span className="text-muted-foreground">/mo</span>
            </div>
            <ul className="space-y-3">
              {['3 clients', 'Invoices', 'OCR Receipts', 'Basic reports', 'Email support'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Pro Plan */}
          <Card className="p-8 space-y-6 border-2 border-purple-500/50 relative shadow-xl scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white">Most Popular</Badge>
            <div>
              <h3 className="text-2xl font-bold mb-2">Pro</h3>
              <p className="text-muted-foreground">Small Teams</p>
            </div>
            <div>
              <span className="text-5xl font-bold">$20</span>
              <span className="text-muted-foreground">/user/mo</span>
            </div>
            <ul className="space-y-3">
              {['Unlimited clients', 'AI Insights', 'Reports', 'E-Sign', 'Priority support'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button className="w-full rounded-xl shadow-lg bg-purple-600 hover:bg-purple-700 text-white">Start Free Trial</Button>
            </Link>
          </Card>

          {/* Business+ Plan */}
          <Card className="p-8 space-y-6 border-border">
            <div>
              <h3 className="text-2xl font-bold mb-2">Business+</h3>
              <p className="text-muted-foreground">Agencies & Firms</p>
            </div>
            <div>
              <span className="text-5xl font-bold">Custom</span>
            </div>
            <ul className="space-y-3">
              {['E-Sign', 'Integrations', 'Advanced Security', 'Dedicated support', 'SLA guarantee'].map((feature, i) => (
                <li key={i} className="flex gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Link href="/signup" className="block">
              <Button variant="outline" className="w-full rounded-xl">Contact Sales</Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <Card className="border-border p-12 md:p-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready to Level Up Your Business?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of professionals using LumenR to automate their workflows and grow smarter
          </p>
          <Link href="/signup">
            <Button size="lg" className="gap-2 text-lg px-8 rounded-xl bg-purple-600 hover:bg-purple-700 text-white">
              Start Your Free Trial <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 7-day trial • Cancel anytime
          </p>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Docs</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms</a></li>
                <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2025 LumenR — All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}