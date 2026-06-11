import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { uploadToB2 } from "@/lib/b2Upload";
import { toast } from "sonner";
import { Loader2, Upload, X, Star, ShieldCheck, ShieldX, Sparkles, MapPin, Video, Check, ChevronsUpDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { categories, areasByCity, countries, getCitiesByCountry, getCountryByName } from "@/lib/constants";
import { useCategoryDefinitions } from "@/hooks/useCategoryDefinitions";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useAreaSuggestions, filterAreaSuggestions } from "@/hooks/useAreaSuggestions";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountry } from "@/contexts/CountryContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationConsentDialog } from "@/components/LocationConsentDialog";

import { useListingSettings } from "@/hooks/useListingSettings";
import { useNavigate } from "react-router-dom";
import { getEffectivePlanType } from "@/lib/subscriptions";

interface AddListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddListingModal = ({ isOpen, onClose, onSuccess }: AddListingModalProps) => {
  const { user } = useAuth();
  const { t, dir, language } = useLanguage();
  const { settings } = useListingSettings();
  const { currentCountry } = useCountry();
  const navigate = useNavigate();
  const { getFields, shouldHideField, getFieldOptions } = useCategoryDefinitions();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [moderatingImages, setModeratingImages] = useState(false);
  const [rejectedImages, setRejectedImages] = useState<{ url: string; reason: string }[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [remainingListings, setRemainingListings] = useState<{ remaining: number; max: number; planName: string } | null>(null);
  const [currentPlan, setCurrentPlan] = useState<"free" | "featured" | "professional" | "business">("free");
  const [selectedCountry, setSelectedCountry] = useState(currentCountry.name);
  const [priceCurrency, setPriceCurrency] = useState<"local" | "usd">("local");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
    area: "",
    phone: "",
  });
  const [images, setImages] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const getUserPlan = async () => {
    if (!user) return "free" as const;

    const { data, error } = await supabase
      .from("user_subscriptions")
      .select("plan_type, status, expires_at, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) throw error;

    return getEffectivePlanType(data || []) as "free" | "featured" | "professional" | "business";
  };

  const getPlanMaxImages = (plan: "free" | "featured" | "professional" | "business") => {
    if (plan === "business") return settings.business_listing.max_images || settings.free_listing.max_images || 5;
    if (plan === "professional") return settings.professional_listing.max_images || settings.free_listing.max_images || 5;
    if (plan === "featured") return settings.featured_listing.max_images || settings.free_listing.max_images || 5;
    return settings.free_listing.max_images || 5;
  };

  // Fetch remaining listings count when modal opens
  useEffect(() => {
    if (!isOpen || !user) return;
    const fetchRemaining = async () => {
      try {
        const userPlan = await getUserPlan();
        setCurrentPlan(userPlan);
        const planNames: Record<string, string> = { free: "المجانية", featured: "المميزة", professional: "الاحترافية", business: "رجال الأعمال" };
        let maxActive: number;
        if (userPlan === "business") maxActive = settings.business_listing.max_active_listings;
        else if (userPlan === "professional") maxActive = settings.professional_listing.max_active_listings;
        else if (userPlan === "featured") maxActive = settings.featured_listing.max_active_listings;
        else maxActive = settings.free_listing.max_active_listings;

        if (maxActive === -1) {
          setRemainingListings({ remaining: -1, max: -1, planName: planNames[userPlan] || userPlan });
        } else {
          const { count } = await supabase
            .from("listings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("status", "active");
          setRemainingListings({ remaining: maxActive - (count ?? 0), max: maxActive, planName: planNames[userPlan] || userPlan });
        }
      } catch (err) {
        console.error("Error fetching remaining listings:", err);
      }
    };
    fetchRemaining();
  }, [isOpen, user, settings]);

  const currentMetadataFields = getFields(formData.category).filter(
    (field) => !shouldHideField(field.key, formData.category, metadata)
  );
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

  const moderateVideo = async (videoUrl: string): Promise<{ approved: boolean; reason: string }> => {
    try {
      const response = await supabase.functions.invoke('moderate-video', {
        body: { videoUrl }
      });

      if (response.error) {
        console.error('Video moderation error:', response.error);
        return { approved: true, reason: '' };
      }

      return response.data;
    } catch (error) {
      console.error('Error calling video moderation:', error);
      return { approved: true, reason: '' };
    }
  };

  const isVideoFile = (file: File) => file.type.startsWith("video/");
  const isVideoUrl = (url: string) => /\.(mp4|webm|mov|avi|mkv)(\?|$)/i.test(url);

  const maxImages = getPlanMaxImages(currentPlan);

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    // Enforce max images limit
    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(`الحد الأقصى للصور هو ${maxImages} للباقة المختارة`);
      return;
    }
    if (e.target.files.length > remainingSlots) {
      toast.error(`يمكنك رفع ${remainingSlots} صور/فيديو إضافية فقط (الحد الأقصى: ${maxImages})`);
      return;
    }

    setUploadingImages(true);
    setRejectedImages([]);
    setSuggestedCategory(null);
    const uploadedUrls: string[] = [];
    const uploadedVideoUrls: string[] = [];
    const rejected: { url: string; reason: string }[] = [];

    try {
      // Prepare files: compress images and validate videos
      const preparedFiles: File[] = [];
      for (let file of Array.from(e.target.files)) {
        if (!isVideoFile(file)) {
          file = await compressImage(file);
        }
        if (isVideoFile(file) && file.size > 15 * 1024 * 1024) {
          toast.error("حجم الفيديو يجب أن لا يتجاوز 15 ميجابايت");
          continue;
        }
        preparedFiles.push(file);
      }

      // Upload all files in parallel for speed
      const uploadResults = await Promise.allSettled(
        preparedFiles.map(async (file) => {
          const publicUrl = await uploadToB2(file, `listings/${user.id}`, file.name);
          return { url: publicUrl, isVideo: isVideoFile(file) };
        })
      );

      for (const result of uploadResults) {
        if (result.status === 'fulfilled') {
          if (result.value.isVideo) {
            uploadedVideoUrls.push(result.value.url);
          } else {
            uploadedUrls.push(result.value.url);
          }
        } else {
          toast.error(t.listingForm.uploadFailed + ": " + (result.reason?.message || "Upload failed"));
        }
      }

      // Moderate videos with AI
      if (uploadedVideoUrls.length > 0) {
        toast.success(`تم رفع ${uploadedVideoUrls.length} فيديو، جاري فحص المحتوى...`);
        setModeratingImages(true);

        const videoResults = await Promise.allSettled(
          uploadedVideoUrls.map(async (url) => {
            const result = await moderateVideo(url);
            return { url, result };
          })
        );

        for (const r of videoResults) {
          if (r.status === 'fulfilled') {
            if (r.value.result.approved) {
              setImages((prev) => [...prev, r.value.url]);
              toast.success("تم قبول الفيديو ✅");
            } else {
              rejected.push({ url: r.value.url, reason: r.value.result.reason || "محتوى الفيديو مخالف" });
            }
          }
        }

        if (rejected.length > 0) {
          setRejectedImages(prev => [...prev, ...rejected]);
          toast.error(`تم رفض ${rejected.length} فيديو لمخالفة المحتوى`);
        }
      }

      if (uploadedUrls.length > 0) {
        toast.success(`${uploadedUrls.length} ${t.listingForm.uploadedChecking}`);
        setUploadingImages(false);
        setModeratingImages(true);

        const approvedUrls: string[] = [];
        let detectedCategory: string | null = null;
        
        const imageResults = await Promise.allSettled(
          uploadedUrls.map(async (url) => {
            const result = await moderateImage(url);
            return { url, result };
          })
        );

        for (const r of imageResults) {
          if (r.status === 'fulfilled') {
            if (r.value.result.approved) {
              approvedUrls.push(r.value.url);
              if (!detectedCategory && r.value.result.suggestedCategory) {
                detectedCategory = r.value.result.suggestedCategory;
              }
            } else {
              rejected.push({ url: r.value.url, reason: r.value.result.reason });
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

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.price || !formData.category || !formData.city || !formData.phone) {
      toast.error(t.listingForm.requiredFields);
      return;
    }

    if (formData.title.trim().length < 3) {
      toast.error("عنوان الإعلان يجب أن يكون 3 أحرف على الأقل");
      return;
    }

    if (formData.title.trim().length > 200) {
      toast.error("عنوان الإعلان يجب أن يكون أقل من 200 حرف");
      return;
    }

    // Check active listings limit based on user's plan
    try {
      const userPlan = await getUserPlan();
      setCurrentPlan(userPlan);
      
      let maxActive: number;
      if (userPlan === "business") {
        maxActive = settings.business_listing.max_active_listings;
      } else if (userPlan === "professional") {
        maxActive = settings.professional_listing.max_active_listings;
      } else if (userPlan === "featured") {
        maxActive = settings.featured_listing.max_active_listings;
      } else {
        maxActive = settings.free_listing.max_active_listings;
      }

      // -1 means unlimited
      if (maxActive !== -1) {
        const { count } = await supabase
          .from("listings")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("status", "active");

        if ((count ?? 0) >= maxActive) {
          toast.error(`لقد وصلت للحد الأقصى من الإعلانات النشطة (${maxActive}). قم بترقية باقتك لنشر المزيد.`, {
            action: { label: "ترقية الباقة", onClick: () => { onClose(); navigate("/pricing"); } },
          });
          return;
        }
      }
    } catch (err) {
      console.error("Error checking active listings limit:", err);
    }

    const countryInfo = getCountryByName(selectedCountry);
    // Normalize phone: convert Arabic-Indic digits to ASCII, strip spaces/dashes/parentheses,
    // remove leading + and country code so user can paste any common format.
    const arabicToEn = (s: string) =>
      s.replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
       .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));
    let normalizedPhone = arabicToEn(formData.phone).replace(/[\s\-()]/g, "");
    const dialCode = countryInfo.phoneCode.replace("+", "");
    if (normalizedPhone.startsWith("+")) normalizedPhone = normalizedPhone.slice(1);
    if (normalizedPhone.startsWith("00" + dialCode)) normalizedPhone = normalizedPhone.slice(2 + dialCode.length);
    else if (normalizedPhone.startsWith(dialCode)) normalizedPhone = normalizedPhone.slice(dialCode.length);
    // Try with and without leading 0
    const altPhone = normalizedPhone.startsWith("0") ? normalizedPhone.slice(1) : "0" + normalizedPhone;
    if (!countryInfo.phonePattern.test(normalizedPhone) && !countryInfo.phonePattern.test(altPhone)) {
      toast.error(`رقم الهاتف غير صالح لـ ${selectedCountry}. الصيغة: ${countryInfo.phonePlaceholder}`);
      return;
    }
    const finalPhone = countryInfo.phonePattern.test(normalizedPhone) ? normalizedPhone : altPhone;
    formData.phone = finalPhone;

    // Validate metadata fields are filled for the selected category
    const requiredMetaFields = getFields(formData.category).filter(
      (field) => !shouldHideField(field.key, formData.category, metadata)
    );
    const missingMetaFields = requiredMetaFields.filter(field => !metadata[field.key]?.trim());
    if (missingMetaFields.length > 0) {
      toast.error(`يرجى ملء جميع تفاصيل الإعلان: ${missingMetaFields.map(f => f.label).join('، ')}`);
      return;
    }

    setLoading(true);

    try {
      const countryInfo = getCountryByName(selectedCountry);

      // Determine badge_type from active subscription
      let autoBadgeType: string | null = null;
      let autoIsFeatured = false;
      const userPlan = await getUserPlan();
      setCurrentPlan(userPlan);
      if (userPlan === "business") {
        autoBadgeType = "business";
        autoIsFeatured = true;
      } else if (userPlan === "professional") {
        autoBadgeType = "professional";
        autoIsFeatured = true;
      } else if (userPlan === "featured") {
        autoBadgeType = "featured";
        autoIsFeatured = true;
      }

      const { error } = await supabase.from("listings").insert({
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        city: formData.city,
        area: formData.area || null,
        phone: formData.phone,
        images: images,
        is_featured: autoIsFeatured,
        status: "active",
        badge_type: autoBadgeType,
        metadata: Object.keys(metadata).length > 0 ? metadata : null,
        country: selectedCountry,
        currency: priceCurrency === "usd" ? "USD" : countryInfo.currencyCode,
      } as any);

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
    });
    setImages([]);
    setMetadata({});
    setRejectedImages([]);
    setSuggestedCategory(null);
    setPriceCurrency("local");
  };

  const { loading: geoLoading, detectLocation } = useGeolocation();
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [areaSuggestionsOpen, setAreaSuggestionsOpen] = useState(false);

  const countryCities = getCitiesByCountry(selectedCountry);
  const availableAreas = formData.city ? areasByCity[formData.city] || [] : [];
  const countryInfo = getCountryByName(selectedCountry);
  const isCustomCity = !!formData.city && availableAreas.length === 0;
  const { suggestions: areaSuggestions, loading: areaSuggestionsLoading } =
    useAreaSuggestions(isCustomCity ? formData.city : "", selectedCountry, language);
  const filteredAreaSuggestions = filterAreaSuggestions(areaSuggestions, formData.area, 8);

  const handleCountryChange = (name: string) => {
    setSelectedCountry(name);
    setFormData(prev => ({ ...prev, city: "", area: "" }));
  };

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, area: "" });
  };

  const [locationConsentOpen, setLocationConsentOpen] = useState(false);

  const runDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      if (result.country && result.country !== selectedCountry) {
        setSelectedCountry(result.country);
      }
      setFormData(prev => ({ ...prev, city: result.city, area: result.area || "" }));
    }
  };

  const handleDetectLocation = () => {
    // Skip the consent dialog if user already granted it once in this browser
    if (localStorage.getItem("location-consent") === "granted") {
      runDetectLocation();
      return;
    }
    setLocationConsentOpen(true);
  };

  const handleLocationAllow = () => {
    localStorage.setItem("location-consent", "granted");
    setLocationConsentOpen(false);
    runDetectLocation();
  };

  const handleLocationDeny = () => {
    setLocationConsentOpen(false);
  };

  const handleLocationManual = () => {
    setLocationConsentOpen(false);
    // Open the city picker so user can start typing right away
    setTimeout(() => setCityPopoverOpen(true), 50);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85dvh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.listingForm.addTitle}</DialogTitle>
        </DialogHeader>

        {remainingListings && (
          <Alert className={remainingListings.remaining === -1 ? "border-primary/30 bg-primary/5" : remainingListings.remaining <= 0 ? "border-destructive/30 bg-destructive/5" : remainingListings.remaining <= 2 ? "border-orange-500/30 bg-orange-500/5" : "border-primary/30 bg-primary/5"}>
            <AlertDescription className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary shrink-0" />
              {remainingListings.remaining === -1 ? (
                <span>باقتك: <strong>{remainingListings.planName}</strong> — إعلانات غير محدودة</span>
              ) : remainingListings.remaining <= 0 ? (
                <span>وصلت للحد الأقصى ({remainingListings.max} إعلان) في الباقة {remainingListings.planName}. <button type="button" onClick={() => { onClose(); navigate("/pricing"); }} className="underline text-primary font-medium">ترقية الباقة</button></span>
              ) : (
                <span>باقتك: <strong>{remainingListings.planName}</strong> — متبقي <strong>{remainingListings.remaining}</strong> من {remainingListings.max} إعلان</span>
              )}
            </AlertDescription>
          </Alert>
        )}

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
              <Label htmlFor="price">
                {t.listingForm.price.split("(")[0]}({priceCurrency === "usd" ? "$" : countryInfo.currencySymbol}) *
              </Label>
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                  min="0"
                  step="0.01"
                  className="flex-1"
                />
                <div className="flex rounded-md border border-input overflow-hidden shrink-0">
                  <button
                    type="button"
                    onClick={() => setPriceCurrency("local")}
                    className={`px-3 text-xs font-bold transition-colors ${
                      priceCurrency === "local"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    aria-pressed={priceCurrency === "local"}
                  >
                    {countryInfo.currencySymbol}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriceCurrency("usd")}
                    className={`px-3 text-xs font-bold transition-colors border-r border-input ${
                      priceCurrency === "usd"
                        ? "bg-primary text-primary-foreground"
                        : "bg-background text-muted-foreground hover:bg-muted"
                    }`}
                    aria-pressed={priceCurrency === "usd"}
                  >
                    $
                  </button>
                </div>
              </div>
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

          {/* Country selector */}
          <div className="space-y-2">
            <Label>الدولة *</Label>
            <Select value={selectedCountry} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدولة" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    role="combobox"
                    aria-expanded={cityPopoverOpen}
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.city && "text-muted-foreground"
                    )}
                  >
                    <span className="truncate">
                      {formData.city || t.listingForm.selectCity}
                    </span>
                    <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 w-[--radix-popover-trigger-width] z-[100]"
                  align="start"
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <Command>
                    <CommandInput
                      placeholder={`ابحث أو اكتب اسم المدينة في ${selectedCountry}...`}
                      className="h-9"
                      value={cityQuery}
                      onValueChange={setCityQuery}
                    />
                    <CommandList>
                      <CommandEmpty>
                        {cityQuery.trim() ? (
                          <button
                            type="button"
                            className="w-full text-right px-2 py-1.5 text-sm hover:bg-accent rounded-md flex items-center gap-2"
                            onClick={() => {
                              handleCityChange(cityQuery.trim());
                              setCityPopoverOpen(false);
                              setCityQuery("");
                            }}
                          >
                            <Check className="h-4 w-4 text-primary" />
                            استخدام: "{cityQuery.trim()}"
                          </button>
                        ) : (
                          <span className="text-muted-foreground text-sm">ابدأ بالكتابة...</span>
                        )}
                      </CommandEmpty>
                      <CommandGroup>
                        {countryCities.map((city) => (
                          <CommandItem
                            key={city}
                            value={city}
                            onSelect={() => {
                              handleCityChange(city);
                              setCityPopoverOpen(false);
                              setCityQuery("");
                            }}
                          >
                            <Check
                              className={cn(
                                "ml-2 h-4 w-4",
                                formData.city === city ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {city}
                          </CommandItem>
                        ))}
                        {cityQuery.trim() &&
                          !countryCities.some(
                            (c) => c.toLowerCase() === cityQuery.trim().toLowerCase()
                          ) && (
                            <CommandItem
                              value={`__custom_${cityQuery}`}
                              onSelect={() => {
                                handleCityChange(cityQuery.trim());
                                setCityPopoverOpen(false);
                                setCityQuery("");
                              }}
                              className="border-t border-border mt-1 pt-2"
                            >
                              <Check className="ml-2 h-4 w-4 text-primary" />
                              <span className="text-primary">
                                استخدام: "{cityQuery.trim()}"
                              </span>
                            </CommandItem>
                          )}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t.listingForm.area}</Label>
              {availableAreas.length > 0 ? (
                <Select
                  value={formData.area}
                  onValueChange={(value) => setFormData({ ...formData, area: value })}
                  disabled={!formData.city}
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
              ) : (
                <Popover
                  open={areaSuggestionsOpen && filteredAreaSuggestions.length > 0}
                  onOpenChange={setAreaSuggestionsOpen}
                >
                  <PopoverTrigger asChild>
                    <div className="relative">
                      <Input
                        value={formData.area}
                        onChange={(e) => {
                          setFormData({ ...formData, area: e.target.value });
                          setAreaSuggestionsOpen(true);
                        }}
                        onFocus={() => setAreaSuggestionsOpen(true)}
                        placeholder={
                          formData.city
                            ? "اكتب اسم المنطقة (اختياري)"
                            : t.listingForm.selectCityFirst
                        }
                        disabled={!formData.city}
                        maxLength={50}
                        autoComplete="off"
                      />
                      {areaSuggestionsLoading && (
                        <Loader2 className="absolute top-1/2 -translate-y-1/2 left-2 h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      )}
                    </div>
                  </PopoverTrigger>
                  <PopoverContent
                    className="p-0 w-[--radix-popover-trigger-width] z-[100]"
                    align="start"
                    onOpenAutoFocus={(e) => e.preventDefault()}
                  >
                    <Command shouldFilter={false}>
                      <CommandList>
                        <CommandGroup heading={`اقتراحات في ${formData.city}`}>
                          {filteredAreaSuggestions.map((s) => (
                            <CommandItem
                              key={s.name}
                              value={s.name}
                              onSelect={() => {
                                setFormData({ ...formData, area: s.name });
                                setAreaSuggestionsOpen(false);
                              }}
                            >
                              <MapPin className="ml-2 h-3.5 w-3.5 text-muted-foreground" />
                              {s.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.listingForm.phone} * <span className="text-xs text-muted-foreground">({countryInfo.phoneCode})</span></Label>
            <Input
              id="phone"
              type="tel"
              placeholder={countryInfo.phonePlaceholder}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
              dir="ltr"
              className={dir === "rtl" ? "text-left" : "text-left"}
            />
          </div>

          {/* Category-specific metadata fields */}
          {currentMetadataFields.length > 0 && (
            <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
              <Label className="text-sm font-semibold">تفاصيل الإعلان (إجبارية) <span className="text-destructive">*</span></Label>
              <div className="grid grid-cols-2 gap-3">
                {currentMetadataFields.map((field) => (
                  <div key={field.key} className="space-y-1">
                    <Label className="text-xs text-muted-foreground">{field.label} <span className="text-destructive">*</span></Label>
                    {field.type === "select" && field.options ? (
                      <Select
                        value={metadata[field.key] || ""}
                        onValueChange={(value) => setMetadata(prev => ({ ...prev, [field.key]: value }))}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder={`اختر ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {(getFieldOptions(field, formData.category, metadata) || []).map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        className="h-9"
                        placeholder={field.label}
                        value={metadata[field.key] || ""}
                        onChange={(e) => setMetadata(prev => ({ ...prev, [field.key]: e.target.value }))}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade Ad - Contact Us */}
          <Alert className="border-amber-500/30 bg-amber-500/5">
            <Star className="h-4 w-4 text-amber-500" />
            <AlertDescription className="space-y-1">
              <p className="font-medium text-foreground">ترقية الإعلان ⭐</p>
              <p className="text-sm text-muted-foreground">
                هل تريد تمييز إعلانك وإظهاره في المقدمة؟{" "}
                <a 
                  href="https://wa.me/905350348850?text=%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%AA%D8%B1%D9%82%D9%8A%D8%A9%20%D8%A5%D8%B9%D9%84%D8%A7%D9%86%D9%8A" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-primary font-semibold underline"
                >
                  تواصل معنا عبر واتساب
                </a>
              </p>
            </AlertDescription>
          </Alert>

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
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleMediaUpload}
                className="hidden"
                id="camera-capture"
                disabled={uploadingImages || moderatingImages}
              />
              <div className="flex flex-col items-center justify-center py-2">
                {uploadingImages ? (
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : moderatingImages ? (
                  <ShieldCheck className="h-8 w-8 animate-pulse text-primary" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <span className="mt-2 text-sm text-muted-foreground text-center">
                  {uploadingImages 
                    ? t.listingForm.uploading 
                    : moderatingImages 
                      ? t.listingForm.moderating
                      : "اختر صور/فيديو أو التقط صورة"}
                </span>
                <span className="text-xs text-muted-foreground mt-1">
                  {images.length}/{maxImages} صور • حجم الفيديو: 50 ميجابايت كحد أقصى
                </span>
                <div className="flex gap-2 mt-3 w-full">
                  <label
                    htmlFor="image-upload"
                    className="flex-1 inline-flex items-center justify-center gap-2 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    من المعرض
                  </label>
                  <label
                    htmlFor="camera-capture"
                    className="flex-1 inline-flex items-center justify-center gap-2 cursor-pointer rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4" />
                    الكاميرا
                  </label>
                </div>
              </div>

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
      <LocationConsentDialog
        open={locationConsentOpen}
        onAllow={handleLocationAllow}
        onDeny={handleLocationDeny}
        onManual={handleLocationManual}
      />
    </Dialog>
  );
};

export default AddListingModal;
