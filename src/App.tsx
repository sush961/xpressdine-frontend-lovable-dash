
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Guests from "./pages/Guests";
import Reservations from "./pages/Reservations";
import Tables from "./pages/Tables";
import Team from "./pages/Team";
import AppSettings from "./pages/AppSettings";
import UserSettings from "./pages/UserSettings";
import OrganizationSettings from "./pages/OrganizationSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guests" element={<Guests />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/tables" element={<Tables />} />
          <Route path="/team" element={<Team />} />
          <Route path="/app-settings" element={<AppSettings />} />
          <Route path="/user-settings" element={<UserSettings />} />
          <Route path="/organization-settings" element={<OrganizationSettings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
