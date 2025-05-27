import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Crown, 
  Users, 
  MessageCircle, 
  Phone, 
  Mail,
  Clock,
  Shield,
  CheckCircle,
  Star,
  Calendar,
  Zap,
  Award,
  HeartHandshake,
  FileText,
  Lock,
  CreditCard,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

const conciergeUpgradeSchema = z.object({
  planType: z.enum(["monthly", "yearly"]),
  consentToRecurringBilling: z.boolean().refine(val => val === true, "Consent to recurring billing is required"),
  termsAccepted: z.boolean().refine(val => val === true, "Terms of service must be accepted"),
});

type ConciergeUpgradeData = z.infer<typeof conciergeUpgradeSchema>;

const conciergeFeatures = [
  {
    icon: Users,
    title: "Dedicated Migration Assistant",
    description: "Get your own personal immigration expert assigned exclusively to your case"
  },
  {
    icon: MessageCircle,
    title: "Direct Chat Access",
    description: "Skip the queue with instant messaging access to your assistant"
  },
  {
    icon: Phone,
    title: "Priority Phone Support",
    description: "Schedule calls and get immediate phone support when you need it most"
  },
  {
    icon: Calendar,
    title: "Proactive Follow-ups",
    description: "Your assistant tracks deadlines and follows up on your behalf"
  },
  {
    icon: FileText,
    title: "Document Review",
    description: "Get expert review of all your immigration documents before submission"
  },
  {
    icon: Clock,
    title: "24/7 Emergency Support",
    description: "Access urgent support for time-sensitive immigration matters"
  }
];

const migrationAssistants = [
  {
    name: "Sarah Johnson",
    expertise: ["UK Visa", "Student Visa", "Work Permit"],
    rating: "4.9",
    completedCases: 150,
    languages: ["English", "French"],
    image: "👩‍💼"
  },
  {
    name: "Michael Chen",
    expertise: ["US Immigration", "Green Card", "Business Visa"],
    rating: "4.8",
    completedCases: 200,
    languages: ["English", "Mandarin"],
    image: "👨‍💼"
  },
  {
    name: "Priya Sharma",
    expertise: ["Canada Immigration", "Express Entry", "Family Visa"],
    rating: "4.9",
    completedCases: 180,
    languages: ["English", "Hindi", "Punjabi"],
    image: "👩‍🎓"
  }
];

function PaymentForm({ planType, onSuccess }: { planType: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    try {
      // Create payment method
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast({
          title: "Payment Error",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Process subscription
      const response = await apiRequest("POST", "/api/concierge/subscribe", {
        planType,
        paymentMethodId: paymentMethod.id,
      });

      const result = await response.json();

      if (result.requiresAction) {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(result.clientSecret);
        
        if (confirmError) {
          toast({
            title: "Authentication Failed",
            description: confirmError.message,
            variant: "destructive",
          });
          return;
        }
      }

      onSuccess();
      toast({
        title: "Welcome to Concierge Service!",
        description: "Your subscription is active. You'll be assigned a migration assistant shortly.",
      });

    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your subscription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border border-gray-200 rounded-lg">
        <Label className="text-sm font-medium mb-2 block">Payment Details</Label>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
            },
          }}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? "Processing..." : `Subscribe ${planType === 'yearly' ? '$200/year' : '$20/month'}`}
      </Button>
    </form>
  );
}

