'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, Sparkles, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lumen';
  timestamp: Date;
}

export default function LumenAIPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { userProfile } = useAuth();

  // Prebuilt financial prompts
  const quickPrompts = [
    { id: 1, text: "How can I improve my cash flow?", icon: "💰" },
    { id: 2, text: "Show my top clients this quarter", icon: "👥" },
    { id: 3, text: "What's my revenue trend?", icon: "📈" },
    { id: 4, text: "Which invoices are overdue?", icon: "⚠️" },
    { id: 5, text: "Analyze my expenses this month", icon: "📊" },
    { id: 6, text: "What's my profit margin?", icon: "💹" },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial welcome message
    setMessages([{
      id: '1',
      text: `Hi ${userProfile?.first_name || 'there'}! I'm Lumen, your AI business assistant. I have complete knowledge of the LumenR platform and can help you with:

🏢 **Business Management**
• Managing clients and tracking projects
• Creating quotes and invoices
• Financial analytics and insights

📊 **Smart Features**
• Payment tracking and receipts
• Contract management
• Calendar and booking synchronization

💡 **AI Capabilities**
• Natural language commands
• Business recommendations
• Data analysis and reporting

💬 **Getting Started**
• Ask me anything about LumenR features
• Request help with specific tasks
• Get personalized business insights

What would you like to know or do today?`,
      sender: 'lumen',
      timestamp: new Date()
    }]);
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const messageText = input.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    // Simulate AI response with knowledge about LumenR
    setTimeout(() => {
      const lowerInput = messageText.toLowerCase();
      let response = '';

      // Knowledge base responses about LumenR
      if (lowerInput.includes('client') || lowerInput.includes('customer')) {
        response = "I can help you manage clients! In LumenR:\n\n• Navigate to **Clients** in the sidebar to view all your clients\n• Click **+ Add Client** to create a new client\n• Track client information, contacts, and project history\n• View client timeline for all interactions\n• Export client data for reporting\n\nWould you like me to guide you through adding your first client?";
      } else if (lowerInput.includes('invoice')) {
        response = "LumenR makes invoicing simple! Here's how:\n\n• Go to **Invoices** in the Financial section\n• Create professional invoices with your branding\n• Track payment status (Pending, Paid, Overdue)\n• Send invoices directly to clients\n• Record payments and generate receipts\n• Convert quotes to invoices automatically\n\nYou can also track invoice analytics in the Insights section. Need help creating your first invoice?";
      } else if (lowerInput.includes('quote')) {
        response = "Quotes in LumenR help you win more business:\n\n• Create detailed quotes with line items\n• Include services, products, and custom items\n• Set validity periods and terms\n• Convert approved quotes to invoices instantly\n• Track quote status and follow-ups\n\nVisit the **Quotes** section to get started!";
      } else if (lowerInput.includes('payment') || lowerInput.includes('receipt')) {
        response = "Managing payments and receipts:\n\n**Payments:**\n• Track all incoming payments\n• Link payments to invoices\n• Support multiple payment methods\n• Generate payment reports\n\n**Receipts:**\n• Upload and scan expense receipts\n• OCR technology extracts data automatically\n• Organize by category and vendor\n• Track business expenses for tax time\n\nCheck the **Payments** and **Receipts** sections in your sidebar!";
      } else if (lowerInput.includes('calendar') || lowerInput.includes('booking') || lowerInput.includes('schedule')) {
        response = "LumenR's scheduling features:\n\n**Calendar:**\n• Sync with Google Calendar or Outlook\n• View all appointments in one place\n• Schedule meetings with clients\n\n**Bookings:**\n• Manage client appointments\n• Set availability and duration\n• Send automatic reminders\n• Track booking history\n\nNavigate to **Calendar** or **Bookings** to manage your schedule!";
      } else if (lowerInput.includes('cash flow') || lowerInput.includes('cashflow')) {
        response = "Here are strategies to improve your cash flow:\n\n**Short-term actions:**\n• Review and follow up on overdue invoices (check Invoices page)\n• Offer early payment discounts to encourage faster payments\n• Set shorter payment terms (e.g., Net 15 instead of Net 30)\n\n**Medium-term strategies:**\n• Require deposits or partial upfront payments\n• Automate payment reminders for clients\n• Negotiate better terms with your suppliers\n\n**Long-term improvements:**\n• Build a cash reserve (aim for 3-6 months expenses)\n• Diversify your client base\n• Consider recurring revenue models\n\nVisit **Financial Insights** to monitor your cash flow trends!";
      } else if (lowerInput.includes('top client') || lowerInput.includes('best client')) {
        response = "To view your top clients:\n\n1. Navigate to **Financial Insights** in the sidebar\n2. Check the \"Top Clients by Revenue\" chart\n3. View detailed client revenue breakdowns\n\nYour top clients are typically those who:\n• Generate the most revenue\n• Pay invoices on time\n• Request recurring services\n• Refer new business\n\nConsider nurturing these relationships with:\n• Exclusive offers or loyalty discounts\n• Priority support\n• Regular check-ins\n• Thank you gestures";
      } else if (lowerInput.includes('revenue trend') || lowerInput.includes('revenue growth')) {
        response = "Track your revenue trends:\n\n**In LumenR:**\n• Visit **Financial Insights** for revenue charts\n• View monthly/quarterly comparisons\n• See revenue by client or service\n• Export data for detailed analysis\n\n**Current performance indicators:**\n• Month-over-month growth rate\n• Year-over-year comparison\n• Average invoice value\n• Revenue per client\n\n**What to look for:**\n✅ Steady upward trend = healthy growth\n⚠️ Seasonal fluctuations = plan for slow periods\n🔴 Declining trend = time to adjust strategy\n\nCheck your dashboard for real-time insights!";
      } else if (lowerInput.includes('overdue') || lowerInput.includes('late payment')) {
        response = "Managing overdue invoices:\n\n**View overdue invoices:**\n1. Go to **Invoices** page\n2. Click the **Overdue** tab\n3. See all invoices past their due date\n\n**Follow-up best practices:**\n• Send friendly reminder emails (automated in Settings)\n• Call clients for large amounts\n• Offer payment plans if needed\n• Consider late fees for persistent issues\n\n**Prevention strategies:**\n• Set clear payment terms upfront\n• Send invoices immediately after service\n• Accept multiple payment methods\n• Follow up before due date\n\nHead to the Invoices page to take action!";
      } else if (lowerInput.includes('expense') || lowerInput.includes('spending')) {
        response = "Analyze your expenses:\n\n**In LumenR:**\n• Visit **Receipts** to view all expenses\n• Check **Financial Insights** for expense breakdown\n• Filter by category, vendor, or date\n• Export for tax preparation\n\n**Expense categories tracked:**\n• Supplies and materials\n• Software and subscriptions\n• Travel and transportation\n• Professional services\n• Marketing and advertising\n• Office expenses\n\n**Tips to reduce expenses:**\n• Review subscriptions monthly\n• Negotiate with vendors\n• Buy in bulk when possible\n• Use tax deductions\n\nVisit the Receipts page to upload and categorize expenses!";
      } else if (lowerInput.includes('profit') || lowerInput.includes('margin')) {
        response = "Understanding your profit margins:\n\n**Profit Margin Formula:**\nProfit Margin = (Revenue - Expenses) / Revenue × 100\n\n**In LumenR:**\n• View **Financial Insights** for profit calculations\n• Track revenue from Invoices (paid status)\n• Monitor expenses in Receipts\n• Calculate net profit margins\n\n**Healthy profit margins:**\n• Service businesses: 15-30%\n• Consulting: 20-40%\n• Premium services: 30-50%\n\n**Improve your margins:**\n• Increase pricing strategically\n• Reduce operational costs\n• Focus on high-margin services\n• Improve efficiency\n\nCheck your dashboard for current profit metrics!";
      } else if (lowerInput.includes('insight') || lowerInput.includes('analytic') || lowerInput.includes('report')) {
        response = "Get powerful insights with LumenR:\n\n• Revenue trends and forecasts\n• Client growth analysis\n• Invoice payment tracking\n• Top clients by revenue\n• Monthly/quarterly comparisons\n• Expense categorization\n• Profit margins\n\nVisit **Financial Insights** to see your business performance dashboard!";
      } else if (lowerInput.includes('contract')) {
        response = "Contract management made easy:\n\n• Store all contracts in one place\n• E-signature integration\n• Track contract terms and renewals\n• Link contracts to clients and projects\n• Set expiration reminders\n\nAccess **Contracts** from the Financial section!";
      } else if (lowerInput.includes('setting') || lowerInput.includes('profile')) {
        response = "Customize your LumenR experience:\n\n• Update your business profile and branding\n• Configure invoice templates\n• Set tax rates and currency\n• Manage team members and permissions\n• Integration settings\n• Notification preferences\n\nHead to **Settings** to personalize your workspace!";
      } else if (lowerInput.includes('help') || lowerInput.includes('how')) {
        response = "I'm here to help! I can assist you with:\n\n• Navigating LumenR features\n• Creating and managing business documents\n• Understanding analytics and reports\n• Setting up integrations\n• Best practices for business management\n• Troubleshooting common issues\n\nJust ask me anything specific, or tell me what you'd like to accomplish!";
      } else {
        response = `I understand you're asking about "${messageText}". While I'm still learning, here's what I can help you with in LumenR:

• **Clients** - Manage your customer relationships
• **Financial** - Quotes, Invoices, Contracts, Receipts, Payments
• **Schedule** - Bookings and Calendar integration
• **Insights** - Business analytics and reporting
• **Settings** - Customize your workspace

Try asking me something specific like "How do I create an invoice?" or "Tell me about client management!"`;
      }

      const lumenMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'lumen',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, lumenMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-5xl">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Lumen AI Assistant</h1>
            <p className="text-sm text-muted-foreground">Your intelligent business companion with complete LumenR knowledge</p>
          </div>
        </div>
        
        <div className="flex gap-2 mt-4">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            AI-Powered
          </Badge>
          <Badge variant="secondary" className="gap-1">
            <Zap className="h-3 w-3" />
            Real-time Help
          </Badge>
        </div>
      </div>

      <Card className="bg-card border-border backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl">
        {/* Quick Prompts Section */}
        <div className="p-4 border-b border-border bg-muted/30">
          <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wide">💡 Quick Financial Insights</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt.id}
                variant="outline"
                size="sm"
                onClick={() => {
                  setInput(prompt.text);
                  setTimeout(() => {
                    const form = document.querySelector('form');
                    if (form) {
                      form.requestSubmit();
                    }
                  }, 100);
                }}
                className="justify-start text-left h-auto py-2 px-3 hover:bg-purple-500/10 hover:border-purple-500/50"
                disabled={isProcessing}
              >
                <span className="mr-2">{prompt.icon}</span>
                <span className="text-xs line-clamp-2">{prompt.text}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <div className="h-[600px] overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted'
                  }`}
                >
                  {message.sender === 'lumen' && (
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-xs font-semibold text-purple-600">Lumen AI</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-line">{message.text}</p>
                  <p className="text-xs mt-2 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-muted rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-muted-foreground">Lumen is thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumen anything about LumenR..."
              className="flex-1"
              disabled={isProcessing}
            />
            <Button
              type="submit"
              size="icon"
              className="bg-purple-600 hover:bg-purple-700 text-white"
              disabled={!input.trim() || isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Lumen AI has complete knowledge of all LumenR features and can guide you through any task
          </p>
        </div>
      </Card>
    </div>
  );
}
