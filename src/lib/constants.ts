// Syrian cities
export const cities = [
  "دمشق",
  "حلب",
  "حمص",
  "حماة",
  "اللاذقية",
  "طرطوس",
  "دير الزور",
  "الرقة",
  "الحسكة",
  "درعا",
  "السويداء",
  "إدلب",
  "القنيطرة",
  "ريف دمشق",
];

export const citiesWithAll = [
  { value: "all", label: "جميع المدن" },
  ...cities.map((city) => ({ value: city, label: city })),
];

// Areas/neighborhoods by city
export const areasByCity: Record<string, string[]> = {
  "دمشق": [
    "المزة",
    "كفرسوسة",
    "المالكي",
    "أبو رمانة",
    "الشعلان",
    "ساروجة",
    "القصاع",
    "باب توما",
    "الميدان",
    "الحريقة",
    "البرامكة",
    "المهاجرين",
    "ركن الدين",
    "القابون",
    "جوبر",
    "برزة",
    "دمر",
    "قدسيا",
    "الهامة",
    "مشروع دمر",
  ],
  "حلب": [
    "العزيزية",
    "الحمدانية",
    "السليمانية",
    "الشهباء",
    "الفرقان",
    "الجميلية",
    "السبيل",
    "الصاخور",
    "المشارقة",
    "الميسر",
    "الأعظمية",
    "الكلاسة",
    "حلب الجديدة",
    "شارع النيل",
    "السريان",
    "صلاح الدين",
  ],
  "حمص": [
    "الوعر",
    "عكرمة",
    "الخالدية",
    "الحمرا",
    "جورة الشياح",
    "الإنشاءات",
    "كرم الشامي",
    "وادي الذهب",
    "الزهراء",
    "بابا عمرو",
    "دير بعلبة",
    "القصور",
    "النزهة",
  ],
  "حماة": [
    "العليليات",
    "الحاضر",
    "الخامس",
    "الثامن",
    "باب قبلي",
    "باب النهر",
    "المرابط",
    "الحميدية",
    "الجراجمة",
    "الضاهرية",
    "الكيلانية",
  ],
  "اللاذقية": [
    "الصليبة",
    "الزراعة",
    "الشاطئ الأزرق",
    "كورنيش اللاذقية",
    "الأوقاف",
    "المهندسين",
    "الشيخ ضاهر",
    "حي أميريكا",
    "الرمل الجنوبي",
    "الرمل الشمالي",
    "التربية",
    "الصناعة",
  ],
  "طرطوس": [
    "الكورنيش",
    "القادسية",
    "الثورة",
    "المشتل",
    "شارع الحرية",
    "الوحدة",
    "القلعة",
    "ضاحية الأسد",
    "ضاحية المهندسين",
    "الغمقة",
  ],
  "دير الزور": [
    "الجورة",
    "القصور",
    "الحميدية",
    "الشيخ ياسين",
    "حطين",
    "الرشدية",
    "العرضي",
    "الموظفين",
    "الحويقة",
  ],
  "الرقة": [
    "المنصور",
    "الأمين",
    "حي الدرعية",
    "الثكنة",
    "البريد",
    "الفردوس",
    "الروضة",
    "السباهية",
    "هنانو",
  ],
  "الحسكة": [
    "غويران",
    "النشوة",
    "الآشورية",
    "تل حجر",
    "الخشمان",
    "الصالحية",
    "المساكن",
    "العزيزية",
    "الليلية",
  ],
  "درعا": [
    "درعا البلد",
    "درعا المحطة",
    "الكاشف",
    "السحاري",
    "طريق السد",
    "الأربعين",
    "المخيم",
    "صيدا",
  ],
  "السويداء": [
    "شهبا",
    "صلخد",
    "القريا",
    "الثعلة",
    "المزرعة",
    "عرى",
    "قنوات",
    "السويداء الجديدة",
  ],
  "إدلب": [
    "الثورة",
    "البلدية",
    "الجسر",
    "الحرية",
    "الشهداء",
    "النصر",
    "الوحدة",
    "القصور",
  ],
  "القنيطرة": [
    "مدينة البعث",
    "خان أرنبة",
    "القحطانية",
    "الرفيد",
    "مسحرة",
    "جباتا الخشب",
  ],
  "ريف دمشق": [
    "جرمانا",
    "صحنايا",
    "ببيلا",
    "يلدا",
    "داريا",
    "معضمية الشام",
    "قطنا",
    "الزبداني",
    "التل",
    "دوما",
    "حرستا",
    "عربين",
    "سقبا",
    "عين ترما",
    "كفربطنا",
    "النبك",
    "يبرود",
    "معلولا",
  ],
};

// Subcategories by category
export const subcategoriesByCategory: Record<string, string[]> = {
  "اكسسوارات": [
    "ساعات",
    "نظارات",
    "مجوهرات",
    "حقائب",
    "أحزمة",
    "قبعات",
    "أخرى",
  ],
  "مكياج": [
    "أحمر شفاه",
    "كريمات",
    "عطور",
    "أدوات تجميل",
    "مناكير",
    "أساسات",
    "أخرى",
  ],
  "مواد بناء": [
    "إسمنت",
    "حديد",
    "بلاط",
    "دهانات",
    "أدوات كهربائية",
    "أدوات صحية",
    "رمل وحصى",
    "أخرى",
  ],
};

