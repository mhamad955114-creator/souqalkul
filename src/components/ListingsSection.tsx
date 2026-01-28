import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  images: string[];
  is_featured: boolean;
  created_at: string;
}

// Static fallback data
const fallbackListings = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=500&h=375&fit=crop",
    title: "مرسيدس E300 موديل 2022 - حالة ممتازة",
    price: "٢٥٠,٠٠٠ ر.س",
    location: "الرياض",
    time: "منذ ساعة",
    featured: true,
  },
  {
    id: "2",
    image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=375&fit=crop",
    title: "شقة فاخرة للإيجار - 3 غرف نوم",
    price: "٨,٠٠٠ ر.س/شهر",
    location: "جدة",
    time: "منذ 3 ساعات",
    featured: true,
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=375&fit=crop",
    title: "آيفون 15 برو ماكس - جديد بالكرتونة",
    price: "٤,٥٠٠ ر.س",
    location: "الدمام",
    time: "منذ 5 ساعات",
    featured: false,
  },
  {
    id: "4",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=500&h=375&fit=crop",
    title: "طقم كنب حديث - 7 مقاعد",
    price: "٣,٢٠٠ ر.س",
    location: "مكة المكرمة",
    time: "منذ 6 ساعات",
    featured: false,
  },
];

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "منذ دقائق";
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "منذ يوم";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
};

interface ListingsSectionProps {
  refreshTrigger?: number;
}

const ListingsSection = ({ refreshTrigger }: ListingsSectionProps) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    const { data, error } = await supabase
      .from("listings")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(8);

    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [refreshTrigger]);

  const hasDbListings = listings.length > 0;

  return (
    <section className="py-16 bg-secondary/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
              أحدث الإعلانات
            </h2>
            <p className="text-muted-foreground">
              تصفح آخر الإعلانات المضافة في السوق
            </p>
          </div>
          <Button variant="outline" className="hidden md:flex">
            عرض الكل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {hasDbListings
              ? listings.map((listing, index) => (
                  <div
                    key={listing.id}
                    className="animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <ListingCard
                      image={listing.images?.[0] || "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=375&fit=crop"}
                      title={listing.title}
                      price={formatPrice(listing.price)}
                      location={listing.city}
                      time={formatTime(listing.created_at)}
                      featured={listing.is_featured}
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
          <Button variant="outline">
            عرض الكل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
