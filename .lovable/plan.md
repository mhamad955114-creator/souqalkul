## الوضع الحالي

سياسات RLS على جدول `category_definitions` **تمنع بالفعل** غير الأدمن من التعديل أو الحذف على مستوى قاعدة البيانات:

```text
SELECT  → public         (الجميع يقرأ)
INSERT  → authenticated  + has_role(auth.uid(), 'admin')
UPDATE  → authenticated  + has_role(auth.uid(), 'admin')
DELETE  → authenticated  + has_role(auth.uid(), 'admin')
```

أي محاولة من مستخدم عادي ستُرفض من قاعدة البيانات وتُعيد خطأ مثل:
`new row violates row-level security policy for table "category_definitions"`

المشكلة: في `AdminCategoriesTab.tsx` يتم عرض رسالة الخطأ الخام بالإنجليزية مباشرة عبر `toast.error("فشل الحفظ: " + error.message)`، وهي غير واضحة وغير مفهومة لغير التقنيين.

## التغييرات المطلوبة

**ملف واحد:** `src/components/AdminCategoriesTab.tsx`

1. إضافة دالة مساعدة `getFriendlyError(error)` تكتشف أخطاء RLS / Permission وتُرجع رسالة عربية موحّدة:
   - إذا كان `error.code === '42501'` أو الرسالة تحتوي `row-level security` / `permission denied` → ترجع: **"غير مصرّح: هذه العملية متاحة للمشرفين فقط."**
   - وإلا تُرجع رسالة الخطأ الأصلية.

2. استبدال جميع استدعاءات `toast.error("... " + error.message)` (حوالي 10 مواضع تخص INSERT/UPDATE/DELETE على `category_definitions`) لتستخدم الدالة الجديدة:
   ```ts
   toast.error(getFriendlyError(error));
   ```

3. إضافة طبقة حماية إضافية في الواجهة (UX دفاعي): التحقق من دور الأدمن قبل تنفيذ أي عملية كتابة، وإذا لم يكن أدمن إظهار نفس الرسالة الواضحة فوراً دون إرسال طلب للسيرفر. سيتم استخدام `useUserRole` الموجود إن وُجد، أو استعلام `user_roles` مع تخزين النتيجة في state.

## ملاحظة أمنية

- لن يتم تخفيف أي سياسة RLS — فقط تحسين الرسائل.
- الحماية الفعلية تبقى على مستوى قاعدة البيانات (وهي الأساس)، والتغيير في الواجهة لتجربة أوضح فقط.
- لن نكشف تفاصيل تقنية للمستخدم العادي (لا أكواد أخطاء ولا أسماء جداول).

## النتيجة المتوقعة

- المشرف: يعمل كل شيء كما هو.
- المستخدم العادي: إن حاول (يدوياً عبر devtools مثلاً) تعديل/حذف تصنيف، يتلقى رسالة واضحة بالعربية: **"غير مصرّح: هذه العملية متاحة للمشرفين فقط."** بدلاً من رسالة Postgres الإنجليزية.