import { useEffect, useState } from "react";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function FollowCategoryButton({ category, label }: { category: string; label: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      if (!alive) return;
      setUserId(uid);
      if (!uid) return setFollowing(false);
      const { data: row } = await supabase
        .from("category_follows")
        .select("id")
        .eq("user_id", uid)
        .eq("category", category)
        .maybeSingle();
      if (alive) setFollowing(!!row);
    })();
    return () => { alive = false; };
  }, [category]);

  const toggle = async () => {
    if (!userId) return toast.error("سجّل الدخول لمتابعة هذا القسم");
    setBusy(true);
    const { error } = following
      ? await supabase.from("category_follows").delete().eq("user_id", userId).eq("category", category)
      : await supabase.from("category_follows").insert({ user_id: userId, category });
    setBusy(false);
    if (error) return toast.error("تعذّر الحفظ، حاول مجدداً");
    setFollowing(!following);
    toast.success(following ? `ألغيت متابعة ${label}` : `ستصلك إشعارات إعلانات ${label} الجديدة والمعدّلة`);
  };

  return (
    <Button variant={following ? "secondary" : "default"} size="sm" className="mt-3 gap-2" onClick={toggle} disabled={busy}>
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : following ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
      {following ? `إلغاء متابعة ${label}` : `متابعة ${label}`}
    </Button>
  );
}
