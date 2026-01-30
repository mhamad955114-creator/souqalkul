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

// Categories
export const categories = [
  { value: "سيارات", label: "سيارات" },
  { value: "عقارات", label: "عقارات" },
  { value: "الكترونيات", label: "الكترونيات" },
  { value: "أثاث", label: "أثاث" },
  { value: "ملابس", label: "ملابس" },
  { value: "خدمات", label: "خدمات" },
  { value: "وظائف", label: "وظائف" },
  { value: "ألعاب", label: "ألعاب" },
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
