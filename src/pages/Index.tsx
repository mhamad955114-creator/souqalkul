import { useState } from "react";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ListingsSection from "@/components/ListingsSection";
import Footer from "@/components/Footer";

const Index = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleListingAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onListingAdded={handleListingAdded} />
      <main>
        <HeroSection />
        <CategoriesSection />
        <ListingsSection refreshTrigger={refreshTrigger} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
