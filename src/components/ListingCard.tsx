import { Heart, MapPin, Clock, Hash, User, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFavoritesContext } from "@/contexts/FavoritesContext";
import { useLanguage } from "@/contexts/LanguageContext";
import appLogo from "@/assets/logo.png";

interface ListingCardProps {
  id?: string;
  image: string;
  title: string;
  price: string;
  location: string;
  time: string;
  featured?: boolean;
  status?: string;
  category?: string;
}

const detectGender = (title: string): "female" | "male" => {
  const femaleKeywords = ["فتاة", "بنت", "أنثى", "امرأة", "سيدة", "آنسة", "عروس", "زوجة", "أخت", "فتاه"];
  const isFemale = femaleKeywords.some((kw) => title.includes(kw));
  return isFemale ? "female" : "male";
};

const DatingPlaceholder = ({ gender }: { gender: "female" | "male" }) => (
  <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-muted/50 to-muted">
    <div className="flex flex-col items-center gap-2 text-muted-foreground">
      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${gender === "female" ? "bg-pink-100 text-pink-400" : "bg-blue-100 text-blue-400"}`}>
        <User className="w-10 h-10" />
      </div>
      <span className={`text-xs font-medium ${gender === "female" ? "text-pink-400" : "text-blue-400"}`}>
        {gender === "female" ? "👩" : "👨"}
      </span>
    </div>
  </div>
);

const ListingCard = ({ id, image, title, price, location, time, featured, status, category }: ListingCardProps) => {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const { t } = useLanguage();
  const isListingFavorite = id ? isFavorite(id) : false;

  const handleClick = () => {
    if (id) {
      navigate(`/listing/${id}`);
    }
  };

  return (
    <div 
      className="group bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
      onClick={handleClick}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {category === "تعارف" && (!image || image.includes("unsplash")) ? (
          <DatingPlaceholder gender={detectGender(title)} />
        ) : !image || image.includes("placeholder") || image.includes("unsplash") ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <img src={appLogo} alt="سوق الكل" className="w-20 h-20 object-contain opacity-60" />
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${status === "sold" || status === "expired" ? "opacity-60" : ""}`}
          />
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
        {featured && status !== "sold" && status !== "expired" && (
          <div className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span>⭐</span>
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
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors flex-1">
            {title}
          </h3>
        </div>
        {id && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
            <Hash className="h-3 w-3" />
            <span dir="ltr">{id.split("-")[0].toUpperCase()}</span>
          </div>
        )}
        <div className="text-xl font-bold text-primary mb-3">{price}</div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>{location}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{time}</span>
          </div>
        </div>
        {category === "تعارف" && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (id) navigate(`/listing/${id}`);
            }}
            className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <MessageSquare className="h-4 w-4" />
            دردشة
          </button>
        )}
      </div>
    </div>
  );
};

export default ListingCard;
