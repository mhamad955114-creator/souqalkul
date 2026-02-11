import { useState, useEffect } from "react";
import logoImage from "@/assets/logo.png";

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1800);
    const removeTimer = setTimeout(() => onFinish(), 2400);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logoImage}
        alt="سوق الكل"
        className="h-28 w-28 rounded-3xl object-contain animate-[bounce-in_0.6s_ease-out]"
      />
      <h1 className="mt-5 text-3xl font-bold text-primary">سوق الكل</h1>
      <p className="mt-2 text-sm text-muted-foreground">بيع واشتري بسهولة</p>
      <div className="mt-8 h-1 w-24 overflow-hidden rounded-full bg-muted">
        <div className="h-full animate-[loading_1.8s_ease-in-out] bg-primary rounded-full" />
      </div>
    </div>
  );
};

export default SplashScreen;
