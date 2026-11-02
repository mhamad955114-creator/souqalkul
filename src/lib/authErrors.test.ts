import { describe, expect, it } from "vitest";
import { translateAuthError } from "./authErrors";

describe("auth error translation follows the app language", () => {
  const weakPassword = "Password is known to be weak and easy to guess, please choose a different one";

  it("shows the weak password warning in Arabic", () => {
    expect(translateAuthError(weakPassword, "ar")).toBe("كلمة المرور ضعيفة وسهلة التخمين، يرجى اختيار كلمة مرور أقوى.");
  });
  it("shows the weak password warning in English", () => {
    expect(translateAuthError(weakPassword, "en")).toBe("Password is weak and easy to guess, please choose a stronger one.");
  });
  it("shows the weak password warning in Turkish", () => {
    expect(translateAuthError(weakPassword, "tr")).toBe("Şifre zayıf ve tahmin edilmesi kolay, lütfen daha güçlü bir şifre seçin.");
  });
  it("translates invalid credentials per language", () => {
    expect(translateAuthError("Invalid login credentials", "ar")).toBe("بيانات تسجيل الدخول غير صحيحة.");
    expect(translateAuthError("Invalid login credentials", "tr")).toBe("Giriş bilgileri hatalı.");
  });
  it("keeps unknown messages unchanged", () => {
    expect(translateAuthError("something unexpected", "ar")).toBe("something unexpected");
  });
});
