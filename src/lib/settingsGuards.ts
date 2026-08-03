/**
 * طبقة تحقق للإعدادات الحساسة.
 *
 * المفاتيح الحساسة (مثل بيانات حساب الدفع) لا يجوز كتابتها إلا:
 *  1. من حساب يملك دور "admin".
 *  2. في جدول الإعدادات الخاص بالمشرفين فقط (admin_settings) — وليس في listing_settings العام.
 *
 * الحماية الفعلية تبقى على مستوى قاعدة البيانات (RLS)، وهذه الطبقة تمنع
 * الأخطاء البرمجية وتعطي رسالة عربية واضحة قبل إرسال أي طلب.
 */

export const SENSITIVE_SETTING_KEYS = [
  "shamcash_account",
  "payment_account",
  "bank_account",
  "wallet_account",
] as const;

export type SensitiveSettingKey = (typeof SENSITIVE_SETTING_KEYS)[number];

const SENSITIVE_PATTERNS = [/shamcash/i, /payment/i, /bank/i, /wallet/i, /secret/i, /api[_-]?key/i, /token/i];

export const isSensitiveSettingKey = (key: string): boolean => {
  const normalized = key.trim().toLowerCase();
  if ((SENSITIVE_SETTING_KEYS as readonly string[]).includes(normalized)) return true;
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const NOT_ADMIN_MESSAGE = "غير مصرّح: حفظ الإعدادات الحساسة متاح للمشرفين فقط.";
export const SENSITIVE_IN_PUBLIC_TABLE_MESSAGE =
  "لا يمكن حفظ إعداد حساس داخل الإعدادات العامة. استخدم إعدادات المشرفين.";

export type GuardResult = { error: { message: string } | null };

/** يتحقق قبل الكتابة في الإعدادات العامة (listing_settings). */
export const guardPublicSettingWrite = (key: string): GuardResult => {
  if (isSensitiveSettingKey(key)) {
    return { error: { message: SENSITIVE_IN_PUBLIC_TABLE_MESSAGE } };
  }
  return { error: null };
};

/** يتحقق قبل الكتابة في إعدادات المشرفين (admin_settings). */
export const guardAdminSettingWrite = (key: string, isAdmin: boolean): GuardResult => {
  if (!isAdmin) {
    return { error: { message: NOT_ADMIN_MESSAGE } };
  }
  return { error: null };
};
