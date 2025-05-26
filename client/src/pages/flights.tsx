import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { flightSearchSchema, type FlightSearchRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plane, Calendar, Users, Clock, Star } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";

export default function Flights() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userBookings = [] } = useQuery({
    queryKey: ["/api/flights/bookings"],
  });

  const form = useForm<FlightSearchRequest>({
    resolver: zodResolver(flightSearchSchema),
    defaultValues: {
      origin: "",
      destination: "",
      departureDate: "",
      returnDate: "",
      passengers: 1,
      flightClass: "economy",
    },
  });

  const searchMutation = useMutation({
    mutationFn: async (data: FlightSearchRequest) => {
      setIsSearching(true);
      const response = await apiRequest("POST", "/api/flights/search", data);
      return response.json();
    },
    onSuccess: (data) => {
      setSearchResults(data.flights || []);
      setIsSearching(false);
      if (data.flights?.length === 0) {
        toast({
          title: "No Flights Found",
          description: "Try adjusting your search criteria",
        });
      }
    },
    onError: (error: any) => {
      setIsSearching(false);
      toast({
        title: "Search Failed",
        description: error.message || "Failed to search flights",
        variant: "destructive",
      });
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (flightData: any) => {
      const response = await apiRequest("POST", "/api/flights/book", flightData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/flights/bookings"] });
      toast({
        title: "Booking Initiated",
        description: `Booking reference: ${data.bookingReference}. Redirecting to payment...`,
      });
      
      // Redirect to payment page
      window.location.href = data.checkoutUrl;
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to book flight",
        variant: "destructive",
      });
    },
  });

  const onSubmitSearch = (data: FlightSearchRequest) => {
    searchMutation.mutate(data);
  };

  const handleBookFlight = (flight: any) => {
    const searchData = form.getValues();
    bookMutation.mutate({
      ...flight,
      searchCriteria: searchData,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Flight Booking</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find and book the best flights for your journey with competitive rates and Cush support
          </p>
        </div>

        {/* Search Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plane className="mr-2 text-blue-600" />
              Search Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmitSearch)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From</Label>
                  <Input
                    placeholder="Lagos (LOS)"
                    {...form.register("origin")}
                  />
                  {form.formState.errors.origin && (
                    <p className="text-sm text-red-600">{form.formState.errors.origin.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>To</Label>
                  <Input
                    placeholder="London (LHR)"
                    {...form.register("destination")}
                  />
                  {form.formState.errors.destination && (
                    <p className="text-sm text-red-600">{form.formState.errors.destination.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Departure Date</Label>
                  <Input
                    type="date"
                    {...form.register("departureDate")}
                  />
                  {form.formState.errors.departureDate && (
                    <p className="text-sm text-red-600">{form.formState.errors.departureDate.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label>Return Date (Optional)</Label>
                  <Input
                    type="date"
                    {...form.register("returnDate")}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Passengers</Label>
                  <Select
                    value={form.watch("passengers")?.toString()}
                    onValueChange={(value) => form.setValue("passengers", parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1,2,3,4,5,6,7,8,9].map(num => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'Passenger' : 'Passengers'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select
                    value={form.watch("flightClass")}
                    onValueChange={(value) => form.setValue("flightClass", value as any)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Economy</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="first">First Class</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSearching}
                  >
                    {isSearching ? "Searching..." : "Search Flights"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Flights</h2>
            
            <div className="space-y-4">
              {searchResults.map((flight: any, index: number) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{flight.departureTime}</p>
                          <p className="text-sm text-gray-500">{flight.origin}</p>
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            <div className="w-20 h-px bg-gray-300"></div>
                            <Plane className="h-4 w-4 text-blue-600" />
                            <div className="w-20 h-px bg-gray-300"></div>
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{flight.duration}</p>
                          <p className="text-xs text-gray-500">{flight.stops === 0 ? 'Direct' : `${flight.stops} stop(s)`}</p>
                        </div>
                        
                        <div className="text-center">
                          <p className="text-2xl font-bold text-gray-900">{flight.arrivalTime}</p>
                          <p className="text-sm text-gray-500">{flight.destination}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="mb-2">
                          <p className="text-sm text-gray-500">from</p>
                          <p className="text-2xl font-bold text-blue-600">£{flight.totalPrice}</p>
                          <p className="text-xs text-gray-500">inc. Cush fee</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Badge variant="secondary">{flight.airline}</Badge>
                          <Button 
                            onClick={() => handleBookFlight(flight)}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                            disabled={bookMutation.isPending}
                          >
                            {bookMutation.isPending ? "Booking..." : "Book Now"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* User Bookings */}
        {userBookings.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Bookings</h2>
            
            <div className="space-y-4">
              {userBookings.map((booking: any) => (
                <Card key={booking.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {booking.origin} → {booking.destination}
                        </h3>
                        <p className="text-gray-600">
                          Booking Reference: {booking.bookingReference}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {format(new Date(booking.departureDate), 'MMM dd, yyyy')}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {booking.passengers} passenger(s)
                          </span>
                          <span className="capitalize">{booking.flightClass}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant={
                            booking.status === 'confirmed' ? 'default' :
                            booking.status === 'pending' ? 'outline' : 'destructive'
                          }
                        >
                          {booking.status}
                        </Badge>
                        <p className="text-lg font-semibold text-gray-900 mt-1">
                          £{parseFloat(booking.totalPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}