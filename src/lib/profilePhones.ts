import { supabase } from "@/integrations/supabase/client";
export const attachPhones = async <T extends { user_id: string }>(rows: T[] | null) => {
  if (!rows?.length) return (rows || []) as (T & { phone: string | null })[];
  const { data } = await (supabase as any).rpc("get_profile_phones", { _user_ids: rows.map((r) => r.user_id) });
  const m = new Map<string, string | null>((data || []).map((d: any) => [d.user_id, d.phone]));
  return rows.map((r) => ({ ...r, phone: m.get(r.user_id) ?? null }));
};
