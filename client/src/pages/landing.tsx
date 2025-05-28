import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Shield, 
  Globe, 
  Zap, 
  Users, 
  UserPlus, 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  Award,
  Clock,
  MessageCircle,
  ArrowRight,
  Play,
  Briefcase,
  GraduationCap,
  Heart,
  TrendingUp,
  DollarSign,
  Calendar,
  FileText,
  Smartphone
} from "lucide-react";
import EnhancedSignupModal from "@/components/enhanced-signup-modal";
import DemoWalkthrough from "@/components/demo-walkthrough";
import cushLogo from "@assets/Logo + Typeface_PNG (4).png";

export default function Landing() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [showDemoWalkthrough, setShowDemoWalkthrough] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [currentMentor, setCurrentMentor] = useState(0);

  const testimonials = [
    {
      name: "Sarah Johnson",
      location: "Lagos → London",
      image: "/api/placeholder/60/60",
      text: "Cush made my UK visa process incredibly smooth. The AI assistant guided me through every step, and I got my visa approved in just 3 weeks!",
      rating: 5,
      category: "Student Visa"
    },
    {
      name: "Michael Chen",
      location: "Beijing → Toronto",
      image: "/api/placeholder/60/60", 
      text: "The financial services are amazing. I transferred money to pay my tuition fees with the best rates I've ever seen. Highly recommended!",
      rating: 5,
      category: "Express Entry"
    },
    {
      name: "Priya Patel", 
      location: "Mumbai → Sydney",
      image: "/api/placeholder/60/60",
      text: "From visa application to settling down, Cush's comprehensive platform helped me every step of the way. The community support is incredible!",
      rating: 5,
      category: "Skilled Migration"
    }
  ];

  const services = [
    {
      title: "Multi-Currency Wallets",
      description: "Manage multiple currencies with real-time exchange rates and virtual cards",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: "International Transfers", 
      description: "Send money globally with the best rates and instant processing",
      icon: Globe,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Digital Banking",
      description: "Full banking services designed for location-independent professionals",
      icon: Smartphone,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Investment Solutions",
      description: "Global investment opportunities and portfolio management tools",
      icon: TrendingUp,
      color: "from-orange-500 to-orange-600"
    }
  ];

  const mentors = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "Immigration Lawyer & Financial Advisor",
      location: "Singapore → Toronto",
      image: "/api/placeholder/80/80",
      specialties: ["Canadian Immigration", "Investment Banking", "Tax Optimization"],
      experience: "12+ years",
      rating: 4.9,
      clients: 850,
      description: "Specialized in helping tech professionals navigate Canadian immigration while optimizing their financial portfolios."
    },
    {
      id: 2,
      name: "Marcus Thompson",
      role: "Digital Nomad Financial Consultant",
      location: "London → Global",
      image: "/api/placeholder/80/80",
      specialties: ["Remote Work Banking", "International Tax", "Crypto Assets"],
      experience: "8+ years",
      rating: 4.8,
      clients: 1200,
      description: "Helping digital nomads establish compliant financial structures across multiple jurisdictions."
    },
    {
      id: 3,
      name: "Priya Patel",
      role: "Expat Banking Specialist",
      location: "Mumbai → Dubai",
      image: "/api/placeholder/80/80",
      specialties: ["UAE Banking", "Investment Visas", "Wealth Management"],
      experience: "10+ years",
      rating: 4.9,
      clients: 950,
      description: "Expert in Gulf region financial services and investment visa programs for high-net-worth individuals."
    },
    {
      id: 4,
      name: "James Rodriguez",
      role: "Startup Founder & Mentor",
      location: "Mexico City → Austin",
      image: "/api/placeholder/80/80",
      specialties: ["Startup Banking", "US Investment", "Cross-border Payments"],
      experience: "15+ years",
      rating: 4.9,
      clients: 750,
      description: "Successfully raised $50M+ across borders and helps entrepreneurs navigate international financial complexity."
    },
    {
      id: 5,
      name: "Elena Kowalski",
      role: "European Financial Advisor",
      location: "Warsaw → Berlin",
      image: "/api/placeholder/80/80",
      specialties: ["EU Banking", "SEPA Transfers", "Digital Assets"],
      experience: "9+ years",
      rating: 4.8,
      clients: 680,
      description: "Specialized in European financial integration and helping professionals leverage EU banking systems."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  useEffect(() => {
    const mentorTimer = setInterval(() => {
      setCurrentMentor((prev) => (prev + 1) % mentors.length);
    }, 4000);
    return () => clearInterval(mentorTimer);
  }, [mentors.length]);

  return (
    <div className="min-h-screen bg-white">
      {/* Sophisticated Top Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white py-4 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-transparent to-purple-600/10"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="relative z-10 max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Live Support Available 24/7</span>
            </div>
            <div className="hidden md:block h-4 w-px bg-white/30"></div>
            <div className="hidden md:flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-sm">4.9/5 Customer Rating</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm md:text-base font-semibold">
              💳 New: Multi-Currency Virtual Cards - Apply in Minutes
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white border-white/30 hover:bg-white/10 bg-white/5 backdrop-blur-sm"
              onClick={() => setShowSignupModal(true)}
            >
              Get Started
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-First Header */}
      <header className="nav-mobile bg-white/95 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 shadow-sm safe-area-inset-top">
        <div className="responsive-container">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <img 
                src={cushLogo} 
                alt="Cush Logo" 
                className="h-8 w-auto object-contain sm:h-10 lg:h-12"
              />
              <div className="hidden sm:block">
                <p className="text-fluid-xs text-gray-600 font-medium">Financial solutions for expatriates</p>
              </div>
            </div>
            
            <nav className="hidden lg:flex items-center space-x-6">
            <a href="#services" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Services
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#about" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              About
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#success-stories" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Success Stories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
            <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group">
              Contact
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"></span>
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild className="touch-button hidden sm:flex text-fluid-sm">
              <a href="/auth">Sign In</a>
            </Button>
            <Button 
              asChild 
              className="touch-button bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 text-fluid-sm"
            >
              <a href="/auth">Start Your Journey</a>
            </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-First Hero Section */}
      <section className="space-responsive-lg bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden safe-area-inset-top">
        <div className="absolute inset-0">
          <div className="absolute top-10 left-4 w-32 h-32 sm:top-20 sm:left-10 sm:w-72 sm:h-72 bg-blue-200/30 rounded-full blur-2xl sm:blur-3xl"></div>
          <div className="absolute bottom-10 right-4 w-40 h-40 sm:bottom-20 sm:right-10 sm:w-96 sm:h-96 bg-purple-200/20 rounded-full blur-2xl sm:blur-3xl"></div>
        </div>
        
        <div className="responsive-container relative z-10">
          <div className="flex-mobile-stack text-center lg:text-left lg:items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-700 border-green-200 px-4 py-2 text-sm font-medium">
                  💰 Trusted by 50,000+ Digital Nomads & Expatriates
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Financial Solutions
                  </span>
                  <br />
                  <span className="text-gray-900">for Expatriates & Digital Nomads</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  Seamlessly manage your finances across borders with multi-currency wallets, 
                  virtual cards, and expert financial guidance designed for location-independent professionals.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 text-lg px-8 py-4"
                  onClick={() => setShowSignupModal(true)}
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-all duration-300 text-lg px-8 py-4"
                  onClick={() => setShowDemoWalkthrough(true)}
                >
                  <Play className="mr-2 w-5 h-5" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex items-center space-x-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Countries Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">24/7</div>
                  <div className="text-sm text-gray-600">Expert Support</div>
                </div>
              </div>
            </div>

            <div className="relative flex justify-center">
              <div className="relative">
                {/* Phone Frame */}
                <div className="relative w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
                  <div className="w-full h-full bg-black rounded-[2.5rem] relative overflow-hidden">
                    {/* Screen Content */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                      {/* Status Bar */}
                      <div className="flex justify-between items-center px-6 pt-4 pb-2 text-xs text-gray-900 font-medium">
                        <span>9:41</span>
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                          <div className="w-1 h-1 bg-gray-900 rounded-full"></div>
                        </div>
                      </div>
                      
                      {/* App Content */}
                      <div className="px-4 py-4 space-y-4">
                        <div className="text-center">
                          <img src={cushLogo} alt="Cush" className="h-8 mx-auto mb-2" />
                          <h3 className="text-lg font-bold text-gray-900">Multi-Currency Wallet</h3>
                        </div>
                        
                        {/* Balance Cards */}
                        <div className="space-y-3">
                          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm opacity-90">USD Balance</p>
                                <p className="text-2xl font-bold">$12,847.50</p>
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <DollarSign className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-4 text-white">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm opacity-90">EUR Balance</p>
                                <p className="text-2xl font-bold">€8,234.75</p>
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Globe className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 text-white">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm opacity-90">GBP Balance</p>
                                <p className="text-2xl font-bold">£6,891.25</p>
                              </div>
                              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <TrendingUp className="w-4 h-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Quick Actions */}
                        <div className="grid grid-cols-2 gap-3 mt-6">
                          <button className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                            <div className="w-8 h-8 bg-blue-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <Send className="w-4 h-4 text-blue-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-900">Send Money</p>
                          </button>
                          <button className="bg-white border border-gray-200 rounded-xl p-3 text-center shadow-sm">
                            <div className="w-8 h-8 bg-green-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                              <Smartphone className="w-4 h-4 text-green-600" />
                            </div>
                            <p className="text-xs font-medium text-gray-900">Virtual Card</p>
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Home Indicator */}
                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-bounce">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  <Zap className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-700 mb-4">Our Services</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Financial Solutions Tailored for Global Citizens
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive financial services designed specifically for expatriates and digital nomads 
              living and working across borders.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:scale-105">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${service.color} flex items-center justify-center shadow-lg`}>
                    <service.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Meet Our Mentors Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">Expert Guidance</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Mentors
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with experienced financial advisors and immigration experts who've successfully 
              navigated the global landscape and are ready to guide your journey.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden bg-white">
              <CardContent className="p-0">
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateX(-${currentMentor * 100}%)` }}
                  >
                    {mentors.map((mentor, index) => (
                      <div key={mentor.id} className="min-w-full p-12">
                        <div className="grid lg:grid-cols-2 gap-8 items-center">
                          <div className="text-center lg:text-left">
                            <div className="flex items-center justify-center lg:justify-start space-x-4 mb-6">
                              <img 
                                src={mentor.image} 
                                alt={mentor.name}
                                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow-lg"
                              />
                              <div>
                                <h3 className="text-2xl font-bold text-gray-900">{mentor.name}</h3>
                                <p className="text-blue-600 font-medium">{mentor.role}</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-600">{mentor.location}</span>
                                </div>
                              </div>
                            </div>
                            
                            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                              {mentor.description}
                            </p>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              {mentor.specialties.map((specialty, idx) => (
                                <Badge key={idx} className="bg-blue-100 text-blue-700 px-3 py-1">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                                <div className="text-2xl font-bold text-blue-600">{mentor.experience}</div>
                                <div className="text-sm text-gray-600">Experience</div>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                                <div className="flex items-center justify-center space-x-1">
                                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                  <span className="text-2xl font-bold text-green-600">{mentor.rating}</span>
                                </div>
                                <div className="text-sm text-gray-600">Rating</div>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                                <div className="text-2xl font-bold text-purple-600">{mentor.clients}+</div>
                                <div className="text-sm text-gray-600">Clients Helped</div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                onClick={() => setShowSignupModal(true)}
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Book Consultation
                              </Button>
                              <Button 
                                variant="outline"
                                className="flex-1 border-blue-200 hover:border-blue-600 hover:text-blue-600"
                              >
                                <Users className="w-4 h-4 mr-2" />
                                View Profile
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Navigation */}
                  <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                    <button
                      onClick={() => setCurrentMentor(currentMentor === 0 ? mentors.length - 1 : currentMentor - 1)}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
                    <button
                      onClick={() => setCurrentMentor((currentMentor + 1) % mentors.length)}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-all duration-300"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* Indicators */}
                <div className="flex justify-center space-x-2 py-6 bg-gray-50">
                  {mentors.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentMentor ? 'bg-blue-600 w-8' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentMentor(index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Stories Section */}
      <section id="success-stories" className="py-20 px-4 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-green-100 text-green-700 mb-4">Success Stories</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Real Stories from Real People
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of successful immigrants who trusted Cush with their journey
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <CardContent className="p-12">
                <div className="flex items-center justify-center mb-8">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-2xl text-center text-gray-800 mb-8 leading-relaxed">
                  "{testimonials[currentTestimonial].text}"
                </blockquote>
                
                <div className="flex items-center justify-center space-x-4">
                  <img 
                    src={testimonials[currentTestimonial].image} 
                    alt={testimonials[currentTestimonial].name}
                    className="w-16 h-16 rounded-full object-cover border-4 border-blue-100"
                  />
                  <div className="text-center">
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {testimonials[currentTestimonial].name}
                    </h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].location}</p>
                    <Badge className="bg-blue-100 text-blue-700 mt-2">
                      {testimonials[currentTestimonial].category}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex justify-center mt-8 space-x-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      className={`w-3 h-3 rounded-full transition-all duration-300 ${
                        index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                      onClick={() => setCurrentTestimonial(index)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge className="bg-purple-100 text-purple-700 mb-4">Get In Touch</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our immigration experts are here to help you every step of the way
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Phone className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone Support</h4>
                    <p className="text-gray-600">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Mail className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Support</h4>
                    <p className="text-gray-600">support@cush.global</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Global Offices</h4>
                    <p className="text-gray-600">London • Lagos • Toronto • Sydney</p>
                  </div>
                </div>
              </div>

              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Why Choose Cush?</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">98% visa approval success rate</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">24/7 expert support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">AI-powered application assistance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-gray-700">Secure financial services</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="shadow-xl border-0">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                      <Input className="border-gray-200 focus:ring-2 focus:ring-blue-500" placeholder="John" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                      <Input className="border-gray-200 focus:ring-2 focus:ring-blue-500" placeholder="Doe" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <Input type="email" className="border-gray-200 focus:ring-2 focus:ring-blue-500" placeholder="john@example.com" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country of Interest</label>
                    <select className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option>Select country...</option>
                      <option>🇺🇸 United States</option>
                      <option>🇨🇦 Canada</option>
                      <option>🇬🇧 United Kingdom</option>
                      <option>🇦🇺 Australia</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <Textarea className="border-gray-200 focus:ring-2 focus:ring-blue-500" rows={4} placeholder="Tell us about your immigration goals..." />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-lg font-medium"
                  >
                    Send Message
                    <Send className="ml-2 w-5 h-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">C</span>
                </div>
                <span className="font-bold text-2xl">Cush</span>
              </div>
              <p className="text-gray-400">
                Making global immigration simple, secure, and successful for everyone.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <div className="space-y-2 text-gray-400">
                <p>Visa Applications</p>
                <p>Immigration Consulting</p>
                <p>Document Services</p>
                <p>Financial Services</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-gray-400">
                <p>Help Center</p>
                <p>Contact Us</p>
                <p>Live Chat</p>
                <p>Community Forum</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <div className="space-y-2 text-gray-400">
                <p>About Us</p>
                <p>Careers</p>
                <p>Privacy Policy</p>
                <p>Terms of Service</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 pb-4 text-center text-gray-400">
            <p>&copy; 2024 Cush Global Immigration. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Signup Modal */}
      <EnhancedSignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)}
        onComplete={() => setShowSignupModal(false)}
      />

      {/* Demo Walkthrough */}
      <DemoWalkthrough 
        isOpen={showDemoWalkthrough} 
        onClose={() => setShowDemoWalkthrough(false)} 
      />
    </div>
  );
}