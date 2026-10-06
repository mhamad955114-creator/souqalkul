import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useBrand } from "@/contexts/BrandContext";
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
  Hash,
  ZoomIn,
  Copy,
  Bot,
  Rocket

} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatModal from "@/components/ChatModal";
import PriceEstimateCard from "@/components/PriceEstimateCard";
import { notifyAdmins, notifyUser } from "@/lib/notifyAdmins";

import AuthModal from "@/components/AuthModal";
import ShareButtons from "@/components/ShareButtons";
import RatingSection from "@/components/RatingSection";
import ReportModal from "@/components/ReportModal";
import Product360Viewer from "@/components/Product360Viewer";
import ImageZoomViewer from "@/components/ImageZoomViewer";
import VerifiedBadge from "@/components/VerifiedBadge";
import ListingPointsBadge from "@/components/ListingPointsBadge";
import ListingInformationTabs from "@/components/ListingInformationTabs";
import { localizeCity } from "@/lib/listingLocalization";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatPrice, formatDate, categoryLabels, getCountryByName, formatListingPrice } from "@/lib/constants";
import { useListingAiThread } from "@/hooks/useListingAiThread";


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
  badge_type?: string | null;
  is_featured: boolean | null;
  status: string | null;
  views_count: number | null;
  created_at: string;
  user_id: string;
  metadata?: Record<string, unknown> | null;
  country?: string | null;
  currency?: string | null;
  latitude?: number | null;
  longitude?: number | null;
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
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { t, dir, language } = useLanguage();
  const { logoUrl: appLogo } = useBrand();
  const [listing, setListing] = useState<Listing | null>(null);
  const { thread: aiThread } = useListingAiThread(listing?.id);

  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [show360, setShow360] = useState(false);
  const [showZoomViewer, setShowZoomViewer] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const handlePublish = async () => {
    if (!listing || !user || listing.user_id !== user.id) return;
    setPublishing(true);
    try {
      const { error } = await supabase
        .from("listings")
        .update({ status: "active", sold_at: null })
        .eq("id", listing.id);

      if (error) throw error;

      setListing({ ...listing, status: "active" });
      toast.success("تم نشر الإعلان بنجاح");

      await notifyAdmins({
        title: "نشر إعلان جديد",
        message: `قام مستخدم بنشر الإعلان "${listing.title}"`,
        type: "listing_published",
        relatedId: listing.id,
      });

      // Advertiser gets their own confirmation (in-app + push).
      await notifyUser(user.id, {
        title: "تم نشر إعلانك",
        message: `إعلانك "${listing.title}" أصبح منشوراً وظاهراً للمستخدمين`,
        type: "listing_published_owner",
        relatedId: listing.id,
      });

    } catch {
      toast.error("تعذر نشر الإعلان، حاول مرة أخرى");
    } finally {
      setPublishing(false);
    }
  };

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
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

        setListing(listingData as any);

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
      } finally {
        setLoading(false);
      }
    };

    fetchListing();

    const channel = supabase
      .channel(`listing-details-${id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "listings",
          filter: `id=eq.${id}`,
        },
        (payload) => {
          setListing((current) => {
            if (!current) return payload.new as Listing;
            return {
              ...current,
              ...(payload.new as Partial<Listing>),
            };
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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
    const imageCount = listing?.images?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => 
        prev === imageCount - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    const imageCount = listing?.images?.length || 0;
    if (imageCount > 0) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? imageCount - 1 : prev - 1
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
  const images = hasRealImages ? listing.images || [] : [];
  const showAppLogo = images.length === 0;
  const isOwnerBusiness = listing.badge_type === "business";
  const isOwnerPro = listing.badge_type === "professional";
  const isOwner = !!user && listing.user_id === user.id;

  const BackArrow = dir === "rtl" ? ArrowRight : ArrowLeft;

  const sharedLat = parseFloat(searchParams.get("lat") || "");
  const sharedLng = parseFloat(searchParams.get("lng") || "");
  const sharedLatitude = !isNaN(sharedLat) ? sharedLat : null;
  const sharedLongitude = !isNaN(sharedLng) ? sharedLng : null;

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

        <div className="grid min-w-0 lg:grid-cols-3 gap-8">
          <div className="min-w-0 lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/6] sm:aspect-video bg-muted/20">
                {showAppLogo ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 gap-3">
                    <img src={appLogo} alt="سوق الكل" className="w-32 h-32 object-contain opacity-60" />
                    <span className="text-sm text-muted-foreground">لا توجد صورة لهذا الإعلان</span>
                  </div>
                ) : /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(images[currentImageIndex]) ? (
                  <video
                    src={images[currentImageIndex]}
                    controls
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={images[currentImageIndex]}
                    alt={listing.title}
                    className="w-full h-full object-contain cursor-zoom-in"
                    onClick={() => setShowZoomViewer(true)}
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
                  {!showAppLogo && !(/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(images[currentImageIndex])) && (
                    <button
                      onClick={() => setShowZoomViewer(true)}
                      className="w-10 h-10 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-card transition-colors"
                      title="تكبير الصورة"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </button>
                  )}
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

            <section className="min-w-0 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                {listing.status === "sold" && <Badge variant="destructive">{t.myAccount.soldBadge}</Badge>}
                {(listing.is_featured || listing.badge_type === "featured") && !isOwnerPro && !isOwnerBusiness && <Badge>⭐ {t.listings.featured}</Badge>}
                {isOwnerBusiness && <Badge>💎 {language === "ar" ? "رجال أعمال" : language === "tr" ? "İşletme" : "Business"}</Badge>}
                {isOwnerPro && !isOwnerBusiness && <Badge>⭐ {language === "ar" ? "احترافي" : language === "tr" ? "Profesyonel" : "Professional"}</Badge>}
              </div>
              <h1 dir="auto" className="text-xl font-bold text-foreground [overflow-wrap:anywhere]">{listing.title}</h1>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-bold text-primary">{formatListingPrice(listing.price, listing.currency, listing.country)}</span>
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground"><Eye className="h-4 w-4" />{listing.views_count || 0}</span>
              </div>
              <ListingPointsBadge listingId={listing.id} detailed />
              <ListingInformationTabs
                listing={listing}
                sharedLatitude={sharedLatitude}
                sharedLongitude={sharedLongitude}
                onOpenMap={() => navigate(`/listing/${listing.id}/map`)}
                publisherContent={(
                  <div className="min-w-0">
                <h2 className="text-lg font-semibold text-foreground mb-4">
                  {t.details.sellerInfo}
                </h2>

                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 shrink-0 rounded-full bg-muted flex items-center justify-center overflow-hidden">
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
                  <div className="min-w-0 [overflow-wrap:anywhere]">
                    <h3 className="font-semibold text-foreground flex items-center gap-1">
                      {seller?.full_name || t.details.member}
                      {seller?.is_verified && <VerifiedBadge size="sm" />}
                    </h3>
                    {seller?.city && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {localizeCity(seller.city, getCountryByName(listing.country || "")?.code || "", language)}
                      </p>
                    )}
                    {seller?.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {t.details.memberSince} {new Intl.DateTimeFormat(`${language}-u-nu-latn`, { calendar: "gregory" }).format(new Date(seller.created_at))}
                      </p>
                    )}
                  </div>
                </div>

                {(seller?.phone || listing.phone) && (
                  <p className="mb-4 text-sm text-foreground"><bdi dir="ltr">{seller?.phone || listing.phone}</bdi></p>
                )}
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
                    className="w-full" 
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
                  </div>
                )}
              />
            </section>

            {/* Ratings Section */}
            <RatingSection
              sellerId={listing.user_id}
              listingId={listing.id}
              sellerName={seller?.full_name || undefined}
            />
          </div>

          {/* Sidebar - Seller Info */}
          <div className="min-w-0 space-y-6">
            {/* Owner: publish the listing */}
            {isOwner && listing.status !== "active" && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    هذا الإعلان غير منشور حالياً
                    {listing.status ? ` (${listing.status})` : ""}
                  </p>
                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="w-full"
                    size="lg"
                  >
                    {publishing ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Rocket className="h-5 w-5" />
                    )}
                    نشر الإعلان
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* AI price evaluation */}
            {listing && <PriceEstimateCard listingId={listing.id} />}

            {/* Ask the AI assistant about this listing (context sent automatically) */}
            {listing && (
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/ai?listing=${listing.id}`)}
                >
                  <Bot className="h-4 w-4" />
                  {aiThread && aiThread.messageCount > 0
                    ? "متابعة محادثة هذا الإعلان"
                    : "اسأل المساعد الذكي عن هذا الإعلان"}
                </Button>
                {aiThread && aiThread.messageCount > 0 && (
                  <p className="text-xs text-muted-foreground text-center">
                    محادثة محفوظة • {aiThread.messageCount} رسالة • آخر تحديث{" "}
                    {formatDate(aiThread.updated_at)}
                  </p>
                )}
              </div>
            )}



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

      {showZoomViewer && images.length > 0 && (
        <ImageZoomViewer
          images={images.filter(img => !/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(img))}
          initialIndex={currentImageIndex}
          onClose={() => setShowZoomViewer(false)}
        />
      )}
    </div>
  );
};

export default ListingDetails;
