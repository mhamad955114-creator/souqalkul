import { useState, useEffect } from "react";
import Header from "@/components/Header";
import MarqueeTicker from "@/components/MarqueeTicker";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import RestaurantsSection from "@/components/RestaurantsSection";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import PageSkeleton from "@/components/PageSkeleton";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { dir } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const handleListingAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 animate-fade-in" dir={dir}>
      <Header onListingAdded={handleListingAdded} />
      <MarqueeTicker />
      <main>
        <HeroSection />
        <CategoriesSection />
        <RestaurantsSection />
      </main>
      <Footer />
      <BottomNavigation onListingAdded={handleListingAdded} />
    </div>
  );
};

export default Index;
