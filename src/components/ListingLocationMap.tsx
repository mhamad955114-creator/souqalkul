import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2 } from "lucide-react";

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
}

interface Coords {
  lat: number;
  lon: number;
}

const cacheKey = (q: string) => `geocode:${q.toLowerCase()}`;

const ListingLocationMap = ({ city, area, country, latitude, longitude }: Props) => {
  const [coords, setCoords] = useState<Coords | null>(
    typeof latitude === "number" && typeof longitude === "number"
      ? { lat: latitude, lon: longitude }
      : null
  );
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
        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
          query
        )}`;
        const res = await fetch(url, {
          signal: controller.signal,
          headers: { "Accept-Language": "ar" },
        });
        if (!res.ok) throw new Error("geocode failed");
        const data = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (cancelled) return;
        if (data.length === 0) {
          setError(true);
        } else {
          const result: Coords = { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
          setCoords(result);
          try {
            sessionStorage.setItem(cacheKey(query), JSON.stringify(result));
          } catch {
            // ignore
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

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MapPin className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">الموقع على الخريطة</span>
        <span className="text-xs text-muted-foreground mr-auto">{query}</span>
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

        {!loading && !error && coords && (
          <MapContainer
            center={[coords.lat, coords.lon]}
            zoom={13}
            scrollWheelZoom={false}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[coords.lat, coords.lon]}>
              <Popup>{query}</Popup>
            </Marker>
          </MapContainer>
        )}
      </div>

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
