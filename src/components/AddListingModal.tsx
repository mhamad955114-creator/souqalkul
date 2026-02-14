import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, X, Star, Gift, ShieldCheck, ShieldX, Sparkles, MapPin, Wallet, Heart, Video } from "lucide-react";
import { cities, categories, areasByCity, formatPrice } from "@/lib/constants";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useWallet } from "@/hooks/useWallet";
import { useListingSettings } from "@/hooks/useListingSettings";
import { useNavigate } from "react-router-dom";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddListingModal = ({ isOpen, onClose, onSuccess }: AddListingModalProps) => {
  const { user } = useAuth();
  const { t, dir } = useLanguage();
  const { wallet, payFromWallet } = useWallet();
  const { settings } = useListingSettings();
  const navigate = useNavigate();
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
    is_featured: false,
  });
  const [images, setImages] = useState<string[]>([]);

  const moderateImage = async (imageUrl: string): Promise<{ approved: boolean; reason: string; suggestedCategory?: string }> => {
    try {
      const response = await supabase.functions.invoke('moderate-image', {
        body: { imageUrl }
      });

      if (response.error) {
        console.error('Moderation error:', response.error);
        return { approved: true, reason: '' };
      }

      return response.data;
    } catch (error) {
      console.error('Error calling moderation:', error);
      return { approved: true, reason: '' };
    }
  };

  const isVideoFile = (file: File) => file.type.startsWith("video/");
  const isVideoUrl = (url: string) => /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploadingImages(true);
    setRejectedImages([]);
    setSuggestedCategory(null);
    const uploadedUrls: string[] = [];
    const uploadedVideoUrls: string[] = [];
    const rejected: { url: string; reason: string }[] = [];

    try {
      for (const file of Array.from(e.target.files)) {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Video size limit: 50MB
        if (isVideoFile(file) && file.size > 50 * 1024 * 1024) {
          toast.error("حجم الفيديو يجب أن لا يتجاوز 50 ميجابايت");
          continue;
        }

        const { error: uploadError } = await supabase.storage
          .from("listings")
          .upload(fileName, file);

        if (uploadError) {
          toast.error(t.listingForm.uploadFailed + ": " + uploadError.message);
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("listings")
          .getPublicUrl(fileName);

        if (isVideoFile(file)) {
          uploadedVideoUrls.push(publicUrl);
        } else {
          uploadedUrls.push(publicUrl);
        }
      }

      // Add videos directly (no moderation for videos)
      if (uploadedVideoUrls.length > 0) {
        setImages((prev) => [...prev, ...uploadedVideoUrls]);
        toast.success(`تم رفع ${uploadedVideoUrls.length} فيديو بنجاح`);
      }

      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} ${t.listingForm.uploadedChecking}`);
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
          toast.success(`${approvedUrls.length} ${t.listingForm.imagesApproved}`);
          
          if (detectedCategory && !formData.category) {
            setSuggestedCategory(detectedCategory);
            setFormData(prev => ({ ...prev, category: detectedCategory! }));
            toast.success(`${t.listingForm.categoryDetected}: ${detectedCategory}`, {
              icon: '✨'
            });
          }
        }

        if (rejected.length > 0) {
          setRejectedImages(rejected);
          toast.error(`${rejected.length} ${t.listingForm.imagesRejected}`);
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

  const isDatingCategory = formData.category === "تعارف";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // For dating category, phone is not required
    if (isDatingCategory) {
      if (!formData.title || !formData.price || !formData.category || !formData.city) {
        toast.error(t.listingForm.requiredFields);
        return;
      }
    } else {
      if (!formData.title || !formData.price || !formData.category || !formData.city || !formData.phone) {
        toast.error(t.listingForm.requiredFields);
        return;
      }

      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error(t.listingForm.invalidPhone);
        return;
      }
    }

    setLoading(true);

    try {
      // Dating category is always paid, or if featured is selected
      const needsPayment = isDatingCategory || formData.is_featured;
      if (needsPayment) {
        const paymentAmount = isDatingCategory && !formData.is_featured 
          ? (settings.dating_listing.price || 25000) 
          : (settings.featured_listing.price || 50000);
        const paymentDesc = isDatingCategory && !formData.is_featured ? "رسوم نشر إعلان تعارف" : "ترويج إعلان مميز";
        try {
          await payFromWallet(paymentAmount, isDatingCategory ? "dating" : "promotion", paymentDesc);
        } catch (err: any) {
          if (err.message?.includes("Insufficient balance")) {
            toast.error("رصيد المحفظة غير كافٍ! يرجى شحن المحفظة أولاً", {
              action: { label: "شحن المحفظة", onClick: () => { onClose(); navigate("/wallet"); } },
            });
          } else {
            toast.error("فشل في الدفع: " + (err.message || "خطأ غير معروف"));
          }
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        city: formData.city,
        area: formData.area || null,
        phone: isDatingCategory ? null : formData.phone,
        images: images,
        is_featured: formData.is_featured,
      });

      if (error) {
        toast.error(t.listingForm.addError + ": " + error.message);
      } else {
        toast.success(t.listingForm.addSuccess);
        resetForm();
        onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      city: "",
      area: "",
      phone: "",
      is_featured: false,
    });
    setImages([]);
    setRejectedImages([]);
    setSuggestedCategory(null);
  };

  const { loading: geoLoading, detectLocation } = useGeolocation();

  const availableAreas = formData.city ? areasByCity[formData.city] || [] : [];

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, area: "" });
  };

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      setFormData(prev => ({ ...prev, city: result.city, area: result.area || "" }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.listingForm.addTitle}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t.listingForm.titleLabel} *</Label>
            <Input
              id="title"
              placeholder={t.listingForm.titlePlaceholder}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t.listingForm.description}</Label>
            <Textarea
              id="description"
              placeholder={t.listingForm.descriptionPlaceholder}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">{t.listingForm.price} *</Label>
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
                {t.listingForm.category} *
                {suggestedCategory && (
                  <span className="inline-flex items-center gap-1 text-xs text-primary font-normal">
                    <Sparkles className="h-3 w-3" />
                    {t.listingForm.autoDetected}
                  </span>
                )}
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className={suggestedCategory ? "ring-2 ring-primary/50" : ""}>
                  <SelectValue placeholder={t.listingForm.selectCategory} />
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
              <div className="flex items-center justify-between">
                <Label>{t.listingForm.city} *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-primary"
                  onClick={handleDetectLocation}
                  disabled={geoLoading}
                >
                  {geoLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <MapPin className="h-3 w-3" />
                  )}
                  {t.listingForm.myLocation}
                </Button>
              </div>
              <Select
                value={formData.city}
                onValueChange={handleCityChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.listingForm.selectCity} />
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
              <Label>{t.listingForm.area}</Label>
              <Select
                value={formData.area}
                onValueChange={(value) => setFormData({ ...formData, area: value })}
                disabled={!formData.city || availableAreas.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.city ? t.listingForm.selectArea : t.listingForm.selectCityFirst} />
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

          {/* Phone - hidden for dating category */}
          {!isDatingCategory && (
            <div className="space-y-2">
              <Label htmlFor="phone">{t.listingForm.phone} *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                dir="ltr"
                className={dir === "rtl" ? "text-left" : "text-left"}
              />
            </div>
          )}

          {/* Dating category notice */}
          {isDatingCategory && (
            <Alert className="border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30">
              <Heart className="h-4 w-4 text-rose-500" />
              <AlertDescription>
                <div className="font-medium text-rose-700 dark:text-rose-300">إعلانات التعارف مدفوعة</div>
                <div className="text-sm text-rose-600 dark:text-rose-400 mt-1">
                  سيتم خصم {formatPrice(settings.dating_listing.price || 25000)} من رصيد محفظتك. التواصل يتم فقط عبر الدردشة الداخلية للتطبيق.
                </div>
                <div className="text-sm mt-1">
                  <span className="font-medium">رصيدك: </span>
                  <span className={wallet && wallet.balance >= (settings.dating_listing.price || 25000) ? "text-green-600" : "text-red-600"}>
                    {formatPrice(wallet?.balance || 0)}
                  </span>
                  {wallet && wallet.balance < (settings.dating_listing.price || 25000) && (
                    <Button type="button" variant="link" size="sm" className="text-primary p-0 mr-2" onClick={() => { onClose(); navigate("/wallet"); }}>
                      شحن المحفظة
                    </Button>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Ad Type Section */}
          <div className="space-y-3">
            <Label>{t.listingForm.adType} *</Label>
            <RadioGroup
              value={formData.is_featured ? "paid" : "free"}
              onValueChange={(value) => setFormData({ ...formData, is_featured: value === "paid" })}
              className="grid grid-cols-2 gap-4"
            >
              <div className="relative">
                <RadioGroupItem value="free" id="free" className="peer sr-only" />
                <label
                  htmlFor="free"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 cursor-pointer transition-all"
                >
                  <Gift className="h-8 w-8 text-green-500" />
                  <span className="font-semibold">{t.listingForm.freeAd}</span>
                  <span className="text-xs text-muted-foreground text-center">{t.listingForm.freeAdDesc}</span>
                </label>
              </div>
              <div className="relative">
                <RadioGroupItem value="paid" id="paid" className="peer sr-only" />
                <label
                  htmlFor="paid"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-amber-500 peer-data-[state=checked]:bg-amber-500/5 cursor-pointer transition-all"
                >
                  <Star className="h-8 w-8 text-amber-500" />
                  <span className="font-semibold">{t.listingForm.paidAd}</span>
                  <span className="text-xs text-muted-foreground text-center">{t.listingForm.paidAdDesc}</span>
                </label>
              </div>
            </RadioGroup>

            {/* Wallet balance info when featured is selected */}
            {formData.is_featured && (
              <Alert className="mt-3">
                <Wallet className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">سعر الترويج: </span>
                    <span>{formatPrice(settings.featured_listing.price || 50000)}</span>
                    <span className="mx-2">|</span>
                    <span className="font-medium">رصيدك: </span>
                    <span className={wallet && wallet.balance >= (settings.featured_listing.price || 50000) ? "text-green-600" : "text-red-600"}>
                      {formatPrice(wallet?.balance || 0)}
                    </span>
                  </div>
                  {wallet && wallet.balance < (settings.featured_listing.price || 50000) && (
                    <Button type="button" variant="link" size="sm" className="text-primary p-0" onClick={() => { onClose(); navigate("/wallet"); }}>
                      شحن المحفظة
                    </Button>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              {t.listingForm.images}
              <span className="text-xs text-muted-foreground">(صور وفيديو)</span>
            </Label>
            <div className="border-2 border-dashed border-border rounded-lg p-4">
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/mov"
                multiple
                onChange={handleMediaUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages || moderatingImages}
              />
              <label
                htmlFor="image-upload"
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
                    ? t.listingForm.uploading 
                    : moderatingImages 
                      ? t.listingForm.moderating
                      : "اضغط لرفع صور أو فيديو"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">حجم الفيديو: 50 ميجابايت كحد أقصى</span>
              </label>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      {isVideoUrl(url) ? (
                        <div className="w-full h-20 rounded-lg bg-muted flex items-center justify-center ring-2 ring-primary/50">
                          <Video className="h-6 w-6 text-primary" />
                        </div>
                      ) : (
                        <img
                          src={url}
                          alt={`${index + 1}`}
                          className="w-full h-20 object-cover rounded-lg ring-2 ring-green-500/50"
                        />
                      )}
                      <div className="absolute top-1 right-1">
                        {isVideoUrl(url) ? (
                          <Video className="h-4 w-4 text-primary" />
                        ) : (
                          <ShieldCheck className="h-4 w-4 text-green-500" />
                        )}
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
                    <div className="font-semibold mb-2">{t.listingForm.rejectedImages}</div>
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
                  {t.listingForm.publishing}
                </>
              ) : (
                t.listingForm.publishAd
              )}
            </Button>
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {t.listingForm.cancel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddListingModal;
