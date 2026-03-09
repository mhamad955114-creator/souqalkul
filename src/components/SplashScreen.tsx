import { useState, useEffect, useMemo } from "react";
import { useBrand } from "@/contexts/BrandContext";

const Particle = ({ delay, x, y, size }: { delay: number; x: number; y: number; size: number }) => (
  <div
    className="absolute rounded-full bg-primary/30"
    style={{
      width: size,
      height: size,
      left: `${x}%`,
      top: `${y}%`,
      animation: `particle-float ${3 + Math.random() * 2}s ease-in-out ${delay}s infinite alternate, particle-fade 2s ease-in-out ${delay}s infinite alternate`,
    }}
  />
);

const Ring = ({ delay, size }: { delay: number; size: number }) => (
  <div
    className="absolute rounded-full border-2 border-primary/20"
    style={{
      width: size,
      height: size,
      animation: `ring-expand 2.5s ease-out ${delay}s infinite`,
    }}
  />
);

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const [fadeOut, setFadeOut] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const { logoUrl } = useBrand();

  const particles = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 1.5,
      })),
    []
  );

  useEffect(() => {
    const showTimer = setTimeout(() => setShowContent(true), 50);
    const fadeTimer = setTimeout(() => setFadeOut(true), 1200);
    const removeTimer = setTimeout(() => onFinish(), 1600);
    return () => {
      clearTimeout(showTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background overflow-hidden transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} delay={p.delay} x={p.x} y={p.y} size={p.size} />
      ))}

      {/* Expanding rings */}
      <div className="absolute flex items-center justify-center">
        <Ring delay={0} size={160} />
        <Ring delay={0.6} size={240} />
        <Ring delay={1.2} size={320} />
      </div>

      {/* Glow behind logo */}
      <div
        className={`absolute w-40 h-40 rounded-full bg-primary/15 blur-3xl transition-all duration-1000 ${
          showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
        }`}
      />

      {/* Logo */}
      <img
        src={logoUrl}
        alt="سوق الكل"
        className={`relative h-28 w-28 rounded-3xl object-contain transition-all duration-700 ${
          showContent
            ? "opacity-100 scale-100 animate-[logo-pulse_2s_ease-in-out_infinite]"
            : "opacity-0 scale-50"
        }`}
      />

      {/* Title */}
      <h1
        className={`relative mt-5 text-3xl font-bold text-primary transition-all duration-700 delay-200 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        سوق الكل
      </h1>

      {/* Subtitle */}
      <p
        className={`relative mt-2 text-sm text-muted-foreground transition-all duration-700 delay-400 ${
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        بيع واشتري بسهولة
      </p>

      {/* Loading bar */}
      <div
        className={`relative mt-8 h-1.5 w-28 overflow-hidden rounded-full bg-muted transition-all duration-500 delay-500 ${
          showContent ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="h-full animate-[loading_2.2s_ease-in-out] bg-gradient-to-r from-primary via-accent to-primary rounded-full" />
      </div>
    </div>
  );
};

export default SplashScreen;
