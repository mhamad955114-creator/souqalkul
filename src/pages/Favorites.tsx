import { useGridLayout, GridLayoutToggle } from "@/hooks/useGridLayout";
import { useEffect, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import ListingCard from "@/components/ListingCard";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { formatPrice, getCountryByName } from "@/lib/constants";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  images: string[] | null;
  created_at: string;
  is_featured: boolean | null;
  status: string | null;
  category: string;
  country?: string | null;
  currency?: string | null;
  badge_type?: string | null;
  custom_plan_key?: string | null;
}

const Favorites = () => {
  const { gridClass } = useGridLayout();
  const { user, loading: authLoading } = useAuth();
  const { favorites, loading: favoritesLoading } = useFavoritesContext();
  const { t, dir } = useLanguage();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavoriteListings = async () => {
      if (!user || favorites.length === 0) {
        setListings([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id, title, description, price, city, images, created_at, is_featured, status, category, country, currency, badge_type, custom_plan_key")
          .in("id", favorites);

        if (error) throw error;

        setListings(data || []);
      } catch (error) {
        console.error("Error fetching favorite listings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (!favoritesLoading) {
      fetchFavoriteListings();
    }
  }, [user, favorites, favoritesLoading]);

  const formatTimeAgo = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: ar,
    });
  };

  const isLoading = authLoading || favoritesLoading || loading;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="pt-20 pb-24 md:pb-8">
        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t.favoritesPage.title}</h1>
              <p className="text-muted-foreground">
                {t.favoritesPage.savedAds} ({listings.length})
              </p>
            </div>
          </div>

          {/* Content */}
          {!user ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t.favoritesPage.pleaseSignIn}
              </h2>
              <p className="text-muted-foreground">
                {t.favoritesPage.mustSignIn}
              </p>
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t.favoritesPage.noFavorites}
              </h2>
              <p className="text-muted-foreground">
                {t.favoritesPage.startAdding}
              </p>
            </div>
          ) : (
            <>
            <div className="flex justify-end mb-3"><GridLayoutToggle /></div>
            <div className={gridClass}>
              {listings.map((listing) => (
                <ListingCard
                  key={listing.id}
                  id={listing.id}
                  image={listing.images?.[0] || "/placeholder.svg"}
                  title={listing.title}
                  price={formatPrice(listing.price, listing.country ? getCountryByName(listing.country).currencySymbol : undefined)}
                  priceValue={listing.price}
                  currency={listing.currency}
                  location={listing.city}
                  country={listing.country || undefined}
                  time={formatTimeAgo(listing.created_at)}
                  featured={listing.badge_type === "featured" || listing.is_featured || false}
                  professional={listing.badge_type === "professional"}
                  business={listing.badge_type === "business"}
                  customPlanKey={listing.custom_plan_key}
                  status={listing.status}
                  category={listing.category}
                  description={listing.description}
                />
              ))}
            </div>
            </>
          )}
        </div>
      </main>

      <Footer />
      <BottomNavigation />
    </div>
  );
};

export default Favorites;
