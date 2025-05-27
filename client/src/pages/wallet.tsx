import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Shield, 
  Send, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import MultiCurrencyWallet from "@/components/multi-currency-wallet";

export default function WalletPage() {
  const [transactionForm, setTransactionForm] = useState({
    amount: '',
    currency: 'USD',
    type: 'transfer',
    destinationCountry: 'GB',
    purpose: 'Immigration services payment'
  });
  const [processingResults, setProcessingResults] = useState([]);
  const { toast } = useToast();

  // Fetch real-time processing stats
  const { data: processingStats, refetch: refetchStats } = useQuery({
    queryKey: ['/api/transactions/processing-stats'],
    refetchInterval: 2000, // Update every 2 seconds
  });

  // Process transaction mutation
  const processTransaction = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/transactions/process', data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Transaction Initiated",
        description: `Transaction ${result.transactionId} is now being processed`,
      });
      setProcessingResults(prev => [result, ...prev.slice(0, 4)]); // Keep last 5 results
      refetchStats();
    },
    onError: (error) => {
      toast({
        title: "Processing Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Risk analysis mutation
  const analyzeRisk = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/transactions/analyze-risk', data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Risk Analysis Complete",
        description: `Risk Level: ${result.riskLevel} | Score: ${result.riskScore}/4`,
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid transaction amount",
        variant: "destructive",
      });
      return;
    }
    processTransaction.mutate(transactionForm);
  };

  const handleRiskCheck = () => {
    if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount for risk analysis",
        variant: "destructive",
      });
      return;
    }
    analyzeRisk.mutate(transactionForm);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'PROCESSING': return 'bg-blue-100 text-blue-800';
      case 'COMPLIANCE_REVIEW': return 'bg-orange-100 text-orange-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cush-gray-25 to-cush-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Main Wallet Component */}
        <MultiCurrencyWallet />

        {/* Real-Time Transaction Processing Tester */}
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="w-6 h-6 mr-3 text-blue-500" />
              Real-Time Transaction Processing Tester
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="tester" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="tester">Transaction Tester</TabsTrigger>
                <TabsTrigger value="monitor">Live Monitor</TabsTrigger>
                <TabsTrigger value="results">Recent Results</TabsTrigger>
              </TabsList>

              <TabsContent value="tester" className="space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Transaction Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        placeholder="Enter amount"
                        value={transactionForm.amount}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, amount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        className="w-full px-3 py-2 border border-cush-gray-300 rounded-md"
                        value={transactionForm.currency}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="type">Transaction Type</Label>
                      <select
                        id="type"
                        className="w-full px-3 py-2 border border-cush-gray-300 rounded-md"
                        value={transactionForm.type}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="transfer">Transfer</option>
                        <option value="payment">Payment</option>
                        <option value="fee">Fee Payment</option>
                        <option value="exchange">Currency Exchange</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination Country</Label>
                      <select
                        id="destination"
                        className="w-full px-3 py-2 border border-cush-gray-300 rounded-md"
                        value={transactionForm.destinationCountry}
                        onChange={(e) => setTransactionForm(prev => ({ ...prev, destinationCountry: e.target.value }))}
                      >
                        <option value="GB">United Kingdom</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="purpose">Transaction Purpose</Label>
                    <Input
                      id="purpose"
                      placeholder="e.g., Immigration services payment"
                      value={transactionForm.purpose}
                      onChange={(e) => setTransactionForm(prev => ({ ...prev, purpose: e.target.value }))}
                    />
                  </div>

                  <div className="flex space-x-4">
                    <Button 
                      type="submit" 
                      disabled={processTransaction.isPending}
                      className="flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {processTransaction.isPending ? 'Processing...' : 'Process Transaction'}
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={handleRiskCheck}
                      disabled={analyzeRisk.isPending}
                      className="flex items-center"
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {analyzeRisk.isPending ? 'Analyzing...' : 'Check Risk Level'}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="monitor" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-cush-gray-600">Processing Queue</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {processingStats?.queueLength || 0}
                          </p>
                        </div>
                        <Clock className="w-8 h-8 text-blue-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-cush-gray-600">Compliance Queue</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {processingStats?.complianceQueueLength || 0}
                          </p>
                        </div>
                        <Eye className="w-8 h-8 text-orange-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-cush-gray-600">Avg Processing</p>
                          <p className="text-2xl font-bold text-green-600">
                            {((processingStats?.averageProcessingTime || 3500) / 1000).toFixed(1)}s
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-cush-gray-600">Throughput/Min</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {processingStats?.throughputPerMinute || 45}
                          </p>
                        </div>
                        <Activity className="w-8 h-8 text-purple-500" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Real-Time System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-green-500" />
                          <div>
                            <p className="font-semibold text-green-800">Transaction Processing Engine</p>
                            <p className="text-sm text-green-600">Processing transactions in real-time</p>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>

                      <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Shield className="w-6 h-6 text-blue-500" />
                          <div>
                            <p className="font-semibold text-blue-800">Compliance Screening</p>
                            <p className="text-sm text-blue-600">AML/KYC checks active</p>
                          </div>
                        </div>
                        <Badge className="bg-blue-100 text-blue-800">Monitoring</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="results" className="space-y-4">
                {processingResults.length === 0 ? (
                  <div className="text-center py-8 text-cush-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-cush-gray-300" />
                    <p>No recent transactions. Process a transaction to see results here.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {processingResults.map((result, index) => (
                      <Card key={index}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <div>
                                <p className="font-semibold text-cush-gray-900">
                                  Transaction {result.transactionId}
                                </p>
                                <p className="text-sm text-cush-gray-600">
                                  Processing Time: {result.processingTime}ms
                                </p>
                                {result.complianceFlags && result.complianceFlags.length > 0 && (
                                  <div className="flex space-x-2 mt-2">
                                    {result.complianceFlags.map((flag, flagIndex) => (
                                      <Badge key={flagIndex} variant="outline" className="text-xs">
                                        {flag}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={getStatusColor(result.status)}>
                                {result.status}
                              </Badge>
                              {result.networkFee && (
                                <p className="text-sm text-cush-gray-600 mt-1">
                                  Fee: ${result.networkFee.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}