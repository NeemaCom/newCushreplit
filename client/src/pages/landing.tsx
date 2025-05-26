import { useState } from "react";
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
  MessageCircle
} from "lucide-react";
import EnhancedSignupModal from "@/components/enhanced-signup-modal";

export default function Landing() {
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [currentMentor, setCurrentMentor] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const handleSignup = () => {
    setShowSignupModal(true);
  };

  const handleSignupComplete = () => {
    // Redirect to dashboard after successful signup
    window.location.href = '/';
  };

  // Sample mentors data
  const mentors = [
    {
      name: "Sarah Johnson",
      expertise: "UK Immigration Law",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      clients: 200,
      description: "Specialist in UK visa applications and settlement routes"
    },
    {
      name: "Michael Adebayo",
      expertise: "Nigerian Financial Services",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      rating: 4.8,
      clients: 150,
      description: "Expert in cross-border financial planning and investments"
    },
    {
      name: "Emma Thompson",
      expertise: "Business Immigration",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      rating: 4.9,
      clients: 180,
      description: "Helping entrepreneurs establish businesses internationally"
    }
  ];

  // Sample testimonials data
  const testimonials = [
    {
      name: "David Okafor",
      location: "Lagos to London",
      rating: 5,
      text: "Cush made my visa application process so smooth. The financial support and guidance were exceptional.",
      image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Jennifer Smith",
      location: "Manchester to Abuja",
      rating: 5,
      text: "Excellent service for international transfers. Fast, secure, and reliable every time.",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face"
    },
    {
      name: "Ahmed Hassan",
      location: "Birmingham to Port Harcourt",
      rating: 5,
      text: "The loan service helped me start my business. Professional team with great support.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Cush</h1>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={handleLogin} className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
              <Button onClick={handleSignup} className="bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-4 h-4 mr-2" />
                Get Started
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Gateway to
            <span className="text-blue-600 block">Global Immigration</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Navigate your immigration journey with confidence. From mentorship and advisory services 
            to secure money transfers and financial planning, Cush is your trusted partner.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleLogin} 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-lg px-8 py-3"
            >
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-3">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need for your immigration journey
            </h2>
            <p className="text-xl text-gray-600">
              Secure, reliable, and built for your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="bg-blue-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Shield className="text-blue-600" size={24} />
                </div>
                <CardTitle>Secure Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Safe and secure money transfers from Nigeria to UK with competitive exchange rates.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="bg-emerald-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="text-emerald-600" size={24} />
                </div>
                <CardTitle>Immigration Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Expert guidance for student visas, work permits, and family reunification.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="bg-purple-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Zap className="text-purple-600" size={24} />
                </div>
                <CardTitle>AI Assistant</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get instant answers to your immigration questions with Imisi 2.0 AI assistant.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <div className="bg-orange-100 p-3 rounded-lg w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                  <Users className="text-orange-600" size={24} />
                </div>
                <CardTitle>Expert Support</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Access to immigration experts and mentors who understand your journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to start your journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of successful immigrants who trust Cush with their journey.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            variant="secondary" 
            className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
          >
            Sign Up Today
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Cush</h3>
            <p className="text-gray-400 mb-6">
              Empowering global immigration through secure financial services and expert guidance.
            </p>
            <div className="flex justify-center space-x-6">
              <a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white">Contact</a>
            </div>
          </div>
        </div>
      </footer>
      {/* Enhanced Signup Modal */}
      <EnhancedSignupModal 
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onComplete={handleSignupComplete}
      />
    </div>
  );
}
