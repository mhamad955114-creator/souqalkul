import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, Crosshair, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Fix default marker icons (Leaflet ships them as bundler-incompatible URLs)
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Props {
  city?: string | null;
  area?: string | null;
  country?: string | null;
  /** If saved coordinates exist on the listing, use them directly */
  latitude?: number | null;
  longitude?: number | null;
  /** Listing id — when provided, persist geocoded coords back to DB once */
  listingId?: string;
}

type AccuracyLevel = "exact" | "high" | "medium" | "low" | "very_low" | "saved";

interface Coords {
  lat: number;
  lon: number;
  accuracy: AccuracyLevel;
  addresstype?: string;
  /** Approximate radius of uncertainty in meters */
  radius: number;
}

const cacheKey = (q: string) => `geocode:${q.toLowerCase()}`;

const accuracyMeta: Record<
  AccuracyLevel,
  { label: string; color: string; description: string; zoom: number }
> = {
  saved: {
    label: "موقع محفوظ",
    color: "text-emerald-600 dark:text-emerald-400",
    description: "إحداثيات دقيقة محفوظة من قبل البائع.",
    zoom: 16,
  },
  exact: {
    label: "دقيق جداً",
    color: "text-emerald-600 dark:text-emerald-400",
    description: "تم تحديد العنوان على مستوى المبنى.",
    zoom: 17,
  },
  high: {
    label: "دقيق",
    color: "text-emerald-600 dark:text-emerald-400",
    description: "تم تحديد الموقع على مستوى الشارع.",
    zoom: 16,
  },
  medium: {
    label: "تقريبي",
    color: "text-amber-600 dark:text-amber-400",
    description: "الموقع تقريبي على مستوى الحي أو المنطقة.",
    zoom: 14,
  },
  low: {
    label: "تقريبي",
    color: "text-amber-600 dark:text-amber-400",
    description: "الموقع تقريبي ويشير إلى مركز المدينة فقط.",
    zoom: 12,
  },
  very_low: {
    label: "تقريبي جداً",
    color: "text-orange-600 dark:text-orange-400",
    description: "تعذّر تحديد الموقع بدقة، النقطة تشير إلى منطقة عامة.",
    zoom: 9,
  },
};

const classifyAccuracy = (
  addresstype?: string,
  osmType?: string
): { level: AccuracyLevel; radius: number } => {
  const t = (addresstype || osmType || "").toLowerCase();
  if (["building", "house", "amenity", "shop", "office"].includes(t))
    return { level: "exact", radius: 50 };
  if (["road", "street", "footway", "pedestrian"].includes(t))
    return { level: "high", radius: 150 };
  if (["suburb", "neighbourhood", "quarter", "hamlet", "residential"].includes(t))
    return { level: "medium", radius: 600 };
  if (["village", "town", "city", "municipality"].includes(t))
    return { level: "low", radius: 2000 };
  if (["state", "region", "province", "country"].includes(t))
    return { level: "very_low", radius: 10000 };
  return { level: "medium", radius: 800 };
};

const fmtCoord = (n: number) => n.toFixed(6);

