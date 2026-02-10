import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import MyAccount from "./pages/MyAccount";
import ListingDetails from "./pages/ListingDetails";
import AllListings from "./pages/AllListings";
import Pricing from "./pages/Pricing";
import MyOrders from "./pages/MyOrders";
import Favorites from "./pages/Favorites";
import Messages from "./pages/Messages";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AdminReports from "./pages/AdminReports";
import AboutUs from "./pages/AboutUs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ContactUs from "./pages/ContactUs";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <LanguageProvider>
      <AuthProvider>
        <FavoritesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/listing/:id" element={<ListingDetails />} />
                <Route path="/listings" element={<AllListings />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/admin/reports" element={<AdminReports />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/contact" element={<ContactUs />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </FavoritesProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
