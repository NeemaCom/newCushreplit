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

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
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
          <Route path="/financial-services" component={FinancialServices} />
          <Route path="/concierge" component={Concierge} />
          <Route path="/compliance" component={ComplianceDashboard} />
          <Route path="/security" component={SecurityDashboard} />
          <Route path="/admin" component={AdminDashboard} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
