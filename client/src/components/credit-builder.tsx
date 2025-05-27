import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  CreditCard, 
  Plus, 
  TrendingUp, 
  Target, 
  Calendar,
  DollarSign,
  Shield,
  Star,
  Building,
  CheckCircle,
  AlertCircle,
  Clock,
  BarChart3,
  Wallet,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const creditProducts = [
  {
    type: 'secured_card',
    title: 'Secured Credit Card',
    description: 'Build credit with your own security deposit',
    icon: CreditCard,
    benefits: ['No credit check required', 'Reports to all 3 bureaus', 'Graduates to unsecured'],
    startingDeposit: '$200',
    avgIncrease: '30-50 points'
  },
  {
    type: 'credit_builder_loan',
    title: 'Credit Builder Loan',
    description: 'Save money while building credit history',
    icon: Building,
    benefits: ['Fixed monthly payments', 'Builds payment history', 'Access to funds at end'],
    startingDeposit: '$500',
    avgIncrease: '40-60 points'
  },
  {
    type: 'authorized_user',
    title: 'Authorized User',
    description: 'Benefit from someone else\'s good credit',
    icon: Shield,
    benefits: ['Immediate score boost', 'No hard inquiry', 'Shared credit history'],
    startingDeposit: '$0',
    avgIncrease: '20-40 points'
  }
];

