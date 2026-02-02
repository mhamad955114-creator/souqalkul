import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useToast } from "./use-toast";

export const useFavorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's favorites
  const fetchFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("favorites")
        .select("listing_id")
        .eq("user_id", user.id);

      if (error) throw error;

      setFavorites(data?.map((f) => f.listing_id) || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a listing is in favorites
  const isFavorite = useCallback(
    (listingId: string) => {
      return favorites.includes(listingId);
    },
    [favorites]
  );

  // Toggle favorite status
  const toggleFavorite = useCallback(
    async (listingId: string) => {
      if (!user) {
        toast({
          title: "يرجى تسجيل الدخول",
          description: "يجب عليك تسجيل الدخول لإضافة الإعلانات للمفضلة",
          variant: "destructive",
        });
        return false;
      }

      const isCurrentlyFavorite = isFavorite(listingId);

      try {
        if (isCurrentlyFavorite) {
          // Remove from favorites
          const { error } = await supabase
            .from("favorites")
            .delete()
            .eq("user_id", user.id)
            .eq("listing_id", listingId);

          if (error) throw error;

          setFavorites((prev) => prev.filter((id) => id !== listingId));
          toast({
            title: "تم الإزالة من المفضلة",
            description: "تم إزالة الإعلان من قائمة المفضلة",
          });
        } else {
          // Add to favorites
          const { error } = await supabase.from("favorites").insert({
            user_id: user.id,
            listing_id: listingId,
          });

          if (error) throw error;

          setFavorites((prev) => [...prev, listingId]);
          toast({
            title: "تمت الإضافة للمفضلة",
            description: "تم إضافة الإعلان إلى قائمة المفضلة",
          });
        }

        return true;
      } catch (error) {
        console.error("Error toggling favorite:", error);
        toast({
          title: "حدث خطأ",
          description: "فشل في تحديث المفضلة",
          variant: "destructive",
        });
        return false;
      }
    },
    [user, isFavorite, toast]
  );

  return {
    favorites,
    loading,
    isFavorite,
    toggleFavorite,
    refetch: fetchFavorites,
  };
};
