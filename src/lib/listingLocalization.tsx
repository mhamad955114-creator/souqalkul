import type { Language, Translations } from "@/lib/translations";

/** الحد الأقصى لحجم ملف الفيديو بالميجابايت — يُستخدم في التحقق وفي نصوص الواجهة معًا */
export const MAX_VIDEO_MB = 50;

export const listingUiCopy = {
  ar: {
    draftRestored: "تم استعادة بيانات الإعلان المحفوظة",
    cameraDraftRestored: "تم استعادة الصورة الملتقطة من المسودة",
    invalidImage: "الملف المختار ليس صورة",
    imageLimit: (max: number) => `الحد الأقصى للصور هو ${max} للباقة المختارة`,
    remainingMedia: (count: number, max: number) => `يمكنك رفع ${count} صور/فيديو إضافية فقط (الحد الأقصى: ${max})`,
    videoTooLarge: `حجم الفيديو يجب أن لا يتجاوز ${MAX_VIDEO_MB} ميجابايت`,
    videosChecking: (count: number) => `تم رفع ${count} فيديو، جاري فحص المحتوى...`,
    videoApproved: "تم قبول الفيديو",
    videoViolation: "محتوى الفيديو مخالف",
    videosRejected: (count: number) => `تم رفض ${count} فيديو لمخالفة المحتوى`,
    titleTooShort: "عنوان الإعلان يجب أن يكون 3 أحرف على الأقل",
    titleTooLong: "عنوان الإعلان يجب أن يكون أقل من 200 حرف",
    activeLimit: (max: number) => `لقد وصلت للحد الأقصى من الإعلانات النشطة (${max}). قم بترقية باقتك لنشر المزيد.`,
    upgradePlan: "ترقية الباقة",
    invalidCountryPhone: (country: string, example: string) => `رقم الهاتف غير صالح لـ ${country}. الصيغة: ${example}`,
    missingDetails: (fields: string) => `يرجى ملء جميع تفاصيل الإعلان: ${fields}`,
    mapRequired: "يرجى تحديد موقع الإعلان على الخريطة قبل الحفظ",
    plans: { free: "المجانية", featured: "المميزة", professional: "الاحترافية", business: "رجال الأعمال" },
    unlimitedPlan: (plan: string) => <>باقتك: <strong>{plan}</strong> — إعلانات غير محدودة</>,
    planLimit: (max: number, plan: string) => `وصلت للحد الأقصى (${max} إعلان) في الباقة ${plan}.`,
    planRemaining: (plan: string, remaining: number, max: number) => <>باقتك: <strong>{plan}</strong> — متبقي <strong>{remaining}</strong> من {max} إعلان</>,
    country: "الدولة",
    selectCountry: "اختر الدولة",
    citySearch: (country: string) => `ابحث أو اكتب اسم المدينة في ${country}...`,
    useValue: (value: string) => `استخدام: “${value}”`,
    startTyping: "ابدأ بالكتابة...",
    areaPlaceholder: "اكتب اسم المنطقة (اختياري)",
    suggestionsIn: (city: string) => `اقتراحات في ${city}`,
    addressCityError: "لم نتمكن من تحديد المدينة من العنوان المقترح",
    cityFilled: (city: string, area?: string) => `تم تعبئة المدينة: ${city}${area ? ` — ${area}` : ""}`,
    requiredDetails: "تفاصيل الإعلان (إجبارية)",
    choose: (label: string) => `اختر ${label}`,
    promotionTitle: "ترقية الإعلان",
    promotionDesc: "هل تريد تمييز إعلانك وإظهاره في المقدمة؟",
    contactWhatsapp: "تواصل معنا عبر واتساب",
    mediaKinds: "صور وفيديو",
    chooseMedia: "اختر صور/فيديو أو التقط صورة",
    mediaCount: (count: number, max: number) => `${count}/${max} صور • حجم الفيديو: ${MAX_VIDEO_MB} ميجابايت كحد أقصى`,
    gallery: "من المعرض",
    camera: "الكاميرا",
    cameraPreview: "معاينة الصورة الملتقطة",
    confirmUpload: "تأكيد ورفع",
    cancel: "إلغاء",
  },
  en: {
    draftRestored: "Your saved listing draft was restored",
    cameraDraftRestored: "Your captured photo draft was restored",
    invalidImage: "The selected file is not an image",
    imageLimit: (max: number) => `The selected plan allows up to ${max} images`,
    remainingMedia: (count: number, max: number) => `You can add only ${count} more media files (maximum: ${max})`,
    videoTooLarge: `Video size must not exceed ${MAX_VIDEO_MB} MB`,
    videosChecking: (count: number) => `${count} video(s) uploaded. Checking content...`,
    videoApproved: "Video approved",
    videoViolation: "Video content violates the policy",
    videosRejected: (count: number) => `${count} video(s) were rejected for policy violations`,
    titleTooShort: "The listing title must contain at least 3 characters",
    titleTooLong: "The listing title must contain fewer than 200 characters",
    activeLimit: (max: number) => `You have reached the limit of ${max} active listings. Upgrade your plan to publish more.`,
    upgradePlan: "Upgrade plan",
    invalidCountryPhone: (country: string, example: string) => `Invalid phone number for ${country}. Format: ${example}`,
    missingDetails: (fields: string) => `Complete all listing details: ${fields}`,
    mapRequired: "Choose the listing location on the map before saving",
    plans: { free: "Free", featured: "Featured", professional: "Professional", business: "Business" },
    unlimitedPlan: (plan: string) => <>Your plan: <strong>{plan}</strong> — Unlimited listings</>,
    planLimit: (max: number, plan: string) => `You reached the ${max}-listing limit for the ${plan} plan.`,
    planRemaining: (plan: string, remaining: number, max: number) => <>Your plan: <strong>{plan}</strong> — <strong>{remaining}</strong> of {max} listings remaining</>,
    country: "Country",
    selectCountry: "Select country",
    citySearch: (country: string) => `Search or enter a city in ${country}...`,
    useValue: (value: string) => `Use: “${value}”`,
    startTyping: "Start typing...",
    areaPlaceholder: "Enter an area (optional)",
    suggestionsIn: (city: string) => `Suggestions in ${city}`,
    addressCityError: "We could not identify the city from the suggested address",
    cityFilled: (city: string, area?: string) => `City filled: ${city}${area ? ` — ${area}` : ""}`,
    requiredDetails: "Required listing details",
    choose: (label: string) => `Select ${label}`,
    promotionTitle: "Promote listing",
    promotionDesc: "Want your listing highlighted and shown first?",
    contactWhatsapp: "Contact us on WhatsApp",
    mediaKinds: "Photos and video",
    chooseMedia: "Choose photos/video or take a photo",
    mediaCount: (count: number, max: number) => `${count}/${max} photos • Video limit: ${MAX_VIDEO_MB} MB`,
    gallery: "Gallery",
    camera: "Camera",
    cameraPreview: "Captured photo preview",
    confirmUpload: "Confirm and upload",
    cancel: "Cancel",
  },
  tr: {
    draftRestored: "Kaydedilen ilan taslağınız geri yüklendi",
    cameraDraftRestored: "Çekilen fotoğraf taslağınız geri yüklendi",
    invalidImage: "Seçilen dosya bir görsel değil",
    imageLimit: (max: number) => `Seçilen paket en fazla ${max} görsele izin verir`,
    remainingMedia: (count: number, max: number) => `Yalnızca ${count} medya dosyası daha ekleyebilirsiniz (en fazla: ${max})`,
    videoTooLarge: `Video boyutu ${MAX_VIDEO_MB} MB'ı aşamaz`,
    videosChecking: (count: number) => `${count} video yüklendi. İçerik kontrol ediliyor...`,
    videoApproved: "Video onaylandı",
    videoViolation: "Video içeriği kurallara aykırı",
    videosRejected: (count: number) => `${count} video kural ihlali nedeniyle reddedildi`,
    titleTooShort: "İlan başlığı en az 3 karakter olmalıdır",
    titleTooLong: "İlan başlığı 200 karakterden kısa olmalıdır",
    activeLimit: (max: number) => `${max} aktif ilan sınırına ulaştınız. Daha fazla yayınlamak için paketinizi yükseltin.`,
    upgradePlan: "Paketi yükselt",
    invalidCountryPhone: (country: string, example: string) => `${country} için telefon numarası geçersiz. Biçim: ${example}`,
    missingDetails: (fields: string) => `Tüm ilan ayrıntılarını doldurun: ${fields}`,
    mapRequired: "Kaydetmeden önce haritada ilan konumunu seçin",
    plans: { free: "Ücretsiz", featured: "Öne Çıkan", professional: "Profesyonel", business: "İşletme" },
    unlimitedPlan: (plan: string) => <>Paketiniz: <strong>{plan}</strong> — Sınırsız ilan</>,
    planLimit: (max: number, plan: string) => `${plan} paketindeki ${max} ilan sınırına ulaştınız.`,
    planRemaining: (plan: string, remaining: number, max: number) => <>Paketiniz: <strong>{plan}</strong> — {max} ilandan <strong>{remaining}</strong> ilan kaldı</>,
    country: "Ülke",
    selectCountry: "Ülke seçin",
    citySearch: (country: string) => `${country} içinde şehir arayın veya yazın...`,
    useValue: (value: string) => `Kullan: “${value}”`,
    startTyping: "Yazmaya başlayın...",
    areaPlaceholder: "Bölge adını yazın (isteğe bağlı)",
    suggestionsIn: (city: string) => `${city} için öneriler`,
    addressCityError: "Önerilen adresten şehir belirlenemedi",
    cityFilled: (city: string, area?: string) => `Şehir dolduruldu: ${city}${area ? ` — ${area}` : ""}`,
    requiredDetails: "Zorunlu ilan ayrıntıları",
    choose: (label: string) => `${label} seçin`,
    promotionTitle: "İlanı öne çıkar",
    promotionDesc: "İlanınızı öne çıkarıp ilk sıralarda göstermek ister misiniz?",
    contactWhatsapp: "WhatsApp üzerinden iletişime geçin",
    mediaKinds: "Fotoğraf ve video",
    chooseMedia: "Fotoğraf/video seçin veya fotoğraf çekin",
    mediaCount: (count: number, max: number) => `${count}/${max} fotoğraf • Video sınırı: ${MAX_VIDEO_MB} MB`,
    gallery: "Galeri",
    camera: "Kamera",
    cameraPreview: "Çekilen fotoğrafın önizlemesi",
    confirmUpload: "Onayla ve yükle",
    cancel: "İptal",
  },
} as const;