export default function CreditBuilder() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedProduct, setSelectedProduct] = useState<string>("");
  const [isApplying, setIsApplying] = useState(false);

  // Fetch user's credit builders
  const { data: creditBuilders = [], isLoading } = useQuery({
    queryKey: ['/api/credit-builders'],
    enabled: !!user,
  });

  // Fetch credit payments
  const { data: creditPayments = [] } = useQuery({
    queryKey: ['/api/credit-payments'],
    enabled: !!user,
  });

  // Apply for credit product mutation
  const applyMutation = useMutation({
    mutationFn: async (applicationData: any) => {
      const response = await apiRequest("POST", "/api/credit-builders", applicationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/credit-builders'] });
      setIsApplying(false);
      toast({
        title: "Application Submitted",
        description: "Your credit builder application is being processed!",
      });
    },
  });

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-green-600';
    if (score >= 670) return 'text-blue-600';
    if (score >= 580) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreCategory = (score: number) => {
    if (score >= 750) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 text-white';
      case 'pending_approval': return 'bg-orange-500 text-white';
      case 'closed': return 'bg-gray-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  // Calculate credit utilization and payment history
  const latestCreditBuilder = creditBuilders[0];
  const currentScore = latestCreditBuilder?.creditScore ? parseInt(latestCreditBuilder.creditScore) : 650;
  const scoreProgress = Math.min((currentScore / 850) * 100, 100);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-cush-gray-900">Credit Builder Solutions</h2>
          <p className="text-cush-gray-600 mt-2">Build and improve your credit score with proven strategies</p>
        </div>
        <Dialog open={isApplying} onOpenChange={setIsApplying}>
          <DialogTrigger asChild>
            <Button className="bg-cush-primary hover:bg-cush-primary-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Apply Now
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Apply for Credit Builder Product</DialogTitle>
              <DialogDescription>
                Choose a credit building solution that fits your financial goals
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {creditProducts.map((product) => {
                  const IconComponent = product.icon;
                  return (
                    <Card 
                      key={product.type}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedProduct === product.type 
                          ? 'border-cush-primary bg-cush-primary-25' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedProduct(product.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-cush-primary rounded-lg flex items-center justify-center">
                            <IconComponent className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-cush-gray-900">{product.title}</h3>
                            <p className="text-xs text-cush-gray-600">{product.avgIncrease} avg. increase</p>
                          </div>
                        </div>
                        <p className="text-sm text-cush-gray-600 mb-4">{product.description}</p>
                        <div className="space-y-2">
                          {product.benefits.map((benefit, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-xs text-cush-gray-700">
                              <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                              <span>{benefit}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-3 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-cush-gray-600">Starting from</span>
                            <span className="font-semibold text-cush-primary">{product.startingDeposit}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedProduct && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    applyMutation.mutate({
                      productType: selectedProduct,
                      providerName: formData.get('providerName'),
                      creditLimit: formData.get('creditLimit'),
                      monthlyPayment: formData.get('monthlyPayment'),
                      interestRate: formData.get('interestRate')
                    });
                  }}
                  className="space-y-4 p-4 bg-cush-gray-25 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="providerName">Provider/Institution *</Label>
                      <Input 
                        id="providerName" 
                        name="providerName" 
                        placeholder="e.g., Capital One, Discover" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="creditLimit">Credit Limit/Loan Amount *</Label>
                      <Input 
                        id="creditLimit" 
                        name="creditLimit" 
                        type="number" 
                        step="0.01" 
                        placeholder="500.00" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="monthlyPayment">Monthly Payment</Label>
                      <Input 
                        id="monthlyPayment" 
                        name="monthlyPayment" 
                        type="number" 
                        step="0.01" 
                        placeholder="25.00" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input 
                        id="interestRate" 
                        name="interestRate" 
                        type="number" 
                        step="0.01" 
                        placeholder="24.99" 
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      className="bg-cush-primary hover:bg-cush-primary-600 text-white"
                      disabled={applyMutation.isPending}
                    >
                      {applyMutation.isPending ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedProduct("");
                        setIsApplying(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Credit Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="card-modern lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5" />
              <span>Credit Score Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-4xl font-bold ${getScoreColor(currentScore)}`}>
                    {currentScore}
                  </span>
                  <div className="text-sm">
                    <div className="text-cush-gray-600">Credit Score</div>
                    <div className={`font-semibold ${getScoreColor(currentScore)}`}>
                      {getScoreCategory(currentScore)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-cush-gray-600">
                  Last updated: {latestCreditBuilder?.lastScoreUpdate ? 
                    new Date(latestCreditBuilder.lastScoreUpdate).toLocaleDateString() : 
                    'Never'}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center space-x-1 text-green-600 mb-1">
                  <ArrowUp className="w-4 h-4" />
                  <span className="text-lg font-semibold">+15</span>
                </div>
                <p className="text-sm text-cush-gray-600">This month</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cush-gray-600">Progress to Excellent (750+)</span>
                  <span className="text-cush-gray-900">{currentScore}/850</span>
                </div>
                <Progress value={scoreProgress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-sm text-cush-gray-600">Score Range</p>
                  <p className="font-semibold text-cush-gray-900">300 - 850</p>
                </div>
                <div>
                  <p className="text-sm text-cush-gray-600">Provider</p>
                  <p className="font-semibold text-cush-gray-900">
                    {latestCreditBuilder?.scoreProvider || 'FICO'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5" />
              <span>Credit Goals</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Next Milestone</span>
                </div>
                <p className="text-sm text-blue-800">Reach 700+ for better rates</p>
                <div className="mt-2">
                  <Progress value={((currentScore - 580) / (700 - 580)) * 100} className="h-1" />
                  <p className="text-xs text-blue-600 mt-1">{700 - currentScore} points to go</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cush-gray-600">Payment History</span>
                  <span className="text-sm font-semibold text-green-600">100%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cush-gray-600">Credit Utilization</span>
                  <span className="text-sm font-semibold text-green-600">15%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-cush-gray-600">Credit Age</span>
                  <span className="text-sm font-semibold text-orange-600">2.5 years</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Credit Builders */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CreditCard className="w-5 h-5" />
            <span>Active Credit Builders</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {creditBuilders.length === 0 ? (
            <div className="text-center py-12">
              <TrendingUp className="w-16 h-16 text-cush-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cush-gray-900 mb-2">Start Building Your Credit</h3>
              <p className="text-cush-gray-600 mb-6">Apply for credit building products to improve your score</p>
              <Button 
                onClick={() => setIsApplying(true)}
                className="bg-cush-primary hover:bg-cush-primary-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Apply Now
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {creditBuilders.map((builder: any) => {
                const productInfo = creditProducts.find(p => p.type === builder.productType);
                const utilization = builder.creditLimit ? 
                  (parseFloat(builder.currentBalance) / parseFloat(builder.creditLimit)) * 100 : 0;
                
                return (
                  <div 
                    key={builder.id} 
                    className="p-6 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        {productInfo && (
                          <div className="w-12 h-12 bg-cush-primary rounded-lg flex items-center justify-center">
                            <productInfo.icon className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-semibold text-cush-gray-900">{builder.providerName}</h4>
                          <p className="text-sm text-cush-gray-600">{productInfo?.title}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(builder.status)}>
                        {builder.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-cush-gray-600">Credit Limit</p>
                        <p className="font-semibold text-cush-gray-900">
                          ${parseFloat(builder.creditLimit || '0').toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-cush-gray-600">Current Balance</p>
                        <p className="font-semibold text-cush-gray-900">
                          ${parseFloat(builder.currentBalance || '0').toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-cush-gray-600">Utilization</p>
                        <p className={`font-semibold ${utilization > 30 ? 'text-red-600' : 'text-green-600'}`}>
                          {utilization.toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-cush-gray-600">Monthly Payment</p>
                        <p className="font-semibold text-cush-gray-900">
                          ${parseFloat(builder.monthlyPayment || '0').toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}