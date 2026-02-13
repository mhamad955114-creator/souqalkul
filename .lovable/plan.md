
# خطة بناء نظام الدفع عبر المحفظة لترويج الإعلانات وشراء الباقات

## الهدف
ربط المحفظة الداخلية بنظام ترويج الإعلانات وشراء الباقات، بحيث يمكن للمستخدم الدفع من رصيد المحفظة مباشرة.

## التغييرات المطلوبة

### 1. ترويج الإعلانات (الدفع من المحفظة عند اختيار "إعلان مميز")
- تعديل `AddListingModal.tsx`: عند اختيار "إعلان مميز"، يظهر تنبيه بالسعر المطلوب ورصيد المحفظة الحالي
- عند النشر كإعلان مميز:
  - التحقق من كفاية الرصيد
  - خصم المبلغ من المحفظة (تحديث جدول `wallets`)
  - تسجيل عملية في `wallet_transactions` بنوع `promotion`
  - إذا الرصيد غير كافٍ: عرض رسالة توجّه المستخدم لشحن المحفظة

### 2. شراء الباقات من صفحة الأسعار
- تعديل `Pricing.tsx`: عند الضغط على "اشترك الآن" لباقة مدفوعة:
  - فتح حوار تأكيد يعرض السعر والرصيد المتاح
  - التحقق من كفاية الرصيد والخصم
  - تسجيل عملية في `wallet_transactions` بنوع `package`
  - تحديث نوع المستخدم/باقته (إنشاء جدول `user_subscriptions`)

### 3. قاعدة البيانات - جدول الاشتراكات الجديد
انشاء جدول `user_subscriptions` لتتبع الباقات المشتراة:
- `id`, `user_id`, `plan_type` (featured/professional), `starts_at`, `expires_at`, `status`, `created_at`
- سياسات RLS: المستخدم يرى اشتراكاته فقط، الادمن يرى الكل

### 4. دالة قاعدة بيانات للدفع الآمن
انشاء دالة `process_wallet_payment` (SECURITY DEFINER) تقوم بـ:
- التحقق من الرصيد الكافي
- خصم المبلغ من المحفظة
- تسجيل العملية في `wallet_transactions`
- هذا يضمن عدم التلاعب بالرصيد من جهة العميل

### 5. تعديل `useWallet.tsx`
- اضافة دالة `payFromWallet(amount, type, description, relatedListingId?)` تستدعي الـ RPC

---

## التفاصيل التقنية

### الملفات المعدّلة:
| الملف | التغيير |
|---|---|
| `supabase/migrations/` | جدول `user_subscriptions` + دالة `process_wallet_payment` |
| `src/hooks/useWallet.tsx` | اضافة `payFromWallet` |
| `src/components/AddListingModal.tsx` | ربط الدفع عند اختيار إعلان مميز |
| `src/pages/Pricing.tsx` | حوار شراء الباقة بالدفع من المحفظة |
| `src/integrations/supabase/types.ts` | يتحدث تلقائياً |

### دالة process_wallet_payment (SQL):
```text
المدخلات: _user_id, _amount, _type, _description, _related_listing_id
الخطوات:
1. قفل صف المحفظة (SELECT FOR UPDATE)
2. التحقق من balance >= _amount
3. UPDATE wallets SET balance = balance - _amount
4. INSERT INTO wallet_transactions
5. ارجاع الرصيد الجديد
```

### سير عمل ترويج الاعلان:
```text
المستخدم يختار "مميز" -> يرى السعر والرصيد -> ينشر -> 
النظام يستدعي process_wallet_payment -> 
اذا نجح: ينشر الاعلان كمميز
اذا فشل: يعرض رسالة "رصيد غير كافٍ" مع رابط للمحفظة
```

### سير عمل شراء باقة:
```text
المستخدم يضغط "اشترك" -> حوار تأكيد بالسعر والرصيد ->
يؤكد -> process_wallet_payment ->
اذا نجح: انشاء اشتراك في user_subscriptions + اشعار
اذا فشل: رسالة "رصيد غير كافٍ"
```
