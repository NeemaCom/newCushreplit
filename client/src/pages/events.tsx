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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Clock, Plus, Video, Globe } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import Header from "@/components/header";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  eventDate: z.string().min(1, "Event date is required"),
  eventTime: z.string().min(1, "Event time is required"),
  location: z.string().min(3, "Location is required"),
  isVirtual: z.boolean(),
  maxAttendees: z.string().min(1, "Max attendees is required"),
  eventType: z.enum(["workshop", "webinar", "consultation", "networking"]),
  price: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
});

type EventFormData = z.infer<typeof eventSchema>;

export default function Events() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const form = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      eventDate: "",
      eventTime: "",
      location: "",
      isVirtual: false,
      maxAttendees: "50",
      eventType: "workshop",
      price: "0",
      imageUrl: "",
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (data: EventFormData) => {
      const eventDateTime = new Date(`${data.eventDate}T${data.eventTime}`);
      const eventData = {
        ...data,
        eventDate: eventDateTime.toISOString(),
        maxAttendees: parseInt(data.maxAttendees),
        price: data.price ? parseFloat(data.price) : 0,
      };
      const response = await apiRequest("POST", "/api/events", eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
      setShowCreateModal(false);
      form.reset();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await apiRequest("POST", "/api/events/register", { eventId });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
  });

  const onSubmitEvent = (data: EventFormData) => {
    createEventMutation.mutate(data);
  };

  const handleRegister = (eventId: number) => {
    registerMutation.mutate(eventId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-modern p-6 animate-pulse">
                <div className="h-48 bg-cush-gray-200 rounded-xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-cush-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-cush-gray-200 rounded"></div>
                  <div className="h-3 bg-cush-gray-200 rounded w-1/2"></div>
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
            <h1 className="text-4xl font-bold text-cush-gray-900 mb-3">Immigration Events</h1>
            <p className="text-lg text-cush-gray-600">
              Join workshops, webinars, and networking events to accelerate your immigration journey
            </p>
          </div>
          
          {user && (
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl shadow-modern-lg hover:shadow-modern-xl transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Event
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-cush-gray-900">Create New Event</DialogTitle>
                </DialogHeader>
                
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmitEvent)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Title</FormLabel>
                          <FormControl>
                            <Input placeholder="UK Student Visa Workshop" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe what attendees will learn and benefit from this event..."
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
                        name="eventDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="eventTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Time</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="eventType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-12">
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="workshop">Workshop</SelectItem>
                                <SelectItem value="webinar">Webinar</SelectItem>
                                <SelectItem value="consultation">Consultation</SelectItem>
                                <SelectItem value="networking">Networking</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="maxAttendees"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Max Attendees</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="50" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Virtual Event or Physical Address" {...field} className="h-12" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price (GBP) - Optional</FormLabel>
                            <FormControl>
                              <Input type="number" step="0.01" placeholder="0.00" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="imageUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Event Image URL - Optional</FormLabel>
                            <FormControl>
                              <Input placeholder="https://example.com/image.jpg" {...field} className="h-12" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name="isVirtual"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="w-4 h-4 text-cush-primary border-cush-gray-300 rounded focus:ring-cush-primary"
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-medium">Virtual Event</FormLabel>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full h-14 bg-gradient-primary hover:opacity-90 text-white font-bold text-lg rounded-xl"
                      disabled={createEventMutation.isPending}
                    >
                      {createEventMutation.isPending ? "Creating Event..." : "Create Event"}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events?.map((event: any) => (
            <div key={event.id} className="card-feature overflow-hidden">
              {/* Event Image */}
              <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center text-white">
                      <Calendar className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold capitalize">{event.eventType}</p>
                    </div>
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <Badge className="bg-white text-cush-primary font-semibold capitalize">
                    {event.eventType}
                  </Badge>
                </div>
                {event.isVirtual && (
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-green-500 text-white font-semibold">
                      <Video className="w-3 h-3 mr-1" />
                      Virtual
                    </Badge>
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-cush-gray-900 mb-3 line-clamp-2">
                  {event.title}
                </h3>
                
                <p className="text-cush-gray-700 mb-4 line-clamp-3">
                  {event.description}
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-cush-gray-600">
                    <Calendar className="w-4 h-4 mr-2 text-cush-primary" />
                    {format(new Date(event.eventDate), "PPP 'at' p")}
                  </div>
                  
                  <div className="flex items-center text-sm text-cush-gray-600">
                    {event.isVirtual ? (
                      <Globe className="w-4 h-4 mr-2 text-cush-primary" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-2 text-cush-primary" />
                    )}
                    {event.location}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-cush-gray-600">
                      <Users className="w-4 h-4 mr-2 text-cush-primary" />
                      {event.currentAttendees || 0}/{event.maxAttendees} attendees
                    </div>
                    {event.price > 0 && (
                      <div className="text-lg font-bold text-cush-primary">
                        £{event.price}
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  onClick={() => handleRegister(event.id)}
                  className="w-full bg-gradient-primary hover:opacity-90 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                  disabled={registerMutation.isPending || event.currentAttendees >= event.maxAttendees}
                >
                  {event.currentAttendees >= event.maxAttendees 
                    ? "Event Full" 
                    : registerMutation.isPending 
                    ? "Registering..." 
                    : event.price > 0 
                    ? `Register - £${event.price}` 
                    : "Register Free"
                  }
                </Button>
              </div>
            </div>
          ))}
        </div>

        {events?.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-cush-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-12 h-12 text-cush-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-cush-gray-900 mb-2">No Events Scheduled</h3>
            <p className="text-cush-gray-600 mb-6">Be the first to create an event and bring the community together.</p>
            {user && (
              <Button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-3 rounded-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Event
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}