import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/header";
import QuickStats from "@/components/quick-stats";
import TransferForm from "@/components/transfer-form";
import TransactionList from "@/components/transaction-list";
import ImmigrationServices from "@/components/immigration-services";
import AIAssistant from "@/components/ai-assistant";
import ChatbotWidget from "@/components/chatbot-widget";
import PersonalizedWelcomeScreen from "@/components/personalized-welcome-screen";
import AchievementSystem from "@/components/achievement-system";
import ContextualHelpBubbles from "@/components/contextual-help-bubbles";
import EmojiMoodTracker from "@/components/emoji-mood-tracker";
import OnboardingTour from "@/components/onboarding-tour";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  // Check if user is new and should see welcome screen
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem(`welcomeSeen_${user?.id}`);
    const isNewUser = user && !hasSeenWelcome;
    
    if (isNewUser) {
      setShowWelcomeScreen(true);
    }
  }, [user?.id]);

  const handleWelcomeComplete = () => {
    localStorage.setItem(`welcomeSeen_${user?.id}`, 'true');
    setShowWelcomeScreen(false);
    setShowOnboarding(true);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { wallets = [], transactions = [], immigrationCases = [] } = dashboardData || {};
  const userName = user?.firstName || "User";

  return (
    <div className="min-h-screen bg-gradient-subtle safe-area-inset-top">
      <Header />
      
      <main className="responsive-container space-responsive-sm">
        {/* Mobile-First Welcome Section */}
        <div className="space-responsive-md">
          <div className="flex-mobile-stack gap-4">
            <div className="space-y-2">
              <h1 className="text-fluid-2xl font-bold text-cush-gray-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-fluid-base text-cush-gray-600">
                Manage your immigration journey and financial services in one secure platform.
              </p>
            </div>
            <div className="hidden md:flex items-center">
              <div className="card-responsive touch-target">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-fluid-sm font-medium text-cush-gray-700">System Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Quick Stats */}
        <QuickStats 
          wallets={wallets}
          transactions={transactions}
          immigrationCases={immigrationCases}
        />

        {/* Main Content Grid with improved spacing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <TransferForm wallets={wallets} />
            <TransactionList transactions={transactions} />
          </div>

          {/* Right Column with modern cards */}
          <div className="space-y-6">
            <ImmigrationServices />
            <AIAssistant />
            
            {/* Enhanced Quick Actions */}
            <div className="card-modern p-6">
              <h3 className="text-lg font-semibold text-cush-gray-900 mb-5">Quick Actions</h3>
              <div className="space-y-2">
                <a href="#profile" className="flex items-center space-x-3 p-4 hover:bg-cush-gray-25 rounded-xl transition-all duration-200 group">
                  <div className="w-10 h-10 bg-cush-primary-50 rounded-lg flex items-center justify-center group-hover:bg-cush-primary group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="font-medium text-cush-gray-700 group-hover:text-cush-gray-900">Update Profile</span>
                </a>
                <a href="/documentation" className="flex items-center space-x-3 p-4 hover:bg-cush-gray-25 rounded-xl transition-all duration-200 group">
                  <div className="w-10 h-10 bg-cush-primary-50 rounded-lg flex items-center justify-center group-hover:bg-cush-primary group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-medium text-cush-gray-700 group-hover:text-cush-gray-900">Documentation</span>
                </a>
                <a href="/community" className="flex items-center space-x-3 p-4 hover:bg-cush-gray-25 rounded-xl transition-all duration-200 group">
                  <div className="w-10 h-10 bg-cush-primary-50 rounded-lg flex items-center justify-center group-hover:bg-cush-primary group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <span className="font-medium text-cush-gray-700 group-hover:text-cush-gray-900">Community</span>
                </a>
                <a href="#security" className="flex items-center space-x-3 p-4 hover:bg-cush-gray-25 rounded-xl transition-all duration-200 group">
                  <div className="w-10 h-10 bg-cush-primary-50 rounded-lg flex items-center justify-center group-hover:bg-cush-primary group-hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className="font-medium text-cush-gray-700 group-hover:text-cush-gray-900">Security Settings</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ChatbotWidget />
      
      {/* ✨ MAGICAL UX FEATURES ✨ */}
      
      {/* Personalized Welcome Screen for New Users */}
      <AnimatePresence>
        {showWelcomeScreen && user && (
          <PersonalizedWelcomeScreen
            user={{
              firstName: user.firstName || '',
              lastName: user.lastName || '',
              email: user.email || '',
              profileImageUrl: user.profileImageUrl || ''
            }}
            onContinue={handleWelcomeComplete}
          />
        )}
      </AnimatePresence>

      {/* Playful Onboarding Tour with Animated Character Guide */}
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingTour
            onComplete={handleOnboardingComplete}
            onSkip={handleOnboardingSkip}
          />
        )}
      </AnimatePresence>

      {/* Contextual Help Bubbles with Witty Micro-copy */}
      <ContextualHelpBubbles 
        currentPage="dashboard"
        userLevel={1}
      />

      {/* Emoji-Based Mood Tracker */}
      <EmojiMoodTracker
        onMoodChange={(mood) => {
          console.log('User mood updated:', mood);
          // You can use this data for analytics or personalization
        }}
      />

      {/* Hidden Achievement System Panel */}
      {activeView === 'achievements' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto"
        >
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Your Achievements 🏆</h2>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <AchievementSystem
                userId={user?.id || 'guest'}
                onAchievementUnlock={(achievement) => {
                  console.log('Achievement unlocked!', achievement);
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Floating Achievement Access Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 2, type: "spring" }}
        onClick={() => setActiveView('achievements')}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-full shadow-lg hover:scale-110 transition-transform z-40 flex items-center justify-center"
        title="View Your Achievements"
      >
        🏆
      </motion.button>
    </div>
  );
}
