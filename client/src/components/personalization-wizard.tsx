import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wand2, 
  Brain, 
  TrendingUp, 
  Home, 
  Wallet, 
  FileText, 
  Shield,
  Users,
  MapPin,
  CreditCard,
  PieChart,
  Calendar,
  Bell,
  Settings,
  Sparkles,
  ChevronRight,
  Check
} from 'lucide-react';

interface PersonalizationStep {
  id: string;
  title: string;
  description: string;
  icon: any;
  options: PersonalizationOption[];
}

interface PersonalizationOption {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: string;
}

interface PersonalizationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (preferences: UserPreferences) => void;
}

interface UserPreferences {
  primaryGoals: string[];
  dashboardWidgets: string[];
  notifications: string[];
  layout: 'compact' | 'comfortable' | 'spacious';
  theme: 'auto' | 'light' | 'dark';
  aiPersonality: 'professional' | 'friendly' | 'expert';
}

const personalizationSteps: PersonalizationStep[] = [
  {
    id: 'goals',
    title: 'Your Immigration Goals',
    description: 'Tell us what you\'re trying to achieve so we can personalize your experience',
    icon: TrendingUp,
    options: [
      { id: 'study_abroad', title: 'Study Abroad', description: 'Student visa and university applications', icon: FileText, category: 'education' },
      { id: 'work_visa', title: 'Work Visa', description: 'Employment-based immigration', icon: Users, category: 'career' },
      { id: 'family_reunion', title: 'Family Reunion', description: 'Join family members abroad', icon: Home, category: 'family' },
      { id: 'investment', title: 'Investment Migration', description: 'Business and investor visas', icon: TrendingUp, category: 'business' },
      { id: 'permanent_residence', title: 'Permanent Residence', description: 'Long-term settlement', icon: MapPin, category: 'settlement' },
      { id: 'citizenship', title: 'Citizenship', description: 'Naturalization and dual citizenship', icon: Shield, category: 'citizenship' }
    ]
  },
  {
    id: 'widgets',
    title: 'Dashboard Widgets',
    description: 'Choose which information you\'d like to see on your dashboard',
    icon: PieChart,
    options: [
      { id: 'wallet_overview', title: 'Wallet Overview', description: 'Balance and recent transactions', icon: Wallet, category: 'financial' },
      { id: 'application_status', title: 'Application Status', description: 'Track your immigration applications', icon: FileText, category: 'applications' },
      { id: 'currency_rates', title: 'Exchange Rates', description: 'Live currency conversion rates', icon: TrendingUp, category: 'financial' },
      { id: 'housing_matches', title: 'Housing Matches', description: 'HomeBase accommodation suggestions', icon: Home, category: 'housing' },
      { id: 'ai_insights', title: 'AI Insights', description: 'Personalized recommendations', icon: Brain, category: 'ai' },
      { id: 'document_checklist', title: 'Document Checklist', description: 'Required documents tracker', icon: FileText, category: 'documents' },
      { id: 'upcoming_deadlines', title: 'Upcoming Deadlines', description: 'Important dates and reminders', icon: Calendar, category: 'planning' },
      { id: 'security_status', title: 'Security Status', description: 'Account security overview', icon: Shield, category: 'security' }
    ]
  },
  {
    id: 'notifications',
    title: 'Notification Preferences',
    description: 'Stay informed with personalized alerts',
    icon: Bell,
    options: [
      { id: 'application_updates', title: 'Application Updates', description: 'Status changes and decisions', icon: FileText, category: 'applications' },
      { id: 'payment_alerts', title: 'Payment Alerts', description: 'Transaction confirmations', icon: CreditCard, category: 'financial' },
      { id: 'rate_changes', title: 'Exchange Rate Changes', description: 'Favorable rate notifications', icon: TrendingUp, category: 'financial' },
      { id: 'document_reminders', title: 'Document Reminders', description: 'Expiration and renewal alerts', icon: FileText, category: 'documents' },
      { id: 'housing_alerts', title: 'Housing Alerts', description: 'New accommodation matches', icon: Home, category: 'housing' },
      { id: 'ai_recommendations', title: 'AI Recommendations', description: 'Personalized suggestions', icon: Brain, category: 'ai' }
    ]
  },
  {
    id: 'preferences',
    title: 'Display Preferences',
    description: 'Customize how your dashboard looks and feels',
    icon: Settings,
    options: [
      { id: 'layout_compact', title: 'Compact Layout', description: 'More information in less space', icon: PieChart, category: 'layout' },
      { id: 'layout_comfortable', title: 'Comfortable Layout', description: 'Balanced spacing and readability', icon: PieChart, category: 'layout' },
      { id: 'layout_spacious', title: 'Spacious Layout', description: 'Extra breathing room', icon: PieChart, category: 'layout' },
      { id: 'ai_professional', title: 'Professional AI', description: 'Formal and business-focused tone', icon: Brain, category: 'ai' },
      { id: 'ai_friendly', title: 'Friendly AI', description: 'Warm and conversational tone', icon: Brain, category: 'ai' },
      { id: 'ai_expert', title: 'Expert AI', description: 'Technical and detailed responses', icon: Brain, category: 'ai' }
    ]
  }
];

