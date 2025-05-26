import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, Users, BookOpen, Star, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import Header from "@/components/header";

export default function Community() {
  const { data: communityData, isLoading } = useQuery({
    queryKey: ["/api/community"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { mentors = [], events = [], insights = [] } = communityData || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Community Hub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with immigration experts, join events, and access curated insights to enhance your journey
          </p>
        </div>

        {/* Mentors Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 text-blue-600" />
              Expert Mentors
            </h2>
            <Button variant="outline">View All Mentors</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.slice(0, 3).map((mentor: any) => (
              <Card key={mentor.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={mentor.profileImage} alt={mentor.name} />
                      <AvatarFallback>{mentor.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
                      <p className="text-blue-600 font-medium">{mentor.expertise}</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-sm text-gray-600 ml-1">{mentor.rating}</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{mentor.bio}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      <Clock className="inline h-4 w-4 mr-1" />
                      £{mentor.hourlyRate}/hour
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Book Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Events Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Calendar className="mr-3 text-emerald-600" />
              Upcoming Events
            </h2>
            <Button variant="outline">View All Events</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.slice(0, 4).map((event: any) => (
              <Card key={event.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{event.title}</h3>
                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {format(new Date(event.eventDate), 'MMM dd, yyyy • h:mm a')}
                      </div>
                      <div className="flex items-center text-gray-500 text-sm mb-3">
                        <MapPin className="h-4 w-4 mr-2" />
                        {event.isVirtual ? 'Virtual Event' : event.location}
                      </div>
                    </div>
                    <Badge variant={event.isVirtual ? "default" : "secondary"}>
                      {event.isVirtual ? 'Virtual' : 'In-Person'}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4 text-sm">{event.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {event.currentAttendees}/{event.maxAttendees} attending
                    </span>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      Register
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Insights Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <BookOpen className="mr-3 text-purple-600" />
              Latest Insights
            </h2>
            <Button variant="outline">View All Articles</Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {insights.slice(0, 3).map((insight: any) => (
              <Card key={insight.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative overflow-hidden">
                  {insight.featuredImage ? (
                    <img 
                      src={insight.featuredImage} 
                      alt={insight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                      <BookOpen className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white text-gray-900">
                      {insight.category}
                    </Badge>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{insight.title}</h3>
                  <p className="text-gray-600 mb-4 text-sm">{insight.excerpt}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {insight.author}</span>
                    <span>{insight.readTime} min read</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}