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
  FileText
} from "lucide-react";
import EnhancedSignupModal from "@/components/enhanced-signup-modal";

export default function Landing() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

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
      title: "Visa Application",
      description: "Expert guidance for all visa types with AI-powered assistance",
      icon: FileText,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Financial Services", 
      description: "Secure money transfers, multi-currency wallets, and payment solutions",
      icon: DollarSign,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Immigration Consulting",
      description: "Personalized advice from certified immigration experts",
      icon: Users,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Document Services",
      description: "Professional document preparation and verification",
      icon: Shield,
      color: "from-orange-500 to-orange-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

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
              🚀 New: AI-Powered Visa Assessment - Get Results in 60 Seconds
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-white border-white/30 hover:bg-white/10 bg-white/5 backdrop-blur-sm"
              onClick={() => setShowSignupModal(true)}
            >
              Try Free
            </Button>
          </div>
        </div>
      </div>

      {/* Premium Header */}
      <header className="px-4 lg:px-6 h-20 flex items-center bg-white/95 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl">
              <span className="text-white font-bold text-xl">C</span>
            </div>
            <div>
              <span className="font-bold text-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Cush
              </span>
              <p className="text-xs text-gray-500 -mt-1 font-medium">Global Immigration Platform</p>
            </div>
          </div>
          
          <nav className="hidden lg:flex items-center space-x-8">
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

          <div className="flex items-center space-x-3">
            <Button variant="ghost" asChild className="hidden md:flex font-medium">
              <a href="/api/login">Sign In</a>
            </Button>
            <Button 
              asChild 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 font-medium"
            >
              <a href="/api/login">Start Your Journey</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-200/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium">
                  ✨ Trusted by 50,000+ Global Immigrants
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Simplify Your
                  </span>
                  <br />
                  <span className="text-gray-900">Immigration Journey</span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                  From visa applications to settling in your new country, we provide comprehensive 
                  immigration services with AI-powered guidance and expert support.
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
                  onClick={() => setIsVideoPlaying(true)}
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

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Free Visa Assessment</h3>
                    <Badge className="bg-green-100 text-green-700">AI-Powered</Badge>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Destination Country</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Select destination...</option>
                        <option>🇺🇸 United States</option>
                        <option>🇨🇦 Canada</option>
                        <option>🇬🇧 United Kingdom</option>
                        <option>🇦🇺 Australia</option>
                        <option>🇩🇪 Germany</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
                      <select className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Select visa type...</option>
                        <option>Student Visa</option>
                        <option>Work Visa</option>
                        <option>Tourist Visa</option>
                        <option>Family Visa</option>
                      </select>
                    </div>
                    
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-lg font-medium"
                      onClick={() => setShowSignupModal(true)}
                    >
                      Get Free Assessment
                      <Zap className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    ⚡ Results in 60 seconds • No credit card required
                  </div>
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
              Everything You Need for Your Immigration Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive immigration services designed to make your journey smooth, 
              secure, and successful from start to finish.
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
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Cush Global Immigration. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Enhanced Signup Modal */}
      <EnhancedSignupModal 
        isOpen={showSignupModal} 
        onClose={() => setShowSignupModal(false)} 
      />
    </div>
  );
}