// Translate Supabase auth error messages to Arabic
export function translateAuthError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("user already registered")) return "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.";
  if (lower.includes("invalid login credentials")) return "بيانات تسجيل الدخول غير صحيحة.";
  if (lower.includes("email not confirmed")) return "يرجى تأكيد بريدك الإلكتروني أولاً.";
  if (lower.includes("password should be at least")) return "كلمة المرور يجب أن تكون 6 أحرف على الأقل.";
  if (lower.includes("unable to validate email")) return "صيغة البريد الإلكتروني غير صحيحة.";
  if (lower.includes("signup is disabled")) return "التسجيل معطل حالياً.";
  if (lower.includes("rate limit")) return "تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.";
  if (lower.includes("phone") && lower.includes("registered")) return "رقم الهاتف مسجل بالفعل.";
  return message;
}
