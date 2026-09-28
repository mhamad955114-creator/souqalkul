import { useEffect, useState } from "react";
import { Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/contexts/LanguageContext";

type Detail = { reason: string; points: number; at: string };
type Info = { points: number; details: Detail[] };

// Batch requests from many badges into one call
const cache = new Map<string, Promise<Info>>();
let queue: { id: string; resolve: (i: Info) => void }[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

const flush = async () => {
  const batch = queue; queue = []; timer = null;
  const { data } = await supabase.rpc("get_listings_points", { _listing_ids: batch.map((b) => b.id) });
  const map = new Map((data ?? []).map((r) => [r.listing_id, { points: r.points, details: (r.details as Detail[]) ?? [] }]));
  batch.forEach((b) => b.resolve(map.get(b.id) ?? { points: 0, details: [] }));
};

export const fetchListingPoints = (id: string, fresh = false) => {
  if (!fresh && cache.has(id)) return cache.get(id)!;
  const p = new Promise<Info>((resolve) => {
    queue.push({ id, resolve });
    if (!timer) timer = setTimeout(flush, 30);
  });
  cache.set(id, p);
  return p;
};

const labels = {
  ar: { pts: "نقطة", title: "نقاط هذا الإعلان", listing: "نشر الإعلان", sold: "بيع الإعلان", none: "لا توجد نقاط لهذا الإعلان بعد" },
  en: { pts: "pts", title: "Points for this listing", listing: "Listing posted", sold: "Listing sold", none: "No points for this listing yet" },
  tr: { pts: "puan", title: "Bu ilanın puanları", listing: "İlan yayınlandı", sold: "İlan satıldı", none: "Bu ilan için henüz puan yok" },
};

const ListingPointsBadge = ({ listingId, detailed = false }: { listingId: string; detailed?: boolean }) => {
  const { language } = useLanguage();
  const c = labels[(language as keyof typeof labels)] ?? labels.ar;
  const [info, setInfo] = useState<Info | null>(null);

  useEffect(() => {
    let alive = true;
    fetchListingPoints(listingId, detailed).then((i) => alive && setInfo(i));
    return () => { alive = false; };
  }, [listingId, detailed]);

  if (!info) return null;

  if (!detailed) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-primary font-bold" dir="ltr">
        <Gift className="h-3 w-3" />{info.points} {c.pts}
      </span>
    );
  }

  return (
    <div className="py-3 border-b border-border space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-bold text-foreground"><Gift className="h-4 w-4 text-primary" />{c.title}</span>
        <span className="text-primary font-bold" dir="ltr">{new Intl.NumberFormat("en-US").format(info.points)} {c.pts}</span>
      </div>
      {info.details.length === 0 ? (
        <p className="text-xs text-muted-foreground">{c.none}</p>
      ) : info.details.map((d, i) => (
        <div key={i} className="flex justify-between text-sm text-muted-foreground">
          <span>{(c as Record<string, string>)[d.reason] ?? d.reason} <span className="text-xs" dir="ltr">{new Date(d.at).toLocaleDateString("en-GB")}</span></span>
          <span className="text-primary" dir="ltr">+{d.points}</span>
        </div>
      ))}
    </div>
  );
};

export default ListingPointsBadge;
