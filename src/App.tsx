import { useState, useCallback, lazy, Suspense, useEffect, Component, type ErrorInfo, type ReactNode } from "react";
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
import { CountryProvider } from "@/contexts/CountryContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import SplashScreen from "@/components/SplashScreen";
import PageSkeleton from "@/components/PageSkeleton";
import UpdateNotification from "@/components/UpdateNotification";
import InAppNotificationBanner from "@/components/InAppNotificationBanner";
import MaintenancePage from "@/components/MaintenancePage";
import LazyLoadBoundary from "@/components/LazyLoadBoundary";
import { useMaintenanceMode } from "@/hooks/useMaintenanceMode";
import { useCountryStatus } from "@/hooks/useCountryStatus";
import { useBackButton } from "@/hooks/useBackButton";
const Index = lazy(() => import("./pages/Index"));
const MyAccount = lazy(() => import("./pages/MyAccount"));
const ListingDetails = lazy(() => import("./pages/ListingDetails"));
const AllListings = lazy(() => import("./pages/AllListings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Favorites = lazy(() => import("./pages/Favorites"));
const Messages = lazy(() => import("./pages/Messages"));
const Settings = lazy(() => import("./pages/Settings"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const ContactUs = lazy(() => import("./pages/ContactUs"));
const Install = lazy(() => import("./pages/Install"));
const Auth = lazy(() => import("./pages/Auth"));
const DeleteData = lazy(() => import("./pages/DeleteData"));
const Developers = lazy(() => import("./pages/Developers"));
const BuildApkGuide = lazy(() => import("./pages/BuildApkGuide"));
const BadgeAuditLog = lazy(() => import("./pages/BadgeAuditLog"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

type RootBoundaryState = {
  hasError: boolean;
};

class RootErrorBoundary extends Component<{ children: ReactNode }, RootBoundaryState> {
  state: RootBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    console.error("Root render error:", error, info);
  }

  handleRetry = async () => {
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));
      }

      if ("caches" in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)));
      }
    } catch {
      // ignore cache cleanup failures
    }

    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center space-y-3 shadow-card">
            <h1 className="text-xl font-bold">تعذر تحميل الصفحة</h1>
            <p className="text-sm text-muted-foreground">تم اكتشاف خطأ أثناء تشغيل التطبيق. اضغط الزر لإعادة المحاولة.</p>
            <button
              onClick={this.handleRetry}
              className="w-full rounded-xl bg-primary text-primary-foreground py-2.5 font-semibold hover:opacity-90 transition-opacity"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);
  const { maintenance, loading } = useMaintenanceMode();
  const { status: countryStatus, loading: countryLoading, countryName } = useCountryStatus();

  useEffect(() => {
    import("@capacitor-community/safe-area")
      .then(() => {
        console.log("SafeArea initialized");
      })
      .catch(console.error);
  }, []);

  useBackButton();

  if (!loading && maintenance.enabled) {
    return <MaintenancePage message={maintenance.message} />;
  }

  if (!countryLoading && !countryStatus.enabled) {
    return (
      <MaintenancePage
        title={`الخدمة غير متوفرة في ${countryName}`}
        message={countryStatus.message || `عذراً، التطبيق غير متاح حالياً في ${countryName}. يرجى المحاولة لاحقاً أو اختيار دولة أخرى.`}
      />
    );
  }

  // Show skeleton instead of a blank screen while early checks resolve.
  // Splash sits on top so the user always sees motion.
  const earlyLoading = (loading || countryLoading) && showSplash;

  return (
    <>
      <UpdateNotification />
      <BrowserRouter>
        <InAppNotificationBanner />
        <LazyLoadBoundary>
          <Suspense fallback={<PageSkeleton />}>
            {earlyLoading ? <PageSkeleton /> : null}
            <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/my-account" element={<MyAccount />} />
            <Route path="/listing/:id" element={<ListingDetails />} />
            <Route path="/listings" element={<AllListings />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/admin/reports" element={<AdminReports />} />
            <Route path="/admin/badge-audit" element={<BadgeAuditLog />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/install" element={<Install />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/delete-data" element={<DeleteData />} />
            <Route path="/developers" element={<Developers />} />
            <Route path="/docs/build-apk" element={<BuildApkGuide />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </Suspense>
        </LazyLoadBoundary>
      </BrowserRouter>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
    </>
  );
};

const App = () => {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <LanguageProvider>
            <BrandProvider>
              <CountryProvider>
                <CurrencyProvider>
                  <AuthProvider>
                    <FavoritesProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <AppContent />
                      </TooltipProvider>
                    </FavoritesProvider>
                  </AuthProvider>
                </CurrencyProvider>
              </CountryProvider>
            </BrandProvider>
          </LanguageProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
};

export default App;
