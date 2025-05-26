import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Bell, Menu, ChevronDown } from "lucide-react";

export default function Header() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <header className="bg-white border-b border-cush-gray-200 sticky top-0 z-50 shadow-modern">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-modern">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <h1 className="text-3xl font-bold text-cush-primary">Cush</h1>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden lg:block ml-12">
              <div className="flex items-center space-x-2">
                <a href="/" className="text-cush-primary bg-cush-primary-50 font-semibold px-4 py-3 text-sm rounded-xl shadow-modern transition-all duration-200">
                  Dashboard
                </a>
                <a href="/community" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Community
                </a>
                <a href="/documentation" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Documentation
                </a>
                <a href="/flights" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Flights
                </a>
                <a href="/mentors" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Mentors
                </a>
                <a href="/events" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Events
                </a>
                <a href="/insights" className="text-cush-gray-700 hover:text-cush-primary hover:bg-cush-gray-25 px-4 py-3 text-sm rounded-xl transition-all duration-200">
                  Insights
                </a>
              </div>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative p-3 hover:bg-cush-gray-25 rounded-xl transition-all duration-200">
                <Bell className="h-5 w-5 text-cush-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                  3
                </span>
              </Button>

              {/* User Profile Section */}
              <div className="flex items-center space-x-3 bg-cush-gray-25 rounded-2xl px-4 py-2">
                <Avatar className="h-10 w-10 shadow-modern">
                  <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                  <AvatarFallback className="bg-gradient-primary text-white font-bold">
                    {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <div className="text-sm font-semibold text-cush-gray-900">
                    {user?.firstName || user?.lastName ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() : 'User'}
                  </div>
                  <div className="text-xs text-cush-gray-600">Account Holder</div>
                </div>
                
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="p-1 hover:bg-cush-gray-50 rounded-lg">
                      <ChevronDown className="h-4 w-4 text-cush-gray-500" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 shadow-modern-lg border-cush-gray-200">
                    <DropdownMenuItem className="hover:bg-cush-gray-25">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Profile Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-cush-gray-25">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Security
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-cush-gray-25">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Help & Support
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 text-red-600">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5 text-gray-500" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white">
              <a href="/" className="block px-3 py-2 text-blue-600 font-medium">
                Dashboard
              </a>
              <a href="/community" className="block px-3 py-2 text-gray-500">
                Community
              </a>
              <a href="/documentation" className="block px-3 py-2 text-gray-500">
                Documentation
              </a>
              <a href="/flights" className="block px-3 py-2 text-gray-500">
                Flights
              </a>
              <a href="#support" className="block px-3 py-2 text-gray-500">
                Support
              </a>
              <div className="border-t border-gray-200 pt-2">
                <button 
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-gray-500"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
