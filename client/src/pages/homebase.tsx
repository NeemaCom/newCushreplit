import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MapPin, 
  Search, 
  Filter, 
  Heart,
  Star,
  Bed,
  Bath,
  Users,
  MessageCircle,
  Calendar,
  DollarSign,
  Home,
  Building,
  Crown,
  Shield,
  CheckCircle,
  Plus,
  Eye,
  Wifi,
  Car,
  PawPrint,
  Coffee,
  Dumbbell,
  Waves,
  Trees,
  Camera,
  ArrowRight,
  Clock
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function HomeBase() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("search");
  const [searchFilters, setSearchFilters] = useState({
    city: "",
    minRent: "",
    maxRent: "",
    bedrooms: "",
    propertyType: "",
  });

  // Mock data for demonstration
  const featuredListings = [
    {
      id: 1,
      title: "Modern 2BR Apartment in Central London",
      price: "£2,500",
      currency: "GBP",
      location: "Canary Wharf, London",
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      furnished: true,
      images: ["/api/placeholder/400/250"],
      amenities: ["Wifi", "Gym", "Concierge", "Balcony"],
      landlord: "Sarah Wilson",
      rating: 4.9,
      reviews: 23,
      tier: "premium",
      description: "Stunning modern apartment with river views, perfect for professionals."
    },
    {
      id: 2,
      title: "Cozy Studio in Tech District",
      price: "$1,800",
      currency: "USD",
      location: "Mission Bay, San Francisco",
      bedrooms: 0,
      bathrooms: 1,
      sqft: 500,
      furnished: true,
      images: ["/api/placeholder/400/250"],
      amenities: ["Wifi", "Gym", "Pool", "Rooftop"],
      landlord: "Marcus Chen",
      rating: 4.7,
      reviews: 15,
      tier: "featured",
      description: "Perfect for digital nomads with high-speed internet and modern amenities."
    },
    {
      id: 3,
      title: "Spacious 3BR House with Garden",
      price: "€1,900",
      currency: "EUR",
      location: "Kreuzberg, Berlin",
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      furnished: false,
      images: ["/api/placeholder/400/250"],
      amenities: ["Garden", "Parking", "Pet-friendly", "Wifi"],
      landlord: "Elena Mueller",
      rating: 4.8,
      reviews: 31,
      tier: "basic",
      description: "Family-friendly house in vibrant neighborhood with excellent transport links."
    }
  ];

  const recentMatches = [
    {
      id: 1,
      listing: featuredListings[0],
      compatibilityScore: 95,
      matchedCriteria: ["Budget", "Location", "Amenities", "Property Type"]
    },
    {
      id: 2,
      listing: featuredListings[1],
      compatibilityScore: 87,
      matchedCriteria: ["Budget", "Location", "Furnished"]
    }
  ];

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "premium":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Crown className="w-3 h-3 mr-1" />Premium</Badge>;
      case "featured":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300"><Star className="w-3 h-3 mr-1" />Featured</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-300">Basic</Badge>;
    }
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi": return <Wifi className="w-4 h-4" />;
      case "gym": return <Dumbbell className="w-4 h-4" />;
      case "pool": return <Waves className="w-4 h-4" />;
      case "parking": return <Car className="w-4 h-4" />;
      case "pet-friendly": return <PawPrint className="w-4 h-4" />;
      case "garden": return <Trees className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900">HomeBase</h1>
            <p className="text-lg text-gray-600">Housing & Roommate Matchmaking</p>
          </div>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Find your perfect home abroad with AI-powered matching and connect with verified landlords worldwide
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-blue-600">12,847</div>
            <div className="text-sm text-gray-600">Active Listings</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-green-600">98%</div>
            <div className="text-sm text-gray-600">Match Success</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-purple-600">25+</div>
            <div className="text-sm text-gray-600">Countries</div>
          </CardContent>
        </Card>
        <Card className="text-center p-4">
          <CardContent className="p-0">
            <div className="text-2xl font-bold text-orange-600">4.9★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </CardContent>
        </Card>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: "search", label: "Search Homes", icon: Search },
          { id: "matches", label: "My Matches", icon: Heart },
          { id: "messages", label: "Messages", icon: MessageCircle },
          { id: "profile", label: "My Profile", icon: Users }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-sm font-medium"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Tab */}
      {activeTab === "search" && (
        <div className="space-y-8">
          {/* Search Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="w-5 h-5" />
                <span>Find Your Perfect Home</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <Input 
                    placeholder="London, Berlin, NYC..." 
                    value={searchFilters.city}
                    onChange={(e) => setSearchFilters({...searchFilters, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Min Rent</label>
                  <Input 
                    placeholder="$1000" 
                    value={searchFilters.minRent}
                    onChange={(e) => setSearchFilters({...searchFilters, minRent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Rent</label>
                  <Input 
                    placeholder="$3000" 
                    value={searchFilters.maxRent}
                    onChange={(e) => setSearchFilters({...searchFilters, maxRent: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                  <select className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option>Any</option>
                    <option>Studio</option>
                    <option>1</option>
                    <option>2</option>
                    <option>3+</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Listings */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Featured Listings</h2>
              <Button variant="outline">View All</Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing) => (
                <Card key={listing.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="relative">
                    <img 
                      src={listing.images[0]} 
                      alt={listing.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      {getTierBadge(listing.tier)}
                    </div>
                    <div className="absolute top-3 right-3">
                      <Button size="sm" variant="ghost" className="bg-white/80 backdrop-blur-sm hover:bg-white">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/80 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {listing.price}/{listing.currency === "GBP" ? "month" : "mo"}
                    </div>
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{listing.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {listing.location}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Bed className="w-4 h-4 mr-1" />
                          {listing.bedrooms === 0 ? "Studio" : `${listing.bedrooms} bed`}
                        </div>
                        <div className="flex items-center">
                          <Bath className="w-4 h-4 mr-1" />
                          {listing.bathrooms} bath
                        </div>
                        <div className="flex items-center">
                          <Home className="w-4 h-4 mr-1" />
                          {listing.sqft} sqft
                        </div>
                      </div>
                      
                      <p className="text-gray-600 text-sm">{listing.description}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {listing.amenities.slice(0, 3).map((amenity, index) => (
                          <div key={index} className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full text-xs">
                            {getAmenityIcon(amenity)}
                            <span>{amenity}</span>
                          </div>
                        ))}
                        {listing.amenities.length > 3 && (
                          <div className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                            +{listing.amenities.length - 3} more
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{listing.landlord}</p>
                            <div className="flex items-center text-xs text-gray-600">
                              <Star className="w-3 h-3 mr-1 text-yellow-500 fill-current" />
                              {listing.rating} ({listing.reviews} reviews)
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            Contact
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Matches Tab */}
      {activeTab === "matches" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Your Matches</h2>
            <Badge className="bg-green-100 text-green-700">
              {recentMatches.length} new matches
            </Badge>
          </div>
          
          {recentMatches.map((match) => (
            <Card key={match.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start space-x-6">
                  <img 
                    src={match.listing.images[0]} 
                    alt={match.listing.title}
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{match.listing.title}</h3>
                        <div className="flex items-center text-gray-600 text-sm">
                          <MapPin className="w-4 h-4 mr-1" />
                          {match.listing.location}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">
                          {match.compatibilityScore}%
                        </div>
                        <div className="text-sm text-gray-600">Match</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{match.listing.price}/month</span>
                      <span>•</span>
                      <span>{match.listing.bedrooms === 0 ? "Studio" : `${match.listing.bedrooms} bed`}</span>
                      <span>•</span>
                      <span>{match.listing.bathrooms} bath</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {match.matchedCriteria.map((criteria, index) => (
                        <Badge key={index} className="bg-blue-100 text-blue-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {criteria}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex space-x-3">
                      <Button className="flex-1">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Start Conversation
                      </Button>
                      <Button variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Messages Tab */}
      {activeTab === "messages" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
          
          <Card>
            <CardContent className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
              <p className="text-gray-600 mb-4">
                Start conversations with landlords to find your perfect home
              </p>
              <Button 
                onClick={() => setActiveTab("search")}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Browse Listings
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900">Tenant Profile</h2>
          
          <Card>
            <CardHeader>
              <CardTitle>Housing Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Cities</label>
                  <Input placeholder="London, Berlin, San Francisco..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                  <div className="flex space-x-2">
                    <Input placeholder="Min" />
                    <Input placeholder="Max" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Move-in Date</label>
                  <Input type="date" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                  <select className="w-full p-2 border border-gray-200 rounded-md">
                    <option>Any</option>
                    <option>Apartment</option>
                    <option>House</option>
                    <option>Room in shared house</option>
                    <option>Co-living space</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">About Me</label>
                <Textarea 
                  placeholder="Tell landlords about yourself, your lifestyle, and what you're looking for..."
                  rows={4}
                />
              </div>
              
              <div className="flex space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Save Profile
                </Button>
                <Button variant="outline">
                  Enable Smart Matching
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">List Your Property</h3>
              <p className="text-sm text-gray-600 mb-3">
                Earn revenue by listing your property for expatriates
              </p>
              <Button variant="outline" size="sm">Create Listing</Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Verified Landlords</h3>
              <p className="text-sm text-gray-600 mb-3">
                All landlords are verified for your safety and security
              </p>
              <Button variant="outline" size="sm">Learn More</Button>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold mb-2">Premium Features</h3>
              <p className="text-sm text-gray-600 mb-3">
                Get priority matching and exclusive listings
              </p>
              <Button variant="outline" size="sm">Upgrade</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}