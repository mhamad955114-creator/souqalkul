# Backfill Coordinates Script

سكربت لمرة واحدة لتعبئة `latitude` و `longitude` لكل الإعلانات التي إحداثياتها `null` في قاعدة البيانات، عبر Nominatim (OpenStreetMap).

## المتطلبات
- Node.js ≥ 18 (لدعم `fetch` أصلياً)
- مفتاح `SUPABASE_SERVICE_ROLE_KEY` (مطلوب للتحديث بدون RLS)

## التشغيل

```bash
# تجربة بدون كتابة (موصى بها أولاً)
SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
DRY_RUN=1 \
node scripts/backfill-coordinates.mjs

# تشغيل فعلي
SUPABASE_URL="https://<ref>.supabase.co" \
SUPABASE_SERVICE_ROLE_KEY="<service_role_key>" \
node scripts/backfill-coordinates.mjs

# دفعة محدودة (مثلاً 20 إعلاناً)
BATCH_LIMIT=20 SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/backfill-coordinates.mjs
```

## آلية العمل
1. يجلب كل الإعلانات التي `latitude IS NULL`.
2. لكل إعلان، يجرّب استعلامات Nominatim تدريجياً:
   - `area, city, country`
   - `city, country`
   - `country`
3. يحترم سياسة Nominatim (طلب واحد كل 1.1 ثانية).
4. يحدّث `listings.latitude` و `listings.longitude` عند النجاح.

## ملاحظات
- إذا لم تتوفر لديك `SUPABASE_SERVICE_ROLE_KEY` (Lovable Cloud لا يتيحها)، يمكنك تشغيل نفس المنطق كـ Edge Function باستخدام دور الخدمة الداخلي، أو من عميل مسجَّل كمدير مع تعديل مؤقت في سياسات RLS.
