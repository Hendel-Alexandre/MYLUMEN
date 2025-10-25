'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, Loader2, Mic, Square, ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'lumen';
  timestamp: Date;
  images?: string[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const router = useRouter();

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
      text: "Hi! I'm Lumen, your AI business assistant for LumenR. I can help you with:\n\n🏢 **Business Management**\n• Create and track projects\n• Manage clients and tasks\n• Financial analytics\n\n📊 **Smart Operations**\n• Generate quotes and invoices\n• Track payments and expenses\n• Budget forecasting\n\n🎨 **AI Features**\n• Generate documents and reports\n• Analyze business data\n• Natural language commands\n\n💡 **Quick Actions**\n• Smart scheduling\n• Task automation\n• Team collaboration\n\nJust tell me what you need in plain language!",
      sender: 'lumen',
      timestamp: new Date()
    }]);
  }, []);

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

    // Simulate AI response for demo
    setTimeout(() => {
      const responses = [
        "I understand you want to " + messageText.toLowerCase() + ". To use the full AI capabilities, please sign up for a LumenR account. I can help you manage clients, create invoices, track projects, and much more!",
        "Great question! " + messageText + " is something I can help with once you're logged in. LumenR offers powerful AI-driven business management tools. Would you like to create an account?",
        "I'd love to help you with that! To access my full capabilities and create real business data, please sign up or log in to LumenR. It's free to get started!"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      const lumenMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: randomResponse,
        sender: 'lumen',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, lumenMessage]);
      setIsProcessing(false);
    }, 1000);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          // Handle audio data
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        toast({
          title: 'Recording stopped',
          description: 'Voice input is available for logged-in users'
        });
      };

      recorder.start();
      setIsRecording(true);

      toast({
        title: 'Recording...',
        description: 'Speak your message now'
      });

      // Auto-stop after 30 seconds
      setTimeout(() => {
        if (recorder.state === 'recording') {
          recorder.stop();
        }
      }, 30000);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not access microphone',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              LumenR
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Chat Interface */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4 bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800">
            <Sparkles className="h-3 w-3 mr-1" />
            AI-Powered Business Assistant
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Chat with <span className="text-purple-600 dark:text-purple-400">Lumen AI</span>
          </h1>
          <p className="text-muted-foreground">
            Experience the power of AI-driven business management
          </p>
        </div>

        <Card className="bg-card border-border backdrop-blur-xl overflow-hidden shadow-2xl rounded-3xl">
          {/* Messages Area */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map(message => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {isProcessing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-muted px-4 py-3 rounded-2xl">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 border-t bg-muted/30">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={isRecording ? "destructive" : "outline"}
                onClick={isRecording ? () => setIsRecording(false) : startRecording}
                disabled={isProcessing}
                className="h-12 w-12 p-0"
              >
                {isRecording ? (
                  <Square className="h-5 w-5 animate-pulse" />
                ) : (
                  <Mic className="h-5 w-5" />
                )}
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Lumen anything about LumenR..."
                className="flex-1 h-12"
                disabled={isProcessing || isRecording}
              />
              <Button 
                type="submit" 
                size="sm" 
                disabled={!input.trim() || isProcessing || isRecording}
                className="h-12 w-12 p-0 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* CTA Section */}
        <Card className="mt-8 p-8 text-center bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800">
          <h3 className="text-2xl font-bold mb-3">
            Unlock Full AI Capabilities
          </h3>
          <p className="text-muted-foreground mb-6">
            Sign up for LumenR to access all AI features, create real business data, and automate your workflows
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline" className="rounded-xl">
                Learn More
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