const ListingLocationMap = ({ city, area, country, latitude, longitude, listingId }: Props) => {
  const initial: Coords | null =
    typeof latitude === "number" && typeof longitude === "number"
      ? { lat: latitude, lon: longitude, accuracy: "saved", radius: 25 }
      : null;

  const [coords, setCoords] = useState<Coords | null>(initial);
  const [loading, setLoading] = useState(!coords);
  const [error, setError] = useState(false);

  const query = [area, city, country].filter(Boolean).join(", ");

  useEffect(() => {
    if (coords || !query) {
      if (!query) setLoading(false);
      return;
    }

    // Try cache first
    try {
      const cached = sessionStorage.getItem(cacheKey(query));
      if (cached) {
        const parsed = JSON.parse(cached) as Coords;
        setCoords(parsed);
        setLoading(false);
        return;
      }
    } catch {
      // ignore storage errors
    }

    let cancelled = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    (async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=1&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "ar" },
        });
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as Array<{
          lat: string;
          lon: string;
          addresstype?: string;
          type?: string;
          class?: string;
        }>;
        if (cancelled) return;
        if (data.length === 0) {
          setError(true);
        } else {
          const r = data[0];
          const { level, radius } = classifyAccuracy(r.addresstype, r.type);
          const result: Coords = {
            lat: parseFloat(r.lat),
            lon: parseFloat(r.lon),
            accuracy: level,
            addresstype: r.addresstype || r.type,
            radius,
          };
          setCoords(result);
          try {
            sessionStorage.setItem(cacheKey(query), JSON.stringify(result));
          } catch {
            // ignore
          }
          // Persist to DB once so future visitors skip Nominatim entirely
          if (listingId) {
            supabase
              .from("listings")
              .update({ latitude: result.lat, longitude: result.lon })
              .eq("id", listingId)
              .is("latitude", null)
              .then(({ error: updErr }) => {
                if (updErr) console.warn("persist coords failed", updErr.message);
              });
          }
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        clearTimeout(timeoutId);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [query, coords]);

  if (!query) return null;

  const meta = coords ? accuracyMeta[coords.accuracy] : null;
  const isApproximate =
    coords && (coords.accuracy === "medium" || coords.accuracy === "low" || coords.accuracy === "very_low");

  const copyCoords = () => {
    if (!coords) return;
    const text = `${fmtCoord(coords.lat)}, ${fmtCoord(coords.lon)}`;
    navigator.clipboard.writeText(text);
    toast.success("تم نسخ الإحداثيات");
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">الموقع على الخريطة</span>
        <span className="text-xs text-muted-foreground mr-auto truncate">{query}</span>
      </div>

      <div className="relative h-56 w-full bg-muted">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground p-4 text-center">
            تعذّر تحديد الموقع على الخريطة
          </div>
        )}

        {!loading && !error && coords && meta && (
          <MapContainer
            key={`${coords.lat}-${coords.lon}`}
            center={[coords.lat, coords.lon]}
            zoom={meta.zoom}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isApproximate && (
              <Circle
                center={[coords.lat, coords.lon]}
                radius={coords.radius}
                pathOptions={{ color: "#f59e0b", fillColor: "#f59e0b", fillOpacity: 0.12, weight: 1 }}
              />
            )}
            <Marker position={[coords.lat, coords.lon]}>
              <Popup>
                <div className="text-xs space-y-1" dir="rtl">
                  <div className="font-semibold">{query}</div>
                  <div className="font-mono text-[11px] text-gray-600" dir="ltr">
                    {fmtCoord(coords.lat)}, {fmtCoord(coords.lon)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

      {coords && meta && (
        <div className="px-4 py-3 border-t border-border space-y-2">
          {/* Accuracy badge + description */}
          <div className="flex items-start gap-2">
            <Crosshair className={`h-4 w-4 mt-0.5 shrink-0 ${meta.color}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-sm font-semibold ${meta.color}`}>
                  دقة الموقع: {meta.label}
                </span>
                {isApproximate && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    موقع تقريبي
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{meta.description}</p>
            </div>
          </div>

          {/* Coordinates row */}
          <button
            onClick={copyCoords}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
          >
            <Copy className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
            <span className="font-mono text-xs text-foreground" dir="ltr">
              {fmtCoord(coords.lat)}, {fmtCoord(coords.lon)}
            </span>
          </button>
        </div>
      )}

      {coords && (
        <a
          href={`https://www.openstreetmap.org/?mlat=${coords.lat}&mlon=${coords.lon}#map=15/${coords.lat}/${coords.lon}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-center py-2.5 text-sm text-primary hover:bg-muted transition-colors border-t border-border"
        >
          فتح في خرائط OpenStreetMap
        </a>
      )}
    </div>
  );
};

export default ListingLocationMap;
