import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  category: string;
  images: string[];
  is_featured: boolean;
  created_at: string;
}

const categories = [
  { value: "all", label: "جميع التصنيفات" },
  { value: "سيارات", label: "سيارات" },
  { value: "عقارات", label: "عقارات" },
  { value: "الكترونيات", label: "الكترونيات" },
  { value: "أثاث", label: "أثاث" },
  { value: "ملابس", label: "ملابس" },
  { value: "خدمات", label: "خدمات" },
  { value: "وظائف", label: "وظائف" },
  { value: "أخرى", label: "أخرى" },
];

const cities = [
  { value: "all", label: "جميع المدن" },
  { value: "الرياض", label: "الرياض" },
  { value: "جدة", label: "جدة" },
  { value: "مكة المكرمة", label: "مكة المكرمة" },
  { value: "المدينة المنورة", label: "المدينة المنورة" },
  { value: "الدمام", label: "الدمام" },
  { value: "الخبر", label: "الخبر" },
  { value: "الطائف", label: "الطائف" },
  { value: "تبوك", label: "تبوك" },
  { value: "بريدة", label: "بريدة" },
  { value: "خميس مشيط", label: "خميس مشيط" },
];

const sortOptions = [
  { value: "newest", label: "الأحدث" },
  { value: "oldest", label: "الأقدم" },
  { value: "price_asc", label: "السعر: من الأقل للأعلى" },
  { value: "price_desc", label: "السعر: من الأعلى للأقل" },
];

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("ar-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 0,
  }).format(price);
};

const formatTime = (dateString: string): string => {
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

const AllListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 1000000,
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const fetchListings = async () => {
    setLoading(true);

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    // Apply search filter
    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }

    // Apply category filter
    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    // Apply city filter
    if (city && city !== "all") {
      query = query.eq("city", city);
    }

    // Apply price range filter
    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

    // Apply sorting
    switch (sortBy) {
      case "oldest":
        query = query.order("created_at", { ascending: true });
        break;
      case "price_asc":
        query = query.order("price", { ascending: true });
        break;
      case "price_desc":
        query = query.order("price", { ascending: false });
        break;
      default:
        query = query.order("created_at", { ascending: false });
    }

    const { data, error, count } = await query;

    if (!error && data) {
      setListings(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [searchQuery, category, city, sortBy, priceRange]);

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== "all") params.set("category", category);
    if (city !== "all") params.set("city", city);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 1000000) params.set("maxPrice", priceRange[1].toString());
    setSearchParams(params);
  };

  useEffect(() => {
    updateSearchParams();
  }, [searchQuery, category, city, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setCity("all");
    setSortBy("newest");
    setPriceRange([0, 1000000]);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchQuery ||
    category !== "all" ||
    city !== "all" ||
    sortBy !== "newest" ||
    priceRange[0] > 0 ||
    priceRange[1] < 1000000;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Category Filter */}
      <div className="space-y-2">
        <Label>التصنيف</Label>
        <Select value={category} onValueChange={setCategory}>
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

      {/* City Filter */}
      <div className="space-y-2">
        <Label>المدينة</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue placeholder="اختر المدينة" />
          </SelectTrigger>
          <SelectContent>
            {cities.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Price Range Filter */}
      <div className="space-y-4">
        <Label>نطاق السعر</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={1000000}
            step={1000}
            className="w-full"
          />
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{formatPrice(priceRange[0])}</span>
          <span>{formatPrice(priceRange[1])}</span>
        </div>
      </div>

      {/* Sort Filter */}
      <div className="space-y-2">
        <Label>ترتيب حسب</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="اختر الترتيب" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4 ml-2" />
          مسح الفلاتر
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            جميع الإعلانات
          </h1>
          <p className="text-muted-foreground">
            تصفح {totalCount} إعلان متاح
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في الإعلانات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Desktop Filters */}
          <div className="hidden lg:flex gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="التصنيف" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="المدينة" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الترتيب" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters} size="icon">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile Filter Button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4 ml-2" />
                الفلاتر
                {hasActiveFilters && (
                  <span className="mr-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <SheetHeader>
                <SheetTitle>فلترة الإعلانات</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <FilterContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                بحث: {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {categories.find((c) => c.value === category)?.label}
                <button onClick={() => setCategory("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {city !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {cities.find((c) => c.value === city)?.label}
                <button onClick={() => setCity("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 1000000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                السعر: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                <button onClick={() => setPriceRange([0, 1000000])}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground mb-4">
              لم نجد إعلانات تطابق معايير البحث
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                مسح الفلاتر
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing, index) => (
              <div
                key={listing.id}
                className="animate-fade-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <ListingCard
                  id={listing.id}
                  image={
                    listing.images?.[0] ||
                    "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=500&h=375&fit=crop"
                  }
                  title={listing.title}
                  price={formatPrice(listing.price)}
                  location={listing.city}
                  time={formatTime(listing.created_at)}
                  featured={listing.is_featured}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AllListings;
