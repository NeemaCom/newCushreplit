import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Wallet, 
  Home, 
  MessageCircle, 
  FileText, 
  Shield,
  Sparkles,
  CheckCircle,
  Target
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  target?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
  highlight?: boolean;
}

const onboardingSteps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Cush! 🎉',
    description: 'Your all-in-one platform for global immigration, financial services, and housing solutions. Let\'s take a quick tour!',
    icon: Sparkles,
    position: 'center',
    highlight: true
  },
  {
    id: 'wallet',
    title: 'Multi-Currency Wallet',
    description: 'Manage your finances across different currencies with real-time exchange rates and virtual cards.',
    icon: Wallet,
    target: '[href="/wallet"]',
    position: 'right',
    action: 'Click to explore your wallet'
  },
  {
    id: 'homebase',
    title: 'HomeBase Housing',
    description: 'Find perfect accommodation abroad with our AI-powered housing matchmaking system.',
    icon: Home,
    target: '[href="/homebase"]',
    position: 'right',
    action: 'Discover housing options'
  },
  {
    id: 'ai-assistant',
    title: 'AI Immigration Assistant',
    description: 'Get instant help with immigration questions from our intelligent AI assistant.',
    icon: MessageCircle,
    target: '[href="/imisi"]',
    position: 'right',
    action: 'Chat with AI assistant'
  },
  {
    id: 'documentation',
    title: 'Document Services',
    description: 'Secure document processing and verification services for all your immigration needs.',
    icon: FileText,
    target: '[href="/documentation"]',
    position: 'right',
    action: 'Access document services'
  },
  {
    id: 'security',
    title: 'Enterprise Security',
    description: 'Your account is protected with multi-factor authentication and advanced security features.',
    icon: Shield,
    target: '[href="/security-settings"]',
    position: 'right',
    action: 'Review security settings'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! ✨',
    description: 'Congratulations! You\'re ready to explore everything Cush has to offer. Welcome to your global journey!',
    icon: CheckCircle,
    position: 'center',
    highlight: true
  }
];

export default function OnboardingTutorial() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('hasCompletedOnboarding');
    const hasVisitedBefore = localStorage.getItem('hasVisitedCush');
    
    if (!hasCompletedOnboarding && hasVisitedBefore) {
      // Show onboarding after a short delay for returning users who haven't completed it
      setTimeout(() => setIsVisible(true), 3000);
    } else if (!hasVisitedBefore) {
      // Show onboarding immediately for brand new users
      setTimeout(() => setIsVisible(true), 1500);
    }
  }, []);

  useEffect(() => {
    if (isVisible && onboardingSteps[currentStep]?.target) {
      const targetElement = document.querySelector(onboardingSteps[currentStep].target!);
      if (targetElement) {
        setHighlightedElement(targetElement);
        // Scroll element into view
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isVisible]);

  useEffect(() => {
    if (highlightedElement) {
      // Add highlight class
      highlightedElement.classList.add('onboarding-highlight');
      
      return () => {
        highlightedElement.classList.remove('onboarding-highlight');
      };
    }
  }, [highlightedElement]);

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('hasCompletedOnboarding', 'true');
    setIsVisible(false);
    setHighlightedElement(null);
    console.log('Onboarding completed');
  };

  if (!isVisible) return null;

  const step = onboardingSteps[currentStep];
  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const IconComponent = step.icon;

  const getTooltipPosition = () => {
    if (!highlightedElement) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
    const rect = highlightedElement.getBoundingClientRect();
    const tooltipWidth = 350;
    const tooltipHeight = 200;
    
    switch (step.position) {
      case 'right':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.right + 20,
        };
      case 'left':
        return {
          top: rect.top + rect.height / 2 - tooltipHeight / 2,
          left: rect.left - tooltipWidth - 20,
        };
      case 'top':
        return {
          top: rect.top - tooltipHeight - 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: rect.bottom + 20,
          left: rect.left + rect.width / 2 - tooltipWidth / 2,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300">
        
        {/* Tooltip */}
        <Card 
          className="fixed w-80 shadow-2xl border-2 border-green-200 animate-in fade-in-0 zoom-in-95 duration-500"
          style={getTooltipPosition()}
        >
          <CardContent className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  step.highlight ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-green-100'
                }`}>
                  <IconComponent className={`w-6 h-6 ${
                    step.highlight ? 'text-white' : 'text-green-600'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{step.title}</h3>
                  <Badge variant="secondary" className="text-xs">
                    Step {currentStep + 1} of {onboardingSteps.length}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={handleSkip}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
            </div>

            {/* Content */}
            <div className="mb-6">
              <p className="text-gray-600 text-sm leading-relaxed">
                {step.description}
              </p>
              {step.action && (
                <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      {step.action}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {currentStep > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevious}
                    className="flex items-center space-x-1"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </Button>
                )}
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  Skip Tour
                </Button>
                <Button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 flex items-center space-x-1"
                  size="sm"
                >
                  <span>{currentStep === onboardingSteps.length - 1 ? 'Get Started!' : 'Next'}</span>
                  {currentStep !== onboardingSteps.length - 1 && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


    </>
  );
}