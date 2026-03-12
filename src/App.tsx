import { useState, useCallback, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { BrandProvider } from "@/contexts/BrandContext";
import SplashScreen from "@/components/SplashScreen";
import UpdateNotification from "@/components/UpdateNotification";
import InAppNotificationBanner from "@/components/InAppNotificationBanner";
import MaintenancePage from "@/components/MaintenancePage";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
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
const AdminReports = lazy(() => import("./pages/AdminReports"));
import AboutUs from "./pages/AboutUs";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import ContactUs from "./pages/ContactUs";
import Install from "./pages/Install";
import Wallet from "./pages/Wallet";
import Auth from "./pages/Auth";
import MySubscriptions from "./pages/MySubscriptions";

const queryClient = new QueryClient();

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  const { maintenance, loading } = useMaintenanceMode();

  if (!loading && maintenance.enabled) {
    return <MaintenancePage message={maintenance.message} />;
  }

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      {!showSplash && (
        <>
          <UpdateNotification />
          <BrowserRouter>
            <InAppNotificationBanner />
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
              <Route path="/admin/reports" element={<Suspense fallback={null}><AdminReports /></Suspense>} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/contact" element={<ContactUs />} />
              <Route path="/install" element={<Install />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/my-subscriptions" element={<MySubscriptions />} />
              <Route path="/auth" element={<Auth />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </>
      )}
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <BrandProvider>
            <AuthProvider>
              <FavoritesProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
              </FavoritesProvider>
            </AuthProvider>
          </BrandProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
