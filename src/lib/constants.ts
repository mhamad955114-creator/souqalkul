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

// Categories
export const categories = [
  { value: "سيارات", label: "سيارات" },
  { value: "عقارات", label: "عقارات" },
  { value: "الكترونيات", label: "الكترونيات" },
  { value: "أثاث", label: "أثاث" },
  { value: "ملابس", label: "ملابس" },
  { value: "اكسسوارات", label: "اكسسوارات" },
  { value: "خدمات", label: "خدمات" },
  { value: "وظائف", label: "وظائف" },
  { value: "ألعاب", label: "ألعاب" },
  
  { value: "حيوانات أليفة", label: "حيوانات أليفة" },
  { value: "معدات صناعية", label: "معدات صناعية" },
  { value: "معدات زراعية", label: "معدات زراعية" },
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
  خدمات: "خدمات",
  وظائف: "وظائف",
  ألعاب: "ألعاب",
  أخرى: "أخرى",
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
export const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  active: { label: "نشط", variant: "default" },
  sold: { label: "تم البيع", variant: "secondary" },
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
