import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download, Smartphone, Zap, Shield } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if this is the first visit
    const hasVisitedBefore = localStorage.getItem('hasVisitedCush');
    
    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    if (!hasVisitedBefore) {
      // Show prompt on first visit after a short delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
        // Log analytics event
        console.log('PWA Install Prompt: First visit detected, showing install prompt');
      }, 2000);

      return () => clearTimeout(timer);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      console.log('PWA Install Prompt: beforeinstallprompt event captured');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    console.log('PWA Install Prompt: Install button clicked');
    
    if (deferredPrompt) {
      // Show native install prompt
      deferredPrompt.prompt();
      
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`PWA Install Prompt: User choice - ${outcome}`);
      
      if (outcome === 'accepted') {
        console.log('PWA Install Prompt: User accepted the install prompt');
      } else {
        console.log('PWA Install Prompt: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
    } else if (isIOS) {
      // Show iOS-specific instructions
      alert('To install this app on your iOS device, tap the Share button and then "Add to Home Screen"');
    } else {
      // Fallback for browsers that don't support PWA installation
      console.log('PWA Install Prompt: Browser does not support PWA installation');
    }
    
    handleDismiss();
  };

  const handleDismiss = () => {
    console.log('PWA Install Prompt: Prompt dismissed');
    setShowPrompt(false);
    localStorage.setItem('hasVisitedCush', 'true');
    localStorage.setItem('pwaPromptDismissedAt', new Date().toISOString());
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto animate-in fade-in-0 zoom-in-95 duration-300">
        <CardContent className="p-6 relative">
          {/* Dismiss Button */}
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={handleDismiss}
            aria-label="Close install prompt"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* App Icon */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Get the Cush App Experience
            </h2>
            <p className="text-gray-600 text-sm">
              Add Cush to your home screen for instant access, faster loading, and a native app feel!
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700">Lightning-fast access from your home screen</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Download className="w-4 h-4 text-blue-600" />
              </div>
              <span className="text-sm text-gray-700">Works offline with cached content</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <Shield className="w-4 h-4 text-purple-600" />
              </div>
              <span className="text-sm text-gray-700">Secure and always up-to-date</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              onClick={handleInstallClick}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isIOS ? 'Get Instructions' : 'Install Cush'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="px-6"
            >
              Maybe Later
            </Button>
          </div>

          {/* iOS-specific hint */}
          {isIOS && (
            <p className="text-xs text-gray-500 text-center mt-3">
              Tap Share → Add to Home Screen
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}