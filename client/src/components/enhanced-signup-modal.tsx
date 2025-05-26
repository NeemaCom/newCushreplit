import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Phone, 
  Globe, 
  Shield, 
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const signupSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Please enter a valid phone number"),
  country: z.string().min(1, "Please select your country"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "You must accept the Terms of Use"
  }),
  acceptPrivacy: z.boolean().refine(val => val === true, {
    message: "You must accept the Privacy Policy"
  }),
  marketingConsent: z.boolean().optional(),
});

type SignupFormData = z.infer<typeof signupSchema>;

interface EnhancedSignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const countries = [
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "IT", name: "Italy", dialCode: "+39" },
  { code: "ES", name: "Spain", dialCode: "+34" },
  { code: "NL", name: "Netherlands", dialCode: "+31" },
  { code: "BE", name: "Belgium", dialCode: "+32" },
  { code: "CH", name: "Switzerland", dialCode: "+41" },
  { code: "AT", name: "Austria", dialCode: "+43" },
  { code: "SE", name: "Sweden", dialCode: "+46" },
  { code: "NO", name: "Norway", dialCode: "+47" },
  { code: "DK", name: "Denmark", dialCode: "+45" },
  { code: "FI", name: "Finland", dialCode: "+358" },
  { code: "IE", name: "Ireland", dialCode: "+353" },
];

export default function EnhancedSignupModal({ isOpen, onClose, onComplete }: EnhancedSignupModalProps) {
  const { toast } = useToast();
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phoneNumber: "",
      country: "",
      acceptTerms: false,
      acceptPrivacy: false,
      marketingConsent: false,
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: SignupFormData) => {
      const response = await apiRequest("POST", "/api/auth/complete-signup", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration Complete!",
        description: "Your account has been set up successfully.",
      });
      onComplete();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const selectedCountryData = countries.find(c => c.code === selectedCountry);

  const onSubmit = (data: SignupFormData) => {
    signupMutation.mutate(data);
  };

  const handleReplitSignup = () => {
    // Redirect to Replit OAuth for signup
    window.location.href = "/api/login";
  };

  if (!isOpen) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-cush-gray-900 flex items-center">
              <User className="w-6 h-6 mr-3 text-cush-primary" />
              Complete Your Registration
            </DialogTitle>
            <p className="text-cush-gray-600">
              Please provide additional information to complete your Cush account setup.
            </p>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cush-gray-900">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your first name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your last name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter your email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cush-gray-900">Contact Information</h3>
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedCountry(value);
                        }} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {countries.map((country) => (
                            <SelectItem key={country.code} value={country.code}>
                              <div className="flex items-center space-x-2">
                                <span>{country.name}</span>
                                <span className="text-sm text-cush-gray-500">({country.dialCode})</span>
                              </div>
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
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className="flex space-x-2">
                        <div className="w-24 p-3 bg-cush-gray-50 border border-cush-gray-200 rounded-md text-sm text-cush-gray-600">
                          {selectedCountryData?.dialCode || "+--"}
                        </div>
                        <FormControl>
                          <Input 
                            placeholder="Enter your phone number" 
                            className="flex-1"
                            {...field} 
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Legal Agreements */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-cush-gray-900">Legal Agreements</h3>
                
                <div className="space-y-4 p-4 bg-cush-gray-25 rounded-xl">
                  <FormField
                    control={form.control}
                    name="acceptTerms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            I accept the{" "}
                            <button
                              type="button"
                              onClick={() => setShowTerms(true)}
                              className="text-cush-primary hover:underline"
                            >
                              Terms of Use
                            </button>
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="acceptPrivacy"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            I accept the{" "}
                            <button
                              type="button"
                              onClick={() => setShowPrivacy(true)}
                              className="text-cush-primary hover:underline"
                            >
                              Privacy Policy
                            </button>
                            <span className="text-red-500 ml-1">*</span>
                          </FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="marketingConsent"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="text-sm font-medium">
                            I would like to receive marketing communications and updates about Cush services
                          </FormLabel>
                          <p className="text-xs text-cush-gray-500">
                            You can unsubscribe at any time
                          </p>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Errors */}
                {(form.formState.errors.acceptTerms || form.formState.errors.acceptPrivacy) && (
                  <div className="flex items-center space-x-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please accept the required agreements to continue</span>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col space-y-3 pt-4">
                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-primary hover:opacity-90 text-white font-semibold text-lg rounded-xl"
                  disabled={signupMutation.isPending}
                >
                  {signupMutation.isPending ? "Creating Account..." : "Complete Registration"}
                </Button>
                
                <div className="flex items-center space-x-4">
                  <div className="flex-1 border-t border-cush-gray-200"></div>
                  <span className="text-sm text-cush-gray-500">or</span>
                  <div className="flex-1 border-t border-cush-gray-200"></div>
                </div>

                <div className="space-y-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => window.location.href = '/api/auth/gmail'}
                    className="w-full h-12 border-2 border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50 font-semibold text-lg rounded-xl"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Gmail
                  </Button>
                  

                </div>
              </div>

              <p className="text-xs text-cush-gray-500 text-center">
                By creating an account, you acknowledge that you have read and understood our Terms of Use and Privacy Policy.
              </p>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Terms of Use Modal */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-cush-gray-900 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-cush-primary" />
              Terms of Use
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-cush-gray-700">
            <h3 className="font-semibold">1. Acceptance of Terms</h3>
            <p>By accessing and using Cush services, you accept and agree to be bound by the terms and provision of this agreement.</p>
            
            <h3 className="font-semibold">2. Use License</h3>
            <p>Permission is granted to temporarily use Cush services for personal, non-commercial transitory viewing only. This license does not include the right to resell or make commercial use of the service.</p>
            
            <h3 className="font-semibold">3. Financial Services</h3>
            <p>Cush provides financial transfer services between supported currencies. All transactions are subject to verification and compliance with applicable regulations.</p>
            
            <h3 className="font-semibold">4. User Responsibilities</h3>
            <p>Users are responsible for maintaining the confidentiality of their account information and for all activities that occur under their account.</p>
            
            <h3 className="font-semibold">5. Prohibited Uses</h3>
            <p>You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts.</p>
            
            <h3 className="font-semibold">6. Limitations</h3>
            <p>In no event shall Cush or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowTerms(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Modal */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-cush-gray-900 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-cush-primary" />
              Privacy Policy
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm text-cush-gray-700">
            <h3 className="font-semibold">1. Information We Collect</h3>
            <p>We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support.</p>
            
            <h3 className="font-semibold">2. How We Use Your Information</h3>
            <p>We use the information we collect to provide, maintain, and improve our services, process transactions, and communicate with you.</p>
            
            <h3 className="font-semibold">3. Information Sharing</h3>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties except as described in this privacy policy.</p>
            
            <h3 className="font-semibold">4. Data Security</h3>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
            
            <h3 className="font-semibold">5. Your Rights</h3>
            <p>You have the right to access, update, or delete your personal information. You may also opt out of certain communications from us.</p>
            
            <h3 className="font-semibold">6. Contact Us</h3>
            <p>If you have any questions about this Privacy Policy, please contact us at privacy@cush.com.</p>
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setShowPrivacy(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}