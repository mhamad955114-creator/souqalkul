import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import ListingCard from "./ListingCard";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPrice, formatTime } from "@/lib/constants";

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
          <Button variant="outline" className="hidden md:flex" onClick={() => navigate("/listings")}>
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
                      id={listing.id}
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
          <Button variant="outline" onClick={() => navigate("/listings")}>
            عرض الكل
            <ArrowLeft className="h-4 w-4 mr-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ListingsSection;
