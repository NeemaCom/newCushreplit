import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2,
  Sparkles, 
  Crown,
  ArrowRight,
  Star
} from "lucide-react";
import imisiAvatar from "@assets/vecteezy_young-afro-man_14070616-removebg-preview.png";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'suggestion' | 'concierge-offer';
}

export default function FloatingImisi() {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      content: `Hi! I'm Imisi, your AI immigration assistant. Ask me anything about visas, transfers, or loans!`,
      isUser: false,
      timestamp: new Date(),
      type: 'text'
    }
  ]);

  // Check if user has Concierge subscription
  const { data: subscription } = useQuery({
    queryKey: ['/api/concierge/subscription'],
    retry: false,
    enabled: isAuthenticated
  });

  // Detect if user needs premium assistance
  const detectPremiumNeed = (userMessage: string) => {
    const premiumKeywords = [
      'complicated', 'complex', 'urgent', 'help me with', 'struggling', 
      'deadline', 'rejected', 'denied', 'appeal', 'priority', 'emergency',
      'document review', 'application help', 'visa interview', 'follow up',
      'not sure what to do', 'confused', 'overwhelmed'
    ];
    
    return premiumKeywords.some(keyword => 
      userMessage.toLowerCase().includes(keyword)
    );
  };

  const sendMessageMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await apiRequest("POST", "/api/imisi/chat", {
        message: userMessage,
        conversationHistory: messages.slice(-3) // Send last 3 messages for context
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
      
      // Check if user needs premium assistance
      const lastUserMessage = messages[messages.length - 1]?.content || "";
      if (!subscription && detectPremiumNeed(lastUserMessage)) {
        setTimeout(() => {
          setMessages(prev => [...prev, {
            id: `concierge-offer-${Date.now()}`,
            content: "Need deeper assistance? Our Concierge Service provides dedicated human experts for complex immigration cases. Visit /concierge to upgrade.",
            isUser: false,
            timestamp: new Date(),
            type: 'concierge-offer'
          }]);
        }, 1000);
      }
      
      setIsTyping(false);
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        content: "I'm having trouble connecting. Please try again or visit /concierge for immediate human assistance.",
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Don't show if user is not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Floating Chat Head */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <Button
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-2xl border-4 border-white transform hover:scale-110 transition-all duration-300 relative overflow-hidden"
            style={{
              animation: 'glow-ring 2s ease-in-out infinite'
            }}
          >
            <img 
              src={imisiAvatar} 
              alt="Imisi AI Assistant" 
              className="w-14 h-14 rounded-full object-cover"
            />
          </Button>
          
          {/* Tooltip */}
          <div className="absolute bottom-20 right-0 bg-black text-white text-sm px-3 py-2 rounded-lg shadow-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Imisi AI
            <div className="absolute top-full right-4 border-l-4 border-r-4 border-t-4 border-transparent border-t-black"></div>
          </div>
        </div>
      )}

      {/* Floating Chat Window */}
      {isOpen && (
        <div className={`fixed z-50 bg-white shadow-2xl border transition-all duration-300 gpu-accelerated ${
          isMinimized 
            ? 'bottom-4 right-4 w-80 h-16 rounded-2xl' 
            : 'bottom-4 right-4 w-80 h-96 rounded-2xl max-h-[400px]'
        }`}>
          
          {/* Header */}
          <CardHeader className="border-b border-gray-200 rounded-t-2xl bg-gradient-to-r from-blue-50 to-purple-50 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={imisiAvatar} alt="Imisi AI" className="object-cover" />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                    AI
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Imisi AI</h3>
                  <div className="text-sm text-green-600 flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Online
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Messages and Input - Only show when not minimized */}
          {!isMinimized && (
            <>
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 h-[calc(100%-140px)] scrollbar-thin scrollbar-thumb-gray-300">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start space-x-3 ${
                      msg.isUser ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      {msg.isUser ? (
                        <>
                          <AvatarImage src={user?.profileImageUrl} />
                          <AvatarFallback className="bg-blue-600 text-white text-xs">
                            {user?.firstName?.[0] || 'U'}
                          </AvatarFallback>
                        </>
                      ) : (
                        <>
                          <AvatarImage src={imisiAvatar} alt="Imisi AI" className="object-cover" />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                            AI
                          </AvatarFallback>
                        </>
                      )}
                    </Avatar>
                    
                    <div className={`flex-1 ${msg.isUser ? 'text-right' : ''}`}>
                      {msg.type === 'concierge-offer' ? (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-3 max-w-xs">
                          <div className="flex items-center space-x-2 mb-2">
                            <Crown className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-purple-800 text-sm">Premium Available</span>
                          </div>
                          <p className="text-xs text-gray-700 mb-2">{msg.content}</p>
                          <Button 
                            size="sm" 
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs flex items-center space-x-1 w-full"
                            onClick={() => window.location.href = '/concierge'}
                          >
                            <Star className="w-3 h-3" />
                            <span>Upgrade</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className={`inline-block p-3 rounded-2xl max-w-xs ${
                            msg.isUser
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <div className="text-sm leading-relaxed">
                            {msg.content.split(/(\s\/concierge\s|\s\/concierge$|Visit \/concierge)/).map((part, index) => {
                              if (part.includes('/concierge')) {
                                return (
                                  <span key={index} className="inline-block mx-1 my-1">
                                    <Button
                                      size="sm"
                                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 text-xs"
                                      onClick={() => window.location.href = '/concierge'}
                                    >
                                      <Crown className="w-3 h-3 mr-1" />
                                      Upgrade
                                      <ArrowRight className="w-3 h-3 ml-1" />
                                    </Button>
                                  </span>
                                );
                              }
                              return <span key={index}>{part}</span>;
                            })}
                          </div>
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={imisiAvatar} alt="Imisi AI" className="object-cover" />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                        AI
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 rounded-2xl p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              {/* Message Input */}
              <div className="border-t border-gray-200 p-4 rounded-b-2xl bg-gray-50 safe-area-inset-bottom">
                <div className="flex space-x-3 items-end">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about visas, transfers, loans..."
                    className="flex-1 border-gray-300 focus:border-blue-500 text-fluid-sm min-h-[48px] touch-target"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="touch-button bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}