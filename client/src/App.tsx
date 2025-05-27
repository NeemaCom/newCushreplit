import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/advanced-dashboard";
import Community from "@/pages/community";
import Documentation from "@/pages/documentation";
import Flights from "@/pages/flights";
import Mentors from "@/pages/mentors";
import Events from "@/pages/events";
import Insights from "@/pages/insights";
import Loans from "@/pages/loans";
import LoanPartners from "@/pages/loan-partners";
import AdminDashboard from "@/pages/admin-dashboard";
import Imisi from "@/pages/imisi";
import Wallet from "@/pages/wallet";
import FinancialServices from "@/pages/financial-services";
import Concierge from "@/pages/concierge";
import ComplianceDashboard from "@/pages/compliance-dashboard";
import SecurityDashboard from "@/pages/security-dashboard";
import SecuritySettings from "@/pages/security-settings";
import HomeBase from "@/pages/homebase";
import PWAInstallPrompt from "@/components/pwa-install-prompt";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="*">
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </Route>
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/admin">
            <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
              <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
                <p className="text-gray-600 mb-6">Please log in to access the admin dashboard</p>
                <a href="/api/login" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                  Login to Continue
                </a>
              </div>
            </div>
          </Route>
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/community" component={Community} />
          <Route path="/documentation" component={Documentation} />
          <Route path="/flights" component={Flights} />
          <Route path="/mentors" component={Mentors} />
          <Route path="/events" component={Events} />
          <Route path="/insights" component={Insights} />
          <Route path="/loans" component={Loans} />
          <Route path="/loan-partners" component={LoanPartners} />
          <Route path="/imisi" component={Imisi} />
          <Route path="/wallet" component={Wallet} />
          <Route path="/homebase" component={HomeBase} />
          <Route path="/financial-services" component={FinancialServices} />
          <Route path="/concierge" component={Concierge} />
          <Route path="/compliance" component={ComplianceDashboard} />
          <Route path="/security" component={SecurityDashboard} />
          <Route path="/security-settings" component={SecuritySettings} />
          <Route path="/admin" component={AdminDashboard} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <PWAInstallPrompt />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
