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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building, 
  Calculator, 
  CreditCard, 
  DollarSign, 
  FileText, 
  Home, 
  Plus, 
  Percent,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Shield,
  Users,
  Briefcase
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";

const loanApplicationSchema = z.object({
  loanType: z.enum(["personal", "business", "education", "immigration", "property"]),
  amount: z.string().min(1, "Loan amount is required"),
  purpose: z.string().min(10, "Purpose must be at least 10 characters"),
  duration: z.string().min(1, "Loan duration is required"),
  income: z.string().min(1, "Monthly income is required"),
  employment: z.string().min(1, "Employment status is required"),
  country: z.enum(["nigeria", "uk"]),
  
  // Personal Information
  fullName: z.string().min(2, "Full name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(10, "Complete address is required"),
  
  // Financial Information
  bankName: z.string().min(1, "Bank name is required"),
  accountNumber: z.string().min(8, "Valid account number is required"),
  creditScore: z.string().optional(),
  
  // Supporting Documents
  identificationDoc: z.string().optional(),
  incomeProof: z.string().optional(),
  bankStatements: z.string().optional(),
});

type LoanApplicationData = z.infer<typeof loanApplicationSchema>;

// Loan products configuration
const loanProducts = {
  nigeria: [
    {
      type: "personal",
      name: "Personal Loan",
      description: "Quick cash for personal needs",
      maxAmount: "₦5,000,000",
      interestRate: "15-25%",
      duration: "6-36 months",
      processing: "24-48 hours",
      requirements: ["Valid ID", "Proof of income", "Bank statements"],
      icon: Users,
      color: "bg-blue-500"
    },
    {
      type: "business",
      name: "Business Loan",
      description: "Fund your business growth",
      maxAmount: "₦20,000,000",
      interestRate: "18-28%",
      duration: "12-60 months",
      processing: "3-7 days",
      requirements: ["Business registration", "Financial statements", "Collateral"],
      icon: Briefcase,
      color: "bg-green-500"
    },
    {
      type: "immigration",
      name: "Immigration Loan",
      description: "Finance your relocation journey",
      maxAmount: "₦10,000,000",
      interestRate: "12-20%",
      duration: "12-48 months",
      processing: "2-5 days",
      requirements: ["Visa documents", "Travel itinerary", "Sponsor letter"],
      icon: FileText,
      color: "bg-purple-500"
    }
  ],
  uk: [
    {
      type: "personal",
      name: "Personal Loan",
      description: "Unsecured personal financing",
      maxAmount: "£50,000",
      interestRate: "3.2-15.9%",
      duration: "12-84 months",
      processing: "Same day",
      requirements: ["UK residency", "Credit check", "Proof of income"],
      icon: Users,
      color: "bg-blue-500"
    },
    {
      type: "property",
      name: "Property Loan",
      description: "Mortgages for property purchase",
      maxAmount: "£1,000,000",
      interestRate: "2.5-6.5%",
      duration: "15-35 years",
      processing: "2-4 weeks",
      requirements: ["Property valuation", "Credit history", "Deposit"],
      icon: Home,
      color: "bg-orange-500"
    },
    {
      type: "education",
      name: "Education Loan",
      description: "Student loans for higher education",
      maxAmount: "£100,000",
      interestRate: "1.5-6.1%",
      duration: "5-25 years",
      processing: "1-2 weeks",
      requirements: ["University offer", "Course details", "Guarantor"],
      icon: FileText,
      color: "bg-indigo-500"
    }
  ]
};

export default function Loans() {
  const { user } = useAuth();
  const [selectedCountry, setSelectedCountry] = useState<"nigeria" | "uk">("nigeria");
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState<string>("");
  const [loanCalculator, setLoanCalculator] = useState({
    amount: "",
    duration: "",
    rate: ""
  });

  const { data: loanApplications, isLoading } = useQuery({
    queryKey: ["/api/loans/applications"],
  });

  const form = useForm<LoanApplicationData>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: {
      country: selectedCountry,
      fullName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: LoanApplicationData) => {
      const response = await apiRequest("POST", "/api/loans/apply", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/loans/applications"] });
      setShowApplicationModal(false);
      form.reset();
    },
  });

  const onSubmitApplication = (data: LoanApplicationData) => {
    applicationMutation.mutate(data);
  };

  const calculateMonthlyPayment = () => {
    const principal = parseFloat(loanCalculator.amount);
    const rate = parseFloat(loanCalculator.rate) / 100 / 12;
    const duration = parseInt(loanCalculator.duration);
    
    if (principal && rate && duration) {
      const monthlyPayment = (principal * rate * Math.pow(1 + rate, duration)) / (Math.pow(1 + rate, duration) - 1);
      return monthlyPayment.toFixed(2);
    }
    return "0.00";
  };

  const currentProducts = loanProducts[selectedCountry];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-cush-gray-900 mb-3">Loan Services</h1>
            <p className="text-lg text-cush-gray-600">
              Flexible financing solutions for your personal and business needs
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Select value={selectedCountry} onValueChange={(value: "nigeria" | "uk") => setSelectedCountry(value)}>
              <SelectTrigger className="w-40 h-12 border-cush-gray-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nigeria">🇳🇬 Nigeria</SelectItem>
                <SelectItem value="uk">🇬🇧 United Kingdom</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="products" className="text-lg py-3">Loan Products</TabsTrigger>
            <TabsTrigger value="calculator" className="text-lg py-3">Calculator</TabsTrigger>
            <TabsTrigger value="applications" className="text-lg py-3">My Applications</TabsTrigger>
          </TabsList>

          {/* Loan Products */}
          <TabsContent value="products" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentProducts.map((product) => {
                const IconComponent = product.icon;
                return (
                  <Card key={product.type} className="card-feature overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-14 h-14 ${product.color} rounded-2xl flex items-center justify-center shadow-lg`}>
                          <IconComponent className="w-7 h-7 text-white" />
                        </div>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                      <CardTitle className="text-xl font-bold text-cush-gray-900">{product.name}</CardTitle>
                      <p className="text-cush-gray-600">{product.description}</p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-cush-gray-500">Max Amount</p>
                          <p className="font-bold text-cush-gray-900">{product.maxAmount}</p>
                        </div>
                        <div>
                          <p className="text-cush-gray-500">Interest Rate</p>
                          <p className="font-bold text-cush-gray-900">{product.interestRate}</p>
                        </div>
                        <div>
                          <p className="text-cush-gray-500">Duration</p>
                          <p className="font-bold text-cush-gray-900">{product.duration}</p>
                        </div>
                        <div>
                          <p className="text-cush-gray-500">Processing</p>
                          <p className="font-bold text-cush-gray-900">{product.processing}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-cush-gray-700 mb-2">Requirements:</p>
                        <ul className="text-xs text-cush-gray-600 space-y-1">
                          {product.requirements.map((req, index) => (
                            <li key={index} className="flex items-center">
                              <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={() => {
                          setSelectedLoanType(product.type);
                          setShowApplicationModal(true);
                        }}
                        className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                      >
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Loan Calculator */}
          <TabsContent value="calculator" className="space-y-8">
            <Card className="card-modern max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-cush-gray-900 flex items-center">
                  <Calculator className="w-6 h-6 mr-3 text-cush-primary" />
                  Loan Calculator
                </CardTitle>
                <p className="text-cush-gray-600">Calculate your monthly payments and total interest</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>Loan Amount ({selectedCountry === 'nigeria' ? '₦' : '£'})</Label>
                    <Input
                      type="number"
                      placeholder="100,000"
                      value={loanCalculator.amount}
                      onChange={(e) => setLoanCalculator(prev => ({ ...prev, amount: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <Label>Interest Rate (%)</Label>
                    <Input
                      type="number"
                      step="0.1"
                      placeholder="15.5"
                      value={loanCalculator.rate}
                      onChange={(e) => setLoanCalculator(prev => ({ ...prev, rate: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  
                  <div>
                    <Label>Duration (months)</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={loanCalculator.duration}
                      onChange={(e) => setLoanCalculator(prev => ({ ...prev, duration: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="bg-cush-primary-50 rounded-2xl p-6 text-center">
                  <p className="text-sm text-cush-gray-600 mb-2">Monthly Payment</p>
                  <p className="text-4xl font-bold text-cush-primary">
                    {selectedCountry === 'nigeria' ? '₦' : '£'}{calculateMonthlyPayment()}
                  </p>
                  <p className="text-xs text-cush-gray-500 mt-2">
                    Total Interest: {selectedCountry === 'nigeria' ? '₦' : '£'}{
                      loanCalculator.amount && loanCalculator.duration ? 
                        ((parseFloat(calculateMonthlyPayment()) * parseInt(loanCalculator.duration)) - parseFloat(loanCalculator.amount)).toFixed(2) : 
                        '0.00'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Applications */}
          <TabsContent value="applications" className="space-y-8">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-cush-gray-900">My Loan Applications</CardTitle>
              </CardHeader>
              
              <CardContent>
                {loanApplications && loanApplications.length > 0 ? (
                  <div className="space-y-4">
                    {loanApplications.map((application: any) => (
                      <div key={application.id} className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-cush-primary-100 rounded-xl flex items-center justify-center">
                            <Building className="w-6 h-6 text-cush-primary" />
                          </div>
                          <div>
                            <p className="font-semibold text-cush-gray-900 capitalize">{application.loanType} Loan</p>
                            <p className="text-sm text-cush-gray-600">{application.purpose}</p>
                            <p className="text-xs text-cush-gray-500">Applied: {new Date(application.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-cush-gray-900">{application.country === 'nigeria' ? '₦' : '£'}{parseFloat(application.amount).toLocaleString()}</p>
                          <Badge className={`text-xs ${
                            application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-cush-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-10 h-10 text-cush-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-cush-gray-900 mb-2">No Applications Yet</h3>
                    <p className="text-cush-gray-600 mb-6">Apply for a loan to get started</p>
                    <Button
                      onClick={() => setShowApplicationModal(true)}
                      className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Apply for Loan
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Application Modal */}
        <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-cush-gray-900">Apply for Loan</DialogTitle>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitApplication)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="loanType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Type</FormLabel>
                        <Select onValueChange={field.onChange} value={selectedLoanType || field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select loan type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {currentProducts.map((product) => (
                              <SelectItem key={product.type} value={product.type}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loan Amount ({selectedCountry === 'nigeria' ? '₦' : '£'})</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="100000" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="purpose"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purpose of Loan</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe what you need the loan for..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (months)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="12" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="income"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Income</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="50000" {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="employment"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employment Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employed">Employed</SelectItem>
                            <SelectItem value="self-employed">Self Employed</SelectItem>
                            <SelectItem value="business-owner">Business Owner</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="unemployed">Unemployed</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-cush-gray-900 mb-4">Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input type="tel" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-14 bg-gradient-primary hover:opacity-90 text-white font-bold text-lg rounded-xl"
                  disabled={applicationMutation.isPending}
                >
                  {applicationMutation.isPending ? "Submitting Application..." : "Submit Application"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}