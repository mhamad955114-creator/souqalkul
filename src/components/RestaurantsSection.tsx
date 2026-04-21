import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/hooks/usePresence";
import { useCountry } from "@/contexts/CountryContext";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  city: string;
  images: string[];
  is_featured: boolean;
  created_at: string;
  status: string | null;
  category: string;
  user_id: string;
  badge_type?: string | null;
  _avgRating?: number;
  metadata?: Record<string, string> | null;
}

const RestaurantsSection = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { isOnline } = usePresence();
  const { currentCountry } = useCountry();

  const ViewAllArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("status", "active")
        .eq("category", "مطاعم")
        .eq("country", currentCountry.name)
        .order("created_at", { ascending: false })
        .limit(8);

      if (!error && data) {
        const userIds = [...new Set(data.map((l) => l.user_id))];
        let ratingsMap: Record<string, number> = {};
        if (userIds.length) {
          const { data: ratings } = await supabase
            .from("ratings")
            .select("seller_id, rating")
            .in("seller_id", userIds);
          if (ratings) {
            const sums: Record<string, { total: number; count: number }> = {};
            ratings.forEach((r) => {
              if (!sums[r.seller_id]) sums[r.seller_id] = { total: 0, count: 0 };
              sums[r.seller_id].total += r.rating;
              sums[r.seller_id].count += 1;
            });
            Object.entries(sums).forEach(([id, v]) => {
              ratingsMap[id] = v.total / v.count;
            });
          }
        }
        setListings(
          data.map((l) => ({
            ...l,
            images: l.images || [],
            _avgRating: ratingsMap[l.user_id] || 0,
            metadata: l.metadata as Record<string, string> | null,
          }))
        );
      }
      setLoading(false);
    };
    fetch();
  }, [currentCountry.name]);

  if (!loading && listings.length === 0) return null;

  return (
    <section className="py-12 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground">
                {t.categories.restaurants}
              </h2>
              <p className="text-sm text-muted-foreground">
                {dir === "rtl" ? "اكتشف أفضل المطاعم بالقرب منك" : "Discover the best restaurants near you"}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/listings?category=" + encodeURIComponent("مطاعم"))}
          >
            {t.listings.viewAll}
            <ViewAllArrow className="h-4 w-4" />
          </Button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-muted rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        )}

        {/* Listings grid */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                city={listing.city}
                image={listing.images[0] || ""}
                images={listing.images}
                isFeatured={listing.is_featured}
                createdAt={listing.created_at}
                category={listing.category}
                userId={listing.user_id}
                isOwnerOnline={isOnline(listing.user_id)}
                badgeType={listing.badge_type}
                averageRating={listing._avgRating}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RestaurantsSection;
