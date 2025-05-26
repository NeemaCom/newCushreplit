import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  FileText, 
  Calculator, 
  Globe, 
  CreditCard,
  Plane,
  Building,
  Users,
  Calendar,
  Clock,
  Zap
} from "lucide-react";
import Header from "@/components/header";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion';
}

const quickActions = [
  {
    icon: Calculator,
    title: "Currency Exchange",
    description: "Get current exchange rates",
    prompt: "What's the current NGN to GBP exchange rate?"
  },
  {
    icon: CreditCard,
    title: "Transfer Guide",
    description: "How to send money internationally",
    prompt: "How do I send money from Nigeria to the UK?"
  },
  {
    icon: FileText,
    title: "Document Help",
    description: "Immigration document assistance",
    prompt: "What documents do I need for a UK visa application?"
  },
  {
    icon: Building,
    title: "Loan Information",
    description: "Learn about loan options",
    prompt: "What loan options are available for Nigerian residents?"
  }
];

export default function Imisi() {
  const { user } = useAuth();
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: `Hello ${user?.firstName || 'there'}! I'm Imisi, your AI assistant for all things related to international finance and immigration. I'm here to help you with transfers, visa applications, loan information, and more. How can I assist you today?`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/imisi/chat", {
        message: userMessage,
        conversationHistory: messages.slice(-5) // Send last 5 messages for context
      });
      return response.json();
    },
    onSuccess: (data) => {
      setMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        content: data.response,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }]);
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }]);
      setIsTyping(false);
    }
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: message,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage("");
    setIsTyping(true);
    
    sendMessageMutation.mutate(message);
  };

  const handleQuickAction = (prompt: string) => {
    setMessage(prompt);
    handleSendMessage();
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-cush-gray-900 mb-2">Meet Imisi</h1>
              <p className="text-lg text-cush-gray-600">
                Your AI-powered assistant for immigration and financial services
              </p>
            </div>
          </div>
          
          <Badge className="bg-blue-100 text-blue-800 px-4 py-2 text-lg">
            <Bot className="w-5 h-5 mr-2" />
            AI Powered
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-cush-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {quickActions.map((action, index) => {
                  const IconComponent = action.icon;
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.prompt)}
                      className="w-full p-3 text-left bg-cush-gray-25 hover:bg-cush-primary-50 rounded-xl transition-all duration-200 group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center group-hover:bg-cush-primary group-hover:text-white transition-colors">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-cush-gray-900 text-sm">{action.title}</h3>
                          <p className="text-xs text-cush-gray-600">{action.description}</p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Capabilities */}
            <Card className="card-modern mt-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900">What I Can Help With</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Money transfer guidance</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>Visa application support</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Exchange rate information</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span>Loan eligibility checks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span>Document requirements</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span>Process timelines</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <Card className="card-modern h-[600px] flex flex-col">
              <CardHeader className="border-b border-cush-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/api/placeholder/40/40" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-cush-gray-900">Imisi AI Assistant</h3>
                      <p className="text-sm text-green-600 flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        Online
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-cush-primary-50 text-cush-primary">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    Chat Active
                  </Badge>
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${
                      msg.isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {msg.isUser ? (
                        <AvatarImage src={user?.profileImageUrl} />
                      ) : (
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          AI
                        </AvatarFallback>
                      )}
                      {msg.isUser && (
                        <AvatarFallback className="bg-cush-primary text-white text-xs">
                          {user?.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className={`flex-1 ${msg.isUser ? 'text-right' : ''}`}>
                      <div
                        className={`inline-block p-3 rounded-2xl max-w-xs lg:max-w-md ${
                          msg.isUser
                            ? 'bg-cush-primary text-white'
                            : 'bg-cush-gray-100 text-cush-gray-900'
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                      <p className="text-xs text-cush-gray-500 mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-cush-gray-100 rounded-2xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-cush-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-cush-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-cush-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-cush-gray-200 p-4">
                <div className="flex space-x-3">
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask Imisi anything about transfers, visas, loans, or immigration..."
                    className="flex-1 resize-none min-h-[44px] max-h-[100px]"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || sendMessageMutation.isPending}
                    className="bg-cush-primary hover:bg-cush-primary-600 text-white px-6"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-cush-gray-500 mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}