export default function PersonalizationWizard({ isOpen, onClose, onComplete }: PersonalizationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const currentStepData = personalizationSteps[currentStep];
  const progress = ((currentStep + 1) / personalizationSteps.length) * 100;

  const handleOptionToggle = (stepId: string, optionId: string) => {
    setSelectedOptions(prev => {
      const current = prev[stepId] || [];
      const isSelected = current.includes(optionId);
      
      if (isSelected) {
        return {
          ...prev,
          [stepId]: current.filter(id => id !== optionId)
        };
      } else {
        return {
          ...prev,
          [stepId]: [...current, optionId]
        };
      }
    });
  };

  const handleNext = () => {
    if (currentStep < personalizationSteps.length - 1) {
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

  const handleComplete = async () => {
    setIsAnalyzing(true);
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Process selections into preferences
    const preferences: UserPreferences = {
      primaryGoals: selectedOptions.goals || [],
      dashboardWidgets: selectedOptions.widgets || [],
      notifications: selectedOptions.notifications || [],
      layout: selectedOptions.preferences?.includes('layout_compact') ? 'compact' :
               selectedOptions.preferences?.includes('layout_spacious') ? 'spacious' : 'comfortable',
      theme: 'auto',
      aiPersonality: selectedOptions.preferences?.includes('ai_professional') ? 'professional' :
                     selectedOptions.preferences?.includes('ai_expert') ? 'expert' : 'friendly'
    };

    onComplete(preferences);
    setIsAnalyzing(false);
  };

  const getCurrentSelections = () => selectedOptions[currentStepData.id] || [];

  if (isAnalyzing) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <div className="text-center py-8">
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Analyzing Your Preferences</h3>
            <p className="text-gray-600 mb-6">Our AI is personalizing your dashboard experience...</p>
            <Progress value={85} className="mb-4" />
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Sparkles className="w-4 h-4 mr-2" />
              Creating your personalized dashboard
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Wand2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl">Personalization Wizard</DialogTitle>
                <p className="text-sm text-gray-600">Step {currentStep + 1} of {personalizationSteps.length}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">{Math.round(progress)}% Complete</div>
              <Progress value={progress} className="w-32 mt-1" />
            </div>
          </div>
        </DialogHeader>

        <div className="py-6">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <currentStepData.icon className="w-6 h-6 mr-2 text-blue-600" />
              <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
            </div>
            <p className="text-gray-600">{currentStepData.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentStepData.options.map((option) => {
              const isSelected = getCurrentSelections().includes(option.id);
              return (
                <Card 
                  key={option.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected 
                      ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => handleOptionToggle(currentStepData.id, option.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          isSelected 
                            ? 'bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-300' 
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                        }`}>
                          <option.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm mb-1">{option.title}</h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{option.description}</p>
                          <Badge variant="secondary" className="mt-2 text-xs">
                            {option.category}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="flex justify-between pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Skip for Now
            </Button>
            <Button 
              onClick={handleNext}
              disabled={getCurrentSelections().length === 0}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              {currentStep === personalizationSteps.length - 1 ? 'Complete Setup' : 'Next'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}