import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import appLogo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Loader2, 
  ArrowRight, 
  ArrowLeft,
  MapPin, 
  Clock, 
  RotateCcw,
  Eye, 
  Phone, 
  MessageCircle,
  User,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Flag,
  Hash
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatModal from "@/components/ChatModal";
import AuthModal from "@/components/AuthModal";
import ShareButtons from "@/components/ShareButtons";
import RatingSection from "@/components/RatingSection";
import ReportModal from "@/components/ReportModal";
import Product360Viewer from "@/components/Product360Viewer";
import VerifiedBadge from "@/components/VerifiedBadge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice, formatDate, categoryLabels } from "@/lib/constants";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  city: string;
  area: string | null;
  phone: string | null;
  images: string[] | null;
  is_featured: boolean | null;
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
  is_verified: boolean;
}

const ListingDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const [listing, setListing] = useState<Listing | null>(null);
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [show360, setShow360] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [isOwnerPro, setIsOwnerPro] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const { data: listingData, error: listingError } = await supabase
          .from("listings")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (listingError) {
          toast.error(t.common.error);
          console.error(listingError);
          return;
        }

        if (!listingData) {
          toast.error(t.common.error);
          navigate("/");
          return;
        }

        setListing(listingData);

        await supabase
          .from("listings")
          .update({ views_count: (listingData.views_count || 0) + 1 })
          .eq("id", id);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("full_name, city, avatar_url, created_at, is_verified")
          .eq("user_id", listingData.user_id)
          .maybeSingle();

        // Fetch phone securely - only available to authenticated users
        let sellerPhone: string | null = null;
        if (user) {
          const { data: phoneData } = await supabase.rpc("get_user_phone", { _target_user_id: listingData.user_id });
          sellerPhone = phoneData as string | null;
        }

        setSeller(profileData ? { ...profileData, phone: sellerPhone } : null);

        // Check if listing owner has professional subscription
        const { data: proSub } = await supabase
          .from("user_subscriptions")
          .select("id")
          .eq("user_id", listingData.user_id)
          .eq("plan_type", "professional")
          .eq("status", "active")
          .gte("expires_at", new Date().toISOString())
          .limit(1);
        setIsOwnerPro(!!(proSub && proSub.length > 0));

      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id, navigate, user]);

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return dir === "rtl" ? "اليوم" : dir === "ltr" ? "Today" : "Bugün";
    if (diffDays === 1) return dir === "rtl" ? "أمس" : dir === "ltr" ? "Yesterday" : "Dün";
    if (diffDays < 7) return `${diffDays} ${t.common.daysAgo}`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} ${t.common.weekAgo}`;
    return formatDate(dateString);
  };

  const handleCall = () => {
    const phoneNumber = seller?.phone || listing?.phone;
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    } else {
      toast.error(t.details.noPhone);
    }
  };

  const handleWhatsApp = () => {
    if (seller?.phone) {
      const phone = seller.phone.replace(/[^0-9]/g, "");
      const message = encodeURIComponent(`${listing?.title}`);
      window.open(`https://wa.me/${phone}?text=${message}`, "_blank");
    } else if (listing?.phone) {
      const phone = listing.phone.replace(/[^0-9]/g, "");
      const message = encodeURIComponent(`${listing?.title}`);
      window.open(`https://wa.me/963${phone.slice(1)}?text=${message}`, "_blank");
    } else {
      toast.error(t.details.noPhone);
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

  const hasRealImages = listing.images && listing.images.length > 0 && 
    !listing.images.every(img => img.includes("placeholder") || img.includes("unsplash"));
  const images = hasRealImages ? listing.images! : [];
  const showAppLogo = images.length === 0;

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen bg-background" dir={dir}>
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <BackArrow className="h-4 w-4" />
          {t.details.back}
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-video">
                {showAppLogo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 gap-3">
                    <img src={appLogo} alt="سوق الكل" className="w-32 h-32 object-contain opacity-60" />
                    <span className="text-sm text-muted-foreground">لا توجد صورة لهذا الإعلان</span>
                  </div>
                ) : /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(images[currentImageIndex]) ? (
                  <video
                    src={images[currentImageIndex]}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                )}
                
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

                <div className="absolute top-4 left-4 flex gap-2">
                  {images.length >= 3 && (
                    <button
                      onClick={() => setShow360(true)}
                      className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                      title="عرض 360°"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                  >
                    <Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
                  </button>
                  <ShareButtons
                    url={window.location.href}
                    title={listing.title}
                    description={listing.description || undefined}
                  />
                </div>
              </div>

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
                        src={/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img) ? "" : img}
                        alt={`${idx + 1}`}
                        className="w-full h-full object-cover"
                        style={/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img) ? { display: "none" } : {}}
                      />
                      {/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img) && (
                        <div className="w-full h-full bg-muted flex items-center justify-center text-primary text-xs font-bold">▶</div>
                      )}
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
                  <div className="flex gap-2 flex-shrink-0">
                    {listing.status === "sold" && (
                      <Badge variant="destructive" className="text-sm">
                        {t.myAccount.soldBadge}
                      </Badge>
                    )}
                    {isOwnerPro && (
                      <Badge className="text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0">
                        👑 احترافي
                      </Badge>
                    )}
                    {listing.is_featured && !isOwnerPro && (
                      <Badge className="text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        ⭐ {t.listings.featured}
                      </Badge>
                    )}
                    <Badge variant="outline">
                      {categoryLabels[listing.category] || listing.category}
                    </Badge>
                  </div>
                </div>

                <div className="text-3xl font-bold text-primary mb-4">
                  {formatPrice(listing.price)}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                  <span className="flex items-center gap-1 font-mono">
                    <Hash className="h-4 w-4" />
                    {listing.id.split("-")[0].toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {listing.city}{listing.area && ` - ${listing.area}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {getTimeSince(listing.created_at)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {listing.views_count || 0} {t.details.views}
                  </span>
                  {listing.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-4 w-4" />
                      {listing.phone}
                    </span>
                  )}
                </div>

                <Separator className="my-6" />


                <div>
                  <h2 className="text-lg font-semibold text-foreground mb-3">
                    {t.details.description}
                  </h2>
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                    {listing.description || t.details.noDescription}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ratings Section */}
            <RatingSection
              sellerId={listing.user_id}
              listingId={listing.id}
              sellerName={seller?.full_name || undefined}
            />
          </div>

          {/* Sidebar - Seller Info */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t.details.sellerInfo}
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                    {seller?.avatar_url ? (
                      <img 
                        src={seller.avatar_url} 
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground flex items-center gap-1">
                      {seller?.full_name || t.details.member}
                      {seller?.is_verified && <VerifiedBadge size="sm" />}
                    </h3>
                    {seller?.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {seller.city}
                      </p>
                    )}
                    {seller?.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.details.memberSince} {formatDate(seller.created_at)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleCall}
                    className="w-full" 
                    size="lg"
                    disabled={!seller?.phone && !listing?.phone}
                  >
                    <Phone className="h-5 w-5" />
                    {t.details.call}
                  </Button>
                  
                  <Button 
                    onClick={handleWhatsApp}
                    variant="outline" 
                    className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white border-[#25D366] hover:text-white" 
                    size="lg"
                    disabled={!seller?.phone && !listing?.phone}
                  >
                    <MessageCircle className="h-5 w-5" />
                    {t.details.whatsapp}
                  </Button>

                  {listing?.user_id !== user?.id && (
                    <Button 
                      onClick={() => {
                        if (user) {
                          setChatModalOpen(true);
                        } else {
                          setAuthModalOpen(true);
                        }
                      }}
                      variant="outline"
                      className="w-full" 
                      size="lg"
                    >
                      <MessageSquare className="h-5 w-5" />
                      {t.details.chatWithSeller}
                    </Button>
                  )}

                  {listing?.user_id !== user?.id && (
                    <Button
                      onClick={() => {
                        if (user) {
                          setReportModalOpen(true);
                        } else {
                          setAuthModalOpen(true);
                        }
                      }}
                      variant="ghost"
                      className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                      size="lg"
                    >
                      <Flag className="h-5 w-5" />
                      {t.details.reportListing}
                    </Button>
                  )}
                </div>

                {!seller?.phone && !listing?.phone && (
                  <p className="text-sm text-muted-foreground text-center mt-4">
                    {t.details.noPhone}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">
                  {t.details.safetyTips}
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• {t.details.tip1}</li>
                  <li>• {t.details.tip2}</li>
                  <li>• {t.details.tip3}</li>
                  <li>• {t.details.tip4}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />

      {listing && (
        <ChatModal
          open={chatModalOpen}
          onOpenChange={setChatModalOpen}
          listingId={listing.id}
          sellerId={listing.user_id}
          listingTitle={listing.title}
        />
      )}

      {listing && user && (
        <ReportModal
          open={reportModalOpen}
          onOpenChange={setReportModalOpen}
          listingId={listing.id}
          userId={user.id}
        />
      )}

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab="login"
      />

      {show360 && images.length >= 3 && (
        <Product360Viewer
          images={images}
          onClose={() => setShow360(false)}
        />
      )}
    </div>
  );
};

export default ListingDetails;
