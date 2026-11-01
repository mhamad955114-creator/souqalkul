import { countries, type CountryInfo } from "@/lib/constants";
import { useLanguage } from "@/contexts/LanguageContext";
import { localizeCountry } from "@/lib/listingLocalization";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AuthPhoneCountrySelect({ country, onChange }: {
  country: CountryInfo;
  onChange: (code: string) => void;
}) {
  const { language } = useLanguage();
  return (
    <Select value={country.code} onValueChange={onChange}>
      <SelectTrigger aria-label={language === "ar" ? "بلد رقم الهاتف" : language === "tr" ? "Telefon ülkesi" : "Phone country"}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countries.map((item) => (
          <SelectItem key={item.code} value={item.code}>
            {localizeCountry(item.code, item.name, language)} <span dir="ltr">{item.phoneCode}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}