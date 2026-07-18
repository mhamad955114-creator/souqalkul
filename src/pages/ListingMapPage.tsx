import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingLocationMap from "@/components/ListingLocationMap";
import { useLanguage } from "@/contexts/LanguageContext";

interface Listing {
  id: string;
  title: string;
  city: string;
  area: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
}

const ListingMapPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  useEffect(() => {
    if (!id) {
      navigate("/");
      return;
    }

    const fetchListing = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("id, title, city, area, country, latitude, longitude")
          .eq("id", id)
          .maybeSingle();

        if (error) {
          toast.error("تعذر تحميل موقع الإعلان");
          console.error(error);
          navigate("/");
          return;
        }

        if (!data) {
          toast.error("الإعلان غير موجود");
          navigate("/");
          return;
        }

        setListing(data as Listing);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />

      <main className="container mx-auto px-4 py-6 flex flex-col" style={{ minHeight: "calc(100vh - 140px)" }}>
        {/* Page Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold text-foreground truncate">
              موقع الإعلان على الخريطة
            </h1>
            {listing?.title && (
              <p className="text-sm text-muted-foreground truncate">{listing.title}</p>
            )}
          </div>
          <Button onClick={() => navigate(`/listing/${id}`)} variant="outline" size="sm">
            <BackArrow className="h-4 w-4" />
            <span className="hidden sm:inline mr-2">العودة للإعلان</span>
          </Button>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            جاري تحميل الموقع...
          </div>
        ) : listing ? (
          <div className="flex-1">
            <ListingLocationMap
              listingId={listing.id}
              city={listing.city}
              area={listing.area}
              country={listing.country}
              latitude={listing.latitude}
              longitude={listing.longitude}
              mapHeightClass="h-[60vh]"
            />
          </div>
        ) : null}
      </main>

      <Footer />
    </div>
  );
};

export default ListingMapPage;
