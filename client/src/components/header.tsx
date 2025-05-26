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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">Cush</h1>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-8">
                <a href="#dashboard" className="text-blue-600 font-medium px-3 py-2 text-sm">
                  Dashboard
                </a>
                <a href="#transfers" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm">
                  Transfers
                </a>
                <a href="#wallet" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm">
                  Wallet
                </a>
                <a href="#services" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm">
                  Services
                </a>
                <a href="#support" className="text-gray-500 hover:text-blue-600 px-3 py-2 text-sm">
                  Support
                </a>
              </div>
            </div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5 text-gray-500" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.profileImageUrl} alt="Profile" />
                      <AvatarFallback>
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-gray-700">
                      {user?.firstName} {user?.lastName}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuItem>Security</DropdownMenuItem>
                  <DropdownMenuItem>Help & Support</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
              <a href="#dashboard" className="block px-3 py-2 text-blue-600 font-medium">
                Dashboard
              </a>
              <a href="#transfers" className="block px-3 py-2 text-gray-500">
                Transfers
              </a>
              <a href="#wallet" className="block px-3 py-2 text-gray-500">
                Wallet
              </a>
              <a href="#services" className="block px-3 py-2 text-gray-500">
                Services
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
