import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Loader2, User, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { formatTime } from "@/lib/constants";

interface Rating {
  id: string;
  reviewer_id: string;
  seller_id: string;
  listing_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer_profile?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface RatingSectionProps {
  sellerId: string;
  listingId?: string;
  sellerName?: string;
}

const RatingSection = ({ sellerId, listingId, sellerName }: RatingSectionProps) => {
  const { user } = useAuth();
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const fetchRatings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("ratings")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch reviewer profiles
      if (data && data.length > 0) {
        const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", reviewerIds);

        const ratingsWithProfiles = data.map(rating => ({
          ...rating,
          reviewer_profile: profiles?.find(p => p.user_id === rating.reviewer_id) || null,
        }));

        setRatings(ratingsWithProfiles);
        
        // Calculate average
        const sum = data.reduce((acc, r) => acc + r.rating, 0);
        setAverageRating(sum / data.length);
        setTotalRatings(data.length);
      } else {
        setRatings([]);
        setAverageRating(0);
        setTotalRatings(0);
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [sellerId]);

  const handleSubmitRating = async () => {
    if (!user) {
      toast.error("يجب تسجيل الدخول لإضافة تقييم");
      return;
    }

    if (newRating === 0) {
      toast.error("يرجى اختيار تقييم");
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("ratings").insert({
        reviewer_id: user.id,
        seller_id: sellerId,
        listing_id: listingId || null,
        rating: newRating,
        comment: comment.trim() || null,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("لقد قمت بتقييم هذا البائع مسبقاً");
        } else {
          throw error;
        }
        return;
      }

      toast.success("تم إضافة التقييم بنجاح");
      setNewRating(0);
      setComment("");
      setShowForm(false);
      fetchRatings();
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("فشل إضافة التقييم");
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ 
    rating, 
    size = "md", 
    interactive = false,
    onRate,
    onHover,
  }: { 
    rating: number; 
    size?: "sm" | "md" | "lg";
    interactive?: boolean;
    onRate?: (rating: number) => void;
    onHover?: (rating: number) => void;
  }) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-7 w-7",
    };

    return (
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onRate?.(star)}
            onMouseEnter={() => onHover?.(star)}
            onMouseLeave={() => onHover?.(0)}
            className={`${interactive ? "cursor-pointer transition-transform hover:scale-110 active:scale-125" : "cursor-default"} p-1`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= rating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  const getInitials = (name: string | null): string => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const canRate = user && user.id !== sellerId;
  const hasAlreadyRated = ratings.some(r => r.reviewer_id === user?.id);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
            تقييمات البائع
          </span>
          {totalRatings > 0 && (
            <div className="flex items-center gap-2 text-base font-normal">
              <StarRating rating={Math.round(averageRating)} size="sm" />
              <span className="text-foreground font-semibold">
                {averageRating.toFixed(1)}
              </span>
              <span className="text-muted-foreground">
                ({totalRatings} تقييم)
              </span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Rating Form */}
        {canRate && !hasAlreadyRated && (
          <div className="space-y-3">
            {!showForm ? (
              <Button
                variant="outline"
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                <Star className="h-4 w-4" />
                أضف تقييمك
              </Button>
            ) : (
              <div className="p-4 bg-muted/50 rounded-lg space-y-3">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    كيف كانت تجربتك مع {sellerName || "البائع"}؟
                  </span>
                  <StarRating
                    rating={hoverRating || newRating}
                    size="lg"
                    interactive
                    onRate={setNewRating}
                    onHover={setHoverRating}
                  />
                </div>
                
                <Textarea
                  placeholder="اكتب تعليقك (اختياري)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="resize-none"
                  rows={3}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitRating}
                    disabled={submitting || newRating === 0}
                    className="flex-1"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        جاري الإرسال...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        إرسال التقييم
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setNewRating(0);
                      setComment("");
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {hasAlreadyRated && (
          <p className="text-sm text-muted-foreground text-center py-2">
            لقد قمت بتقييم هذا البائع مسبقاً
          </p>
        )}

        {/* Ratings List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 text-muted" />
            <p>لا توجد تقييمات بعد</p>
            {canRate && (
              <p className="text-sm mt-1">كن أول من يقيّم هذا البائع!</p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <div
                key={rating.id}
                className="flex gap-3 p-3 bg-muted/30 rounded-lg"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarImage src={rating.reviewer_profile?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(rating.reviewer_profile?.full_name || null)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium text-foreground truncate">
                      {rating.reviewer_profile?.full_name || "مستخدم"}
                    </span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatTime(rating.created_at)}
                    </span>
                  </div>
                  <StarRating rating={rating.rating} size="sm" />
                  {rating.comment && (
                    <p className="text-sm text-muted-foreground mt-2">
                      {rating.comment}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RatingSection;
