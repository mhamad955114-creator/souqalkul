import { useGridLayout } from "@/hooks/useGridLayout";
import { ArrowLeft, ArrowRight, Pin, BarChart3, Images, Infinity, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatTime, getCountryByName } from "@/lib/constants";
import { sortListingsByPromotionPriority, loadTopDuration } from "@/lib/listingPriority";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/hooks/usePresence";
import { useListingSettings } from "@/hooks/useListingSettings";
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
  custom_plan_key?: string | null;
  _avgRating?: number;
}

const fallbackListings = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=375&fit=crop",
    title: "سيارة مرسيدس موديل 2022 - حالة ممتازة",
    price: "250,000,000 ل.س",
    location: "دمشق",
    time: "منذ ساعة",
    featured: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=375&fit=crop",
    title: "شقة فاخرة للإيجار - 3 غرف نوم",
    price: "8,000,000 ل.س/شهر",
    location: "حلب",
    time: "منذ 3 ساعات",
    featured: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=375&fit=crop",
    title: "آيفون 15 برو ماكس - جديد بالكرتونة",
    price: "45,000,000 ل.س",
    location: "اللاذقية",
    time: "منذ 5 ساعات",
    featured: false,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=375&fit=crop",
    title: "طقم كنب حديث - 7 مقاعد",
    price: "32,000,000 ل.س",
    location: "حمص",
    time: "منذ 6 ساعات",
    featured: false,
  },
];

interface ListingsSectionProps {
  refreshTrigger?: number;
}

const ListingsSection = ({ refreshTrigger }: ListingsSectionProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const { isOnline } = usePresence();
  const { settings } = useListingSettings();
  const { currentCountry } = useCountry();

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .eq("country", currentCountry.name as any)
      
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      const userIds = [...new Set(data.map((l) => l.user_id))];
      
      // Fetch average ratings for sellers
      const { data: ratingsData } = await supabase
        .from("ratings")
        .select("seller_id, rating")
        .in("seller_id", userIds);
      const ratingMap = new Map<string, { sum: number; count: number }>();
      (ratingsData || []).forEach((r) => {
        const entry = ratingMap.get(r.seller_id) || { sum: 0, count: 0 };
        entry.sum += r.rating;
        entry.count += 1;
        ratingMap.set(r.seller_id, entry);
      });

      const enriched = data.map((l) => {
        const rEntry = ratingMap.get(l.user_id);
        return {
          ...l,
          badge_type: (l as any).badge_type ?? null,
          _avgRating: rEntry ? rEntry.sum / rEntry.count : undefined,
        };
      });

      await loadTopDuration();
      setListings(sortListingsByPromotionPriority(enriched));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [refreshTrigger, currentCountry.name]);

  const hasDbListings = listings.length > 0;
  const ViewAllArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              {t.listings.latestListings}
            </h2>
            <p className="text-muted-foreground">
              {t.listings.browseAds}
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex" onClick={() => navigate("/listings")}>
            {t.listings.viewAll}
            <ViewAllArrow className="h-4 w-4" />
          </Button>
        </div>

        {/* Business Plan Promo Banner */}
        <div className="mb-8 rounded-2xl overflow-hidden bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-600 text-white p-6 md:p-8 relative animate-fade-in shadow-xl hover:shadow-2xl transition-shadow duration-500 group">
          {/* Animated background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-4xl md:text-5xl animate-pulse drop-shadow-[0_0_16px_rgba(59,130,246,0.9)] [filter:drop-shadow(0_0_8px_rgba(6,182,212,0.7))_drop-shadow(0_0_24px_rgba(59,130,246,0.6))]">💎</span>
            </div>
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-xl md:text-2xl font-bold mb-2">باقة رجال الأعمال <span className="animate-pulse drop-shadow-[0_0_12px_rgba(59,130,246,0.9)] [filter:drop-shadow(0_0_6px_rgba(6,182,212,0.8))_drop-shadow(0_0_20px_rgba(99,102,241,0.6))]">💎</span></h3>
              <p className="text-white/80 text-sm mb-4">الباقة الأقوى للشركات والمؤسسات - تصدّر نتائج البحث واحصل على ميزات حصرية</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  { icon: <Pin className="h-4 w-4 flex-shrink-0" />, text: "تثبيت في الأعلى" },
                  { icon: <BarChart3 className="h-4 w-4 flex-shrink-0" />, text: "إحصائيات متقدمة" },
                  { icon: <Images className="h-4 w-4 flex-shrink-0" />, text: `حتى ${settings.business_listing.max_images} صورة` },
                  { icon: <Infinity className="h-4 w-4 flex-shrink-0" />, text: settings.business_listing.max_active_listings === -1 ? "إعلانات غير محدودة" : `حتى ${settings.business_listing.max_active_listings} إعلان` },
                  { icon: <ShieldCheck className="h-4 w-4 flex-shrink-0" />, text: `${settings.business_listing.duration_days} يوم` },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 hover:bg-white/20 transition-colors duration-200 animate-fade-up"
                    style={{ animationDelay: `${idx * 0.1}s` }}
                  >
                    {feature.icon}
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-shrink-0 text-center">
              <a
                href="https://wa.me/905350348850?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B4%D8%AA%D8%B1%D8%A7%D9%83%20%D9%81%D9%8A%20%D8%A8%D8%A7%D9%82%D8%A9%20%D8%B1%D8%AC%D8%A7%D9%84%20%D8%A7%D9%84%D8%A3%D8%B9%D9%85%D8%A7%D9%84"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-white text-blue-600 hover:bg-white/90 font-bold mt-2 hover-scale">
                  تواصل معنا
                </Button>
              </a>
            </div>
          </div>
        </div>

        {loading ? (
          <div className={gridClass}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-square bg-muted" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-muted rounded-md w-4/5" />
                  <div className="h-4 bg-muted rounded-md w-2/5" />
                  <div className="h-6 bg-muted rounded-md w-1/3" />
                  <div className="flex items-center justify-between pt-1">
                    <div className="h-3 bg-muted rounded-md w-1/3" />
                    <div className="h-3 bg-muted rounded-md w-1/4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={gridClass}>
            {hasDbListings
              ? listings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ListingCard
                      id={listing.id}
                      image={listing.images?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=375&fit=crop"}
                      title={listing.title}
                      price={formatPrice(listing.price, currentCountry.currencySymbol)}
                      priceValue={listing.price}
                      currency={(listing as any).currency}
                      location={listing.city}
                      country={currentCountry.name}
                      time={formatTime(listing.created_at)}
                      featured={listing.badge_type === "featured" || listing.is_featured}
                      professional={listing.badge_type === "professional"}
                      business={listing.badge_type === "business"}
                      status={listing.status}
                      category={listing.category}
                      userId={listing.user_id}
                      isOwnerOnline={isOnline(listing.user_id)}
                      description={listing.description}
                      averageRating={listing._avgRating}
                      images={listing.images}
                      customPlanKey={listing.custom_plan_key}
                    />
                  </div>
                ))
              : fallbackListings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ListingCard
                      image={listing.image}
                      title={listing.title}
                      price={listing.price}
                      location={listing.location}
                      time={listing.time}
                      featured={listing.featured}
                    />
                  </div>
                ))}
          </div>
        )}

        <div className="text-center mt-10 md:hidden">
          <Button variant="outline" onClick={() => navigate("/listings")}>
            {t.listings.viewAll}
            <ViewAllArrow className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
