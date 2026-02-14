import { useState, useEffect, useCallback, useRef } from "react";
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
import { Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";

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
  status: string | null;
}

const ITEMS_PER_PAGE = 20;

const AllListings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const currentPageRef = useRef(1);
  const { t, dir } = useLanguage();

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
  
  const availableAreas = city && city !== "all" ? areasByCity[city] || [] : [];

  const fetchListings = useCallback(async (page: number, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    const from = (page - 1) * ITEMS_PER_PAGE;
    const to = from + ITEMS_PER_PAGE - 1;

    let query = supabase
      .from("listings")
      .select("*", { count: "exact" })
      .eq("status", "active");

    if (searchQuery) {
      query = query.ilike("title", `%${searchQuery}%`);
    }
    if (category && category !== "all") {
      query = query.eq("category", category);
    } else {
      // Hide dating listings from "all" view
      query = query.neq("category", "تعارف");
    }
    if (city && city !== "all") {
      query = query.eq("city", city);
    }
    if (area && area !== "all") {
      query = query.eq("area", area);
    }

    query = query.gte("price", priceRange[0]).lte("price", priceRange[1]);
    query = query.order("is_featured", { ascending: false });

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

    query = query.range(from, to);

    const { data, error, count } = await query;

    if (!error && data) {
      if (append) {
        setListings(prev => [...prev, ...data]);
      } else {
        setListings(data);
      }
      setTotalCount(count || 0);
      setHasMore(from + data.length < (count || 0));
    }
    setLoading(false);
    setLoadingMore(false);
  }, [searchQuery, category, city, area, sortBy, priceRange]);

  useEffect(() => {
    currentPageRef.current = 1;
    fetchListings(1, false);
  }, [fetchListings, refreshTrigger]);

  useEffect(() => {
    setArea("all");
  }, [city]);

  // Infinite scroll observer
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          currentPageRef.current += 1;
          fetchListings(currentPageRef.current, true);
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, loading, loadingMore, fetchListings]);

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== "all") params.set("category", category);
    if (city !== "all") params.set("city", city);
    if (area !== "all") params.set("area", area);
    if (sortBy !== "newest") params.set("sort", sortBy);
    if (priceRange[0] > 0) params.set("minPrice", priceRange[0].toString());
    if (priceRange[1] < 500000000) params.set("maxPrice", priceRange[1].toString());
    setSearchParams(params);
  };

  useEffect(() => {
    updateSearchParams();
  }, [searchQuery, category, city, area, sortBy, priceRange]);

  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setCity("all");
    setArea("all");
    setSortBy("newest");
    setPriceRange([0, 500000000]);
    setSearchParams({});
  };

  const handleListingAdded = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const hasActiveFilters =
    searchQuery ||
    category !== "all" ||
    city !== "all" ||
    area !== "all" ||
    sortBy !== "newest" ||
    priceRange[0] > 0 ||
    priceRange[1] < 500000000;

  // Translated sort options
  const translatedSortOptions = [
    { value: "newest", label: t.listings.newest },
    { value: "oldest", label: t.listings.oldest },
    { value: "price_asc", label: t.listings.priceAsc },
    { value: "price_desc", label: t.listings.priceDesc },
  ];

  // Translated categories
  const translatedCategoriesWithAll = [
    { value: "all", label: t.categories.allCategories },
    { value: "سيارات", label: t.categories.cars },
    { value: "عقارات", label: t.categories.realEstate },
    { value: "الكترونيات", label: t.categories.electronics },
    { value: "أثاث", label: t.categories.furniture },
    { value: "ملابس", label: t.categories.clothing },
    { value: "خدمات", label: t.categories.services },
    { value: "وظائف", label: t.categories.jobs },
    { value: "ألعاب", label: t.categories.games },
    { value: "تعارف", label: t.categories.dating },
    { value: "حيوانات أليفة", label: t.categories.pets },
    { value: "معدات صناعية", label: t.categories.industrial },
    { value: "معدات زراعية", label: t.categories.agricultural },
    { value: "أخرى", label: t.categories.other },
  ];

  // Translated cities
  const translatedCitiesWithAll = [
    { value: "all", label: t.cities.allCities },
    { value: "دمشق", label: t.cities.damascus },
    { value: "حلب", label: t.cities.aleppo },
    { value: "حمص", label: t.cities.homs },
    { value: "حماة", label: t.cities.hama },
    { value: "اللاذقية", label: t.cities.latakia },
    { value: "طرطوس", label: t.cities.tartus },
    { value: "دير الزور", label: t.cities.deirEzZor },
    { value: "الرقة", label: t.cities.raqqa },
    { value: "الحسكة", label: t.cities.hasaka },
    { value: "درعا", label: t.cities.daraa },
    { value: "السويداء", label: t.cities.sweida },
    { value: "إدلب", label: t.cities.idlib },
    { value: "القنيطرة", label: t.cities.quneitra },
    { value: "ريف دمشق", label: t.cities.rifDimashq },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>{t.listings.category}</Label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {translatedCategoriesWithAll.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t.listings.city}</Label>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {translatedCitiesWithAll.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {city !== "all" && availableAreas.length > 0 && (
        <div className="space-y-2">
          <Label>{t.listings.area}</Label>
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.listings.allAreas}</SelectItem>
              {availableAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-4">
        <Label>{t.listings.priceRange}</Label>
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

      <div className="space-y-2">
        <Label>{t.listings.sortBy}</Label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {translatedSortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={clearFilters}
          className="w-full"
        >
          <X className="h-4 w-4" />
          {t.listings.clearFilters}
        </Button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0" dir={dir}>
      <Header onListingAdded={handleListingAdded} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t.listings.allListings}
          </h1>
          <p className="text-muted-foreground">
            {t.listings.browseAds} {totalCount} {t.listings.available}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className={`absolute ${dir === "rtl" ? "right-3" : "left-3"} top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground`} />
            <Input
              placeholder={t.listings.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={dir === "rtl" ? "pr-10" : "pl-10"}
            />
          </div>

          <div className="hidden lg:flex gap-4">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {translatedCategoriesWithAll.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={city} onValueChange={setCity}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {translatedCitiesWithAll.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {city !== "all" && availableAreas.length > 0 && (
              <Select value={area} onValueChange={setArea}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t.listings.allAreas}</SelectItem>
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
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {translatedSortOptions.map((option) => (
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

          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="h-4 w-4" />
                {t.listings.filters}
                {hasActiveFilters && (
                  <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                    !
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "right" : "left"} className="w-80">
              <SheetHeader>
                <SheetTitle>{t.listings.filterListings}</SheetTitle>
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
                {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {category !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {translatedCategoriesWithAll.find((c) => c.value === category)?.label}
                <button onClick={() => setCategory("all")}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {city !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-secondary rounded-full text-sm">
                {translatedCitiesWithAll.find((c) => c.value === city)?.label}
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
                {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
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
            <h3 className="text-xl font-semibold mb-2">{t.listings.noListings}</h3>
            <p className="text-muted-foreground mb-4">
              {t.listings.noListings}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                {t.listings.clearFilters}
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
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
                    status={listing.status}
                    category={listing.category}
                  />
                </div>
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && (
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              )}
            </div>

            {totalCount > 0 && (
              <p className="text-center text-sm text-muted-foreground">
                {listings.length} / {totalCount} {t.listings.ad}
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
