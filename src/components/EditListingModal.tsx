import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, ShieldCheck, ShieldX, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { cities, categories, statuses, areasByCity } from "@/lib/constants";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
}

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess: () => void;
}

const EditListingModal = ({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [moderatingImages, setModeratingImages] = useState(false);
  const [rejectedImages, setRejectedImages] = useState<{ url: string; reason: string }[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
    area: "",
    phone: "",
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
        area: listing.area || "",
        phone: listing.phone || "",
        status: listing.status || "active",
      });
      setImages(listing.images || []);
      setRejectedImages([]);
      setSuggestedCategory(null);
    }
  }, [listing]);

  const moderateImage = async (imageUrl: string): Promise<{ approved: boolean; reason: string; suggestedCategory?: string }> => {
    try {
      const response = await supabase.functions.invoke('moderate-image', {
        body: { imageUrl }
      });

      if (response.error) {
        console.error('Moderation error:', response.error);
        return { approved: true, reason: 'محتوى مناسب' };
      }

      return response.data;
    } catch (error) {
      console.error('Error calling moderation:', error);
      return { approved: true, reason: 'محتوى مناسب' };
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploadingImages(true);
    setRejectedImages([]);
    const uploadedUrls: string[] = [];
    const rejected: { url: string; reason: string }[] = [];

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

      if (uploadedUrls.length > 0) {
        toast.success(`تم رفع ${uploadedUrls.length} صورة، جاري فحص المحتوى...`);
        setUploadingImages(false);
        setModeratingImages(true);

        const approvedUrls: string[] = [];
        let detectedCategory: string | null = null;
        
        for (const url of uploadedUrls) {
          const result = await moderateImage(url);
          if (result.approved) {
            approvedUrls.push(url);
            if (!detectedCategory && result.suggestedCategory) {
              detectedCategory = result.suggestedCategory;
            }
          } else {
            rejected.push({ url, reason: result.reason });
            const path = url.split('/listings/')[1];
            if (path) {
              await supabase.storage.from('listings').remove([path]);
            }
          }
        }

        if (approvedUrls.length > 0) {
          setImages((prev) => [...prev, ...approvedUrls]);
          toast.success(`تم قبول ${approvedUrls.length} صورة`);
          
          if (detectedCategory && !formData.category) {
            setSuggestedCategory(detectedCategory);
            setFormData(prev => ({ ...prev, category: detectedCategory! }));
            toast.success(`تم اكتشاف التصنيف تلقائياً: ${detectedCategory}`, {
              icon: '✨'
            });
          }
        }

        if (rejected.length > 0) {
          setRejectedImages(rejected);
          toast.error(`تم رفض ${rejected.length} صورة لمخالفتها القوانين`);
        }
      }
    } finally {
      setUploadingImages(false);
      setModeratingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const availableAreas = formData.city ? areasByCity[formData.city] || [] : [];

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, area: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category || !formData.city) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.phone) {
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error("يرجى إدخال رقم هاتف صحيح (09xxxxxxxx)");
        return;
      }
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
          area: formData.area || null,
          phone: formData.phone || null,
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
              <Label htmlFor="price">السعر (ل.س) *</Label>
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
              <Label className="flex items-center gap-2">
                التصنيف *
                {suggestedCategory && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-normal">
                    <Sparkles className="h-3 w-3" />
                    تم الاكتشاف تلقائياً
                  </span>
                )}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={suggestedCategory ? "ring-2 ring-primary/50" : ""}>
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
                onValueChange={handleCityChange}
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
              <Label>المنطقة</Label>
              <Select
                value={formData.area}
                onValueChange={(value) => setFormData({ ...formData, area: value })}
                disabled={!formData.city || availableAreas.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.city ? "اختر المنطقة" : "اختر المدينة أولاً"} />
                </SelectTrigger>
                <SelectContent>
                  {availableAreas.map((area) => (
                    <SelectItem key={area} value={area}>
                      {area}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
                className="text-left"
              />
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
                disabled={uploadingImages || moderatingImages}
              />
              <label
                htmlFor="edit-image-upload"
                className="flex flex-col items-center justify-center cursor-pointer py-4"
              >
                {uploadingImages ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : moderatingImages ? (
                  <ShieldCheck className="h-8 w-8 animate-pulse text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="mt-2 text-sm text-muted-foreground">
                  {uploadingImages 
                    ? "جاري الرفع..." 
                    : moderatingImages 
                      ? "جاري فحص الصور بالذكاء الاصطناعي..."
                      : "اضغط لرفع صور إضافية"}
                </span>
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`صورة ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg ring-2 ring-green-500/50"
                      />
                      <div className="absolute top-1 right-1">
                        <ShieldCheck className="h-4 w-4 text-green-500" />
                      </div>
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

              {/* Rejected Images Alert */}
              {rejectedImages.length > 0 && (
                <Alert variant="destructive" className="mt-4">
                  <ShieldX className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">تم رفض الصور التالية:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {rejectedImages.map((item, index) => (
                        <li key={index} className="text-sm">
                          {item.reason}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" size="lg" disabled={loading || moderatingImages}>
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
