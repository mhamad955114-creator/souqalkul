import { ArrowLeft, ArrowRight, Briefcase, Pin, BarChart3, Images, Infinity, ShieldCheck } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatTime } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePresence } from "@/hooks/usePresence";
import { useListingSettings } from "@/hooks/useListingSettings";
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
  _isPro?: boolean;
  _isBusiness?: boolean;
}

const fallbackListings = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=375&fit=crop",
    title: "سيارة مرسيدس موديل 2022 - حالة ممتازة",
    price: "٢٥٠,٠٠٠,٠٠٠ ل.س",
    location: "دمشق",
    time: "منذ ساعة",
    featured: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=375&fit=crop",
    title: "شقة فاخرة للإيجار - 3 غرف نوم",
    price: "٨,٠٠٠,٠٠٠ ل.س/شهر",
    location: "حلب",
    time: "منذ 3 ساعات",
    featured: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=375&fit=crop",
    title: "آيفون 15 برو ماكس - جديد بالكرتونة",
    price: "٤٥,٠٠٠,٠٠٠ ل.س",
    location: "اللاذقية",
    time: "منذ 5 ساعات",
    featured: false,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=375&fit=crop",
    title: "طقم كنب حديث - 7 مقاعد",
    price: "٣٢,٠٠٠,٠٠٠ ل.س",
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

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      // Fetch professional and business subscriptions for listing owners
      const userIds = [...new Set(data.map((l) => l.user_id))];
      const { data: subs } = await supabase
        .from("user_subscriptions")
        .select("user_id, plan_type")
        .in("user_id", userIds)
        .in("plan_type", ["professional", "business"])
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString());
      const proUserIds = new Set((subs || []).filter((s) => s.plan_type === "professional").map((s) => s.user_id));
      const bizUserIds = new Set((subs || []).filter((s) => s.plan_type === "business").map((s) => s.user_id));
      const enriched = data.map((l) => ({ ...l, _isPro: proUserIds.has(l.user_id), _isBusiness: bizUserIds.has(l.user_id) }));
      // Pin business listings to top
      enriched.sort((a, b) => {
        if (a._isBusiness && !b._isBusiness) return -1;
        if (!a._isBusiness && b._isBusiness) return 1;
        return 0;
      });
      setListings(enriched);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [refreshTrigger]);

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
          
          <div className="absolute top-2 left-2 bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
            إعلان مدفوع
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
            <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 flex items-center justify-center animate-[pulse_3s_cubic-bezier(0.4,0,0.6,1)_infinite] group-hover:scale-110 transition-transform duration-300">
              <Briefcase className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-xl md:text-2xl font-bold mb-2">باقة رجال الأعمال 💼</h3>
              <p className="text-white/80 text-sm mb-4">الباقة الأقوى للشركات والمؤسسات - تصدّر نتائج البحث واحصل على ميزات حصرية</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                {[
                  { icon: <Pin className="h-4 w-4 flex-shrink-0" />, text: "تثبيت في الأعلى" },
                  { icon: <BarChart3 className="h-4 w-4 flex-shrink-0" />, text: "إحصائيات متقدمة" },
                  { icon: <Images className="h-4 w-4 flex-shrink-0" />, text: `حتى ${settings.business_listing.max_images} صورة` },
                  { icon: <Infinity className="h-4 w-4 flex-shrink-0" />, text: "إعلانات غير محدودة" },
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
              <p className="text-3xl font-bold mb-1">{formatPrice(settings.business_listing.price || 200000)}</p>
              <Button
                onClick={() => navigate("/pricing")}
                className="bg-white text-blue-600 hover:bg-white/90 font-bold mt-2 hover-scale"
              >
                اشترك الآن
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-[4/3] bg-muted" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-6 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
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
                      price={formatPrice(listing.price)}
                      location={listing.city}
                      time={formatTime(listing.created_at)}
                      featured={listing.is_featured}
                      professional={listing._isPro}
                      business={listing._isBusiness}
                      status={listing.status}
                      category={listing.category}
                      userId={listing.user_id}
                      isOwnerOnline={isOnline(listing.user_id)}
                      description={listing.description}
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