export default function ConciergeUpgrade() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("monthly");

  const form = useForm<ConciergeUpgradeData>({
    resolver: zodResolver(conciergeUpgradeSchema),
    defaultValues: {
      planType: "monthly",
      consentToRecurringBilling: false,
      termsAccepted: false,
    },
  });

  // Check if user already has concierge subscription
  const { data: subscription } = useQuery({
    queryKey: ['/api/concierge/subscription'],
    enabled: !!user,
  });

  // Fetch available migration assistants
  const { data: assistants = [] } = useQuery({
    queryKey: ['/api/concierge/assistants'],
  });

  const onUpgradeSuccess = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/concierge/subscription'] });
    toast({
      title: "Subscription Activated!",
      description: "Welcome to Cush Concierge Service. Your migration assistant will contact you within 24 hours.",
    });
  };

  if (subscription?.status === 'active') {
    return (
      <Card className="card-modern max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <div>
              <CardTitle className="text-2xl">Concierge Service Active</CardTitle>
              <p className="text-gray-600">You're subscribed to our premium migration assistance</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Active Subscription</span>
                </div>
                <Badge variant="default" className="bg-green-600">
                  {subscription.planType} Plan
                </Badge>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-3">Your Migration Assistant</h3>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">👩‍💼</div>
                  <div>
                    <div className="font-medium">{subscription.assignedMigrationAssistant || "Sarah Johnson"}</div>
                    <div className="text-sm text-gray-600">Immigration Specialist</div>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">4.9 rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Start Chat with Assistant
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Call
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Request Document Review
                  </Button>
                </div>
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-semibold mb-2">Subscription Details</h3>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Next billing: {new Date(subscription.nextBillingDate).toLocaleDateString()}</div>
                  <div>Amount: ${subscription.planType === 'yearly' ? '200' : '20'}/{subscription.planType === 'yearly' ? 'year' : 'month'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2">
          <Crown className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Concierge Service
          </h1>
        </div>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Get dedicated 1-on-1 support from expert migration assistants. Skip the queue, get priority help, and ensure your immigration journey is smooth and successful.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {conciergeFeatures.map((feature, index) => (
          <Card key={index} className="card-modern hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                  <feature.icon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Migration Assistants */}
      <Card className="card-modern">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Meet Our Migration Assistants</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {migrationAssistants.map((assistant, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <div className="text-4xl mb-3">{assistant.image}</div>
                <h3 className="font-semibold">{assistant.name}</h3>
                <div className="flex items-center justify-center space-x-1 mb-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{assistant.rating}</span>
                  <span className="text-sm text-gray-500">({assistant.completedCases} cases)</span>
                </div>
                <div className="text-xs text-gray-600 mb-2">
                  {assistant.expertise.join(", ")}
                </div>
                <div className="text-xs text-gray-500">
                  Speaks: {assistant.languages.join(", ")}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card className="card-modern max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Choose Your Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan === 'monthly' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`} 
                 onClick={() => setSelectedPlan('monthly')}>
              <div className="text-center">
                <div className="text-2xl font-bold">$20</div>
                <div className="text-sm text-gray-600">per month</div>
                <div className="mt-2">
                  <Badge variant={selectedPlan === 'monthly' ? 'default' : 'secondary'}>
                    Monthly
                  </Badge>
                </div>
              </div>
            </div>

            <div className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${selectedPlan === 'yearly' ? 'border-purple-600 bg-purple-50' : 'border-gray-200'}`} 
                 onClick={() => setSelectedPlan('yearly')}>
              <div className="text-center">
                <div className="text-2xl font-bold">$200</div>
                <div className="text-sm text-gray-600">per year</div>
                <div className="mt-2 space-y-1">
                  <Badge variant={selectedPlan === 'yearly' ? 'default' : 'secondary'}>
                    Yearly
                  </Badge>
                  <div className="text-xs text-green-600 font-medium">Save $40!</div>
                </div>
              </div>
            </div>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-lg py-6"
                onClick={() => {
                  form.setValue('planType', selectedPlan);
                  setIsModalOpen(true);
                }}
              >
                <Crown className="w-5 h-5 mr-2" />
                Upgrade to Concierge Service
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center space-x-2">
                  <Crown className="w-6 h-6 text-yellow-500" />
                  <span>Upgrade to Concierge Service</span>
                </DialogTitle>
                <DialogDescription>
                  Get dedicated migration assistance for {selectedPlan === 'yearly' ? '$200/year' : '$20/month'}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Security Notice */}
                <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Shield className="w-5 h-5 text-blue-600 mt-1" />
                  <div className="text-sm">
                    <div className="font-medium text-blue-900">Secure Payment</div>
                    <div className="text-blue-700">Your payment information is encrypted and processed securely by Stripe.</div>
                  </div>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="consentToRecurringBilling"
                      checked={form.watch("consentToRecurringBilling")}
                      onCheckedChange={(checked) => form.setValue("consentToRecurringBilling", !!checked)}
                    />
                    <Label htmlFor="consentToRecurringBilling" className="text-sm">
                      I consent to recurring billing of ${selectedPlan === 'yearly' ? '200 annually' : '20 monthly'} until I cancel. I understand I can cancel anytime from my account settings.
                    </Label>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="termsAccepted"
                      checked={form.watch("termsAccepted")}
                      onCheckedChange={(checked) => form.setValue("termsAccepted", !!checked)}
                    />
                    <Label htmlFor="termsAccepted" className="text-sm">
                      I accept the <a href="/terms" className="text-blue-600 underline">Terms of Service</a> and <a href="/privacy" className="text-blue-600 underline">Privacy Policy</a> for Concierge Service.
                    </Label>
                  </div>
                </div>

                {/* Payment Form */}
                {form.watch("consentToRecurringBilling") && form.watch("termsAccepted") && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      planType={selectedPlan} 
                      onSuccess={onUpgradeSuccess}
                    />
                  </Elements>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}