// Translate backend auth error messages to the app's active language.
type AuthLanguage = "ar" | "en" | "tr";

const translations: Record<string, Record<AuthLanguage, string>> = {
  "user already registered": {
    ar: "هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول بدلاً من ذلك.",
    en: "This email is already registered. Please sign in instead.",
    tr: "Bu e-posta zaten kayıtlı. Lütfen giriş yapın.",
  },
  "invalid login credentials": {
    ar: "بيانات تسجيل الدخول غير صحيحة.",
    en: "Invalid login credentials.",
    tr: "Giriş bilgileri hatalı.",
  },
  "email not confirmed": {
    ar: "يرجى تأكيد بريدك الإلكتروني أولاً.",
    en: "Please confirm your email first.",
    tr: "Lütfen önce e-postanızı onaylayın.",
  },
  "password should be at least": {
    ar: "كلمة المرور يجب أن تكون 6 أحرف على الأقل.",
    en: "Password must be at least 6 characters.",
    tr: "Şifre en az 6 karakter olmalıdır.",
  },
  "weak and easy to guess": {
    ar: "كلمة المرور ضعيفة وسهلة التخمين، يرجى اختيار كلمة مرور أقوى.",
    en: "Password is weak and easy to guess, please choose a stronger one.",
    tr: "Şifre zayıf ve tahmin edilmesi kolay, lütfen daha güçlü bir şifre seçin.",
  },
  "unable to validate email": {
    ar: "صيغة البريد الإلكتروني غير صحيحة.",
    en: "Invalid email format.",
    tr: "Geçersiz e-posta biçimi.",
  },
  "signup is disabled": {
    ar: "التسجيل معطل حالياً.",
    en: "Sign up is currently disabled.",
    tr: "Kayıt şu anda devre dışı.",
  },
  "rate limit": {
    ar: "تم تجاوز الحد المسموح. يرجى المحاولة لاحقاً.",
    en: "Rate limit exceeded. Please try again later.",
    tr: "Limit aşıldı. Lütfen daha sonra tekrar deneyin.",
  },
  "phone registered": {
    ar: "رقم الهاتف مسجل بالفعل.",
    en: "This phone number is already registered.",
    tr: "Bu telefon numarası zaten kayıtlı.",
  },
};

export function translateAuthError(message: string, language: AuthLanguage = "ar"): string {
  const lower = message.toLowerCase();
  for (const [key, texts] of Object.entries(translations)) {
    if (key === "phone registered") {
      if (lower.includes("phone") && lower.includes("registered")) return texts[language];
    } else if (lower.includes(key)) {
      return texts[language];
    }
  }
  return message;
}
