import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  Play, 
  Pause, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Globe,
  CreditCard,
  Users,
  MessageCircle,
  Calendar,
  Star,
  CheckCircle,
  Smartphone,
  TrendingUp,
  Shield,
  Zap,
  Crown,
  User,
  Settings,
  Send,
  Plus,
  MapPin,
  Clock,
  Award
} from "lucide-react";
import cushLogo from "@assets/Logo + Typeface_PNG (4).png";

interface DemoWalkthroughProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoWalkthrough({ isOpen, onClose }: DemoWalkthroughProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const demoSteps = [
    {
      title: "Welcome to Cush",
      subtitle: "Your Global Financial Journey Starts Here",
      description: "See how Cush revolutionizes financial services for expatriates and digital nomads worldwide",
      screen: "welcome"
    },
    {
      title: "Quick Account Setup",
      subtitle: "Get Started in Under 2 Minutes",
      description: "Create your account with our streamlined onboarding process designed for global citizens",
      screen: "signup"
    },
    {
      title: "Multi-Currency Dashboard",
      subtitle: "Manage All Your Global Finances",
      description: "View balances across multiple currencies, track transactions, and monitor your financial health",
      screen: "dashboard"
    },
    {
      title: "Meet Imisi - Your AI Assistant",
      subtitle: "24/7 Financial & Immigration Guidance",
      description: "Get instant answers about banking, investments, visa requirements, and discover premium services",
      screen: "imisi"
    },
    {
      title: "Virtual Cards & Payments",
      subtitle: "Spend Globally Without Limits",
      description: "Instant virtual cards for any currency, with real-time spending controls and fraud protection",
      screen: "virtualcard"
    },
    {
      title: "Expert Community",
      subtitle: "Connect with Financial Mentors",
      description: "Book consultations with verified experts and join exclusive events for expatriates",
      screen: "community"
    },
    {
      title: "Concierge Service",
      subtitle: "Premium Immigration Support",
      description: "Dedicated migration assistance with personalized guidance at $20/month",
      screen: "concierge"
    }
  ];

  useEffect(() => {
    if (!isPlaying || !isOpen) return;
    
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % demoSteps.length);
    }, 4000);
    
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, demoSteps.length]);

  const renderScreen = () => {
    const step = demoSteps[currentStep];
    
    switch (step.screen) {
      case "welcome":
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 text-center">
            <img src={cushLogo} alt="Cush" className="h-16 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Financial Solutions for Global Citizens</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Join 50,000+ expatriates and digital nomads managing their finances across borders
            </p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">15+ Countries</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Bank-Level Security</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-sm font-medium">4.9/5 Rating</p>
              </div>
            </div>
          </div>
        );

      case "signup":
        return (
          <div className="bg-white p-8">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Create Your Account</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value="Sarah Johnson"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    value="sarah.johnson@email.com"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Country</label>
                  <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>🇬🇧 United Kingdom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Use Case</label>
                  <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                    <option>💼 Digital Nomad - Remote Work</option>
                  </select>
                </div>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3">
                  Create Account
                  <CheckCircle className="ml-2 w-5 h-5" />
                </Button>
              </div>
              <p className="text-center text-sm text-gray-500 mt-4">
                ✅ Account verified instantly • No paperwork required
              </p>
            </div>
          </div>
        );

      case "dashboard":
        return (
          <div className="bg-gray-50 responsive-container space-responsive-sm">
            <div className="flex-mobile-stack gap-4">
              <div className="space-y-1">
                <h2 className="text-fluid-xl font-bold text-gray-900">Welcome back, Sarah!</h2>
                <p className="text-fluid-sm text-gray-600">Here's your financial overview</p>
              </div>
              <div className="touch-target bg-blue-600 rounded-full flex items-center justify-center self-start lg:self-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="grid-responsive grid-responsive-3 gap-4 space-responsive-sm">
              <Card className="card-responsive bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fluid-xs opacity-90">USD Balance</p>
                      <p className="text-fluid-xl font-bold">$12,847</p>
                    </div>
                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-responsive bg-gradient-to-r from-green-500 to-green-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fluid-xs opacity-90">EUR Balance</p>
                      <p className="text-fluid-xl font-bold">€8,234</p>
                    </div>
                    <Globe className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-responsive bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-fluid-xs opacity-90">GBP Balance</p>
                      <p className="text-fluid-xl font-bold">£6,891</p>
                    </div>
                    <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid-responsive grid-responsive-2 gap-4">
              <Card className="card-responsive">
                <CardContent className="p-4">
                  <h3 className="text-fluid-base font-semibold mb-3">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button className="w-full justify-start touch-target" variant="ghost">
                      <Send className="w-4 h-4 mr-2" />
                      <span className="text-fluid-sm">Send Money</span>
                    </Button>
                    <Button className="w-full justify-start touch-target" variant="ghost">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <span className="text-fluid-sm">Virtual Card</span>
                    </Button>
                    <Button className="w-full justify-start touch-target" variant="ghost">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      <span className="text-fluid-sm">Ask Imisi</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-responsive">
                <CardContent className="p-4">
                  <h3 className="text-fluid-base font-semibold mb-3">Recent Transactions</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-fluid-xs">
                      <span>Freelance Payment</span>
                      <span className="text-green-600">+$2,500</span>
                    </div>
                    <div className="flex justify-between text-fluid-xs">
                      <span>London Rent</span>
                      <span className="text-red-600">-£1,200</span>
                    </div>
                    <div className="flex justify-between text-fluid-xs">
                      <span>Coffee Shop</span>
                      <span className="text-red-600">-€4.50</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "imisi":
        return (
          <div className="bg-white p-6">
            <div className="max-w-lg mx-auto">
              <div className="flex items-center justify-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Meet Imisi</h2>
              <p className="text-center text-gray-600 mb-6">Your AI Financial & Immigration Assistant</p>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">Hello Sarah! I can help you with banking, investments, visa applications, and more. What would you like to know?</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-blue-600 text-white rounded-lg p-3 max-w-xs">
                    <p className="text-sm">I need help with UK visa renewal and want to optimize my multi-currency spending</p>
                  </div>
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                    <p className="text-sm">I can help with both! For visa renewal, I'll guide you through the process. For premium support, consider our Concierge Service.</p>
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <div className="flex items-center space-x-2">
                        <Crown className="w-4 h-4 text-yellow-600" />
                        <span className="text-xs font-medium text-yellow-800">Concierge Service Available</span>
                      </div>
                      <p className="text-xs text-yellow-700 mt-1">$20/month - Dedicated migration assistant</p>
                      <Button size="sm" className="mt-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs">
                        Learn More
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <input 
                  type="text" 
                  placeholder="Ask Imisi anything..."
                  className="flex-1 p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case "virtualcard":
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div className="max-w-md mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6">Virtual Cards</h2>
              
              <div className="relative mb-6">
                <div className="w-full h-48 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-800 rounded-2xl p-6 text-white shadow-2xl transform rotate-2">
                  <div className="flex justify-between items-start mb-8">
                    <img src={cushLogo} alt="Cush" className="h-8 brightness-0 invert" />
                    <div className="text-right">
                      <p className="text-xs opacity-75">VIRTUAL</p>
                      <div className="w-8 h-6 bg-white/20 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <p className="text-2xl font-bold tracking-wider">•••• •••• •••• 4829</p>
                    <div className="flex justify-between">
                      <div>
                        <p className="text-xs opacity-75">CARDHOLDER</p>
                        <p className="font-medium">SARAH JOHNSON</p>
                      </div>
                      <div>
                        <p className="text-xs opacity-75">EXPIRES</p>
                        <p className="font-medium">12/27</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">Available Balance</h3>
                        <p className="text-2xl font-bold text-blue-600">$5,250.00</p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>
                
                <div className="grid grid-cols-2 gap-3">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-4 h-4 mr-2" />
                    New Card
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </Button>
                </div>
                
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <h4 className="font-semibold text-sm">Recent Transactions</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Amazon.com</span>
                      <span>-$89.99</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uber Ride</span>
                      <span>-$24.50</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Spotify</span>
                      <span>-$9.99</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case "community":
        return (
          <div className="bg-white p-6">
            <h2 className="text-2xl font-bold text-center mb-6">Expert Community</h2>
            
            <div className="space-y-4 mb-6">
              <Card className="border-2 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="/api/placeholder/60/60" 
                      alt="Dr. Sarah Chen"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">Dr. Sarah Chen</h3>
                      <p className="text-sm text-gray-600">Immigration Lawyer & Financial Advisor</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">4.9 • 850+ clients</span>
                      </div>
                    </div>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src="/api/placeholder/60/60" 
                      alt="Marcus Thompson"
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">Marcus Thompson</h3>
                      <p className="text-sm text-gray-600">Digital Nomad Financial Consultant</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm">4.8 • 1200+ clients</span>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Book Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="border-t pt-6">
              <h3 className="font-semibold mb-4">Upcoming Events</h3>
              <div className="space-y-3">
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">UK Investment Visa Webinar</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Tomorrow 3:00 PM
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            45 attending
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-700">Free</Badge>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">Digital Nomad Tax Strategy</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            Friday 2:00 PM
                          </span>
                          <span className="flex items-center">
                            <Users className="w-3 h-3 mr-1" />
                            28 attending
                          </span>
                        </div>
                      </div>
                      <Badge className="bg-purple-100 text-purple-700">$25</Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );

      case "concierge":
        return (
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
            <div className="max-w-md mx-auto text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Crown className="w-10 h-10 text-white" />
              </div>
              
              <h2 className="text-2xl font-bold mb-2">Concierge Service</h2>
              <p className="text-gray-600 mb-6">Premium Immigration Support</p>
              
              <Card className="border-2 border-yellow-300 mb-6">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-yellow-600">$20</div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                  
                  <div className="space-y-3 text-left">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Dedicated migration assistant</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Priority support via phone & chat</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Document review & preparation</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Application tracking & updates</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm">Expert consultation calls</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold py-3">
                Subscribe to Concierge
                <Crown className="w-5 h-5 ml-2" />
              </Button>
              
              <p className="text-xs text-gray-500 mt-4">
                Cancel anytime • 7-day free trial • No setup fees
              </p>
              
              <div className="mt-6 p-4 bg-white rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Recent Success</h4>
                <div className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-yellow-500" />
                  <span className="text-sm">98% visa approval rate with Concierge Service</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <div>Loading...</div>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[60vh] max-h-[450px] overflow-hidden gpu-accelerated">
        {/* Mobile-First Header */}
        <div className="nav-mobile border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="responsive-container">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-4">
                <img src={cushLogo} alt="Cush" className="h-6 sm:h-8 brightness-0 invert" />
                <div>
                  <h2 className="text-fluid-lg font-bold">Cush Platform Demo</h2>
                  <p className="text-fluid-xs opacity-90 hidden sm:block">Interactive Walkthrough</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="text-white hover:bg-white/10 touch-target"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:bg-white/10 touch-target"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Compact Content Layout */}
        <div className="flex flex-col lg:flex-row h-[calc(100%-3rem)]">
          {/* Demo Screen */}
          <div className="flex-1 order-2 lg:order-1">
            <div className="h-[250px] lg:h-full overflow-auto smooth-scroll">
              {renderScreen()}
            </div>
          </div>

          {/* Compact Sidebar */}
          <div className="w-full lg:w-64 bg-gray-50 border-t lg:border-t-0 lg:border-l order-1 lg:order-2 p-3">
            <div className="mb-3">
              <h3 className="text-sm font-bold mb-1">{demoSteps[currentStep].title}</h3>
              <p className="text-xs text-blue-600 font-medium mb-1">{demoSteps[currentStep].subtitle}</p>
              <p className="text-xs text-gray-600 leading-tight">{demoSteps[currentStep].description}</p>
            </div>

            {/* Compact Progress */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Progress</span>
                <span>{currentStep + 1}/{demoSteps.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-1.5 rounded-full transition-all duration-300 gpu-accelerated"
                  style={{ width: `${((currentStep + 1) / demoSteps.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Compact Navigation */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex-1 text-xs"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Prev
              </Button>
              <Button
                size="sm"
                onClick={() => setCurrentStep(Math.min(demoSteps.length - 1, currentStep + 1))}
                disabled={currentStep === demoSteps.length - 1}
                className="flex-1 text-xs"
              >
                Next
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>

            {/* Mobile-First Step List */}
            <div className="space-y-2 hidden lg:block">
              {demoSteps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 touch-target ${
                    index === currentStep
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-800'
                      : index < currentStep
                      ? 'bg-green-50 border border-green-200 text-green-800'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-fluid-xs font-bold ${
                      index === currentStep
                        ? 'bg-blue-600 text-white'
                        : index < currentStep
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}>
                      {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{step.title}</p>
                      <p className="text-xs opacity-75">{step.subtitle}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}