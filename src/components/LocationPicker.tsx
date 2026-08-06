import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Crosshair, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatCoordinate } from "@/lib/utils";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface ResolvedAddress {
  displayName: string;
  country?: string;
  city?: string;
  area?: string;
}

interface Props {
  latitude: number | null;
  longitude: number | null;
  onChange: (lat: number | null, lng: number | null) => void;
  /** Free-text query used to auto-center the map when no coords are set */
  hint?: string;
  language?: string;
  /** Called when reverse geocoding resolves the address for the picked point */
  onAddressResolved?: (address: ResolvedAddress) => void;
  /** Called when the user taps the suggested address to auto-fill city/area */
  onApplyAddress?: (address: ResolvedAddress) => void;

}

const DEFAULT_CENTER: [number, number] = [33.5138, 36.2765]; // Damascus fallback

const ClickHandler = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const Recenter = ({ center, zoom }: { center: [number, number]; zoom?: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom ?? map.getZoom(), { animate: true });
  }, [center[0], center[1]]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
};

const LocationPicker = ({ latitude, longitude, onChange, hint, language = "ar", onAddressResolved }: Props) => {
  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const [center, setCenter] = useState<[number, number]>(
    hasCoords ? [latitude!, longitude!] : DEFAULT_CENTER
  );
  const [zoom, setZoom] = useState(hasCoords ? 15 : 6);
  const [geocoding, setGeocoding] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [resolved, setResolved] = useState<ResolvedAddress | null>(null);
  const lastHint = useRef<string>("");
  const reverseAbort = useRef<AbortController | null>(null);
  const reverseKey = useRef<string>("");

  const reverseGeocode = async (lat: number, lng: number) => {
    const key = `${lat.toFixed(5)},${lng.toFixed(5)}`;
    if (key === reverseKey.current) return;
    reverseKey.current = key;
    reverseAbort.current?.abort();
    const controller = new AbortController();
    reverseAbort.current = controller;
    setReverseLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`,
        { signal: controller.signal, headers: { "Accept-Language": language } }
      );
      if (!res.ok) return;
      const data = await res.json();
      const a = data?.address || {};
      const address: ResolvedAddress = {
        displayName: data?.display_name || "",
        country: a.country,
        city: a.city || a.town || a.village || a.municipality || a.county,
        area: a.suburb || a.neighbourhood || a.quarter || a.city_district || a.district,
      };
      setResolved(address);
      onAddressResolved?.(address);
    } catch {
      // ignore
    } finally {
      setReverseLoading(false);
    }
  };

  // Auto-geocode from hint (city/area/country) when user has no coords yet

  useEffect(() => {
    if (hasCoords) return;
    const q = (hint || "").trim();
    if (!q || q === lastHint.current) return;
    lastHint.current = q;

    const controller = new AbortController();
    setGeocoding(true);
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
          { signal: controller.signal, headers: { "Accept-Language": language } }
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setCenter([lat, lng]);
          setZoom(13);
        }
      } catch {
        // ignore
      } finally {
        setGeocoding(false);
      }
    })();
    return () => controller.abort();
  }, [hint, hasCoords, language]);

  const pick = (lat: number, lng: number) => {
    onChange(lat, lng);
    setCenter([lat, lng]);
    reverseGeocode(lat, lng);
  };

  // Reverse geocode when coords are provided/updated externally
  useEffect(() => {
    if (hasCoords) reverseGeocode(latitude!, longitude!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latitude, longitude]);


  const useMyLocation = () => {
    if (!("geolocation" in navigator)) {
      toast.error("المتصفح لا يدعم تحديد الموقع");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        pick(pos.coords.latitude, pos.coords.longitude);
        setZoom(16);
        setGpsLoading(false);
        toast.success("تم تحديد موقعك الحالي");
      },
      () => {
        setGpsLoading(false);
        toast.error("تعذّر الوصول إلى موقعك");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const clear = () => {
    onChange(null, null);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium">الموقع الدقيق على الخريطة</span>
          {geocoding && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={useMyLocation}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-input bg-background hover:bg-accent disabled:opacity-50"
          >
            {gpsLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Crosshair className="h-3.5 w-3.5" />
            )}
            موقعي
          </button>
          {hasCoords && (
            <button
              type="button"
              onClick={clear}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-input bg-background hover:bg-accent"
            >
              <X className="h-3.5 w-3.5" />
              مسح
            </button>
          )}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden border border-border">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "220px", width: "100%" }}
          scrollWheelZoom={false}
          className="z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Recenter center={center} zoom={zoom} />
          <ClickHandler onPick={pick} />
          {hasCoords && (
            <Marker
              draggable
              position={[latitude!, longitude!]}
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const p = m.getLatLng();
                  onChange(p.lat, p.lng);
                  reverseGeocode(p.lat, p.lng);
                },
              }}

            />
          )}
        </MapContainer>
      </div>

      <p className="text-xs text-muted-foreground">
        اضغط على الخريطة أو اسحب الدبوس لتحديد الموقع بدقة. اختياري — إن لم تحدد سنستخدم موقع المدينة تقريبياً.
      </p>
      {hasCoords && (
        <div className="space-y-1">
          <p className="text-[11px] font-mono text-muted-foreground" dir="ltr">
            {formatCoordinate(latitude)}, {formatCoordinate(longitude)}
          </p>
          {(() => {
            const clickable = !reverseLoading && !!resolved?.displayName && !!onApplyAddress;
            const Tag = clickable ? "button" : "div";
            return (
              <Tag
                {...(clickable
                  ? {
                      type: "button" as const,
                      onClick: () => onApplyAddress!(resolved!),
                      title: "اضغط لتعبئة المدينة والمنطقة تلقائياً",
                    }
                  : {})}
                className={`w-full text-right text-xs text-foreground bg-muted/50 rounded-md px-2 py-1.5 flex items-start gap-1.5 ${
                  clickable ? "hover:bg-accent transition-colors cursor-pointer" : ""
                }`}
              >
                <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  {reverseLoading ? (
                    <span className="text-muted-foreground inline-flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      جارِ تحديد العنوان...
                    </span>
                  ) : resolved?.displayName ? (
                    <>
                      <span className="font-medium">العنوان المقترح:</span>{" "}
                      <span className="break-words">{resolved.displayName}</span>
                      {clickable && (
                        <span className="block mt-1 text-[11px] text-primary font-medium">
                          اضغط لتعبئة المدينة والمنطقة تلقائياً
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-muted-foreground">لم يتم العثور على عنوان</span>
                  )}
                </div>
              </Tag>
            );
          })()}

        </div>
      )}
    </div>
  );
};


export default LocationPicker;