const categoryKeys: Record<string, keyof Translations["categories"]> = {
  "سيارات": "cars", "عقارات": "realEstate", "الكترونيات": "electronics", "إلكترونيات": "electronics",
  "أثاث": "furniture", "ملابس": "clothing", "اكسسوارات": "accessories", "مكياج": "makeup",
  "خدمات": "services", "وظائف": "jobs", "ألعاب": "games", "حيوانات أليفة": "pets",
  "معدات صناعية": "industrial", "معدات زراعية": "agricultural", "مواد بناء": "buildingMaterials",
  "مواد غذائية": "food", "مطاعم": "restaurants", "أخرى": "other",
};

export const localizeCategory = (value: string, t: Translations) => {
  const key = categoryKeys[value];
  return key ? t.categories[key] : value;
};

const countryNames: Record<Language, Record<string, string>> = {
  ar: {},
  en: { SY: "Syria", TR: "Turkey", SA: "Saudi Arabia", AE: "United Arab Emirates", EG: "Egypt", IQ: "Iraq", JO: "Jordan", LB: "Lebanon", KW: "Kuwait", QA: "Qatar", BH: "Bahrain", OM: "Oman", YE: "Yemen", LY: "Libya", TN: "Tunisia", DZ: "Algeria", MA: "Morocco", SD: "Sudan", MR: "Mauritania", PS: "Palestine", SO: "Somalia", DJ: "Djibouti", KM: "Comoros" },
  tr: { SY: "Suriye", TR: "Türkiye", SA: "Suudi Arabistan", AE: "Birleşik Arap Emirlikleri", EG: "Mısır", IQ: "Irak", JO: "Ürdün", LB: "Lübnan", KW: "Kuveyt", QA: "Katar", BH: "Bahreyn", OM: "Umman", YE: "Yemen", LY: "Libya", TN: "Tunus", DZ: "Cezayir", MA: "Fas", SD: "Sudan", MR: "Moritanya", PS: "Filistin", SO: "Somali", DJ: "Cibuti", KM: "Komorlar" },
};

