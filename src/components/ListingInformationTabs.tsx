import { Copy, MapPin } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ListingLocationMap from "@/components/ListingLocationMap";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCategoryDefinitions } from "@/hooks/useCategoryDefinitions";
import { categoryLabels, formatListingPrice, getCountryByName } from "@/lib/constants";
import { localizeCategory, localizeCity, localizeCountry, localizeFieldLabel, localizeOption } from "@/lib/listingLocalization";

const copy = {
  ar: { information: "معلومات الإعلان", location: "الموقع", price: "السعر", date: "تاريخ الإعلان", number: "رقم الإعلان", category: "التصنيف", phone: "رقم هاتف المعلن", country: "الدولة", city: "المدينة", area: "المنطقة", copied: "تم نسخ رقم الإعلان", copy: "نسخ رقم الإعلان", map: "عرض الموقع على خريطة أكبر" },
  en: { information: "Listing information", location: "Location", price: "Price", date: "Listing date", number: "Listing number", category: "Category", phone: "Seller phone", country: "Country", city: "City", area: "Area", copied: "Listing number copied", copy: "Copy listing number", map: "Open larger map" },
  tr: { information: "İlan Bilgileri", location: "Konumu", price: "Fiyat", date: "İlan Tarihi", number: "İlan No", category: "Kategori", phone: "Satıcının Telefonu", country: "Ülke", city: "Şehir", area: "Mahalle", copied: "İlan numarası kopyalandı", copy: "İlan numarasını kopyala", map: "Büyük haritada göster" },
};

interface Props {
  listing: {
    id: string; price: number; created_at: string; category: string; city: string;
    area: string | null; description: string | null; phone: string | null;
    country?: string | null; currency?: string | null; latitude?: number | null;
    longitude?: number | null; metadata?: Record<string, unknown> | null;
  };
  sellerPhone?: string | null;
  sharedLatitude: number | null;
  sharedLongitude: number | null;
  onOpenMap: () => void;
}

export default function ListingInformationTabs({ listing, sellerPhone, sharedLatitude, sharedLongitude, onOpenMap }: Props) {
  const { language, t, dir } = useLanguage();
  const { getFields } = useCategoryDefinitions();
  const labels = copy[language];
  const country = listing.country ? getCountryByName(listing.country) : null;
  const city = localizeCity(listing.city, country?.code || "", language);
  const phone = sellerPhone || listing.phone;
  const shortId = listing.id.split("-")[0].toUpperCase();
  const rows = [
    { key: "price", label: labels.price, value: language === "ar" ? formatListingPrice(listing.price, listing.currency, listing.country) : new Intl.NumberFormat(language === "tr" ? "tr-TR-u-nu-latn" : "en-US-u-nu-latn", { style: "currency", currency: listing.currency || country?.currencyCode || "USD", maximumFractionDigits: 0 }).format(listing.price) },
    { key: "date", label: labels.date, value: new Intl.DateTimeFormat(`${language}-u-nu-latn`, { day: "2-digit", month: "2-digit", year: "numeric", calendar: "gregory" }).format(new Date(listing.created_at)) },
    { key: "number", label: labels.number, value: shortId },
    { key: "category", label: labels.category, value: localizeCategory(categoryLabels[listing.category] || listing.category, t) },
    ...(country ? [{ key: "country", label: labels.country, value: localizeCountry(country.code, country.name, language) }] : []),
    { key: "city", label: labels.city, value: city },
    ...(listing.area ? [{ key: "area", label: labels.area, value: listing.area }] : []),
    ...getFields(listing.category).flatMap(field => {
      const value = listing.metadata?.[field.key];
      return value == null || value === "" ? [] : [{ key: `metadata-${field.key}`, label: localizeFieldLabel(field.key, field.label, language), value: localizeOption(String(value), language) }];
    }),
    ...(phone ? [{ key: "phone", label: labels.phone, value: phone }] : []),
  ];
  const triggerClass = "min-w-0 whitespace-normal rounded-t-md rounded-b-none border border-border border-b-0 px-2 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-none";

  return (
    <Tabs defaultValue="information" dir={dir} className="w-full min-w-0">
      <TabsList className="grid h-auto w-full grid-cols-3 gap-1 rounded-none border-b-2 border-primary bg-transparent p-0">
        <TabsTrigger value="information" className={triggerClass}>{labels.information}</TabsTrigger>
        <TabsTrigger value="description" className={triggerClass}>{t.details.description}</TabsTrigger>
        <TabsTrigger value="location" className={triggerClass}>{labels.location}</TabsTrigger>
      </TabsList>
      <TabsContent value="information" className="mt-0">
        <dl className="divide-y divide-border">
          {rows.map(row => (
            <div key={row.key} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] items-center gap-3 px-3 py-3.5 sm:px-4">
              <dt className="text-sm text-muted-foreground [overflow-wrap:anywhere]">{row.label}</dt>
              <dd className={`min-w-0 text-end text-sm [overflow-wrap:anywhere] ${row.key === "price" ? "font-bold text-primary" : "text-foreground"}`}>
                {row.key === "number" ? (
                  <Button variant="ghost" size="sm" className="h-auto max-w-full gap-1.5 p-0 font-mono text-destructive" title={labels.copy} aria-label={labels.copy} onClick={async () => {
                    try { await navigator.clipboard.writeText(shortId); toast.success(labels.copied); }
                    catch { toast.error(t.common.error); }
                  }}><bdi>{shortId}</bdi><Copy className="h-3.5 w-3.5 shrink-0" /></Button>
                ) : <bdi dir={row.key === "phone" ? "ltr" : "auto"}>{row.value}</bdi>}
              </dd>
            </div>
          ))}
        </dl>
      </TabsContent>
      <TabsContent value="description" className="mt-0 px-3 py-5 sm:px-4">
        <p dir="auto" className="whitespace-pre-wrap text-sm leading-7 text-foreground [overflow-wrap:anywhere]">{listing.description || t.details.noDescription}</p>
      </TabsContent>
      <TabsContent value="location" className="mt-0 space-y-3 py-4">
        <p className="px-3 text-sm text-muted-foreground">{city}{listing.area ? `، ${listing.area}` : ""}</p>
        <ListingLocationMap listingId={listing.id} city={listing.city} area={listing.area} country={listing.country} latitude={listing.latitude} longitude={listing.longitude} sharedLatitude={sharedLatitude} sharedLongitude={sharedLongitude} compact />
        <Button variant="outline" className="w-full" onClick={onOpenMap}><MapPin className="h-4 w-4" />{labels.map}</Button>
      </TabsContent>
    </Tabs>
  );
}