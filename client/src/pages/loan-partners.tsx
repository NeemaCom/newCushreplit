import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Building, 
  Globe, 
  Zap, 
  Shield, 
  ExternalLink, 
  Phone, 
  Mail,
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  TestTube
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/header";

export default function LoanPartnersPage() {
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [loanMatchForm, setLoanMatchForm] = useState({
    loanAmount: '',
    currency: 'GBP',
    country: 'UK',
    purpose: 'Immigration services'
  });
  const [testingPartner, setTestingPartner] = useState(null);
  const { toast } = useToast();

  // Fetch all loan partners
  const { data: allPartners = [], isLoading: partnersLoading } = useQuery({
    queryKey: ['/api/loan-partners'],
    retry: false,
  });

  // Match partners mutation
  const matchPartners = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/loan-partners/match', data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Partners Matched Successfully",
        description: `Found ${result.totalMatches} matching loan providers`,
      });
    }
  });

  // Create referral mutation
  const createReferral = useMutation({
    mutationFn: async (data) => {
      const response = await apiRequest('POST', '/api/loan-partners/create-referral', data);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: "Referral Created",
        description: `Referral ID: ${result.referralId}`,
      });
    }
  });

  // Test partner connection mutation
  const testConnection = useMutation({
    mutationFn: async ({ partnerId, apiKey }) => {
      const response = await apiRequest('GET', `/api/loan-partners/${partnerId}/test?apiKey=${apiKey || ''}`);
      return response.json();
    },
    onSuccess: (result) => {
      toast({
        title: result.success ? "Connection Successful" : "Connection Failed",
        description: result.success ? 
          `Response time: ${result.responseTime}ms` : 
          result.error || "Failed to connect to partner API",
        variant: result.success ? "default" : "destructive"
      });
      setTestingPartner(null);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'TESTING': return 'bg-blue-100 text-blue-800';
      case 'INACTIVE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'MICROLOAN_UK': return 'bg-blue-100 text-blue-800';
      case 'MICROLOAN_NIGERIA': return 'bg-green-100 text-green-800';
      case 'FINTECH_GLOBAL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPartners = selectedCountry === 'ALL' 
    ? allPartners 
    : allPartners.filter(partner => partner.country === selectedCountry);

  const handleMatchSubmit = (e) => {
    e.preventDefault();
    if (!loanMatchForm.loanAmount || parseFloat(loanMatchForm.loanAmount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid loan amount",
        variant: "destructive",
      });
      return;
    }
    matchPartners.mutate(loanMatchForm);
  };

  const handleCreateReferral = (partnerId) => {
    if (!loanMatchForm.loanAmount) {
      toast({
        title: "Amount Required",
        description: "Please specify a loan amount first",
        variant: "destructive",
      });
      return;
    }
    
    createReferral.mutate({
      partnerId,
      loanAmount: parseFloat(loanMatchForm.loanAmount),
      currency: loanMatchForm.currency
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-cush-gray-900 mb-2">Loan Partners</h1>
              <p className="text-lg text-cush-gray-600">
                Microloan providers and fintech partners in UK and Nigeria
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <select 
              value={selectedCountry} 
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="px-4 py-2 border border-cush-gray-300 rounded-lg bg-white"
            >
              <option value="ALL">All Countries</option>
              <option value="UK">United Kingdom</option>
              <option value="NG">Nigeria</option>
              <option value="GLOBAL">Global</option>
            </select>
            <Badge className="bg-blue-100 text-blue-800 px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {filteredPartners.length} Partners
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="partners" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="partners">All Partners</TabsTrigger>
            <TabsTrigger value="matcher">Partner Matching</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="partners" className="space-y-6">
            {partnersLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPartners.map((partner) => (
                  <Card key={partner.id} className="card-modern">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <Badge className={getStatusColor(partner.status)}>
                          {partner.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(partner.type)} variant="outline">
                          {partner.type.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {partner.country}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium text-cush-gray-700">Loan Range</p>
                          <p className="text-cush-gray-600">
                            {partner.supportedCurrencies[0]} {partner.minLoanAmount.toLocaleString()} - {partner.maxLoanAmount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium text-cush-gray-700">Commission</p>
                          <p className="text-green-600 font-semibold">{partner.commissionRate}%</p>
                        </div>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium text-cush-gray-700 mb-2">Interest Rate</p>
                        <p className="text-cush-gray-600">
                          {partner.interestRateRange.min}% - {partner.interestRateRange.max}%
                        </p>
                      </div>

                      <div className="text-sm">
                        <p className="font-medium text-cush-gray-700 mb-2">Processing Time</p>
                        <p className="text-cush-gray-600">{partner.processingTime}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(partner.contactInfo.website, '_blank')}
                            className="flex items-center"
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Website
                          </Button>
                          {partner.apiEndpoint && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline" className="flex items-center">
                                  <TestTube className="w-3 h-3 mr-1" />
                                  Test API
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Test API Connection - {partner.name}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="apiKey">API Key (Optional)</Label>
                                    <Input
                                      id="apiKey"
                                      placeholder="Enter API key for testing"
                                      value={testingPartner?.apiKey || ''}
                                      onChange={(e) => setTestingPartner({...testingPartner, apiKey: e.target.value})}
                                    />
                                  </div>
                                  <Button
                                    onClick={() => testConnection.mutate({ partnerId: partner.id, apiKey: testingPartner?.apiKey })}
                                    disabled={testConnection.isPending}
                                    className="w-full"
                                  >
                                    {testConnection.isPending ? 'Testing...' : 'Test Connection'}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateReferral(partner.id)}
                          disabled={createReferral.isPending}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Create Referral
                        </Button>
                      </div>

                      <div className="text-xs text-cush-gray-500 space-y-1">
                        <div className="flex items-center">
                          <Mail className="w-3 h-3 mr-1" />
                          {partner.contactInfo.email}
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-3 h-3 mr-1" />
                          {partner.contactInfo.phone}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="matcher" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="w-5 h-5 mr-2 text-blue-500" />
                  Smart Partner Matching
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMatchSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loanAmount">Loan Amount</Label>
                      <Input
                        id="loanAmount"
                        type="number"
                        placeholder="Enter loan amount"
                        value={loanMatchForm.loanAmount}
                        onChange={(e) => setLoanMatchForm(prev => ({ ...prev, loanAmount: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <select
                        id="currency"
                        className="w-full px-3 py-2 border border-cush-gray-300 rounded-md"
                        value={loanMatchForm.currency}
                        onChange={(e) => setLoanMatchForm(prev => ({ ...prev, currency: e.target.value }))}
                      >
                        <option value="GBP">GBP - British Pound</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="NGN">NGN - Nigerian Naira</option>
                        <option value="EUR">EUR - Euro</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Target Country</Label>
                      <select
                        id="country"
                        className="w-full px-3 py-2 border border-cush-gray-300 rounded-md"
                        value={loanMatchForm.country}
                        onChange={(e) => setLoanMatchForm(prev => ({ ...prev, country: e.target.value }))}
                      >
                        <option value="UK">United Kingdom</option>
                        <option value="NG">Nigeria</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="purpose">Loan Purpose</Label>
                      <Input
                        id="purpose"
                        placeholder="e.g., Immigration services"
                        value={loanMatchForm.purpose}
                        onChange={(e) => setLoanMatchForm(prev => ({ ...prev, purpose: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={matchPartners.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {matchPartners.isPending ? 'Matching...' : 'Find Matching Partners'}
                  </Button>
                </form>

                {matchPartners.data && (
                  <div className="mt-6 space-y-4">
                    <h3 className="text-lg font-semibold text-cush-gray-900">
                      Matching Results ({matchPartners.data.totalMatches} partners)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {matchPartners.data.matchingPartners.map((partner) => (
                        <Card key={partner.id} className="border-blue-200">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold text-cush-gray-900">{partner.name}</h4>
                              <Badge className="bg-blue-100 text-blue-800">
                                {partner.commissionRate}% commission
                              </Badge>
                            </div>
                            <div className="text-sm text-cush-gray-600 space-y-1">
                              <p>Rate: {partner.interestRateRange.min}% - {partner.interestRateRange.max}%</p>
                              <p>Processing: {partner.processingTime}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleCreateReferral(partner.id)}
                              className="w-full mt-3 bg-green-600 hover:bg-green-700"
                            >
                              Create Referral
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Total Partners</p>
                      <p className="text-2xl font-bold text-cush-gray-900">{allPartners.length}</p>
                    </div>
                    <Building className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Active Partners</p>
                      <p className="text-2xl font-bold text-green-600">
                        {allPartners.filter(p => p.status === 'ACTIVE').length}
                      </p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Avg Commission</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {allPartners.length > 0 ? 
                          (allPartners.reduce((sum, p) => sum + p.commissionRate, 0) / allPartners.length).toFixed(1) : 0
                        }%
                      </p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-modern">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-cush-gray-600">Countries</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {new Set(allPartners.map(p => p.country)).size}
                      </p>
                    </div>
                    <Globe className="w-8 h-8 text-orange-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}