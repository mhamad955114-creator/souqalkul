import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ListingsSection from "@/components/ListingsSection";
import DatingSection from "@/components/DatingSection";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import { useLanguage } from "@/contexts/LanguageContext";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { dir } = useLanguage();

  const handleListingAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0" dir={dir}>
      <Header onListingAdded={handleListingAdded} />
      <main>
        <HeroSection />
        <CategoriesSection />
        <ListingsSection refreshTrigger={refreshTrigger} />
        <DatingSection />
      </main>
      <Footer />
      <BottomNavigation onListingAdded={handleListingAdded} />
    </div>
  );
};

export default Index;
