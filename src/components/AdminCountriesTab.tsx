import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { countries } from "@/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Globe, Save, Power, PowerOff, FileText, Users } from "lucide-react";
import { toast } from "sonner";

interface CountryStatusRow {
  country_name: string;
  is_enabled: boolean;
  disabled_message: string | null;
}

interface CountryStats {
  listings: number;
  users: number;
}

const AdminCountriesTab = () => {
  const [statuses, setStatuses] = useState<Record<string, CountryStatusRow>>({});
  const [stats, setStats] = useState<Record<string, CountryStats>>({});
  const [loading, setLoading] = useState(true);
  const [savingCountry, setSavingCountry] = useState<string | null>(null);

  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const [statusRes, listingsRes, profilesRes] = await Promise.all([
        supabase.from("country_status").select("country_name, is_enabled, disabled_message"),
        supabase.from("listings").select("country").eq("status", "active"),
        supabase.from("profiles").select("country"),
      ]);

      if (statusRes.error) throw statusRes.error;

      const statusMap: Record<string, CountryStatusRow> = {};
      countries.forEach((c) => {
        statusMap[c.name] = { country_name: c.name, is_enabled: true, disabled_message: "" };
      });
      (statusRes.data || []).forEach((row) => {
        statusMap[row.country_name] = {
          country_name: row.country_name,
          is_enabled: row.is_enabled,
          disabled_message: row.disabled_message ?? "",
        };
      });
      setStatuses(statusMap);

      // Aggregate stats per country
      const statsMap: Record<string, CountryStats> = {};
      countries.forEach((c) => {
        statsMap[c.name] = { listings: 0, users: 0 };
      });
      (listingsRes.data || []).forEach((l: any) => {
        const name = l.country || "سوريا";
        if (!statsMap[name]) statsMap[name] = { listings: 0, users: 0 };
        statsMap[name].listings += 1;
      });
      (profilesRes.data || []).forEach((p: any) => {
        const name = p.country || "سوريا";
        if (!statsMap[name]) statsMap[name] = { listings: 0, users: 0 };
        statsMap[name].users += 1;
      });
      setStats(statsMap);
    } catch (e: any) {
      toast.error("فشل في تحميل حالات الدول: " + (e?.message || ""));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  const handleToggle = (countryName: string, enabled: boolean) => {
    setStatuses((prev) => ({
      ...prev,
      [countryName]: { ...prev[countryName], is_enabled: enabled },
    }));
  };

  const handleMessageChange = (countryName: string, message: string) => {
    setStatuses((prev) => ({
      ...prev,
      [countryName]: { ...prev[countryName], disabled_message: message },
    }));
  };

  const handleSave = async (countryName: string) => {
    const row = statuses[countryName];
    if (!row) return;
    setSavingCountry(countryName);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from("country_status")
        .upsert(
          {
            country_name: countryName,
            is_enabled: row.is_enabled,
            disabled_message: row.disabled_message || null,
            updated_by: userData.user?.id ?? null,
          },
          { onConflict: "country_name" }
        );
      if (error) throw error;
      toast.success(`تم حفظ إعدادات ${countryName}`);
    } catch (e: any) {
      toast.error("فشل الحفظ: " + (e?.message || ""));
    } finally {
      setSavingCountry(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const enabledCount = Object.values(statuses).filter((s) => s.is_enabled).length;
  const disabledCount = countries.length - enabledCount;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Globe className="h-5 w-5 text-primary" />
            التحكم بحالة التطبيق حسب الدولة
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            يمكنك إيقاف أو تشغيل التطبيق في أي دولة. عند الإيقاف، لن يتمكن المستخدمون في تلك الدولة من استخدام التطبيق.
          </p>
          <div className="flex gap-2 mt-3">
            <Badge variant="default" className="gap-1">
              <Power className="h-3 w-3" /> مفعّلة: {enabledCount}
            </Badge>
            <Badge variant="destructive" className="gap-1">
              <PowerOff className="h-3 w-3" /> معطّلة: {disabledCount}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {countries.map((country) => {
          const row = statuses[country.name];
          if (!row) return null;
          const isSaving = savingCountry === country.name;
          return (
            <Card key={country.name} className={!row.is_enabled ? "border-destructive/40 bg-destructive/5" : ""}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.code === "SY" ? "🇸🇾" : country.code === "TR" ? "🇹🇷" : country.code === "SA" ? "🇸🇦" : country.code === "AE" ? "🇦🇪" : country.code === "EG" ? "🇪🇬" : country.code === "IQ" ? "🇮🇶" : country.code === "JO" ? "🇯🇴" : country.code === "LB" ? "🇱🇧" : country.code === "KW" ? "🇰🇼" : country.code === "QA" ? "🇶🇦" : "🌍"}</span>
                    <div>
                      <p className="font-bold">{country.name}</p>
                      <p className="text-xs text-muted-foreground">{country.currencyCode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`toggle-${country.name}`} className="text-sm">
                      {row.is_enabled ? "مفعّل" : "معطّل"}
                    </Label>
                    <Switch
                      id={`toggle-${country.name}`}
                      checked={row.is_enabled}
                      onCheckedChange={(v) => handleToggle(country.name, v)}
                    />
                  </div>
                </div>

                {!row.is_enabled && (
                  <div className="space-y-2">
                    <Label htmlFor={`msg-${country.name}`} className="text-sm">
                      رسالة الإيقاف (اختياري)
                    </Label>
                    <Input
                      id={`msg-${country.name}`}
                      value={row.disabled_message || ""}
                      onChange={(e) => handleMessageChange(country.name, e.target.value)}
                      placeholder={`عذراً، التطبيق غير متاح حالياً في ${country.name}.`}
                    />
                  </div>
                )}

                <Button
                  onClick={() => handleSave(country.name)}
                  disabled={isSaving}
                  size="sm"
                  className="w-full sm:w-auto gap-1.5"
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  حفظ
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCountriesTab;
