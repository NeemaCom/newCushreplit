import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, X, Lightbulb, Star, Coffee, Rocket, Heart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface HelpBubble {
  id: string;
  title: string;
  content: string;
  emoji: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  trigger: string; // CSS selector for the element to attach to
  wittyMessage: string;
  category: 'tip' | 'warning' | 'celebration' | 'guide';
}

interface ContextualHelpProps {
  currentPage: string;
  userLevel?: number;
}

export default function ContextualHelpBubbles({ currentPage, userLevel = 1 }: ContextualHelpProps) {
  const [activeBubble, setActiveBubble] = useState<HelpBubble | null>(null);
  const [dismissedBubbles, setDismissedBubbles] = useState<string[]>([]);
  const [helpBubbles, setHelpBubbles] = useState<HelpBubble[]>([]);

  const allHelpBubbles: Record<string, HelpBubble[]> = {
    dashboard: [
      {
        id: 'dashboard_welcome',
        title: 'Welcome to Your Command Center! 🚀',
        content: 'This is your immigration mission control. From here, you can track your progress, manage transactions, and connect with our amazing community!',
        emoji: '🎯',
        position: 'bottom',
        trigger: '.dashboard-header',
        wittyMessage: "Think of this as your immigration superhero headquarters – minus the cape, but with way better financial tools! 🦸‍♀️",
        category: 'guide'
      },
      {
        id: 'wallet_balance',
        title: 'Your Financial Fortress 💰',
        content: 'Keep track of your multi-currency wallet here. Pro tip: Regular small transfers often get better rates than one big transfer!',
        emoji: '💳',
        position: 'left',
        trigger: '.wallet-section',
        wittyMessage: "Money doesn't grow on trees, but with smart transfers, it can definitely multiply! 🌳💸",
        category: 'tip'
      },
      {
        id: 'transaction_history',
        title: 'Your Money\'s Journey 📈',
        content: 'Every transfer tells a story. This is your financial autobiography – and it\'s looking pretty good!',
        emoji: '📊',
        position: 'top',
        trigger: '.transaction-list',
        wittyMessage: "Each transaction is a step closer to your dreams. You're basically writing your success story, one transfer at a time! ✨",
        category: 'celebration'
      }
    ],
    community: [
      {
        id: 'community_intro',
        title: 'Welcome to the Cush Family! 👨‍👩‍👧‍👦',
        content: 'Connect with fellow immigrants, share experiences, and get advice from people who\'ve walked your path before.',
        emoji: '🤝',
        position: 'bottom',
        trigger: '.community-header',
        wittyMessage: "Immigration is a team sport – and you've just joined the championship league! 🏆",
        category: 'guide'
      },
      {
        id: 'mentor_connect',
        title: 'Find Your Immigration Yoda 🧙‍♂️',
        content: 'Our mentors have been where you are. They\'re here to share wisdom, not judge your questions (no matter how many times you ask about visa documents!).',
        emoji: '👨‍🏫',
        position: 'right',
        trigger: '.mentor-section',
        wittyMessage: "Every expert was once a beginner who refused to give up. Your mentor is waiting to help you become the next success story! 🌟",
        category: 'tip'
      }
    ],
    transactions: [
      {
        id: 'exchange_rates',
        title: 'Rate Detective Mode: ON 🔍',
        content: 'Exchange rates change faster than your mood on Monday morning. We\'ll help you catch the good ones!',
        emoji: '📈',
        position: 'top',
        trigger: '.rate-display',
        wittyMessage: "Timing the market is like trying to catch a butterfly – patience and the right tools make all the difference! 🦋",
        category: 'tip'
      },
      {
        id: 'transfer_limits',
        title: 'Playing by the Rules 📋',
        content: 'Transfer limits exist for security, but don\'t worry – we\'ll help you navigate them like a pro.',
        emoji: '🛡️',
        position: 'bottom',
        trigger: '.limit-info',
        wittyMessage: "Think of limits like speed limits – they're there to keep everyone safe, but we'll help you cruise efficiently! 🚗",
        category: 'warning'
      }
    ],
    profile: [
      {
        id: 'profile_completion',
        title: 'Your Digital Passport ✈️',
        content: 'A complete profile unlocks more features and helps our team serve you better. Plus, you look more trustworthy!',
        emoji: '📝',
        position: 'right',
        trigger: '.profile-form',
        wittyMessage: "A blank profile is like showing up to a party in pajamas – technically possible, but why not dress to impress? 👔",
        category: 'tip'
      }
    ]
  };

  useEffect(() => {
    const pageHelpBubbles = allHelpBubbles[currentPage] || [];
    const dismissed = JSON.parse(localStorage.getItem('dismissedHelpBubbles') || '[]');
    setDismissedBubbles(dismissed);
    
    // Filter bubbles based on user level and dismissal status
    const availableBubbles = pageHelpBubbles.filter(bubble => {
      return !dismissed.includes(bubble.id);
    });
    
    setHelpBubbles(availableBubbles);

    // Auto-show first bubble after a delay
    if (availableBubbles.length > 0 && !activeBubble) {
      setTimeout(() => {
        setActiveBubble(availableBubbles[0]);
      }, 2000);
    }
  }, [currentPage, userLevel]);

  const dismissBubble = (bubbleId: string, permanent = false) => {
    setActiveBubble(null);
    
    if (permanent) {
      const newDismissed = [...dismissedBubbles, bubbleId];
      setDismissedBubbles(newDismissed);
      localStorage.setItem('dismissedHelpBubbles', JSON.stringify(newDismissed));
    }
  };

  const showNextBubble = () => {
    if (!activeBubble) return;
    
    const currentIndex = helpBubbles.findIndex(b => b.id === activeBubble.id);
    if (currentIndex < helpBubbles.length - 1) {
      setActiveBubble(helpBubbles[currentIndex + 1]);
    } else {
      setActiveBubble(null);
    }
  };

  const getBubbleIcon = (category: string) => {
    switch (category) {
      case 'tip': return <Lightbulb className="w-5 h-5 text-yellow-500" />;
      case 'warning': return <HelpCircle className="w-5 h-5 text-orange-500" />;
      case 'celebration': return <Star className="w-5 h-5 text-purple-500" />;
      case 'guide': return <Rocket className="w-5 h-5 text-blue-500" />;
      default: return <HelpCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBubbleColor = (category: string) => {
    switch (category) {
      case 'tip': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      case 'warning': return 'bg-gradient-to-r from-orange-400 to-red-400';
      case 'celebration': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'guide': return 'bg-gradient-to-r from-blue-400 to-cyan-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  // Help bubble trigger button
  const HelpTrigger = () => (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1, type: "spring" }}
    >
      <Button
        onClick={() => {
          if (helpBubbles.length > 0) {
            setActiveBubble(helpBubbles[0]);
          }
        }}
        className={`w-14 h-14 rounded-full shadow-lg ${getBubbleColor('tip')} text-white border-0 hover:scale-110 transition-transform`}
      >
        <HelpCircle className="w-6 h-6" />
      </Button>
      
      {/* Pulsing ring animation */}
      <div className="absolute inset-0 rounded-full bg-yellow-400 animate-ping opacity-20"></div>
    </motion.div>
  );

  return (
    <>
      <HelpTrigger />
      
      <AnimatePresence>
        {activeBubble && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="fixed bottom-24 right-6 z-50 max-w-sm"
          >
            <Card className="bg-white shadow-2xl border-0 overflow-hidden">
              <div className={`h-2 ${getBubbleColor(activeBubble.category)}`}></div>
              
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    {getBubbleIcon(activeBubble.category)}
                    <span className="text-2xl">{activeBubble.emoji}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissBubble(activeBubble.id)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {/* Content */}
                <h3 className="font-bold text-gray-800 mb-2">{activeBubble.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{activeBubble.content}</p>
                
                {/* Witty message */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-start space-x-2">
                    <Coffee className="w-4 h-4 text-brown-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-gray-700 italic">{activeBubble.wittyMessage}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissBubble(activeBubble.id, true)}
                    className="text-gray-500 text-xs"
                  >
                    Don't show again
                  </Button>
                  
                  <div className="space-x-2">
                    {helpBubbles.findIndex(b => b.id === activeBubble.id) < helpBubbles.length - 1 && (
                      <Button
                        size="sm"
                        onClick={showNextBubble}
                        className="text-xs bg-blue-500 hover:bg-blue-600"
                      >
                        Next Tip →
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => dismissBubble(activeBubble.id)}
                      className="text-xs"
                    >
                      Got it! ✨
                    </Button>
                  </div>
                </div>

                {/* Progress indicator */}
                {helpBubbles.length > 1 && (
                  <div className="flex justify-center mt-3 space-x-1">
                    {helpBubbles.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === helpBubbles.findIndex(b => b.id === activeBubble.id)
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Cute floating hearts for celebration bubbles */}
            {activeBubble.category === 'celebration' && (
              <div className="absolute -top-4 -right-2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -20, opacity: 0 }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                    className="absolute"
                  >
                    <Heart className="w-4 h-4 text-pink-400 fill-current" />
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}