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
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  DollarSign, 
  TrendingUp, 
  Users,
  FileText,
  CheckCircle,
  AlertTriangle,
  Star,
  Building,
  CreditCard,
  Target,
  Globe,
  Lock,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const preQualificationSchema = z.object({
  monthlyIncome: z.string().min(1, "Monthly income is required"),
  employmentStatus: z.enum(["employed", "self_employed", "unemployed", "student", "retired"]),
  loanPurpose: z.enum(["business", "education", "personal", "debt_consolidation", "home_improvement"]),
  requestedAmount: z.string().min(1, "Loan amount is required"),
  creditScore: z.string().optional(),
  consentGiven: z.boolean().refine(val => val === true, "Consent is required"),
  privacyPolicyAccepted: z.boolean().refine(val => val === true, "Privacy policy acceptance is required"),
});

type PreQualificationData = z.infer<typeof preQualificationSchema>;

const loanPartners = [
  {
    name: "LendingClub",
    logo: "🏦",
    minAmount: "$1,000",
    maxAmount: "$40,000",
    rates: "6.95% - 35.89%",
    features: ["Quick approval", "No collateral required", "Flexible terms"]
  },
  {
    name: "Upstart",
    logo: "⚡",
    minAmount: "$1,000",
    maxAmount: "$50,000", 
    rates: "5.31% - 35.99%",
    features: ["AI-powered approval", "Education-friendly", "Fast funding"]
  },
  {
    name: "Prosper",
    logo: "📈",
    minAmount: "$2,000",
    maxAmount: "$40,000",
    rates: "7.95% - 35.99%",
    features: ["Peer-to-peer lending", "Debt consolidation", "Fixed rates"]
  }
];

