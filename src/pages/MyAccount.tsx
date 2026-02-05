import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit2, Trash2, MapPin, Eye, ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import EditListingModal from "@/components/EditListingModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice, formatDate, categoryLabels, statusLabels } from "@/lib/constants";

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
  status: string | null;
  views_count: number | null;
  created_at: string;
}

const MyAccount = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/");
    }
  }, [user, authLoading, navigate]);

  const fetchListings = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        toast.error("فشل تحميل الإعلانات");
        console.error(error);
      } else {
        setListings(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [user]);

  const handleDelete = async () => {
    if (!deletingListing) return;

    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("listings")
        .delete()
        .eq("id", deletingListing.id);

      if (error) {
        toast.error("فشل حذف الإعلان: " + error.message);
      } else {
        toast.success("تم حذف الإعلان بنجاح");
        setListings((prev) => prev.filter((l) => l.id !== deletingListing.id));
      }
    } finally {
      setDeleteLoading(false);
      setDeletingListing(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header onListingAdded={fetchListings} />
      
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">إعلاناتي</h1>
            <p className="text-muted-foreground mt-1">
              إدارة جميع إعلاناتك من مكان واحد
            </p>
          </div>
          <Button onClick={() => navigate("/")} variant="outline">
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Button>
        </div>

        {/* Listings */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <Card className="py-16">
            <CardContent className="flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                لا توجد إعلانات حتى الآن
              </h3>
              <p className="text-muted-foreground mb-4">
                ابدأ بإضافة إعلانك الأول الآن
              </p>
              <Button onClick={() => navigate("/")}>
                إضافة إعلان جديد
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0">
                      <img
                        src={listing.images?.[0] || "/placeholder.svg"}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-foreground line-clamp-1">
                            {listing.title}
                          </h3>
                          <Badge variant={statusLabels[listing.status || "active"]?.variant || "default"}>
                            {statusLabels[listing.status || "active"]?.label || listing.status}
                          </Badge>
                        </div>

                        <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                          {listing.description || "لا يوجد وصف"}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {listing.city}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {listing.views_count || 0} مشاهدة
                          </span>
                          <Badge variant="outline">
                            {categoryLabels[listing.category] || listing.category}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                        <div>
                          <span className="text-xl font-bold text-primary">
                            {formatPrice(listing.price)}
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {formatDate(listing.created_at)}
                          </span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingListing(listing)}
                          >
                            <Edit2 className="h-4 w-4" />
                            تعديل
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeletingListing(listing)}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      <Footer />

      {/* Edit Modal */}
      {editingListing && (
        <EditListingModal
          isOpen={!!editingListing}
          onClose={() => setEditingListing(null)}
          listing={editingListing}
          onSuccess={() => {
            setEditingListing(null);
            fetchListings();
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingListing} onOpenChange={() => setDeletingListing(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الإعلان؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف الإعلان "{deletingListing?.title}" نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteLoading}
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف الإعلان"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAccount;
