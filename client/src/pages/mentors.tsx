import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Calendar, Users, Plus, MessageCircle, Video } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Header from "@/components/header";

const mentorApplicationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  expertise: z.string().min(5, "Expertise must be at least 5 characters"),
  bio: z.string().min(50, "Bio must be at least 50 characters"),
  hourlyRate: z.string().min(1, "Hourly rate is required"),
  experience: z.string().min(1, "Experience is required"),
  credentials: z.string().min(10, "Credentials must be at least 10 characters"),
  languages: z.string().min(1, "Languages are required"),
});

type MentorApplicationData = z.infer<typeof mentorApplicationSchema>;

export default function Mentors() {
  const { user } = useAuth();
  const [selectedMentor, setSelectedMentor] = useState<any>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  
  const { data: mentors, isLoading } = useQuery({
    queryKey: ["/api/mentors"],
  });

  const form = useForm<MentorApplicationData>({
    resolver: zodResolver(mentorApplicationSchema),
    defaultValues: {
      name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : "",
      expertise: "",
      bio: "",
      hourlyRate: "",
      experience: "",
      credentials: "",
      languages: "English",
    },
  });

  const applicationMutation = useMutation({
    mutationFn: async (data: MentorApplicationData) => {
      const response = await apiRequest("POST", "/api/mentors/apply", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mentors"] });
      setShowApplicationModal(false);
      form.reset();
    },
  });

  const bookingMutation = useMutation({
    mutationFn: async (mentorId: number) => {
      const response = await apiRequest("POST", "/api/mentors/book", { mentorId });
      return response.json();
    },
    onSuccess: (data) => {
      window.open(data.bookingUrl, '_blank');
    },
  });

  const onSubmitApplication = (data: MentorApplicationData) => {
    applicationMutation.mutate(data);
  };

  const handleBookSession = (mentorId: number) => {
    bookingMutation.mutate(mentorId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-modern p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-cush-gray-200 rounded-2xl"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-cush-gray-200 rounded w-32"></div>
                    <div className="h-3 bg-cush-gray-200 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-cush-gray-200 rounded"></div>
                  <div className="h-3 bg-cush-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-bold text-cush-gray-900 mb-3">Immigration Mentors</h1>
            <p className="text-lg text-cush-gray-600">
              Connect with experienced immigration experts for personalized guidance
            </p>
          </div>
          
          <Dialog open={showApplicationModal} onOpenChange={setShowApplicationModal}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl shadow-modern-lg hover:shadow-modern-xl transition-all duration-300">
                <Plus className="w-5 h-5 mr-2" />
                Become a Mentor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-cush-gray-900">Apply to Become a Mentor</DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitApplication)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
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
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Area of Expertise</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., UK Student Visas" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Professional Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your background and experience..."
                            className="min-h-[100px]"
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
                      name="hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate (GBP)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="75.00" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="experience"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years of Experience</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="5" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="credentials"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credentials & Certifications</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="List your relevant qualifications, certifications, and professional memberships..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="languages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Languages Spoken</FormLabel>
                        <FormControl>
                          <Input placeholder="English, Spanish, French..." {...field} className="h-12" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
        </div>

        {/* Mentors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mentors?.map((mentor: any) => (
            <div key={mentor.id} className="card-feature p-6">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-16 w-16 shadow-modern-lg">
                  <AvatarImage src={mentor.profileImage} />
                  <AvatarFallback className="bg-gradient-primary text-white font-bold text-lg">
                    {mentor.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold text-cush-gray-900">{mentor.name}</h3>
                  <p className="text-cush-primary font-semibold">{mentor.expertise}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(parseFloat(mentor.rating))
                            ? 'text-yellow-400 fill-current'
                            : 'text-cush-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-cush-gray-600 ml-1">({mentor.rating})</span>
                  </div>
                </div>
              </div>

              <p className="text-cush-gray-700 mb-6 line-clamp-3">{mentor.bio}</p>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cush-gray-600">Hourly Rate</span>
                  <span className="text-xl font-bold text-cush-gray-900">£{mentor.hourlyRate}</span>
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleBookSession(mentor.id)}
                    className="flex-1 bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                    disabled={bookingMutation.isPending}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Book Session
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="px-4 py-3 border-2 border-cush-gray-300 hover:border-cush-primary hover:text-cush-primary rounded-xl transition-all duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {mentors?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-cush-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users className="w-12 h-12 text-cush-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-cush-gray-900 mb-2">No Mentors Available</h3>
            <p className="text-cush-gray-600 mb-6">Be the first to join our mentor community and help others with their immigration journey.</p>
            <Button
              onClick={() => setShowApplicationModal(true)}
              className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl"
            >
              <Plus className="w-5 h-5 mr-2" />
              Become a Mentor
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}