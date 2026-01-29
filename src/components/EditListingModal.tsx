import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  city: string;
  images: string[] | null;
  status: string | null;
}

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess: () => void;
}

const categories = [
  { value: "cars", label: "سيارات" },
  { value: "real_estate", label: "عقارات" },
  { value: "electronics", label: "إلكترونيات" },
  { value: "clothing", label: "ملابس" },
  { value: "furniture", label: "أثاث" },
  { value: "jobs", label: "وظائف" },
  { value: "games", label: "ألعاب" },
  { value: "services", label: "خدمات" },
];

const cities = [
  "الرياض",
  "جدة",
  "مكة المكرمة",
  "المدينة المنورة",
  "الدمام",
  "الخبر",
  "الطائف",
  "تبوك",
  "أبها",
  "القطيف",
];

const statuses = [
  { value: "active", label: "نشط" },
  { value: "sold", label: "تم البيع" },
  { value: "expired", label: "منتهي" },
];

const EditListingModal = ({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
    status: "",
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (listing) {
      setFormData({
        title: listing.title,
        description: listing.description || "",
        price: listing.price.toString(),
        category: listing.category,
        city: listing.city,
        status: listing.status || "active",
      });
      setImages(listing.images || []);
    }
  }, [listing]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(fileName, file);

        if (uploadError) {
          toast.error("فشل رفع الصورة: " + uploadError.message);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("listings")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
      toast.success(`تم رفع ${uploadedUrls.length} صورة بنجاح`);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category || !formData.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("listings")
        .update({
          title: formData.title,
          description: formData.description || null,
          price: parseFloat(formData.price),
          category: formData.category,
          city: formData.city,
          status: formData.status,
          images: images,
        })
        .eq("id", listing.id);

      if (error) {
        toast.error("فشل تحديث الإعلان: " + error.message);
      } else {
        toast.success("تم تحديث الإعلان بنجاح!");
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">تعديل الإعلان</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الإعلان *</Label>
            <Input
              id="title"
              placeholder="أدخل عنوان الإعلان"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              placeholder="أدخل وصف تفصيلي للإعلان"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">السعر (ر.س) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="0.00"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label>التصنيف *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر التصنيف" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>المدينة *</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر المدينة" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>حالة الإعلان</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images Section */}
          <div className="space-y-2">
            <Label>صور الإعلان</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                id="edit-image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="edit-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-4"
              >
                {uploadingImages ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="mt-2 text-sm text-muted-foreground">
                  {uploadingImages ? "جاري الرفع..." : "اضغط لرفع صور إضافية"}
                </span>
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-1 left-1 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  جاري التحديث...
                </>
              ) : (
                "حفظ التغييرات"
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditListingModal;
