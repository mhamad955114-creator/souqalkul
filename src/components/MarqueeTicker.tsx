import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_TEXT = "سوق الكل - إعلانك مجاناً معنا! 🎉";

const GRADIENT_PRESETS: Record<string, string> = {
  orange: "bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600",
  blue: "bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700",
  purple: "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700",
  green: "bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700",
  red: "bg-gradient-to-r from-red-600 via-rose-500 to-red-700",
  gold: "bg-gradient-to-r from-yellow-600 via-amber-400 to-yellow-700",
  rainbow: "bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500",
  dark: "bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900",
  primary: "bg-primary",
};

const MarqueeTicker = () => {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [enabled, setEnabled] = useState(true);
  const [gradient, setGradient] = useState("primary");
  const [speed, setSpeed] = useState(20);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from("listing_settings")
        .select("setting_value")
        .eq("setting_key", "marquee_ticker")
        .limit(1)
        .maybeSingle();

      if (data?.setting_value) {
        const val = data.setting_value as any;
        if (val.text) setText(val.text);
        if (val.enabled === false) setEnabled(false);
        if (val.gradient) setGradient(val.gradient);
        if (val.speed) setSpeed(val.speed);
      }
    };
    fetchSettings();
  }, []);

  if (!enabled) return null;

  const gradientClass = GRADIENT_PRESETS[gradient] || GRADIENT_PRESETS.primary;

  return (
    <div className={`${gradientClass} text-white overflow-hidden whitespace-nowrap py-1.5 shadow-md relative`}>
      {/* Shimmer overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_ease-in-out_infinite] pointer-events-none" />
      <div
        className="inline-block animate-marquee"
        style={{ animationDuration: `${speed}s` }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={i} className="mx-8 text-sm font-bold drop-shadow-sm">
            {text}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeTicker;
