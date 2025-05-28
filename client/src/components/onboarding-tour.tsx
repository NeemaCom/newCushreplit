import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, ArrowRight, ArrowLeft, X, Heart, Star } from 'lucide-react';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  characterExpression: 'excited' | 'helpful' | 'celebrating' | 'thinking' | 'welcoming';
  characterMessage: string;
  highlightColor: string;
}

interface OnboardingTourProps {
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [showTour, setShowTour] = useState(true);
  const [characterAnimation, setCharacterAnimation] = useState('bounce');

  const tourSteps: TourStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Cush! 🎉',
      content: 'Hi there! I\'m Cush, your friendly immigration assistant! I\'m here to make your journey as smooth as possible. Ready for a quick tour?',
      position: 'center',
      characterExpression: 'welcoming',
      characterMessage: 'Welcome aboard! This is going to be amazing! ✨',
      highlightColor: 'from-blue-400 to-purple-500'
    },
    {
      id: 'dashboard',
      title: 'Your Mission Control Center 🚀',
      content: 'This is your dashboard - your home base! Here you can see your progress, check your wallet balance, and track all your immigration milestones.',
      target: '.dashboard-header',
      position: 'bottom',
      characterExpression: 'excited',
      characterMessage: 'Think of this as your immigration superhero headquarters! 🦸‍♀️',
      highlightColor: 'from-green-400 to-blue-500'
    },
    {
      id: 'wallet',
      title: 'Your Financial Powerhouse 💰',
      content: 'Your multi-currency wallet lives here! Send money home, exchange currencies, and keep track of every penny. We\'ve got the best rates in town!',
      target: '.wallet-section',
      position: 'left',
      characterExpression: 'helpful',
      characterMessage: 'Money management made magical! No more confusing exchange rates! 🎭',
      highlightColor: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'community',
      title: 'Your Immigration Family 👨‍👩‍👧‍👦',
      content: 'Connect with thousands of people just like you! Share stories, get advice, and make lifelong friends. You\'re never alone on this journey!',
      target: '.community-link',
      position: 'bottom',
      characterExpression: 'celebrating',
      characterMessage: 'The best part about immigration? The amazing people you meet! 🤗',
      highlightColor: 'from-pink-400 to-red-500'
    },
    {
      id: 'services',
      title: 'All Your Immigration Needs 📋',
      content: 'From document processing to housing search, from loan pre-qualification to concierge services - we\'ve got everything covered!',
      target: '.services-section',
      position: 'top',
      characterExpression: 'thinking',
      characterMessage: 'One platform, infinite possibilities! We\'re like your immigration Swiss Army knife! 🛠️',
      highlightColor: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'achievements',
      title: 'Celebrate Every Win! 🏆',
      content: 'Every step you take earns you points and unlocks achievements. Because immigrating is hard work, and every milestone deserves celebration!',
      target: '.achievements-section',
      position: 'right',
      characterExpression: 'celebrating',
      characterMessage: 'You\'re already a champion for taking this step! Let\'s collect some badges! 🎖️',
      highlightColor: 'from-yellow-400 to-pink-500'
    },
    {
      id: 'complete',
      title: 'You\'re All Set! 🌟',
      content: 'That\'s it! You\'re ready to start your amazing journey with Cush. Remember, I\'m always here if you need help. Let\'s make your immigration dreams come true!',
      position: 'center',
      characterExpression: 'celebrating',
      characterMessage: 'Time to turn those dreams into reality! You\'ve got this! 💪✨',
      highlightColor: 'from-green-400 to-blue-500'
    }
  ];

  const getCharacterEmoji = (expression: string) => {
    const expressions = {
      excited: '🤩',
      helpful: '😊',
      celebrating: '🎉',
      thinking: '🤔',
      welcoming: '👋'
    };
    return expressions[expression as keyof typeof expressions] || '😊';
  };

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setCharacterAnimation('slideIn');
    } else {
      completeTour();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCharacterAnimation('slideIn');
    }
  };

  const completeTour = () => {
    setShowTour(false);
    localStorage.setItem('onboardingCompleted', 'true');
    onComplete();
  };

  const skipTour = () => {
    setShowTour(false);
    localStorage.setItem('onboardingSkipped', 'true');
    onSkip();
  };

  useEffect(() => {
    const completed = localStorage.getItem('onboardingCompleted');
    const skipped = localStorage.getItem('onboardingSkipped');
    if (completed || skipped) {
      setShowTour(false);
    }
  }, []);

  const currentTourStep = tourSteps[currentStep];
  const progress = ((currentStep + 1) / tourSteps.length) * 100;

  // Character Component
  const Character = () => (
    <motion.div
      key={characterAnimation}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
      className="relative"
    >
      {/* Character Body */}
      <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-3xl shadow-lg">
        {getCharacterEmoji(currentTourStep.characterExpression)}
      </div>
      
      {/* Floating Hearts/Stars */}
      {currentTourStep.characterExpression === 'celebrating' && (
        <div className="absolute -top-2 -right-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 0, opacity: 1, scale: 0 }}
              animate={{ y: -20, opacity: 0, scale: 1 }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3
              }}
              className="absolute"
            >
              {i % 2 === 0 ? (
                <Heart className="w-4 h-4 text-pink-400 fill-current" />
              ) : (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full animate-pulse opacity-30 scale-110"></div>
    </motion.div>
  );

  if (!showTour) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4"
      >
        {/* Tour Card */}
        <motion.div
          key={currentStep}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: -20, opacity: 0 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative max-w-lg w-full"
        >
          <Card className="bg-white rounded-2xl shadow-2xl border-0 overflow-hidden">
            {/* Progress Bar */}
            <div className={`h-2 bg-gradient-to-r ${currentTourStep.highlightColor}`}>
              <div 
                className="h-full bg-white/30 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <CardContent className="p-6">
              {/* Header with Character */}
              <div className="flex items-start space-x-4 mb-4">
                <Character />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-1">
                    {currentTourStep.title}
                  </h2>
                  <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 italic relative">
                    <div className="absolute -left-2 top-3 w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-50"></div>
                    "{currentTourStep.characterMessage}"
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={skipTour}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Content */}
              <div className="mb-6">
                <p className="text-gray-700 leading-relaxed">
                  {currentTourStep.content}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-500">
                    Step {currentStep + 1} of {tourSteps.length}
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {Math.round(progress)}% Complete
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              {/* Navigation */}
              <div className="flex justify-between items-center">
                <div className="flex space-x-2">
                  {currentStep > 0 && (
                    <Button
                      variant="outline"
                      onClick={previousStep}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    onClick={skipTour}
                    className="text-gray-500"
                  >
                    Skip Tour
                  </Button>
                </div>

                <Button
                  onClick={nextStep}
                  className={`bg-gradient-to-r ${currentTourStep.highlightColor} text-white hover:shadow-lg transition-all flex items-center space-x-2`}
                >
                  <span>
                    {currentStep === tourSteps.length - 1 ? 'Start Journey!' : 'Next'}
                  </span>
                  {currentStep === tourSteps.length - 1 ? (
                    <Sparkles className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {/* Fun Facts */}
              {currentStep < tourSteps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
                >
                  <p className="text-xs text-blue-700">
                    💡 <strong>Fun fact:</strong> Over 95% of our users complete their first transaction within 24 hours of joining! You're in great company.
                  </p>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Highlight Overlay for Targeted Elements */}
        {currentTourStep.target && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, transparent 100px, rgba(0,0,0,0.7) 200px)`
            }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}