export const localizeCountry = (code: string, fallback: string, language: Language) =>
  countryNames[language][code] || fallback;

const turkeyCities: Record<string, string> = {
  "أضنة": "Adana", "أديامان": "Adıyaman", "أفيون قره حصار": "Afyonkarahisar", "أغري": "Ağrı", "أماسيا": "Amasya",
  "أنقرة": "Ankara", "أنطاليا": "Antalya", "أرتفين": "Artvin", "أيدين": "Aydın", "باليكسير": "Balıkesir",
  "بيلجيك": "Bilecik", "بينغول": "Bingöl", "بدليس": "Bitlis", "بولو": "Bolu", "بوردور": "Burdur",
  "بورصة": "Bursa", "جناق قلعة": "Çanakkale", "جانقري": "Çankırı", "جوروم": "Çorum", "دنيزلي": "Denizli",
  "ديار بكر": "Diyarbakır", "أدرنة": "Edirne", "إلازيغ": "Elazığ", "أرزنجان": "Erzincan", "أرضروم": "Erzurum",
  "إسكي شهير": "Eskişehir", "غازي عنتاب": "Gaziantep", "غيرسون": "Giresun", "غوموش خانة": "Gümüşhane", "هاكاري": "Hakkâri",
  "هاتاي": "Hatay", "إسبرطة": "Isparta", "مرسين": "Mersin", "إسطنبول": "İstanbul", "إزمير": "İzmir",
  "قارص": "Kars", "قسطموني": "Kastamonu", "قيصري": "Kayseri", "كيركلاريلي": "Kırklareli", "كيرشهير": "Kırşehir",
  "قوجه إيلي": "Kocaeli", "قونية": "Konya", "كوتاهيا": "Kütahya", "ملاطية": "Malatya", "مانيسا": "Manisa",
  "كهرمان مرعش": "Kahramanmaraş", "ماردين": "Mardin", "موغلا": "Muğla", "موش": "Muş", "نوشهير": "Nevşehir",
  "نيغدة": "Niğde", "أوردو": "Ordu", "ريزة": "Rize", "صقاريا": "Sakarya", "سامسون": "Samsun",
  "سيرت": "Siirt", "سينوب": "Sinop", "سيواس": "Sivas", "تكيرداغ": "Tekirdağ", "توكات": "Tokat",
  "طرابزون": "Trabzon", "تونجلي": "Tunceli", "أورفة": "Şanlıurfa", "أوشاك": "Uşak", "وان": "Van",
  "يوزغات": "Yozgat", "زونغولداك": "Zonguldak", "أكسراي": "Aksaray", "بايبورت": "Bayburt", "قرمان": "Karaman",
  "قيريق قلعة": "Kırıkkale", "باتمان": "Batman", "شرناق": "Şırnak", "بارتين": "Bartın", "أردهان": "Ardahan",
  "إغدير": "Iğdır", "يالوفا": "Yalova", "كارابوك": "Karabük", "كيليس": "Kilis", "عثمانية": "Osmaniye", "دوزجه": "Düzce",
};

