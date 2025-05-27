import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PersonalizationWizard from '@/components/personalization-wizard';
import DragDropDashboard from '@/components/drag-drop-dashboard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Wand2, 
  Sparkles, 
  TrendingUp, 
  Brain,
  Settings,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

interface UserPreferences {
  primaryGoals: string[];
  dashboardWidgets: string[];
  notifications: string[];
  layout: 'compact' | 'comfortable' | 'spacious';
  theme: 'auto' | 'light' | 'dark';
  aiPersonality: 'professional' | 'friendly' | 'expert';
}

interface AIInsight {
  id: string;
  type: 'recommendation' | 'alert' | 'tip';
  priority: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  action?: string;
  actionUrl?: string;
  timestamp: string;
}

export default function PersonalizedDashboard() {
  const [showWizard, setShowWizard] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | null>(null);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const queryClient = useQueryClient();

  // Check if user has completed personalization
  useEffect(() => {
    const hasPersonalized = localStorage.getItem('hasCompletedPersonalization');
    const savedPreferences = localStorage.getItem('userPreferences');
    
    if (!hasPersonalized && !savedPreferences) {
      setTimeout(() => setShowWizard(true), 1000);
    } else if (savedPreferences) {
      setUserPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  // Fetch AI insights based on user preferences
  const { data: insights, isLoading: insightsLoading } = useQuery({
    queryKey: ['/api/ai-insights', userPreferences],
    enabled: !!userPreferences,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  useEffect(() => {
    if (insights) {
      setAiInsights(insights);
    }
  }, [insights]);

  // Generate AI insights mutation
  const generateInsightsMutation = useMutation({
    mutationFn: async (preferences: UserPreferences) => {
      return apiRequest('POST', '/api/ai-insights/generate', { preferences });
    },
    onSuccess: (data) => {
      setAiInsights(data);
      queryClient.invalidateQueries({ queryKey: ['/api/ai-insights'] });
    },
  });

  const handlePersonalizationComplete = (preferences: UserPreferences) => {
    setUserPreferences(preferences);
    localStorage.setItem('hasCompletedPersonalization', 'true');
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setShowWizard(false);
    
    // Generate initial AI insights
    generateInsightsMutation.mutate(preferences);
  };

  const handleLayoutChange = (widgets: any[]) => {
    if (userPreferences) {
      const updatedPreferences = {
        ...userPreferences,
        dashboardWidgets: widgets.filter(w => w.visible).map(w => w.id)
      };
      setUserPreferences(updatedPreferences);
      localStorage.setItem('userPreferences', JSON.stringify(updatedPreferences));
    }
  };

  const resetPersonalization = () => {
    localStorage.removeItem('hasCompletedPersonalization');
    localStorage.removeItem('userPreferences');
    setUserPreferences(null);
    setShowWizard(true);
  };

  const renderAIInsights = () => {
    if (!userPreferences || aiInsights.length === 0) return null;

    return (
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <CardTitle className="text-lg">AI Insights</CardTitle>
              <Badge variant="secondary">Personalized</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateInsightsMutation.mutate(userPreferences)}
              disabled={generateInsightsMutation.isPending}
            >
              <RefreshCw className={`w-4 h-4 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {aiInsights.slice(0, 3).map((insight) => (
              <div
                key={insight.id}
                className={`p-3 rounded-lg border-l-4 ${
                  insight.priority === 'high' 
                    ? 'bg-red-50 border-red-500' 
                    : insight.priority === 'medium'
                    ? 'bg-yellow-50 border-yellow-500'
                    : 'bg-green-50 border-green-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                    <p className="text-sm text-gray-600">{insight.message}</p>
                  </div>
                  {insight.action && (
                    <Button variant="ghost" size="sm" className="ml-2">
                      {insight.action}
                      <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderPersonalizationBanner = () => {
    if (userPreferences) return null;

    return (
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Wand2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Personalize Your Experience</h3>
                <p className="text-gray-600">Let our AI create a custom dashboard tailored to your immigration goals</p>
              </div>
            </div>
            <Button
              onClick={() => setShowWizard(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Your Personalized Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            {userPreferences 
              ? `Tailored for your ${userPreferences.primaryGoals.length} immigration goals`
              : 'Customize your experience with AI-powered personalization'
            }
          </p>
        </div>
        
        {userPreferences && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowWizard(true)}
              className="flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Personalization Settings</span>
            </Button>
            <Button
              variant="ghost"
              onClick={resetPersonalization}
              className="text-purple-600"
            >
              <Wand2 className="w-4 h-4 mr-2" />
              Reset & Re-personalize
            </Button>
          </div>
        )}
      </div>

      {/* Personalization Banner */}
      {renderPersonalizationBanner()}

      {/* AI Insights */}
      {renderAIInsights()}

      {/* Customizable Dashboard */}
      <DragDropDashboard 
        userPreferences={userPreferences}
        onLayoutChange={handleLayoutChange}
      />

      {/* Personalization Stats */}
      {userPreferences && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Personalization Active</p>
                  <p className="text-sm text-gray-600">
                    Dashboard optimized for {userPreferences.primaryGoals.length} goals, 
                    {userPreferences.dashboardWidgets.length} widgets enabled
                  </p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                AI Enhanced
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalization Wizard */}
      <PersonalizationWizard
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        onComplete={handlePersonalizationComplete}
      />
    </div>
  );
}