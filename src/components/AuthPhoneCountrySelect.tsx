import { useMemo, useState } from "react";
import { phoneCountries, type PhoneCountry } from "@/lib/phoneCountries";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountry } from "@/lib/listingLocalization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export function AuthPhoneCountrySelect({ country, onChange }: {
  country: PhoneCountry;
  onChange: (code: string) => void;
}) {
  const { language } = useLanguage();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return phoneCountries;
    return phoneCountries.filter((item) =>
      item.name.includes(q) || item.code.toLowerCase().includes(q) || item.phoneCode.includes(q)
    );
  }, [query]);
  return (
    <Select value={country.code} onValueChange={onChange}>
      <SelectTrigger aria-label={language === "ar" ? "بلد رقم الهاتف" : language === "tr" ? "Telefon ülkesi" : "Phone country"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <div className="p-2 sticky top-0 bg-popover">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={language === "ar" ? "ابحث عن دولة..." : language === "tr" ? "Ülke ara..." : "Search country..."}
            className="h-8"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {filtered.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {localizeCountry(item.code, item.name, language)} <span dir="ltr">{item.phoneCode}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
