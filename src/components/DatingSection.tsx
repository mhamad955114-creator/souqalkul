import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { Heart, ArrowLeft, ArrowRight, MessageSquare, MapPin, User } from "lucide-react";
import { formatTime } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { useFavoritesContext } from "@/contexts/FavoritesContext";

interface DatingListing {
  id: string;
  title: string;
  city: string;
  created_at: string;
  category: string;
}

const detectGender = (title: string): "female" | "male" => {
  const femaleKeywords = ["فتاة", "بنت", "أنثى", "امرأة", "سيدة", "آنسة", "عروس", "زوجة", "أخت", "فتاه"];
  return femaleKeywords.some((kw) => title.includes(kw)) ? "female" : "male";
};

const DatingSection = () => {
  const [listings, setListings] = useState<DatingListing[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { dir } = useLanguage();
  const { isFavorite, toggleFavorite } = useFavoritesContext();
  const [onlineCount, setOnlineCount] = useState(0);

  // Simulate online users with realistic fluctuation
  const baseCount = useMemo(() => Math.floor(Math.random() * 30) + 15, []);
  useEffect(() => {
    setOnlineCount(baseCount);
    const interval = setInterval(() => {
      setOnlineCount((prev) => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(5, prev + change);
      });
    }, 8000);
    return () => clearInterval(interval);
  }, [baseCount]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("listings")
        .select("id, title, city, created_at, category")
        .eq("status", "active")
        .eq("category", "تعارف")
        .order("created_at", { ascending: false })
        .limit(6);

      if (data) setListings(data);
      setLoading(false);
    };
    fetch();
  }, []);

  if (!loading && listings.length === 0) return null;

  const ViewAllArrow = dir === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <section className="py-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-rose-500/5 to-purple-500/5 dark:from-pink-500/10 dark:via-rose-500/10 dark:to-purple-500/10" />
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-pink-400/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                تعارف
              </h2>
              <p className="text-muted-foreground text-sm">
                تعرّف على أشخاص جدد بطريقة آمنة
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                  {onlineCount} متصل الآن
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            className="hidden md:flex border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-950/30"
            onClick={() => navigate("/listings?category=تعارف")}
          >
            عرض الكل
            <ViewAllArrow className="h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse bg-card shadow-card">
                <div className="p-6 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-muted mx-auto" />
                  <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
                  <div className="h-3 bg-muted rounded w-1/2 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
            {listings.map((listing, index) => {
              const gender = detectGender(listing.title);
              const isLiked = isFavorite(listing.id);

              return (
                <div
                  key={listing.id}
                  className="group relative bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-2 opacity-0 animate-dating-pop animate-dating-glow"
                  style={{ animationDelay: `${index * 0.12}s`, animationFillMode: "forwards" }}
                  onClick={() => navigate(`/listing/${listing.id}`)}
                >
                  {/* Gradient top accent */}
                  <div className={`h-1.5 w-full ${gender === "female" ? "bg-gradient-to-r from-pink-400 to-rose-400" : "bg-gradient-to-r from-blue-400 to-indigo-400"}`} />
                  
                  <div className="p-5 text-center">
                    {/* Avatar */}
                    <div className={`mx-auto mb-4 rounded-full flex items-center justify-center shadow-md group-hover:animate-float ${
                      gender === "female" 
                        ? "bg-gradient-to-br from-pink-100 to-rose-100 dark:from-pink-900/40 dark:to-rose-900/40" 
                        : "bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40"
                    }`} style={{ width: 72, height: 72 }}>
                      <User className={`w-9 h-9 transition-transform duration-300 group-hover:scale-110 ${gender === "female" ? "text-pink-500" : "text-blue-500"}`} />
                    </div>
                    
                    <span className="text-2xl mb-2 block">{gender === "female" ? "👩" : "👨"}</span>

                    {/* Title */}
                    <h3 className="font-bold text-foreground line-clamp-2 mb-2 group-hover:text-primary transition-colors text-sm">
                      {listing.title}
                    </h3>

                    {/* Location & Time */}
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                      <MapPin className="h-3 w-3" />
                      <span>{listing.city}</span>
                      <span className="mx-1">·</span>
                      <span>{formatTime(listing.created_at)}</span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className={`flex-1 text-xs ${
                          gender === "female"
                            ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                            : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        } text-white border-0`}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/listing/${listing.id}`);
                        }}
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        دردشة
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="px-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(listing.id);
                        }}
                      >
                        <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-destructive text-destructive" : ""}`} />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8 md:hidden">
          <Button
            variant="outline"
            className="border-pink-300 text-pink-600 hover:bg-pink-50 dark:border-pink-700 dark:text-pink-400 dark:hover:bg-pink-950/30"
            onClick={() => navigate("/listings?category=تعارف")}
          >
            عرض الكل
            <ViewAllArrow className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DatingSection;
