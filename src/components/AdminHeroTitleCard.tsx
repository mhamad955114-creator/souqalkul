import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, Type } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useHeroTitle, heroTitleQueryKey } from "@/hooks/useHeroTitle";
import { defaultHeroTitles, HeroTitles, normalizeHeroTitles } from "@/lib/heroTitle";
import { supabase } from "@/integrations/supabase/client";

export default function AdminHeroTitleCard() {
  const query = useHeroTitle();
  const queryClient = useQueryClient();
  const [titles, setTitles] = useState<HeroTitles>(defaultHeroTitles);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (query.data) setTitles(query.data); }, [query.data]);

  const save = async () => {
    if (Object.values(titles).some((title) => !title.text.trim() && !title.highlight.trim())) {
      toast.error("يرجى كتابة العبارة لكل لغة");
      return;
    }
    setSaving(true);
    try {
      const value = normalizeHeroTitles(titles);
      const { data, error } = await supabase.from("listing_settings")
        .update({ setting_value: value, updated_at: new Date().toISOString() })
        .eq("setting_key", "hero_title").select("id");
      if (error) throw error;
      if (!data?.length) {
        const { error: insertError } = await supabase.from("listing_settings")
          .insert({ setting_key: "hero_title", setting_value: value });
        if (insertError) throw insertError;
      }
      queryClient.setQueryData(heroTitleQueryKey, value);
      toast.success("تم حفظ عبارة الصفحة الرئيسية");
    } catch {
      toast.error("تعذر حفظ العبارة، حاول مجدداً");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-primary/30">
      <CardContent className="p-6 space-y-5">
        <h3 className="flex items-center gap-3 text-lg font-bold text-foreground">
          <Type className="h-5 w-5 text-primary" /> عبارة الصفحة الرئيسية
        </h3>
        {(["ar", "en", "tr"] as const).map((language) => (
          <div key={language} className="space-y-3">
            <h4 className="font-bold text-foreground">{{ ar: "العربية", en: "الإنجليزية", tr: "التركية" }[language]}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(["text", "highlight"] as const).map((field) => (
                <div key={field} className="min-w-0 space-y-2">
                  <Label htmlFor={`hero-${language}-${field}`}>{field === "text" ? "النص الأبيض" : "النص البرتقالي"}</Label>
                  <Input id={`hero-${language}-${field}`} dir={language === "ar" ? "rtl" : "ltr"}
                    value={titles[language][field]} disabled={query.isPending || query.isError || saving}
                    onChange={(event) => setTitles((previous) => ({ ...previous,
                      [language]: { ...previous[language], [field]: event.target.value },
                    }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
        {query.isError && <p className="text-sm text-destructive">تعذر تحميل العبارة الحالية</p>}
        <Button onClick={save} disabled={saving || query.isPending || query.isError}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} حفظ العبارة
        </Button>
      </CardContent>
    </Card>
  );
}