// Category-specific metadata fields
export interface MetadataField {
  key: string;
  label: string;
  type: "text" | "select";
  options?: string[];
}

export const categoryMetadataFields: Record<string, MetadataField[]> = {
  "سيارات": [
    { key: "model", label: "الموديل", type: "text" },
    { key: "year", label: "سنة الصنع", type: "text" },
    { key: "origin", label: "بلد الصنع", type: "text" },
    { key: "fuel", label: "نوع الوقود", type: "select", options: ["بنزين", "ديزل", "كهربائي", "هايبرد"] },
    { key: "transmission", label: "نوع ناقل الحركة", type: "select", options: ["أوتوماتيك", "عادي"] },
    { key: "color", label: "اللون", type: "text" },
    { key: "doors", label: "عدد الأبواب", type: "select", options: ["2 أبواب", "4 أبواب", "5 أبواب"] },
    { key: "licensed", label: "مرخصة", type: "select", options: ["نعم", "لا"] },
    { key: "kilometers", label: "عدد الكيلومترات", type: "text" },
    { key: "engine", label: "حجم المحرك", type: "text" },
  ],
  "عقارات": [
    { key: "property_type", label: "نوع العقار", type: "select", options: ["شقة", "فيلا", "أرض", "محل تجاري", "مكتب", "مستودع", "بناء كامل"] },
    { key: "purpose", label: "الغرض", type: "select", options: ["للبيع", "للإيجار"] },
    { key: "area_sqm", label: "المساحة (م²)", type: "text" },
    { key: "rooms", label: "عدد الغرف", type: "text" },
    { key: "floor", label: "الطابق", type: "text" },
    { key: "building_age", label: "عمر العقار", type: "select", options: ["جديد", "1-5 سنوات", "5-10 سنوات", "أكثر من 10 سنوات"] },
    { key: "furnished", label: "مفروش", type: "select", options: ["نعم", "لا", "نصف مفروش"] },
    { key: "parking", label: "موقف سيارة", type: "select", options: ["نعم", "لا"] },
    { key: "rental_period", label: "مدة الإيجار", type: "select", options: ["شهري", "سنوي", "يومي"] },
  ],
  "الكترونيات": [
    { key: "brand", label: "الماركة", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "مجدد"] },
    { key: "warranty", label: "الضمان", type: "select", options: ["نعم", "لا"] },
  ],
  "أثاث": [
    { key: "furniture_type", label: "نوع الأثاث", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "ممتاز"] },
    { key: "material", label: "المادة", type: "text" },
  ],
  "ملابس": [
    { key: "clothing_type", label: "نوع الملابس", type: "text" },
    { key: "size", label: "المقاس", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل"] },
    { key: "gender", label: "الجنس", type: "select", options: ["رجالي", "نسائي", "أطفال", "للجنسين"] },
  ],
  "وظائف": [
    { key: "job_type", label: "نوع الوظيفة", type: "select", options: ["دوام كامل", "دوام جزئي", "عن بعد", "مؤقت"] },
    { key: "experience", label: "الخبرة المطلوبة", type: "text" },
    { key: "salary_range", label: "نطاق الراتب", type: "text" },
  ],
  "خدمات": [
    { key: "service_type", label: "نوع الخدمة", type: "text" },
    { key: "availability", label: "التوفر", type: "select", options: ["متاح الآن", "بالحجز المسبق"] },
  ],
  "حيوانات أليفة": [
    { key: "animal_type", label: "نوع الحيوان", type: "text" },
    { key: "age", label: "العمر", type: "text" },
    { key: "vaccinated", label: "محصّن", type: "select", options: ["نعم", "لا"] },
  ],
  "اكسسوارات": [
    { key: "accessory_type", label: "نوع الاكسسوار", type: "select", options: ["ساعات", "نظارات", "مجوهرات", "حقائب", "أحزمة", "أخرى"] },
    { key: "brand", label: "الماركة", type: "text" },
    { key: "material", label: "المادة", type: "select", options: ["ذهب", "فضة", "جلد", "ستانلس ستيل", "بلاستيك", "أخرى"] },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "ممتاز"] },
    { key: "gender", label: "الجنس", type: "select", options: ["رجالي", "نسائي", "للجنسين"] },
  ],
  "مكياج": [
    { key: "product_type", label: "نوع المنتج", type: "select", options: ["عطور", "كريمات", "أدوات تجميل", "مكياج وجه", "عناية بالبشرة", "عناية بالشعر", "أخرى"] },
    { key: "brand", label: "الماركة", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل"] },
    { key: "origin", label: "بلد المنشأ", type: "text" },
    { key: "expiry", label: "تاريخ الانتهاء", type: "text" },
  ],
  "معدات صناعية": [
    { key: "equipment_type", label: "نوع المعدات", type: "text" },
    { key: "brand", label: "الماركة", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "مجدد"] },
    { key: "power_source", label: "مصدر الطاقة", type: "select", options: ["كهربائي", "ديزل", "بنزين", "يدوي"] },
    { key: "year", label: "سنة الصنع", type: "text" },
    { key: "warranty", label: "الضمان", type: "select", options: ["نعم", "لا"] },
  ],
  "معدات زراعية": [
    { key: "equipment_type", label: "نوع المعدات", type: "text" },
    { key: "brand", label: "الماركة", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "مجدد"] },
    { key: "power_source", label: "مصدر الطاقة", type: "select", options: ["كهربائي", "ديزل", "بنزين", "يدوي"] },
    { key: "year", label: "سنة الصنع", type: "text" },
    { key: "usage", label: "الاستخدام", type: "select", options: ["حراثة", "ري", "حصاد", "رش", "نقل", "أخرى"] },
  ],
  "مواد بناء": [
    { key: "material_type", label: "نوع المادة", type: "select", options: ["إسمنت", "حديد", "بلاط", "دهانات", "رمل", "بلوك", "خشب", "أخرى"] },
    { key: "quantity", label: "الكمية", type: "text" },
    { key: "unit", label: "وحدة القياس", type: "select", options: ["طن", "كيلو", "متر", "متر مربع", "قطعة", "كيس"] },
  ],
  "ألعاب": [
    { key: "game_type", label: "نوع اللعبة", type: "select", options: ["ألعاب فيديو", "ألعاب طاولة", "ألعاب أطفال", "ألعاب تعليمية", "دمى", "ألعاب خارجية", "أخرى"] },
    { key: "age_group", label: "الفئة العمرية", type: "select", options: ["0-3 سنوات", "3-6 سنوات", "6-12 سنة", "12+ سنة", "للجميع"] },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "ممتاز"] },
    { key: "brand", label: "الماركة", type: "text" },
  ],
  "أخرى": [
    { key: "item_type", label: "نوع المنتج", type: "text" },
    { key: "condition", label: "الحالة", type: "select", options: ["جديد", "مستعمل", "ممتاز"] },
    { key: "brand", label: "الماركة", type: "text" },
    { key: "quantity", label: "الكمية", type: "text" },
  ],
};

