import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  ArrowRight, 
  MapPin, 
  Clock, 
  Eye, 
  Phone, 
  MessageCircle,
  User,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  city: string;
  images: string[] | null;
  status: string | null;
  views_count: number | null;
  created_at: string;
  user_id: string;
}

interface SellerProfile {
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  cars: "سيارات",
  real_estate: "عقارات",
  electronics: "إلكترونيات",
  clothing: "ملابس",
  furniture: "أثاث",
  jobs: "وظائف",
  games: "ألعاب",
  services: "خدمات",
};

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      setLoading(true);
      try {
        // Fetch listing
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (listingError) {
          toast.error("فشل تحميل الإعلان");
          console.error(listingError);
          return;
        }

        if (!listingData) {
          toast.error("الإعلان غير موجود");
          navigate("/");
          return;
        }

        setListing(listingData);

        // Increment views count
        await supabase
          .from("listings")
          .update({ views_count: (listingData.views_count || 0) + 1 })
          .eq("id", id);

        // Fetch seller profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, phone, city, avatar_url, created_at")
          .eq("user_id", listingData.user_id)
          .maybeSingle();

        setSeller(profileData);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-SA", {
      style: "currency",
      currency: "SAR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "اليوم";
    if (diffDays === 1) return "أمس";
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.floor(diffDays / 7)} أسابيع`;
    return `منذ ${Math.floor(diffDays / 30)} أشهر`;
  };

  const handleCall = () => {
    if (seller?.phone) {
      window.location.href = `tel:${seller.phone}`;
    } else {
      toast.error("رقم الهاتف غير متوفر");
    }
  };

  const handleWhatsApp = () => {
    if (seller?.phone) {
      const phone = seller.phone.replace(/[^0-9]/g, "");
      const message = encodeURIComponent(`مرحباً، أنا مهتم بإعلانك: ${listing?.title}`);
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    } else {
      toast.error("رقم الهاتف غير متوفر");
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: listing?.title,
          text: listing?.description || "",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("تم نسخ الرابط");
      }
    } catch {
      // User cancelled share
    }
  };

  const nextImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === listing.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (listing?.images && listing.images.length > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? listing.images!.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!listing) {
    return null;
  }

  const images = listing.images && listing.images.length > 0 
    ? listing.images 
    : ["/placeholder.svg"];

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowRight className="h-4 w-4" />
          العودة
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={images[currentImageIndex]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
                
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    
                    {/* Image Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentImageIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentImageIndex 
                              ? "bg-primary" 
                              : "bg-card/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 left-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <Share2 className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex 
                          ? "border-primary" 
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={img}
                        alt={`صورة ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Card>

            {/* Listing Info */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl font-bold text-foreground">
                    {listing.title}
                  </h1>
                  <Badge variant="outline" className="flex-shrink-0">
                    {categoryLabels[listing.category] || listing.category}
                  </Badge>
                </div>

                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(listing.price)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeSince(listing.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing.views_count || 0} مشاهدة
                  </span>
                </div>

                <Separator className="my-6" />

                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    الوصف
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {listing.description || "لا يوجد وصف"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Seller Info */}
          <div className="space-y-6">
            {/* Seller Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  معلومات البائع
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {seller?.avatar_url ? (
                      <img 
                        src={seller.avatar_url} 
                        alt="صورة البائع"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {seller?.full_name || "مستخدم"}
                    </h3>
                    {seller?.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {seller.city}
                      </p>
                    )}
                    {seller?.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        عضو منذ {formatDate(seller.created_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleCall}
                    className="w-full" 
                    size="lg"
                    disabled={!seller?.phone}
                  >
                    <Phone className="h-5 w-5" />
                    اتصال
                  </Button>
                  
                  <Button 
                    onClick={handleWhatsApp}
                    variant="outline" 
                    className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white border-[#25D366] hover:text-white" 
                    size="lg"
                    disabled={!seller?.phone}
                  >
                    <MessageCircle className="h-5 w-5" />
                    واتساب
                  </Button>
                </div>

                {!seller?.phone && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    البائع لم يضف رقم هاتف
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  نصائح أمان
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• قابل البائع في مكان عام</li>
                  <li>• تفحص المنتج قبل الدفع</li>
                  <li>• لا ترسل أموالاً مقدماً</li>
                  <li>• احذر من العروض المبالغ فيها</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListingDetails;