export default function LoanPreQualification() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [qualificationResult, setQualificationResult] = useState<any>(null);

  const form = useForm<PreQualificationData>({
    resolver: zodResolver(preQualificationSchema),
    defaultValues: {
      monthlyIncome: "",
      employmentStatus: undefined,
      loanPurpose: undefined,
      requestedAmount: "",
      creditScore: "",
      consentGiven: false,
      privacyPolicyAccepted: false,
    },
  });

  // Fetch user's pre-qualifications
  const { data: preQualifications = [], isLoading } = useQuery({
    queryKey: ['/api/loan-pre-qualifications'],
    enabled: !!user,
  });

  // Fetch active referrals
  const { data: referrals = [] } = useQuery({
    queryKey: ['/api/loan-referrals'],
    enabled: !!user,
  });

  // Submit pre-qualification
  const preQualifyMutation = useMutation({
    mutationFn: async (data: PreQualificationData) => {
      const response = await apiRequest("POST", "/api/loan-pre-qualifications", data);
      return response.json();
    },
    onSuccess: (result) => {
      setQualificationResult(result);
      setCurrentStep(3);
      queryClient.invalidateQueries({ queryKey: ['/api/loan-pre-qualifications'] });
      toast({
        title: "Pre-Qualification Complete",
        description: "We've analyzed your information and found matching loan options!",
      });
    },
    onError: () => {
      toast({
        title: "Pre-Qualification Failed",
        description: "There was an error processing your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Submit referral to partner
  const referralMutation = useMutation({
    mutationFn: async (partnerData: any) => {
      const response = await apiRequest("POST", "/api/loan-referrals", partnerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/loan-referrals'] });
      toast({
        title: "Referral Submitted",
        description: "Your application has been sent to the lender. You'll hear back within 24 hours!",
      });
    },
  });

  const onSubmit = (data: PreQualificationData) => {
    preQualifyMutation.mutate(data);
  };

  const getQualificationColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getQualificationStatus = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
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
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-cush-gray-900 mb-4">Loan Pre-Qualification</h2>
        <p className="text-lg text-cush-gray-600 max-w-2xl mx-auto">
          Get pre-qualified for loans from trusted partners in just 3 minutes. 
          No impact to your credit score during pre-qualification.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-cush-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-cush-primary text-white' : 'bg-gray-200'}`}>
              1
            </div>
            <span className="text-sm font-medium">Basic Info</span>
          </div>
          <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-cush-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-cush-primary text-white' : 'bg-gray-200'}`}>
              2
            </div>
            <span className="text-sm font-medium">Qualification</span>
          </div>
          <div className={`flex items-center space-x-2 ${currentStep >= 3 ? 'text-cush-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-cush-primary text-white' : 'bg-gray-200'}`}>
              3
            </div>
            <span className="text-sm font-medium">Results</span>
          </div>
        </div>
        <Progress value={(currentStep / 3) * 100} className="h-2" />
      </div>

      {/* Step 1: Pre-Qualification Form */}
      {currentStep === 1 && (
        <Card className="max-w-2xl mx-auto card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Tell Us About Yourself</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthlyIncome">Monthly Income *</Label>
                  <Input
                    id="monthlyIncome"
                    type="number"
                    placeholder="5000"
                    {...form.register("monthlyIncome")}
                  />
                  {form.formState.errors.monthlyIncome && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.monthlyIncome.message}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="requestedAmount">Requested Loan Amount *</Label>
                  <Input
                    id="requestedAmount"
                    type="number"
                    placeholder="10000"
                    {...form.register("requestedAmount")}
                  />
                  {form.formState.errors.requestedAmount && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.requestedAmount.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="employmentStatus">Employment Status *</Label>
                  <Select onValueChange={(value) => form.setValue("employmentStatus", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employed">Employed</SelectItem>
                      <SelectItem value="self_employed">Self-Employed</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="unemployed">Unemployed</SelectItem>
                      <SelectItem value="retired">Retired</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.employmentStatus && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.employmentStatus.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="loanPurpose">Loan Purpose *</Label>
                  <Select onValueChange={(value) => form.setValue("loanPurpose", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                      <SelectItem value="debt_consolidation">Debt Consolidation</SelectItem>
                      <SelectItem value="home_improvement">Home Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.loanPurpose && (
                    <p className="text-red-500 text-sm mt-1">{form.formState.errors.loanPurpose.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="creditScore">Credit Score (Optional)</Label>
                  <Input
                    id="creditScore"
                    type="number"
                    placeholder="650"
                    {...form.register("creditScore")}
                  />
                  <p className="text-sm text-gray-500 mt-1">If you don't know your credit score, we'll estimate it</p>
                </div>
              </div>

              {/* Privacy and Consent */}
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Privacy & Security</h3>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consentGiven"
                    checked={form.watch("consentGiven")}
                    onCheckedChange={(checked) => form.setValue("consentGiven", !!checked)}
                  />
                  <Label htmlFor="consentGiven" className="text-sm">
                    I consent to sharing my information with loan partners for pre-qualification purposes. 
                    This will not affect my credit score.
                  </Label>
                </div>
                {form.formState.errors.consentGiven && (
                  <p className="text-red-500 text-sm">{form.formState.errors.consentGiven.message}</p>
                )}

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="privacyPolicyAccepted"
                    checked={form.watch("privacyPolicyAccepted")}
                    onCheckedChange={(checked) => form.setValue("privacyPolicyAccepted", !!checked)}
                  />
                  <Label htmlFor="privacyPolicyAccepted" className="text-sm">
                    I accept the <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a> and 
                    <a href="/terms" className="text-blue-600 underline ml-1">Terms of Service</a>
                  </Label>
                </div>
                {form.formState.errors.privacyPolicyAccepted && (
                  <p className="text-red-500 text-sm">{form.formState.errors.privacyPolicyAccepted.message}</p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full bg-cush-primary hover:bg-cush-primary-600 text-white"
                disabled={preQualifyMutation.isPending}
              >
                {preQualifyMutation.isPending ? "Processing..." : "Check My Pre-Qualification"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Results & Partner Options */}
      {currentStep === 3 && qualificationResult && (
        <div className="space-y-8">
          {/* Qualification Score */}
          <Card className="max-w-2xl mx-auto card-modern">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Your Pre-Qualification Results</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <div className={`text-6xl font-bold ${getQualificationColor(qualificationResult.qualificationScore)}`}>
                    {qualificationResult.qualificationScore}
                  </div>
                  <div>
                    <div className={`text-lg font-semibold ${getQualificationColor(qualificationResult.qualificationScore)}`}>
                      {getQualificationStatus(qualificationResult.qualificationScore)}
                    </div>
                    <div className="text-sm text-gray-600">Qualification Score</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cush-gray-900">${qualificationResult.estimatedAmount}</div>
                    <div className="text-sm text-gray-600">Estimated Loan Amount</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-cush-gray-900">{qualificationResult.estimatedRate}%</div>
                    <div className="text-sm text-gray-600">Estimated Rate Range</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Options */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-cush-gray-900 text-center">Choose Your Preferred Lender</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {loanPartners.map((partner, index) => (
                <Card key={index} className="card-modern hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{partner.logo}</div>
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <p className="text-sm text-gray-600">{partner.rates} APR</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Loan Range:</span>
                        <span className="font-semibold">{partner.minAmount} - {partner.maxAmount}</span>
                      </div>
                      
                      <div className="space-y-2">
                        {partner.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Button 
                        className="w-full bg-cush-primary hover:bg-cush-primary-600 text-white"
                        onClick={() => referralMutation.mutate({ 
                          partnerName: partner.name,
                          preQualificationId: qualificationResult.id 
                        })}
                        disabled={referralMutation.isPending}
                      >
                        {referralMutation.isPending ? "Submitting..." : "Apply Now"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Pre-Qualifications */}
      {preQualifications.length > 0 && currentStep === 1 && (
        <Card className="card-modern">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Your Previous Applications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {preQualifications.map((preQual: any) => (
                <div key={preQual.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div>
                    <div className="font-semibold">${preQual.requestedAmount} {preQual.loanPurpose} loan</div>
                    <div className="text-sm text-gray-600">
                      Applied {new Date(preQual.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={preQual.status === 'qualified' ? 'default' : 'secondary'}>
                    {preQual.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}