import { useState, useRef } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  User, 
  Camera, 
  Upload, 
  Save, 
  Edit3, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  Settings,
  Bell,
  Lock,
  CreditCard,
  Eye,
  EyeOff
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const profileUpdateSchema = z.object({
  bio: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  dateOfBirth: z.string().optional(),
  nationality: z.string().optional(),
  occupation: z.string().optional(),
  company: z.string().optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
  currency: z.string().optional(),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["/api/profile"],
    enabled: isOpen,
  });

  const form = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      bio: userProfile?.bio || "",
      phoneNumber: userProfile?.phoneNumber || "",
      address: userProfile?.address || "",
      dateOfBirth: userProfile?.dateOfBirth || "",
      nationality: userProfile?.nationality || "",
      occupation: userProfile?.occupation || "",
      company: userProfile?.company || "",
      timezone: userProfile?.timezone || "UTC",
      language: userProfile?.language || "en",
      currency: userProfile?.currency || "GBP",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      const response = await apiRequest("PUT", "/api/profile", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditingAvatar(false);
      setAvatarPreview(null);
      toast({
        title: "Avatar Updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Upload Failed",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = () => {
    const file = fileInputRef.current?.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  const onSubmitProfile = (data: ProfileUpdateData) => {
    updateProfileMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cush-gray-900 flex items-center">
            <User className="w-6 h-6 mr-3 text-cush-primary" />
            Account Settings
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Avatar Section */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900">Profile Picture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={avatarPreview || userProfile?.customAvatarUrl || user?.profileImageUrl} 
                      />
                      <AvatarFallback className="bg-gradient-primary text-white text-2xl font-bold">
                        {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                      </AvatarFallback>
                    </Avatar>
                    
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-cush-primary hover:bg-cush-primary-600 p-0"
                      onClick={() => {
                        setIsEditingAvatar(!isEditingAvatar);
                        if (!isEditingAvatar) {
                          fileInputRef.current?.click();
                        }
                      }}
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </Button>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-cush-gray-900">
                      {user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : 'User Account'}
                    </h3>
                    <p className="text-cush-gray-600">{user?.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">Premium Member</Badge>
                    </div>
                  </div>

                  {avatarPreview && (
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleAvatarUpload}
                        disabled={uploadAvatarMutation.isPending}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {uploadAvatarMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setAvatarPreview(null);
                          setIsEditingAvatar(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Profile Form */}
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900">Personal Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitProfile)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us about yourself..."
                              className="min-h-[80px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="+44 7XXX XXXXXX" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date of Birth</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Your full address..."
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
                        name="nationality"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nationality</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., British, Nigerian" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Occupation</FormLabel>
                            <FormControl>
                              <Input placeholder="Your job title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company</FormLabel>
                            <FormControl>
                              <Input placeholder="Company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving Changes..." : "Save Changes"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-cush-primary" />
                  Account Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-cush-gray-900">Email Verification</p>
                      <p className="text-sm text-cush-gray-600">Your email is verified</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Verified</Badge>
                </div>

                <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-cush-gray-900">Phone Verification</p>
                      <p className="text-sm text-cush-gray-600">Verify your phone number</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Verify
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Lock className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-cush-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-cush-gray-600">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-cush-primary" />
                  Account Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="timezone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Timezone</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select timezone" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="UTC">UTC</SelectItem>
                            <SelectItem value="GMT">GMT (London)</SelectItem>
                            <SelectItem value="WAT">WAT (Lagos)</SelectItem>
                            <SelectItem value="EST">EST (New York)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Language</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="GBP">GBP (£)</SelectItem>
                            <SelectItem value="NGN">NGN (₦)</SelectItem>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="card-modern">
              <CardHeader>
                <CardTitle className="text-lg font-bold text-cush-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-cush-primary" />
                  Notification Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                    <div>
                      <p className="font-semibold text-cush-gray-900">Email Notifications</p>
                      <p className="text-sm text-cush-gray-600">Receive updates via email</p>
                    </div>
                    <Button variant="outline" size="sm">On</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                    <div>
                      <p className="font-semibold text-cush-gray-900">SMS Notifications</p>
                      <p className="text-sm text-cush-gray-600">Get text message alerts</p>
                    </div>
                    <Button variant="outline" size="sm">Off</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-cush-gray-25 rounded-xl">
                    <div>
                      <p className="font-semibold text-cush-gray-900">Transaction Alerts</p>
                      <p className="text-sm text-cush-gray-600">Instant transaction notifications</p>
                    </div>
                    <Button variant="outline" size="sm">On</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}