const syriaCities: Record<Language, Record<string, string>> = {
  ar: {},
  en: { "دمشق": "Damascus", "حلب": "Aleppo", "حمص": "Homs", "حماة": "Hama", "اللاذقية": "Latakia", "طرطوس": "Tartus", "دير الزور": "Deir ez-Zor", "الرقة": "Raqqa", "الحسكة": "Al-Hasakah", "درعا": "Daraa", "السويداء": "As-Suwayda", "إدلب": "Idlib", "القنيطرة": "Quneitra", "ريف دمشق": "Rif Dimashq" },
  tr: { "دمشق": "Şam", "حلب": "Halep", "حمص": "Humus", "حماة": "Hama", "اللاذقية": "Lazkiye", "طرطوس": "Tartus", "دير الزور": "Deyrizor", "الرقة": "Rakka", "الحسكة": "Haseke", "درعا": "Dera", "السويداء": "Süveyda", "إدلب": "İdlib", "القنيطرة": "Kuneytire", "ريف دمشق": "Şam Kırsalı" },
};

export const localizeCity = (value: string, countryCode: string, language: Language) => {
  if (language === "ar") return value;
  if (countryCode === "TR") return turkeyCities[value] || value;
  if (countryCode === "SY") return syriaCities[language][value] || value;
  return value;
};

