import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Bell, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  PieChart, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Eye,
  EyeOff,
  Calendar,
  Users,
  FileText,
  Wallet,
  Building,
  Percent,
  MapPin,
  Clock,
  LogOut,
  Power,
  MessageCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from "recharts";
import UserProfileModal from "@/components/user-profile-modal";

// Sample chart data - in production this would come from your API
const balanceData = [
  { month: 'Jan', balance: 15000 },
  { month: 'Feb', balance: 18000 },
  { month: 'Mar', balance: 22000 },
  { month: 'Apr', balance: 19000 },
  { month: 'May', balance: 25000 },
  { month: 'Jun', balance: 26000 },
];

const transactionData = [
  { month: 'Jan', sent: 5000, received: 8000 },
  { month: 'Feb', sent: 7000, received: 6000 },
  { month: 'Mar', sent: 4000, received: 9000 },
  { month: 'Apr', sent: 6000, received: 7000 },
  { month: 'May', sent: 8000, received: 5000 },
  { month: 'Jun', sent: 5500, received: 8500 },
];

export default function AdvancedDashboard() {
  const { user } = useAuth();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };
  
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/dashboard"],
  });

  const { wallets = [], transactions = [], immigrationCases = [] } = dashboardData || {};
  
  // Calculate totals and insights
  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance), 0);
  const ngnWallet = wallets.find(w => w.currency === 'NGN');
  const gbpWallet = wallets.find(w => w.currency === 'GBP');
  
  const recentTransactions = transactions.slice(0, 5);
  const pendingTransactions = transactions.filter(t => t.status === 'pending');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <div className="flex">
          {/* Sidebar Skeleton */}
          <div className="w-64 bg-white border-r border-cush-gray-200 animate-pulse">
            <div className="p-6 space-y-4">
              <div className="h-8 bg-cush-gray-200 rounded"></div>
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-6 bg-cush-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex-1 p-8 space-y-6">
            <div className="h-12 bg-cush-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-cush-gray-200 rounded-xl"></div>
              ))}
            </div>
            <div className="h-80 bg-cush-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="flex">
        {/* Enhanced Sidebar */}
        <div className="w-64 bg-white border-r border-cush-gray-200 shadow-modern h-screen sticky top-0 flex flex-col">
          {/* Logo Section */}
          <div className="p-6 border-b border-cush-gray-200 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-modern">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-xl font-bold text-cush-gray-900">Cush</h1>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="p-4 space-y-1 overflow-y-auto flex-1 min-h-0">
            {/* Main Menu Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-cush-gray-500 uppercase tracking-wider mb-3 px-3">Overview</div>
              
              <a href="/" className="flex items-center justify-between px-3 py-2.5 bg-cush-primary-50 text-cush-primary rounded-lg font-medium transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <BarChart3 className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
              </a>
            </div>

            {/* Financial Services Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-cush-gray-500 uppercase tracking-wider mb-3 px-3">Financial</div>
              
              <a href="/wallet" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Wallet className="w-5 h-5" />
                  <span>Multi-Currency Wallet</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">Enhanced</Badge>
              </a>
              
              <a href="/financial-services" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5" />
                  <span>Educational Payments</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">New</Badge>
              </a>
              
              <a href="/loans" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <DollarSign className="w-5 h-5" />
                  <span>Loans</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">New</Badge>
              </a>
              
              <a href="/loan-partners" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5" />
                  <span>Loan Partners</span>
                </div>
                <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">Active</Badge>
              </a>
              
              <a href="/flights" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5" />
                  <span>Flight Booking</span>
                </div>
              </a>
            </div>

            {/* Immigration Services Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-cush-gray-500 uppercase tracking-wider mb-3 px-3">Immigration</div>
              
              <a href="/documentation" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>Documentation</span>
                </div>
              </a>
              
              <a href="/imisi" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-5 h-5" />
                  <span>AI Assistant</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">AI</Badge>
              </a>
            </div>

            {/* Community Section */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-cush-gray-500 uppercase tracking-wider mb-3 px-3">Community</div>
              
              <a href="/community" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>Community Hub</span>
                </div>
              </a>
              
              <a href="/mentors" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5" />
                  <span>Mentors</span>
                </div>
              </a>
              
              <a href="/events" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5" />
                  <span>Events</span>
                </div>
              </a>
              
              <a href="/insights" className="flex items-center justify-between px-3 py-2.5 text-cush-gray-700 hover:bg-cush-gray-25 hover:text-cush-gray-900 rounded-lg transition-all duration-200 mb-1">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5" />
                  <span>Insights</span>
                </div>
              </a>
            </div>
          </nav>

          {/* User Profile Section */}
          <div className="p-4 border-t border-cush-gray-200 flex-shrink-0 mt-auto">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-cush-gray-25 rounded-xl">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.profileImageUrl} />
                  <AvatarFallback className="bg-gradient-primary text-white font-bold">
                    {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-cush-gray-900 truncate">
                    {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User Account'}
                  </div>
                  <div className="text-xs text-cush-gray-600">Premium Member</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-1"
                  onClick={() => setShowProfileModal(true)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
              
              {/* Logout Button */}
              <Button 
                onClick={handleLogout}
                variant="outline" 
                className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Top Header Bar */}
          <div className="bg-white border-b border-cush-gray-200 p-6 shadow-modern sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-cush-gray-900">
                  Welcome back, {user?.firstName || 'User'}!
                </h1>
                <p className="text-cush-gray-600">Here's what's happening with your account today.</p>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-cush-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search transactions..."
                    className="pl-10 w-80 border-cush-gray-200 focus:border-cush-primary"
                  />
                </div>
                
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="w-5 h-5 text-cush-gray-600" />
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    3
                  </span>
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-8 space-y-8">
            {/* Balance Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Total Balance */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-white" />
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setBalanceVisible(!balanceVisible)}
                      className="p-1"
                    >
                      {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-cush-gray-600">Total Balance</p>
                    <p className="text-3xl font-bold text-cush-gray-900">
                      {balanceVisible ? `£${totalBalance.toFixed(2)}` : '••••••'}
                    </p>
                    <div className="flex items-center text-sm text-green-600">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      +12.5% this month
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* NGN Wallet */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold">₦</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-cush-gray-600">NGN Wallet</p>
                    <p className="text-2xl font-bold text-cush-gray-900">
                      {balanceVisible ? `₦${ngnWallet ? parseFloat(ngnWallet.balance).toLocaleString() : '0'}` : '••••••'}
                    </p>
                    <p className="text-xs text-cush-gray-500">Available balance</p>
                  </div>
                </CardContent>
              </Card>

              {/* GBP Wallet */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                      <span className="text-white font-bold">£</span>
                    </div>
                    <Badge className="bg-purple-100 text-purple-800">Active</Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-cush-gray-600">GBP Wallet</p>
                    <p className="text-2xl font-bold text-cush-gray-900">
                      {balanceVisible ? `£${gbpWallet ? parseFloat(gbpWallet.balance).toFixed(2) : '0.00'}` : '••••••'}
                    </p>
                    <p className="text-xs text-cush-gray-500">Available balance</p>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <Button className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl">
                      <Plus className="w-4 h-4 mr-2" />
                      Send Money
                    </Button>
                    <Button variant="outline" className="w-full border-2 border-cush-gray-300 hover:border-cush-primary py-3 rounded-xl">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Apply for Loan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Balance Trend Chart */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-cush-primary" />
                    Balance Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={balanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="balance" 
                          stroke="#2563eb" 
                          fill="url(#colorBalance)" 
                          strokeWidth={3}
                        />
                        <defs>
                          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Analytics */}
              <Card className="card-modern border-0 shadow-modern-lg">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2 text-cush-primary" />
                    Transaction Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transactionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white', 
                            border: '1px solid #e2e8f0', 
                            borderRadius: '12px',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                          }} 
                        />
                        <Bar dataKey="sent" fill="#ef4444" name="Sent" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="received" fill="#10b981" name="Received" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="card-modern border-0 shadow-modern-lg">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-cush-gray-900">Recent Transactions</CardTitle>
                  <Button variant="ghost" className="text-cush-primary hover:text-cush-primary-600">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl hover:bg-cush-gray-50 transition-colors">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.type === 'transfer' ? 'bg-blue-100' : 
                            transaction.type === 'received' ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            {transaction.type === 'transfer' ? (
                              <ArrowUpRight className="w-6 h-6 text-blue-600" />
                            ) : transaction.type === 'received' ? (
                              <ArrowDownRight className="w-6 h-6 text-green-600" />
                            ) : (
                              <DollarSign className="w-6 h-6 text-orange-600" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-cush-gray-900 capitalize">{transaction.type}</p>
                            <p className="text-sm text-cush-gray-600">{transaction.description}</p>
                            <p className="text-xs text-cush-gray-500">{new Date(transaction.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'received' ? 'text-green-600' : 'text-cush-gray-900'
                          }`}>
                            {transaction.type === 'received' ? '+' : '-'}£{parseFloat(transaction.amount).toFixed(2)}
                          </p>
                          <Badge className={`text-xs ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-cush-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-cush-gray-400" />
                      </div>
                      <p className="text-cush-gray-500">No transactions yet</p>
                      <p className="text-sm text-cush-gray-400">Your transaction history will appear here</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* User Profile Modal */}
        <UserProfileModal 
          isOpen={showProfileModal} 
          onClose={() => setShowProfileModal(false)} 
        />
      </div>
    </div>
  );
}