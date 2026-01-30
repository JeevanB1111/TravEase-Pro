import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import RoleSelection from "@/pages/RoleSelection";
import TravelerDashboard from "@/pages/TravelerDashboard";
import AgencyDashboard from "@/pages/AgencyDashboard";
import About from "@/pages/About";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";

// Layout wrapper to handle conditional rendering of Nav/Footer
function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const isDashboard = location.includes("/dashboard");
  const isRoleSelection = location === "/role-selection";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-body">
      {!isDashboard && <Navigation />}
      <div className="flex-1">
        {children}
      </div>
      {!isDashboard && !isRoleSelection && <Footer />}
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/role-selection" component={RoleSelection} />
      <Route path="/about" component={About} />
      
      {/* Dashboards - Wrapped in simple divs to opt-out of main layout if needed, but here we just render them directly as they handle their own layouts */}
      <Route path="/traveler/dashboard" component={TravelerDashboard} />
      <Route path="/agency/dashboard" component={AgencyDashboard} />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