// Categories
export const categories = [
  { value: "سيارات", label: "سيارات" },
  { value: "عقارات", label: "عقارات" },
  { value: "الكترونيات", label: "الكترونيات" },
  { value: "أثاث", label: "أثاث" },
  { value: "ملابس", label: "ملابس" },
  { value: "اكسسوارات", label: "اكسسوارات" },
  { value: "مكياج", label: "مكياج" },
  { value: "خدمات", label: "خدمات" },
  { value: "وظائف", label: "وظائف" },
  { value: "ألعاب", label: "ألعاب" },
  
  { value: "حيوانات أليفة", label: "حيوانات أليفة" },
  { value: "معدات صناعية", label: "معدات صناعية" },
  { value: "معدات زراعية", label: "معدات زراعية" },
  { value: "مواد بناء", label: "مواد بناء" },
  { value: "أخرى", label: "أخرى" },
];

export const categoriesWithAll = [
  { value: "all", label: "جميع التصنيفات" },
  ...categories,
];

export const categoryLabels: Record<string, string> = {
  سيارات: "سيارات",
  عقارات: "عقارات",
  الكترونيات: "الكترونيات",
  أثاث: "أثاث",
  ملابس: "ملابس",
  اكسسوارات: "اكسسوارات",
  مكياج: "مكياج",
  خدمات: "خدمات",
  وظائف: "وظائف",
  ألعاب: "ألعاب",
  أخرى: "أخرى",
  "مواد بناء": "مواد بناء",
  // Legacy English values
  cars: "سيارات",
  real_estate: "عقارات",
  electronics: "الكترونيات",
  clothing: "ملابس",
  furniture: "أثاث",
  jobs: "وظائف",
  games: "ألعاب",
  services: "خدمات",
};

// Status labels
export const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }> = {
  active: { label: "نشط", variant: "outline", className: "bg-green-500/10 text-green-600 border-green-500/30" },
  sold: { label: "مباع", variant: "outline", className: "bg-destructive/10 text-destructive border-destructive/30" },
  expired: { label: "منتهي", variant: "destructive" },
};

export const statuses = [
  { value: "active", label: "نشط" },
  { value: "sold", label: "تم البيع" },
  { value: "expired", label: "منتهي" },
];

// Sort options
export const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "price_asc", label: "السعر: من الأقل للأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى للأقل" },
];

// Currency formatting - Syrian Pound
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ar-SY", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(price) + " ل.س";
};

// Date formatting
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("ar-SY", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

// Relative time formatting
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "منذ دقائق";
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  if (diffDays === 1) return "منذ يوم";
  if (diffDays < 7) return `منذ ${diffDays} أيام`;
  return `منذ ${Math.floor(diffDays / 7)} أسبوع`;
};
