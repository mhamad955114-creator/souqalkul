import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ListingCard from "@/components/ListingCard";
import BottomNavigation from "@/components/BottomNavigation";
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
import { Search, SlidersHorizontal, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  categoriesWithAll, 
  citiesWithAll, 
  sortOptions, 
  formatPrice, 
  formatTime,
  areasByCity 
} from "@/lib/constants";

interface Listing {
  id: string;
  title: string;
  price: number;
  city: string;
  area: string | null;
  category: string;
  images: string[];
  is_featured: boolean;
  created_at: string;
}

const ITEMS_PER_PAGE = 12;

const AllListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "all");
  const [city, setCity] = useState(searchParams.get("city") || "all");
  const [area, setArea] = useState(searchParams.get("area") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([
    Number(searchParams.get("minPrice")) || 0,
    Number(searchParams.get("maxPrice")) || 500000000,
  ]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  // Get available areas for selected city
  const availableAreas = city && city !== "all" ? areasByCity[city] || [] : [];
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get("page")) || 1);
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const fetchListings = async () => {
    setLoading(true);

    const from = (currentPage - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

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

    // Apply area filter
    if (area && area !== "all") {
      query = query.eq("area", area);
    }

    // Apply price range filter
    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);

    // Always show featured (paid) listings first
    query = query.order("is_featured", { ascending: false });

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

    // Apply pagination
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (!error && data) {
      setListings(data);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();
  }, [searchQuery, category, city, area, sortBy, priceRange, currentPage, refreshTrigger]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, category, city, area, sortBy, priceRange]);

  // Reset area when city changes
  useEffect(() => {
    setArea("all");
  }, [city]);

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== "all") params.set("category", category);
    if (city !== "all") params.set("city", city);
    if (area !== "all") params.set("area", area);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 500000000) params.set("maxPrice", priceRange[1].toString());
    if (currentPage > 1) params.set("page", currentPage.toString());
    setSearchParams(params);
  };

  useEffect(() => {
    updateSearchParams();
  }, [searchQuery, category, city, area, sortBy, priceRange, currentPage]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setCity("all");
    setArea("all");
    setSortBy("newest");
    setPriceRange([0, 500000000]);
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleListingAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      if (currentPage > 3) {
        pages.push("...");
      }
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }
      
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }
      
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const hasActiveFilters =
    searchQuery ||
    category !== "all" ||
    city !== "all" ||
    area !== "all" ||
    sortBy !== "newest" ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000000;

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
            {categoriesWithAll.map((cat) => (
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
            {citiesWithAll.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Area Filter */}
      {city !== "all" && availableAreas.length > 0 && (
        <div className="space-y-2">
          <Label>المنطقة</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger>
              <SelectValue placeholder="اختر المنطقة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع المناطق</SelectItem>
              {availableAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Price Range Filter */}
      <div className="space-y-4">
        <Label>نطاق السعر</Label>
        <div className="px-2">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            max={500000000}
            step={1000000}
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
    <div className="min-h-screen bg-background pb-20 md:pb-0" dir="rtl">
      <Header onListingAdded={handleListingAdded} />

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
                {categoriesWithAll.map((cat) => (
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
                {citiesWithAll.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {city !== "all" && availableAreas.length > 0 && (
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="المنطقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المناطق</SelectItem>
                  {availableAreas.map((a) => (
                    <SelectItem key={a} value={a}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

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
                {categoriesWithAll.find((c) => c.value === category)?.label}
                <button onClick={() => setCategory("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {city !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {citiesWithAll.find((c) => c.value === city)?.label}
                <button onClick={() => setCity("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {area !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {area}
                <button onClick={() => setArea("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {(priceRange[0] > 0 || priceRange[1] < 500000000) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                السعر: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                <button onClick={() => setPriceRange([0, 500000000])}>
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
          <>
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {getPageNumbers().map((page, index) =>
                  page === "..." ? (
                    <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                      ...
                    </span>
                  ) : (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="icon"
                      onClick={() => goToPage(page as number)}
                    >
                      {page}
                    </Button>
                  )
                )}

                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Pagination Info */}
            {totalPages > 1 && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                عرض {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} من {totalCount} إعلان
              </p>
            )}
          </>
        )}
      </main>

      <Footer />
      <BottomNavigation onListingAdded={handleListingAdded} />
    </div>
  );
};

export default AllListings;
