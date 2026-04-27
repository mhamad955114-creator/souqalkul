import { useState } from "react";
import { Heart, MapPin, Clock, Star, Video, Image as ImageIcon, ArrowUpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSoundEffects } from "@/hooks/useSoundEffects";
import { useBrand } from "@/contexts/BrandContext";
import { useContactSettings, buildWhatsAppUrl } from "@/hooks/useContactSettings";
import { useAuth } from "@/hooks/useAuth";
import { useFormatPrice } from "@/hooks/useFormatPrice";
import { getCountryByName } from "@/lib/constants";
import type { CSSProperties } from "react";
interface ListingCardProps {
  id?: string;
  image: string;
  title: string;
  price: string;
  /** Optional: when provided along with the listing's country, the card re-formats the price
   *  according to the user's currency display preference (local vs USD). */
  priceValue?: number;
  location: string;
  country?: string;
  time: string;
  featured?: boolean;
  professional?: boolean;
  business?: boolean;
  status?: string;
  category?: string;
  userId?: string;
  isOwnerOnline?: boolean;
  description?: string | null;
  averageRating?: number;
  images?: string[];
}

const ListingCard = ({ id, image, title, price, priceValue, location, country, time, featured, professional, business, status, category, userId, isOwnerOnline, description, averageRating, images }: ListingCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const { t } = useLanguage();
  const { playBadgeSound } = useSoundEffects();
  const { logoUrl: appLogo } = useBrand();
  const { contact } = useContactSettings();
  const { user } = useAuth();
  const { formatDisplayPrice } = useFormatPrice();
  const isListingFavorite = id ? isFavorite(id) : false;
  const [imageLoaded, setImageLoaded] = useState(false);

  // Re-format the price using the user's currency preference when we have the raw value.
  const displayPrice =
    priceValue !== undefined
      ? formatDisplayPrice(priceValue, country ? getCountryByName(country).currencySymbol : undefined)
      : price;

  const handleClick = () => {
    if (id) {
      navigate(`/listing/${id}`);
    }
  };

  const hasRealImage = image && !image.includes("placeholder") && !image.includes("unsplash");
  const hasVideo = images?.some(url => /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url));
  const imageCount = images?.filter(url => !/\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url)).length || 0;
  const videoCount = images?.filter(url => /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url)).length || 0;
  const shouldGlowImage = (business || professional || featured) && status !== "sold" && status !== "expired";
  const glowToken = business
    ? "--paid-glow-business"
    : professional
      ? "--paid-glow-professional"
      : "--paid-glow-featured";
  const imageGlowStyle: CSSProperties | undefined = shouldGlowImage
    ? {
        boxShadow: `0 0 0 1px hsl(var(${glowToken}) / 0.24), 0 0 18px 2px hsl(var(${glowToken}) / 0.28), 0 0 34px 6px hsl(var(${glowToken}) / 0.18)`,
      }
    : undefined;

  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/6] overflow-hidden rounded-t-2xl transition-all duration-300" style={imageGlowStyle}>
        {!hasRealImage ? (
          <div className="w-full h-full flex flex-col items-center justify-center bg-muted/30 gap-2">
            <img src={appLogo} alt="سوق الكل" className="w-20 h-20 object-contain opacity-60" />
            <span className="text-xs text-muted-foreground">لا توجد صورة لهذا الإعلان</span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-muted animate-pulse rounded-none" />
            )}
            <img
              src={image}
              alt={title}
              loading="lazy"
              decoding="async"
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              } ${status === "sold" || status === "expired" ? "opacity-60" : ""}`}
            />
          </>
        )}
        {status === "sold" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-lg font-bold px-6 py-2 rounded-full shadow-lg rotate-[-15deg]">
              {t.myAccount?.soldBadge || "مباع"}
            </span>
          </div>
        )}
        {status === "expired" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-muted-foreground text-background text-lg font-bold px-6 py-2 rounded-full shadow-lg rotate-[-15deg]">
              منتهي
            </span>
          </div>
        )}
        {business && status !== "sold" && status !== "expired" && (
          <>
            <div 
              className="absolute top-3 right-3 cursor-pointer transition-transform hover:scale-125 animate-diamond-glow-ring rounded-full p-1"
              onMouseEnter={() => playBadgeSound('business')}
            >
              <span className="text-2xl inline-block animate-diamond-spin">💎</span>
            </div>
            <div className="absolute top-11 right-3 bg-card/90 backdrop-blur-sm text-foreground text-[10px] font-bold px-2 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>📌</span>
              <span>مثبت</span>
            </div>
          </>
        )}
        {professional && !business && status !== "sold" && status !== "expired" && (
          <div 
            className="absolute top-3 right-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            onMouseEnter={() => playBadgeSound('professional')}
          >
            <span className="animate-pulse drop-shadow-[0_0_8px_rgba(147,51,234,0.8)]">👑</span>
            <span>احترافي</span>
          </div>
        )}
{featured && !professional && !business && status !== "sold" && status !== "expired" && (
          <div 
            className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 cursor-pointer transition-transform hover:scale-105"
            onMouseEnter={() => playBadgeSound('featured')}
          >
            <span className="animate-pulse drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">⭐</span>
            <span>{t.listings.featured}</span>
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (id) {
              toggleFavorite(id);
            }
          }}
          className="absolute top-3 left-3 w-9 h-9 bg-card/90 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110"
        >
          <Heart
            className={`h-5 w-5 transition-colors ${
              isListingFavorite ? "fill-destructive text-destructive" : "text-muted-foreground"
            }`}
          />
        </button>
        {isOwnerOnline && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] font-medium text-green-600 dark:text-green-400">متصل</span>
          </div>
        )}
        {(imageCount > 0 || videoCount > 0) && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-card/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {imageCount > 0 && (
              <div className="flex items-center gap-0.5">
                <ImageIcon className="h-3 w-3 text-muted-foreground" />
                <span className="text-[10px] font-semibold text-foreground">{imageCount}</span>
              </div>
            )}
            {videoCount > 0 && (
              <div className="flex items-center gap-0.5">
                <Video className="h-3 w-3 text-primary" />
                <span className="text-[10px] font-semibold text-foreground">{videoCount}</span>
              </div>
            )}
          </div>
        )}
        {averageRating !== undefined && averageRating > 0 && (
          <div className="absolute bottom-3 right-3 flex items-center gap-0.5 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-[11px] font-semibold text-foreground">{averageRating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
        </div>
        <div className="text-xl font-bold text-primary mb-3">{price}</div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1 min-w-0">
            <MapPin className="h-4 w-4 shrink-0" />
            <span className="truncate">{country ? `${location}، ${country}` : location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard;
