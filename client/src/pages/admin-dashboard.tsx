import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Settings, 
  Shield, 
  Database,
  Activity,
  CreditCard,
  Building,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Edit,
  Trash,
  Plus,
  Download,
  Filter,
  Search
} from "lucide-react";
import Header from "@/components/header";
import SecurityHeatmap from "@/components/security-heatmap";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Admin data queries
  const { data: adminStats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
  });

  const { data: allUsers, isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: allTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/admin/transactions"],
  });

  const { data: loanApplications, isLoading: loansLoading } = useQuery({
    queryKey: ["/api/admin/loans"],
  });

  const { data: systemLogs, isLoading: logsLoading } = useQuery({
    queryKey: ["/api/admin/logs"],
  });

  // Mock admin data for demonstration
  const mockStats = {
    totalUsers: 1247,
    activeUsers: 892,
    totalTransactions: 5432,
    totalVolume: 2847392.50,
    pendingLoans: 23,
    systemHealth: "excellent"
  };

  const mockUsers = [
    {
      id: "1",
      name: "John Smith",
      email: "john@example.com",
      status: "active",
      joinDate: "2024-01-15",
      totalTransactions: 45,
      walletBalance: 1250.00
    },
    {
      id: "2", 
      name: "Sarah Johnson",
      email: "sarah@example.com",
      status: "active",
      joinDate: "2024-02-10",
      totalTransactions: 32,
      walletBalance: 890.50
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael@example.com", 
      status: "suspended",
      joinDate: "2024-01-08",
      totalTransactions: 78,
      walletBalance: 2150.75
    }
  ];

  const mockTransactions = [
    {
      id: "txn_001",
      user: "John Smith",
      type: "transfer",
      amount: 500.00,
      status: "completed",
      date: "2024-01-20",
      currency: "GBP"
    },
    {
      id: "txn_002",
      user: "Sarah Johnson", 
      type: "received",
      amount: 750.00,
      status: "pending",
      date: "2024-01-20",
      currency: "NGN"
    },
    {
      id: "txn_003",
      user: "Michael Brown",
      type: "transfer",
      amount: 1200.00,
      status: "failed",
      date: "2024-01-19",
      currency: "GBP"
    }
  ];

  const mockLoans = [
    {
      id: "loan_001",
      applicant: "John Smith",
      type: "personal",
      amount: 25000,
      status: "pending_review",
      country: "uk",
      appliedDate: "2024-01-18"
    },
    {
      id: "loan_002",
      applicant: "Sarah Johnson",
      type: "business", 
      amount: 50000,
      status: "approved",
      country: "nigeria",
      appliedDate: "2024-01-15"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-cush-gray-900 mb-3 flex items-center">
              <Shield className="w-10 h-10 mr-4 text-cush-primary" />
              Admin Dashboard
            </h1>
            <p className="text-lg text-cush-gray-600">
              System administration and user management
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Badge className="bg-green-100 text-green-800 px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              System Online
            </Badge>
            <Button className="bg-gradient-primary hover:opacity-90 text-white">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Admin Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-modern border-0 shadow-modern-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cush-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-cush-gray-900">{mockStats.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-modern-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cush-gray-600">Total Volume</p>
                  <p className="text-3xl font-bold text-cush-gray-900">£{mockStats.totalVolume.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +8% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-modern-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cush-gray-600">Transactions</p>
                  <p className="text-3xl font-bold text-cush-gray-900">{mockStats.totalTransactions.toLocaleString()}</p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    +15% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-modern border-0 shadow-modern-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-cush-gray-600">Pending Loans</p>
                  <p className="text-3xl font-bold text-cush-gray-900">{mockStats.pendingLoans}</p>
                  <p className="text-sm text-yellow-600 flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    Awaiting review
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Building className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="loans">Loans</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-cush-gray-900">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-cush-gray-25 rounded-xl">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registration</p>
                        <p className="text-xs text-cush-gray-500">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-cush-gray-25 rounded-xl">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Large transaction processed</p>
                        <p className="text-xs text-cush-gray-500">5 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-cush-gray-25 rounded-xl">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Loan application submitted</p>
                        <p className="text-xs text-cush-gray-500">10 minutes ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-cush-gray-900">System Health</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge className="bg-green-100 text-green-800">Healthy</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">API Response</span>
                      <Badge className="bg-green-100 text-green-800">98ms</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Payment Gateway</span>
                      <Badge className="bg-green-100 text-green-800">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Background Jobs</span>
                      <Badge className="bg-green-100 text-green-800">Running</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold text-cush-gray-900">User Management</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Input placeholder="Search users..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cush-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Transactions</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Balance</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockUsers.map((user) => (
                        <tr key={user.id} className="border-b border-cush-gray-100 hover:bg-cush-gray-25">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-cush-primary text-white text-sm">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-cush-gray-900">{user.name}</p>
                                <p className="text-sm text-cush-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <Badge className={user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                              {user.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-cush-gray-900">{user.totalTransactions}</td>
                          <td className="py-4 px-4 text-cush-gray-900">£{user.walletBalance.toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900">Transaction Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-cush-gray-200">
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">ID</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">User</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-cush-gray-700">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTransactions.map((transaction) => (
                        <tr key={transaction.id} className="border-b border-cush-gray-100 hover:bg-cush-gray-25">
                          <td className="py-4 px-4 text-sm font-mono text-cush-gray-600">{transaction.id}</td>
                          <td className="py-4 px-4 text-cush-gray-900">{transaction.user}</td>
                          <td className="py-4 px-4">
                            <Badge variant="outline" className="capitalize">{transaction.type}</Badge>
                          </td>
                          <td className="py-4 px-4 text-cush-gray-900">{transaction.currency} {transaction.amount.toFixed(2)}</td>
                          <td className="py-4 px-4">
                            <Badge className={
                              transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {transaction.status}
                            </Badge>
                          </td>
                          <td className="py-4 px-4 text-cush-gray-900">{transaction.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Loans Tab */}
          <TabsContent value="loans" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900">Loan Applications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLoans.map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Building className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-cush-gray-900">{loan.applicant}</p>
                          <p className="text-sm text-cush-gray-600 capitalize">{loan.type} loan - {loan.country}</p>
                          <p className="text-xs text-cush-gray-500">Applied: {loan.appliedDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-cush-gray-900">{loan.country === 'uk' ? '£' : '₦'}{loan.amount.toLocaleString()}</p>
                        <Badge className={
                          loan.status === 'approved' ? 'bg-green-100 text-green-800' :
                          loan.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {loan.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">Review</Button>
                        <Button variant="outline" size="sm">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab - Interactive Threat Heatmap */}
          <TabsContent value="security" className="space-y-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-cush-gray-900 mb-2 flex items-center">
                <Shield className="w-6 h-6 mr-3 text-red-500" />
                Security Operations Center
              </h2>
              <p className="text-cush-gray-600">
                Real-time threat visualization and security monitoring dashboard
              </p>
            </div>
            
            <SecurityHeatmap />
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-cush-gray-900">System Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Maintenance Mode</span>
                    <Button variant="outline" size="sm">Disabled</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transaction Limits</span>
                    <Button variant="outline" size="sm">Configure</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Exchange Rates</span>
                    <Button variant="outline" size="sm">Update</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Security Settings</span>
                    <Button variant="outline" size="sm">Manage</Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-cush-gray-900">System Logs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    <div className="text-xs font-mono bg-cush-gray-25 p-2 rounded">
                      [2024-01-20 15:30:45] INFO: User authentication successful
                    </div>
                    <div className="text-xs font-mono bg-cush-gray-25 p-2 rounded">
                      [2024-01-20 15:29:12] INFO: Transaction processed successfully
                    </div>
                    <div className="text-xs font-mono bg-yellow-50 p-2 rounded">
                      [2024-01-20 15:28:33] WARN: Rate limit approached for user
                    </div>
                    <div className="text-xs font-mono bg-cush-gray-25 p-2 rounded">
                      [2024-01-20 15:27:18] INFO: Database backup completed
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Sign-in Details Section */}
        <Card className="card-modern mt-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
              <Database className="w-5 h-5 mr-2 text-cush-primary" />
              Authentication & Sign-in Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-cush-gray-900">Replit Authentication</h3>
                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm font-medium text-blue-900 mb-2">Sign-in Process:</p>
                  <ol className="text-sm text-blue-800 space-y-1">
                    <li>1. Click "Log in" button on landing page</li>
                    <li>2. Redirected to Replit OAuth</li>
                    <li>3. Authorize Cush application</li>
                    <li>4. Automatic account creation/login</li>
                    <li>5. Access to full dashboard features</li>
                  </ol>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-cush-gray-900">Current Environment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between items-center p-3 bg-cush-gray-25 rounded-xl">
                    <span className="text-sm font-medium">Environment</span>
                    <Badge className="bg-green-100 text-green-800">Development</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cush-gray-25 rounded-xl">
                    <span className="text-sm font-medium">Database</span>
                    <Badge className="bg-green-100 text-green-800">PostgreSQL Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cush-gray-25 rounded-xl">
                    <span className="text-sm font-medium">Authentication</span>
                    <Badge className="bg-green-100 text-green-800">Replit OAuth</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-cush-gray-25 rounded-xl">
                    <span className="text-sm font-medium">Session Storage</span>
                    <Badge className="bg-green-100 text-green-800">Database Sessions</Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}