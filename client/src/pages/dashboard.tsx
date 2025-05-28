import { useQuery } from "@tanstack/react-query";
import Header from "@/components/header";
import QuickStats from "@/components/quick-stats";
import TransferForm from "@/components/transfer-form";
import TransactionList from "@/components/transaction-list";
import ImmigrationServices from "@/components/immigration-services";
import AIAssistant from "@/components/ai-assistant";
import ChatbotWidget from "@/components/chatbot-widget";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

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
    </div>
  );
}
