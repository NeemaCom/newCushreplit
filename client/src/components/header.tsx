import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  User, 
  LogOut, 
  Shield,
  Settings,
  Wallet,
  Users,
  Sparkles,
  FileText,
  Plane,
  DollarSign,
  Bot,
  Crown,
  Building,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const navigationItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/wallet", label: "Wallet", icon: Wallet },
    { href: "/homebase", label: "HomeBase", icon: MapPin },
    { href: "/loans", label: "Loans", icon: DollarSign },
    { href: "/community", label: "Community", icon: Users },
    { href: "/documentation", label: "Documents", icon: FileText },
    { href: "/flights", label: "Flights", icon: Plane },
    { href: "/imisi", label: "Imisi AI", icon: Bot },
    { href: "/concierge", label: "Concierge", icon: Crown },
    { href: "/security", label: "Security", icon: Shield },
    { href: "/security-settings", label: "Security Settings", icon: Settings },
  ];

  // Add admin items for administrators
  if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
    navigationItems.push(
      { href: "/admin", label: "Admin", icon: Building },
      { href: "/loan-partners", label: "Loan Partners", icon: Building }
    );
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-2xl font-bold text-cush-gray-900 dark:text-white">
                Cush
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 ${
                      isActive 
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                        : "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.firstName || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.role || 'USER'}
                  </p>
                </div>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                localStorage.removeItem('hasCompletedOnboarding');
                window.location.reload();
              }}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100 mr-2"
              title="Start Tutorial"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Tutorial
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.location.href = '/api/logout'}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}