const fieldLabels: Record<string, { en: string; tr: string }> = {
  model: { en: "Model", tr: "Model" }, year: { en: "Year", tr: "Model yılı" }, registration_year: { en: "Registration year", tr: "Tescil yılı" },
  origin: { en: "Country of origin", tr: "Menşei" }, fuel: { en: "Fuel type", tr: "Yakıt türü" }, transmission: { en: "Transmission", tr: "Vites" },
  drive_type: { en: "Drive type", tr: "Çekiş tipi" }, color: { en: "Color", tr: "Renk" }, doors: { en: "Doors", tr: "Kapı sayısı" },
  previous_owners: { en: "Previous owners", tr: "Önceki sahip sayısı" }, licensed: { en: "Licensed", tr: "Ruhsatlı" }, kilometers: { en: "Mileage", tr: "Kilometre" },
  engine: { en: "Engine size", tr: "Motor hacmi" }, property_type: { en: "Property type", tr: "Emlak türü" }, purpose: { en: "Purpose", tr: "Amaç" },
  area_sqm: { en: "Area (m²)", tr: "Alan (m²)" }, rooms: { en: "Rooms", tr: "Oda sayısı" }, bathrooms: { en: "Bathrooms", tr: "Banyo sayısı" },
  floor: { en: "Floor", tr: "Kat" }, total_floors: { en: "Building floors", tr: "Bina kat sayısı" }, building_age: { en: "Building age", tr: "Bina yaşı" },
  furnished: { en: "Furnished", tr: "Eşyalı" }, heating: { en: "Heating", tr: "Isıtma" }, balcony: { en: "Balcony", tr: "Balkon" },
  elevator: { en: "Elevator", tr: "Asansör" }, parking: { en: "Parking", tr: "Otopark" }, brand: { en: "Brand", tr: "Marka" },
  condition: { en: "Condition", tr: "Durum" }, size: { en: "Size", tr: "Beden" }, material: { en: "Material", tr: "Malzeme" },
  quantity: { en: "Quantity", tr: "Miktar" }, weight: { en: "Weight", tr: "Ağırlık" }, expiry_date: { en: "Expiry date", tr: "Son kullanma tarihi" },
  cuisine_type: { en: "Cuisine", tr: "Mutfak türü" }, price_range: { en: "Price range", tr: "Fiyat aralığı" }, delivery: { en: "Delivery", tr: "Teslimat" },
  working_hours: { en: "Working hours", tr: "Çalışma saatleri" }, seating: { en: "Seating", tr: "Oturma alanı" },
};

export const localizeFieldLabel = (key: string, fallback: string, language: Language) =>
  language === "ar" ? fallback : fieldLabels[key]?.[language] || (language === "tr" ? "İlan bilgisi" : "Listing detail");

const optionTranslations: Record<string, { en: string; tr: string }> = {
  "نعم": { en: "Yes", tr: "Evet" }, "لا": { en: "No", tr: "Hayır" }, "أخرى": { en: "Other", tr: "Diğer" },
  "بنزين": { en: "Petrol", tr: "Benzin" }, "ديزل": { en: "Diesel", tr: "Dizel" }, "كهربائي": { en: "Electric", tr: "Elektrik" },
  "هايبرد": { en: "Hybrid", tr: "Hibrit" }, "غاز": { en: "Gas", tr: "Gaz" }, "أوتوماتيك": { en: "Automatic", tr: "Otomatik" },
  "عادي": { en: "Manual", tr: "Manuel" }, "أمامي": { en: "Front-wheel", tr: "Önden çekiş" }, "خلفي": { en: "Rear-wheel", tr: "Arkadan çekiş" },
  "رباعي": { en: "Four-wheel", tr: "Dört çeker" }, "جديد": { en: "New", tr: "Yeni" }, "مستعمل": { en: "Used", tr: "Kullanılmış" },
  "متوفرة": { en: "Available", tr: "Var" }, "غير متوفرة": { en: "Unavailable", tr: "Yok" }, "للبيع": { en: "For sale", tr: "Satılık" },
  "للإيجار": { en: "For rent", tr: "Kiralık" }, "ذكر": { en: "Male", tr: "Erkek" }, "أنثى": { en: "Female", tr: "Dişi" },
};

export const localizeOption = (value: string, language: Language) =>
  language === "ar" ? value : optionTranslations[value]?.[language] || value;

export const localizedCurrencySymbol = (symbol: string, code: string, language: Language) =>
  language !== "ar" && /[\u0600-\u06FF]/.test(symbol) ? code : symbol;
