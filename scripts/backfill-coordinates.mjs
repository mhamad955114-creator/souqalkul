#!/usr/bin/env node
/**
 * سكربت لمرة واحدة: تعبئة latitude/longitude لكل الإعلانات التي إحداثياتها null
 * عبر Nominatim (OpenStreetMap) مع احترام سياسة الاستخدام (طلب واحد/ثانية).
 *
 * التشغيل:
 *   SUPABASE_URL="https://<ref>.supabase.co" \
 *   SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
 *   node scripts/backfill-coordinates.mjs
 *
 * خيارات إضافية:
 *   DRY_RUN=1      عرض النتائج فقط بدون كتابة إلى قاعدة البيانات
 *   BATCH_LIMIT=50 عدد الإعلانات لكل تشغيل (افتراضي: بلا حد)
 *   CONTACT_EMAIL  بريد للاتصال (مطلوب من Nominatim في User-Agent)
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DRY_RUN = process.env.DRY_RUN === "1";
const LIMIT = process.env.BATCH_LIMIT ? parseInt(process.env.BATCH_LIMIT, 10) : null;
const CONTACT = process.env.CONTACT_EMAIL || "admin@souqalkul.app";
const NOMINATIM = "https://nominatim.openstreetmap.org/search";
const DELAY_MS = 1100; // >1s حسب سياسة Nominatim

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("❌ يجب تعيين SUPABASE_URL و SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(query) {
  const url = `${NOMINATIM}?format=json&limit=1&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": `SouqAlkul-Backfill/1.0 (${CONTACT})`,
      "Accept-Language": "ar,en",
    },
  });
  if (!res.ok) throw new Error(`Nominatim ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

async function tryQueries(listing) {
  const { area, city, country } = listing;
  const attempts = [
    [area, city, country],
    [city, country],
    [country],
  ].map((parts) => parts.filter(Boolean).join(", ")).filter(Boolean);

  const seen = new Set();
  for (const q of attempts) {
    if (seen.has(q)) continue;
    seen.add(q);
    try {
      const r = await geocode(q);
      await sleep(DELAY_MS);
      if (r && Number.isFinite(r.lat) && Number.isFinite(r.lng)) {
        return { ...r, query: q };
      }
    } catch (e) {
      console.warn(`  ⚠️  فشل الاستعلام "${q}":`, e.message);
      await sleep(DELAY_MS);
    }
  }
  return null;
}

async function main() {
  console.log(`🚀 بدء التعبئة — DRY_RUN=${DRY_RUN} LIMIT=${LIMIT ?? "بلا حد"}`);

  let query = supabase
    .from("listings")
    .select("id, title, area, city, country, latitude, longitude")
    .is("latitude", null)
    .order("created_at", { ascending: false });
  if (LIMIT) query = query.limit(LIMIT);

  const { data: listings, error } = await query;
  if (error) {
    console.error("❌ فشل جلب الإعلانات:", error.message);
    process.exit(1);
  }
  console.log(`📋 عدد الإعلانات بدون إحداثيات: ${listings.length}`);

  let updated = 0;
  let failed = 0;

  for (let i = 0; i < listings.length; i++) {
    const l = listings[i];
    const label = `[${i + 1}/${listings.length}] ${l.id.slice(0, 8)}`;
    console.log(`${label} — ${[l.area, l.city, l.country].filter(Boolean).join(" / ") || "(بدون موقع)"}`);

    if (!l.city && !l.country && !l.area) {
      console.log(`  ⏭️  تجاوز: لا يوجد موقع نصي`);
      failed++;
      continue;
    }

    const result = await tryQueries(l);
    if (!result) {
      console.log(`  ❌ لم يتم العثور على إحداثيات`);
      failed++;
      continue;
    }

    console.log(`  ✅ ${result.lat}, ${result.lng}  (من: "${result.query}")`);

    if (!DRY_RUN) {
      const { error: upErr } = await supabase
        .from("listings")
        .update({ latitude: result.lat, longitude: result.lng })
        .eq("id", l.id);
      if (upErr) {
        console.log(`  ⚠️  فشل التحديث: ${upErr.message}`);
        failed++;
        continue;
      }
    }
    updated++;
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`✅ تم تحديث: ${updated}`);
  console.log(`❌ فشل: ${failed}`);
  if (DRY_RUN) console.log("ℹ️  DRY_RUN مُفعّل — لم تُكتب أي تغييرات");
}

main().catch((e) => {
  console.error("💥 خطأ عام:", e);
  process.exit(1);
});
