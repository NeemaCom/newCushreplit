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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  DollarSign, 
  Building,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  CreditCard,
  Wallet,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const paymentTypes = [
  {
    type: 'tuition',
    title: 'Tuition Fees',
    description: 'University and college tuition payments',
    icon: GraduationCap,
    color: 'bg-blue-500',
    examples: ['Semester fees', 'Annual tuition', 'Course fees']
  },
  {
    type: 'sevis',
    title: 'SEVIS Fee',
    description: 'Student and Exchange Visitor Program fee',
    icon: FileText,
    color: 'bg-green-500',
    examples: ['I-20 SEVIS fee', 'DS-2019 SEVIS fee']
  },
  {
    type: 'wes',
    title: 'WES Evaluation',
    description: 'World Education Services credential evaluation',
    icon: Globe,
    color: 'bg-purple-500',
    examples: ['Document-by-document', 'Course-by-course', 'ICAP evaluation']
  }
];

export default function EducationalPayments() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>("");
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);

  // Fetch user's educational payments
  const { data: payments = [], isLoading } = useQuery({
    queryKey: ['/api/educational-payments'],
    enabled: !!user,
  });

  // Create payment mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/educational-payments", paymentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/educational-payments'] });
      setIsCreatingPayment(false);
      toast({
        title: "Payment Initiated",
        description: "Your educational fee payment has been submitted for processing!",
      });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'processing': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-orange-500 text-white';
      case 'failed': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'processing': return Clock;
      case 'pending': return AlertTriangle;
      case 'failed': return AlertTriangle;
      default: return Clock;
    }
  };

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
          <h2 className="text-3xl font-bold text-cush-gray-900">Educational Fee Payments</h2>
          <p className="text-cush-gray-600 mt-2">Pay tuition, SEVIS, and credential evaluation fees securely</p>
        </div>
        <Dialog open={isCreatingPayment} onOpenChange={setIsCreatingPayment}>
          <DialogTrigger asChild>
            <Button className="bg-cush-primary hover:bg-cush-primary-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Educational Payment</DialogTitle>
              <DialogDescription>
                Select the type of educational fee you'd like to pay
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {paymentTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Card 
                      key={type.type}
                      className={`cursor-pointer transition-all hover:shadow-lg border-2 ${
                        selectedPaymentType === type.type 
                          ? 'border-cush-primary bg-cush-primary-25' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPaymentType(type.type)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-cush-gray-900 mb-2">{type.title}</h3>
                        <p className="text-sm text-cush-gray-600 mb-3">{type.description}</p>
                        <div className="space-y-1">
                          {type.examples.map((example, idx) => (
                            <div key={idx} className="text-xs text-cush-gray-500">• {example}</div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {selectedPaymentType && (
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    createPaymentMutation.mutate({
                      paymentType: selectedPaymentType,
                      institutionName: formData.get('institutionName'),
                      studentId: formData.get('studentId'),
                      amount: formData.get('amount'),
                      currency: formData.get('currency'),
                      paymentMethod: formData.get('paymentMethod'),
                      dueDate: formData.get('dueDate'),
                      metadata: {
                        notes: formData.get('notes')
                      }
                    });
                  }}
                  className="space-y-4 p-4 bg-cush-gray-25 rounded-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="institutionName">Institution Name *</Label>
                      <Input 
                        id="institutionName" 
                        name="institutionName" 
                        placeholder="e.g., Harvard University" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input 
                        id="studentId" 
                        name="studentId" 
                        placeholder="Your student identification number" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount *</Label>
                      <Input 
                        id="amount" 
                        name="amount" 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        required 
                      />
                    </div>
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select name="currency" defaultValue="USD">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD - US Dollar</SelectItem>
                          <SelectItem value="GBP">GBP - British Pound</SelectItem>
                          <SelectItem value="EUR">EUR - Euro</SelectItem>
                          <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select name="paymentMethod" defaultValue="wallet">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="wallet">Cush Wallet</SelectItem>
                          <SelectItem value="card">Credit/Debit Card</SelectItem>
                          <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input 
                        id="dueDate" 
                        name="dueDate" 
                        type="date" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Additional Notes</Label>
                    <Textarea 
                      id="notes" 
                      name="notes" 
                      placeholder="Any additional information about this payment..." 
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      type="submit" 
                      className="bg-cush-primary hover:bg-cush-primary-600 text-white"
                      disabled={createPaymentMutation.isPending}
                    >
                      {createPaymentMutation.isPending ? "Processing..." : "Submit Payment"}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setSelectedPaymentType("");
                        setIsCreatingPayment(false);
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

      {/* Payment Types Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {paymentTypes.map((type) => {
          const IconComponent = type.icon;
          const typePayments = payments.filter((p: any) => p.paymentType === type.type);
          const totalAmount = typePayments.reduce((sum: number, p: any) => sum + parseFloat(p.amount), 0);
          
          return (
            <Card key={type.type} className="card-modern">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 ${type.color} rounded-lg flex items-center justify-center`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{type.title}</CardTitle>
                    <p className="text-sm text-cush-gray-600">{typePayments.length} payments</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-cush-gray-600">Total Paid</p>
                    <p className="text-2xl font-bold text-cush-gray-900">${totalAmount.toLocaleString()}</p>
                  </div>
                  <p className="text-sm text-cush-gray-600">{type.description}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Payments */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>Recent Payments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-cush-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cush-gray-900 mb-2">No Educational Payments Yet</h3>
              <p className="text-cush-gray-600 mb-6">Start by creating your first educational fee payment</p>
              <Button 
                onClick={() => setIsCreatingPayment(true)}
                className="bg-cush-primary hover:bg-cush-primary-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment: any) => {
                const StatusIcon = getStatusIcon(payment.status);
                const paymentTypeInfo = paymentTypes.find(t => t.type === payment.paymentType);
                
                return (
                  <div 
                    key={payment.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {paymentTypeInfo && (
                        <div className={`w-10 h-10 ${paymentTypeInfo.color} rounded-lg flex items-center justify-center`}>
                          <paymentTypeInfo.icon className="w-5 h-5 text-white" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-semibold text-cush-gray-900">{payment.institutionName}</h4>
                        <div className="flex items-center space-x-4 text-sm text-cush-gray-600">
                          <span>{paymentTypeInfo?.title}</span>
                          <span>•</span>
                          <span>${parseFloat(payment.amount).toLocaleString()} {payment.currency}</span>
                          <span>•</span>
                          <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(payment.status)}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {payment.status}
                      </Badge>
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