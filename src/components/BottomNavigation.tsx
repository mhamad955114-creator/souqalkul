import { Home, ClipboardList, Plus, Heart, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useState } from "react";
import AuthModal from "./AuthModal";
import AddListingModal from "./AddListingModal";

interface BottomNavigationProps {
  onListingAdded?: () => void;
}

const BottomNavigation = ({ onListingAdded }: BottomNavigationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [addListingModalOpen, setAddListingModalOpen] = useState(false);

  const handleAddListing = () => {
    if (user) {
      setAddListingModalOpen(true);
    } else {
      setAuthModalOpen(true);
    }
  };

  const handleAccount = () => {
    if (user) {
      navigate("/my-account");
    } else {
      setAuthModalOpen(true);
    }
  };

  const navItems = [
    { icon: Home, label: t.nav.home, path: "/", onClick: () => navigate("/") },
    { icon: ClipboardList, label: "إعلاناتي", path: "/my-account", onClick: handleAccount },
    { icon: Plus, label: t.nav.addAd, path: null, onClick: handleAddListing, isSpecial: true },
    { icon: Heart, label: t.nav.favorites, path: "/favorites", onClick: () => navigate("/favorites") },
    { icon: User, label: t.nav.myAccount, path: "/my-account", onClick: handleAccount },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border md:hidden">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = item.path && location.pathname === item.path;
            const Icon = item.icon;

            if (item.isSpecial) {
              return (
                <button
                  key={item.label}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center -mt-6"
                >
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                    <Icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xs mt-1 text-muted-foreground">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center justify-center gap-1 py-2 px-3"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-xs transition-colors",
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />

      <AddListingModal
        isOpen={addListingModalOpen}
        onClose={() => setAddListingModalOpen(false)}
        onSuccess={() => onListingAdded?.()}
      />
    </>
  );
};

export default BottomNavigation;
