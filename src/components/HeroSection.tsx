import { Search, MapPin, Loader2, Navigation, Mic, MicOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCountry } from "@/contexts/CountryContext";
import { cities as allCities, areasByCity } from "@/lib/constants";
import { useSpeechSearch } from "@/hooks/useSpeechSearch";

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const { loading: geoLoading, detectLocation } = useGeolocation();
  const { t, dir, language } = useLanguage();
  const { currentCity, setCity, currentCountry } = useCountry();
  const cities = currentCountry?.cities?.length ? currentCountry.cities : allCities;
  const navigate = useNavigate();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const cityPrefilled = useRef(false);
  const { isListening, toggleListening } = useSpeechSearch(language, setSearchValue);

  // تعبئة المدينة تلقائياً بعد اكتشافها (مرة واحدة، ودون الكتابة فوق اختيار المستخدم)
  useEffect(() => {
    if (cityPrefilled.current || !currentCity) return;
    if (selectedCity || locationValue.trim()) return;
    cityPrefilled.current = true;
    setSelectedCity(currentCity);
    setLocationValue(currentCity);
  }, [currentCity, selectedCity, locationValue]);


  // Build suggestions: if a city is selected, show its areas; otherwise show cities
  const getSuggestions = (): { label: string; type: "city" | "area" }[] => {
    const query = locationValue.trim();

    if (selectedCity) {
      // Show areas for the selected city
      const areas = areasByCity[selectedCity] || [];
      const areaAfterCity = query.startsWith(selectedCity)
        ? query.slice(selectedCity.length).replace(/^[\s،,\-]+/, "").trim()
        : "";
      const filtered = areaAfterCity
        ? areas.filter((a) => a.includes(areaAfterCity))
        : areas;
      return filtered.map((a) => ({ label: a, type: "area" as const }));
    }

    // Show cities
    const filtered = query ? cities.filter((c) => c.includes(query)) : cities;
    return filtered.map((c) => ({ label: c, type: "city" as const }));
  };

  const suggestions = getSuggestions();

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      setLocationValue(result.city);
      setSelectedCity(result.city);
      cityPrefilled.current = true;
      if (result.city) setCity(result.city);
      setShowSuggestions(true);
      setHighlightedIndex(-1);
    }
  };


  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchValue.trim()) params.set("q", searchValue.trim());
    const matchedCity = selectedCity || cities.find((c) => locationValue.includes(c));
    if (matchedCity) params.set("city", matchedCity);
    // Check if an area is included
    if (selectedCity) {
      const areas = areasByCity[selectedCity] || [];
      const matchedArea = areas.find((a) => locationValue.includes(a));
      if (matchedArea) params.set("area", matchedArea);
    }
    setShowSuggestions(false);
    navigate(`/listings?${params.toString()}`);
  };

  const handleSelectSuggestion = (item: { label: string; type: "city" | "area" }) => {
    if (item.type === "city") {
      setLocationValue(item.label);
      setSelectedCity(item.label);
      cityPrefilled.current = true;
      setCity(item.label);

      setShowSuggestions(true);
      setHighlightedIndex(-1);
      // Focus back on input
      setTimeout(() => locationInputRef.current?.focus(), 0);
    } else {
      setLocationValue(`${selectedCity} - ${item.label}`);
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleLocationKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      } else {
        handleSearch();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    } else if (e.key === "Backspace" && selectedCity && !locationValue.replace(selectedCity, "").trim()) {
      // If user deletes back to empty after city, reset city selection
      setSelectedCity("");
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node) &&
          locationInputRef.current && !locationInputRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <section className="relative gradient-hero text-primary-foreground py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 right-20 w-64 h-64 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-up">
            {t.hero.title1}<span className="text-primary">{t.hero.titleHighlight}</span>
          </h1>
          <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            {t.hero.subtitle}
          </p>

          {/* Search Box */}
          <div className="bg-card rounded-2xl p-4 md:p-6 shadow-card-hover animate-fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground`} />
                <Input
                  type="text"
                  placeholder={t.hero.searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  className={`${dir === "rtl" ? "pr-12 pl-11" : "pl-12 pr-11"} h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={toggleListening}
                  aria-label={language === "ar" ? (isListening ? "إيقاف الاستماع" : "البحث بالصوت") : isListening ? "Stop listening" : "Voice search"}
                  title={language === "ar" ? (isListening ? "إيقاف الاستماع" : "البحث بالصوت") : isListening ? "Stop listening" : "Voice search"}
                  className={`absolute ${dir === "rtl" ? "left-1" : "right-1"} top-1/2 -translate-y-1/2 h-10 w-10 ${isListening ? "text-destructive animate-pulse" : "text-muted-foreground"}`}
                >
                  {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>
              <div className="relative flex-1">
                <MapPin className={`absolute ${dir === "rtl" ? "right-4" : "left-4"} top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10`} />
                <Input
                  ref={locationInputRef}
                  type="text"
                  placeholder={t.hero.locationPlaceholder}
                  value={locationValue}
                  onChange={(e) => {
                    const val = e.target.value;
                    setLocationValue(val);
                    setShowSuggestions(true);
                    setHighlightedIndex(-1);
                    // Reset city if user clears the input
                    if (!val.trim()) setSelectedCity("");
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={handleLocationKeyDown}
                  className={`${dir === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"} h-12 bg-secondary border-0 text-foreground placeholder:text-muted-foreground`}
                  autoComplete="off"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    className="absolute top-full mt-1 w-full bg-card border border-border rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto"
                  >
                    {selectedCity && (
                      <div className="px-4 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border bg-secondary/50 rounded-t-xl">
                        {selectedCity} — {t.listings.area}
                      </div>
                    )}
                    {suggestions.map((item, index) => (
                      <button
                        key={item.label}
                        type="button"
                        onMouseDown={() => handleSelectSuggestion(item)}
                        className={`w-full text-start px-4 py-2.5 text-sm text-foreground hover:bg-secondary transition-colors flex items-center gap-2 ${
                          index === highlightedIndex ? "bg-secondary" : ""
                        } ${!selectedCity && index === 0 ? "rounded-t-xl" : ""} ${index === suggestions.length - 1 ? "rounded-b-xl" : ""}`}
                      >
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={geoLoading}
                  className={`absolute ${dir === "rtl" ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors`}
                  title={t.hero.detectLocation}
                >
                  {geoLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Navigation className="h-5 w-5" />
                  )}
                </button>
              </div>
              <Button variant="hero" size="lg" onClick={handleSearch}>
                <Search className="h-5 w-5" />
                {t.hero.search}
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-12 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+50K</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.activeAds}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+100K</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.users}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary">+20</div>
              <div className="text-primary-foreground/70 text-sm">{t.hero.categoriesCount}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
