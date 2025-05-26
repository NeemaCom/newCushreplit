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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}!
          </h2>
          <p className="text-gray-600">
            Manage your immigration journey and financial services in one secure platform.
          </p>
        </div>

        {/* Quick Stats */}
        <QuickStats 
          wallets={wallets}
          transactions={transactions}
          immigrationCases={immigrationCases}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <TransferForm wallets={wallets} />
            <TransactionList transactions={transactions} />
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <ImmigrationServices />
            <AIAssistant />
            
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <a href="#profile" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <i className="fas fa-user text-gray-500"></i>
                  <span className="text-gray-700">Update Profile</span>
                </a>
                <a href="#documents" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <i className="fas fa-file-alt text-gray-500"></i>
                  <span className="text-gray-700">Upload Documents</span>
                </a>
                <a href="#support" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <i className="fas fa-headset text-gray-500"></i>
                  <span className="text-gray-700">Contact Support</span>
                </a>
                <a href="#security" className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <i className="fas fa-shield-alt text-gray-500"></i>
                  <span className="text-gray-700">Security Settings</span>
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
