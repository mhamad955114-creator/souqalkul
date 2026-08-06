import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/imageCompression";
import { uploadToB2 } from "@/lib/b2Upload";
import { toast } from "sonner";
import { Loader2, Upload, X, ShieldCheck, ShieldX, Sparkles, Camera } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountry } from "@/contexts/CountryContext";
import { cities, categories, statuses, areasByCity } from "@/lib/constants";
import { resolveCityArea } from "@/lib/locationMatch";
import { useCategoryDefinitions } from "@/hooks/useCategoryDefinitions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { saveCameraDraft, loadCameraDraft, clearCameraDraft } from "@/lib/cameraDraftStore";
import LocationPicker from "@/components/LocationPicker";

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency?: string | null;
  category: string;
  city: string;
  area: string | null;
  phone: string | null;
  images: string[] | null;
  status: string | null;
  metadata?: Record<string, string> | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface EditListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  onSuccess: () => void;
}

const EditListingModal = ({ isOpen, onClose, listing, onSuccess }: EditListingModalProps) => {
  const { user } = useAuth();
  const { t, dir, language } = useLanguage();
  const { currentCountry } = useCountry();
  const { getFields, shouldHideField, getFieldOptions } = useCategoryDefinitions();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [moderatingImages, setModeratingImages] = useState(false);
  const [rejectedImages, setRejectedImages] = useState<{ url: string; reason: string }[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [priceCurrency, setPriceCurrency] = useState<"local" | "usd">("local");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    city: "",
    area: "",
    phone: "",
    status: "",
    maritalStatus: "",
    age: "",
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [images, setImages] = useState<string[]>([]);
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [cameraPreviewFile, setCameraPreviewFile] = useState<File | null>(null);
  const [cameraPreviewUrl, setCameraPreviewUrl] = useState<string | null>(null);
  useEffect(() => {
    if (listing) {
      let description = listing.description || "";
      let maritalStatus = "";
      let age = "";
      const maritalMatch = description.match(/^الحالة الاجتماعية: (.+)\n?/);
      if (maritalMatch) {
        maritalStatus = maritalMatch[1];
        description = description.replace(/^الحالة الاجتماعية: .+\n?/, "");
      }
      const ageMatch = description.match(/^العمر: (\d+)\n?/);
      if (ageMatch) {
        age = ageMatch[1];
        description = description.replace(/^العمر: \d+\n?/, "");
      }
      setFormData({
        title: listing.title,
        description,
        price: listing.price.toString(),
        category: listing.category,
        city: listing.city,
        area: listing.area || "",
        phone: listing.phone || "",
        status: listing.status || "active",
        maritalStatus,
        age,
        latitude: listing.latitude ?? null,
        longitude: listing.longitude ?? null,
      });
      setImages(listing.images || []);
      setMetadata((listing.metadata as Record<string, string>) || {});
      setRejectedImages([]);
      setSuggestedCategory(null);
      setPriceCurrency(listing.currency === "USD" ? "usd" : "local");
    }
  }, [listing]);

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;

    setUploadingImages(true);
    setRejectedImages([]);
    const uploadedUrls: string[] = [];
    const rejected: { url: string; reason: string }[] = [];

    try {
      for (let file of Array.from(e.target.files)) {
        // Compress images client-side before upload
        file = await compressImage(file);
        try {
          const publicUrl = await uploadToB2(file, `listings/${user.id}`, file.name);
          uploadedUrls.push(publicUrl);
        } catch (uploadError: any) {
          toast.error(t.listingForm.uploadFailed + ": " + (uploadError.message || "Upload failed"));
          continue;
        }
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

  const cameraDraftKey = `edit-listing-camera-draft-${listing?.id ?? "unknown"}`;

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("الملف المختار ليس صورة");
      return;
    }
    if (cameraPreviewUrl) URL.revokeObjectURL(cameraPreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setCameraPreviewFile(file);
    setCameraPreviewUrl(previewUrl);
    saveCameraDraft(cameraDraftKey, file);
    e.target.value = "";
  };

  const confirmCameraUpload = async () => {
    if (!cameraPreviewFile || !user) return;
    setUploadingImages(true);
    setRejectedImages([]);
    try {
      const compressedFile = await compressImage(cameraPreviewFile);
      const publicUrl = await uploadToB2(compressedFile, `listings/${user.id}`, compressedFile.name);
      toast.success(t.listingForm.uploadedChecking);
      setUploadingImages(false);
      setModeratingImages(true);
      const result = await moderateImage(publicUrl);
      if (result.approved) {
        setImages((prev) => [...prev, publicUrl]);
        toast.success(t.listingForm.imagesApproved);
        if (result.suggestedCategory && !formData.category) {
          setSuggestedCategory(result.suggestedCategory);
          setFormData((prev) => ({ ...prev, category: result.suggestedCategory! }));
        }
      } else {
        setRejectedImages((prev) => [...prev, { url: publicUrl, reason: result.reason }]);
        toast.error(t.listingForm.imagesRejected);
      }
    } catch (error: any) {
      toast.error(t.listingForm.uploadFailed + ": " + (error.message || "Upload failed"));
    } finally {
      setUploadingImages(false);
      setModeratingImages(false);
      if (cameraPreviewUrl) URL.revokeObjectURL(cameraPreviewUrl);
      setCameraPreviewFile(null);
      setCameraPreviewUrl(null);
      clearCameraDraft(cameraDraftKey);
    }
  };

  const cancelCameraPreview = () => {
    if (cameraPreviewUrl) URL.revokeObjectURL(cameraPreviewUrl);
    setCameraPreviewFile(null);
    setCameraPreviewUrl(null);
    clearCameraDraft(cameraDraftKey);
  };

  useEffect(() => {
    return () => {
      if (cameraPreviewUrl) URL.revokeObjectURL(cameraPreviewUrl);
    };
  }, [cameraPreviewUrl]);

  // Restore camera draft when modal opens
  useEffect(() => {
    if (!isOpen || !listing?.id) return;
    let revokedUrl: string | null = null;
    (async () => {
      const draft = await loadCameraDraft(cameraDraftKey);
      if (draft) {
        const url = URL.createObjectURL(draft);
        revokedUrl = url;
        setCameraPreviewFile(draft);
        setCameraPreviewUrl(url);
        toast.info("تم استعادة الصورة الملتقطة من المسودة");
      }
    })();
    return () => {
      if (revokedUrl) URL.revokeObjectURL(revokedUrl);
    };
  }, [isOpen, listing?.id]);



  
  const availableAreas = formData.city ? areasByCity[formData.city] || [] : [];

  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, area: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.category || !formData.city) {
      toast.error(t.listingForm.requiredFields);
      return;
    }

    if (formData.phone) {
      const phoneRegex = /^09\d{8}$/;
      if (!phoneRegex.test(formData.phone)) {
        toast.error(t.listingForm.invalidPhone);
        return;
      }
    }

    // Validate metadata fields are filled for the selected category
    const requiredMetaFields = getFields(formData.category).filter(
      (field) => !shouldHideField(field.key, formData.category, metadata)
    );
    const missingMetaFields = requiredMetaFields.filter(field => !metadata[field.key]?.trim());
    if (missingMetaFields.length > 0) {
      toast.error(`يرجى ملء جميع تفاصيل الإعلان: ${missingMetaFields.map(f => f.label).join('، ')}`);
      return;
    }

    // Validate coordinates (must be present and within valid ranges)
    const { latitude: _lat, longitude: _lng } = formData;
    if (
      _lat === null || _lng === null ||
      !Number.isFinite(_lat) || !Number.isFinite(_lng) ||
      _lat < -90 || _lat > 90 || _lng < -180 || _lng > 180 ||
      (_lat === 0 && _lng === 0)
    ) {
      toast.error("يرجى تحديد موقع الإعلان على الخريطة قبل الحفظ");
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
          currency: priceCurrency === "usd" ? "USD" : currentCountry.currencyCode,
          category: formData.category,
          city: formData.city,
          area: formData.area || null,
          phone: formData.phone || null,
          status: formData.status,
          images: images,
          metadata: Object.keys(metadata).length > 0 ? metadata : null,
          latitude: formData.latitude,
          longitude: formData.longitude,
        } as any)
        .eq("id", listing.id);

      if (error) {
        toast.error(t.listingForm.editError + ": " + error.message);
      } else {
        toast.success(t.listingForm.editSuccess);
        onSuccess();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[85dvh] overflow-y-auto" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{t.listingForm.editTitle}</DialogTitle>
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
              <Label htmlFor="price">
                {t.listingForm.price.split("(")[0]}({priceCurrency === "usd" ? "$" : currentCountry.currencySymbol}) *
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
                    {currentCountry.currencySymbol}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t.listingForm.city} *</Label>
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

          <LocationPicker
            latitude={formData.latitude}
            longitude={formData.longitude}
            onChange={(lat, lng) => setFormData((p) => ({ ...p, latitude: lat, longitude: lng }))}
            hint={[formData.area, formData.city, currentCountry.name].filter(Boolean).join(", ")}
            language={language}
            onApplyAddress={(addr) => {
              const { city, area } = resolveCityArea(addr, cities, false);
              if (!city) {
                toast.error("لم نتمكن من تحديد المدينة من العنوان المقترح");
                return;
              }
              setFormData((p) => ({ ...p, city, area: area || "" }));
              toast.success(`تم تعبئة المدينة: ${city}${area ? ` — ${area}` : ""}`);
            }}
          />


          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">{t.listingForm.phone}</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                dir="ltr"
                className={dir === "rtl" ? "text-left" : "text-left"}
              />
            </div>

            <div className="space-y-2">
              <Label>{t.listingForm.status}</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.listingForm.selectStatus} />
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

          {/* Category-specific metadata fields */}
          {(() => {
            const fields = getFields(formData.category).filter(
              (field) => !shouldHideField(field.key, formData.category, metadata)
            );
            if (fields.length === 0) return null;
            return (
              <div className="space-y-3 p-4 rounded-xl border border-border bg-muted/30">
                <Label className="text-sm font-semibold">تفاصيل الإعلان (إجبارية) <span className="text-destructive">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  {fields.map((field) => (
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
            );
          })()}

          {/* Images Section */}
          <div className="space-y-2">
            <Label>{t.listingForm.images}</Label>
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
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
                id="edit-camera-capture"
                disabled={uploadingImages || moderatingImages || !!cameraPreviewFile}
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
                      : t.listingForm.clickToUploadMore}
                </span>
                <div className="flex gap-2 mt-3 w-full">
                  <label
                    htmlFor="edit-image-upload"
                    className="flex-1 inline-flex items-center justify-center gap-2 cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent"
                  >
                    <Upload className="h-4 w-4" />
                    من المعرض
                  </label>
                  <label
                    htmlFor="edit-camera-capture"
                    className="flex-1 inline-flex items-center justify-center gap-2 cursor-pointer rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90"
                  >
                    <Camera className="h-4 w-4" />
                    الكاميرا
                  </label>
                </div>

                {cameraPreviewUrl && (
                  <div className="w-full mt-4 rounded-lg border border-primary/30 bg-muted/30 p-3">
                    <p className="text-sm font-medium mb-2 text-center">معاينة الصورة الملتقطة</p>
                    <img
                      src={cameraPreviewUrl}
                      alt="Camera preview"
                      className="w-full h-48 object-contain rounded-md bg-black/5"
                    />
                    <div className="flex gap-2 mt-3">
                      <button
                        type="button"
                        onClick={confirmCameraUpload}
                        disabled={uploadingImages || moderatingImages}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                      >
                        <ShieldCheck className="h-4 w-4" />
                        تأكيد ورفع
                      </button>
                      <button
                        type="button"
                        onClick={cancelCameraPreview}
                        disabled={uploadingImages || moderatingImages}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        إلغاء
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {images.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`${index + 1}`}
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
                  {t.listingForm.updating}
                </>
              ) : (
                t.listingForm.saveChanges
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

export default EditListingModal;
